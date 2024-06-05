import mysql.connector
import random

class QuestionFetcher:
    def __init__(self, username, topic, level):
        self.username = username
        self.topic = topic
        self.level = level
        self._question_connection = None
        self._user_info_connection = None
    def connect_to_user_info_database(self):
        try:
            self._user_info_connection = mysql.connector.connect(
                host="localhost",
                user="root",
                password="Admin@12345",
                database= "user_test_info_db"
            )
            if self._user_info_connection.is_connected():
                print("Connected to User Info MySQL Server")
        except mysql.connector.Error as error:
            print("Error connecting to User Info Database:", error)

    def connect_to_question_database(self):
        try:
            self._question_connection = mysql.connector.connect(
                host="localhost",
                user="root",
                password="Admin@12345",
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
                    query = ("SELECT id FROM level_low ORDER BY RAND() LIMIT 5")
                elif self.level == "medium":
                    first_id_question_table = "first_id_question_table"
                    query = ("SELECT id FROM first_id_question_table ORDER BY RAND() LIMIT 4")
                elif self.level == "advance":
                    first_id_question_table = "level_high"
                    query = ("SELECT id FROM level_high ORDER BY RAND() LIMIT 3")
                else:
                    print("Invalid topic or level")
                    return None

                cursor.execute(query)
                questions_ids = [str(row[0]) for row in cursor.fetchall()]
                first_id = questions_ids[0] if questions_ids else None
                print(questions_ids)

                # Check if username already exists in user_test_info
                user_cursor.execute("SELECT * FROM user_test_info WHERE username = %s", (self.username,))
                if not user_cursor.fetchall():
                    # Insert a new row into user_test_info
                    user_cursor.execute("INSERT INTO user_test_info (username, q_id, response, result) VALUES (%s, %s, '', '')",
                                   (self.username, ','.join(questions_ids)))
                    print("query ready to create user")

                # Commit the transaction
                self._question_connection.commit()
                self._user_info_connection.commit()

                return first_id

            except mysql.connector.Error as error:
                print("Error fetching questions:", error)
            
        self.close_connections()

if __name__ == "__main__":
    pass