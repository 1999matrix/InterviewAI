import psycopg2
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
        self._db_connection = None  # Single connection for the database
        self.user_session_database = os.getenv("database_uq")
        self.postgres_database_password = os.getenv("postgres_database_password")
        self.postgres_database_user = os.getenv("postgres_database_user")
        self.postgres_database_host = os.getenv("postgres_database_host")
        self.postgres_database_port = os.getenv("postgres_database_port")
        self.user_session_table_1 = os.getenv("user_session_table_1")
        self.database_uq = os.getenv("database_uq")
        self.question_table_name = os.getenv("question_table_name")

    def connect_to_database(self):
        """Connect to the PostgreSQL database."""
        try:
            self._db_connection = psycopg2.connect(
                host=self.postgres_database_host,
                user=self.postgres_database_user,
                password=self.postgres_database_password,
                database=self.database_uq,
                port=self.postgres_database_port
            )
            print("Connected to PostgreSQL Server")
        except psycopg2.Error as error:
            print("Error connecting to the database:", error)

    def close_connection(self):
        """Close the database connection."""
        if self._db_connection:
            self._db_connection.close()
            print("Database connection closed.")

    def fetch_questions(self):
        """Fetch questions based on topic and level and update the user session table."""
        self.connect_to_database()
        if self._db_connection:
            try:
                cursor = self._db_connection.cursor()
                # Fetch questions based on topic and level
                if self.level == "low":
                    query = ("SELECT id FROM question_table WHERE Topic = %s AND level = 'Low' ORDER BY RANDOM() LIMIT 2")
                elif self.level == "medium":
                    query = ("SELECT id FROM question_table WHERE Topic = %s AND level = 'Medium' ORDER BY RANDOM() LIMIT 4")
                elif self.level == "advance":
                    query = ("SELECT id FROM question_table WHERE Topic = %s AND level = 'High' ORDER BY RANDOM() LIMIT 6")
                else:
                    print("Invalid topic or level")
                    return None

                # Execute query to fetch question IDs
                cursor.execute(query, (self.topic,))
                questions_ids = [str(row[0]) for row in cursor.fetchall()]
                first_id = questions_ids[0] if questions_ids else None
                # print(questions_ids)

                # Check if the username already exists in the session table
                cursor.execute(f"SELECT * FROM {self.user_session_table_1} WHERE username = %s", (self.username,))
                if cursor.fetchall():
                    # If the username exists, delete the existing record
                    cursor.execute(f"DELETE FROM {self.user_session_table_1} WHERE username = %s", (self.username,))
                    print("Existing record deleted.")

                # Insert a new row into the session table
                cursor.execute(
                    f"INSERT INTO {self.user_session_table_1} (username, q_id, response, result) VALUES (%s, %s, '', '')",
                    (self.username, ','.join(questions_ids))
                )
                # print("New record created for user.")

                # Commit the transaction
                self._db_connection.commit()

                # Fetch the first question
                question = fetch_question(self.question_table_name, first_id)
                return question

            except psycopg2.Error as error:
                print("Error fetching questions:", error)

        self.close_connection()


if __name__ == "__main__":
    pass

