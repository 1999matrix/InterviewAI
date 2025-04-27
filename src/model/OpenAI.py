from dotenv import load_dotenv
import os
from openai import OpenAI

# Load environment variables from a .env file
load_dotenv()

def question_checker(question, response):
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



def question_generator(text):
    # Load OpenAI API key from the environment variable
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
    )

    # Construct the prompt
    prompt = (
        f"Given the following text, provide the information of CV of a user:\n"
        f"CV: '{text}'\n"
        f"Generate 7 questions based on the CV and experience of the user. Provide:\n"
        f"- 3 general questions.\n"
        f"- 4 technical questions based on the technologies specified in the text.\n"
        f"Return the questions as a list of plain text, with each question as a separate line."
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

        # Extract the response content
        response = chat_completion.choices[0].message.content.strip()

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
    # Load OpenAI API key from the environment variable
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
    )

    # Construct the prompt
    prompt = (
        f"The following text contains a test with questions and responses. "
        f"Your task is to assign a score out of 100 based on the content. "
        f"Only return the score as a number. Do not include any additional text or strings.\n\n"
        f"Text: '{text}'"
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

def analyze_cv(cv_text):
    # Load OpenAI API key from the environment variable
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
    )

    # Construct the prompt
    prompt = (
        f"Analyze the following CV text and provide a detailed analysis including:\n"
        f"1. ATS Score (0-100) based on the following criteria:\n"
        f"   - Skills (10 points)\n"
        f"   - Experience (15 points)\n"
        f"   - Education (10 points)\n"
        f"   - Certifications (5 points)\n"
        f"   - Job Titles (5 points)\n"
        f"   - Keywords from Job Description (10 points)\n"
        f"   - Tools/Technologies (10 points)\n"
        f"   - Achievements (10 points)\n"
        f"   - Soft Skills (5 points)\n"
        f"   - Hard Skills (5 points)\n"
        f"   - Languages (5 points)\n"
        f"   - Projects (5 points)\n"
        f"   - Keywords Frequency (5 points)\n"
        f"   - Action Verbs (5 points)\n"
        f"   - Industry Keywords (5 points)\n"
        f"   - Leadership (5 points)\n"
        f"   - Metrics/Numbers (5 points)\n"
        f"   - Publications (5 points)\n"
        f"   - Volunteer Work (5 points)\n"
        f"   - Consistency (5 points)\n"
        f"   - Repetition (5 points)\n"
        f"   - Length and Depth (5 points)\n\n"
        f"2. Improvement Suggestions:\n"
        f"   - List specific areas that need improvement\n"
        f"   - Provide actionable recommendations\n"
        f"   - Highlight missing elements\n"
        f"   - Suggest better formatting or structure\n"
        f"   - Recommend specific keywords to add\n"
        f"   - Point out any inconsistencies or gaps\n\n"
        f"3. Strengths:\n"
        f"   - List the strong points of the CV\n"
        f"   - Highlight well-presented sections\n"
        f"   - Note effective use of keywords\n"
        f"   - Mention good formatting choices\n\n"
        f"CV Text: '{cv_text}'\n\n"
        f"Return the analysis in a structured JSON format with the following keys:\n"
        f"- ats_score (number)\n"
        f"- improvement_suggestions (list of strings)\n"
        f"- strengths (list of strings)\n"
        f"- detailed_analysis (string with detailed explanation)"
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