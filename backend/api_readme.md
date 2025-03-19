# NotebookLM Backend API

Welcome to the developer guide for the NotebookLM Backend API! This README provides a comprehensive overview of the project, including its purpose, file structure, setup instructions, API endpoints, core components, dependencies, and additional notes to help you understand and work with the codebase effectively. Whether you're setting up the project, extending its functionality, or deploying it to production, this guide has you covered.

---

## Overview

The NotebookLM Backend API is a FastAPI-based application designed to process a wide variety of document types, enable AI-powered queries based on ingested content, and generate podcast-style audio outputs. It supports file types such as PDFs, CSVs, Excel files, Word documents, audio, video, images, and URLs, making it a versatile tool for document processing and content generation.

Key features include:
- **Document Ingestion**: Upload and process multiple file types into a queryable format.
- **Retrieval-Augmented Generation (RAG)**: Query ingested documents using an AI system that retrieves relevant content and generates answers.
- **Podcast Generation**: Create podcast transcripts and audio based on document content, with customizable voices.

This API is built with scalability and flexibility in mind, leveraging modern Python frameworks and AI tools to deliver a robust developer experience.

---

## File Structure

The project is organized into a clear and modular directory structure:

```
notebooklm-backend/
│
├── src/                    # Main source code directory
│   ├── api/                # FastAPI endpoints and routes
│   │   ├── __init__.py     # Package initialization
│   │   ├── routes.py       # API route definitions
│   │   └── schemas.py      # Pydantic models for request/response validation
│   ├── core/               # Core functionality modules
│   │   ├── __init__.py     # Package initialization
│   │   ├── config.py       # Configuration settings (env vars, constants)
│   │   ├── document_processor.py  # Logic for processing various file types
│   │   ├── rag_system.py   # RAG system for querying documents
│   │   ├── podcast_generator.py  # Podcast transcript and audio generation
│   │   └── model_manager.py  # Management of AI models
│   ├── utils/              # Utility functions
│   │   ├── __init__.py     # Package initialization
│   │   ├── logging.py      # Centralized logging configuration
│   │   └── file_utils.py   # Helpers for file handling
│   └── resources/          # Static resources
│       ├── voice_config.py  # Voice configurations for podcasts
│       └── prompts.py       # Prompt templates for AI interactions
│
├── tests/                  # Unit tests
│   ├── __init__.py         # Package initialization
│   ├── test_document_processor.py  # Tests for document processing
│   ├── test_rag_system.py  # Tests for RAG system
│   └── test_podcast_generator.py  # Tests for podcast generation
│
├── tmp/                    # Temporary directory for processing files (git ignored)
├── transcripts/            # Generated podcast transcripts (git ignored)
├── docs/                   # Sample documents for testing
│   ├── sample.pdf          # Example PDF
│   ├── video.mp4           # Example video file
│   └── audio.mp3           # Example audio file
│
├── .env                    # Environment variables (git ignored)
├── .gitignore              # Git ignore file
├── README.md               # This documentation file
├── requirements.txt        # Project dependencies
└── main.py                 # FastAPI application entry point
```

### Key Directories and Files
- **`src/`**: Houses all the application logic, split into `api/`, `core/`, `utils/`, and `resources/`.
- **`tests/`**: Contains unit tests to ensure the reliability of core components.
- **`tmp/` and `transcripts/`**: Used for temporary file storage and podcast transcripts, respectively; these are excluded from version control.
- **`docs/`**: Provides sample files for testing the API's document processing capabilities.
- **`.env`**: Stores sensitive environment variables (e.g., API keys).
- **`main.py`**: The entry point for launching the FastAPI server.

---

## Setup Instructions

