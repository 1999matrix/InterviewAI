import mysql.connector
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


def create_user_test_info_table():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("mysql_database_host"),
            user=os.getenv("mysql_database_user"),
            password=os.getenv("mysql_database_password"),
            database=os.getenv("user_test_info_db")
        )
        if connection.is_connected():
            print("Connected to MySQL Server")
            cursor = connection.cursor()

            create_table_query = """
            CREATE TABLE IF NOT EXISTS user_test_info (
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



# Call the function to create the table
python_table_creation()
create_user_test_info_table()
