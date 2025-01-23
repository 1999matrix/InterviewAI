import requests

# Define the API endpoint
url = "http://127.0.0.1:7777/api/v1/start_test_comp2"

# Create the payload for the POST request
payload = {
    "username": "user",
    "role": "Data Scientist",
    "job_description": "Build and deploy machine learning models",
    "experience": 3,
    "cv": True  # Set to True if the user has a CV
}

# Send the POST request to the API
try:
    response = requests.post(url, json=payload)

    # Check if the request was successful
    if response.status_code == 200:
        # print("API Response:")
        print(response.json())
    else:
        print(f"Error: {response.status_code} - {response.text}")

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")



