import os
import psycopg2
from psycopg2.extras import DictCursor
from dotenv import load_dotenv
from src.model.groq import generate_interview_question, evaluate_interview_response
from src.component.comp3.cv_to_db import UserCVHandler
import json
from datetime import datetime
import random

load_dotenv()

class QuestionManagerComp3:
    def __init__(self):
        self.user_session_table = os.getenv("user_session_table_3")
        self.user_history_table = os.getenv("user_history_table")
        self.cv_handler = UserCVHandler()
        self.total_questions = int(os.getenv("COMP3_TOTAL_QUESTIONS", "10"))
        self.question_separator = "-@-"
        self.response_separator = "-@-"
        self.feedback_separator = "-@-"
        self.score_separator = "-@-"
        # Read cross-question settings from environment variables
        self.cross_question_threshold = float(os.getenv("COMP3_CROSS_QUESTION_THRESHOLD", "0.7"))
        self.max_cross_questions = int(os.getenv("COMP3_MAX_CROSS_QUESTIONS", "2"))

    def get_session_data(self, username):
        """
        Get session data for the user
        """
        connection = psycopg2.connect(
            host=os.getenv("postgres_database_host"),
            user=os.getenv("postgres_database_user"),
            password=os.getenv("postgres_database_password"),
            database=os.getenv("database_uq"),
            port=os.getenv("postgres_database_port")
        )

        cursor = None
        try:
            cursor = connection.cursor(cursor_factory=DictCursor)
            query = f"""
            SELECT * FROM {self.user_session_table} 
            WHERE username = %s
            """
            cursor.execute(query, (username,))
            result = cursor.fetchone()
            return result

        finally:
            if cursor:
                cursor.close()
            connection.close()

    def store_user_history(self, username, questions, responses, feedbacks, scores):
        """
        Store user history in the history table
        """
        try:
            # Calculate overall score
            scores_float = [float(score) for score in scores]
            average_score = sum(scores_float) / len(scores_float)
            percentage = int(average_score * 100)

            # Prepare detailed report
            report = {
                'questions_answered': len(questions),
                'average_score': average_score,
                'percentage': percentage,
                'detailed_responses': [
                    {
                        'question': q,
                        'response': r,
                        'feedback': f,
                        'score': s
                    }
                    for q, r, f, s in zip(questions, responses, feedbacks, scores)
                ]
            }

            connection = psycopg2.connect(
                host=os.getenv("postgres_database_host"),
                user=os.getenv("postgres_database_user"),
                password=os.getenv("postgres_database_password"),
                database=os.getenv("database_uq"),
                port=os.getenv("postgres_database_port")
            )

            cursor = None
            try:
                cursor = connection.cursor()
                # Store in user_history table
                insert_query = f"""
                INSERT INTO {self.user_history_table}
                (record_date, username, report, percentage, component_type)
                VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(insert_query, (
                    datetime.now(),
                    username,
                    json.dumps([report]),
                    percentage,
                    "comp3"
                ))
                connection.commit()

            finally:
                if cursor:
                    cursor.close()
                connection.close()

        except Exception as e:
            raise Exception(f"Error storing user history: {str(e)}")

    def should_ask_cross_question(self, score, cross_questions_count):
        """
        Determine if we should ask a cross-question based on the score and previous cross-questions
        """
        if score < self.cross_question_threshold and cross_questions_count < self.max_cross_questions:
            return True
        return False

    def process_response_and_get_next(self, username, current_response):
        """
        Process the user's response, evaluate it, and generate the next question
        """
        try:
            # Get session data
            session_data = self.get_session_data(username)
            if not session_data:
                raise Exception("No active session found for user")

            # Parse existing data
            cv_content = session_data['cv']
            job_description = session_data['jd']
            role = session_data['role']
            experience = session_data['experience']
            response_count = session_data['response_count']
            cross_questions_count = session_data.get('cross_questions_count', 0)
            
            # Get existing questions, responses, feedbacks, and scores
            questions = session_data['question'].split(self.question_separator) if session_data['question'] else []
            responses = session_data['response'].split(self.response_separator) if session_data['response'] else []
            feedbacks = session_data['feedback'].split(self.feedback_separator) if session_data['feedback'] else []
            scores = session_data['evaluation_score'].split(self.score_separator) if isinstance(session_data['evaluation_score'], str) else []

            # Get the current question
            current_question = questions[-1] if questions else None
            if not current_question:
                raise Exception("No current question found")

            # Evaluate the response
            evaluation = evaluate_interview_response(
                question=current_question,
                response=current_response,
                cv_content=cv_content,
                role=role,
                job_description=job_description
            )

            # Add current response and evaluation
            responses.append(current_response)
            feedbacks.append(evaluation['feedback'])
            scores.append(str(evaluation['score']))

            # Check if we should ask a cross-question
            if self.should_ask_cross_question(evaluation['score'], cross_questions_count):
                # Generate a cross-question based on the current topic
                next_question = generate_interview_question(
                    cv_content=cv_content,
                    role=role,
                    job_description=f"Follow up on this topic: {current_question}",
                    experience=experience,
                    previous_questions=questions,
                    previous_responses=responses
                )
                cross_questions_count += 1
            else:
                # Check if we've reached the maximum questions
                if response_count + 1 >= self.total_questions:
                    # Store user history before completing
                    self.store_user_history(username, questions, responses, feedbacks, scores)
                    
                    # Clean up session data
                    connection = psycopg2.connect(
                        host=os.getenv("postgres_database_host"),
                        user=os.getenv("postgres_database_user"),
                        password=os.getenv("postgres_database_password"),
                        database=os.getenv("database_uq"),
                        port=os.getenv("postgres_database_port")
                    )
                    cursor = None
                    try:
                        cursor = connection.cursor()
                        cleanup_query = f"""
                        DELETE FROM {self.user_session_table}
                        WHERE username = %s
                        """
                        cursor.execute(cleanup_query, (username,))
                        connection.commit()
                    finally:
                        if cursor:
                            cursor.close()
                        connection.close()

                    return {
                        'status': 'completed',
                        'message': 'Interview session completed'
                    }

                # Generate next question
                next_question = generate_interview_question(
                    cv_content=cv_content,
                    role=role,
                    job_description=job_description,
                    experience=experience,
                    previous_questions=questions,
                    previous_responses=responses
                )

            # Add next question to the list
            questions.append(next_question)

            # Update the session in database
            connection = psycopg2.connect(
                host=os.getenv("postgres_database_host"),
                user=os.getenv("postgres_database_user"),
                password=os.getenv("postgres_database_password"),
                database=os.getenv("database_uq"),
                port=os.getenv("postgres_database_port")
            )

            cursor = None
            try:
                cursor = connection.cursor()

                # Update the session with all data
                update_query = f"""
                UPDATE {self.user_session_table}
                SET question = %s,
                    response = %s,
                    feedback = %s,
                    evaluation_score = %s,
                    response_count = %s,
                    cross_questions_count = %s
                WHERE username = %s
                """
                cursor.execute(update_query, (
                    self.question_separator.join(questions),
                    self.response_separator.join(responses),
                    self.feedback_separator.join(feedbacks),
                    self.score_separator.join(scores),
                    response_count + 1,
                    cross_questions_count,
                    username
                ))

                connection.commit()

                return {
                    'status': 'success',
                    'evaluation': {
                        'feedback': evaluation['feedback'],
                        'score': evaluation['score']
                    },
                    'next_question': next_question,
                    'questions_remaining': self.total_questions - (response_count + 1)
                }

            finally:
                if cursor:
                    cursor.close()
                connection.close()

        except Exception as e:
            raise Exception(f"Error in process_response_and_get_next: {str(e)}") 