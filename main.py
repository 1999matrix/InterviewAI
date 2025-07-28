from fastapi import FastAPI, HTTPException, Response, UploadFile, File, Form, Request, BackgroundTasks, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from src.component.comp1.start_test import QuestionFetcher
from src.component.comp1.next import QuestionManagerComp1
from src.component.comp1.text_to_db import TextAppender
from src.component.comp1.result import UserResultFetcherComp1  
from src.component.comp2.start_test import QuestionFetcherComp2
from src.component.comp2.result import UserResultFetcherComp2
from src.component.comp2.next import QuestionManagerComp2
from src.component.comp2.cv_to_db import UserCVHandler
from src.component.comp3.start_test import QuestionFetcherComp3
from src.component.comp3.next import QuestionManagerComp3
from src.component.comp3.websocket_interview import websocket_manager
from src.result_fetcher import UserHistoryFetcher
from dotenv import load_dotenv
from src.utils import create_database
from src.database_config.user_cv.user_cv_table import create_user_cv_table
from src.database_config.question_db.inserting_data_to_db import python_table_creation, insert_questions_from_excel
from src.database_config.user_manager.user_manager import create_user_history_table
from src.database_config.user_session.user_session_tables import create_user_test_info_table_1, create_user_test_info_table_2, create_user_test_info_table_3
import os
from voice_models.eddge_tts.eddge_tts import TextToSpeechConverter
import io
import base64
import tempfile
import asyncio
from datetime import datetime, timedelta
import time
import logging
from contextlib import asynccontextmanager
import psycopg2
from psycopg2 import pool

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiting settings
RATE_LIMIT_DURATION = 60  # seconds
MAX_REQUESTS_PER_MINUTE = 100
request_history: Dict[str, List[float]] = {}

# Database connection pool configuration
db_config = {
    'host': os.getenv('postgres_database_host'),
    'user': os.getenv('postgres_database_user'),
    'password': os.getenv('postgres_database_password'),
    'database': os.getenv('database_uq'),
    'port': os.getenv('postgres_database_port')
}

# Create connection pool
connection_pool = psycopg2.pool.SimpleConnectionPool(1, 5, **db_config)

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up application...")
    
    # Create database
    database_name = os.getenv("database_uq")
    if not database_name:
        logger.error("database_uq environment variable is not set")
        raise RuntimeError("database_uq environment variable is not set")
    create_database(database_name)
    
    try:
        # Create all necessary tables
        logger.info("Creating database tables...")
        create_user_cv_table()
        create_user_history_table()
        create_user_test_info_table_1()
        create_user_test_info_table_2()
        create_user_test_info_table_3()
        logger.info("Database tables created successfully")
        
        # Initialize EdgeTTSService
        logger.info("Initializing EdgeTTSService...")
        from voice_models.eddge_tts.eddge_tts import tts_service
        await tts_service.load_voices()
        logger.info("EdgeTTSService initialized successfully")
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")

app = FastAPI(lifespan=lifespan)



# Add middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Question-Text"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# Rate limiting dependency
async def check_rate_limit(request: Request):
    client_ip = request.client.host
    current_time = time.time()
    
    if client_ip not in request_history:
        request_history[client_ip] = []
    
    # Remove old requests
    request_history[client_ip] = [
        req_time for req_time in request_history[client_ip]
        if current_time - req_time < RATE_LIMIT_DURATION
    ]
    
    if len(request_history[client_ip]) >= MAX_REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )
    
    request_history[client_ip].append(current_time)

# Background task for cleanup
async def cleanup_old_sessions():
    while True:
        try:
            connection = connection_pool.get_connection()
            cursor = connection.cursor()
            
            # Delete sessions older than 24 hours
            cutoff_time = datetime.now() - timedelta(hours=24)
            tables = ['user_session_table_1', 'user_session_table_2', 'user_session_table_3']
            
            for table in tables:
                query = f"DELETE FROM {table} WHERE created_at < %s"
                cursor.execute(query, (cutoff_time,))
            
            connection.commit()
            
        except Exception as e:
            logger.error(f"Error in cleanup task: {e}")
        finally:
            if 'cursor' in locals():
                cursor.close()
            if 'connection' in locals():
                connection.close()
        
        await asyncio.sleep(3600)  # Run every hour

# Start background tasks
@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(cleanup_old_sessions())

# Define request models
class StartTestComp2Request(BaseModel):
    username: str
    role: str
    job_description: Optional[str] = ''
    experience: float
    cv: Optional[bool] = True

class NextQuestionComp3Request(BaseModel):
    username: str
    response: str

@app.get("/api/v1/start_test_comp1")
async def start_test_comp1(username: str, topic: str, level: str):
    try:
        question_id_fetcher_instance = QuestionFetcher(username, topic, level)
        question_id = question_id_fetcher_instance.fetch_questions()
    
        if question_id is not None:
            return {'question': str(question_id)}
        else:
            raise HTTPException(status_code=404, detail='No question assigned to user')

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/v1/get_next_question_id_comp1')
async def get_next_question_comp1(username: str, text: Optional[str] = None):
    if not username:
        raise HTTPException(status_code=400, detail='Username not provided')

    question_manager = QuestionManagerComp1()
    question_manager.text_db(username, text)
    next_question_id = question_manager.get_next_question_id(username)

    if next_question_id is not None:
        return {'next_question_id': next_question_id}
    else:
        return {'message': 'No more questions left for this user'}

