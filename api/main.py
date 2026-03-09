import time
from fastapi import FastAPI
from pydantic import BaseModel

from core.embeddings import load_embedding_model
from core.hybrid_retriever import load_index, hybrid_search
from core.query_expander import load_llm, expand_query
from core.llm_router import select_experts

app = FastAPI(title="Expert RAG System")


class QueryRequest(BaseModel):

    query: str


@app.on_event("startup")
def startup():

    load_embedding_model()

    load_index()

    load_llm()


@app.post("/ask")
def ask(request: QueryRequest):

    start = time.time()

    query = request.query

    expanded_query = expand_query(query)

    experts = hybrid_search(expanded_query)

    recommendation = select_experts(query, experts)

    latency = time.time() - start

    return {

        "query": query,
        "expanded_query": expanded_query,
        "retrieved_experts": experts,
        "llm_recommendation": recommendation,
        "latency": latency
    }


@app.get("/health")
def health():

    return {"status": "running"}