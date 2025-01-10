import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


def llm_model(question, response):
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

