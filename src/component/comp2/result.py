import time
import mysql.connector
import os
from src.utils import connect_to_db
from dotenv import load_dotenv
import os
from src.model.groq import score_calculator
# from src.model.OpenAI import score_calculator
# from src.model.local_model import score_calculator
import json

load_dotenv()

class UserResultFetcherComp2:
    def __init__(self):
        self.connection = connect_to_db()
        self.user_session_table_2 = os.getenv("user_session_table_2")
        self.user_history_table = os.getenv("user_history_table")

    def refresh_connection(self):
        if self.connection.is_connected():
            self.connection.close()
        self.connection = connect_to_db()

    def calculate_score(self, report_data):
        """Calculate score with proper error handling"""
        try:
            score = score_calculator(report_data)
            # Ensure score is a valid integer
            if isinstance(score, (int, float)):
                return int(score)
            elif isinstance(score, str):
                # Try to extract number from string if possible
                try:
                    return int(float(score))
                except (ValueError, TypeError):
                    return 0
            return 0
        except Exception as e:
            print(f"Error calculating score: {str(e)}")
            return 0  # Return 0 as default score on error

    def get_user_result(self, username):
        if self.connection is None:
            return {"error": "Database connection failed"}

        start_time = time.time()
        timeout_duration = 120

        while True:
            if time.time() - start_time > timeout_duration:
                return {"error": "Timeout occurred while waiting for database consistency."}

            try:
                self.refresh_connection()
                cursor = self.connection.cursor(dictionary=True)
                query = f"SELECT question, response, result FROM {self.user_session_table_2} WHERE username = %s"
                cursor.execute(query, (username,))
                user_data = cursor.fetchone()

                if user_data is None:
                    return {"error": f"No data found for username: {username}"}

                question_list = user_data['question'].split('-@-')
                response_list = user_data['response'].split(',')
                result_list = user_data['result'].split('@-@-@')

                if len(question_list) == len(response_list) == len(result_list):
                    break

                print(f"Length Mismatch: Questions({len(question_list)}), Responses({len(response_list)}), Results({len(result_list)})")
                time.sleep(5)

            except mysql.connector.Error as error:
                return {"error": f"Database error: {error}"}
            finally:
                if self.connection.is_connected():
                    cursor.close()

        # Prepare the response data
        response_result_list = [
            {
                "question": question_list[i],
                "user_response": response_list[i],
                "result": result_list[i]
            }
            for i in range(len(question_list))
        ]

        # Convert to JSON string for score calculation
        report_data = json.dumps(response_result_list)
        
        # Calculate score with error handling
        percentage = self.calculate_score(report_data)

        try:
            # Insert the result into user_history_table
            cursor = self.connection.cursor()
            insert_query = f"""
                INSERT INTO {self.user_history_table} (record_date, username, report, percentage)
                VALUES (NOW(), %s, %s, %s)
            """
            cursor.execute(insert_query, (username, report_data, percentage))
            self.connection.commit()

            # Delete the user record from user_session_table_2
            delete_query = f"DELETE FROM {self.user_session_table_2} WHERE username = %s"
            cursor.execute(delete_query, (username,))
            self.connection.commit()

        except mysql.connector.Error as error:
            return {"error": f"Failed to insert into user_history_table: {error}"}
        finally:
            if self.connection.is_connected():
                cursor.close()

        return response_result_list

# if __name__ == "__main__":
#     fetcher = UserResultFetcherComp2()

#     username = 'user'
#     response_result = fetcher.get_user_result(username)
#     print(response_result)
    