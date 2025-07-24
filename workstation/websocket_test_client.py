import asyncio
import websockets
import json
import base64
import os
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InterviewWebSocketClient:
    def __init__(self, server_url="ws://localhost:7777", username="test_user"):
        self.server_url = server_url
        self.username = username
        self.websocket = None
        self.connected = False
        
    async def connect(self):
        """Connect to the WebSocket server"""
        try:
            uri = f"{self.server_url}/ws/interview_comp3/{self.username}"
            self.websocket = await websockets.connect(uri)
            self.connected = True
            print(f"✅ Connected to {uri}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect: {e}")
            self.connected = False
            return False
    
    async def send_message(self, message):
        """Send a message to the server"""
        if self.websocket and self.connected:
            try:
                await self.websocket.send(json.dumps(message))
                print(f"📤 Sent: {message['type']}")
            except Exception as e:
                print(f"❌ Error sending message: {e}")
                self.connected = False
    
    async def receive_message(self):
        """Receive a message from the server"""
        if self.websocket and self.connected:
            try:
                message = await self.websocket.recv()
                return json.loads(message)
            except websockets.exceptions.ConnectionClosed:
                print("🔌 Connection closed by server")
                self.connected = False
                return None
            except Exception as e:
                print(f"❌ Error receiving message: {e}")
                self.connected = False
                return None
        return None
    
    async def start_interview(self, role="Software Engineer", job_description="Python developer position", experience="3"):
        """Start the interview session"""
        message = {
            "type": "start_interview",
            "role": role,
            "job_description": job_description,
            "experience": experience,
            "cv_flag": True
        }
        await self.send_message(message)
    
    async def send_response(self, response_text):
        """Send user response to a question"""
        message = {
            "type": "user_response",
            "text": response_text
        }
        await self.send_message(message)
    
    async def save_audio(self, audio_base64, filename):
        """Save base64 encoded audio to a file"""
        try:
            audio_data = base64.b64decode(audio_base64)
            with open(filename, 'wb') as f:
                f.write(audio_data)
            print(f"🎵 Audio saved to {filename}")
        except Exception as e:
            print(f"❌ Failed to save audio: {e}")
    
    async def handle_message(self, message):
        """Handle incoming messages from the server"""
        msg_type = message.get('type')
        
        if msg_type == 'question':
            print(f"\n🤖 Question {message.get('question_number', '?')}: {message['text']}")
            
            # Save audio if present
            if 'audio' in message:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"question_{timestamp}.mp3"
                await self.save_audio(message['audio'], filename)
            
            # Show feedback and score if available
            if 'feedback' in message and message['feedback']:
                print(f"📝 Feedback: {message['feedback']}")
            if 'score' in message and message['score']:
                print(f"📊 Score: {message['score']}")
                
            return True  # Continue interview
            
        elif msg_type == 'typing':
            if message['is_typing']:
                print("⏳ AI is thinking...")
            else:
                print("✅ AI finished thinking")
                
        elif msg_type == 'completed':
            print(f"\n🎉 Interview Completed!")
            print(f"📝 Message: {message['message']}")
            if 'final_score' in message:
                print(f"📊 Final Score: {message['final_score']}")
            if 'summary' in message:
                print(f"📋 Summary: {message['summary']}")
            return False  # End interview
            
        elif msg_type == 'error':
            print(f"❌ Error: {message['message']}")
            return False
            
        elif msg_type == 'pong':
            print("💓 Heartbeat received")
            
        elif msg_type == 'interview_ended':
            print(f"🏁 {message['message']}")
            return False
            
        return True
    
    async def send_ping(self):
        """Send a ping to keep connection alive"""
        await self.send_message({"type": "ping"})
    
    async def end_interview(self):
        """End the interview session"""
        await self.send_message({"type": "end_interview"})
    
    async def close(self):
        """Close the WebSocket connection"""
        if self.websocket:
            await self.websocket.close()
            self.connected = False
            print("🔌 Connection closed")

async def run_automated_interview():
    """Run an automated interview demo with predefined responses"""
    print("\n🤖 Starting Automated Interview Demo")
    print("=" * 50)
    
    client = InterviewWebSocketClient(username=f"auto_user_{datetime.now().strftime('%H%M%S')}")
    
    # Sample responses for demo
    sample_responses = [
        "I have 3 years of experience working with Python, focusing on web development with Flask and Django. I've built REST APIs and worked with databases.",
        "I'm proficient in SQL and have worked with PostgreSQL and MySQL. I've designed database schemas for e-commerce applications and optimized queries for better performance.",
        "Yes, I've used Git extensively for version control in all my projects. I'm comfortable with branching strategies, merging, resolving conflicts, and code reviews.",
        "I've worked with RESTful APIs using Flask-RESTful and FastAPI. I've also integrated third-party APIs and have experience with API documentation using Swagger.",
        "I follow PEP 8 standards and use tools like pylint and black for code formatting. I also write comprehensive unit tests using pytest and practice TDD.",
        "I've worked with Docker for containerization and have experience with CI/CD pipelines using GitHub Actions. I also use virtual environments for dependency management.",
        "I'm familiar with design patterns like Singleton, Factory, and Observer. I also understand SOLID principles and try to write clean, maintainable code.",
        "I have experience with both SQL and NoSQL databases. I've used PostgreSQL for relational data and MongoDB for document storage in different projects."
    ]
    
    if not await client.connect():
        return
    
    try:
        # Start the interview
        await client.start_interview(
            role="Senior Python Developer",
            job_description="We need a senior Python developer with experience in web development, databases, API design, and modern development practices.",
            experience="3"
        )
        
        response_index = 0
        interview_active = True
        
        while interview_active and client.connected:
            # Receive message from server
            message = await client.receive_message()
            if not message:
                break
                
            # Handle the message
            interview_active = await client.handle_message(message)
            
            # If it's a question, send a response after a short delay
            if message.get('type') == 'question' and interview_active:
                await asyncio.sleep(3)  # Simulate thinking time
                
                if response_index < len(sample_responses):
                    response = sample_responses[response_index]
                    print(f"\n👤 Your Response: {response}")
                    await client.send_response(response)
                    response_index += 1
                else:
                    print("\n👤 No more sample responses, ending interview...")
                    await client.end_interview()
                    break
                    
    except KeyboardInterrupt:
        print("\n⚠️ Interview interrupted by user")
        await client.end_interview()
    except Exception as e:
        print(f"❌ Error during interview: {e}")
    finally:
        await client.close()

