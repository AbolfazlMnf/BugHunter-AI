# 🐞 AI Bug Detective

An AI-powered production incident analyzer built with **NestJS, TypeScript, RAG, Embeddings, Qdrant, Redis, BullMQ, and LLMs**.

The goal of this project is to analyze production incidents by retrieving relevant parts of a project's source code and providing an evidence-based analysis using an LLM.

---

## 🚀 Overview

AI Bug Detective allows developers to upload a source-code project and investigate production incidents using natural language.

Instead of sending the entire codebase to an LLM, the system:

1. Processes the uploaded project asynchronously.
2. Splits source files into smaller chunks.
3. Generates embeddings for the chunks.
4. Stores vectors and metadata in Qdrant.
5. Converts an incident into a query embedding.
6. Retrieves the most relevant code chunks.
7. Sends the incident, conversation history, and retrieved code to an LLM.
8. Returns a structured incident analysis.
9. Stores conversation history in Redis.

The project also includes a reliable asynchronous processing pipeline with **BullMQ retries, atomic processing locks, temporary-file cleanup, and idempotent vector storage**.

---

## 🏗️ Architecture

```text
User
 │
 ▼
NestJS API
 │
 ├─────────────── Authentication
 │
 ├─────────────── Project Management
 │
 │                    │
 │                    ▼
 │              ZIP Upload
 │                    │
 │                    ▼
 │          Atomic Processing Lock
 │                    │
 │                    ▼
 │               BullMQ Queue
 │                    │
 │                    ▼
 │             Project Worker
 │                    │
 │              ┌─────┴─────┐
 │              ▼           ▼
 │          Extraction   Chunking
 │                          │
 │                          ▼
 │                      Embeddings
 │                          │
 │                          ▼
 │                        Qdrant
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
                    │          │
                    ▼          ▼
                  Redis       LLM
                 History       │
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
- ⚡ Asynchronous project processing with BullMQ
- 🔄 Automatic job retries with exponential backoff
- 🔒 Atomic processing-state transition to prevent concurrent processing
- ♻️ Idempotent Qdrant vector writes
- 🧹 Temporary ZIP file cleanup
- 📊 Project processing status and progress tracking

---

## 🧠 RAG Pipeline

The core of the project is a Retrieval-Augmented Generation pipeline.

### Indexing Pipeline

```text
Source Code
    │
    ▼
ZIP Extraction
    │
    ▼
File Filtering
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

### Retrieval Pipeline

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

The embedding vectors currently use a dimension of:

```text
2048
```

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
  (userId, projectId, path, content, startLine, endLine, language, type);
}
```

`userId` and `projectId` are stored as metadata rather than being part of the embedding vector.

This allows retrieval to be scoped to:

```text
Current User
      +
Current Project
```

### Idempotent Vector Storage

Qdrant point IDs are generated deterministically using **SHA-256** instead of random UUIDs.

The chunk identity is based on project and chunk information, allowing the same chunk to receive the same Qdrant ID during job retries.

```text
Same Chunk
    │
    ▼
Deterministic SHA-256 ID
    │
    ▼
Qdrant Upsert
```

This prevents duplicate vectors from being created when BullMQ retries a failed processing job.

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

## ⚙️ Asynchronous Project Processing

Project indexing is handled asynchronously using **BullMQ**.

The API uploads the ZIP file and creates a processing job instead of performing the entire indexing pipeline inside the HTTP request.

```text
ZIP Upload
    │
    ▼
Validation
    │
    ▼
Temporary File
    │
    ▼
BullMQ Job
    │
    ▼
Worker
    │
    ├── Extract
    ├── Chunk
    ├── Embed
    ├── Save Codebase
    └── Store Vectors
```

### Processing Status

Projects maintain a processing lifecycle:

```text
NotStarted
    │
    ▼
Pending
    │
    ▼
Processing
    │
    ├──────────────► Completed
    │
    ▼
  Failed
```

Processing progress is also stored in MongoDB.

---

## 🔄 Retry & Failure Handling

BullMQ automatically retries failed processing jobs.

The current configuration uses:

```text
Attempts: 3

Backoff:
Exponential
Initial delay: 10 seconds
```

Intermediate failures keep the temporary ZIP file so the next retry can continue processing.

After the final failed attempt:

```text
Processing
    │
    ▼
Failed
    │
    ▼
Temporary ZIP deleted
```

Errors are re-thrown so BullMQ can perform the retry.

---

## 🔒 Duplicate Processing Prevention

The system prevents multiple simultaneous processing jobs for the same project.

An **atomic state transition** is used:

```text
NotStarted
    │
    │ atomic update
    ▼
Pending
```

Only the request that successfully changes the project from `NotStarted` to `Pending` can create the processing job.

If another request arrives while the project is already being processed:

```text
Request A → NotStarted → Pending → ✅ Job created

