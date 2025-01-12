import mysql.connector
import random
from dotenv import load_dotenv
import os
from src.utils import fetch_question

class QuestionFetcher:

    def __init__(self, username, topic, level):
        load_dotenv()
        self.username = username
        self.topic = topic
        
        self.level = level
        self._question_connection = None
        self._user_info_connection = None
        self.user_session_database = os.getenv("user_session_database")
        self.mysql_database_password = os.getenv("mysql_database_password")
        self.mysql_database_user = os.getenv("mysql_database_user")
        self.mysql_database_host = os.getenv("mysql_database_host")
        self.user_session_table_1 = os.getenv("user_session_table_1")

    def connect_to_user_info_database(self):
        try:
            self._user_info_connection = mysql.connector.connect(
                host=self.mysql_database_host,
                user=self.mysql_database_user,
                password=self.mysql_database_password,
                database= self.user_session_database
            )
            if self._user_info_connection.is_connected():
                print("Connected to User Info MySQL Server")
        except mysql.connector.Error as error:
            print("Error connecting to User Info Database:", error)

    def connect_to_question_database(self):
        try:
            self._question_connection = mysql.connector.connect(
                host=self.mysql_database_host,
                user=self.mysql_database_user,
                password=self.mysql_database_password,
                database=self.topic
            )
            if self._question_connection.is_connected():
                print("Connected to Question MySQL Server")
        except mysql.connector.Error as error:
            print("Error connecting to Question Database:", error)

    def close_connections(self):
        if self._question_connection:
            self._question_connection.close()
            print("Question Connection Closed.")
        if self._user_info_connection:
            self._user_info_connection.close()
            print("User Info Connection Closed.")

    def fetch_questions(self):
        self.connect_to_question_database()
        self.connect_to_user_info_database()
        if self._question_connection:
            try:
                cursor = self._question_connection.cursor()
                user_cursor = self._user_info_connection.cursor()
                # Fetch questions based on topic and level
                if self.level == "low":
                    first_id_question_table = "level_low"
                    query = ("SELECT id FROM level_low ORDER BY RAND() LIMIT 2")
                elif self.level == "medium":
                    first_id_question_table = "level_medium"
                    query = ("SELECT id FROM level_medium ORDER BY RAND() LIMIT 4")
                elif self.level == "advance":
                    first_id_question_table = "level_high"
                    query = ("SELECT id FROM level_high ORDER BY RAND() LIMIT 6")
                else:
                    print("Invalid topic or level")
                    return None

                cursor.execute(query)
                questions_ids = [str(row[0]) for row in cursor.fetchall()]
                first_id = questions_ids[0] if questions_ids else None


                # Check if username already exists in user_session_table_1
                user_cursor.execute(f"SELECT * FROM {self.user_session_table_1} WHERE username = %s", (self.username,))
                if user_cursor.fetchall():
                    # If the username exists, delete the existing record
                    user_cursor.execute(f"DELETE FROM {self.user_session_table_1} WHERE username = %s", (self.username,))
                    # print("Existing record deleted.")

                # Insert a new row into user_session_table_1
                user_cursor.execute(f"INSERT INTO {self.user_session_table_1} (username, q_id, response, result) VALUES (%s, %s, '', '')",
                            (self.username, ','.join(questions_ids)))
                # print("New record created for user.")


                # Commit the transaction
                self._question_connection.commit()
                self._user_info_connection.commit()

                question = fetch_question(self.topic,first_id_question_table,first_id)
                return question

            except mysql.connector.Error as error:
                print("Error fetching questions:", error)
            
        self.close_connections()

if __name__ == "__main__":
    pass