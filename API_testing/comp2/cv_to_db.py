import requests

# Define the API endpoint
url = "http://127.0.0.1:7777/api/v1/upload_cv"

# Define the file path
pdf_path = "C:/Users/ADMIN/Downloads/Bhupendra Rajput CV.pdf"

# Prepare the request data
data = {"username": "t7"}
files = {"pdf_file": open(pdf_path, "rb")}

# Send the POST request
response = requests.post(url, data=data, files=files)

# Print the response
print("Status Code:", response.status_code)
print("Response JSON:", response.json())
