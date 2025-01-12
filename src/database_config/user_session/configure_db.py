import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

load_dotenv()




def python_table_creation():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("mysql_database_host"),
            user=os.getenv("mysql_database_user"),
            password=os.getenv("mysql_database_password"),
            database=os.getenv("Python_db")
        )

        if connection.is_connected():
            print("Connected to MySQL Server")
            cursor = connection.cursor()

            # Create the table
            create_table_query = """
            CREATE TABLE IF NOT EXISTS level_low (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question VARCHAR(255)
            )
            """
            cursor.execute(create_table_query)
            print("Table created successfully")

            # Commit the transaction
            connection.commit()

            # Close cursor and connection
            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)




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




def create_user_test_info_table_1():
    try:
        user_session_table_1 = os.getenv("user_session_table_1")
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
            CREATE TABLE IF NOT EXISTS {user_session_table_1} (
                username VARCHAR(255),
                q_id TEXT,
                response TEXT,
                result TEXT,
                response_count INT
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




def create_user_test_info_table_2():
    try:
        user_session_table_2 = os.getenv("user_session_table_2")
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
            CREATE TABLE IF NOT EXISTS {user_session_table_2} (
                username VARCHAR(255),
                qestion TEXT,
                response TEXT,
                result TEXT,
                response_count INT,
                CV TEXT,
                JD TEXT
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



# Calling the functions to create the table and database
create_database(os.getenv("user_session_database"))
create_user_test_info_table_1()
create_user_test_info_table_2()