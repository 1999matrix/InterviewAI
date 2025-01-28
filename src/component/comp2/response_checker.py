import mysql.connector
import requests
import json
from src.utils import connect_to_db
import psycopg2
from dotenv import load_dotenv
import os
# from src.model.local_model import question_checker 
# from src.model.OpenAI import question_checker
from src.model.groq import question_checker


load_dotenv()


class ResponseFetcherComp2:
    def __init__(self):
        self.question = None
        self.response = None
        self.user_session_table_2 = os.getenv("user_session_table_2")
        # self.question_table_name = os.getenv("question_table_name")
        
    def fetch_q_id_and_response(self, username):
        try:
            connection = connect_to_db()
            question_table_connection = connect_to_db()
            if connection:
                cursor = connection.cursor()
                question_table_cursor = question_table_connection.cursor()
                query = f"SELECT question, response, response_count FROM {self.user_session_table_2} WHERE username = %s"
                cursor.execute(query, (username,))
                result = cursor.fetchone()
                if result:
                    question = result[0].split("-@-")  # Split q_id string into list
                    response_list = result[1].split(",")  # Split response string into list
                    response_count = result[2]
                    # print(question)
                    # print(response_list)
                    # print(response_count)
                    if response_count > 0 and response_count <= len(question):
                        que = question[response_count - 1]  # response_count as index
                        # print(que)
                        # query = "SELECT question FROM {} WHERE id = %s".format(self.question_table_name)
                        # question_table_cursor.execute(query, (que,))
                        # self.question = question_table_cursor.fetchone()[0]
                        self.question = que
                        self.response = response_list[response_count - 1]  # response_count as index
                        # print(self.question)
                        # print(self.response)
                    else:
                        print("Invalid response count")
                else:
                    print(f"User not found in table 2   -  {username}")
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

        generated_response = question_checker(self.question,self.response)

        try:
            conn = connect_to_db()  # Assuming this method returns a database connection
            cursor = conn.cursor()

            # Fetch existing value from result column
            fetch_query = f"SELECT result FROM {self.user_session_table_2} WHERE username = %s"
            # print(fetch_query)
            cursor.execute(fetch_query, (username,))
            existing_result = cursor.fetchone()

            if existing_result and existing_result[0]:
                # Append the new result with a special "@" separator
                updated_result = existing_result[0] + "@-@-@" + generated_response
            else:
                # If no previous result, just use the new response
                updated_result = generated_response

            # Update the result column with the appended value
            update_query = f"UPDATE {self.user_session_table_2} SET result = %s WHERE username = %s"
            cursor.execute(update_query, (updated_result, username))
            conn.commit()

            cursor.close()
            conn.close()

        except (Exception, psycopg2.Error) as error:
            print("Error while connecting to PostgreSQL or executing query:", error)

        return generated_response

# # Example usage:
# username = "user"
# fetcher = ResponseFetcherComp2()
# fetcher.fetch_q_id_and_response(username)
# print(fetcher.check_response(username))


