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
            database=os.getenv("database_uq")
        )
        if connection.is_connected():
            print("Connected to MySQL Server")
            cursor = connection.cursor()

            create_table_query = f"""
            CREATE TABLE IF NOT EXISTS {user_history_table} (
                session_id INT AUTO_INCREMENT PRIMARY KEY,
                record_date DATETIME,
                username VARCHAR(255),
                report TEXT,
                percentage INT,
                user_id INT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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



def create_users_table():
    try:
        users_table = os.getenv("users_table")
        if not users_table:
            print("Error: users_table environment variable is not set")
            return
            
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
            CREATE TABLE IF NOT EXISTS {users_table} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255),
                password VARCHAR(255),
                full_name VARCHAR(255),
                enabled BOOLEAN DEFAULT FALSE,
                email_verified BOOLEAN DEFAULT FALSE
            )
            """
            cursor.execute(create_table_query)
            print(f"Table '{users_table}' created successfully")

            connection.commit()

            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)



def create_users_role_table():
    try:
        users_role_table = os.getenv("users_role_table")
        if not users_role_table:
            print("Error: users_role_table environment variable is not set")
            return
            
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
            CREATE TABLE IF NOT EXISTS {users_role_table} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                role VARCHAR(255),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
            cursor.execute(create_table_query)
            print(f"Table '{users_role_table}' created successfully")

            connection.commit()

            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)




def password_reset_tokens_table():
    try:
        password_reset_tokens_table = os.getenv("password_reset_tokens_table")
        if not password_reset_tokens_table:
            print("Error: password_reset_tokens_table environment variable is not set")
            return
            
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
            CREATE TABLE IF NOT EXISTS {password_reset_tokens_table} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token VARCHAR(255),
                user_id INT,
                expiry_date TIMESTAMP,
                used BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
            cursor.execute(create_table_query)
            print(f"Table '{password_reset_tokens_table}' created successfully")

            connection.commit()

            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)



def email_verification_token_table():
    try:
        email_verification_token_table = os.getenv("email_verification_token_table")
        if not email_verification_token_table:
            print("Error: email_verification_token_table environment variable is not set")
            return
            
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
            CREATE TABLE IF NOT EXISTS {email_verification_token_table} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token VARCHAR(255),
                user_id INT,
                expiry_date TIMESTAMP,
                verified BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
            cursor.execute(create_table_query)
            print(f"Table '{email_verification_token_table}' created successfully")

            connection.commit()

            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)

def check_required_env_vars():
    required_vars = [
        "mysql_database_host", 
        "mysql_database_user", 
        "mysql_database_password", 
        "database_uq",
        "user_history_table",
        "users_table",
        "users_role_table",
        "password_reset_tokens_table",
        "email_verification_token_table"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
        return False
    return True


if __name__ == "__main__":
    if check_required_env_vars():
        # Creating database
        create_database(os.getenv("database_uq"))
        
        # Create tables in the correct order (users table must be created first due to foreign key dependencies)
        create_users_table()
        create_users_role_table()
        create_user_history_table()
        password_reset_tokens_table()
        email_verification_token_table()