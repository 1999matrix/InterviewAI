import requests
import tempfile
import pygame
import time
import os

# Define the API endpoint
url = "http://127.0.0.1:7777/api/v1/start_test_comp3"

# Create the payload for the POST request
payload = {
    "username": "t7",
    "role": "Data Scientist",
    "job_description": "Build and deploy machine learning models",
    "experience": 3,
    "cv": True  # Set to True if the user has a CV
}

# Send the POST request to the API
try:
    # Send request with proper headers
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.post(url, json=payload, headers=headers)
    
    # Print full response details for debugging
    print("Status Code:", response.status_code)
    
    # Handle different status codes
    if response.status_code == 200:
        # Print the question text from the header
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
        finally:
            os.remove(tmp_file_path)
    elif response.status_code in [400, 404, 500]:
        print(f"Error ({response.status_code}):")
        print(response.text)
    else:
        print(f"Unexpected status code: {response.status_code}")

except requests.exceptions.RequestException as e:
    print(f"Network error occurred: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}") 