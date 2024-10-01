import mysql.connector
from src.utils import connect_to_user_db
from src.component.response_checker import ResponseFetcher
import threading 
from src.component.text_to_db import TextAppender
from src.utils import fetch_question


class QuestionManager(TextAppender):
    def __init__(self):
        super().__init__()
        self.connection = None

    def text_db(self, username, text):
        self.append_text(username, text)


    def trigger_analysis(self, username, topic, level):
        try:
            # Triggering result checking process
            response_fetcher = ResponseFetcher()
            response_fetcher.fetch_q_id_and_response(username, topic, level)
            response_fetcher.check_response(username)
        except Exception as e: 
            print("Error while trigger_analysis:", e)

    def get_next_question_id(self, username, topic, level):  
        connection = None

        if level == "low":
            next_id_question_table = "level_low"
        elif level == "medium":
            next_id_question_table = "level_medium"
        elif level == "advance":
            next_id_question_table = "level_high"
        else:
            print("Invalid topic or level")

        try:
            # Connect to the user database
            connection = connect_to_user_db()
            cursor = connection.cursor()
            
            # Start the analysis trigger in a separate thread
            thread = threading.Thread(target=self.trigger_analysis, args=(username, topic, next_id_question_table))
            thread.start()
            
            # Check if the username exists in the table
            cursor.execute("SELECT response_count, q_id FROM user_test_info WHERE username = %s", (username,))
            user_row = cursor.fetchone()

            if user_row:  # If username exists
                response_count, q_ids = user_row
                q_id_list = q_ids.split(',')  # Split the comma-separated q_ids into a list
                if len(q_id_list) > response_count:
                    next_q_id = q_id_list[response_count]  # Get the next q_id based on response_count

                    question = fetch_question(topic,next_id_question_table,next_q_id)
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
