import os
import psycopg2
from psycopg2 import Error
from psycopg2.extras import DictCursor
from src.utils import connect_to_db
from dotenv import load_dotenv

load_dotenv()

class UserHistoryFetcher:
    def __init__(self):
        self.user_history_table = os.getenv("user_history_table")
        
    def get_user_history(self, username: str):
        """
        Fetch user history data based on username
        Returns: component_type, record_date, percentage, and report
        """
        connection = connect_to_db()
        if connection is None:
            return {"error": "Failed to connect to database"}
        
        try:
            cursor = connection.cursor(cursor_factory=DictCursor)
            
            # Query to fetch required fields based on username
            query = f"""
                SELECT session_id, component_type, record_date, percentage, report 
                FROM {self.user_history_table} 
                WHERE username = %s 
                ORDER BY record_date DESC
            """
            
            cursor.execute(query, (username,))
            results = cursor.fetchall()
            
            if not results:
                return {
                    "message": f"No history found for username: {username}",
                    "data": []
                }
            
            # Convert results to list of dictionaries
            history_data = []
            for row in results:
                history_data.append({
                    "session_id": row['session_id'],
                    "component_type": row['component_type'],
                    "record_date": row['record_date'].isoformat() if row['record_date'] else None,
                    "percentage": float(row['percentage']) if row['percentage'] else None,
                    "report": row['report']
                })
            
            return {
                "message": "User history retrieved successfully",
                "username": username,
                "total_records": len(history_data),
                "data": history_data
            }
            
        except psycopg2.Error as error:
            return {"error": f"Database error: {str(error)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    
    def get_user_history_by_component(self, username: str, component_type: str):
        """
        Fetch user history data based on username and component type
        """
        connection = connect_to_db()
        if connection is None:
            return {"error": "Failed to connect to database"}
        
        try:
            cursor = connection.cursor(cursor_factory=DictCursor)
            
            query = f"""
                SELECT session_id, component_type, record_date, percentage, report 
                FROM {self.user_history_table} 
                WHERE username = %s AND component_type = %s 
                ORDER BY record_date DESC
            """
            
            cursor.execute(query, (username, component_type))
            results = cursor.fetchall()
            
            if not results:
                return {
                    "message": f"No history found for username: {username} in component: {component_type}",
                    "data": []
                }
            
            history_data = []
            for row in results:
                history_data.append({
                    "session_id": row['session_id'],
                    "component_type": row['component_type'],
                    "record_date": row['record_date'].isoformat() if row['record_date'] else None,
                    "percentage": float(row['percentage']) if row['percentage'] else None,
                    "report": row['report']
                })
            
            return {
                "message": "User history retrieved successfully",
                "username": username,
                "component_type": component_type,
                "total_records": len(history_data),
                "data": history_data
            }
            
        except psycopg2.Error as error:
            return {"error": f"Database error: {str(error)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    
    def get_latest_user_result(self, username: str):
        """
        Fetch the latest/most recent result for a user
        """
        connection = connect_to_db()
        if connection is None:
            return {"error": "Failed to connect to database"}
        
        try:
            cursor = connection.cursor(cursor_factory=DictCursor)
            
            query = f"""
                SELECT session_id, component_type, record_date, percentage, report 
                FROM {self.user_history_table} 
                WHERE username = %s 
                ORDER BY record_date DESC 
                LIMIT 1
            """
            
            cursor.execute(query, (username,))
            result = cursor.fetchone()
            
            if not result:
                return {
                    "message": f"No history found for username: {username}",
                    "data": None
                }
            
            latest_result = {
                "session_id": result['session_id'],
                "component_type": result['component_type'],
                "record_date": result['record_date'].isoformat() if result['record_date'] else None,
                "percentage": float(result['percentage']) if result['percentage'] else None,
                "report": result['report']
            }
            
            return {
                "message": "Latest user result retrieved successfully",
                "username": username,
                "data": latest_result
            }
            
        except psycopg2.Error as error:
            return {"error": f"Database error: {str(error)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_result_by_session_id(self, session_id: str):
        """
        Fetch user history record by session_id
        Returns: session_id, component_type, record_date, percentage, report, username, user_id
        """
        connection = connect_to_db()
        if connection is None:
            return {"error": "Failed to connect to database"}
        try:
            cursor = connection.cursor(cursor_factory=DictCursor)
            query = f"""
                SELECT session_id, component_type, record_date, percentage, report, username, user_id
                FROM {self.user_history_table}
                WHERE session_id = %s
                LIMIT 1
            """
            cursor.execute(query, (session_id,))
            result = cursor.fetchone()
            if not result:
                return {
                    "message": f"No result found for session_id: {session_id}",
                    "data": None
                }
            record = {
                "session_id": result['session_id'],
                "component_type": result['component_type'],
                "record_date": result['record_date'].isoformat() if result['record_date'] else None,
                "percentage": float(result['percentage']) if result['percentage'] else None,
                "report": result['report'],
                "username": result['username'],
                "user_id": result['user_id']
            }
            return {
                "message": "Result fetched by session_id successfully",
                "session_id": session_id,
                "data": record
            }
        except psycopg2.Error as error:
            return {"error": f"Database error: {str(error)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
