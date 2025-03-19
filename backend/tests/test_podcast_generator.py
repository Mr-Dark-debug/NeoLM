import pytest
import os
from src.core.podcast_generator import PodcastProcessor

@pytest.mark.asyncio
async def test_process_podcast():
    processor = PodcastProcessor()
    transcript = await processor.process_podcast("The sky is blue.")
    assert "Host 1:" in transcript
    assert "Host 2:" in transcript
    assert "blue" in transcript.lower()
    assert os.path.exists("transcripts")

def test_generate_audio_invalid_voice():
    processor = PodcastProcessor()
    with pytest.raises(ValueError, match="Invalid voice selection"):
        processor.generate_audio("Host 1: Hi\nHost 2: Hello", "InvalidVoice", "Angelo")