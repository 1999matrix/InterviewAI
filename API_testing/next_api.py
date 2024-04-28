import requests

# Define the URL of the API endpoint
url = 'http://localhost:5000/api/v1/get_next_question_id'

# Define the parameters you want to send
params = {'username': 'example_user',
          'topic':'Python_db',
          'level':'level_low'}

# Send a GET request to the API endpoint
response = requests.get(url, params=params)

# Check if the request was successful (status code 200)
if response.status_code == 200:
    # Print the response from the API
    print(response.json())
else:
    # Print an error message if the request was not successful
    print(f"Error: {response.status_code} - {response.json()['error']}")
