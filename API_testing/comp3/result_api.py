import requests
import json

# Define the API endpoint
url = "http://127.0.0.1:7777/api/v1/get_user_result_comp3"

# Create the query parameters
params = {
    "username": "t7"
}

# Send the GET request to the API
try:
    response = requests.get(url, params=params)
    
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
        
        result = response_data.get('result', {})
        print("\nSummary:")
        print(f"Questions Answered: {result.get('questions_answered')}")
        print(f"Average Score: {result.get('average_score'):.2f}")
        print(f"Percentage: {result.get('percentage')}%")
        
        print("\nDetailed Responses:")
        for i, response in enumerate(result.get('detailed_responses', []), 1):
            print(f"\nQuestion {i}:")
            print(f"Q: {response.get('question')}")
            print(f"A: {response.get('response')}")
            print(f"Score: {response.get('score')}")
            print(f"Feedback: {response.get('feedback')}")
            
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