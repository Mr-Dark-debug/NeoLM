import pytest
from src.core.model_manager import ModelManager

def test_model_exists():
    manager = ModelManager()
    assert manager.model_exists("llama-3.3-70b-versatile")
    assert not manager.model_exists("invalid-model")

def test_get_model():
    manager = ModelManager()
    model = manager.get_model("llama-3.3-70b-versatile")
    assert model is not None
    assert hasattr(model, "ainvoke")  # LangChain model interface

def test_get_invalid_model():
    manager = ModelManager()
    with pytest.raises(ValueError, match="Model invalid-model not found"):
        manager.get_model("invalid-model")

def test_list_models():
    manager = ModelManager()
    models = manager.list_models()
    assert len(models) >= 4  # Adjust based on models defined
    assert any(m["name"] == "llama-3.3-70b-versatile" for m in models)