from flask import Flask, request, jsonify
from dotenv import load_dotenv
from src.utils import connect_to_db 
import os

load_dotenv()

app = Flask(__name__)

class TextAppender:
    def __init__(self):
        self.user_session_table_1 = os.getenv("user_session_table_1")

    def append_text(self, username, text):
        # Connect to the database
        db_connection = connect_to_db()
        if db_connection:
            cursor = db_connection.cursor()
            print("going to send data in table2")
            # Construct the SQL query
            sql_query = f"""
                        UPDATE {self.user_session_table_1} 
                        SET 
                            response = CONCAT_WS(',', IF(response='', NULL, response), %s),
                            response_count = IF(response_count IS NULL, 1, response_count + 1)
                        WHERE username = %s
                        """
            # Note: CONCAT_WS should be used to add a comma between existing text and new text
            
            print("query is ready")
            try:
                # Execute the SQL query
                cursor.execute(sql_query, (text, username))
                print("cursor is ready")
                # Commit the changes
                db_connection.commit()
                print(f"send data to {self.user_session_table_1} successfully")
                return "Data appended successfully"
            except Exception as e:
                print("Error occurred while executing SQL query:", e)
                # Rollback the changes
                db_connection.rollback()
                return f"Failed to store response: {str(e)}"
            finally:
                # Close the cursor and the database connection
                cursor.close()
                db_connection.close()
                print("connection closed")
        else:
            return "Failed to connect to the database"

if __name__ == '__main__':
    pass
