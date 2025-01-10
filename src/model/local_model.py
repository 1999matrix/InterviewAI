import requests
import json

def llm_model(question,response):
    url = 'http://localhost:11434/api/generate'
    data = {
        "model": "llama3",
        "prompt": f"Given the following question and response, provide the following three pieces of information: 1) Correctness: Indicate whether the response is correct, partially correct, or incorrect. 2) Explanation: If the response is incorrect or partially correct, provide the correct explanation. 3) Conclusion: Summarize the accuracy of the response and suggest any improvements if necessary. Question: '{question}?' Response: '{response}'"
    }

    response = requests.post(url, json=data)

    if response.status_code == 200:
        generated_response = ""
        response_content = response.text.split('\n')
        for json_str in response_content:
            if json_str:
                json_obj = json.loads(json_str)
                generated_response += json_obj['response']
        
    return generated_response