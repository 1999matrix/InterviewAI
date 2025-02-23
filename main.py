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

load_dotenv()

app = Flask(__name__)

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




@app.route('/api/v1/start_test_comp2', methods=['POST'])
def start_test_comp2():
    data = request.json
    username = data.get('username')
    role = data.get('role')
    job_description = data.get('job_description')
    experience = data.get('experience')
    cv_flag = data.get('cv', True)

    QuestionFetcherComp2_instance = QuestionFetcherComp2(username, role, job_description, experience, cv_flag)
    result = QuestionFetcherComp2_instance.generate_question_from_cv()

    # Insert the questions into the database
    questions = result['question'].tolist()  # Convert the questions column to a list
    # print(questions)
    first_question  = QuestionFetcherComp2_instance.insert_questions_into_db(questions)

    if not username:
        return jsonify({"error": "Username parameter is missing"}), 400
    
    if first_question is None:
        return jsonify({"error": f"No data found for username: {username}"}), 404

    return jsonify({'question': str(first_question)})



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




if __name__ == "__main__":
    app.run(host = '0.0.0.0', port = 7777, debug=True)

