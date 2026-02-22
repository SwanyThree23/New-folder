# Swannie3 Architecture Plan - Gemini 3 Pro Planning Mode

## 1. System Overview
**Objective**: Build a production-ready, enterprise-grade, multi-user social live streaming platform ("Swannie3") with 20-person panels, AI moderation, multi-platform streaming, and a creator marketplace.

**Target**: Enterprise Deployment, High Availability, Security First, Scalable.

## 2. Infrastructure Architecture (Agent A)

### 2.1 Container Orchestration (Docker)
We will use Docker Compose for local development and initial deployment simulation, structured for scalability.
- **Backend Service**: Node.js/TypeScript (5 Replicas) - specific memory/port configs.
- **Frontend Service**: Next.js/React (3 Replicas) - specific memory/port configs.
- **Database**: MongoDB v6 (Replica Set optional for production, standalone for dev).
- **Cache**: Redis v7 (AOF Persistence).
- **Media Server**: Nginx RTMP (Ports 1935, 8080).
- **Encryption/Secrets**: Vault Pro Service (Custom Implementation or HashiCorp Vault).
- **AI/ML**: Stable Diffusion (GPU required), LLM Lingua.

### 2.2 Foundation Layer: Database (MongoDB)
**Schemas**:
- **User**: Authentication, Profile, Roles.
- **Room**: Live status, Viewer counts, DSC (Disconnect/Stream Config), Settings.
- **Transaction**: Financial records, 90/10 split logic.
- **Event**: System events, Audit logs.
- **Product**: Marketplace items.
- **Affiliate**: Referral and partnership tracking.

**Key Features**:
- Strict TypeScript Interfaces.
- Mongoose Validation.
- Compound Indexes for performance.
- Pre-save hooks: Password hashing (Bcrypt), Timestamps.
- Atomic Operations: `$inc` for balances, `$push` for arrays.

### 2.3 Caching Layer (Redis)
**Patterns**:
- **Room Management**: `room:{id}` (Hash), `room:{id}:guests` (Set).
- **Viewer Counts**: Atomic increments/decrements.
- **Sessions**: TTL policies for user sessions.
- **Pub/Sub**: Real-time notifications (Room Events, Payments).
- **Lua Scripts**: Atomic multi-key operations for complex state changes.

### 2.4 Security Layer (Encryption)
- **Algorithm**: AES-256-GCM.
- **Key Management**:
  - Master Key: From AWS KMS or Env Variable.
  - Key Format: 32 bytes (Hex/Base64).
  - Monthly Key Rotation pipeline.
  - Tag Separation (IV, Encrypted Data, Auth Tag).

## 3. Implementation Plan (Step-by-Step)

1.  **Project Initialization**: Setup Monorepo structure and Docker Compose.
2.  **Backend Core**: Initialize Node.js/TypeScript project, install dependencies.
3.  **Database Implementation**:
    - Define Mongoose Connections.
    - Implement Schemas with validation and hooks.
4.  **Redis Implementation**:
    - Setup Redis Client.
    - Implement caching strategies and Pub/Sub.
5.  **Security Implementation**:
    - Implement Encryption Service (AES-256-GCM).
    - Setup Key management utilities.

## 4. Configuration
- **Environment**: `.env.production` with validation.
- **Ports**:
    - Backend: 4000-5000 range.
    - Frontend: 3000 range.
    - MongoDB: 27017.
    - Redis: 6379.
    - Nginx RTMP: 1935, 8080.

---
*Created by Gemini 3 Pro Planning Mode for Swannie3*
