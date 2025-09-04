# Internal Onboarding Guide

Welcome to **Acme Corp**! This README covers our engineering practices.

## Repos
- `frontend/` is a React app using Vite.
- `backend/` is a Node/Express service.

## Local Setup
1. Install Node 20+.
2. Run `npm install` in both `frontend` and `backend`.
3. Start backend: `npm run ingest` then `npm start`.
4. Start frontend: `npm run dev`.

## Knowledge Bot
We maintain an internal knowledge bot to answer questions from docs via RAG:
- Embed docs with MiniLM.
- Retrieve top chunks by cosine similarity.
- Answer using extractive QA.
