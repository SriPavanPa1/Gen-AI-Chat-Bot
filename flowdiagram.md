flowchart TB
    subgraph Ingestion_Flow [Ingestion Flow]
        A[Docs\n(.md, .txt, .html)] -->|Read files| B[Ingest & Chunk\n(clean + split)]
        B -->|Chunks| C[Embedder\nMiniLM (all-MiniLM-L6-v2)]
        C -->|{id, text, embedding}| D[Vector Store\nvectorstore.json]
    end

    subgraph Query_Flow [Query Flow]
        E[React Frontend\nChat UI] -->|POST /api/query\n{question}| F[Query Embedder\nMiniLM]
        F -->|Query vector| G[Retriever\nCosine Similarity]
        G -->|Top-k chunks| H[QA Model\nDistilBERT-SQuAD]
        H -->|Answer JSON\n{answer, sources}| E
    end

    %% Cross-link Retriever to Vector Store
    G -- similarity search --> D
