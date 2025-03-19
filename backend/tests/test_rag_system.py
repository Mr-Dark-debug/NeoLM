import pytest
from src.core.rag_system import RAGSystem
from src.core.document_processor import ProcessingResult

@pytest.mark.asyncio
async def test_ingest_documents():
    rag = RAGSystem()
    docs = [
        ProcessingResult(success=True, content="Test content", metadata={"path": "test.txt", "type": "document"})
    ]
    await rag.ingest_documents(docs)
    assert rag.vector_store is not None
    assert len(rag.document_metadata) == 1
    assert "test.txt" in rag.get_ingested_documents_info()

@pytest.mark.asyncio
async def test_query_no_documents():
    rag = RAGSystem()
    answer = await rag.query("What is this?")
    assert "No documents loaded" in answer

@pytest.mark.asyncio
async def test_query_with_documents():
    rag = RAGSystem()
    docs = [
        ProcessingResult(success=True, content="The sky is blue.", metadata={"path": "sky.txt", "type": "document"})
    ]
    await rag.ingest_documents(docs)
    answer = await rag.query("What color is the sky?")
    assert "blue" in answer.lower()