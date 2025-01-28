import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


def question_checker(question, response):
    # Initialize the Groq client with the API key
    client = Groq(
        api_key=os.getenv("GROQ_API_KEY")  # Set the API key in your environment variables
    )

    # Prepare the prompt
    prompt = f"""
    Given the following question and response, provide the following three pieces of information:
    1) Correctness: Indicate whether the response is correct, partially correct, or incorrect.
    2) Explanation: If the response is incorrect or partially correct, provide the correct explanation.
    3) Conclusion: Summarize the accuracy of the response and suggest any improvements if necessary.
    Question: '{question}'
    Response: '{response}'
    """

    try:
        # Call the Groq API to generate a chat completion
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile"  # Adjust the model if needed
        )

        # Extract and return the generated response
        return chat_completion.choices[0].message.content

    except Exception as e:
        return f"An error occurred: {e}"




def question_generator(text):
    # Initialize the Groq client with the API key
    client = Groq(
        api_key=os.getenv("GROQ_API_KEY")  # Set the API key in your environment variables
    )

    # Prepare the prompt
    prompt = f"""
    Given the following text, provide the information of CV of a user:
    CV: '{text}'
    Generate 7 questions based on the CV and experience of the user. Provide:
    - 3 general questions.
    - 4 technical questions based on the technologies specified in the text.
    Return the questions as a list of plain text, with each question as a separate line.
    """

    try:
        # Call the Groq API to generate a chat completion
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile"  # Adjust the model if needed
        )

        # Extract the response
        response = chat_completion.choices[0].message.content

        # Split the response into a list of questions and filter out unwanted lines
        questions = [
            line.strip()
            for line in response.split("\n")
            if line.strip() and not line.lower().startswith("here are")
        ]

        return questions

    except Exception as e:
        return f"An error occurred: {e}"

def score_calculator(text):
    # Initialize the Groq client with the API key
    client = Groq(
        api_key=os.getenv("GROQ_API_KEY")  # Set the API key in your environment variables
    )

    # Prepare the prompt
    prompt = f"""
    The following text contains a test with questions and responses. Your task is to assign a score out of 100 based on the content. Only return the score as a number. Do not include any additional text or strings.
    Text: '{text}'
    """

    try:
        # Call the Groq API to generate a chat completion
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile"  # Adjust the model if needed
        )

        # Extract and return the generated response
        return chat_completion.choices[0].message.content

    except Exception as e:
        return f"An error occurred: {e}"
