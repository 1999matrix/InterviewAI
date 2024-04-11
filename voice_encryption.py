import os
import sounddevice as sd
import soundfile as sf
import base64
import os
from dotenv import load_dotenv
load_dotenv()

def record_and_encode_audio(save_dir, duration=15):
    print("Recording audio...")
    recording = sd.rec(int(duration * 44100), samplerate=44100, channels=2, dtype='int16')
    sd.wait()

    wav_filename = os.path.join(save_dir, "recording.wav")
    sf.write(wav_filename, recording, 44100, subtype='PCM_16')


save_dir = os.getenv("sav_recroding_dir")
encoded_audio = record_and_encode_audio(save_dir)
print("Audio recording and encoding completed.")
