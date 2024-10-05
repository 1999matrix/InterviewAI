# import time
# import mysql.connector
# import os
# from src.utils import connect_to_user_db
# from src.utils import fetch_question

# class UserResponseFetcher:
#     def __init__(self):
#         self.connection = connect_to_user_db()

#     def refresh_connection(self):
#         if self.connection.is_connected():
#             self.connection.close()
#         self.connection = connect_to_user_db()

#     def get_user_responses(self, username, topic, level):
#         if self.connection is None:
#             return None

#         try:
#             if level == "low":
#                 level = "level_low"
#             elif level == "medium":
#                 level = "level_medium"
#             elif level == "advance":
#                 level = "level_high"
#             else:
#                 return {"error": "Invalid topic or level"}
#         except Exception as e:
#             return {"error": f"Error: {e}"}

#         start_time = time.time()  # Start the timeout timer
#         timeout_duration = 120  # 2 minutes timeout

#         while True:
#             if time.time() - start_time > timeout_duration:
#                 return {"error": "Timeout occurred while waiting for database consistency."}

#             try:
#                 # Refresh the connection before querying
#                 self.refresh_connection()

#                 cursor = self.connection.cursor(dictionary=True)
#                 query = "SELECT q_id, response, result FROM user_test_info WHERE username = %s"
#                 cursor.execute(query, (username,))
#                 user_data = cursor.fetchone()

#                 if user_data is None:
#                     return {"error": f"No data found for username: {username}"}

#                 q_id_list = user_data['q_id'].split(',')
#                 response_list = user_data['response'].split(',')
#                 result_list = user_data['result'].split('@')

#                 question_list = [fetch_question(topic, level, q_id) for q_id in q_id_list]

#                 if len(question_list) == len(response_list) == len(result_list):
#                     break

#                 print(f"Length Mismatch: Questions({len(question_list)}), Responses({len(response_list)}), Results({len(result_list)})")
#                 time.sleep(5)

#             except mysql.connector.Error as error:
#                 return {"error": f"Database error: {error}"}

#             finally:
#                 if self.connection.is_connected():
#                     cursor.close()

#         response_result_dict = {
#             f"question{i+1}": {response_list[i]: result_list[i]}
#             for i in range(len(question_list))
#         }

#         return response_result_dict


import time
import mysql.connector
import os
from src.utils import connect_to_user_db
from src.utils import fetch_question

class UserResponseFetcher:
    def __init__(self):
        self.connection = connect_to_user_db()

    def refresh_connection(self):
        if self.connection.is_connected():
            self.connection.close()
        self.connection = connect_to_user_db()

    def get_user_responses(self, username, topic, level):
        if self.connection is None:
            return None

        try:
            if level == "low":
                level = "level_low"
            elif level == "medium":
                level = "level_medium"
            elif level == "advance":
                level = "level_high"
            else:
                return {"error": "Invalid topic or level"}
        except Exception as e:
            return {"error": f"Error: {e}"}

        start_time = time.time()  # Start the timeout timer
        timeout_duration = 120  # 2 minutes timeout

        while True:
            if time.time() - start_time > timeout_duration:
                return {"error": "Timeout occurred while waiting for database consistency."}

            try:
                # Refresh the connection before querying
                self.refresh_connection()

                cursor = self.connection.cursor(dictionary=True)
                query = "SELECT q_id, response, result FROM user_test_info WHERE username = %s"
                cursor.execute(query, (username,))
                user_data = cursor.fetchone()

                if user_data is None:
                    return {"error": f"No data found for username: {username}"}

                q_id_list = user_data['q_id'].split(',')
                response_list = user_data['response'].split(',')
                result_list = user_data['result'].split('@')

                question_list = [fetch_question(topic, level, q_id) for q_id in q_id_list]

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
