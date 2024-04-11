import mysql.connector
import random

def fetch_questions(username, topic, level):
    # Connect to MySQL server
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

            # Fetch questions based on topic and level
            if level == "low":
                cursor.execute("SELECT id FROM table1 ORDER BY RAND() LIMIT 5")
            elif level == "medium":
                cursor.execute("SELECT id FROM table3 ORDER BY RAND() LIMIT 4")
            elif level == "advance":
                cursor.execute("SELECT id FROM table4 ORDER BY RAND() LIMIT 3")
            else:
                print("Invalid topic or level")

            questions_ids = [str(row[0]) for row in cursor.fetchall()]
            first_id = questions_ids[0] if questions_ids else None
            print(first_id)

            # Check if username already exists in table2
            cursor.execute("SELECT * FROM table2 WHERE username = %s", (username,))
            if not cursor.fetchall():
                # Insert a new row into table2
                cursor.execute("INSERT INTO table2 (username, q_id, response, result) VALUES (%s, %s, '', '')",
                               (username, ','.join(questions_ids)))

            # Commit the transaction
            connection.commit()

            # Close cursor and connection
            cursor.close()
            connection.close()
            print("Connection closed")

            return first_id

    except mysql.connector.Error as error:
        print("Error:", error)

username = "Bhupendra"
topic = "python"
level = "low"
first_id = fetch_questions(username, topic, level)
print("First ID:", first_id)