async def run_interactive_interview():
    """Run an interactive interview where user types responses"""
    print("\n👤 Starting Interactive Interview")
    print("=" * 50)
    
    username = input("Enter username (or press Enter for default): ").strip()
    if not username:
        username = f"interactive_user_{datetime.now().strftime('%H%M%S')}"
    
    client = InterviewWebSocketClient(username=username)
    
    if not await client.connect():
        return
    
    try:
        # Get interview details from user
        print("\n📝 Interview Setup:")
        role = input("Enter role (default: Software Engineer): ").strip() or "Software Engineer"
        experience = input("Enter years of experience (default: 3): ").strip() or "3"
        job_description = input("Enter job description (or press Enter for default): ").strip() or \
                         "Looking for a skilled developer with strong technical background"
        
        print(f"\n🚀 Starting interview for {role} position...")
        
        # Start the interview
        await client.start_interview(role, job_description, experience)
        
        interview_active = True
        
        while interview_active and client.connected:
            # Receive message from server
            message = await client.receive_message()
            if not message:
                break
                
            # Handle the message
            interview_active = await client.handle_message(message)
            
            # If it's a question, get user response
            if message.get('type') == 'question' and interview_active:
                print("\n" + "="*50)
                print("💭 Take your time to think and respond...")
                response = input("👤 Your Response (or type 'quit' to end): ").strip()
                
                if response.lower() in ['quit', 'exit', 'end', 'stop']:
                    await client.end_interview()
                    break
                elif response:
                    await client.send_response(response)
                else:
                    print("⚠️ Empty response, please try again...")
                    
    except KeyboardInterrupt:
        print("\n⚠️ Interview interrupted by user")
        await client.end_interview()
    except Exception as e:
        print(f"❌ Error during interview: {e}")
    finally:
        await client.close()

async def run_connection_test():
    """Test basic WebSocket connection"""
    print("\n🔧 Testing WebSocket Connection")
    print("=" * 50)
    
    client = InterviewWebSocketClient(username="connection_test")
    
    if await client.connect():
        print("✅ Connection successful!")
        
        # Test ping
        await client.send_ping()
        await asyncio.sleep(1)
        
        # Receive pong
        message = await client.receive_message()
        if message and message.get('type') == 'pong':
            print("✅ Ping-pong test successful!")
        
        await client.close()
    else:
        print("❌ Connection failed!")

async def main():
    """Main function to choose test type"""
    print("🎯 WebSocket Interview Test Client")
    print("Make sure your FastAPI server is running on localhost:7777")
    print("-" * 60)
    
    print("Choose test mode:")
    print("1. 🔧 Connection Test")
    print("2. 🤖 Automated Demo (with sample responses)")
    print("3. 👤 Interactive Demo (type your own responses)")
    print("4. 🏃 Quick Test (automated with faster responses)")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == "1":
        await run_connection_test()
    elif choice == "2":
        await run_automated_interview()
    elif choice == "3":
        await run_interactive_interview()
    elif choice == "4":
        # Quick test with shorter responses
        print("\n⚡ Quick Test Mode")
        client = InterviewWebSocketClient(username="quick_test")
        if await client.connect():
            await client.start_interview("Developer", "Quick test position", "2")
            
            # Send a few quick responses
            quick_responses = [
                "I have experience with Python",
                "I know SQL and databases",
                "Yes, I use Git regularly"
            ]
            
            for i, response in enumerate(quick_responses):
                message = await client.receive_message()
                if message and message.get('type') == 'question':
                    await client.handle_message(message)
                    print(f"👤 Quick Response {i+1}: {response}")
                    await client.send_response(response)
                    await asyncio.sleep(1)
                elif message and message.get('type') == 'completed':
                    await client.handle_message(message)
                    break
            
            await client.close()
    else:
        print("Invalid choice. Running connection test...")
        await run_connection_test()

if __name__ == "__main__":
    print("🚀 WebSocket Interview Test Client")
    print("📡 Testing comp3 WebSocket endpoint")
    print("-" * 60)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Test session ended by user. Goodbye!")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        logger.exception("Full error details:")
    
    print("\n✨ Test session completed!") 