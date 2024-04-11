

# import schedule
# import threading
# import time
# import os
# from src.component.voice_decryption import WavToTextConverter
# from datetime import datetime, timedelta
# from dotenv import load_dotenv

# def main():
#     try:
#         WavToTextConverter_instance = WavToTextConverter()
#         wav_file_path = os.getenv("recording_path")
#         WavToTextConverter_instance.convert(wav_file_path)
#     except:
#         pass



# if __name__ == "__main__":
#     main()




from flask import Flask, jsonify
import schedule
import threading
import time
import os
from src.component.voice_decryption import WavToTextConverter
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route("/api/v1/decode", methods=["POST"])
def decode_audio():
    # Call your main function here
    try:
        WavToTextConverter_instance = WavToTextConverter()
        wav_file_path = os.getenv("recording_path")
        result = WavToTextConverter_instance.convert(wav_file_path)
        return jsonify({"result": result})
    except Exception as e:
        return str(e), 500

if __name__ == "__main__":
    app.run(debug=True)