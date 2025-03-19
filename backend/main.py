import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router
from src.core.document_processor import DocumentProcessor, ProcessingResult
from src.core.rag_system import RAGSystem
from src.api.schemas import SessionResponse, ProcessRequest
from src.utils.logging import logger
from typing import List
import uuid

app = FastAPI(
    title="NotebookLM Backend",
    description="A backend for processing documents, querying AI, and generating podcasts.",
    version="1.1.0"
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # baadme change krna hai malik
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router from routes.py
app.include_router(router)

# In-memory session store (replace with a database like Redis for production)
sessions = {}
processor = DocumentProcessor()

@app.post("/sessions", response_model=SessionResponse)
async def create_session(
    files: List[UploadFile] = File(...),  # Accept file uploads
    model_name: str = "llama-3.3-70b-versatile"  # Optional query param for model
):
    """
    Create a new session by uploading and processing files.
    """
    try:
        # Save uploaded files temporarily
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

        # Initialize RAG system and ingest documents
        rag = RAGSystem(model_name)
        if successful:
            await rag.ingest_documents(successful)

        # Create session
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)