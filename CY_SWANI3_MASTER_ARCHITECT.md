# CY/SWANI3 - Production Grade Multi-User Streaming Platform
## Agentic Architecture: Thin Frontend / Thick Backend (N8n)

### MISSION: Build cy-live - Enterprise streaming ecosystem

---

## Core Architectural Specs

### Frontend (Thin)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **State**: Zustand
- **Color Palette**: Professional Gold (#D4AF37) + Burgundy (#800020)

### Backend (Thick Brain)
- **Orchestrator**: N8n on Docker (Hostinger VPS)
- **Role**: MCP Server - All business logic, DB queries, AI calls via N8n workflows
- **Pattern**: Every UI action triggers N8n webhooks

### Media Layer
- **Server**: MediaMTX
- **Protocols**: SRT, WebRTC
- **Orchestration**: FFmpeg fan-out via N8n workflows

### Persistence
- **Relational**: PostgreSQL (ledger + transactions)
- **Cache/Real-time**: Redis

---

## High-Priority Feature Modules

### A. 20 Guest Panel
- WebRTC-based grid layout
- Spotlight mode with expandable boxes
- N8n-managed signaling and room state

### B. Watch Party Sync
- Server-authoritative synchronization
- N8n + Redis as master clock
- Auto-sync if client drift > 1.5s

### C. AI Guardian Moderation
- Every chat message → N8n moderation workflow
- Returns: `{toxicity_score, confidence}`
- Frontend UI: Flag > 0.7, Auto-ban > 0.9

### D. 90/10 Atomic Ledger
- N8n workflow: 10% platform, 90% creator wallet
- PostgreSQL ledger table
- Real-time earnings analytics

### E. Swani3 Bot (AI Assistant)
- N8n-driven live summary tool
- Whisper transcription → Claude 3.5 summarization

### F. Hype Clipper
- Chat velocity spike detection
- Trigger FFmpeg via N8n to save last 30s as highlight

---

## Production & Security Protocols

### Vault Security
- N8n Cipher Nodes for AES-256 encryption
- Guest stream keys never touch frontend in plain text

### Authentication
- JWT-based auth
- N8n verifies JWT for every sensitive webhook

### Deployment
- Docker Compose YAML networking all services
- Single hardened VPC environment

---

## Development Execution Steps

1. **Analyze**: Connect to N8n MCP Server
2. **Scaffold**: Next.js frontend with Gold/Burgundy branding
3. **Map**: All UI actions to N8n MCP tools
4. **Validate**: Self-healing logic (bitrate 0 → auto-restart FFmpeg)

### Next Steps:
1. Run N8n instance on Hostinger VPS
2. Enable MCP trigger in N8n settings
3. Execute: Paste this prompt into AI Builder

---

*Begin construction now. Query MCP server for tool availability.*
