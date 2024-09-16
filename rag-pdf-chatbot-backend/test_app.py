# this script is used to test backend of the chatbot
# it will automatically run during the CI (Continous Integration)

from fastapi.testclient import TestClient
from main_websockets import app  # Import the FastAPI app from main_websockets.py
from unittest.mock import patch

client = TestClient(app)

# This test simulates a file upload request to the /upload_pdfs/ endpoint, sending a file named "example.pdf"

@patch("main_websockets.extract_text_from_pdf", return_value="Mocked PDF text")
def test_upload_pdfs(mock_extract_text):
    # a dummy example.pdf is created with content : "Some content" and is uploaded to the backend
    response = client.post("/upload_pdfs/", files={"files": ("example.pdf", b"Some content")})
    assert response.status_code == 200
    assert response.json() == {"status": "PDFs processed successfully!"}

