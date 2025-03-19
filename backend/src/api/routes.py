from fastapi import APIRouter, HTTPException, UploadFile, File, Form
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
from typing import List, Optional
from datetime import datetime

router = APIRouter()
SESSION_MANAGER = {
    "sessions": {}  # In-memory session store; consider a persistent store for production
}
processor = DocumentProcessor()
model_manager = ModelManager()
podcast_processor = PodcastProcessor()

@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    files: List[UploadFile] = File(default=None),
    plain_text: Optional[str] = Form(default=None),
    model_name: str = "llama-3.3-70b-versatile",
    chunk_size: int = 1000,
    chunk_overlap: int = 200
):
    """
    Create a new session by processing uploaded files, plain text, or URLs.
    """
    try:
        # Initialize lists for processing
        file_paths = []
        successful = []
        failed = []

        # Handle plain text input
        if plain_text:
            # Create a temporary file for plain text
            temp_dir = "tmp"
            os.makedirs(temp_dir, exist_ok=True)
            temp_path = os.path.join(temp_dir, f"plain_text_{uuid.uuid4()}.txt")
            with open(temp_path, "w", encoding="utf-8") as f:
                f.write(plain_text)
            file_paths.append(temp_path)

        # Handle file uploads
        if files:
            temp_dir = "tmp"
            os.makedirs(temp_dir, exist_ok=True)
            for file in files:
                temp_path = os.path.join(temp_dir, file.filename)
                with open(temp_path, "wb") as f:
                    f.write(await file.read())
                file_paths.append(temp_path)

        # Process the files (or plain text saved as a file)
        if file_paths:
            results = await processor.process_files(file_paths)
            successful = [r for r in results if r.success]
            failed = [r for r in results if not r.success]

        # Generate a session ID
        session_id = str(uuid.uuid4())
        
        # Initialize RAG system
        rag = RAGSystem(
            session_id=session_id,  # Pass session_id for isolation
            model_name=model_name,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
        
        if successful:
            await rag.ingest_documents(successful)

        # Store session
        SESSION_MANAGER["sessions"][session_id] = {
            "rag": rag,
            "docs": successful,
            "created_at": datetime.now().isoformat()
        }
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
    session = SESSION_MANAGER["sessions"].get(session_id)
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
    session = SESSION_MANAGER["sessions"].get(session_id)
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
    session = SESSION_MANAGER["sessions"].get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not model_manager.model_exists(request.model_name):
        raise HTTPException(status_code=400, detail=f"Model {request.model_name} not found")
    
    try:
        new_rag = RAGSystem(
            session_id=session_id,  
            model_name=request.model_name,
            chunk_size=1000,
            chunk_overlap=200
        )
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
    session = SESSION_MANAGER["sessions"].get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"ingested_documents": session["rag"].get_ingested_documents_info()}

@router.get("/sessions")
async def list_sessions():
    try:
        sessions_list = []
        for session_id, session_data in SESSION_MANAGER["sessions"].items():
            if session_data:
                # Safely get model name without relying on specific attributes
                model_name = "unknown"
                try:
                    if session_data.get("rag"):
                        # Try different ways to get model name
                        if hasattr(session_data["rag"], "model_manager") and hasattr(session_data["rag"].model_manager, "model_name"):
                            model_name = session_data["rag"].model_manager.model_name
                        elif hasattr(session_data["rag"], "model_name"):
                            model_name = session_data["rag"].model_name
                except Exception as e:
                    logger.error(f"Error getting model name: {str(e)}")
                
                # Get document count safely
                doc_count = 0
                if "docs" in session_data:
                    doc_count = len(session_data["docs"])
                elif "documents" in session_data:
                    doc_count = len(session_data["documents"])
                
                sessions_list.append({
                    "id": session_id,
                    "title": session_data.get("title", f"Session {session_id[:8]}"),
                    "document_count": doc_count,
                    "model_name": model_name,
                    "created_at": session_data.get("created_at", "unknown")
                })
        return {"sessions": sessions_list}
    except Exception as e:
        logger.error(f"Error listing sessions: {str(e)}")
        return {"sessions": []}

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """
    Delete a session and its associated data.
    """
    if session_id in SESSION_MANAGER["sessions"]:
        del SESSION_MANAGER["sessions"][session_id]
        logger.info(f"Session {session_id} deleted")
    return {"message": "Session deleted"}

