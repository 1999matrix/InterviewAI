import schedule
import threading
import time
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
import os
from src.component.comp1.start_test import QuestionFetcher
from src.component.comp1.next import QuestionManager
from src.component.comp1.text_to_db import TextAppender
from src.component.comp1.result import UserResponseFetcher  
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route("/api/v1/start_test", methods=["GET"])
def start_test():
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




@app.route('/api/v1/get_next_question_id', methods=['GET'])
def get_next_question():
    username = request.args.get('username')
    # topic = request.args.get('topic')
    # level = request.args.get('level')
    text = request.args.get('text')

    if not username:
        return jsonify({'error': 'Username not provided'}), 400

    question_manager = QuestionManager()
    question_manager.text_db(username, text)  # Corrected method call
    next_question_id = question_manager.get_next_question_id(username)

    if next_question_id is not None:
        return jsonify({'next_question_id': next_question_id}), 200
    else:
        # Return a message with status code 200 if no more questions remain
        return jsonify({'message': 'No more questions left for this user'}), 200





@app.route('/api/v1/append_text', methods=['POST'])
def append_text():
    try:
        data = request.json
        username = data.get('username')
        text = data.get('text')

        if not username or not text:
            return jsonify({"error": "Invalid input"}), 400
        
        appender = TextAppender()
        result = appender.append_text(username, text)
        return jsonify({"result": result})
    
    except Exception as e:
        return str(e), 500



@app.route('/api/v1/get_user_responses', methods=['GET'])
def get_user_responses_api():
    fetcher = UserResponseFetcher()

    username = request.args.get('username')
    
    if not username:
        return jsonify({"error": "Username parameter is missing"}), 400

    response_result = fetcher.get_user_responses(username)
    
    if response_result is None:
        return jsonify({"error": f"No data found for username: {username}"}), 404

    return jsonify({"response_result": response_result}), 200




if __name__ == "__main__":
    app.run(host = '0.0.0.0', port = 7777, debug=True)

