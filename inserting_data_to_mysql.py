import mysql.connector

def insert_questions():
    questions = [
        "What is Python? Explain its key features.",
        "What are the differences between Python 2 and Python 3?",
        "Explain the differences between lists and tuples in Python.",
        "What is PEP 8? Why is it important in Python development?",
        "Describe the process of creating a virtual environment in Python.",
        "Explain the differences between == and is operators in Python.",
        "What is a decorator in Python? How can it be used?",
        "Explain the concept of a generator in Python.",
        "Describe the purpose of the __init__ method in Python classes.",
        "How does exception handling work in Python? Explain the try, except, else, and finally blocks."
    ]

    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Admin@12345",
            database="Python_db"
        )
        if connection.is_connected():
            print("Connected to MySQL Server")
            cursor = connection.cursor()

            # Insert questions into table1
            for question in questions:
                cursor.execute("INSERT INTO level_low (question) VALUES (%s)", (question,))
                print(f"Question '{question}' inserted successfully")

            # Commit the transaction
            connection.commit()

            # Close cursor and connection
            cursor.close()
            connection.close()
            print("Connection closed")

    except mysql.connector.Error as error:
        print("Error:", error)

# Call the function to insert questions
insert_questions()
