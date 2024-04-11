import mysql.connector

# Establish a connection to the database
connection = mysql.connector.connect(user='root', password='Admin@12345', host='localhost', database='db_77')
cursor = connection.cursor()

# The revised DELETE statement
query = """DELETE FROM table2 WHERE username='Bhupendra';"""

cursor.execute(query)

# Commit changes
connection.commit()

# Close cursor and connection after completing operations
cursor.close()
connection.close()

#3,7,1,2,5