Follow these steps to set up the NotebookLM Backend API on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/notebooklm-backend.git
cd notebooklm-backend
```

### 2. Install Dependencies
Ensure you have Python 3.9+ installed, then install the required packages:
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and populate it with the necessary API keys and settings. Below is an example:

```
HF_API_KEY=your_huggingface_api_key          # Hugging Face API key for model access
GROQ_API_KEY=your_groq_api_key              # Groq API key for LLM inference
PODCAST_USER_ID=your_podcast_user_id        # Podcast service user ID
PODCAST_SECRET_KEY=your_podcast_secret_key  # Podcast service secret key
GOOGLE_API_KEY=your_google_api_key          # Google API key (if applicable)
OPENAI_API_KEY=your_openai_api_key          # OpenAI API key for alternative models
```

> **Note**: Replace `your_*` placeholders with actual keys from the respective services. These are required for AI model access, audio generation, and other features.

### 4. Run the Application
Start the FastAPI server using Uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- `--reload`: Enables auto-reloading during development.
- The API will be available at `http://localhost:8000`.
- Access the interactive Swagger UI at `http://localhost:8000/docs` to explore and test endpoints.

---

## API Endpoints

The API provides a set of endpoints for managing sessions, querying documents, generating podcasts, and more. Below is a detailed breakdown of each endpoint, including request and response formats.

### 1. Create Session
- **Endpoint**: `POST /sessions`
- **Description**: Upload files to create a new session and process them for querying.
- **Request**:
  - **Form Data**: `files` (list of files, e.g., PDFs, MP4s, etc.)
  - **Query Parameter**: `model_name` (optional, default: `"llama-3.3-70b-versatile"`)
  - Example (using `curl`):
    ```bash
    curl -X POST "http://localhost:8000/sessions" -F "files=@sample.pdf" -F "files=@audio.mp3"
    ```
- **Response** (JSON):
  ```json
  {
    "session_id": "abc123",
    "successful_documents": [
      {"filename": "sample.pdf", "size": 1024, "type": "application/pdf"},
      {"filename": "audio.mp3", "size": 2048, "type": "audio/mpeg"}
    ],
    "failed_documents": []
  }
  ```

### 2. Query Session
- **Endpoint**: `POST /sessions/{session_id}/query`
- **Description**: Ask a question based on the documents in a session.
- **Request** (JSON):
  ```json
  {"query": "What is the main topic of the uploaded documents?"}
  ```
  - Example (using `curl`):
    ```bash
    curl -X POST "http://localhost:8000/sessions/abc123/query" -H "Content-Type: application/json" -d '{"query": "What is the main topic?"}'
    ```
- **Response** (JSON):
  ```json
  {"answer": "The main topic is artificial intelligence applications."}
  ```

### 3. Generate Podcast
- **Endpoint**: `POST /sessions/{session_id}/podcast`
- **Description**: Generate a podcast transcript and audio from session documents.
- **Request** (JSON):
  ```json
  {
    "topic": "AI Innovations",
    "voice1": "Emma",
    "voice2": "Liam"
  }
  ```
- **Response** (JSON):
  ```json
  {
    "transcript": "Emma: Welcome to the podcast! Today we're discussing AI innovations...\nLiam: Absolutely, let's dive into the details...",
    "audio_url": "https://example.com/podcast/abc123.mp3"
  }
  ```

### 4. Switch Model
- **Endpoint**: `PUT /sessions/{session_id}/model`
- **Description**: Change the AI model used for a session.
- **Request** (JSON):
  ```json
  {"model_name": "gpt-4"}
  ```
- **Response** (JSON):
  ```json
  {"message": "Model switched to gpt-4 successfully."}
  ```

### 5. Get Session Info
- **Endpoint**: `GET /sessions/{session_id}/info`
- **Description**: Retrieve metadata about ingested documents in a session.
- **Response** (JSON):
  ```json
  {
    "ingested_documents": [
      {"filename": "sample.pdf", "size": 1024, "type": "application/pdf", "ingested_at": "2023-10-01T12:00:00Z"}
    ]
  }
  ```

### 6. List Models
- **Endpoint**: `GET /models`
- **Description**: List available AI models and their details.
- **Response** (JSON):
  ```json
  {
    "models": [
      {"name": "llama-3.3-70b-versatile", "provider": "Groq", "cost": "free"},
      {"name": "gpt-4", "provider": "OpenAI", "cost": "paid"}
    ]
  }
  ```

---

## Core Components

The backend is built around several key modules that handle document processing, querying, and podcast generation. Here's an in-depth look at each:

