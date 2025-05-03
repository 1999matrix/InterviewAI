import requests
import json
import os

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
    total_question_generate = os.getenv("TOTAL_QUESTION_GENERATE")
    general_question_generate = os.getenv("GENERAL_QUESTION_GENERATE")
    technical_question_generate = os.getenv("TECHNICAL_QUESTION_GENERATE")
    url = 'http://localhost:11434/api/generate'
    data = {
        "model": "llama3",
        "prompt": f"Given the following text, provide the information of CV of a user: "
                  f"CV: '{text}' "
                  f"Generate {total_question_generate} questions based on the CV and experience of the user. Provide: "
                  f"- {general_question_generate} general questions. "
                  f"- {technical_question_generate} technical questions based on the technologies specified in the text. "
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



def score_calculator(text):
    url = 'http://localhost:11434/api/generate'
    data = {
        "model": "llama3",
        "prompt": f"The following text contains a test with questions and responses. "
                  f"Your task is to assign a score out of 100 based on the content. "
                  f"Only return the score as a number. Do not include any additional text or strings.\n\n"
                  f"Text: '{text}'"
    }

    try:
        # Send the request to the local LLaMA API
        response = requests.post(url, json=data)

        if response.status_code == 200:
            generated_response = ""
            response_content = response.text.split('\n')
            for json_str in response_content:
                if json_str:
                    json_obj = json.loads(json_str)
                    generated_response += json_obj['response']

            # Ensure only the numeric score is returned
            return generated_response.strip()

        else:
            # Handle non-success HTTP responses
            return f"An error occurred: {response.status_code} - {response.text}"

    except Exception as e:
        # Handle any unexpected errors
        return f"An error occurred: {e}"

def analyze_cv(cv_text):
    url = 'http://localhost:11434/api/generate'
    data = {
        "model": "llama3",
        "prompt": f"""
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
    }

    try:
        response = requests.post(url, json=data)

        if response.status_code == 200:
            generated_response = ""
            response_content = response.text.split('\n')
            for json_str in response_content:
                if json_str:
                    json_obj = json.loads(json_str)
                    generated_response += json_obj['response']
            
            return generated_response.strip()
        else:
            return f"An error occurred: {response.status_code} - {response.text}"

    except Exception as e:
        return f"An error occurred: {e}"

def generate_interview_question(cv_content, role, job_description, experience, previous_questions=None, previous_responses=None):
    """
    Generate a single interview question based on CV content and context
    """
    url = 'http://localhost:11434/api/generate'
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

    data = {
        "model": "llama3",
        "prompt": prompt
    }
    response = requests.post(url, json=data)
    if response.status_code == 200:
        generated_response = ""
        response_content = response.text.split('\n')
        for json_str in response_content:
            if json_str:
                json_obj = json.loads(json_str)
                generated_response += json_obj['response']
        return generated_response.strip()
    return f"An error occurred: {response.status_code} - {response.text}"

def evaluate_interview_response(question, response, cv_content, role, job_description):
    """
    Evaluate an interview response and provide feedback
    """
    url = 'http://localhost:11434/api/generate'
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
    data = {
        "model": "llama3",
        "prompt": prompt
    }
    try:
        response_obj = requests.post(url, json=data)
        if response_obj.status_code == 200:
            eval_text = ""
            response_content = response_obj.text.split('\n')
            for json_str in response_content:
                if json_str:
                    json_obj = json.loads(json_str)
                    eval_text += json_obj['response']
            eval_text = eval_text.strip()
            score_line = [line for line in eval_text.split('\n') if line.startswith('SCORE:')][0]
            feedback_line = [line for line in eval_text.split('\n') if line.startswith('FEEDBACK:')][0]
            score = float(score_line.split(':')[1].strip())
            feedback = feedback_line.split(':')[1].strip()
            return {
                'score': score,
                'feedback': feedback
            }
        else:
            return {'score': 0, 'feedback': f"An error occurred: {response_obj.status_code} - {response_obj.text}"}
    except Exception as e:
        return {'score': 0, 'feedback': f"An error occurred while evaluating the response: {e}"}
