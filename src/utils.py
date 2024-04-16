import speech_recognition as sr
from dotenv import load_dotenv
import os
import sys
import mysql.connector


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
            host="localhost",
            user="root",
            password="Admin@12345",
            database="db_77"
        )
        if connection.is_connected():
            print("Connected to MySQL Server")
        return connection
    except mysql.connector.Error as error:
        print("Error:", error)
        return None
