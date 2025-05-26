from flask_cors import CORS
import asyncio
import base64
import io
import tempfile
import os
import uuid

# Global variable to check if edge-tts is available
EDGE_TTS_AVAILABLE = False

try:
    import edge_tts
    EDGE_TTS_AVAILABLE = True
    print("✓ edge-tts is available")
except ImportError:
    print("❌ edge-tts not available. Install with: pip install edge-tts")

class EdgeTTSService:
    def __init__(self):
        self.default_voice = "en-IN-PrabhatNeural"  # High quality male voice
        self.voices = []
        if EDGE_TTS_AVAILABLE:
            asyncio.run(self.load_voices())
    
    async def load_voices(self):
        """Load available voices"""
        try:
            voices = await edge_tts.list_voices()
            self.voices = [
                {
                    'name': voice['Name'],
                    'short_name': voice['ShortName'],
                    'gender': voice['Gender'],
                    'locale': voice['Locale'],
                    'suggested_codec': voice['SuggestedCodec'],
                    'friendly_name': voice['FriendlyName']
                }
                for voice in voices
                if voice['Locale'].startswith('en-')  # English voices only
            ]
            print(f"Loaded {len(self.voices)} English voices")
        except Exception as e:
            print(f"Error loading voices: {e}")
            self.voices = []
    
    async def text_to_speech_async(self, text, voice=None):
        """Convert text to speech asynchronously"""
        if not EDGE_TTS_AVAILABLE:
            raise Exception("edge-tts not available")
        
        voice = voice or self.default_voice
        communicate = edge_tts.Communicate(text, voice)
        
        # Generate audio data
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        
        return audio_data
    
    def text_to_speech(self, text, voice=None):
        """Synchronous wrapper for text to speech"""
        return asyncio.run(self.text_to_speech_async(text, voice))

# Initialize TTS service
tts_service = EdgeTTSService()

tts_service_global = tts_service

class TextToSpeechConverter:
    """
    Simple class to convert text to mp3 file using EdgeTTSService.
    Usage:
        converter = TextToSpeechConverter()
        mp3_path = converter.convert_text_to_mp3("Hello world!", voice="en-IN-PrabhatNeural")
    """
    def __init__(self, tts_service=None):
        self.tts_service = tts_service or tts_service_global

    def convert_text_to_mp3_bytes(self, text, voice=None):
        """
        Convert text to mp3 audio and return as bytes (does not save to disk)
        """
        if not EDGE_TTS_AVAILABLE:
            raise Exception("edge-tts not available. Install with: pip install edge-tts")
        if not text or len(text) > 2000:
            raise ValueError("Text must be non-empty and at most 2000 characters.")
        audio_data = self.tts_service.text_to_speech(text, voice)
        if not audio_data:
            raise Exception("Failed to generate audio.")
        return audio_data

# Example usage (uncomment to use as a script):
# if __name__ == "__main__":
#     converter = TextToSpeechConverter()
#     mp3_path = converter.convert_text_to_mp3("Hello world!", voice="en-IN-PrabhatNeural")
#     print("Generated MP3 file at:", mp3_path)