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
            # Initialize voices list but don't load them in constructor
            self.voices = []
    
    async def load_voices(self):
        """Load available voices"""
        if not self.voices:  # Only load if not already loaded
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
    def __init__(self):
        self.voice = "en-IN-PrabhatNeural"  # Default voice
        self.output_format = "mp3"

    async def convert_text_to_mp3_bytes_async(self, text):
        """Convert text to MP3 audio bytes asynchronously"""
        if not text:
            return None

        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
            temp_path = temp_file.name

        try:
            # Run the text-to-speech conversion
            communicate = edge_tts.Communicate(text, self.voice)
            await communicate.save(temp_path)

            # Read the audio file into bytes
            with open(temp_path, 'rb') as audio_file:
                audio_bytes = audio_file.read()

            return audio_bytes

        except Exception as e:
            print(f"Error converting text to speech: {e}")
            return None
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def convert_text_to_mp3_bytes(self, text):
        """Synchronous wrapper for convert_text_to_mp3_bytes_async"""
        if not text:
            return None

        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
            temp_path = temp_file.name

        try:
            # Create a new event loop for the async operation
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Run the async conversion in the new loop
            audio_bytes = loop.run_until_complete(self.convert_text_to_mp3_bytes_async(text))
            loop.close()
            
            return audio_bytes

        except Exception as e:
            print(f"Error converting text to speech: {e}")
            return None
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)

# Example usage (uncomment to use as a script):
# if __name__ == "__main__":
#     converter = TextToSpeechConverter()
#     mp3_path = converter.convert_text_to_mp3("Hello world!", voice="en-IN-PrabhatNeural")
#     print("Generated MP3 file at:", mp3_path)