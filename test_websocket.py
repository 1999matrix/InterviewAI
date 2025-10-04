#!/usr/bin/env python3
"""
Simple test script to check WebSocket manager functionality
"""

import asyncio
import sys
import os

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

async def test_websocket_manager():
    """Test if WebSocket manager can be imported and initialized"""
    try:
        print("Testing WebSocket manager import...")
        
        # Try to import the WebSocket manager
        from src.component.comp3.websocket_interview import websocket_manager
        
        print("✓ WebSocket manager imported successfully")
        print(f"Manager type: {type(websocket_manager)}")
        print(f"Active connections: {len(websocket_manager.active_connections)}")
        print(f"User sessions: {len(websocket_manager.user_sessions)}")
        
        # Test TTS converter
        print("\nTesting TTS converter...")
        tts = websocket_manager.tts_converter
        print(f"TTS converter type: {type(tts)}")
        print(f"Default voice: {tts.voice}")
        
        print("\n✓ All tests passed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_dependencies():
    """Test if all required dependencies are available"""
    print("Testing dependencies...")
    
    try:
        import edge_tts
        print("✓ edge-tts available")
    except ImportError:
        print("❌ edge-tts not available")
    
    try:
        import psycopg2
        print("✓ psycopg2 available")
    except ImportError:
        print("❌ psycopg2 not available")
    
    try:
        from src.component.comp3.start_test import QuestionFetcherComp3
        print("✓ QuestionFetcherComp3 available")
    except ImportError as e:
        print(f"❌ QuestionFetcherComp3 not available: {e}")
    
    try:
        from src.component.comp3.next import QuestionManagerComp3
        print("✓ QuestionManagerComp3 available")
    except ImportError as e:
        print(f"❌ QuestionManagerComp3 not available: {e}")

if __name__ == "__main__":
    print("WebSocket Manager Test")
    print("=" * 50)
    
    # Test dependencies first
    asyncio.run(test_dependencies())
    
    print("\n" + "=" * 50)
    
    # Test WebSocket manager
    success = asyncio.run(test_websocket_manager())
    
    if success:
        print("\n🎉 All tests passed! WebSocket manager is working correctly.")
    else:
        print("\n💥 Tests failed! There are issues with the WebSocket manager.")
        sys.exit(1)
