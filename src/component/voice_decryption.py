import speech_recognition as sr
from dotenv import load_dotenv
import os
import sys
from src.utils import convert_wav_to_text 
from src.utils import connect_to_user_db_and_table2 

load_dotenv()


class WavToTextConverter:
    
    def convert(self, username, wav_file_path):
        # Convert the WAV file to text
        text = convert_wav_to_text(wav_file_path)
        
        # Update the database with the converted text
        db_connection = connect_to_user_db_and_table2()
        if db_connection:
            cursor = db_connection.cursor()
            print("going to send data in table2")
            # Construct the SQL query
            sql_query = f"UPDATE table2 SET response = CONCAT_WS(',', IF(response='', NULL, response), %s) WHERE username = %s"
            # Note: CONCAT_WS should be used to add a comma between existing text and new text
            
            print("query is ready")
            try:
                # Execute the SQL query
                cursor.execute(sql_query, (text, username))
                print("cursor is ready")
                # Commit the changes
                db_connection.commit()
                print("send data to table2 successfully")
            except Exception as e:
                print("Error occurred while executing SQL query:", e)
                # Rollback the changes
                db_connection.rollback()
                return "Failed to store response"
            finally:
                # Close the cursor and the database connection
                cursor.close()
                db_connection.close()
                print("connection closed")
            
            return "Response stored successfully"
        else:
            return "Failed to connect to the database"




if __name__ == "__main__":
    pass