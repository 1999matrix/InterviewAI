import mysql.connector
import os
from src.utils import connect_to_user_db
from src.utils import fetch_question

class UserResponseFetcher:
    def __init__(self):
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
                print("Invalid topic or level")
                return None
        except Exception as e:
            print(f"Error: {e}")
            return None

        try:
            cursor = self.connection.cursor(dictionary=True)
            query = "SELECT q_id, response, result FROM user_test_info WHERE username = %s"
            cursor.execute(query, (username,))
            user_data = cursor.fetchone()

            # Check if data is found
            if user_data is None:
                print(f"No data found for username: {username}")
                return None

            # Split q_id, response, and result columns
            q_id_list = user_data['q_id'].split(',')
            response_list = user_data['response'].split(',')
            result_list = user_data['result'].split('@')

            # Fetch questions from the database
            question_list = []
            for i in q_id_list:
                var = fetch_question(topic, level, i)
                question_list.append(var)

            # Check if all lists have the same length
            if not (len(question_list) == len(response_list) == len(result_list)):
                print(f"Length Mismatch: Questions({len(question_list)}), Responses({len(response_list)}), Results({len(result_list)})")
                return None

            # Create the dictionary from the question, response, and result
            response_result_dict = {}
            for i in range(len(question_list)):
                response_result_dict[f"question{i+1}"] = {response_list[i]: result_list[i]}

            return response_result_dict

        except mysql.connector.Error as error:
            print("Error:", error)
            return None

        finally:
            if self.connection.is_connected():
                cursor.close()
                self.connection.close()


# # Example usage of the class
# fetcher = UserResponseFetcher()
# response_result = fetcher.get_user_responses("example_user", 'python_db', 'low')
# if response_result:
#     print(f"\nFinal response-result dictionary:\n{response_result}")
