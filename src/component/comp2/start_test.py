from src.utils import connect_to_db, extract_text_with_pdf
from src.model.local_model import llm_model
from src.model.OpenAI import llm_model
from src.model.groq import question_generator
import pandas as pd


class UserCVFetcher:
    def __init__(self, username, role, job_description, experience, cv):
        self.username = username
        self.role = role
        self.job_description = job_description
        self.experience = experience
        self.cv = bool(cv)  # Ensure cv is stored as a boolean
        self.user_session_table_2 = "user_session_table_2"  # Example table name

    def fetch_cv_from_db(self):
        """
        Fetches the user's CV from the database, generates questions from it,
        and returns a DataFrame of questions.
        """
        if not self.cv:
            return "CV fetching is disabled for this user."

        connection = connect_to_db()
        if connection is None:
            return "Failed to connect to the database."

        try:
            cursor = connection.cursor()
            query = "SELECT pdf_file FROM user_cv_table WHERE username = %s"
            cursor.execute(query, (self.username,))
            result = cursor.fetchone()

            if result is None or result[0] is None:
                return f"No CV found for username: {self.username}"

            # Extract the PDF binary data from the database result
            pdf_data = result[0]

            # Extract text from the in-memory PDF
            extract_text_instance = extract_text_with_pdf(pdf_data, self.username)
            extracted_text = extract_text_instance.extract_text_with_pymupdf()

            # Generate questions
            questions = question_generator(extracted_text)

            # Parse questions into a list (ensure it's not a single string)
            if isinstance(questions, str):
                questions = [q.strip("- ").strip() for q in questions.split("\n") if q.strip()]

            # Create a DataFrame of questions
            question_list = [{"question_id": idx + 1, "question": q} for idx, q in enumerate(questions)]
            df = pd.DataFrame(question_list)

            return df

        except Exception as e:
            print(f"An error occurred while fetching CV: {e}")
            return f"An error occurred while fetching CV: {e}"
        finally:
            if connection.is_connected():
                connection.close()

    def insert_questions_into_db(self, questions):
        """
        Inserts the questions into the user_session_table_2 table as a single row,
        with questions comma-separated and enclosed in triple quotes.
        """
        connection = connect_to_db()
        if connection is None:
            return "Failed to connect to the database."

        # Format questions into a single string with triple quotes and commas
        formatted_questions = ','.join([f'"""{q}"""' for q in questions])

        try:
            # Create a cursor object
            cursor = connection.cursor()

            # Prepare the SQL INSERT query
            query = f"""
                INSERT INTO {self.user_session_table_2} (username, question, response, result, response_count)
                VALUES (%s, %s, '', '', 0)
                """

            # Execute the query with parameters
            cursor.execute(query, (self.username, formatted_questions))

            # Commit the transaction
            connection.commit()

            print("Questions successfully inserted into the database.")

        except Exception as e:
            print(f"An error occurred while inserting questions: {e}")
            connection.rollback()

        finally:
            # Close the cursor
            cursor.close()
            connection.close()


if __name__ == "__main__":
    # Input data for testing
    username = 'user'
    role = "Data Scientist"
    job_description = "Analyze and build machine learning models"
    experience = 3
    cv_flag = True

    # Instantiate the UserCVFetcher class
    user_cv_fetcher = UserCVFetcher(
        username=username,
        role=role,
        job_description=job_description,
        experience=experience,
        cv=cv_flag
    )

    # Fetch CV and extract questions into a DataFrame
    result_df = user_cv_fetcher.fetch_cv_from_db()

    if isinstance(result_df, pd.DataFrame):
        print("\nDataFrame Result:\n")
        print(result_df)

        # Insert questions into the database
        user_cv_fetcher.insert_questions_into_db(result_df["question"].tolist())
    else:
        print("\nError:\n")
        print(result_df)
