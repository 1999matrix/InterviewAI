import requests

# Define the parameters
params = {
    "username": "example_user",
    "topic": "Python_db",
    "level": "low"
}

# Define the URL of your Flask API
url = "http://localhost:5000/api/v1/start_test"

# Send a POST request with the parameters
response = requests.post(url, data=params)

# Print the response
print(response.text)
