# 🐞 AI Bug Detective

An AI-powered production incident analyzer built with **NestJS, TypeScript, RAG, Embeddings, Qdrant, Redis, and LLMs**.

The goal of this project is to analyze production incidents by retrieving relevant parts of a project's source code and providing an evidence-based analysis using an LLM.

---

## 🚀 Overview

AI Bug Detective allows developers to upload a source-code project and investigate production incidents using natural language.

Instead of sending the entire codebase to an LLM, the system:

1. Processes the uploaded project.
2. Splits source files into smaller chunks.
3. Generates embeddings for the chunks.
4. Stores the vectors and metadata in Qdrant.
5. Converts an incident into a query embedding.
6. Retrieves the most relevant code chunks.
7. Sends the incident, conversation history, and retrieved code to an LLM.
8. Returns a structured incident analysis.
9. Stores the conversation history in Redis.

### Architecture

```text
User
 │
 ▼
NestJS API
 │
 ├─────────────── Project Upload
 │                       │
 │                       ▼
 │                  ZIP Processing
 │                       │
 │                       ▼
 │                    Chunking
 │                       │
 │                       ▼
 │                  Embeddings
 │                       │
 │                       ▼
 │                    Qdrant
 │
 └─────────────── Incident Analysis
                         │
                         ▼
                  Query Embedding
                         │
                         ▼
                      Qdrant
                         │
                         ▼
                 Relevant Chunks
                         │
                         ▼
                    ChatService
                    │        │
                    ▼        ▼
                  Redis     LLM
                  History    │
                             ▼
                    Structured Analysis
```

---

## ✨ Features

- 🔐 JWT authentication
- 👤 User-based project isolation
- 📦 ZIP project upload
- 📂 Source-code file processing
- ✂️ Line-based code chunking
- 🧠 NVIDIA embedding models
- 🔎 Semantic code retrieval
- 🗄️ Qdrant vector database
- 💬 Conversational incident analysis
- 🧠 Redis-based chat memory
- 🤖 LLM-powered root-cause analysis
- 📋 Structured JSON responses
- 📌 Evidence-based analysis with file paths and line ranges
- 🧩 Project and user metadata attached to vector payloads

---

## 🧠 RAG Pipeline

The core of the project is a Retrieval-Augmented Generation pipeline.

```text
Source Code
    │
    ▼
File Processing
    │
    ▼
Line-based Chunking
    │
    ▼
Embedding Model
    │
    ▼
Vector + Metadata
    │
    ▼
Qdrant
```

When an incident is submitted:

```text
Incident
   │
   ▼
Query Embedding
   │
   ▼
Qdrant Similarity Search
   │
   ▼
Relevant Code Chunks
   │
   ▼
LLM
   │
   ▼
Incident Analysis
```

This allows the model to reason over the actual project code instead of relying only on its pretrained knowledge.

---

## 🧩 Code Chunking

The project currently uses **line-based chunking** rather than AST-based parsing.

Each chunk contains metadata such as:

```ts
{
  path: string;
  startLine: number;
  endLine: number;
  language: string;
  content: string;
}
```

For example:

```text
src/auth/auth.service.ts
Lines: 20-60
Language: TypeScript

<source code>
```

AST parsing is intentionally not used at this stage to keep the initial implementation simple and maintainable.

---

## 🧠 Embeddings

The project uses:

```text
nvidia/nemotron-3-embed-1b
```

Two embedding modes are used:

```text
Source code → passage embedding

Incident → query embedding
```

The resulting vectors are stored in Qdrant.

---

## 🗄️ Vector Database

**Qdrant** is used for vector storage and semantic similarity search.

Each point contains:

```text
Point
├── id
├── vector
└── payload
```

The payload contains metadata such as:

```ts
{
  (userId, projectId, path, content, startLine, endLine, language);
}
```

`userId` and `projectId` are stored as metadata rather than being part of the embedding vector.

This allows retrieval to be scoped to:

```text
Current User
        +
Current Project
```

---

## 🤖 LLM Analysis

The project uses:

```text
nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
```

The model receives:

```text
System Prompt
     +
Conversation History
     +
Production Incident
     +
Relevant Code Context
```

The analysis response follows a structured format:

```json
{
  "severity": "high",
  "rootCause": "...",
  "explanation": "...",
  "recommendations": ["..."],
  "confidence": 0.91,
  "evidence": [
    {
      "filePath": "src/example.ts",
      "reason": "..."
    }
  ]
}
```

This makes the response easier for a frontend or other services to consume.

---

## 💬 Chat Memory

Conversation history is stored in **Redis**.

