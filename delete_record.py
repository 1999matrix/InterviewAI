import mysql.connector

# Establish a connection to the database
connection = mysql.connector.connect(user='root', password='Admin@12345', host='localhost', database='user_test_info_db')
cursor = connection.cursor()

# The revised DELETE statement
query = """DELETE FROM user_test_info WHERE username='example_user';"""

cursor.execute(query)

# Commit changes
connection.commit()

# Close cursor and connection after completing operations
cursor.close()
connection.close()

