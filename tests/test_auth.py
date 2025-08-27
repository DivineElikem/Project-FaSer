import json
from fastapi.testclient import TestClient
from app.main import app
    
client = TestClient(app)

def test_login_invalid():

    response = client.post("/auth/token", data={"username": "foo", "password": "bar"})
    assert response.status_code == 200