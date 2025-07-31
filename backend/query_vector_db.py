import os
import sys
import io


import requests
import chromadb
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer


load_dotenv()
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

model = SentenceTransformer("all-mpnet-base-v2")
script_dir = os.path.dirname(os.path.abspath(__file__))
persist_dir = os.path.join(script_dir, "chroma_store")

chroma = chromadb.PersistentClient(path=persist_dir) # ✅ new API
collection = chroma.get_collection("legal_docs")

def search_context(query, k=3):
    query_embedding = model.encode([query])[0].tolist()
    results = collection.query(query_embeddings=[query_embedding], n_results=k)
    top_docs = results["documents"][0]

    # Optional: confidence check
    if not any(len(doc.strip()) > 30 for doc in top_docs):
        return None  # Or return a default fallback

    return "\n\n".join(top_docs)


def call_groq(prompt: str) -> str:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    if not GROQ_API_KEY:
        raise Exception("Missing GROQ_API_KEY in .env")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "llama3-70b-8192",  # or "llama3-70b-8192"
        "messages": [
                {
                "role": "system",
                "content": (
                    "You are a legal assistant. Use **only** the provided context to answer the user's question. "
                    "If the context doesn't contain a direct answer, summarize what's relevant, and clearly state "
                    "that the exact answer is not available."
                )
        }

,
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    res = requests.post(url, headers=headers, json=body)

    if res.status_code != 200:
        print("❌ Groq API Error:")
        print("Status Code:", res.status_code)
        print("Response:", res.text)
        raise Exception("Groq API request failed.")

    return res.json()["choices"][0]["message"]["content"]

def main(query: str):
    context = search_context(query)

    if context is None:
        print("Sorry, I couldn't find relevant legal information in the provided context.")
        return

    prompt = f"Context:\n{context}\n\nQuestion: {query}"
    answer = call_groq(prompt)
    print(answer)


if __name__ == "__main__":
    import sys
    main(sys.argv[1])
