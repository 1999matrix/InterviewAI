# from flask import Flask, jsonify
# import schedule
# import threading
# import time
# import os
# from src.component.voice_decryption import WavToTextConverter
# from src.component.start import QuestionFetcher
# from datetime import datetime, timedelta
# from dotenv import load_dotenv

# load_dotenv()



# app = Flask(__name__)


# from flask import Flask, request
# app = Flask(__name__)

# @app.route("/api/v1/start_test", methods=["POST"])
# def start_test():
#     try:
#         # Extract parameters from the POST request
#         username = request.form.get("username")
#         topic = request.form.get("topic")
#         level = request.form.get("level")

#         # Create an instance of QuestionFetcher with the extracted parameters
#         question_id_fetcher_instance = QuestionFetcher(username, topic, level)
#         question_id = question_id_fetcher_instance.fetch_questions()

#         return str(question_id)
#     except Exception as e:
#         return str(e), 500





# @app.route("/api/v1/decode", methods=["POST"])
# def decode_audio():
#     # Call your main function here
#     try:
#         WavToTextConverter_instance = WavToTextConverter()
#         wav_file_path = os.getenv("recording_path")
#         result = WavToTextConverter_instance.convert(wav_file_path)
#         return jsonify({"result": result})
#     except Exception as e:
#         return str(e), 500

# if __name__ == "__main__":
#     app.run(debug=True)




from flask import Flask, jsonify, request
import os
from src.component.voice_decryption import WavToTextConverter
from src.component.start_test import QuestionFetcher
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



# @app.route("/api/v1/voice_decode", methods=["POST"])
# def decode_audio():
#     # Call your main function here
#     try:
#         WavToTextConverter_instance = WavToTextConverter()
#         wav_file_path = os.getenv("recording_path")
#         result = WavToTextConverter_instance.convert(wav_file_path)
#         return jsonify({"result": result})
#     except Exception as e:
#         return str(e), 500


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

        # Save the file to the specified file path
        # file.save(file_path)

        # Call the WavToTextConverter with the file path
        WavToTextConverter_instance = WavToTextConverter()
        result = WavToTextConverter_instance.convert(username,file_path)

        # Delete the temporary file
        # os.remove(file_path)

        return jsonify({"result": result})
    
    except Exception as e:
        return str(e), 500






if __name__ == "__main__":
    app.run(debug=True)

