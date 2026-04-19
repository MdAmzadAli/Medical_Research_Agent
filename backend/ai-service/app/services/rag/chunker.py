# app/services/rag/chunker.py

from dataclasses import dataclass
import html

@dataclass
class Chunk:
    chunk_id:  str       # "pmid_0", "pmid_1" etc.
    text:      str       # ~1000 chars of content
    paper_id:  str
    title:     str
    authors:   list[str]
    year:      int | None
    source:    str
    type:      str
    url:       str

import re

def clean_text(text: str) -> str:
    # Remove structured abstract labels
    text = re.sub(r'\b(BACKGROUND|OBJECTIVES|METHODS|RESULTS|CONCLUSIONS|STUDY DESIGN|BACKGROUND AND OBJECTIVES)[\s/A-Z]*:\s*', '', text)
    # Remove HTML entities
    text = html.unescape(text)
    # Collapse extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def chunk_paper(paper: dict, max_chars: int = 1000) -> list[Chunk]:
    """
    Split a paper's abstract into overlapping chunks with full metadata.
    Each chunk is ~1000 chars with 200 char overlap to avoid cutting mid-sentence.
    """
    text = clean_text(paper.get('abstract', ''))

    if not text:
        return []

    chunks = []
    start = 0
    overlap = 200
    idx = 0

    while start < len(text):
        end = start + max_chars

        # Avoid cutting mid-sentence — extend to next period
        if end < len(text):
            next_period = text.find(". ", end)
            if next_period != -1 and next_period < end + 200:
                end = next_period + 1

        chunk_text = text[start:end].strip()

        if chunk_text:
            chunks.append(Chunk(
                chunk_id=f"{paper.get('id', 'unknown')}_{idx}",
                text=chunk_text,
                paper_id=paper.get("id", ""),
                title=paper.get("title", ""),
                authors=paper.get("authors", []),
                year=paper.get("year"),
                source=paper.get("source", "unknown"),
                type=paper.get("type", "paper"),
                url=paper.get("url", "")
            ))
            idx += 1

        start = end - overlap  # overlap to preserve context across chunks

    return chunks


def chunk_all_papers(papers: list[dict], max_chars: int = 1000) -> list[Chunk]:
    """Chunk all papers — returns flat list of all chunks with metadata."""
    all_chunks = []
    for paper in papers:
        all_chunks.extend(chunk_paper(paper, max_chars))
    print(f"[Chunker] {len(papers)} papers → {len(all_chunks)} chunks")
    return all_chunks