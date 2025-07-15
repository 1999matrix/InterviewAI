import os
import json
import asyncio
from typing import Dict, Optional
from fastapi import WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import DictCursor
from src.component.comp3.start_test import QuestionFetcherComp3
from src.component.comp3.next import QuestionManagerComp3
from voice_models.eddge_tts.eddge_tts import TextToSpeechConverter
import logging
import base64

load_dotenv()
logger = logging.getLogger(__name__)

class WebSocketInterviewManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, Dict] = {}
        self.tts_converter = TextToSpeechConverter()
        
    async def connect(self, websocket: WebSocket, username: str):
        """Accept WebSocket connection and initialize user session"""
        await websocket.accept()
        self.active_connections[username] = websocket
        logger.info(f"WebSocket connected for user: {username}")
        
    async def disconnect(self, username: str):
        """Clean up user session on disconnect"""
        if username in self.active_connections:
            del self.active_connections[username]
        if username in self.user_sessions:
            del self.user_sessions[username]
        logger.info(f"WebSocket disconnected for user: {username}")
    
    async def send_message(self, username: str, message: dict):
        """Send message to specific user"""
        if username in self.active_connections:
            try:
                await self.active_connections[username].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {username}: {e}")
                await self.disconnect(username)
    
    async def broadcast_typing_indicator(self, username: str, is_typing: bool):
        """Send typing indicator to user"""
        await self.send_message(username, {
            "type": "typing",
            "is_typing": is_typing
        })
    
    async def start_interview_session(self, username: str, role: str, job_description: str, experience: str, cv_flag: bool = True):
        """Initialize interview session and send first question"""
        try:
            # Show typing indicator
            await self.broadcast_typing_indicator(username, True)
            
            # Initialize session
            fetcher = QuestionFetcherComp3(username, role, job_description, experience, cv_flag)
            result = fetcher.start_session()
            
            if 'error' in result:
                await self.send_message(username, {
                    "type": "error",
                    "message": result['error']
                })
                return
            
            # Store session info
            self.user_sessions[username] = {
                "role": role,
                "job_description": job_description,
                "experience": experience,
                "cv_flag": cv_flag,
                "status": "active"
            }
            
            # Generate audio for first question
            first_question = result['first_question']
            audio_bytes = await self.tts_converter.convert_text_to_mp3_bytes_async(first_question)
            
            # Stop typing indicator
            await self.broadcast_typing_indicator(username, False)
            
            # Send first question with audio
            message = {
                "type": "question",
                "text": first_question,
                "question_number": 1
            }
            
            if audio_bytes:
                # Convert audio to base64 for transmission
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                message["audio"] = audio_base64
            
            await self.send_message(username, message)
            
        except Exception as e:
            await self.broadcast_typing_indicator(username, False)
            await self.send_message(username, {
                "type": "error",
                "message": f"Failed to start interview: {str(e)}"
            })
    
    async def process_user_response(self, username: str, response_text: str):
        """Process user response and generate next question"""
        try:
            if username not in self.user_sessions:
                await self.send_message(username, {
                    "type": "error",
                    "message": "No active session found"
                })
                return
            
            # Show typing indicator while processing
            await self.broadcast_typing_indicator(username, True)
            
            # Process response using existing QuestionManagerComp3
            question_manager = QuestionManagerComp3()
            result = question_manager.process_response_and_get_next(username, response_text)
            
            if not result:
                await self.broadcast_typing_indicator(username, False)
                await self.send_message(username, {
                    "type": "error",
                    "message": "Failed to process response"
                })
                return
            
            # Check if interview is completed
            if result.get('status') == 'completed':
                await self.broadcast_typing_indicator(username, False)
                await self.send_message(username, {
                    "type": "completed",
                    "message": result.get('message', 'Interview completed successfully'),
                    "final_score": result.get('final_score'),
                    "summary": result.get('summary')
                })
                
                # Mark session as completed
                self.user_sessions[username]["status"] = "completed"
                return
            
            # Generate audio for next question
            next_question = result['next_question']
            audio_bytes = await self.tts_converter.convert_text_to_mp3_bytes_async(next_question)
            
            # Stop typing indicator
            await self.broadcast_typing_indicator(username, False)
            
            # Send next question
            message = {
                "type": "question",
                "text": next_question,
                "question_number": result.get('question_number', 'N/A'),
                "feedback": result.get('feedback'),
                "score": result.get('score')
            }
            
            if audio_bytes:
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                message["audio"] = audio_base64
            
            await self.send_message(username, message)
            
        except Exception as e:
            await self.broadcast_typing_indicator(username, False)
            await self.send_message(username, {
                "type": "error",
                "message": f"Failed to process response: {str(e)}"
            })
    
    async def handle_websocket_communication(self, websocket: WebSocket, username: str):
        """Main WebSocket communication handler"""
        await self.connect(websocket, username)
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                message_type = message.get("type")
                
                if message_type == "start_interview":
                    await self.start_interview_session(
                        username=username,
                        role=message.get("role"),
                        job_description=message.get("job_description"),
                        experience=message.get("experience"),
                        cv_flag=message.get("cv_flag", True)
                    )
                
                elif message_type == "user_response":
                    response_text = message.get("text", "").strip()
                    if response_text:
                        await self.process_user_response(username, response_text)
                    else:
                        await self.send_message(username, {
                            "type": "error",
                            "message": "Empty response received"
                        })
                
                elif message_type == "ping":
                    # Heartbeat to keep connection alive
                    await self.send_message(username, {"type": "pong"})
                
                elif message_type == "end_interview":
                    await self.send_message(username, {
                        "type": "interview_ended",
                        "message": "Interview session ended by user"
                    })
                    break
                
                else:
                    await self.send_message(username, {
                        "type": "error",
                        "message": f"Unknown message type: {message_type}"
                    })
                    
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for user: {username}")
        except Exception as e:
            logger.error(f"WebSocket error for user {username}: {e}")
        finally:
            await self.disconnect(username)

# Global instance
websocket_manager = WebSocketInterviewManager() 