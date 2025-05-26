# Requirements: pip install pygame edge-tts

from eddge_tts import TextToSpeechConverter
import pygame
import time
import tempfile
import os

if __name__ == "__main__":
    text = "Design and implement an end-to-end machine learning pipeline using Python, scikit-learn, and TensorFlow to detect anomalies in a time series dataset, incorporating techniques such as data preprocessing, feature engineering, and hyperparameter tuning, and deploy the model using AWS EC2 and Evidently for performance monitoring, assuming the dataset is stored in a PostgreSQL database and the model should be able to handle both supervised and unsupervised learning scenarios."
    voice = "en-IN-PrabhatNeural"
    converter = TextToSpeechConverter()
    audio_bytes = converter.convert_text_to_mp3_bytes(text, voice=voice)



    # # Save audio to a file in the current directory
    # output_path = os.path.join(os.path.dirname(__file__), 'sample_output.mp3')
    # with open(output_path, 'wb') as f:
    #     f.write(audio_bytes)
    # print(f"Audio sample saved as: {output_path}")
    # # Play audio as before



    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
        tmp_file.write(audio_bytes)
        tmp_file_path = tmp_file.name
    try:
        print(f"Playing audio for: {text}")
        pygame.mixer.init()
        pygame.mixer.music.load(tmp_file_path)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            time.sleep(0.5)
        pygame.mixer.music.unload()
    finally:
        os.remove(tmp_file_path)