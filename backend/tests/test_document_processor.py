import pytest
import os
from src.core.document_processor import DocumentProcessor
from src.core.config import Config

@pytest.mark.asyncio
async def test_process_url():
    processor = DocumentProcessor()
    result = await processor.process_file("https://example.com")
    assert result.success or "Failed to crawl URL" in result.error_message
    assert result.metadata["type"] == "url"
    assert result.metadata["path"] == "https://example.com"

@pytest.mark.asyncio
async def test_process_nonexistent_file():
    processor = DocumentProcessor()
    result = await processor.process_file("nonexistent.txt")
    assert not result.success
    assert "File not found" in result.error_message

@pytest.mark.asyncio
async def test_process_large_file(tmp_path):
    # Create a large dummy file
    large_file = tmp_path / "large.txt"
    with open(large_file, "wb") as f:
        f.write(b"A" * (Config.MAX_FILE_SIZE + 1))
    
    processor = DocumentProcessor()
    result = await processor.process_file(str(large_file))
    assert not result.success
    assert "exceeds size limit" in result.error_message

@pytest.mark.asyncio
async def test_process_document(tmp_path):
    # Create a simple text file (Docling supports various formats, but we'll mock a basic one)
    doc_file = tmp_path / "test.txt"
    doc_file.write_text("This is a test document.")
    
    processor = DocumentProcessor()
    result = await processor.process_file(str(doc_file))
    assert result.success
    assert "This is a test document" in result.content
    assert result.metadata["type"] == "document"