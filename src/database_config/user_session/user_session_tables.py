import psycopg2
from psycopg2 import Error
from dotenv import load_dotenv
from src.utils import create_database
import os

load_dotenv()


def create_user_test_info_table_1():
    try:
        user_session_table_1 = os.getenv("user_session_table_1")
        connection = psycopg2.connect(
            host=os.getenv("postgres_database_host"),
            user=os.getenv("postgres_database_user"),
            password=os.getenv("postgres_database_password"),
            database=os.getenv("database_uq"),
            port=os.getenv("postgres_database_port")
        )
        print("Connected to PostgreSQL Server")
        cursor = connection.cursor()

        # First drop the table if it exists
        drop_table_query = f"DROP TABLE IF EXISTS {user_session_table_1}"
        cursor.execute(drop_table_query)
        print(f"Table '{user_session_table_1}' dropped if it existed")

        # Then create the table with correct column names
        create_table_query = f"""
        CREATE TABLE {user_session_table_1} (
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

    except psycopg2.Error as error:
        print("Error:", error)




def create_user_test_info_table_2():
    try:
        user_session_table_2 = os.getenv("user_session_table_2")
        connection = psycopg2.connect(
            host=os.getenv("postgres_database_host"),
            user=os.getenv("postgres_database_user"),
            password=os.getenv("postgres_database_password"),
            database=os.getenv("database_uq"),
            port=os.getenv("postgres_database_port")
        )
        print("Connected to PostgreSQL Server")
        cursor = connection.cursor()

        # First drop the table if it exists
        drop_table_query = f"DROP TABLE IF EXISTS {user_session_table_2}"
        cursor.execute(drop_table_query)
        print(f"Table '{user_session_table_2}' dropped if it existed")

        # Then create the table with correct column names
        create_table_query = f"""
        CREATE TABLE {user_session_table_2} (
            username VARCHAR(255),
            question TEXT,
            response TEXT,
            result TEXT,
            response_count INT,
            CV TEXT,
            JD TEXT,
            cross_questions_count INT DEFAULT 0
        )
        """
        cursor.execute(create_table_query)
        print("Table 'user_session_table_2' created successfully")

        connection.commit()

        cursor.close()
        connection.close()
        print("Connection closed")

    except psycopg2.Error as error:
        print("Error:", error)


def create_user_test_info_table_3():
    try:
        user_session_table_3 = os.getenv("user_session_table_3")
        connection = psycopg2.connect(
            host=os.getenv("postgres_database_host"),
            user=os.getenv("postgres_database_user"),
            password=os.getenv("postgres_database_password"),
            database=os.getenv("database_uq"),
            port=os.getenv("postgres_database_port")
        )
        print("Connected to PostgreSQL Server")
        cursor = connection.cursor()

        # First drop the table if it exists
        drop_table_query = f"DROP TABLE IF EXISTS {user_session_table_3}"
        cursor.execute(drop_table_query)
        print(f"Table '{user_session_table_3}' dropped if it existed")

        # Then create the table with correct column names
        create_table_query = f"""
        CREATE TABLE {user_session_table_3} (
            username VARCHAR(255) PRIMARY KEY,
            question TEXT,
            response TEXT,
            feedback TEXT,
            evaluation_score TEXT,
            response_count INT,
            CV TEXT,
            JD TEXT,
            role VARCHAR(255),
            experience INT,
            cross_questions_count INT DEFAULT 0,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        cursor.execute(create_table_query)
        print("Table 'user_session_table_3' created successfully")

        connection.commit()

        cursor.close()
        connection.close()
        print("Connection closed")

    except psycopg2.Error as error:
        print("Error:", error)


if __name__ == "__main__":
    # Calling the functions to create the table and database
    create_database(os.getenv("database_uq"))
    create_user_test_info_table_1()
    create_user_test_info_table_2()
    create_user_test_info_table_3()