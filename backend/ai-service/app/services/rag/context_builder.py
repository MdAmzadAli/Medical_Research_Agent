# app/services/rag/context_builder.py

from app.services.rag.chunker import Chunk
import html

def build_context_from_chunks(chunks: list[Chunk]) -> tuple[str, list[dict]]:
    """
    Build cited context string + sources list from top chunks.
    Deduplicates sources — multiple chunks from same paper share one ref number.
    """
    seen_paper_ids = {}   # paper_id → ref number
    context_blocks = []
    sources = []
    ref_counter = 1

    for chunk in chunks:
        # Assign ref number — reuse if same paper appears in multiple chunks
        if chunk.paper_id not in seen_paper_ids:
            seen_paper_ids[chunk.paper_id] = ref_counter
            ref_counter += 1

            authors_str = ", ".join(chunk.authors[:3])
            if len(chunk.authors) > 3:
                authors_str += " et al."

            sources.append({
                "ref":     seen_paper_ids[chunk.paper_id],
                "id":      chunk.paper_id,
                "title":   chunk.title,
                "authors": chunk.authors,
                "year":    chunk.year,
                "source":  chunk.source,
                "type":    chunk.type,
                "url":     chunk.url,
            })
        else:
            authors_str = ", ".join(chunk.authors[:3])
            if len(chunk.authors) > 3:
                authors_str += " et al."

        ref = seen_paper_ids[chunk.paper_id]

        clean_text = html.unescape(chunk.text)

        block = f"""[{ref}] {chunk.title}
Authors: {authors_str or 'N/A'}
Year: {chunk.year or 'N/A'} | Type: {chunk.type.capitalize()} | Source: {chunk.source.capitalize()}
Excerpt: {clean_text}"""

        context_blocks.append(block)

    return "\n\n".join(context_blocks), sources