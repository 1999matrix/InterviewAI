import time
import mysql.connector
import os
from src.utils import connect_to_db
from src.utils import fetch_question
from dotenv import load_dotenv
import os

load_dotenv()

class UserResultFetcherComp2:
    def __init__(self):
        self.connection = connect_to_db()
        self.user_session_table_2 = os.getenv("user_session_table_2")
        # self.question_table_name = os.getenv("question_table_name")

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
                query = f"SELECT question, response, result FROM {self.user_session_table_2} WHERE username = %s"
                cursor.execute(query, (username,))
                user_data = cursor.fetchone()

                if user_data is None:
                    return {"error": f"No data found for username: {username}"}

                question_list = user_data['question'].split('-@-')
                response_list = user_data['response'].split(',')
                result_list = user_data['result'].split('@-@-@')

                # question_list = [fetch_question(self.question_table_name, q_id) for q_id in q_id_list]

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

        return response_result_list



# if __name__ == "__main__":
#     fetcher = UserResultFetcherComp2()

#     username = 'user'
#     response_result = fetcher.get_user_responses(username)
#     print(response_result)
    