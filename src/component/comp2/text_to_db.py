from dotenv import load_dotenv
from src.utils import connect_to_db
import os

# Load environment variables from the .env file
load_dotenv()


class TextAppenderComp2:
    def __init__(self):
        # Load the table name from environment variables
        self.user_session_table_2 = os.getenv("user_session_table_2")

    def append_text(self, username, text):
        # Connect to the database
        db_connection = connect_to_db()
        if db_connection:
            cursor = db_connection.cursor()

            # Construct the SQL query using PostgreSQL syntax
            sql_query = f"""
                UPDATE {self.user_session_table_2} 
                SET 
                    response = CASE 
                        WHEN response IS NULL OR response = '' THEN %s
                        ELSE response || ',' || %s
                    END,
                    response_count = CASE 
                        WHEN response_count IS NULL THEN 1 
                        ELSE response_count + 1 
                    END
                WHERE username = %s
            """
            # print("SQL Query is ready")

            try:
                # Execute the SQL query with parameters
                # print(f"Executing query with text='{text}' and username='{username}'")
                cursor.execute(sql_query, (text, text, username))
                # print("Query executed successfully")

                # Commit the changes to the database
                db_connection.commit()
                # print(f"Data appended successfully to {self.user_session_table_2}")
                return "Data appended successfully"
            except Exception as e:
                print("Error occurred while executing SQL query:", e)
                # Rollback in case of error
                db_connection.rollback()
                return f"Failed to store response: {str(e)}"
            finally:
                # Close the cursor and connection
                cursor.close()
                db_connection.close()
                print("Database connection closed")
        else:
            return "Failed to connect to the database"

