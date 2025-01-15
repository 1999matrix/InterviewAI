import mysql.connector
import pandas as pd
from dotenv import load_dotenv
from src.utils import create_database
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
            question VARCHAR(255),
            Topic VARCHAR(255),
            level VARCHAR(255)
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
    Reads questions, topics, and levels from an Excel file and inserts them into the specified MySQL table.
    """
    try:
        # Load data from Excel file
        df = pd.read_excel(question_file_path)

        # Ensure required columns exist in the Excel file
        required_columns = {"Question", "Topic", "Level"}
        if not required_columns.issubset(df.columns):
            print(f"Excel file must contain the following columns: {', '.join(required_columns)}")
            return

        # Drop rows with missing values in the required columns
        df = df.dropna(subset=required_columns)

        connection = connect_to_database()
        if connection is None:
            return

        try:
            cursor = connection.cursor()

            # Insert data into the table
            for _, row in df.iterrows():
                question = row["Question"]
                topic = row["Topic"]
                level = row["Level"]
                cursor.execute(
                    f"INSERT INTO {table_name} (question, topic, level) VALUES (%s, %s, %s)",
                    (question, topic, level),
                )
                print(f"Inserted: Question='{question}', Topic='{topic}', Level='{level}'")

            connection.commit()
            print("All records inserted successfully.")
        except mysql.connector.Error as error:
            print(f"Error inserting records: {error}")
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
    database_name = os.getenv("database_uq")
    create_database(database_name)

    # Define the path to the Excel file and the target table name
    question_file_path = "C:/Users/bhupe/Goal_77/src/database_config/question_db/questions.xlsx"
    question_table_name = os.getenv("question_table_name")

    # Create table and insert questions
    python_table_creation(question_table_name)
    insert_questions_from_excel(question_file_path, question_table_name)
