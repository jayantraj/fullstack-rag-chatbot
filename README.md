# Fullstack-rag-chatbot Using React and FAST API

A full-stack chatbot application that leverages React for the frontend and Python (FastAPI) for the backend with WebSocket support for real-time communication. The chatbot uses Pinecone for vector storage and OpenAI for generating responses based on user queries and PDFs.

# Repository Structure

This repository contains two main folders:

**rag-pdf-chatbot-frontend**: The React frontend for the chatbot.<br>
**rag-pdf-chatbot-backend**: The Python backend using FastAPI for handling WebSocket connections and processing queries.

# Features
**Frontend**: Real-time chat interface built with React, customizable chat bubbles, file upload support. <br>
**Backend**: WebSocket server using FastAPI, PDF text extraction, text embedding using OpenAI, context-based response generation using Pinecone VectorDB.

# Prerequisites

Node.js (v14.x or later) <br>
npm (v6.x or later) <br>
Python (v3.8 or later) <br>

# Installation Instructions

# 1. Clone the repository
git clone https://github.com/jayantraj/fullstack-rag-chatbot.git <br>
cd fullstack-rag-chatbot <br>

# 2. Setup Frontend
cd rag-pdf-chatbot-frontend <br>
npm install <br>
npm start <br>

**The frontend should now be running on http://localhost:3000.** <br>

# 3. Setup Backend
cd ../rag-pdf-chatbot-backend <br>
pip install -r requirements.txt <br>

**Create a .env file in the rag-pdf-chatbot-backend directory and add your API keys** <br>

PINECONE_API_KEY=your_pinecone_api_key <br>
OPENAI_API_KEY=your_openai_api_key  <br>

**Start the backend server with uvicorn**
uvicorn main_websockets:app --host 0.0.0.0 --port 8000 --reload <br>



