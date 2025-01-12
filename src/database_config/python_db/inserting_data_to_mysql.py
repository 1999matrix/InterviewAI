import mysql.connector
import pandas as pd
from dotenv import load_dotenv
from src.database_config.user_session.configure_db import create_database
import os

# Load environment variables
load_dotenv()

def connect_to_database():
    """
    Establishes a connection to the MySQL database using environment variables.
    Returns the connection object.
    """
    try:
        connection = mysql.connector.connect(
            host=os.getenv("mysql_database_host"),
            user=os.getenv("mysql_database_user"),
            password=os.getenv("mysql_database_password"),
            database=os.getenv("Python_db")
        )
        return connection
    except mysql.connector.Error as error:
        print(f"Error connecting to MySQL: {error}")
        return None


def python_table_creation(table_name):
    """
    Creates a table in the MySQL database if it does not exist.
    """
    connection = connect_to_database()
    if connection is None:
        return

    try:
        cursor = connection.cursor()
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {table_name} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question VARCHAR(255)
        )
        """
        cursor.execute(create_table_query)
        connection.commit()
        print(f"Table '{table_name}' created successfully.")
    except mysql.connector.Error as error:
        print(f"Error creating table '{table_name}': {error}")
    finally:
        cursor.close()
        connection.close()
        print("Connection closed.")


def insert_questions_from_excel(question_file_path, table_name):
    """
    Reads questions from an Excel file and inserts them into the specified MySQL table.
    """
    try:
        # Load questions from Excel file
        df = pd.read_excel(question_file_path)

        if "Question" not in df.columns:
            print("Excel file must contain a 'Question' column.")
            return

        questions = df["Question"].dropna().tolist()

        connection = connect_to_database()
        if connection is None:
            return

        try:
            cursor = connection.cursor()

            # Insert questions into table
            for question in questions:
                cursor.execute(f"INSERT INTO {table_name} (question) VALUES (%s)", (question,))
                print(f"Question '{question}' inserted successfully.")

            connection.commit()
            print("All questions inserted successfully.")
        except mysql.connector.Error as error:
            print(f"Error inserting questions: {error}")
        finally:
            cursor.close()
            connection.close()
            print("Connection closed.")
    except FileNotFoundError:
        print(f"Excel file '{question_file_path}' not found. Please ensure the file exists.")
    except Exception as e:
        print(f"Unexpected error: {e}")


if __name__ == "__main__":
    # creating database if not exist
    database_name = os.getenv("Python_db")
    create_database(database_name)

    # Define the path to the Excel file and the target table name
    low_level_question_file_path = "level_low.xlsx"
    level_low_table_name = "level_low"

    medium_level_question_file_path = "level_medium.xlsx"
    level_medium_table_name = "level_medium"

    high_level_question_file_path = "level_high.xlsx"
    level_high_table_name = "level_high"

    # Create table and insert questions
    python_table_creation(level_low_table_name)
    insert_questions_from_excel(low_level_question_file_path, level_low_table_name)

    # Create table and insert questions
    python_table_creation(level_medium_table_name)
    insert_questions_from_excel(medium_level_question_file_path, level_medium_table_name)

    # Create table and insert questions
    python_table_creation(level_high_table_name)
    insert_questions_from_excel(low_level_question_file_path, level_high_table_name)
