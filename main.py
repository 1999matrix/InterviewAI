from flask import Flask, jsonify, request
from src.component.comp1.start_test import QuestionFetcher
from src.component.comp1.next import QuestionManagerComp1
from src.component.comp1.text_to_db import TextAppender
from src.component.comp1.result import UserResultFetcherComp1  
from src.component.comp2.start_test import QuestionFetcherComp2
from src.component.comp2.result import UserResultFetcherComp2
from src.component.comp2.next import QuestionManagerComp2
from src.component.comp2.cv_to_db import UserCVHandler
from dotenv import load_dotenv
from flask_cors import CORS
from src.component.comp3.start_test import QuestionFetcherComp3
from src.component.comp3.next import QuestionManagerComp3

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/api/v1/start_test_comp1", methods=["GET"])
def start_test_comp1():
    try:
        # Extract parameters from the URL query string
        username = request.args.get("username")
        topic = request.args.get("topic")
        level = request.args.get("level")

        # Create an instance of QuestionFetcher with the extracted parameters
        question_id_fetcher_instance = QuestionFetcher(username, topic, level)
        question_id = question_id_fetcher_instance.fetch_questions()
    
        if question_id is not None:
            return jsonify({'question': str(question_id)})
        else:
            return jsonify({'message': 'No question assigned to user'}), 404

    except Exception as e:
        return str(e), 500




@app.route('/api/v1/get_next_question_id_comp1', methods=['GET'])
def get_next_question_comp1():
    username = request.args.get('username')
    # topic = request.args.get('topic')
    # level = request.args.get('level')
    text = request.args.get('text')

    if not username:
        return jsonify({'error': 'Username not provided'}), 400

    question_manager = QuestionManagerComp1()
    question_manager.text_db(username, text)  # Corrected method call
    next_question_id = question_manager.get_next_question_id(username)

    if next_question_id is not None:
        return jsonify({'next_question_id': next_question_id}), 200
    else:
        # Return a message with status code 200 if no more questions remain
        return jsonify({'message': 'No more questions left for this user'}), 200





@app.route('/api/v1/get_user_result_comp1', methods=['GET'])
def get_user_result_api_comp1():
    fetcher = UserResultFetcherComp1()

    username = request.args.get('username')
    
    if not username:
        return jsonify({"error": "Username parameter is missing"}), 400

    response_result = fetcher.get_user_result(username)
    
    if response_result is None:
        return jsonify({"error": f"No data found for username: {username}"}), 404

    return jsonify({"response_result": response_result}), 200




# @app.route('/api/v1/start_test_comp2', methods=['POST'])
# def start_test_comp2():
#     data = request.json
#     username = data.get('username')
#     role = data.get('role')
#     job_description = data.get('job_description')
#     experience = data.get('experience')
#     cv_flag = data.get('cv', True)

#     QuestionFetcherComp2_instance = QuestionFetcherComp2(username, role, job_description, experience, cv_flag)
#     result = QuestionFetcherComp2_instance.generate_question_from_cv()

#     # Insert the questions into the database
#     questions = result['question'].tolist()  # Convert the questions column to a list
#     # print(questions)
#     first_question  = QuestionFetcherComp2_instance.insert_questions_into_db(questions)

#     if not username:
#         return jsonify({"error": "Username parameter is missing"}), 400
    
#     if first_question is None:
#         return jsonify({"error": f"No data found for username: {username}"}), 404

#     return jsonify({'question': str(first_question)})

@app.route('/api/v1/start_test_comp2', methods=['POST'])
def handle_start_test_comp2():
    try:
        # Validate input data
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Extract parameters with validation
        username = data.get('username')
        role = data.get('role')
        job_description = data.get('job_description', '')
        experience = data.get('experience')
        cv_flag = data.get('cv', True)

        # Validate required parameters
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        if not role:
            return jsonify({"error": "Role is required"}), 400
        
        if experience is None:
            return jsonify({"error": "Experience is required"}), 400

        # Create QuestionFetcherComp2 instance
        try:
            QuestionFetcherComp2_instance = QuestionFetcherComp2(
                username, role, job_description, experience, cv_flag
            )
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400

        # Generate questions from CV
        try:
            result = QuestionFetcherComp2_instance.generate_question_from_cv()
        except FileNotFoundError as fnf:
            return jsonify({
                "error": str(fnf),
                "status_code": 404,
                "message": "CV not found for the given username"
            }), 404
        except ConnectionError as ce:
            return jsonify({
                "error": str(ce),
                "status_code": 500,
                "message": "Database connection error"
            }), 500
        except ValueError as ve:
            return jsonify({
                "error": str(ve),
                "status_code": 500,
                "message": "Error generating questions"
            }), 500
        except Exception as e:
            return jsonify({
                "error": "An unexpected error occurred while generating questions",
                "status_code": 500,
                "message": str(e)
            }), 500

        # Validate result
        if result is None or result.empty:
            return jsonify({
                "error": "No questions could be generated",
                "status_code": 404,
                "message": "Unable to generate questions from CV"
            }), 404

        # Convert questions to list
        questions = result['question'].tolist()

        # Insert questions into database
        try:
            first_question = QuestionFetcherComp2_instance.insert_questions_into_db(questions)
        except Exception as e:
            return jsonify({
                "error": "Failed to insert questions into database",
                "status_code": 500,
                "message": str(e)
            }), 500

        # Return successful response
        return jsonify({
            'status': 'success',
            'status_code': 200,
            'question': str(first_question)
        }), 200

    except Exception as e:
        # Catch any unexpected errors
        app.logger.error(f"Unexpected error in start_test_comp2: {e}")
        return jsonify({
            "error": "An unexpected server error occurred",
            "status_code": 500,
            "message": str(e)
        }), 500


