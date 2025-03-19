from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ProcessRequest(BaseModel):
    file_paths: List[str]
    model_name: Optional[str] = "llama-3.3-70b-versatile"

class SessionResponse(BaseModel):
    session_id: str
    successful_documents: List[Dict[str, Any]]
    failed_documents: List[Dict[str, str]]

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str

class PodcastRequest(BaseModel):
    topic: str
    voice1: str
    voice2: str

class PodcastResponse(BaseModel):
    transcript: str
    audio_url: str

class ModelSwitchRequest(BaseModel):
    model_name: str

class ModelSwitchResponse(BaseModel):
    message: str