from mysql.connector import Error
from src.utils import connect_to_db
from dotenv import load_dotenv
import os
import fitz  # PyMuPDF for PDF text extraction

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
                cursor.execute(upsert_query, (username, pdf_data, pdf_data))
                
                # Commit the transaction
                connection.commit()
                return {"message": "Record inserted or updated successfully.", "status": "success"}
        except Error as e:
            return {"message": f"Error while connecting to MySQL: {e}", "status": "error"}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def get_cv_content(username):
        """
        Retrieve and extract text from the PDF CV for a given username
        """
        try:
            connection = connect_to_db()
            user_cv_table = os.getenv("user_cv_table")
            
            if connection.is_connected():
                cursor = connection.cursor(dictionary=True)
                
                # SQL query to get the PDF data
                query = f"""
                    SELECT pdf_file
                    FROM {user_cv_table}
                    WHERE username = %s
                """
                cursor.execute(query, (username,))
                result = cursor.fetchone()
                
                if not result:
                    raise FileNotFoundError(f"No CV found for username: {username}")
                
                # Extract text from PDF
                pdf_data = result['pdf_file']
                doc = fitz.open(stream=pdf_data, filetype="pdf")
                text = ""
                for page in doc:
                    text += page.get_text()
                doc.close()
                
                return text.strip()
                
        except Error as e:
            raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            raise e
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close() 