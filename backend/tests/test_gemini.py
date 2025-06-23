import unittest
import os
from google import genai
from dotenv import load_dotenv
from typing import Any

load_dotenv()

class GeminiAPITests(unittest.TestCase):
    '''
    Test class for Gemini API functionality.
    '''
    
    def setUp(self) -> None:
        '''
        Set up test cases by starting the gemini client
        '''
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key)

    def test_api_connection(self) -> None:
        '''
        Test that you can connect to the gemini API and get a response
        '''
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents="book book book"
            )
            self.assertIsNotNone(response)
            self.assertIsNotNone(response.text)
        except Exception as e:
            self.fail(f"Failed to connect to Gemini API: {str(e)}")

    def test_text_generation(self) -> None:
        '''
        Test that you can generate text with the gemini API
        '''
        prompt = "book book book"
        response = self.client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
        
        self.assertIsNotNone(response.text)
        self.assertIsInstance(response.text, str)
        self.assertTrue(len(response.text) > 0)

if __name__ == "__main__":
    unittest.main()
