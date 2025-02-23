import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
from src.utils import create_database
import os

load_dotenv()


def create_user_cv_table():
    try:
        user_cv_table = os.getenv("user_cv_table")
        connection = mysql.connector.connect(
            host=os.getenv("mysql_database_host"),
            user=os.getenv("mysql_database_user"),
            password=os.getenv("mysql_database_password"),
            database=os.getenv("database_uq")
        )
        if connection.is_connected():
            print("Connected to MySQL Server")
            cursor = connection.cursor()

            create_table_query = f"""
            CREATE TABLE IF NOT EXISTS {user_cv_table} (
                username VARCHAR(255),
                pdf_file LONGBLOB NOT NULL,
                PRIMARY KEY (username)
            )
            """
            cursor.execute(create_table_query)
            print("Table 'user_test_info' created successfully")

            connection.commit()

            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)


if __name__ == "__main__":
    create_database(os.getenv("database_uq"))
    create_user_cv_table()
