from dotenv import load_dotenv
import os
import openai

# Load environment variables from a .env file
load_dotenv()

def question_checker(question, response):
    # Load OpenAI API key from the environment variable
    client = openai.OpenAI(
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
    total_question_generate = os.getenv("TOTAL_QUESTION_GENERATE")
    general_question_generate = os.getenv("GENERAL_QUESTION_GENERATE")
    technical_question_generate = os.getenv("TECHNICAL_QUESTION_GENERATE")
    # Load OpenAI API key from the environment variable
    client = openai.OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
    )

    # Construct the prompt
    prompt = (
        f"Given the following text, provide the information of CV of a user:\n"
        f"CV: '{text}'\n"
        f"Generate {total_question_generate} questions based on the CV and experience of the user. Provide:\n"
        f"- {general_question_generate} general questions.\n"
        f"- {technical_question_generate} technical questions based on the technologies specified in the text.\n"
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
    client = openai.OpenAI(
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
    client = openai.OpenAI(
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

def generate_interview_question(cv_content, role, job_description, experience, previous_questions=None, previous_responses=None):
    """
    Generate a single interview question based on CV content and context
    """
    context = ""
    if previous_questions and previous_responses:
        for q, r in zip(previous_questions, previous_responses):
            context += f"Q: {q}\nA: {r}\n"

    prompt = f"""
    Role: {role}
    Experience: {experience} years
    Job Description: {job_description}
    CV Content: {cv_content}
    Previous Q&A Context:
    {context}

    Based on the above information, generate a single, specific technical interview question that:
    1. Tests the candidate's expertise in areas mentioned in their CV
    2. Is relevant to the role and job description
    3. Builds upon previous questions and responses (if any)
    4. Is clear and unambiguous
    5. Requires a detailed technical response

    Return only the question text, without any additional formatting or explanation.
    """

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message['content'].strip()

def evaluate_interview_response(question, response, cv_content, role, job_description):
    """
    Evaluate an interview response and provide feedback
    """
    prompt = f"""
    Question: {question}
    Candidate's Response: {response}
    Role: {role}
    Job Description: {job_description}
    CV Content: {cv_content}

    Evaluate the candidate's response based on:
    1. Technical accuracy
    2. Relevance to the question
    3. Depth of understanding
    4. Clarity of explanation

    Provide your evaluation in exactly this format:
    SCORE: [a number between 0.0 and 1.0]
    FEEDBACK: [detailed constructive feedback explaining the score and suggesting improvements]

    Make sure to provide substantive feedback that helps the candidate understand their strengths and areas for improvement.
    """
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    eval_text = response.choices[0].message['content'].strip()
    score_line = [line for line in eval_text.split('\n') if line.startswith('SCORE:')][0]
    feedback_line = [line for line in eval_text.split('\n') if line.startswith('FEEDBACK:')][0]
    score = float(score_line.split(':')[1].strip())
    feedback = feedback_line.split(':')[1].strip()
    return {
        'score': score,
        'feedback': feedback
    }