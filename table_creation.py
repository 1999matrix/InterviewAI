import mysql.connector

def create_table1():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Admin@12345",
            database="db_77"
        )
        if connection.is_connected():
            print("Connected to MySQL Server")
            cursor = connection.cursor()

            # Create the table
            create_table_query = """
            CREATE TABLE IF NOT EXISTS table1 (
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


def create_table2():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Admin@12345",
            database="db_77"
        )
        if connection.is_connected():
            print("Connected to MySQL Server")
            cursor = connection.cursor()

            create_table_query = """
            CREATE TABLE IF NOT EXISTS table2 (
                username VARCHAR(255),
                q_id TEXT,
                response TEXT,
                result TEXT,
                response_count INT
            )
            """
            cursor.execute(create_table_query)
            print("Table 'table2' created successfully")

            connection.commit()

            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)



# Call the function to create the table
create_table1()
create_table2()
