import os
import sys
import io
import re
import requests
import chromadb
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv()
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

model = SentenceTransformer("all-mpnet-base-v2")
script_dir = os.path.dirname(os.path.abspath(__file__))
persist_dir = os.path.join(script_dir, "chroma_store")

chroma = chromadb.PersistentClient(path=persist_dir)
collection = chroma.get_collection("legal_docs")

def extract_section_number(text):
    match = re.search(r"(section\s+)?(\d{1,3})", text.lower())
    if match:
        return match.group(2)
    return None

def search_context(query, k=5):
    query_embedding = model.encode([query])[0].tolist()
    results = collection.query(query_embeddings=[query_embedding], n_results=k)
    top_docs = results["documents"][0]

    # Section fallback
    section_num = extract_section_number(query)
    if section_num:
        all_docs = collection.get()["documents"]
        exact_matches = [doc for doc in all_docs if f"Section {section_num}" in doc]
        if exact_matches:
            print(f"🔍 Boosted Section {section_num} from full DB")
            top_docs = exact_matches[:1] + top_docs


    relevant_docs = [doc.strip() for doc in top_docs if len(doc.strip()) > 30]
    if not relevant_docs:
        return None

    return "\n\n".join(relevant_docs)

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
        "model": "llama3-70b-8192",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a legal assistant. Use ONLY the provided context to answer the user's question. "
                    "DO NOT use your own knowledge. DO NOT refer to IPC. ONLY refer to BNS. "
                    "If BNS Section 69 is present in the context, use it. If not, say it is not available."
                )
            },
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
