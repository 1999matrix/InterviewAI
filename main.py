import schedule
import threading
import time
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
import os
from src.component.voice_decryption import WavToTextConverter
from src.component.start_test import QuestionFetcher
from src.component.next import QuestionManager
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route("/api/v1/start_test", methods=["POST"])
def start_test():
    try:
        # Extract parameters from the POST request
        username = request.form.get("username")
        topic = request.form.get("topic")
        level = request.form.get("level")

        # Create an instance of QuestionFetcher with the extracted parameters
        question_id_fetcher_instance = QuestionFetcher(username, topic, level)
        question_id = question_id_fetcher_instance.fetch_questions()

        return str(question_id)
    except Exception as e:
        return str(e), 500




import os
from flask import request, jsonify

@app.route("/api/v1/voice_decode", methods=["POST"])
def decode_audio():
    try:
        # Check if the 'wav_file' key exists in the request files
        if 'wav_file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        # Get the file from the request
        file = request.files['wav_file']

        # Check if the file is empty
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Get username from the request
        username = request.form.get("username")

        # Get file path from the request
        file_path = request.form.get("file_path")


        WavToTextConverter_instance = WavToTextConverter()
        result = WavToTextConverter_instance.convert(username,file_path)


        return jsonify({"result": result})
    
    except Exception as e:
        return str(e), 500



@app.route('/api/v1/get_next_question_id', methods=['GET'])
def get_next_question():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': 'Username not provided'}), 400

    question_manager = QuestionManager()
    next_question_id = question_manager.get_next_question_id(username)

    if next_question_id is not None:
        return jsonify({'next_question_id': next_question_id})
    else:
        return jsonify({'message': 'No more questions left for this user'}), 404



# # Example usage:
# username = "example_user"
# QuestionManager_instance = QuestionManager()
# next_question_id = QuestionManager_instance.get_next_question_id(username)





if __name__ == "__main__":
    app.run(debug=True)

