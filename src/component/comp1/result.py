import time
import mysql.connector
import os
from src.utils import connect_to_db
from src.utils import fetch_question
from dotenv import load_dotenv
import os

load_dotenv()

class UserResultFetcherComp1:
    def __init__(self):
        self.connection = connect_to_db()
        self.user_session_table_1 = os.getenv("user_session_table_1")
        self.user_history_table = os.getenv("user_history_table")
    def refresh_connection(self):
        if self.connection.is_connected():
            self.connection.close()
        self.connection = connect_to_db()

    def get_user_result(self, username):
        if self.connection is None:
            return None

        start_time = time.time()  # Start the timeout timer
        timeout_duration = 120  # 2 minutes timeout

        while True:
            if time.time() - start_time > timeout_duration:
                return {"error": "Timeout occurred while waiting for database consistency."}

            try:
                # Refresh the connection before querying
                self.refresh_connection()

                cursor = self.connection.cursor(dictionary=True)
                query = f"SELECT q_id, response, result FROM {self.user_session_table_1} WHERE username = %s"
                cursor.execute(query, (username,))
                user_data = cursor.fetchone()

                if user_data is None:
                    return {"error": f"No data found for username: {username}"}

                q_id_list = user_data['q_id'].split(',')
                response_list = user_data['response'].split(',')
                result_list = user_data['result'].split('@-@-@')

                question_list = [fetch_question(self.question_table_name, q_id) for q_id in q_id_list]

                if len(question_list) == len(response_list) == len(result_list):
                    break

                print(f"Length Mismatch: Questions({len(question_list)}), Responses({len(response_list)}), Results({len(result_list)})")
                time.sleep(5)

            except mysql.connector.Error as error:
                return {"error": f"Database error: {error}"}

            finally:
                if self.connection.is_connected():
                    cursor.close()

        response_result_list = [
            {
                "question": question_list[i],
                "user_response": response_list[i],
                "result": result_list[i]
            }
            for i in range(len(question_list))
        ]

        report_data = str(response_result_list)

        try:
            # Insert the result into user_history_table
            cursor = self.connection.cursor()
            insert_query = f"""
                INSERT INTO {self.user_history_table} (record_date, username, report, percentage)
                VALUES (NOW(), %s, %s, %s)
            """
            cursor.execute(insert_query, (username, report_data, None))  # Percentage is left as NULL for now
            self.connection.commit()
        except mysql.connector.Error as error:
            return {"error": f"Failed to insert into user_history_table: {error}"}
        finally:
            if self.connection.is_connected():
                cursor.close()

        return response_result_list