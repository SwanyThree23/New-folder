# CY/LIVE - Production-Grade Streaming Ecosystem
## Agentic Architecture: Thin Frontend / Thick Backend (N8n MCP)

**Principal Architect**: Full-Stack Solutions Architect  
**Status**: Production Ready  
**Version**: 1.0.0

---

## 🎯 Mission Statement

Build **cyLive** - A high-performance, agent-driven streaming ecosystem with enterprise-grade security, transparent creator economics, and AI-powered content moderation.

---

## 🏗️ Architecture Overview

### Thin Frontend (UI Layer Only)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Zustand (UI state only)
- **Pattern**: **ZERO Business Logic** - Pure UI presentation layer
- **Integration**: MCP Client for N8n workflow invocation

### Thick Backend (Brain - N8n MCP Server)
- **Orchestrator**: N8n (Dockerized) acting as Model Context Protocol (MCP) Server
- **Pattern**: ALL business logic, AI, database operations via N8n workflows
- **Location**: Hostinger VPS or any Docker-capable infrastructure

### Media Layer
- **Server**: MediaMTX (WebRTC/SRT/RTMP)
- **Processing**: FFmpeg fan-out orchestration
- **Storage**: Segmented recordings with 30-day retention

### Persistence
- **Relational**: PostgreSQL (Atomic ledger + transactions)
- **Cache/Real-time**: Redis (Master clock + session state)
- **Encryption**: Vault (AES-256 key management)

### Security Stack
- **Encryption**: AES-256-GCM (Vault-managed)
- **Authentication**: JWT + OIDC (Keycloak)
- **Network**: Hardened Docker VPC with internal networks

---

## 🚀 Quick Start

### Prerequisites
```bash
# Docker & Docker Compose
# Node.js 20+ (for local development)
# 8GB+ RAM recommended
```

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your secrets
nano .env
```

### 2. Launch Infrastructure
```bash
# Start all services
docker-compose up -d

# Verify services
docker-compose ps
```

### 3. Initialize N8n
```bash
# Access N8n UI
open http://localhost:5678

# Import workflows
cd n8n/workflows
# Upload all workflow JSON files via N8n UI
```

### 4. Frontend Development
```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Browser   │  │  Mobile App │  │    External API     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      GATEWAY LAYER                           │
│                    Nginx Reverse Proxy                       │
│  • SSL Termination  • Rate Limiting  • WAF Protection       │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   Frontend   │ │    N8n   │ │   MediaMTX   │
│  Next.js 14  │ │  (MCP)   │ │ (WebRTC/SRT) │
└──────────────┘ └────┬─────┘ └──────┬───────┘
                      │              │
        ┌─────────────┼──────────────┼─────────────┐
        ▼             ▼              ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Postgres│  │  Redis   │  │  Vault   │  │Keycloak  │
   │ (Ledger)│  │(Master   │  │(AES-256) │  │  (OIDC)  │
   └─────────┘  │  Clock)  │  └──────────┘  └──────────┘
                └──────────┘
```

---

## 🔧 Core Features

### 1. 20-Guest WebRTC Panel
- **Grid Layout**: Dynamic 5x4 grid with responsive breakpoints
- **Spotlight Mode**: Expandable focus view with animation
- **Host Controls**: Mute, spotlight, reorder guests
- **N8n Integration**: All state changes trigger MCP tool calls

```typescript
// Frontend (Thin)
await executeMCPTool(MCPTools.PANEL_SET_SPOTLIGHT, {
  roomId, guestId
}, authToken);
```

### 2. Server-Authoritative Watch Party Sync
- **Master Clock**: Redis-backed authoritative timestamp
- **Drift Detection**: Auto-sync if client drift > 1.5s
- **Playback Sync**: Play, pause, seek operations synchronized across all clients

```typescript
// Automatic sync every 5 seconds
const syncWithServer = async () => {
  const result = await executeMCPTool(MCPTools.WATCHPARTY_SYNC, {
    sessionId, clientTimestamp: Date.now()
  }, authToken);
  
  if (Math.abs(result.drift) > 1500) {
    forceSyncToServer(result); // Auto-correct
  }
};
```

### 3. AI Guardian Moderation
- **Every Message**: Passes through N8n moderation workflow
- **Toxicity Scoring**: 0.0 (safe) to 1.0 (toxic)
- **Auto-Ban**: Score > 0.9 = automatic ban
- **Flag Review**: Score 0.7-0.9 = moderator queue
- **Response Payload**:
```json
{
  "toxicity_score": 0.85,
  "confidence": 0.92,
  "is_flagged": true,
  "is_auto_banned": false
}
```

### 4. Atomic 90/10 Ledger
- **Stripe Connect Integration**: Direct creator payouts
- **Atomic Transaction**: All-or-nothing database operation
- **Transparent Logging**: Every transaction recorded with audit trail

```sql
-- Atomic split function
SELECT create_transaction_with_split(
  p_amount := 100.00,
  p_creator_id := 'creator_uuid',
  p_platform_fee_percent := 10
);
-- Returns: platform $10.00, creator $90.00
```

### 5. Swani3 AI Assistant
- **Live Transcription**: Whisper API for real-time audio-to-text
- **Summarization**: Claude 3.5 Sonnet for intelligent summaries
- **N8n Pipeline**: Automated workflow triggers

### 6. Hype Clipper
- **Velocity Detection**: Monitor chat message rate (msgs/10sec)
- **Auto-Trigger**: When velocity > threshold, trigger FFmpeg
- **30-Second Capture**: Automatic highlight clip creation

### 7. Self-Healing FFmpeg Guardian
- **Health Monitoring**: Bitrate and process health checks
- **Auto-Restart**: Failed processes automatically restarted by N8n
- **Fan-out Management**: Multi-platform stream distribution

---

## 🔐 Security Implementation

### AES-256 Encryption (Vault)
```yaml
# All stream keys encrypted at rest
services:
  vault:
    image: hashicorp/vault
    environment:
      - VAULT_ADDR=http://vault:8200
    # Keys never touch frontend in plaintext
