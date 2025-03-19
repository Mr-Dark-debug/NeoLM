from datetime import datetime
import os
import requests
import time
from langchain_core.prompts import ChatPromptTemplate
from src.core.model_manager import ModelManager
from src.core.config import Config
from src.resources.voice_config import VOICES
from src.utils.logging import logger

class PodcastProcessor:
    def __init__(self):
        self.model_manager = ModelManager()
        self.llm = self.model_manager.get_model("deepseek-r1-distill-llama-70b")
        self.headers = {
            "X-USER-ID": Config.PODCAST_USER_ID,
            "Authorization": f"Bearer {Config.PODCAST_SECRET_KEY}",
            "Content-Type": "application/json",
        }

    async def process_podcast(self, document_content: str) -> str:
        # Full podcast prompt from older code
        prompt = ChatPromptTemplate.from_template(
            """
            ### Podcast Dialogue Generator
            Create a compelling podcast conversation between two hosts that transforms complex content into engaging dialogue. Follow these guidelines:

            ## Host Personas
            1. **Dynamic Duo:**
            - Host 1: "The Enthusiast" - Curious, energetic, asks probing questions
            - Host 2: "The Expert" - Knowledgeable, witty, delivers key insights
            - Natural back-and-forth flow without interruptions

            ## Content Requirements
            1. **Conversation Style:**
            - Pure dialogue format: "Host 1:..." "Host 2:..." 
            - No segment titles, music cues, or formatting
            - Seamless topic transitions through dialogue

            2. **Content Adaptation:**
            - Convert technical terms using relatable analogies
            - Use "Imagine if..." explanations for complex ideas
            - Highlight 2-3 key insights from document

            ## Dialogue Rules
            1. **Flow & Structure:**
            - Alternate every 1-3 sentences
            - Use conversational connectors: "Right...", "But consider...", "Here's why..."
            - Include 3 audience engagement phrases per 500 words: "Ever wondered...", "Picture this..."
            - Create engaging and dependent sentences and also add human-like interactions like hmm, okay, right, aah, got it, etc.

            2. **Tone Balance:**
            - 30 percent humor/references, 50 percent insights, 20 percent banter
            - Professional foundation with witty spikes
            - Example: "So it’s like TikTok for neurons? (laughs) But seriously..."

            ## Technical Specs
            - Length: Aim for 12-22 minutes
            - Complexity: Grade 8-10 reading level
            - Format: Strictly "Host 1: [text]" lines without empty lines

            ## Required Content
            {document_content}

            ## Anti-Requirements
            - No markdown/formatting
            - No section headers or labels
            - No monologues >3 sentences
            - No passive voice

            ## Example Format:
            Host 1: Welcome to The Tech Tomorrow Podcast! Today we’re diving into AI voice technology.
            Host 2: And what a topic this is. The progress from basic commands to full conversations is staggering.
            Host 1: Remember when asking phones to set timers felt revolutionary?
            Host 2: Now AI understands context and nuance. But does that raise ethical questions?
            Host 1: Exactly! Where should we draw the privacy line with these voice assistants?
            """
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"document_content": document_content})
        transcript = response.content
        self._save_transcript(transcript)
        return transcript

    def _save_transcript(self, transcript: str):
        os.makedirs("transcripts", exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"transcripts/transcript_{timestamp}.txt"
        with open(filename, "w") as f:
            f.write("\n".join(line for line in transcript.splitlines() if not "<think>" in line and not "</think>" in line))
        logger.info(f"Transcript saved to {filename}")

    def generate_audio(self, transcript: str, host1_voice: str, host2_voice: str) -> str:
        voice1_id = VOICES.get(host1_voice, {}).get("id")
        voice2_id = VOICES.get(host2_voice, {}).get("id")
        if not voice1_id or not voice2_id:
            raise ValueError("Invalid voice selection")
        
        payload = {
            "model": "PlayDialog",
            "text": transcript,
            "voice": voice1_id,
            "voice2": voice2_id,
            "turnPrefix": "Host 1:",
            "turnPrefix2": "Host 2:",
            "outputFormat": "mp3",
        }
        response = requests.post("https://api.play.ai/api/v1/tts/", headers=self.headers, json=payload)
        if response.status_code != 201:
            raise Exception(f"TTS API error: {response.text}")
        
        job_id = response.json()["id"]
        return self._poll_audio_job(job_id)

    def _poll_audio_job(self, job_id: str) -> str:
        url = f"https://api.play.ai/api/v1/tts/{job_id}"
        while True:
            response = requests.get(url, headers=self.headers)
            if not response.ok:
                raise Exception(f"Status check failed: {response.text}")
            status = response.json().get("output", {}).get("status")
            if status == "COMPLETED":
                return response.json()["output"]["url"]
            if status == "FAILED":
                raise Exception("Audio generation failed")
            time.sleep(5)