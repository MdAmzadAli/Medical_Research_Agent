# app/services/rag/embedder.py

import numpy as np
from fastembed import TextEmbedding
from app.core.config import EMBEDDING_MODEL

# Load once at module level — not on every request
_model = None

def get_model() -> TextEmbedding:
    global _model
    if _model is None:
        print("[Embedder] Loading fastembed model...")
        _model = TextEmbedding(EMBEDDING_MODEL)
        print("[Embedder] Model loaded.")
    return _model


def embed_texts(texts: list[str]) -> np.ndarray:
    """Returns normalized embeddings shape: (n, 384)"""
    model = get_model()
    embeddings = np.array(list(model.embed(texts)))
    return embeddings


def cosine_similarity_scores(query_emb: np.ndarray, chunk_embs: np.ndarray) -> np.ndarray:
    """
    Since fastembed returns normalized embeddings by default,
    dot product = cosine similarity.
    query_emb: (384,)
    chunk_embs: (n, 384)
    returns: (n,) similarity scores
    """
    return chunk_embs @ query_emb