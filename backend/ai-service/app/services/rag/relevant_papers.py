# Quick semantic filter — reject papers below threshold BEFORE chunking
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

def filter_relevant_papers(papers: list[dict], query: str, threshold: float = 0.08) -> list[dict]:
    if not papers:
        return []

    texts = [
        f"{p.get('title', '')} {p.get('abstract', '')[:200]}"
        for p in papers
    ]

    corpus = [query] + texts
    vectorizer = TfidfVectorizer(stop_words='english')
    matrix = vectorizer.fit_transform(corpus)
    scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

    # Log actual scores so you can tune threshold intelligently
    scored = sorted(zip(scores, papers), key=lambda x: x[0], reverse=True)
    print(f"\n[Filter] ALL scores for query: '{query}'")
    for score, paper in scored:
        status = "✅ KEEP" if score >= threshold else "❌ DROP"
        print(f"  {status} {round(float(score),4)} [{paper.get('source','?')}] {paper.get('title','')[:60]}")

    filtered = [p for p, score in zip(papers, scores) if score >= threshold]
    print(f"[Filter] {len(papers)} papers → {len(filtered)} after filter (threshold={threshold})")
    return filtered