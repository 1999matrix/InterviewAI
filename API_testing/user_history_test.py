import requests
import json

# Define the base URL
base_url = "http://127.0.0.1:7777"

def test_get_user_history():
    """Test fetching all user history for a username"""
    print("=== Testing Get User History ===")
    
    username = "test_user"  # Replace with actual username from your database
    url = f"{base_url}/api/v1/get_user_history"
    params = {"username": username}
    
    try:
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            print(f"Total Records: {data.get('total_records', 0)}")
            
            # Show session IDs summary
            if data.get('data'):
                session_ids = [item['session_id'] for item in data['data']]
                print(f"Session IDs: {session_ids}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

def test_get_user_history_by_component():
    """Test fetching user history filtered by component type"""
    print("\n=== Testing Get User History by Component ===")
    
    username = "test_user"  # Replace with actual username
    component_type = "comp1"  # Options: comp1, comp2, comp3
    url = f"{base_url}/api/v1/get_user_history_by_component"
    params = {
        "username": username,
        "component_type": component_type
    }
    
    try:
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            print(f"Component: {component_type}, Records: {data.get('total_records', 0)}")
            
            # Show session IDs summary
            if data.get('data'):
                session_ids = [item['session_id'] for item in data['data']]
                print(f"Session IDs: {session_ids}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

def test_get_latest_user_result():
    """Test fetching the latest result for a user"""
    print("\n=== Testing Get Latest User Result ===")
    
    username = "t7"  # Replace with actual username
    url = f"{base_url}/api/v1/get_latest_user_result"
    params = {"username": username}
    
    try:
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            if data.get('data'):
                latest = data['data']
                print(f"Latest Result: Session {latest['session_id']} - {latest['component_type']} - {latest['percentage']}% on {latest['record_date']}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

def test_all_endpoints():
    """Test all user history endpoints"""
    print("Testing User History API Endpoints")
    print("=" * 50)
    
    # Test all endpoints
    test_get_user_history()
    test_get_user_history_by_component()
    test_get_latest_user_result()
    
    print("\nAll tests completed!")

if __name__ == "__main__":
    test_all_endpoints() 