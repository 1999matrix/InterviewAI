import speech_recognition as sr
import requests
import json
from gtts import gTTS
import os
import pyttsx3
import sys

recognizer = sr.Recognizer()

with sr.Microphone() as source:
    print("Speak something...")
    audio = recognizer.listen(source)

try:
    print("Transcribing...")
    text = recognizer.recognize_google(audio)
    print("You said:", text)
except:
    sys.exit(1)




url = 'http://localhost:11434/api/generate'
data = {
    "model": "llama2",
    "prompt": text
}

response = requests.post(url, json=data)
generated_text = ''
if response.status_code == 200:
    response_content = response.text.split('\n')
    for json_str in response_content:
        if json_str:
            json_obj = json.loads(json_str)
            generated_text += json_obj['response']

else:
    pass


engine = pyttsx3.init()


engine.setProperty('rate', 150) 
engine.setProperty('volume', 0.9)  

engine.say(generated_text)

engine.runAndWait()