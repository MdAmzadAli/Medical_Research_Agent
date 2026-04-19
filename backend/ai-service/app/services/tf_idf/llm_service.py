import os
import json
import re
# from google import genai
from google.genai import types
from app.core.config import client

# Single client instance — reuse across calls


async def generate_cited_answer(query: str, context: str) -> str:
    """
    Async — does not block the event loop.
    Uses client.aio for true async under the hood.
    """

    prompt = f"""You are a medical research assistant.
Answer using ONLY the research excerpts below.
You MUST respond with valid JSON only — no extra text, no markdown, no backticks.

Query: "{query}"

Research Context:
{context}

Return this exact JSON structure:
{{
  "sections": [
    {{
      "heading": "Overview",
      "sentences": [
        {{
          "text": "One sentence here.",
          "refs": [1, 2]
        }}
      ]
    }},
    {{
      "heading": "Key Insights",
      "sentences": [
        {{
          "text": "One insight per sentence.",
          "refs": [1]
        }}
      ]
    }},
    {{
      "heading": "Clinical Relevance",
      "sentences": [
        {{
          "text": "Clinical point here.",
          "refs": [2]
        }}
      ]
    }},
    {{
      "heading": "Limitations",
      "sentences": [
        {{
          "text": "Limitation here.",
          "refs": []
        }}
      ]
    }}
  ]
}}

Rules:
- Each sentence must be a single claim
- refs must only contain reference numbers from the context [1], [2], [3]
- If a sentence has no source, use empty refs: []
- Return ONLY the JSON, nothing else
"""

    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a medical research assistant. Always respond with valid JSON only. No markdown, no backticks, no explanation.",
                temperature=0.1,
                top_p=0.9,
                max_output_tokens=2048,
                response_mime_type="application/json",   # hard enforces JSON output
            )
        )

        return response.text or ""

    except Exception as e:
        print(f"[generate_cited_answer] Error: {e}")
        return ""
    


async def extract_disease(query: str) -> str | None:
    try:
        prompt = f"""Extract the medical disease or condition name from the query below.

Query: "{query}"

Rules:
- Reply with ONLY the disease/condition name, nothing else
- No punctuation, no explanation, no extra words
- If no disease is mentioned, reply with exactly: NONE
- Examples:
  Query: "what are symptoms of diabetes?" → diabetes
  Query: "how is malaria treated?" → malaria
  Query: "what is a good diet?" → NONE

Reply:"""

        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a medical entity extractor. Reply with only the disease name or NONE. No explanation, no punctuation.",
                temperature=0.0,        # fully deterministic for extraction tasks
                max_output_tokens=20,   # disease name never needs more than 20 tokens
            )
        )
        # print( "Query is :",query,"\nresponse from gemini is", response)
        result = (response.text or "").strip().lower()
        
        # Handle variations of "none"
        none_patterns = {"none", "no disease", "not found", "n/a", "no condition", "unknown"}
        if not result or any(result.startswith(p) for p in none_patterns):
            return None

        # Strip common LLM artifacts
        result = result.strip('"\'.').strip()
        if ":" in result:
            result = result.split(":")[-1].strip()

        # Reject suspiciously long responses
        if len(result.split()) > 5:
            return None

        return result if result else None

    except Exception as e:
        print(f"[extract_disease] Error: {e}")
        return None
  



async def expand_query(user_query: str) -> list[str]:
    """
    Use LLM to generate 3 clinically meaningful PubMed search variations.
    Returns list of query strings optimized for medical literature search.
    """
    prompt = f"""You are a medical literature search expert.

Convert this user question into 3 PubMed search queries.

User question: "{user_query}"

Rules:
- Treat the ENTIRE user question as one unified topic — never split it into parts
- If the question contains a disease name, ALL 3 queries MUST include that disease
- Use specific medical/clinical terms
- AVOID generic words: "indicators", "physiological", "warning", "methods", "factors"
- Each query must be 3-6 words maximum
- Return ONLY a JSON array of 3 strings, nothing else

Examples:

User question: "is rice good? diabetes"
CORRECT — all queries include diabetes:
["rice consumption glycemic control diabetes",
 "white rice blood glucose type 2 diabetes",
 "dietary rice intake diabetic patients"]

WRONG — splits the question:
["rice nutritional value",
 "rice health benefits",
 "diabetes management"]

User question: "tell me about high blood pressure symptoms":
["hypertension headache dizziness symptoms",
 "essential hypertension clinical signs",
 "hypertensive patients presenting complaints"]

User question: "what causes diabetes":
["type 2 diabetes etiology pathogenesis",
 "insulin resistance diabetes onset",
 "diabetes mellitus obesity causes"]
"""

    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=200,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
                response_mime_type="application/json",
            )
        )

        text = response.text or ""
        cleaned = re.sub(r"```json|```", "", text).strip()
        queries = json.loads(cleaned)

        # Always include original cleaned query as fallback
        # if user_query not in queries:
        #     queries.append(user_query)

        print(f"[QueryExpander] Expanded to: {queries}")
        return queries[:3]   # max 3 queries

    except Exception as e:
        print(f"[QueryExpander] Failed, using original: {e}")
        return [user_query]   # fallback to original