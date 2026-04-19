import os
from dotenv import load_dotenv
from google import genai
load_dotenv()

# GEMINI config
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# LLM config
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
MODEL = os.getenv("MODEL_NAME")
print("model using:", MODEL)
# embedding model
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# ranking weights
# SIMILARITY_WEIGHT = 0.5
# RECENCY_WEIGHT = 0.2
# KEYWORD_WEIGHT = 0.2
# SOURCE_WEIGHT = 0.1

TFIDF_SIMILARITY_WEIGHT = 0.50   # how well paper matches query
RECENCY_WEIGHT          = 0.20   # how recent the paper is
KEYWORD_WEIGHT          = 0.15   # query keywords found in title
SOURCE_WEIGHT           = 0.15