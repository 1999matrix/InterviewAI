import psycopg2
from src.utils import connect_to_db
from src.component.comp1.response_checker import ResponseFetcherComp1
import threading 
from src.component.comp1.text_to_db import TextAppender
from src.utils import fetch_question
import os
from dotenv import load_dotenv

load_dotenv()

class QuestionManagerComp1(TextAppender):
    def __init__(self):
        super().__init__()
        self.connection = None
        self.user_session_table_1 = os.getenv("user_session_table_1")
        self.database_uq = os.getenv("database_uq")
        self.question_table_name = os.getenv("question_table_name")

    def text_db(self, username, text):
        self.append_text(username, text)


    def trigger_analysis(self, username):
        try:
            # Triggering result checking process
            response_fetcher = ResponseFetcherComp1()
            response_fetcher.fetch_q_id_and_response(username)
            response_fetcher.check_response(username)
        except Exception as e: 
            print("Error while trigger_analysis:", e)

    def get_next_question_id(self, username):  
        connection = None

        try:
            # Connect to the user database
            connection = connect_to_db()
            cursor = connection.cursor()
            # Start the analysis trigger in a separate thread
            thread = threading.Thread(target=self.trigger_analysis, args=(username,))
            thread.start()
            # Check if the username exists in the table
            cursor.execute(f"SELECT response_count, q_id FROM {self.user_session_table_1} WHERE username = %s", (username,))
            user_row = cursor.fetchone()
            if user_row:  # If username exists
                response_count, q_ids = user_row
                q_id_list = q_ids.split(',')  # Split the comma-separated q_ids into a list
                if len(q_id_list) > response_count:
                    next_q_id = q_id_list[response_count]  # Get the next q_id based on response_count

                    question = fetch_question(self.question_table_name,next_q_id)
                    return question
                else:
                    return None  # No more questions left for this user
            else:
                return None  # Username does not exist
        except mysql.connector.Error as error:
            print("Error while fetching data from MySQL:", error)
        finally:
            # Close connection
            if connection:
                cursor.close()
                connection.close()

if __name__ == "__main__":
    pass
