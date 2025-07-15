import speech_recognition as sr
from dotenv import load_dotenv
import sys
import psycopg2
from dotenv import load_dotenv
import os
from psycopg2 import Error
import fitz  # PyMuPDF
import io
import tempfile

load_dotenv()


class extract_text_with_pdf:
    def __init__(self, pdf_data, username):
        self.pdf_data = pdf_data
        self.username = username

    def extract_text_with_pymupdf(self):
        try:
            # Check if pdf_data is empty or invalid
            if not self.pdf_data:
                return "No PDF data available."

            # Save the PDF data to a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(self.pdf_data)
                temp_pdf_path = temp_file.name  # Store the temp file path

            # Open the saved PDF file using fitz
            with fitz.open(temp_pdf_path) as doc:
                text = ""
                for page in doc:
                    text += page.get_text()

            # print(f"Extracted text for user: {self.username}")
            return text
        except Exception as e:
            return f"Error while extracting text: {e}"



def connect_to_db():
    try:
        connection = psycopg2.connect(
            host=os.getenv("postgres_database_host"),
            user=os.getenv("postgres_database_user"),
            password=os.getenv("postgres_database_password"),
            database=os.getenv("database_uq"),
            port=os.getenv("postgres_database_port")
        )
        return connection
    except psycopg2.Error as error:
        print("Error:", error)
        return None


def fetch_question(question_table_name, id):
    connection = connect_to_db()
    if connection is None:
        return None

    cursor = connection.cursor()
    query = f"SELECT question FROM {question_table_name} WHERE id = %s"
    try:
        cursor.execute(query, (id,))
        question = cursor.fetchone()
        if question:
            return question[0]
        else:
            return None
    except psycopg2.Error as error:
        print("Error:", error)
        return None
    finally:
        cursor.close()
        connection.close()

    

def create_database(database_name):
    try:
        # Establish a connection to PostgreSQL server
        connection = psycopg2.connect(
            host=os.getenv("postgres_database_host"),
            user=os.getenv("postgres_database_user"),
            password=os.getenv("postgres_database_password"),
            port=os.getenv("postgres_database_port"),
            database="postgres"  # Connect to default postgres database first
        )
        
        connection.autocommit = True  # Enable autocommit for database creation
        cursor = connection.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (database_name,))
        exists = cursor.fetchone()
        
        if not exists:
            # Execute SQL to create a database
            cursor.execute(f"CREATE DATABASE {database_name}")
            print(f"Database '{database_name}' created successfully.")
        else:
            print(f"Database '{database_name}' already exists.")
            
        cursor.close()

    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection:
            connection.close()
            print("PostgreSQL connection closed.")


def counter_question(previous_question: str, previous_response: str) -> tuple:
    """
    Generates a counter question based on the previous question and response.
    
    Args:
        previous_question (str): The question that was asked
        previous_response (str): The user's response to that question
        
    Returns:
        tuple: (counter_question, index) where counter_question is the generated question
               and index is the position where it should be inserted
    """
    # TODO: Implement actual counter question generation logic
    # For now, return a simple counter question
    counter_q = f"Can you elaborate more on your previous response: '{previous_response}'?"
    return counter_q, 0  # Default index 0, will be updated based on actual position




