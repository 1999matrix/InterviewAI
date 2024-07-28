import requests
import json

BASE_URL = "http://localhost:5000/api/v1"

def test_append_text(username, text):
    url = f"{BASE_URL}/append_text"
    payload = {
        'username': username,
        'text': text
    }
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    # Replace these with actual test values
    test_username = "example_user"
    test_text = "This is a test response"

    print("Testing append_text API:")
    test_append_text(test_username, test_text)
