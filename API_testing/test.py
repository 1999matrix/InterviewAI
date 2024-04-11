import requests

# URL of the API
url = "http://localhost:5000/api/v1/decode"  # Update the URL if necessary

# Send a POST request to the API
try:
    response = requests.post(url)
    if response.status_code == 200:
        print("Audio decoding successful.")
        print("Decoded text:", response.json()["result"])
    else:
        print("Error:", response.text)
except Exception as e:
    print("An error occurred:", str(e))
