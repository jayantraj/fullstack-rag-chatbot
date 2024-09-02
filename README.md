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
