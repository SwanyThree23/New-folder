---
description: Comprehensive workflow to deploy and verify the Swannie3 platform.
---

### 🛰 Swannie3 Deployment Workflow

This workflow ensures the platform is built, containerized, and verified for production use.

#### 1. Environment Sync & Build

Ensure all dependencies are installed and the application is compiled for the production environment.
// turbo

```powershell
cd backend; npm.cmd install; npm.cmd run build; cd ../frontend; npm.cmd install; npm.cmd run build; cd ..
```

#### 2. Local Infrastructure Preparation

Verify that Docker Desktop is initialized and the Linux subsystem is accessible.
// turbo

```powershell
docker ps
```

*Note: If this command fails with a 500 error, please restart your computer as the Docker daemon pipe has likely deadlocked.*

#### 3. Container Orchestration

Launch the multi-service cluster in detached mode.
// turbo

```powershell
docker-compose up -d
```

#### 4. Post-Deployment Verification

Verify system health by checking mission control telemetry.
// turbo

```powershell
# Check if the Frontend is serving content
# Open http://localhost:3000

# Check AI Audit Logs
cd backend; npm.cmd run ts-node scripts/audit_log_demo.ts; cd ..
```

#### 5. Financial Pulse Check

Verify the database logic by simulating a load of marketplace transactions.
// turbo

```powershell
cd backend; npm.cmd run ts-node scripts/simulate_load.ts; cd ..
```

---
*Swannie3 Infrastructure Guard*