@app.get('/api/v1/get_user_result_comp1')
async def get_user_result_api_comp1(username: str):
    if not username:
        raise HTTPException(status_code=400, detail="Username parameter is missing")

    fetcher = UserResultFetcherComp1()
    response_result = fetcher.get_user_result(username)
    
    if response_result is None:
        raise HTTPException(status_code=404, detail=f"No data found for username: {username}")

    return {"response_result": response_result}

@app.post('/api/v1/start_test_comp2')
async def handle_start_test_comp2(request: StartTestComp2Request):
    try:
        QuestionFetcherComp2_instance = QuestionFetcherComp2(
            request.username, request.role, request.job_description, 
            request.experience, request.cv
        )
        
        try:
            result = QuestionFetcherComp2_instance.generate_question_from_cv()
        except FileNotFoundError as fnf:
            raise HTTPException(status_code=404, detail=str(fnf))
        except ConnectionError:
            raise HTTPException(status_code=500, detail="Database connection error")
        except ValueError as ve:
            raise HTTPException(status_code=500, detail=str(ve))

        if result is None or result.empty:
            raise HTTPException(status_code=404, detail="No questions could be generated")

        questions = result['question'].tolist()
        first_question = QuestionFetcherComp2_instance.insert_questions_into_db(questions)

        # Generate audio for the first question
        tts_converter = TextToSpeechConverter()
        audio_bytes = await tts_converter.convert_text_to_mp3_bytes_async(str(first_question))
        
        if audio_bytes is None:
            raise HTTPException(status_code=500, detail="Failed to generate audio")

        # Return JSON with question text in body and audio as base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return JSONResponse(
            content={
                "question_text": str(first_question),
                "audio_data": audio_base64,
                "audio_type": "audio/mpeg"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/v1/get_next_question_comp2')
async def get_next_question_comp2(username: str, text: Optional[str] = None):
    if not username:
        raise HTTPException(status_code=400, detail='Username not provided')

    question_manager = QuestionManagerComp2()
    question_manager.text_db(username, text)
    next_question_id = question_manager.get_next_question_id_comp2(username)

    if next_question_id is not None:
        # Check if it's a completion status
        if isinstance(next_question_id, dict) and next_question_id.get('status') == 'completed':
            return {
                'status': 'completed',
                'message': next_question_id.get('message', 'Test completed successfully')
            }
        
        # Regular question - generate audio
        tts_converter = TextToSpeechConverter()
        audio_bytes = await tts_converter.convert_text_to_mp3_bytes_async(str(next_question_id))
        
        if audio_bytes is None:
            raise HTTPException(status_code=500, detail="Failed to generate audio")

        # Return JSON with question text in body and audio as base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return JSONResponse(
            content={
                "question_text": str(next_question_id),
                "audio_data": audio_base64,
                "audio_type": "audio/mpeg"
            }
        )
    else:
        return {'message': 'No more questions left for this user'}

@app.get('/api/v1/get_user_result_comp2')
async def get_user_result_api_comp2(username: str):
    if not username:
        raise HTTPException(status_code=400, detail="Username parameter is missing")

    fetcher = UserResultFetcherComp2()
    response_result = fetcher.get_user_result(username)
    
    if response_result is None:
        return {"message": "User result processed successfully."}

    return response_result

@app.post("/api/v1/upload_cv")
async def upload_cv(pdf_file: UploadFile = File(...), username: str = Form(...)):
    if not pdf_file.filename:
        raise HTTPException(status_code=400, detail="No selected file.")

    response = UserCVHandler.insert_user_cv(username, pdf_file.file)
    if response["status"] != "success":
        raise HTTPException(status_code=500, detail=response["message"])
    return response

