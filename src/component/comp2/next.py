import mysql.connector
from src.utils import connect_to_db
from src.component.comp2.response_checker import ResponseFetcherComp2
import threading 
from src.component.comp2.text_to_db import TextAppenderComp2
import os

# load_dotenv()

class QuestionManagerComp2(TextAppenderComp2):
    def __init__(self):
        super().__init__()
        self.connection = None
        self.user_session_table_2 = os.getenv("user_session_table_2")
        self.database_uq = os.getenv("database_uq")
        # self.question_table_name = os.getenv("question_table_name")

    def text_db(self, username, text):
        self.append_text(username, text)


    def trigger_analysis(self, username):
        try:
            # Triggering result checking process
            response_fetcher = ResponseFetcherComp2()
            response_fetcher.fetch_q_id_and_response(username)
            response_fetcher.check_response(username)
            
        except Exception as e: 
            print("Error while trigger_analysis:", e)

    def get_next_question_id_comp2(self, username):  
        connection = None

        try:
            # Connect to the user database
            connection = connect_to_db()
            cursor = connection.cursor()
            # Start the analysis trigger in a separate thread
            thread = threading.Thread(target=self.trigger_analysis, args=(username,))
            thread.start()
            # Check if the username exists in the table
            cursor.execute(f"SELECT response_count, question FROM {self.user_session_table_2} WHERE username = %s", (username,))
            user_row = cursor.fetchone()
            # print(user_row)
            if user_row:  # If username exists
                response_count, question = user_row
                ques = question.split('-@-')  # Split the comma-separated q_ids into a list
                if len(ques) > response_count:
                    next_qestion = ques[response_count]  # Get the next q_id based on response_count

                    # question = fetch_question(self.question_table_name,next_q_id)
                    return next_qestion
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


# if __name__ == "__main__":
#     username = 'user'
#     text = 'nothing just wanted to persue data science because it is a high paid job'
#     question_manager = QuestionManagerComp2()
#     question_manager.text_db(username, text)  # Corrected method call
#     next_question_id = question_manager.get_next_question_id_comp2(username)
#     print(next_question_id)

