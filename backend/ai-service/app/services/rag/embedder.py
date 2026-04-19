# app/services/rag/embedder.py

import numpy as np
from huggingface_hub import hf_hub_download
import onnxruntime as ort
from tokenizers import Tokenizer

_session = None
_tokenizer = None

def get_model():
    global _session, _tokenizer
    if _session is None:
        print("[Embedder] Downloading model...")
        model_path = hf_hub_download(
            repo_id="sentence-transformers/all-MiniLM-L6-v2",
            filename="onnx/model.onnx"
        )
        tokenizer_path = hf_hub_download(
            repo_id="sentence-transformers/all-MiniLM-L6-v2",
            filename="tokenizer.json"
        )
        _session = ort.InferenceSession(model_path)
        _tokenizer = Tokenizer.from_file(tokenizer_path)
        _tokenizer.enable_padding(pad_id=0, pad_token="[PAD]", length=128)
        _tokenizer.enable_truncation(max_length=128)
        print("[Embedder] Model loaded.")
    return _session, _tokenizer


def embed_texts(texts: list[str]) -> np.ndarray:
    session, tokenizer = get_model()
    encoded = tokenizer.encode_batch(texts)
    input_ids = np.array([e.ids for e in encoded], dtype=np.int64)
    attention_mask = np.array([e.attention_mask for e in encoded], dtype=np.int64)
    token_type_ids = np.zeros_like(input_ids)

    outputs = session.run(None, {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "token_type_ids": token_type_ids,
    })

    # Mean pooling
    embeddings = outputs[0].mean(axis=1)

    # Normalize
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    embeddings = embeddings / norms
    return embeddings


def cosine_similarity_scores(query_emb: np.ndarray, chunk_embs: np.ndarray) -> np.ndarray:
    return chunk_embs @ query_emb