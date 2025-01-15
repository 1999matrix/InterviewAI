import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
from src.utils import create_database
import os

load_dotenv()

def create_user_history_table():
    try:
        user_history_table = os.getenv("user_history_table")
        connection = mysql.connector.connect(
            host=os.getenv("mysql_database_host"),
            user=os.getenv("mysql_database_user"),
            password=os.getenv("mysql_database_password"),
            database=os.getenv("user_session_database")
        )
        if connection.is_connected():
            print("Connected to MySQL Server")
            cursor = connection.cursor()

            create_table_query = f"""
            CREATE TABLE IF NOT EXISTS {user_history_table} (
                record_date DATE,
                username VARCHAR(255),
                report TEXT,
                percentage INT
            )
            """
            cursor.execute(create_table_query)
            print(f"Table '{user_history_table}' created successfully")

            connection.commit()

            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)

if __name__ == "__main__":
    # Calling the functions to create the table and database
    create_database(os.getenv("database_uq"))
    create_user_history_table()
