# app/routes/ai_routes.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from app.services.rag.chunker import chunk_all_papers
from app.services.rag.chunk_ranker import rank_chunks
from app.services.rag.context_builder import build_context_from_chunks
from app.services.tf_idf.llm_service import expand_query, generate_cited_answer, extract_disease
from app.services.tf_idf.attach_sources import attach_sources_to_sentences
from app.services.rag.relevant_papers import filter_relevant_papers

class RankRequest(BaseModel):
    query: str
    items: list[dict[str, Any]]

router = APIRouter()

@router.post("/rank")
async def answer_medical_query(body: RankRequest) -> dict:
    # print(f"\n[rank] ===== INCOMING {len(body.items)} PAPERS =====")
    # for p in body.items:
    #     print(f"  [{p.get('source','?')}] {p.get('title','N/A')[:80]}")
    # print("=" * 50)
    print(f"[rank] query={body.query}, items={len(body.items)}")

    # relevant_papers = filter_relevant_papers(body.items, body.query)
    # print("[rank] After filter:")
    # for p in relevant_papers:
    #     print(f"  - {p.get('title', 'N/A')[:70]}")

    chunks = chunk_all_papers(body.items)

    if not chunks:
        return {"sections": [], "status": "no_results"}

    # Step 2 — embed + rank chunks (top 5)
    top_chunks = rank_chunks(body.query, chunks, top_n=10)
    # print("top_chunks :", top_chunks)
    # return {"message":"checking filter"}
    # Step 3 — build cited context
    context, sources = build_context_from_chunks(top_chunks)
    # return 
    # print(f"[rank] context size: {len(context.split())} words")
    # print("Context :", context)
    # return {"message":"checking filter"}
    

    # Step 4 — single LLM call
    raw_answer = await generate_cited_answer(body.query, context)
    # print("Answer of LLM: ", raw_answer)
    # Step 5 — attach full source metadata per sentence
    result = attach_sources_to_sentences(raw_answer, sources)

    return result


@router.post("/extract-disease")
async def extract_disease_route(data: dict):
    query = data.get("query", "")
    disease = await extract_disease(query)
    print("disease extracted is:", disease)
    return {"disease": disease}


from pydantic import BaseModel

class ExpandRequest(BaseModel):
    query: str

@router.post("/expand-query")
async def expand_query_route(body: ExpandRequest):
    queries = await expand_query(body.query)
    return {"queries": queries}