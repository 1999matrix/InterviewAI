# import requests

# # URL of the API
# url = "http://localhost:5000/api/v1/voice_decode"  # Update the URL if necessary

# # Send a POST request to the API
# try:
#     response = requests.post(url)
#     if response.status_code == 200:
#         print("Audio decoding successful.")
#         print("Decoded text:", response.json()["result"])
#     else:
#         print("Error:", response.text)
# except Exception as e:
#     print("An error occurred:", str(e))




import requests
import os
import pyaudio
import wave
from datetime import datetime

# Define the URL of your Flask API
url = "http://localhost:5000/api/v1/voice_decode"

# Define the username
username = "example_user"

# Set up PyAudio to record audio
audio = pyaudio.PyAudio()
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
RECORD_SECONDS = 5  # Adjust the recording duration as needed

# Start recording
stream = audio.open(format=FORMAT, channels=CHANNELS,
                    rate=RATE, input=True,
                    frames_per_buffer=CHUNK)

print("Recording...")

frames = []

# Record audio for the specified duration
for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
    data = stream.read(CHUNK)
    frames.append(data)

print("Recording done.")

# Stop recording
stream.stop_stream()
stream.close()
audio.terminate()

# Define the path to the folder where the .wav file will be stored
folder_path = "C:/Users/bhupe/Goal_77/src/wav/"

# Generate a unique filename based on username and current time
timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
filename = f"{username}_{timestamp}.wav"

# Save the recorded audio to a .wav file
wav_file_path = os.path.join(folder_path, filename)
with wave.open(wav_file_path, 'wb') as wf:
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(audio.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))

# Create a dictionary with the parameters to be sent in the request
data = {
    "username": username,
    "file_path": wav_file_path  # Add the file path to the data dictionary
}

# Open the .wav file and send it directly in the request
with open(wav_file_path, "rb") as file:
    files = {'wav_file': (wav_file_path, file, 'audio/wav')}
    # Send a POST request with the parameters and the file
    response = requests.post(url, data=data, files=files)

# # Print the response
# print(response.text)