@router.get("/models")
async def list_models():
    """
    List available models and their details.
    """
    return {"models": model_manager.list_models()}

@router.post("/sessions/{session_id}/upload", response_model=SessionResponse)
async def upload_to_session(
    session_id: str,
    files: List[UploadFile] = File(...)
):
    """
    Upload additional files to an existing session.
    """
    try:
        if session_id not in SESSION_MANAGER["sessions"]:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        # Get the existing session
        session = SESSION_MANAGER["sessions"][session_id]
        rag = session["rag"]
        
        # Process files
        file_paths = []
        successful = []
        failed = []
        
        # Save uploaded files
        for uploaded_file in files:
            temp_dir = "tmp"
            os.makedirs(temp_dir, exist_ok=True)
            file_path = os.path.join(temp_dir, uploaded_file.filename)
            
            with open(file_path, "wb") as f:
                content = await uploaded_file.read()
                f.write(content)
            
            file_paths.append(file_path)
        
        # Process the files
        results = await processor.process_files(file_paths)
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]
        
        # Add documents to the RAG system if any were successfully processed
        if successful:
            await rag.ingest_documents(successful)
            
            # Update session with new documents
            session["docs"].extend(successful)
        
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
        logger.error(f"Upload to session failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/upload-text", response_model=SessionResponse)
async def upload_text(
    text: str = Form(...),
    session_id: str = Form(...)
):
    """
    Upload plain text to an existing session.
    """
    try:
        if session_id not in SESSION_MANAGER["sessions"]:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        # Get the existing session
        session = SESSION_MANAGER["sessions"][session_id]
        rag = session["rag"]
        
        # Create a temporary file for plain text
        temp_dir = "tmp"
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, f"plain_text_{uuid.uuid4()}.txt")
        with open(temp_path, "w", encoding="utf-8") as f:
            f.write(text)
        
        # Process the text file
        results = await processor.process_files([temp_path])
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]
        
        # Add documents to the RAG system if any were successfully processed
        if successful:
            await rag.ingest_documents(successful)
            
            # Update session with new documents
            session["docs"].extend(successful)
        
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return SessionResponse(
            session_id=session_id,
            successful_documents=[r.metadata for r in successful],
            failed_documents=[{"path": r.metadata.get("path", "unknown"), "error": r.error_message} for r in failed]
        )
    except Exception as e:
        logger.error(f"Upload text to session failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/upload-url", response_model=SessionResponse)
async def upload_url(
    url: str = Form(...),
    session_id: str = Form(...)
):
    """
    Upload content from a URL to an existing session.
    """
    try:
        if session_id not in SESSION_MANAGER["sessions"]:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        # Get the existing session
        session = SESSION_MANAGER["sessions"][session_id]
        rag = session["rag"]
        
        # TODO: Implement URL fetching and processing
        # For now, just store the URL as a text document
        temp_dir = "tmp"
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, f"url_{uuid.uuid4()}.txt")
        with open(temp_path, "w", encoding="utf-8") as f:
            f.write(f"URL: {url}\n\n")
            f.write("Content would be fetched and processed in a production environment.")
        
        # Process the URL file
        results = await processor.process_files([temp_path])
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]
        
        # Add documents to the RAG system if any were successfully processed
        if successful:
            await rag.ingest_documents(successful)
            
            # Update session with new documents
            session["docs"].extend(successful)
        
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return SessionResponse(
            session_id=session_id,
            successful_documents=[r.metadata for r in successful],
            failed_documents=[{"path": r.metadata.get("path", "unknown"), "error": r.error_message} for r in failed]
        )
    except Exception as e:
        logger.error(f"Upload URL to session failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))