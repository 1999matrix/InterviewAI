import mysql.connector
import requests
import json
from src.utils import connect_to_user_db
from src.utils import connect_to_question_db
import psycopg2

class ResponseFetcher:
    def __init__(self):
        self.question = None
        self.response = None

    def fetch_q_id_and_response(self, username, topic, level):
        try:
            connection = connect_to_user_db()
            question_table_connection = connect_to_question_db(topic)
            if connection:
                cursor = connection.cursor()
                question_table_cursor = question_table_connection.cursor()
                query = "SELECT q_id, response, response_count FROM user_test_info WHERE username = %s"
                cursor.execute(query, (username,))
                result = cursor.fetchone()
                if result:
                    q_id_list = result[0].split(",")  # Split q_id string into list
                    response_list = result[1].split(",")  # Split response string into list
                    response_count = result[2]
                    if response_count > 0 and response_count <= len(q_id_list):
                        q_id = q_id_list[response_count - 1]  # response_count as index
                        question_table_cursor.execute(f"SELECT question FROM {level} WHERE id = %s", (q_id,))
                        self.question = question_table_cursor.fetchone()[0]
                        self.response = response_list[response_count - 1]  # response_count as index
                    else:
                        print("Invalid response count")
                else:
                    print("User not found in table2")
        except mysql.connector.Error as error:
            print("Error:", error)
        finally:
            if connection and connection.is_connected():
                cursor.close()
                question_table_cursor.close()
                connection.close()
                question_table_connection.close()

    def check_response(self, username):
        if self.question is None or self.response is None:
            return

        url = 'http://localhost:11434/api/generate'
        data = {
            "model": "llama3",
            "prompt": f"Given the following question and response, provide the following three pieces of information: 1) Correctness: Indicate whether the response is correct, partially correct, or incorrect. 2) Explanation: If the response is incorrect or partially correct, provide the correct explanation. 3) Conclusion: Summarize the accuracy of the response and suggest any improvements if necessary. Question: '{self.question}?' Response: '{self.response}'"
        }

        response = requests.post(url, json=data)

        if response.status_code == 200:
            generated_response = ""
            response_content = response.text.split('\n')
            for json_str in response_content:
                if json_str:
                    json_obj = json.loads(json_str)
                    generated_response += json_obj['response']

            try:
                conn = connect_to_user_db()  # Assuming this method returns a database connection
                cursor = conn.cursor()

                # Fetch existing value from result column
                fetch_query = "SELECT result FROM user_test_info WHERE username = %s"
                cursor.execute(fetch_query, (username,))
                existing_result = cursor.fetchone()

                if existing_result and existing_result[0]:
                    # Append the new result with a special "@" separator
                    updated_result = existing_result[0] + "@" + generated_response
                else:
                    # If no previous result, just use the new response
                    updated_result = generated_response

                # Update the result column with the appended value
                update_query = "UPDATE user_test_info SET result = %s WHERE username = %s"
                cursor.execute(update_query, (updated_result, username))
                conn.commit()

                cursor.close()
                conn.close()

            except (Exception, psycopg2.Error) as error:
                print("Error while connecting to PostgreSQL or executing query:", error)

            return generated_response

# # Example usage:
# username = "example_user"
# topic = "Python_db"
# level = "level_low"
# fetcher = ResponseFetcher()
# fetcher.fetch_q_id_and_response(username, topic, level)
# print(fetcher.check_response(username))
