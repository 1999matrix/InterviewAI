# import mysql.connector
# from src.utils import connect_to_user_db
# from src.component.result import ResponseFetcher
# import threading 


# class QuestionManager:
#     def __init__(self):
#         self.connection = None

#     def get_next_question_id(self, username):  
#         connection = None
#         try:
#             # Moved trigger_analysis function outside of the try block
#             def trigger_analysis(username):
#                 try:
#                     # Triggering result checking process
#                     ResponseFetcher_instance = ResponseFetcher()
#                     ResponseFetcher_instance.fetch_q_id_and_response(username)
#                     ResponseFetcher_instance.check_response(username)
#                 except Exception as e:
#                     print("Error while trigger_analysis:", e)

#             thread = threading.Thread(target=trigger_analysis(username=username))
#             thread.start
#             # Connect to the user database
#             connection = connect_to_user_db()
#             cursor = connection.cursor()
            
#             # Check if the username exists in the table
#             cursor.execute("SELECT response_count, q_id FROM table2 WHERE username = %s", (username,))
#             user_row = cursor.fetchone()

#             if user_row:  # If username exists
#                 response_count, q_ids = user_row
#                 q_id_list = q_ids.split(',')  # Split the comma-separated q_ids into a list
#                 if len(q_id_list) > response_count:
#                     next_q_id = q_id_list[response_count]  # Get the next q_id based on response_count
#                     return next_q_id
#                 else:
#                     return None  # No more questions left for this user
#             else:
#                 return None  # Username does not exist
#         except mysql.connector.Error as error:
#             print("Error while fetching data from MySQL:", error)
#         finally:
#             # Close connection
#             if connection:
#                 cursor.close()
#                 connection.close()

# if __name__ == "__main__":
#     pass


import mysql.connector
from src.utils import connect_to_user_db
from src.component.result import ResponseFetcher
import threading 

class QuestionManager:
    def __init__(self):
        self.connection = None

    def trigger_analysis(self, username):
        try:
            # Triggering result checking process
            response_fetcher = ResponseFetcher()
            response_fetcher.fetch_q_id_and_response(username)
            response_fetcher.check_response(username)
        except Exception as e:
            print("Error while trigger_analysis:", e)

    def get_next_question_id(self, username):  
        connection = None
        try:
            # Connect to the user database
            connection = connect_to_user_db()
            cursor = connection.cursor()
            
            # Start the analysis trigger in a separate thread
            thread = threading.Thread(target=self.trigger_analysis, args=(username,))
            thread.start()
            
            # Check if the username exists in the table
            cursor.execute("SELECT response_count, q_id FROM user_test_info WHERE username = %s", (username,))
            user_row = cursor.fetchone()

            if user_row:  # If username exists
                response_count, q_ids = user_row
                q_id_list = q_ids.split(',')  # Split the comma-separated q_ids into a list
                if len(q_id_list) > response_count:
                    next_q_id = q_id_list[response_count]  # Get the next q_id based on response_count
                    return next_q_id
                else:
                    return None  # No more questions left for this user
            else:
                return None  # Username does not exist
        except mysql.connector.Error as error:
            print("Error while fetching data from MySQL:", error)
        finally:
            # Close connection
            if connection:
                cursor.close()
                connection.close()

if __name__ == "__main__":
    pass
