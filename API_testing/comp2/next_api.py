import requests
import tempfile
import pygame
import time
import os

# Define the URL of the API endpoint
url = 'http://localhost:7777/api/v1/get_next_question_comp2'

# Define the parameters you want to send
params = {'username': 't7',
          'text':'python is a high level interpreter language'}

# Send a GET request to the API endpoint
response = requests.get(url, params=params)

# Check if the request was successful (status code 200)
if response.status_code == 200:
    # Check if this is a JSON completion response
    content_type = response.headers.get('content-type', '')
    if 'application/json' in content_type:
        # Handle completion response
        try:
            json_response = response.json()
            if json_response.get('status') == 'completed':
                print(f"✅ Test Completed: {json_response.get('message', 'Test finished successfully!')}")
            else:
                print(f"Response: {json_response}")
        except:
            print("Received JSON response but couldn't parse it")
    else:
        # Handle audio response
        question_text = response.headers.get('X-Question-Text', '(No question text header)')
        print(f"Question: {question_text}")
        # Save to temp file and play
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
            tmp_file.write(response.content)
            tmp_file.flush()
            tmp_file_path = tmp_file.name
        try:
            pygame.mixer.init()
            pygame.mixer.music.load(tmp_file_path)
            pygame.mixer.music.play()
            print('Playing audio...')
            while pygame.mixer.music.get_busy():
                time.sleep(0.5)
            pygame.mixer.music.unload()
        except Exception as e:
            print(f"Error playing audio: {e}")
        finally:
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)
else:
    # Print an error message if the request was not successful
    print(f"Error: {response.status_code} - {response.text}")