### DocumentProcessor (`src/core/document_processor.py`)
- **Purpose**: Processes various file types into a format suitable for querying.
- **Supported Formats**: PDFs, CSVs, Excel files, Word documents, audio (e.g., MP3), video (e.g., MP4), images, and URLs.
- **Key Features**:
  - Uses `DoclingConverter` for document parsing.
  - Leverages Hugging Face APIs for multimedia processing (e.g., audio transcription, image OCR).
  - Includes `AsyncWebCrawler` for URL content extraction.
- **Workflow**: Files are uploaded, processed into text, and stored temporarily in `tmp/` before ingestion.

### RAGSystem (`src/core/rag_system.py`)
- **Purpose**: Implements Retrieval-Augmented Generation for querying documents.
- **Key Features**:
  - Ingests processed text into a `Chroma` vector store.
  - Retrieves relevant document chunks based on user queries.
  - Generates answers using the selected language model.
- **Dependencies**: LangChain, ChromaDB.

### PodcastProcessor (`src/core/podcast_generator.py`)
- **Purpose**: Creates podcast-style transcripts and audio from document content.
- **Key Features**:
  - Generates conversational transcripts using an LLM.
  - Converts transcripts to audio via the Play.ai API with customizable voices (defined in `voice_config.py`).
  - Saves transcripts to `transcripts/` and provides audio URLs.
- **Dependencies**: Play.ai API, prompt templates from `resources/prompts.py`.

### ModelManager (`src/core/model_manager.py`)
- **Purpose**: Manages AI models used across the system.
- **Key Features**:
  - Supports models from Groq, OpenAI, and other providers.
  - Allows dynamic model switching per session.
  - Tracks model metadata (e.g., provider, cost).

---

## Dependencies

The project relies on a robust set of Python libraries. Key dependencies include:

- **`fastapi`**: Core framework for building the API.
- **`langchain`**: Integration with large language models and RAG workflows.
- **`docling`**: Document conversion and parsing.
- **`moviepy`**: Video file processing.
- **`aiohttp` and `requests`**: Asynchronous and synchronous HTTP requests.
- **`crawl4ai`**: Web crawling for URL ingestion.
- **`chromadb`**: Vector storage for document embeddings.
- **`pytest` and `httpx`**: Unit testing and HTTP client for tests.

For a complete list, refer to `requirements.txt`.

---

## Additional Notes for Developers

Here are some important considerations and tips for working with the NotebookLM Backend API:

### Security
- **Current State**: The API does not include authentication by default for simplicity in development.
- **Recommendation**: In production, implement OAuth2 or API key authentication to secure endpoints. Update `routes.py` with FastAPI's security utilities.

### Session Management
- **Current State**: Sessions are stored in memory, which is fine for development but not scalable.
- **Recommendation**: Use a persistent store like Redis or a database for production. Modify session handling in `routes.py` accordingly.

### File Handling
- **Current State**: Temporary files are stored in `tmp/` and cleaned up after processing.
- **Recommendation**: Ensure proper permissions on the server and consider using a dedicated temporary file management library (e.g., `tempfile`) for robustness.

### Testing
- **Running Tests**: Use `pytest -v --asyncio` to execute the unit tests in `tests/`.
- **Coverage**: Expand test cases to cover edge cases, such as unsupported file types or large uploads.

### Logging
- **Configuration**: Logs are written to `app.log` and the console via `src/utils/logging.py`.
- **Customization**: Adjust log levels (e.g., `INFO`, `DEBUG`) based on your needs.

### Deployment
- **Development**: Use Uvicorn with `--reload` for hot-reloading.
- **Production**: Deploy with a production-grade server like Gunicorn (`gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`).
- **Scaling**: Consider containerization with Docker and orchestration with Kubernetes for high-traffic scenarios.

### Environment Variables
- Ensure all required variables are set in `.env` or your deployment environment. Missing keys will cause runtime errors.

---

This README provides everything you need to get started with the NotebookLM Backend API. From setup to API usage, core component details, and deployment considerations, you're now equipped to dive into the code and extend its capabilities. Happy coding!