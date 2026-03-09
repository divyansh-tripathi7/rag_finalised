import pandas as pd
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer

print("Loading expert dataset...")

df = pd.read_excel("data/refined_expert_metadata.xlsx")

texts = df["Role_Experience"].fillna("").tolist()

print("Loading embedding model...")

model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

print("Generating embeddings...")

embeddings = model.encode(
    texts,
    normalize_embeddings=True,
    show_progress_bar=True
)

np.save("artifacts/expert_embeddings.npy", embeddings)

metadata = df.to_dict(orient="records")

pickle.dump(metadata, open("artifacts/metadata.pkl", "wb"))

print("Artifacts generated successfully.")