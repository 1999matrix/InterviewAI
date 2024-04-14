import mysql.connector
import random

class QuestionFetcher:
    def __init__(self, username, topic, level):
        self.username = username
        self.topic = topic
        self.level = level
        self.connection = None

    def connect_to_database(self):
        try:
            self.connection = mysql.connector.connect(
                host="localhost",
                user="root",
                password="Admin@12345",
                database="db_77"
            )
            if self.connection.is_connected():
                print("Connected to MySQL Server")
        except mysql.connector.Error as error:
            print("Error:", error)

    def fetch_questions(self):
        self.connect_to_database()
        if self.connection:
            try:
                cursor = self.connection.cursor()

                # Fetch questions based on topic and level
                if self.level == "low":
                    cursor.execute("SELECT id FROM table1 ORDER BY RAND() LIMIT 5")
                elif self.level == "medium":
                    cursor.execute("SELECT id FROM table3 ORDER BY RAND() LIMIT 4")
                elif self.level == "advance":
                    cursor.execute("SELECT id FROM table4 ORDER BY RAND() LIMIT 3")
                else:
                    print("Invalid topic or level")
                    return None

                questions_ids = [str(row[0]) for row in cursor.fetchall()]
                first_id = questions_ids[0] if questions_ids else None

                # Fetch question corresponding to first_id from table1
                # if first_id:
                #     cursor.execute("SELECT question FROM table1 WHERE id = %s", (first_id,))
                #     question = cursor.fetchone()[0]
                # else:
                #     question = None

                # Check if username already exists in table2
                cursor.execute("SELECT * FROM table2 WHERE username = %s", (self.username,))
                if not cursor.fetchall():
                    # Insert a new row into table2
                    cursor.execute("INSERT INTO table2 (username, q_id, response, result) VALUES (%s, %s, '', '')",
                                   (self.username, ','.join(questions_ids)))

                # Commit the transaction
                self.connection.commit()

                # Close cursor and connection
                cursor.close()
                self.connection.close()
                print("Connection closed")

                return first_id

            except mysql.connector.Error as error:
                print("Error:", error)

if __name__ == "__main__":
    pass