Each conversation is identified using:

```text
userId:sessionId
```

Example:

```text
user123:550e8400-e29b-41d4-a716-446655440000
```

This prevents different users and sessions from sharing conversation history.

---

## 🔐 Security Model

The API uses JWT authentication.

The authenticated user's ID is obtained from the JWT rather than being trusted from the request body.

Project retrieval is scoped using:

```text
userId
+
projectId
```

This prevents a user from retrieving code belonging to another project/user.

---

## 🛠️ Tech Stack

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| NestJS     | Backend framework             |
| TypeScript | Programming language          |
| Node.js    | Runtime                       |
| MongoDB    | Application/project data      |
| Redis      | Chat memory                   |
| Qdrant     | Vector database               |
| NVIDIA API | Embeddings & LLM              |
| JWT        | Authentication                |
| Axios      | HTTP requests                 |
| Zod        | Runtime validation            |
| Docker     | Containerization / deployment |

---

## 📁 Project Structure

The project follows a modular NestJS architecture.

```text
src/
├── auth/
├── chat/
├── projects/
├── shared/
├── CORE/
└── ...
```

Main responsibilities include:

```text
Auth
 └── Authentication & authorization

Projects
 ├── Project management
 ├── ZIP upload
 ├── File processing
 ├── Chunking
 ├── Embeddings
 ├── Qdrant
 └── Retrieval

Chat
 ├── Incident analysis
 ├── LLM communication
 └── Redis chat memory
```

---

## 🔄 End-to-End Flow

### 1. Authentication

```text
Login
 ↓
JWT
 ↓
Authenticated User
```

### 2. Create Project

```text
User
 ↓
Create Project
 ↓
projectId
```

### 3. Upload Project

```text
ZIP
 ↓
Validation
 ↓
Extraction
 ↓
File Filtering
```

### 4. Chunking

```text
Source Files
 ↓
Line-based Chunks
```

### 5. Indexing

```text
Chunks
 ↓
Embedding API
 ↓
Vectors
 ↓
Qdrant
```

### 6. Incident

```text
User:
"POST /users returns 500"
```

### 7. Retrieval

```text
Incident
 ↓
Query Embedding
 ↓
Qdrant
 ↓
Relevant Code
```

### 8. AI Analysis

```text
Incident
+
History
+
Relevant Code
 ↓
LLM
 ↓
Structured Analysis
```

### 9. Memory

```text
User Message
+
Assistant Response
 ↓
Redis
```

---

## 🧪 Current Status

The main end-to-end pipeline is working:

```text
✅ Authentication
✅ Project creation
✅ ZIP upload
✅ File processing
✅ Line-based chunking
✅ Embedding generation
✅ Qdrant storage
✅ Incident retrieval
✅ Relevant code retrieval
✅ LLM analysis
✅ Structured response
✅ Redis chat memory
✅ End-to-end testing
```

The project is currently at the **MVP / optimization stage**.

---

## 🗺️ Roadmap

### Retrieval Improvements

- [ ] Tune `topK`
- [ ] Add similarity score threshold
- [ ] Improve Qdrant filtering
- [ ] Handle empty retrieval results
- [ ] Remove duplicate chunks
- [ ] Improve chunk relevance

### Validation & Reliability

- [ ] Validate LLM output with Zod
- [ ] Improve API error handling
- [ ] Handle unavailable external services
- [ ] Handle invalid LLM responses

### Security

- [ ] ZIP path traversal protection
- [ ] ZIP bomb protection
- [ ] File count/size limits
- [ ] Stronger secret-file filtering

### Project Lifecycle

- [ ] Delete project vectors from Qdrant
- [ ] Replace vectors on project re-upload
- [ ] Improve project ownership validation

### Performance

- [ ] Batch embedding
- [ ] Asynchronous project processing
- [ ] BullMQ job queue
- [ ] Improve large-project handling

### Future Ideas

- [ ] Reranking
- [ ] Hybrid search
- [ ] AST-based code analysis
- [ ] Dependency graphs
- [ ] Code-aware retrieval
- [ ] AI Agent for multi-step debugging
- [ ] Fine-tuning experiments

---

## 🎯 Project Goals

This project was built as a practical exploration of:

- Retrieval-Augmented Generation (RAG)
- Embeddings
- Vector databases
- LLM structured outputs
- AI-assisted software debugging
- Semantic code search
- Conversational AI
- Production-oriented NestJS architecture

---

## 📌 Note

This project is currently under active development.

The focus is on building a practical AI Engineering system while keeping the architecture understandable, testable, and incrementally extensible.
