import mysql.connector
from src.utils import connect_to_user_db_and_table2
import mysql.connector



import mysql.connector
from src.utils import connect_to_user_db_and_table2

class QuestionManager:
    def __init__(self):
        self.connection = None

    def get_next_question_id(self, username):  # Added 'self' parameter here
        connection = None
        try:
            connection = connect_to_user_db_and_table2()
            cursor = connection.cursor()
            # Check if the username exists in the table
            cursor.execute("SELECT response_count, q_id FROM table2 WHERE username = %s", (username,))
            user_row = cursor.fetchone()

            if user_row:  # If username exists
                response_count, q_ids = user_row
                q_id_list = q_ids.split(',')  # Split the comma-separated q_ids into a list
                if len(q_id_list) >= response_count:
                    next_q_id = q_id_list[response_count]  # Get the next q_id based on response_count
                    return next_q_id
                else:
                    return None  # No more questions left for this user
            else:
                return None  # Username does not exist
        except (Exception, mysql.connector.Error) as error:
            print("Error while fetching data from MySQL", error)
        finally:
            # Close connection
            if connection:
                cursor.close()
                connection.close()


if __name__ == "__main__":
    pass

