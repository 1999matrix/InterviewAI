import speech_recognition as sr
from dotenv import load_dotenv
import os
import sys
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def convert_wav_to_text(wav_file):
    recognizer = sr.Recognizer()

    with sr.AudioFile(wav_file) as source:
        audio_data = recognizer.record(source)

        try:
            text = recognizer.recognize_google(audio_data)
            return text
        
        except sr.UnknownValueError:
            print("could not understand the audio")


def connect_to_user_db():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("mysql_database_host"),
            user=os.getenv("mysql_database_user"),
            password=os.getenv("mysql_database_password"),
            database=os.getenv("user_test_info_db")
        )
        if connection.is_connected():
            pass
        return connection
    except mysql.connector.Error as error:
        print("Error:", error)
        return None



def connect_to_question_db(topic):
    try:
        connection = mysql.connector.connect(
            host=os.getenv("mysql_database_host"),
            user=os.getenv("mysql_database_user"),
            password=os.getenv("mysql_database_password"),
            database=topic
        )
        if connection.is_connected():
            pass
        return connection
    except mysql.connector.Error as error:
        print("Error:", error)
        return None




def fetch_question(topic,level, id):
    connection = connect_to_question_db(topic)
    if connection is None:
        return None

    cursor = connection.cursor()
    query = f"SELECT question FROM {level} WHERE id = %s"
    try:
        cursor.execute(query, (id,))
        question = cursor.fetchone()
        if question:
            return question[0]
        else:
            return None
    except mysql.connector.Error as error:
        print("Error:", error)
        return None
    finally:
        cursor.close()
        connection.close()