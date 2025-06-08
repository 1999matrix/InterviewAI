from fastapi import FastAPI, HTTPException, Response, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
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
from dotenv import load_dotenv
from src.utils import create_database
from src.database_config.user_cv.user_cv_table import create_user_cv_table
from src.database_config.question_db.inserting_data_to_mysql import python_table_creation, insert_questions_from_excel
from src.database_config.user_manager.user_manager import create_user_history_table
from src.database_config.user_session.user_session_tables import create_user_test_info_table_1, create_user_test_info_table_2, create_user_test_info_table_3
import os
from voice_models.eddge_tts.eddge_tts import TextToSpeechConverter
import io
import base64
import tempfile

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize EdgeTTSService during startup
    from voice_models.eddge_tts.eddge_tts import tts_service
    await tts_service.load_voices()

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

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=question.mp3",
                "X-Question-Text": str(first_question)
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
        tts_converter = TextToSpeechConverter()
        audio_bytes = await tts_converter.convert_text_to_mp3_bytes_async(str(next_question_id))
        
        if audio_bytes is None:
            raise HTTPException(status_code=500, detail="Failed to generate audio")

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=question.mp3",
                "X-Question-Text": str(next_question_id)
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
async def handle_start_test_comp3(request: StartTestComp2Request):
    try:
        fetcher = QuestionFetcherComp3(
            request.username, request.role, request.job_description,
            request.experience, request.cv
        )
        try:
            result = fetcher.start_session()
            if not result or 'question' not in result:
                raise HTTPException(status_code=500, detail="Failed to generate initial question")
                
            tts_converter = TextToSpeechConverter()
            audio_bytes = await tts_converter.convert_text_to_mp3_bytes_async(str(result['question']))
            
            if audio_bytes is None:
                raise HTTPException(status_code=500, detail="Failed to generate audio")

            return StreamingResponse(
                io.BytesIO(audio_bytes),
                media_type="audio/mpeg",
                headers={
                    "Content-Disposition": "attachment; filename=question.mp3",
                    "X-Question-Text": str(result['question'])
                }
            )

        except FileNotFoundError as fnf:
            raise HTTPException(status_code=404, detail=str(fnf))
        except Exception as e:
            print(f"Error in start_session: {str(e)}")  # Add logging
            raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in handle_start_test_comp3: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/v1/get_next_question_comp3')
async def get_next_question_comp3(request: NextQuestionComp3Request):
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

            return StreamingResponse(
                io.BytesIO(audio_bytes),
                media_type="audio/mpeg",
                headers={
                    "Content-Disposition": "attachment; filename=question.mp3",
                    "X-Question-Text": str(result['next_question'])
                }
            )

        except Exception as e:
            print(f"Error in process_response_and_get_next: {str(e)}")  # Add logging
            raise HTTPException(status_code=500, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in get_next_question_comp3: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

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

