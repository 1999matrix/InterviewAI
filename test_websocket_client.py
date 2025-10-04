#!/usr/bin/env python3
"""
Simple WebSocket test client for testing the interview endpoint
"""

import asyncio
import websockets
import json
import sys

async def test_websocket_connection():
    """Test WebSocket connection to the interview endpoint"""
    uri = "ws://localhost:7777/ws/interview_comp3/test_user"
    
    try:
        print(f"Connecting to {uri}...")
        
        async with websockets.connect(uri) as websocket:
            print("✓ Connected successfully!")
            
            # Send a start interview message
            start_message = {
                "type": "start_interview",
                "role": "Software Engineer",
                "job_description": "We are looking for a Python developer with 3+ years of experience",
                "experience": "3",
                "cv_flag": True
            }
            
            print(f"Sending message: {start_message}")
            await websocket.send(json.dumps(start_message))
            
            # Wait for response
            print("Waiting for response...")
            response = await websocket.recv()
            print(f"Received: {response}")
            
            # Parse response
            try:
                response_data = json.loads(response)
                if response_data.get("type") == "question":
                    print("✓ Interview started successfully!")
                    print(f"Question: {response_data.get('text', 'No question text')}")
                    print(f"Question number: {response_data.get('question_number', 'N/A')}")
                    
                    # Send a test response
                    test_response = {
                        "type": "user_response",
                        "text": "I have 3 years of experience with Python, including web development with Django and Flask."
                    }
                    
                    print(f"Sending response: {test_response}")
                    await websocket.send(json.dumps(test_response))
                    
                    # Wait for next question
                    print("Waiting for next question...")
                    next_response = await websocket.recv()
                    print(f"Next response: {next_response}")
                    
                else:
                    print(f"Unexpected response type: {response_data.get('type')}")
                    
            except json.JSONDecodeError:
                print(f"Failed to parse response as JSON: {response}")
                
    except websockets.exceptions.ConnectionRefused:
        print("❌ Connection refused. Make sure the server is running on port 7777")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

async def test_simple_connection():
    """Test simple WebSocket connection without sending messages"""
    uri = "ws://localhost:7777/ws/interview_comp3/test_user"
    
    try:
        print(f"Testing simple connection to {uri}...")
        
        async with websockets.connect(uri) as websocket:
            print("✓ Simple connection successful!")
            
            # Send ping
            ping_message = {"type": "ping"}
            await websocket.send(json.dumps(ping_message))
            
            # Wait for pong
            response = await websocket.recv()
            print(f"Ping response: {response}")
            
            return True
            
    except Exception as e:
        print(f"❌ Simple connection failed: {e}")
        return False

if __name__ == "__main__":
    print("WebSocket Client Test")
    print("=" * 50)
    
    # Test simple connection first
    simple_success = asyncio.run(test_simple_connection())
    
    if simple_success:
        print("\n" + "=" * 50)
        print("Testing full interview flow...")
        
        # Test full interview flow
        full_success = asyncio.run(test_websocket_connection())
        
        if full_success:
            print("\n🎉 All WebSocket tests passed!")
        else:
            print("\n💥 Full interview test failed!")
            sys.exit(1)
    else:
        print("\n💥 Simple connection test failed!")
        sys.exit(1)
