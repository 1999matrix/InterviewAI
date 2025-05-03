import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Use a consistent model across all functions
GROQ_MODEL = "llama-3.3-70b-versatile"

def question_checker(question, response):
    # Initialize the Groq client with the API key
    client = Groq(
        api_key=os.getenv("GROQ_API_KEY")
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
            model=GROQ_MODEL
        )

        # Extract and return the generated response
        return chat_completion.choices[0].message.content

    except Exception as e:
        return f"An error occurred: {e}"

def question_generator(text):
    total_question_generate = os.getenv("TOTAL_QUESTION_GENERATE")
    general_question_generate = os.getenv("GENERAL_QUESTION_GENERATE")
    technical_question_generate = os.getenv("TECHNICAL_QUESTION_GENERATE")
    # Initialize the Groq client with the API key
    client = Groq(
        api_key=os.getenv("GROQ_API_KEY")
    )

    # Prepare the prompt
    prompt = f"""
    Given the following text, provide the information of CV of a user:
    CV: '{text}'
    Generate {total_question_generate} questions based on the CV and experience of the user. Provide:
    - {general_question_generate} general questions.
    - {technical_question_generate} technical questions based on the technologies specified in the text.
    Return the questions as a list of plain text, with each question as a separate line.
    """

    try:
        # Call the Groq API to generate a chat completion
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model=GROQ_MODEL
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
        api_key=os.getenv("GROQ_API_KEY")
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
            model=GROQ_MODEL
        )

        # Extract and return the generated response
        return chat_completion.choices[0].message.content

    except Exception as e:
        return f"An error occurred: {e}"

def analyze_cv(cv_text):
    # Initialize the Groq client with the API key
    client = Groq(
        api_key=os.getenv("GROQ_API_KEY")
    )

    # Prepare the prompt for comprehensive CV analysis
    prompt = f"""
    Analyze the following CV text and provide a detailed analysis including:
    1. ATS Score (0-100) based on the following criteria:
       - Skills (10 points)
       - Experience (15 points)
       - Education (10 points)
       - Certifications (5 points)
       - Job Titles (5 points)
       - Keywords from Job Description (10 points)
       - Tools/Technologies (10 points)
       - Achievements (10 points)
       - Soft Skills (5 points)
       - Hard Skills (5 points)
       - Languages (5 points)
       - Projects (5 points)
       - Keywords Frequency (5 points)
       - Action Verbs (5 points)
       - Industry Keywords (5 points)
       - Leadership (5 points)
       - Metrics/Numbers (5 points)
       - Publications (5 points)
       - Volunteer Work (5 points)
       - Consistency (5 points)
       - Repetition (5 points)
       - Length and Depth (5 points)

    2. Improvement Suggestions:
       - List specific areas that need improvement
       - Provide actionable recommendations
       - Highlight missing elements
       - Suggest better formatting or structure
       - Recommend specific keywords to add
       - Point out any inconsistencies or gaps

    3. Strengths:
       - List the strong points of the CV
       - Highlight well-presented sections
       - Note effective use of keywords
       - Mention good formatting choices

    CV Text: '{cv_text}'

    Return the analysis in a structured JSON format with the following keys:
    - ats_score (number)
    - improvement_suggestions (list of strings)
    - strengths (list of strings)
    - detailed_analysis (string with detailed explanation)
    """

    try:
        # Call the Groq API to generate a chat completion
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model=GROQ_MODEL
        )

        # Extract and return the generated response
        return chat_completion.choices[0].message.content

    except Exception as e:
        return f"An error occurred: {e}"

def generate_interview_question(cv_content, role, job_description, experience, previous_questions=None, previous_responses=None):
    """
    Generate a single interview question based on CV content and context
    """
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    # Build context from previous Q&A if available
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

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"An error occurred: {e}"

def evaluate_interview_response(question, response, cv_content, role, job_description):
    """
    Evaluate an interview response and provide feedback
    """
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1000
        )

        eval_text = response.choices[0].message.content.strip()
        
        # Parse the response
        score_line = [line for line in eval_text.split('\n') if line.startswith('SCORE:')][0]
        feedback_line = [line for line in eval_text.split('\n') if line.startswith('FEEDBACK:')][0]
        
        score = float(score_line.split(':')[1].strip())
        feedback = feedback_line.split(':')[1].strip()

        return {
            'score': score,
            'feedback': feedback
        }
    except Exception as e:
        return {'score': 0, 'feedback': f"An error occurred while evaluating the response: {e}"}
