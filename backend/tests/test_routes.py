import pytest
from fastapi.testclient import TestClient
from src.main import app  # Assuming main.py is in the root
from src.core.document_processor import ProcessingResult

# Create a test client
client = TestClient(app)

@pytest.mark.asyncio
async def test_create_session():
    response = client.post("/sessions", json={"file_paths": ["https://example.com"]})
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert isinstance(data["successful_documents"], list)
    assert isinstance(data["failed_documents"], list)

@pytest.mark.asyncio
async def test_query_session(monkeypatch):
    # Mock session creation
    session_id = "test-session"
    from src.api.routes import sessions, RAGSystem
    rag = RAGSystem()
    docs = [ProcessingResult(success=True, content="Test content", metadata={"path": "test.txt"})]
    await rag.ingest_documents(docs)
    sessions[session_id] = {"rag": rag, "docs": docs}
    
    response = client.post(f"/sessions/{session_id}/query", json={"query": "What is the content?"})
    assert response.status_code == 200
    assert "Test content" in response.json()["answer"]

@pytest.mark.asyncio
async def test_query_invalid_session():
    response = client.post("/sessions/invalid-session/query", json={"query": "What?"})
    assert response.status_code == 404
    assert "Session not found" in response.json()["detail"]

@pytest.mark.asyncio
async def test_list_models():
    response = client.get("/models")
    assert response.status_code == 200
    models = response.json()["models"]
    assert len(models) > 0
    assert any(m["name"] == "llama-3.3-70b-versatile" for m in models)