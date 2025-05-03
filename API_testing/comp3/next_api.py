import requests
import json

# Define the API endpoint
url = "http://127.0.0.1:7777/api/v1/get_next_question_comp3"

# Create the payload for the POST request
payload = {
    "username": "t7",
    "response": "I have extensive experience with Python web development using Flask and Django. I've built several RESTful APIs and have worked with various databases including MySQL and MongoDB. I also have experience with React for frontend development and have created responsive web applications."
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
    
    # Try to parse the JSON response
    try:
        response_data = response.json()
    except json.JSONDecodeError:
        print("Error: Response is not a valid JSON")
        print("Raw Response:", response.text)
        exit(1)
    
    # Handle different status codes
    if response.status_code == 200:
        print("Successful Response:")
        print(json.dumps(response_data, indent=2))
        
        if response_data.get('status') == 'completed':
            print("\nSession completed:", response_data.get('message'))
        else:
            print("\nEvaluation Score:", response_data.get('evaluation', {}).get('score'))
            print("Feedback:", response_data.get('evaluation', {}).get('feedback'))
            print("\nNext Question:", response_data.get('next_question'))
            print("Questions Remaining:", response_data.get('questions_remaining'))
            
    elif response.status_code in [400, 404, 500]:
        print(f"Error ({response.status_code}):")
        print(response_data.get('error', 'Unknown error'))
        if 'message' in response_data:
            print("Message:", response_data['message'])
    else:
        print(f"Unexpected status code: {response.status_code}")
        print("Response:", response_data)

except requests.exceptions.RequestException as e:
    print(f"Network error occurred: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}") 