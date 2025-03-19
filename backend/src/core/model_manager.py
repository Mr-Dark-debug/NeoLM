from enum import Enum
from dataclasses import dataclass
from langchain_groq import ChatGroq
from langchain.chat_models import ChatOpenAI
from src.core.config import Config

class ModelProvider(Enum):
    GROQ = "groq"
    OPENAI = "openai"

@dataclass
class ModelInfo:
    id: str
    provider: ModelProvider
    cost_per_million_tokens: float

class ModelManager:
    def __init__(self):
        Config.validate()
        self.models = {
            "llama-3.3-70b-versatile": ModelInfo("llama-3.3-70b-versatile", ModelProvider.GROQ, 0.3),
            "deepseek-r1-distill-llama-70b": ModelInfo("deepseek-r1-distill-llama-70b", ModelProvider.GROQ, 0.3),
            "claude-3-5-sonnet-20240620": ModelInfo("claude-3-5-sonnet-20240620", ModelProvider.OPENAI, 15),
            "gpt-4o": ModelInfo("gpt-4o", ModelProvider.OPENAI, 5),
        }

    def model_exists(self, model_name: str) -> bool:
        return model_name in self.models

    def get_model(self, model_name: str, temperature: float = 0):
        if not self.model_exists(model_name):
            raise ValueError(f"Model {model_name} not found")
        
        model_info = self.models[model_name]
        if model_info.provider == ModelProvider.GROQ:
            return ChatGroq(temperature=temperature, model_name=model_name, api_key=Config.GROQ_API_KEY)
        else:
            return ChatOpenAI(
                model_name=model_name,
                temperature=temperature,
                openai_api_key=Config.OPENAI_API_KEY,
                openai_api_base="https://api.sree.shop/v1"
            )

    def list_models(self):
        return [{"name": k, "provider": v.provider.value, "cost_per_million_tokens": v.cost_per_million_tokens} for k, v in self.models.items()]