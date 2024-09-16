import os
import json
from dotenv import load_dotenv
import fitz  # PyMuPDF
import openai
from pinecone import Pinecone, ServerlessSpec
from fastapi import FastAPI, WebSocket, UploadFile, File
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Retrieve API keys from environment variables
pinecone_api_key = os.getenv("PINECONE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI with the new client-based API
openai_client = openai.OpenAI(api_key=openai_api_key)

# Initialize Pinecone
pc = Pinecone(api_key=pinecone_api_key)

# Create a Pinecone index if it doesn't exist
index_name = "multi-rags-pdf-chatbot"
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,  # Match the output dimensions of the embeddings
        metric='cosine',
        spec=ServerlessSpec(
            cloud='aws',
            region='us-east-1'
        )
    )
index = pc.Index(index_name)

# Initialize FastAPI
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from the frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for query request
class QueryRequest(BaseModel):
    query: str

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    document = fitz.open(pdf_path)
    text = ""
    for page_num in range(document.page_count):
        page = document.load_page(page_num)
        text += page.get_text()
    return text

# Function to split text into chunks
def split_text(text, max_tokens=600):
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0

    for word in words:
        current_length += len(word) + 1  # +1 for space
        if current_length > max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_length = len(word) + 1
        else:
            current_chunk.append(word)

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

# Create OpenAI embeddings using the API
def create_embeddings(text, model="text-embedding-ada-002"):
    response = openai_client.embeddings.create(model=model, input=[text])
    embeddings = response.data[0].embedding  
    return embeddings

# Function to query Pinecone
def query_pinecone(query, top_k=4):
    query_embedding = create_embeddings(query)
    query_response = index.query(vector=query_embedding, top_k=top_k, include_values=False, include_metadata=True)
    return query_response['matches']

# Function to get response from OpenAI
def get_response_from_openai(query, context):
    prompt = f"Context: {context}\n\nQuestion: {query}\n\nAnswer:"
    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a witty and humorous almighty being, who loves to crack jokes and speak with a touch of divine sass. Your tone is light-hearted, and you often make humorous observations, as if you are a playful deity speaking to mortals."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500
        )
        return response.choices[0].message.content.strip()  # Access 'content' attribute directly
    except openai.error.OpenAIError as e:
        print(f"OpenAI API error: {e}")  # Print detailed error message
        return f"An error occurred while fetching the response from OpenAI: {e}"

# defines the websocket route at /ws
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # accept the incoming websocket connection from the frontend
    await websocket.accept()

    # keeps the connection open for continuous communication
    while True:
        data = await websocket.receive_text()
        query_request = json.loads(data)
        query = query_request.get("query", "")
        print(f"Received query: {query}")  # Debugging statement

        if not query.strip():
            await websocket.send_text(json.dumps({"response": "Query cannot be empty."}))
            continue

        # Fetch results from Pinecone
        results = query_pinecone(query)

        if results and results[0]['score'] >= 0.4:  # Adjust threshold as necessary
            context = " ".join([match['metadata']['text'] for match in results if 'metadata' in match and 'text' in match['metadata']])
            if not context.strip():
                await websocket.send_text(json.dumps({"response": "No relevant context found in PDFs."}))
                continue
            response = get_response_from_openai(query, context)
        else:
            response = "I can't answer from the given PDFs."

        serializable_results = [{"score": match['score'], "metadata": match.get('metadata', {})} for match in results]

        # sending the open AI generated response back to the frontend
        await websocket.send_text(json.dumps({"response": response, "results": serializable_results}))

# FAST API POST Endpoint. User can upload the PDF directly to the backend
@app.post("/upload_pdfs/")
async def upload_pdfs(files: List[UploadFile] = File(...)):
    for file in files:
        pdf_path = f"/tmp/{file.filename}"
        with open(pdf_path, "wb") as f:
            f.write(await file.read())

        # Step 1: Extract text from PDF
        text = extract_text_from_pdf(pdf_path)

        # Step 2: Split text into manageable chunks
        chunks = split_text(text, max_tokens=600)

        # Step 3: Create embeddings for each chunk and upsert to Pinecone
        for i, chunk in enumerate(chunks):
            embeddings = create_embeddings(chunk)
            metadata = {"text": chunk}
            index.upsert(vectors=[(f"{pdf_path}_chunk_{i}", embeddings, metadata)])
    
    return {"status": "PDFs processed successfully!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

