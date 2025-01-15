import speech_recognition as sr
from dotenv import load_dotenv
import sys
import mysql.connector
from dotenv import load_dotenv
import os
from mysql.connector import Error


load_dotenv()


def connect_to_db():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("mysql_database_host"),
            user=os.getenv("mysql_database_user"),
            password=os.getenv("mysql_database_password"),
            database=os.getenv("database_uq")
        )
        if connection.is_connected():
            pass
        return connection
    except mysql.connector.Error as error:
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
    except mysql.connector.Error as error:
        print("Error:", error)
        return None
    finally:
        cursor.close()
        connection.close()

    

def create_database(database_name):
    try:
        # Establish a connection to MySQL server
        connection = mysql.connector.connect(
            host=os.getenv("mysql_database_host"),
            user=os.getenv("mysql_database_user"),
            password=os.getenv("mysql_database_password"),
        )

        if connection.is_connected():
            cursor = connection.cursor()
            # Execute SQL to create a database
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
            print(f"Database '{database_name}' created successfully.")
            cursor.close()

    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            connection.close()
            print("MySQL connection closed.")
