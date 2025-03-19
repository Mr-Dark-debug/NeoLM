# Podcast generation prompt
PODCAST_PROMPT = """
### Podcast Dialogue Generator
Create a podcast conversation between "The Enthusiast" (Host 1) and "The Expert" (Host 2).
- Style: Pure dialogue, "Host 1: ..." "Host 2: ..."
- Tone: 30% humor, 50% insights, 20% banter
- Length: Aim for 12-22 minutes
- Content: Use {document_content}, highlight 2-3 key insights
- Rules: Alternate every 1-3 sentences, use connectors like "Right...", include 3 engagement phrases per 500 words
"""

# RAG query prompt
RAG_QUERY_PROMPT = """
### Instructions
Answer the user's question based solely on the provided context. Cite sources where applicable.
### Context
{context}
### Question
{question}
### Response
"""