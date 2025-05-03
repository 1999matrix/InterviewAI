import os
import mysql.connector
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

class UserResultFetcherComp3:
    def __init__(self):
        self.user_session_table = os.getenv("user_session_table_3")
        self.user_history_table = os.getenv("user_history_table")

    def get_user_result(self, username):
        """
        Get the final result for a user's session and store it in user_history
        """
        try:
            connection = mysql.connector.connect(
                host=os.getenv("mysql_database_host"),
                user=os.getenv("mysql_database_user"),
                password=os.getenv("mysql_database_password"),
                database=os.getenv("database_uq")
            )

            cursor = connection.cursor(dictionary=True)

            # Get all questions and responses for the session
            query = f"""
            SELECT question, response, feedback, evaluation_score
            FROM {self.user_session_table}
            WHERE username = %s AND response IS NOT NULL
            ORDER BY id ASC
            """
            cursor.execute(query, (username,))
            session_results = cursor.fetchall()

            if not session_results:
                return None

            # Calculate overall score
            total_score = sum(float(result['evaluation_score'] or 0) for result in session_results)
            average_score = total_score / len(session_results)
            percentage = int(average_score * 100)

            # Prepare detailed report
            report = {
                'questions_answered': len(session_results),
                'average_score': average_score,
                'percentage': percentage,
                'detailed_responses': [
                    {
                        'question': result['question'],
                        'response': result['response'],
                        'feedback': result['feedback'],
                        'score': result['evaluation_score']
                    }
                    for result in session_results
                ]
            }

            # Store in user_history table
            insert_query = f"""
            INSERT INTO {self.user_history_table}
            (record_date, username, report, percentage)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(insert_query, (
                datetime.now(),
                username,
                json.dumps(report),
                percentage
            ))
            connection.commit()

            # Clean up session data
            cleanup_query = f"""
            DELETE FROM {self.user_session_table}
            WHERE username = %s
            """
            cursor.execute(cleanup_query, (username,))
            connection.commit()

            cursor.close()
            connection.close()

            return report

        except Exception as e:
            raise Exception(f"Error in get_user_result: {str(e)}") 