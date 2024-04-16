import mysql.connector
from src.utils import connect_to_user_db

import mysql.connector

def connect_to_user_db_and_table2():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Admin@12345",
            database="db_77"
        )
        if connection.is_connected():
            print("Connected to MySQL Server")
        return connection
    except mysql.connector.Error as error:
        print("Error:", error)
        return None

def fetch_q_id_and_response(username):
    try:
        connection = connect_to_user_db_and_table2()
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
                    question = cursor.fetchone()[0]
                    response = response_list[response_count - 1]  # response_count as index
                    return question, response
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

# Example usage:
username = "example_user"
result = fetch_q_id_and_response(username)
if result:
    question, response = result
    print("Question:", question)
    print("Response:", response)

