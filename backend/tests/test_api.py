import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add project root to path so we can import backend packages
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.main import app
from backend.database.connection import Base, engine

# Ensure clean DB for testing
@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    # We can clean up tables if we want, but since it's testing
    # we'll keep it simple

client = TestClient(app)

# Test Variables
TEST_EMAIL = "test_user@cardio.com"
TEST_PASSWORD = "password123"
TEST_NAME = "Test Cardio Patient"
auth_headers = {}

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_user():
    # Delete test user if exists from a previous run to avoid collision
    # (Since this is a simple local SQLite file)
    response = client.post(
        "/api/auth/register",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "full_name": TEST_NAME}
    )
    # Could be 201 or 400 (if already registered, which is fine)
    assert response.status_code in {201, 400}
    if response.status_code == 201:
        data = response.json()
        assert data["email"] == TEST_EMAIL
        assert data["full_name"] == TEST_NAME

def test_login_user():
    response = client.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Store token for subsequent requests
    global auth_headers
    auth_headers = {"Authorization": f"Bearer {data['access_token']}"}

def test_get_me():
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == TEST_EMAIL
    assert data["full_name"] == TEST_NAME

def test_chatbot_message():
    response = client.post(
        "/api/chatbot/",
        json={"message": "I am experiencing symptoms of coronary artery disease, what should I do?"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["sender"] == "bot"
    assert "Coronary Artery Disease" in data["message"]
    assert "Disclaimer:" in data["message"]

def test_get_chatbot_history():
    response = client.get("/api/chatbot/history", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2  # User message and Bot reply

def test_get_settings():
    response = client.get("/api/settings/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "dark_mode" in data
    assert "email_notifications" in data

def test_update_settings():
    response = client.put(
        "/api/settings/",
        json={"dark_mode": True, "email_notifications": False, "weekly_reports": True},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["dark_mode"] is True
    assert data["email_notifications"] is False
    assert data["weekly_reports"] is True

def test_dashboard_stats():
    response = client.get("/api/dashboard/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_predictions" in data
    assert "reports_generated" in data
    assert "accuracy_score" in data
    assert "disease_distribution" in data
    assert "prediction_trends" in data
