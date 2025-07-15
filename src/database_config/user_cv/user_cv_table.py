import psycopg2
from psycopg2 import Error
from dotenv import load_dotenv
from src.utils import create_database
import os

load_dotenv()


def create_user_cv_table():
    try:
        user_cv_table = os.getenv("user_cv_table")
        connection = psycopg2.connect(
            host=os.getenv("postgres_database_host"),
            user=os.getenv("postgres_database_user"),
            password=os.getenv("postgres_database_password"),
            database=os.getenv("database_uq"),
            port=os.getenv("postgres_database_port")
        )
        print("Connected to PostgreSQL Server")
        cursor = connection.cursor()

        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {user_cv_table} (
            username VARCHAR(255),
            pdf_file BYTEA NOT NULL,
            PRIMARY KEY (username)
        )
        """
        cursor.execute(create_table_query)
        print("Table 'user_test_info' created successfully")

        connection.commit()

        cursor.close()
        connection.close()
        print("Connection closed")

    except psycopg2.Error as error:
        print("Error:", error)


if __name__ == "__main__":
    create_database(os.getenv("database_uq"))
    create_user_cv_table()