@app.post("/api/v1/analyze_cv")
async def analyze_cv_endpoint(request: Request):
    try:
        data = await request.json()
        if not data or 'cv_text' not in data:
            raise HTTPException(status_code=400, detail="CV text is required")

        cv_text = data['cv_text']
        if not cv_text.strip():
            raise HTTPException(status_code=400, detail="CV text cannot be empty")

        from src.model.groq import analyze_cv
        analysis_result = analyze_cv(cv_text)
        
        return {
            "status": "success",
            "analysis": analysis_result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/v1/start_test_comp3')
async def handle_start_test_comp3(
    request: StartTestComp2Request,
    background_tasks: BackgroundTasks,
    _: None = Depends(check_rate_limit)
):
    try:
        fetcher = QuestionFetcherComp3(
            request.username, request.role, request.job_description,
            request.experience, request.cv
        )
        
        try:
            result = fetcher.start_session()
            if not result or 'first_question' not in result:
                raise HTTPException(status_code=500, detail="Failed to generate initial question")
            
            # Convert text to speech in background
            tts_converter = TextToSpeechConverter()
            audio_bytes = await tts_converter.convert_text_to_mp3_bytes_async(str(result['first_question']))
            
            if audio_bytes is None:
                raise HTTPException(status_code=500, detail="Failed to generate audio")

            # Log successful request
            background_tasks.add_task(
                logger.info,
                f"Successfully started test for user: {request.username}"
            )

            # Return JSON with question text in body and audio as base64
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            return JSONResponse(
                content={
                    "question_text": str(result['first_question']),
                    "audio_data": audio_base64,
                    "audio_type": "audio/mpeg"
                }
            )

        except FileNotFoundError as fnf:
            logger.error(f"File not found: {fnf}")
            raise HTTPException(status_code=404, detail=str(fnf))
        except Exception as e:
            logger.error(f"Error in start_session: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in handle_start_test_comp3: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/v1/get_next_question_comp3')
async def get_next_question_comp3(
    request: NextQuestionComp3Request,
    background_tasks: BackgroundTasks,
    _: None = Depends(check_rate_limit)
):
    try:
        if not request.username or not request.response:
            raise HTTPException(status_code=400, detail="Username and response are required")

        question_manager = QuestionManagerComp3()
        try:
            result = question_manager.process_response_and_get_next(
                request.username, request.response
            )

            if not result:
                raise HTTPException(status_code=500, detail="Failed to process response and get next question")

            if result.get('status') == 'completed':
                # Log completion in background
                background_tasks.add_task(
                    logger.info,
                    f"Test completed for user: {request.username}"
                )
                return {
                    'status': 'completed',
                    'message': result.get('message', 'Interview completed')
                }

            if 'next_question' not in result:
                raise HTTPException(status_code=500, detail="No next question available")

            tts_converter = TextToSpeechConverter()
            audio_bytes = await tts_converter.convert_text_to_mp3_bytes_async(str(result['next_question']))
            
            if audio_bytes is None:
                raise HTTPException(status_code=500, detail="Failed to generate audio")

            # Log successful response processing
            background_tasks.add_task(
                logger.info,
                f"Successfully processed response for user: {request.username}"
            )

            # Return JSON with question text in body and audio as base64
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            return JSONResponse(
                content={
                    "question_text": str(result['next_question']),
                    "audio_data": audio_base64,
                    "audio_type": "audio/mpeg"
                }
            )

        except Exception as e:
            logger.error(f"Error in process_response_and_get_next: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_next_question_comp3: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# User History API Endpoints
@app.get('/api/v1/get_user_history')
async def get_user_history_api(username: str):
    """
    Fetch all user history records based on username
    Returns: component_type, record_date, percentage, and report
    """
    if not username:
        raise HTTPException(status_code=400, detail="Username parameter is missing")
    
    try:
        fetcher = UserHistoryFetcher()
        result = fetcher.get_user_history(username)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/v1/get_user_history_by_component')
async def get_user_history_by_component_api(username: str, component_type: str):
    """
    Fetch user history records based on username and component type
    """
    if not username:
        raise HTTPException(status_code=400, detail="Username parameter is missing")
    if not component_type:
        raise HTTPException(status_code=400, detail="Component type parameter is missing")
    
    try:
        fetcher = UserHistoryFetcher()
        result = fetcher.get_user_history_by_component(username, component_type)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/v1/get_latest_user_result')
async def get_latest_user_result_api(username: str):
    """
    Fetch the latest/most recent result for a user
    """
    if not username:
        raise HTTPException(status_code=400, detail="Username parameter is missing")
    
    try:
        fetcher = UserHistoryFetcher()
        result = fetcher.get_latest_user_result(username)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time interview communication (comp3)
@app.websocket("/ws/interview_comp3/{username}")
async def websocket_interview_comp3(websocket: WebSocket, username: str):
    """
    WebSocket endpoint for real-time interview communication in comp3
    
    Message format (from client):
    {
        "type": "start_interview",
        "role": "Software Engineer",
        "job_description": "...",
        "experience": "3",
        "cv_flag": true
    }
    
    {
        "type": "user_response",
        "text": "My answer to the question..."
    }
    
    Message format (to client):
    {
        "type": "question",
        "text": "What is your experience with Python?",
        "audio": "base64_encoded_audio",
        "question_number": 1
    }
    
    {
        "type": "typing",
        "is_typing": true
    }
    
    {
        "type": "completed",
        "message": "Interview completed",
        "final_score": 85.5
    }
    """
    await websocket_manager.handle_websocket_communication(websocket, username)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    # creating database if not exist
    database_name = os.getenv("database_uq")
    create_database(database_name)

    # Define the path to the Excel file and the target table name
    question_file_path = "C:/Users/bhupe/Goal_77/src/database_config/question_db/questions.xlsx"
    question_table_name = os.getenv("question_table_name")

    # Create table and insert questions
    python_table_creation(question_table_name)
    insert_questions_from_excel(question_file_path, question_table_name)

    #creatuing CV schema
    create_user_cv_table()

    #creating user_history table
    create_user_history_table()

    #creating user_session table
    create_user_test_info_table_1()
    create_user_test_info_table_2()
    create_user_test_info_table_3()

    #running the app with uvicorn
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=7777)

