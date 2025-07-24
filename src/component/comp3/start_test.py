import os
import psycopg2
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
            cv_content = None
            if self.cv_flag:
                try:
                    cv_content = self.cv_handler.get_cv_content(self.username)
                except Exception as e:
                    cv_content = None  # Continue without CV

            # Generate first question
            first_question = generate_interview_question(
                cv_content=cv_content,
                role=self.role,
                job_description=self.job_description,
                experience=self.experience,
                previous_questions=[],  # Empty for first question
                previous_responses=[]   # Empty for first question
            )
            
            if first_question.startswith("An error occurred:"):
                raise Exception(f"Question generation failed: {first_question}")

            # Store session info in database
            connection = psycopg2.connect(
                host=os.getenv("postgres_database_host"),
                user=os.getenv("postgres_database_user"),
                password=os.getenv("postgres_database_password"),
                database=os.getenv("database_uq"),
                port=os.getenv("postgres_database_port")
            )

            cursor = connection.cursor()

            # Delete existing session if it exists
            delete_query = f"DELETE FROM {self.user_session_table} WHERE username = %s"
            cursor.execute(delete_query, (self.username,))

            # Insert first question into session table
            insert_query = f"""
            INSERT INTO {self.user_session_table} 
                (username, question, response, feedback, evaluation_score, response_count, cv, jd, role, experience)
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

            return {'first_question': first_question}

        except Exception as e:
            return {'error': str(e)} 