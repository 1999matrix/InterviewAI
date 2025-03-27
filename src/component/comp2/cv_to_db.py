from mysql.connector import Error
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
            if connection.is_connected():
                cursor = connection.cursor()
                
                # Read the PDF file in binary mode
                pdf_data = pdf_file.read()
                
                # SQL query to insert or replace data into the table
                upsert_query = f"""
                    INSERT INTO {user_cv_table} (username, pdf_file)
                    VALUES (%s, %s)
                    ON DUPLICATE KEY UPDATE 
                    pdf_file = %s
                """
                
                # Execute the query with the binary PDF data
                # The third %s is used for the ON DUPLICATE KEY UPDATE clause
                cursor.execute(upsert_query, (username, pdf_data, pdf_data))
                
                # Commit the transaction
                connection.commit()
                return {"message": "Record inserted or updated successfully.", "status": "success"}
        except Error as e:
            return {"message": f"Error while connecting to MySQL: {e}", "status": "error"}
        finally:
            # Close the database connection
            if connection.is_connected():
                cursor.close()
                connection.close()