```

### JWT + OIDC Authentication
```typescript
// Frontend: Store token securely
const { user, token } = await executeMCPTool(MCPTools.AUTH_LOGIN, {
  email, password
});

// All MCP calls include Authorization header
headers: { 'Authorization': `Bearer ${token}` }

// N8n validates JWT on every sensitive webhook
```

### Network Security
- **Internal Network**: Services communicate via Docker internal network
- **No Direct DB Access**: Frontend never connects to PostgreSQL/Redis directly
- **WAF Protection**: Nginx with ModSecurity rules

---

## 🛠️ Development Guide

### MCP Tool Pattern
Every UI action maps to an N8n MCP tool:

```typescript
// frontend/src/lib/mcp-client.ts
export const MCPTools = {
  // Authentication
  AUTH_LOGIN: 'auth.login',
  AUTH_REGISTER: 'auth.register',
  
  // Panel Management
  PANEL_JOIN: 'panel.join',
  PANEL_SET_SPOTLIGHT: 'panel.setSpotlight',
  
  // Watch Party
  WATCHPARTY_SYNC: 'watchparty.sync',
  WATCHPARTY_PLAY: 'watchparty.play',
  
  // Chat & Moderation
  CHAT_SEND: 'chat.send',
  CHAT_MODERATE: 'chat.moderate',
  
  // Ledger
  LEDGER_CREATE_TRANSACTION: 'ledger.createTransaction',
  
  // AI Services
  AI_MODERATE: 'ai.moderate',
  AI_TRANSCRIBE: 'ai.transcribe',
  AI_HYPE_DETECT: 'ai.hypeDetect',
} as const;
```

### Adding New Features
1. **Define MCP Tool** in `mcp-client.ts`
2. **Create N8n Workflow** in `n8n/workflows/`
3. **Build UI Component** in `frontend/src/components/`
4. **Map UI Action** to MCP tool call
5. **Zero business logic in frontend**

---

## 📊 Monitoring & Observability

### Prometheus + Grafana
- **Metrics**: Stream health, chat velocity, transaction volume
- **Alerts**: Drift > 1.5s, FFmpeg failures, moderation queue depth
- **Dashboard**: Real-time system telemetry

### N8n Execution Logs
- All workflow executions logged with input/output
- Error tracking and retry logic
- Audit trail for moderation decisions

---

## 🚢 Deployment

### Production Checklist
- [ ] Update all `.env` secrets
- [ ] Configure SSL certificates in `nginx/ssl/`
- [ ] Set up Stripe Connect webhook endpoints
- [ ] Configure Keycloak realm and clients
- [ ] Import all N8n workflows
- [ ] Test MCP tool registry connectivity
- [ ] Verify MediaMTX auth hooks
- [ ] Run load tests on 20-guest panels

### Scaling
```yaml
# docker-compose.yml - Scale backend
services:
  n8n:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
```

---

## 📚 Documentation

- **API Reference**: `/docs/api.md` (MCP tool specifications)
- **N8n Workflows**: `/n8n/workflows/README.md`
- **Database Schema**: `/postgres/init/01-schema.sql`
- **Security Guide**: `/docs/security.md`

---

## 🤝 Contributing

1. Follow **Thin Frontend** principle
2. All business logic goes in N8n workflows
3. Use MCP tool pattern for all backend calls
4. Maintain gold/burgundy design system
5. Test with `docker-compose` locally

---

## 📄 License

MIT License - See `LICENSE` file

---

## 🆘 Support

For technical support:
- Check logs: `docker-compose logs -f [service]`
- N8n UI: http://localhost:5678
- Grafana Dashboard: http://localhost:3001

**Built with precision. Architected for scale. Secured by design.**

*CY/Live - The future of collaborative streaming*
