from sentence_transformers import SentenceTransformer

model = None

def load_embedding_model():

    global model

    model = SentenceTransformer(
        "sentence-transformers/all-mpnet-base-v2"
    )


def embed_query(text):

    emb = model.encode(
        [text],
        normalize_embeddings=True
    )

    return emb.astype("float32")