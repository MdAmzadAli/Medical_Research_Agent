# app/services/rag/chunk_ranker.py

import numpy as np
from datetime import datetime
from app.services.rag.chunker import Chunk
from app.services.rag.embedder import embed_texts, cosine_similarity_scores

# Weights
SEMANTIC_WEIGHT = 0.70   # embedding similarity — main signal
RECENCY_WEIGHT  = 0.20   # newer papers ranked higher
SOURCE_WEIGHT   = 0.10   # source trustworthiness

SOURCE_WEIGHTS = {
    "pubmed":   1.0,
    "openalex": 0.85,
    "semantic": 0.80,
    "crossref": 0.75,
}

def normalize_year(year: int | None, current_year: int) -> float:
    if not year:
        return 0.3
    age = current_year - int(year)
    return float(np.clip(1 - (age / 10), 0.0, 1.0))


def rank_chunks(query: str, chunks: list[Chunk], top_n: int = 5) -> list[Chunk]:
    """
    Embed query + all chunks, then rank by weighted score.
    Returns top_n most relevant chunks.
    """
    if not chunks:
        return []

    current_year = datetime.now().year

    # Embed query and all chunks together (batched = fast)
    all_texts = [query] + [c.text for c in chunks]
    all_embs  = embed_texts(all_texts)

    query_emb  = all_embs[0]       # shape: (384,)
    chunk_embs = all_embs[1:]      # shape: (n, 384)

    # Semantic similarity scores
    sim_scores = cosine_similarity_scores(query_emb, chunk_embs)

    # Weighted final score per chunk
    scored = []
    for i, chunk in enumerate(chunks):
        semantic = float(sim_scores[i])
        recency  = normalize_year(chunk.year, current_year)
        source   = SOURCE_WEIGHTS.get(chunk.source.lower(), 0.7)

        final_score = (
            SEMANTIC_WEIGHT * semantic +
            RECENCY_WEIGHT  * recency  +
            SOURCE_WEIGHT   * source
        )

        scored.append((final_score, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)

    # Deduplicate — one chunk per paper, keep highest scoring
    seen_papers = set()
    top = []
    for score, chunk in scored:
        if chunk.paper_id not in seen_papers:
            seen_papers.add(chunk.paper_id)
            top.append(chunk)
        if len(top) == top_n:
            break

    return top
