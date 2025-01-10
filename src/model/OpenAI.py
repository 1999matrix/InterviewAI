from dotenv import load_dotenv
import os
from openai import OpenAI

# Load environment variables from a .env file
load_dotenv()

def llm_model(question, response):
    # Load OpenAI API key from the environment variable
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
    )

    # Construct the prompt
    prompt = (
        f"Given the following question and response, provide the following three pieces of information:\n"
        f"1) Correctness: Indicate whether the response is correct, partially correct, or incorrect.\n"
        f"2) Explanation: If the response is incorrect or partially correct, provide the correct explanation.\n"
        f"3) Conclusion: Summarize the accuracy of the response and suggest any improvements if necessary.\n\n"
        f"Question: '{question}'\n"
        f"Response: '{response}'"
    )

    # Generate the response
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="gpt-4",
        )
        # Extract and return the response content
        response_text = chat_completion.choices[0].message.content.strip()
        return response_text

    except Exception as e:
        return f"An error occurred: {e}"


