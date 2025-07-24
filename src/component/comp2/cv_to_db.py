from psycopg2 import Error
from src.utils import connect_to_db
from dotenv import load_dotenv
import os
load_dotenv()

class UserCVHandler:
    @staticmethod
    def insert_user_cv(username, pdf_file):
        try:
            connection = connect_to_db()
            user_cv_table = os.getenv("user_cv_table")
            if connection:
                cursor = connection.cursor()
                
                # Read the PDF file in binary mode
                pdf_data = pdf_file.read()
                
                # SQL query to insert or replace data into the table using PostgreSQL UPSERT syntax
                upsert_query = f"""
                    INSERT INTO {user_cv_table} (username, pdf_file)
                    VALUES (%s, %s)
                    ON CONFLICT (username) DO UPDATE SET 
                    pdf_file = EXCLUDED.pdf_file
                """
                
                # Execute the query with the binary PDF data
                cursor.execute(upsert_query, (username, pdf_data))
                
                # Commit the transaction
                connection.commit()
                return {"message": "Record inserted or updated successfully.", "status": "success"}
        except Error as e:
            return {"message": f"Error while connecting to PostgreSQL: {e}", "status": "error"}
        finally:
            # Close the database connection
            if connection:
                cursor.close()
                connection.close()