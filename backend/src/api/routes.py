from fastapi import APIRouter, HTTPException, UploadFile, File
import uuid
import os
from src.core.document_processor import DocumentProcessor
from src.core.rag_system import RAGSystem
from src.core.podcast_generator import PodcastProcessor
from src.core.model_manager import ModelManager
from src.api.schemas import (
    SessionResponse, QueryRequest, QueryResponse,
    PodcastRequest, PodcastResponse, ModelSwitchRequest, ModelSwitchResponse
)
from src.utils.logging import logger
from typing import List

router = APIRouter()
sessions = {}  # In-memory session store; consider a persistent store for production
processor = DocumentProcessor()
model_manager = ModelManager()
podcast_processor = PodcastProcessor()

@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    files: List[UploadFile] = File(...),
    model_name: str = "llama-3.3-70b-versatile"
):
    """
    Create a new session by processing uploaded files and initializing a RAG system.
    """
    try:
        # Save uploaded files to temporary directory
        temp_dir = "tmp"
        os.makedirs(temp_dir, exist_ok=True)
        file_paths = []
        
        for file in files:
            temp_path = os.path.join(temp_dir, file.filename)
            with open(temp_path, "wb") as f:
                f.write(await file.read())
            file_paths.append(temp_path)

        # Process the files
        results = await processor.process_files(file_paths)
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]

        # Initialize RAG system
        rag = RAGSystem(model_name)
        if successful:
            await rag.ingest_documents(successful)

        # Store session
        session_id = str(uuid.uuid4())
        sessions[session_id] = {"rag": rag, "docs": successful}
        logger.info(f"Session {session_id} created with {len(successful)} documents")

        # Clean up temporary files
        for path in file_paths:
            if os.path.exists(path):
                os.remove(path)

        return SessionResponse(
            session_id=session_id,
            successful_documents=[r.metadata for r in successful],
            failed_documents=[{"path": r.metadata.get("path", "unknown"), "error": r.error_message} for r in failed]
        )
    except Exception as e:
        logger.error(f"Session creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/query", response_model=QueryResponse)
async def query_session(session_id: str, request: QueryRequest):
    """
    Query the documents in a session with a question.
    """
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        answer = await session["rag"].query(request.query)
        return QueryResponse(answer=answer)
    except Exception as e:
        logger.error(f"Query failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/podcast", response_model=PodcastResponse)
async def create_podcast(session_id: str, request: PodcastRequest):
    """
    Generate a podcast from session documents based on a topic.
    """
    session = sessions.get(session_id)
    if not session or not session["docs"]:
        raise HTTPException(status_code=404, detail="Session not found or no documents")
    
    try:
        content = await session["rag"].query(request.topic)
        transcript = await podcast_processor.process_podcast(content)
        audio_url = podcast_processor.generate_audio(transcript, request.voice1, request.voice2)
        return PodcastResponse(transcript=transcript, audio_url=audio_url)
    except Exception as e:
        logger.error(f"Podcast generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/sessions/{session_id}/model", response_model=ModelSwitchResponse)
async def switch_model(session_id: str, request: ModelSwitchRequest):
    """
    Switch the model used in an existing session.
    """
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not model_manager.model_exists(request.model_name):
        raise HTTPException(status_code=400, detail=f"Model {request.model_name} not found")
    
    try:
        new_rag = RAGSystem(request.model_name)
        await new_rag.ingest_documents(session["docs"])
        session["rag"] = new_rag
        logger.info(f"Session {session_id} switched to model {request.model_name}")
        return ModelSwitchResponse(message=f"Switched to {request.model_name}")
    except Exception as e:
        logger.error(f"Model switch failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/info")
async def get_session_info(session_id: str):
    """
    Get information about ingested documents in a session.
    """
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"ingested_documents": session["rag"].get_ingested_documents_info()}

@router.get("/sessions")
async def list_sessions():
    """
    List all available sessions.
    """
    session_list = []
    for session_id, session_data in sessions.items():
        # Get basic info about each session
        doc_count = len(session_data.get("docs", []))
        model_name = session_data.get("rag").model_name if session_data.get("rag") else "unknown"
        
        # Create a session summary
        session_info = {
            "id": session_id,
            "title": f"Session {session_id[:8]}",  # Use first part of UUID as title
            "document_count": doc_count,
            "model": model_name,
            "created_at": session_data.get("created_at", "unknown")
        }
        session_list.append(session_info)
    
    return {"sessions": session_list}

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """
    Delete a session and its associated data.
    """
    if session_id in sessions:
        del sessions[session_id]
        logger.info(f"Session {session_id} deleted")
    return {"message": "Session deleted"}

@router.get("/models")
async def list_models():
    """
    List available models and their details.
    """
    return {"models": model_manager.list_models()}