Request B → Pending → ❌ 409 Conflict
```

This prevents race conditions and duplicate project processing.

---

## 🧹 Temporary File Management

Uploaded ZIP files are stored temporarily during asynchronous processing.

The lifecycle is:

```text
Upload
  │
  ▼
Temporary ZIP
  │
  ├── Processing succeeds
  │        ↓
  │      Delete
  │
  ├── Intermediate retry
  │        ↓
  │      Keep
  │
  └── Final failure
           ↓
         Delete
```

This prevents temporary uploaded archives from accumulating on the server.

---

## 🔐 Security Model

The API uses JWT authentication.

The authenticated user's ID is obtained from the JWT rather than being trusted from the request body.

Project retrieval and vector retrieval are scoped using:

```text
userId
+
projectId
```

This prevents a user from retrieving code belonging to another project/user.

ZIP uploads are also validated by file type and maximum file size.

---

## 🛠️ Tech Stack

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| NestJS     | Backend framework             |
| TypeScript | Programming language          |
| Node.js    | Runtime                       |
| MongoDB    | Application/project data      |
| Redis      | Chat memory & BullMQ          |
| BullMQ     | Asynchronous job processing   |
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
├── vector/
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
 ├── Processing queue
 └── Project lifecycle

Vector
 └── Qdrant integration

Chat
 ├── Incident analysis
 ├── LLM communication
 ├── Retrieval
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
Atomic Processing Lock
  ↓
Temporary File
  ↓
BullMQ Job
```

### 4. Background Processing

```text
BullMQ
  ↓
Worker
  ↓
ZIP Extraction
  ↓
File Filtering
  ↓
Chunking
  ↓
Embedding
  ↓
Qdrant
  ↓
Completed
```

### 5. Incident

```text
User:

"POST /users returns 500"
```

### 6. Retrieval

```text
Incident
  ↓
Query Embedding
  ↓
Qdrant
  ↓
Relevant Code
```

### 7. AI Analysis

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

### 8. Memory

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
✅ File validation
✅ Asynchronous project processing
✅ BullMQ job queue
✅ Retry & exponential backoff
✅ Atomic processing lock
✅ Duplicate processing prevention
✅ Temporary file cleanup
✅ Line-based chunking
✅ Embedding generation
✅ Idempotent Qdrant storage
✅ Qdrant vector retrieval
✅ User/project vector filtering
✅ Incident retrieval
✅ Relevant code retrieval
✅ LLM analysis
✅ Structured response
✅ Redis chat memory
✅ End-to-end testing
```

The project is currently at the **MVP / RAG optimization stage**.

---

## 🗺️ Roadmap

### 🔎 Retrieval Improvements

- [ ] Tune `topK`
- [ ] Add similarity score threshold
- [ ] Improve Qdrant filtering
- [ ] Handle empty retrieval results
- [ ] Remove duplicate chunks
- [ ] Add neighboring chunks
- [ ] Improve chunk relevance
- [ ] Context window / token budget management

### 🧠 RAG Quality

- [ ] Retrieval evaluation
- [ ] Create evaluation dataset
- [ ] Measure retrieval precision / relevance
- [ ] Compare different chunking strategies
- [ ] Experiment with reranking

### 🤖 LLM Reliability

- [ ] Validate LLM output with Zod
- [ ] Improve invalid-response handling
- [ ] Improve API error handling
- [ ] Handle unavailable external AI services
- [ ] Improve structured-output reliability

### 🔐 Security Hardening

- [ ] ZIP path traversal protection
- [ ] ZIP bomb protection
- [ ] File count limits
- [ ] Stronger secret-file filtering
- [ ] Production security review

### ⚡ Performance

- [ ] Optimize large-project processing
- [ ] Improve embedding batching
- [ ] Optimize Qdrant indexing
- [ ] Reduce unnecessary LLM context

### 🚀 Advanced Retrieval

- [ ] Reranking
- [ ] Hybrid search
- [ ] AST-based code analysis
- [ ] Dependency graphs
- [ ] Code-aware retrieval

### 🤖 Future AI Features

- [ ] AI Agent for multi-step debugging
- [ ] Automatic debugging workflow
- [ ] Multi-query retrieval
- [ ] Fine-tuning experiments
- [ ] Automated incident investigation

---

## 🏷️ Version History

### v1.0.1 — Processing Reliability & Idempotency

```text
Added:
- Atomic project processing state transition
- Concurrent processing prevention
- BullMQ retry mechanism
- Exponential backoff
- Processing status and progress tracking
- Temporary ZIP cleanup
- Final-failure cleanup
- Deterministic SHA-256 Qdrant point IDs
- Idempotent vector upserts

Improved:
- Processing failure handling
- Job retry behavior
- Project processing lifecycle
- Protection against duplicate vector creation
```

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
- Asynchronous job processing
- Production-oriented NestJS architecture
- Reliable AI pipelines

---

## 📌 Note

This project is currently under active development.

The focus is on building a practical AI Engineering system while keeping the architecture understandable, testable, reliable, and incrementally extensible.
