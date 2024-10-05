import requests

def test_get_user_responses_api(username,topic,level):
    url = "http://127.0.0.1:7777/api/v1/get_user_responses"  # Replace with your API URL if it's different
    params = {"username": username,"topic":topic,"level":level}
    
    try:
        response = requests.get(url, params=params)
        
        # Check for successful request
        if response.status_code == 200:
            print(f"Success: {response.json()}")
        elif response.status_code == 404:
            print(f"Error: {response.json()['error']}")
        else:
            print(f"Unexpected status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

# Test the API with a username
test_username = "example_user"
topic = "python_db"
level = "low"

test_get_user_responses_api(test_username,topic,level)

