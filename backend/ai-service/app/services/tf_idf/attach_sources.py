import json
import re

def attach_sources_to_sentences(llm_response: str, sources: list[dict]) -> dict:
    """
    Parse LLM JSON response and replace ref numbers
    with full source metadata on each sentence.
    """

    # Clean response — phi3 sometimes wraps in backticks
    cleaned = re.sub(r"```json|```", "", llm_response).strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"[Parser] JSON decode failed: {e}")
        print(f"[Parser] Raw response: {llm_response[:500]}")
        return {"sections": [], "status": "parse_error"}

    # Build ref lookup map: {1: {...source}, 2: {...source}}
    source_map = {s["ref"]: s for s in sources}

    for section in parsed.get("sections", []):
        for sentence in section.get("sentences", []):
            refs = sentence.pop("refs", [])  # remove raw ref numbers

            # Replace with full source objects
            sentence["citations"] = [
                source_map[ref]
                for ref in refs
                if ref in source_map
            ]

    parsed["status"] = "success"
    return parsed