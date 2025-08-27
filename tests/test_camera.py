import base64
import json
from fastapi.testclient import TestClient
from app.main import app
    
client = TestClient(app)

def test_stream_endpoint():
    response = client.get("/camera/stream")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("multipart/x-mixed-replace")
