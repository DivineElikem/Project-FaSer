import json
from fastapi.testclient import TestClient
from app.main import app
    
client = TestClient(app)

def test_create_and_read_user():
    # Create user    
    response = client.post("/users/", json={"name": "Alice", "password": "secret"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Alice"

    # Read users
    response = client.get("/users/")
    assert response.status_code == 200
    users = response.json()
    assert any(u["name"] == "Alice" for u in users)
