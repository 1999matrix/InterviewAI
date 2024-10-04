import mysql.connector
import os
from src.utils import connect_to_user_db


class UserResponseFetcher:
    def __init__(self):
        self.connection = connect_to_user_db()

    def get_user_responses(self, username):
        if self.connection is None:
            return None

        try:
            cursor = self.connection.cursor(dictionary=True)
            query = "SELECT response, result FROM user_test_info WHERE username = %s"
            cursor.execute(query, (username,))
            user_data = cursor.fetchone()

            # Check if data is found
            if user_data is None:
                print(f"No data found for username: {username}")
                return None

            # Split the response by commas (assuming no commas within responses) and the result using '@'
            response_list = user_data['response'].split(',')
            result_list = user_data['result'].split('@')  # Use '@' as the delimiter for results

            # Check if lengths match before zipping into a dictionary
            if len(response_list) != len(result_list):
                print("Mismatch between number of responses and results!")
                return None

            # Create the dictionary from the response and result
            response_result_dict = dict(zip(response_list, result_list))

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
# response_result = fetcher.get_user_responses("example_user")
# if response_result:
#     print(f"\nFinal response-result dictionary:\n{response_result}")

