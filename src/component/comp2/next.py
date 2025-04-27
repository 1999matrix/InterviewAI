import mysql.connector
from src.utils import connect_to_db, counter_question
from src.component.comp2.response_checker import ResponseFetcherComp2
import threading 
from src.component.comp2.text_to_db import TextAppenderComp2
import os
import random
from dotenv import load_dotenv

load_dotenv()

class QuestionManagerComp2(TextAppenderComp2):
    def __init__(self):
        super().__init__()
        self.connection = None
        self.user_session_table_2 = os.getenv("user_session_table_2")
        self.database_uq = os.getenv("database_uq")
        self.TOTAL_CROSS_QUESTIONS = int(os.getenv("TOTAL_CROSS_QUESTIONS"))  # Total number of cross-questions to ask
        self.INITIAL_QUESTIONS = int(os.getenv("INITIAL_LIMIT_TO_ASK_QUESTIONS")) # Number of initial questions before cross-questions
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

    def should_generate_cross_question(self, response_count, cross_questions_count):
        TOTAL_QUESTION_GENERATE = os.getenv("TOTAL_QUESTION_GENERATE")
        """Determine if a cross question should be generated"""
        if response_count < self.INITIAL_QUESTIONS or cross_questions_count >= self.TOTAL_CROSS_QUESTIONS:
            return False
        
        # Calculate the probability of asking a cross-question
        # This ensures we'll get approximately 3 cross-questions in total
        remaining_questions = int(TOTAL_QUESTION_GENERATE) - response_count  # Assuming total 15 questions
        remaining_cross_questions = self.TOTAL_CROSS_QUESTIONS - cross_questions_count
        probability = remaining_cross_questions / remaining_questions
        
        return random.random() < probability

    def get_random_question_index(self, total_questions, used_indices):
        """Get a random question index that hasn't been used for cross-questioning"""
        available_indices = [i for i in range(total_questions) if i not in used_indices]
        return random.choice(available_indices) if available_indices else None

    def insert_cross_question(self, connection, cursor, username, question, index):
        """Insert a cross question at the specified index"""
        # Get current questions
        cursor.execute(f"SELECT question FROM {self.user_session_table_2} WHERE username = %s", (username,))
        current_questions = cursor.fetchone()[0].split('-@-')
        
        # Insert the cross question at the specified index
        current_questions.insert(index, question)
        
        # Update the questions in the database
        updated_questions = '-@-'.join(current_questions)
        cursor.execute(
            f"UPDATE {self.user_session_table_2} SET question = %s, cross_questions_count = cross_questions_count + 1 WHERE username = %s",
            (updated_questions, username)
        )
        connection.commit()

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
            cursor.execute(f"SELECT response_count, question, cross_questions_count FROM {self.user_session_table_2} WHERE username = %s", (username,))
            user_row = cursor.fetchone()
            # print(user_row)
            if user_row:  # If username exists
                response_count, question, cross_questions_count = user_row
                ques = question.split('-@-')  # Split the comma-separated q_ids into a list
                
                # Check if we should generate a cross question
                if self.should_generate_cross_question(response_count, cross_questions_count):
                    # Get the last question and response
                    cursor.execute(
                        f"SELECT question, response FROM {self.user_session_table_2} WHERE username = %s",
                        (username,)
                    )
                    last_question, last_response = cursor.fetchone()
                    last_question = last_question.split('-@-')[response_count - 1]
                    last_response = last_response.split(',')[response_count - 1]

                    # Generate cross question
                    cross_q, index = counter_question(last_question, last_response)
                    
                    # Insert the cross question
                    self.insert_cross_question(connection, cursor, username, cross_q, index)
                    return cross_q

                # Return next regular question if available
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
            return None
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

