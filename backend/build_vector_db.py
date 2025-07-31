import os
import json
import chromadb
from sentence_transformers import SentenceTransformer

# Load model and ChromaDB client
model = SentenceTransformer("all-mpnet-base-v2")
chroma = chromadb.PersistentClient(path="chroma_store")  # ✅ new API

collection = chroma.get_or_create_collection(name="legal_docs")

# Load your JSON data
with open("data/bns.json", "r", encoding="utf-8") as f:
    data = json.load(f)

documents = []
ids = []

for i, item in enumerate(data):
    section = item.get("bns_section", "")
    title = item.get("subject", "")
    content = item.get("extra_data", "")
    doc_text = f"BNS Section: {section}\nSubject: {title}\n\n{content}"
    documents.append(doc_text)
    ids.append(f"doc_{i}")

# Embed and add to Chroma
embeddings = model.encode(documents).tolist()
collection.add(documents=documents, embeddings=embeddings, ids=ids)

print("✅ Chroma vector DB built and stored at chroma_store/")
