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