import speech_recognition as sr
from dotenv import load_dotenv
import os
import sys
from src.utils import convert_wav_to_text 

load_dotenv()

# wav_file_path = os.getenv("recording_path")
# text = convert_wav_to_text(wav_file_path)
# print("Text:", text)

class WavToTextConverter:
    def convert(self, wav_file_path):
        # Convert the WAV file to text
        text = convert_wav_to_text(wav_file_path)

        # Print the text
        print("Text:", text)


if __name__ == "__main__":
    pass