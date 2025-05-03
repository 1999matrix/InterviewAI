import os
import mysql.connector
from dotenv import load_dotenv
from src.component.comp3.cv_to_db import UserCVHandler
from src.model.groq import generate_interview_question

load_dotenv()

class QuestionFetcherComp3:
    def __init__(self, username, role, job_description, experience, cv_flag=True):
        self.username = username
        self.role = role
        self.job_description = job_description
        self.experience = experience
        self.cv_flag = cv_flag
        self.cv_handler = UserCVHandler()
        self.user_session_table = os.getenv("user_session_table_3")
        self.total_questions = int(os.getenv("COMP3_TOTAL_QUESTIONS", "10"))

    def start_session(self):
        """
        Initialize a new session and generate the first question
        """
        try:
            # Get CV content
            cv_content = self.cv_handler.get_cv_content(self.username) if self.cv_flag else None

            # Generate first question
            first_question = generate_interview_question(
                cv_content=cv_content,
                role=self.role,
                job_description=self.job_description,
                experience=self.experience,
                previous_questions=[],  # Empty for first question
                previous_responses=[]   # Empty for first question
            )

            # Store session info in database
            connection = mysql.connector.connect(
                host=os.getenv("mysql_database_host"),
                user=os.getenv("mysql_database_user"),
                password=os.getenv("mysql_database_password"),
                database=os.getenv("database_uq")
            )

            if connection.is_connected():
                cursor = connection.cursor()

                # Delete existing session if it exists
                delete_query = f"DELETE FROM {self.user_session_table} WHERE username = %s"
                cursor.execute(delete_query, (self.username,))

                # Insert first question into session table
                insert_query = f"""
                INSERT INTO {self.user_session_table} 
                (username, question, response, feedback, evaluation_score, response_count, CV, JD, role, experience)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(insert_query, (
                    self.username,
                    first_question,
                    "",  # response (empty string instead of None)
                    "",  # feedback (empty string instead of None)
                    0,   # evaluation_score (0 instead of None)
                    0,   # response_count
                    cv_content if cv_content else "",
                    self.job_description,
                    self.role,
                    self.experience
                ))
                connection.commit()

                cursor.close()
                connection.close()

                return {
                    'question': first_question,
                    'total_questions': self.total_questions
                }

        except Exception as e:
            raise Exception(f"Error in start_session: {str(e)}") 