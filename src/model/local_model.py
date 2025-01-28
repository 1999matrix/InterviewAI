import requests
import json

def question_checker(question,response):
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



def question_generator(text):
    url = 'http://localhost:11434/api/generate'
    data = {
        "model": "llama3",
        "prompt": f"Given the following text, provide the information of CV of a user: "
                  f"CV: '{text}' "
                  f"Generate 7 questions based on the CV and experience of the user. Provide: "
                  f"- 3 general questions. "
                  f"- 4 technical questions based on the technologies specified in the text. "
                  f"Return the questions as a list of plain text, with each question as a separate line."
    }

    response = requests.post(url, json=data)

    if response.status_code == 200:
        generated_questions = []
        response_content = response.text.split('\n')
        for json_str in response_content:
            if json_str:
                json_obj = json.loads(json_str)
                generated_questions.append(json_obj['response'])

        # Split questions into separate lines and clean up
        questions = [
            line.strip()
            for question_block in generated_questions
            for line in question_block.split("\n")
            if line.strip() and not line.lower().startswith("here are")
        ]
        return questions

    return f"An error occurred: {response.status_code} - {response.text}"