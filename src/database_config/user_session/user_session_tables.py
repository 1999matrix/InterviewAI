import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
from src.utils import create_database
import os

load_dotenv()


def create_user_test_info_table_1():
    try:
        user_session_table_1 = os.getenv("user_session_table_1")
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
            CREATE TABLE IF NOT EXISTS {user_session_table_1} (
                username VARCHAR(255),
                q_id TEXT,
                response TEXT,
                result TEXT,
                response_count INT
            )
            """
            cursor.execute(create_table_query)
            print("Table 'user_session_table_1' created successfully")

            connection.commit()

            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)




def create_user_test_info_table_2():
    try:
        user_session_table_2 = os.getenv("user_session_table_2")
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
            CREATE TABLE IF NOT EXISTS {user_session_table_2} (
                username VARCHAR(255),
                question TEXT,
                response TEXT,
                result TEXT,
                response_count INT,
                CV TEXT,
                JD TEXT
            )
            """
            cursor.execute(create_table_query)
            print("Table 'user_session_table_2' created successfully")

            connection.commit()

            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)


if __name__ == "__main__":
    # Calling the functions to create the table and database
    create_database(os.getenv("database_uq"))
    create_user_test_info_table_1()
    create_user_test_info_table_2()