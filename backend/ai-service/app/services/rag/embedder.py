# app/services/rag/embedder.py

import numpy as np
from sentence_transformers import SentenceTransformer
from app.core.config import EMBEDDING_MODEL
# Load once at module level — not on every request
_model = None

def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print("[Embedder] Loading sentence-transformer model...")
        _model = SentenceTransformer(EMBEDDING_MODEL)  # fast + accurate, 80MB
        print("[Embedder] Model loaded.")
    return _model


def embed_texts(texts: list[str]) -> np.ndarray:
    """Returns normalized embeddings shape: (n, 384)"""
    model = get_model()
    embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    return embeddings


def cosine_similarity_scores(query_emb: np.ndarray, chunk_embs: np.ndarray) -> np.ndarray:
    """
    Since embeddings are normalized, dot product = cosine similarity.
    query_emb: (384,)
    chunk_embs: (n, 384)
    returns: (n,) similarity scores
    """
    return chunk_embs @ query_emb