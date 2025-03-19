import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    HF_API_KEY = os.getenv("HF_API_KEY") 
    GROQ_API_KEY = os.getenv("GROQ_API_KEY") or "AIzaSyBRgC8_v__32w4pK58brddttr3mUu81Uiw"
    PODCAST_USER_ID = os.getenv("PODCAST_USER_ID")
    PODCAST_SECRET_KEY = os.getenv("PODCAST_SECRET_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    TMP_DIR = "tmp"
    MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
    MAX_AUDIO_LENGTH = 300  # 5 minutes

    @staticmethod
    def validate():
        required = ["HF_API_KEY", "GROQ_API_KEY", "PODCAST_USER_ID", "PODCAST_SECRET_KEY", "GOOGLE_API_KEY"]
        missing = [key for key in required if not getattr(Config, key)]
        if missing:
            raise ValueError(f"Missing environment variables: {', '.join(missing)}")