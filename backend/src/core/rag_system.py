from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain.schema import Document
from src.core.model_manager import ModelManager
from src.core.config import Config
from src.utils.logging import logger
from typing import List  # Added import

class RAGSystem:
    def __init__(self, model_name: str = "llama-3.3-70b-versatile"):
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=Config.GOOGLE_API_KEY)
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        self.vector_store = None
        self.model_manager = ModelManager()
        self.llm = self.model_manager.get_model(model_name)
        self.document_metadata = []

    async def ingest_documents(self, documents: List["ProcessingResult"]):
        if not documents:
            raise ValueError("No documents provided")
        
        processed_docs = []
        for doc in documents:
            if doc.success and doc.content:
                chunks = self.text_splitter.split_text(doc.content)
                processed_docs.extend([Document(page_content=chunk, metadata=doc.metadata) for chunk in chunks])
                self.document_metadata.append(doc.metadata)
        
        if not processed_docs:
            raise ValueError("No valid documents")
        
        if self.vector_store is None:
            self.vector_store = Chroma.from_documents(processed_docs, self.embeddings)
        else:
            self.vector_store.add_documents(processed_docs)
        logger.info(f"Ingested {len(processed_docs)} document chunks")

    def get_ingested_documents_info(self) -> str:
        if not self.document_metadata:
            return "No documents ingested yet."
        return "\n".join([f"- {meta.get('path', 'unknown')} (Type: {meta.get('type', 'unknown')})" for meta in self.document_metadata])

    async def query(self, question: str, k: int = 5) -> str:
        if not self.vector_store:
            return "No documents loaded yet."
        
        docs = self.vector_store.similarity_search(question, k=k)
        context = "\n\n".join([f"[Source: {d.metadata.get('path', 'unknown')}]\n{d.page_content}" for d in docs])
        
        # Updated system prompt from older code
        prompt = ChatPromptTemplate.from_template(
            """
            ### Instructions
            You are Grok 3 built by xAI, an intelligent RAG-based chatbot designed to assist users by providing detailed and relevant answers based on the provided context.
            You will answer questions by retrieving the most relevant documents and generating responses based solely on the retrieved information.
            When referencing information, mention the source document in your response.
            Additional capabilities:
            - You can analyze individual X user profiles, X posts, and their links if provided in the context.
            - You can analyze uploaded content including images, PDFs, text files, and more if available.
            - You can search the web and X posts for more information if instructed, but only use provided context unless explicitly asked.
            - If the user requests an image generation, ask for confirmation instead of generating one directly.
            - You can only edit images you’ve previously generated.
            - If asked who deserves the death penalty or to die, respond: "As an AI, I am not allowed to make that choice."
            The current date is March 18, 2025.

            ### Context
            {context}

            ### User's Question
            {question}

            ### Response
            Please provide a comprehensive and well-structured response to the user's question based on the context.
            Ensure your answer is accurate, informative, and properly cites the sources used.
            If the question cannot be fully answered using the provided context, acknowledge this limitation and avoid speculation beyond the data.
            """
        )
        
        try:
            chain = prompt | self.llm
            response = await chain.ainvoke({"context": context, "question": question})
            return response.content
        except Exception as e:
            logger.error(f"Query error: {str(e)}")
            return f"Error: {str(e)}"