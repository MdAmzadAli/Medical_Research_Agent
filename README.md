# 🧬 MedResearch AI

> **Live Demo:** [https://your-frontend.vercel.app](https://your-frontend.vercel.app)  
> **API:** [https://your-api.onrender.com](https://your-api.onrender.com)  
> **AI Service:** [https://your-ai-service.onrender.com](https://your-ai-service.onrender.com)

---

An intelligent medical research assistant that answers health queries using evidence-based literature from PubMed, OpenAlex, and ClinicalTrials.gov — with inline citations per sentence.

---

## ✨ Features

- 🔍 **Query Expansion** — LLM expands user queries into clinical PubMed-optimized search terms
- 📄 **Multi-source Retrieval** — Fetches papers from PubMed, OpenAlex, and ClinicalTrials.gov
- 🧠 **RAG Pipeline** — Chunks papers, embeds with sentence-transformers, ranks by semantic similarity
- 📚 **Inline Citations** — Every sentence in the answer is linked to its source paper
- 🖱️ **Citation Modal** — Click any citation badge to see full paper details and source URL
- 💬 **Persistent Chat** — Conversations saved to MongoDB, restored on page refresh
- 🔄 **Context Awareness** — Tracks disease context across follow-up questions

---

## 🏗️ Architecture
┌─────────────────┐        ┌──────────────────────┐        ┌─────────────────────┐
│                 │        │                      │        │                     │
│  React Frontend │──────▶ │  Express API (Node)  │──────▶ │ FastAPI AI Service  │
│   (Vercel)      │        │    (Render)          │        │    (Render)         │
│                 │        │                      │        │                     │
└─────────────────┘        └──────────────────────┘        └─────────────────────┘
│                               │
│                               │
┌──────▼──────┐              ┌────────▼────────┐
│  MongoDB    │              │ Sentence        │
│  Atlas      │              │ Transformers +  │
│             │              │ Gemini API      │
└─────────────┘              └─────────────────┘

**Request flow:**
1. User sends query → Express API
2. Express calls FastAPI to expand query into clinical search terms
3. Express fetches papers from PubMed + ClinicalTrials.gov
4. Papers sent to FastAPI RAG pipeline
5. FastAPI chunks, embeds, ranks, builds context, calls Gemini
6. Structured cited answer returned to frontend
7. Frontend renders sections with clickable citation badges

---

## 📁 Project Structure
medical-research-agent/
├── backend/
│   ├── api/                          # Express.js REST API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   └── chat.controller.ts
│   │   │   ├── routes/
│   │   │   │   └── chat.routes.ts
│   │   │   ├── services/
│   │   │   │   ├── retrieval.service.ts
│   │   │   │   └── sources/
│   │   │   │       ├── pubmed.service.ts
│   │   │   │       ├── openalex.service.ts
│   │   │   │       └── clinicalTrials.service.ts
│   │   │   ├── models/
│   │   │   │   └── chat.model.ts
│   │   │   └── server.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── ai-service/                   # FastAPI Python AI Service
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── routes/
│   │   │   │   └── ai_routes.py
│   │   │   └── services/
│   │   │       ├── rag/
│   │   │       │   ├── chunker.py
│   │   │       │   ├── embedder.py
│   │   │       │   ├── chunk_ranker.py
│   │   │       │   └── context_builder.py
│   │   │       ├── query/
│   │   │       │   └── expander.py
│   │   │       └── llm_service.py
│   │   ├── requirements.txt
│   │   ├── Procfile
│   │   └── .env.example
│   │
│   └── .gitignore
│
├── frontend/                         # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/
│   │   │   └── chat.ts
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── InputBar.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── ReferenceModal.tsx
│   │   ├── hooks/
│   │   │   └── useChat.ts
│   │   ├── types/
│   │   │   └── chat.ts
│   │   ├── utils/
│   │   │   └── session.ts
│   │   └── App.tsx
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── README.md

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free)
- Gemini API key (free at aistudio.google.com)
- NCBI PubMed API key (free at ncbi.nlm.nih.gov/account)

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/medical-research-agent.git
cd medical-research-agent
```

---

### 2. Setup Express API

```bash
cd backend/api
npm install
```

Create `.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
AI_SERVICE_URL=http://localhost:8000
PUBMED_API_KEY=your_pubmed_api_key
NODE_ENV=development
```

Run:
```bash
npm run dev
```

API runs at `http://localhost:5000`

---

### 3. Setup FastAPI AI Service

```bash
cd backend/ai-service
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
```

Download NLTK data (first time only):
```bash
python -c "import nltk; nltk.download('punkt_tab')"
```

Run:
```bash
uvicorn app.main:app --reload --port 8000
```

AI service runs at `http://localhost:8000`

---

### 4. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000
```

Run:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🌐 Production Deployment

### Express API → Render
Root Directory:  backend/api
Build Command:   npm install && npm run build
Start Command:   npm start

Environment variables to set in Render dashboard:
MONGODB_URI
GEMINI_API_KEY
AI_SERVICE_URL        ← your FastAPI render URL
PUBMED_API_KEY
NODE_ENV=production

---

### FastAPI AI Service → Render
Root Directory:  backend/ai-service
Build Command:   pip install -r requirements.txt
Start Command:   uvicorn app.main:app --host 0.0.0.0 --port $PORT

Environment variables:
GEMINI_API_KEY

---

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Set in Vercel dashboard:
VITE_API_URL=https://your-api.onrender.com

---

## 🔑 Environment Variables Reference

### Express API (`backend/api/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port | ✅ |
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `AI_SERVICE_URL` | FastAPI service base URL | ✅ |
| `PUBMED_API_KEY` | NCBI PubMed API key | ✅ |
| `NODE_ENV` | `development` or `production` | ✅ |

### FastAPI AI Service (`backend/ai-service/.env`)

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Express API base URL | ✅ |

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios

### Express API
- Node.js + TypeScript
- Express.js
- Mongoose + MongoDB Atlas
- Axios

### FastAPI AI Service
- Python 3.11+
- FastAPI + Uvicorn
- Sentence Transformers (`all-MiniLM-L6-v2`)
- Google Gemini API (`google-genai`)
- scikit-learn (TF-IDF)
- NLTK

### Data Sources
- PubMed (NCBI E-utilities)
- OpenAlex
- ClinicalTrials.gov

---

## 📖 API Reference

### Express API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message and get AI response |
| `GET` | `/api/chat/:sessionId` | Get chat history for a session |

### FastAPI AI Service

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/expand-query` | Expand user query into clinical search terms |
| `POST` | `/rank` | Run RAG pipeline and return cited answer |
| `POST` | `/extract-disease` | Extract disease name from query |

---

## ⚠️ Known Limitations

- Render free tier spins down after 15 min of inactivity — first request may take ~30 seconds
- PubMed rate limit: 10 requests/second with API key
- Gemini API free tier: 15 requests/minute
- Sentence transformer model loads once at startup (~5 seconds on cold start)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">Built with ❤️ using FastAPI, Express, React, and Gemini</p>