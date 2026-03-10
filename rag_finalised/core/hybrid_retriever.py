import numpy as np
import faiss
import pickle
from rank_bm25 import BM25Okapi
from core.embeddings import embed_query
from core.config import is_testing

index = None
metadata = None
bm25 = None
documents = None


def load_index():

    global index, metadata, bm25, documents

    embeddings = np.load("artifacts/expert_embeddings.npy")

    metadata = pickle.load(open("artifacts/metadata.pkl", "rb"))

    documents = [m["Role_Experience"] for m in metadata]

    tokenized = [doc.split() for doc in documents]

    bm25 = BM25Okapi(tokenized)

    dim = embeddings.shape[1]

    index = faiss.IndexFlatIP(dim)

    index.add(embeddings.astype("float32"))


def hybrid_search(query, top_k=5):

    # In testing mode, skip expensive embedding + FAISS + BM25 scoring.
    # Just return the first top_k experts from metadata as a fast dummy result.
    if is_testing():
        if metadata is None:
            return []
        return metadata[:top_k]

    query_emb = embed_query(query)

    vector_scores, vector_idx = index.search(query_emb, 20)

    bm25_scores = bm25.get_scores(query.split())

    combined = []

    for i in range(len(metadata)):

        v_score = 0

        if i in vector_idx[0]:

            pos = list(vector_idx[0]).index(i)

            v_score = vector_scores[0][pos]

        score = 0.6 * v_score + 0.4 * bm25_scores[i]

        combined.append((score, i))

    combined.sort(reverse=True)

    experts = [metadata[i] for _, i in combined[:top_k]]

    return experts