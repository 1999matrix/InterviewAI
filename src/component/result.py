import mysql.connector
import requests
import json
from src.utils import connect_to_user_db
import psycopg2

class ResponseFetcher:
    def __init__(self):
        self.question = None
        self.response = None

    def fetch_q_id_and_response(self, username):
        try:
            connection = connect_to_user_db()
            if connection:
                cursor = connection.cursor()
                query = "SELECT q_id, response, response_count FROM table2 WHERE username = %s"
                cursor.execute(query, (username,))
                result = cursor.fetchone()
                if result:
                    q_id_list = result[0].split(",")  # Split q_id string into list
                    response_list = result[1].split(",")  # Split response string into list
                    response_count = result[2]
                    if response_count > 0 and response_count <= len(q_id_list):
                        q_id = q_id_list[response_count - 1]  # response_count as index
                        cursor.execute("SELECT question FROM table1 WHERE id = %s", (q_id,))
                        self.question = cursor.fetchone()[0]
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
                connection.close()

    def check_response(self, username):
        if self.question is None or self.response is None:
            return

        url = 'http://localhost:11434/api/generate'
        data = {
            "model": "llama2",
            "prompt": f"this is a computer language interview question, check this question , {self.question}? and response for this question is {self.response}.  give me these three things only in shorts as possible - 1)Correctness given response is correct or not or it partially correct or compleltly wrong 2)correct explaination 3)conculsion     only these three points"
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
                # Assuming username is the column to identify users and 'result' is the column to store generated responses
                query = "UPDATE table2 SET result = %s WHERE username = %s"
                cursor.execute(query, (generated_response, username))  
                conn.commit()
                cursor.close()
                conn.close()
            except (Exception, psycopg2.Error) as error:
                print("Error while connecting to PostgreSQL or executing query:", error)
                # Handle error appropriately

            return generated_response

# Example usage:
username = "example_user"
fetcher = ResponseFetcher()
fetcher.fetch_q_id_and_response(username)
print(fetcher.check_response(username))