@app.route('/api/v1/get_next_question_comp2', methods=['GET'])
def get_next_question_comp2():
    username = request.args.get('username')
    text = request.args.get('text')

    if not username:
        return jsonify({'error': 'Username not provided'}), 400

    question_manager = QuestionManagerComp2()
    question_manager.text_db(username, text)  # Corrected method call
    next_question_id = question_manager.get_next_question_id_comp2(username)

    if next_question_id is not None:
        return jsonify({'next_question_id': next_question_id}), 200
    else:
        # Return a message with status code 200 if no more questions remain
        return jsonify({'message': 'No more questions left for this user'}), 200


@app.route('/api/v1/get_user_result_comp2', methods=['GET'])
def get_user_result_api_comp2():
    fetcher = UserResultFetcherComp2()

    username = request.args.get('username')
    
    if not username:
        return jsonify({"error": "Username parameter is missing"}), 400

    response_result = fetcher.get_user_result(username)
    
    if response_result is None:
        return jsonify({"error": f"No data found for username: {username}"}), 404

    return jsonify({"response_result": response_result}), 200



@app.route("/api/v1/upload_cv", methods=["POST"])
def upload_cv():
    if "pdf_file" not in request.files or "username" not in request.form:
        return jsonify({"message": "Username and PDF file are required.", "status": "error"}), 400

    username = request.form["username"]
    pdf_file = request.files["pdf_file"]

    if pdf_file.filename == "":
        return jsonify({"message": "No selected file.", "status": "error"}), 400

    response = UserCVHandler.insert_user_cv(username, pdf_file)
    return jsonify(response), (200 if response["status"] == "success" else 500)


@app.route("/api/v1/analyze_cv", methods=["POST"])
def analyze_cv_endpoint():
    try:
        data = request.json
        if not data or 'cv_text' not in data:
            return jsonify({
                "error": "CV text is required",
                "status": "error"
            }), 400

        cv_text = data['cv_text']
        if not cv_text.strip():
            return jsonify({
                "error": "CV text cannot be empty",
                "status": "error"
            }), 400

        # Import the analyze_cv function
        from src.model.groq import analyze_cv
        
        # Get the analysis
        analysis_result = analyze_cv(cv_text)
        
        # Return the analysis result
        return jsonify({
            "status": "success",
            "analysis": analysis_result
        }), 200

    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500


@app.route('/api/v1/start_test_comp3', methods=['POST'])
def handle_start_test_comp3():
    try:
        # Validate input data
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Extract parameters with validation
        username = data.get('username')
        role = data.get('role')
        job_description = data.get('job_description', '')
        experience = data.get('experience')
        cv_flag = data.get('cv', True)

        # Validate required parameters
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        if not role:
            return jsonify({"error": "Role is required"}), 400
        
        if experience is None:
            return jsonify({"error": "Experience is required"}), 400

        # Create QuestionFetcherComp3 instance and start session
        try:
            fetcher = QuestionFetcherComp3(
                username, role, job_description, experience, cv_flag
            )
            result = fetcher.start_session()
        except FileNotFoundError as fnf:
            return jsonify({
                "error": str(fnf),
                "status_code": 404,
                "message": "CV not found for the given username"
            }), 404
        except Exception as e:
            return jsonify({
                "error": "Failed to start session",
                "status_code": 500,
                "message": str(e)
            }), 500

        # Return successful response
        return jsonify({
            'status': 'success',
            'status_code': 200,
            'question': result['question'],
            'total_questions': result['total_questions']
        }), 200

    except Exception as e:
        return jsonify({
            "error": "An unexpected error occurred",
            "status_code": 500,
            "message": str(e)
        }), 500


@app.route('/api/v1/get_next_question_comp3', methods=['POST'])
def get_next_question_comp3():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        username = data.get('username')
        response = data.get('response')

        if not username:
            return jsonify({"error": "Username is required"}), 400
        if not response:
            return jsonify({"error": "Response is required"}), 400

        question_manager = QuestionManagerComp3()
        result = question_manager.process_response_and_get_next(username, response)

        if result['status'] == 'completed':
            return jsonify({
                'status': 'completed',
                'message': result['message']
            }), 200

        return jsonify({
            'status': 'success',
            'evaluation': result['evaluation'],
            'next_question': result['next_question'],
            'questions_remaining': result['questions_remaining']
        }), 200

    except Exception as e:
        return jsonify({
            "error": "An unexpected error occurred",
            "status_code": 500,
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host = '0.0.0.0', port = 7777, debug=False)

