# Expert RAG System

A Retrieval-Augmented Generation (RAG) system that recommends domain experts based on a user query.

The system performs:

1. Query expansion using an LLM
2. Hybrid retrieval (BM25 + vector search)
3. LLM reasoning to recommend the best experts

---

# Installation

Clone repository

```
git clone https://github.com/YOUR_USERNAME/expert-rag-system.git
cd expert-rag-system
```

Create environment

```
python -m venv venv
source venv/bin/activate
```

Install dependencies

```
pip install -r requirements.txt
```

---

# Build Vector Index

```
python scripts/build_index.py
```

This generates:

```
artifacts/
   expert_embeddings.npy
   metadata.pkl
```

---

# Run API

```
uvicorn api.main:app --reload
```

Open:

```
http://localhost:8000/docs
```

---

# Example API Request

POST `/ask`

```
{
 "query": "Who is an expert in CRISPR gene editing?"
}
```

---

# Models Used

LLM

```
Qwen/Qwen2.5-3B-Instruct
```

Embedding Model

```
sentence-transformers/all-mpnet-base-v2
```

Vector Search

```
FAISS
```

Keyword Search

```
BM25
```



