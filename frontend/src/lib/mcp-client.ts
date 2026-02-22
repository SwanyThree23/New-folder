// ============================================================
// N8N MCP TOOL CLIENT - Thin Frontend Zero Business Logic
// Every action triggers an N8n workflow via MCP
// ============================================================

const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
const MCP_REGISTRY_URL = process.env.NEXT_PUBLIC_MCP_REGISTRY_URL || 'http://localhost:5679';

interface MCPRequest {
  tool: string;
  params: Record<string, unknown>;
  authToken?: string;
}

interface MCPResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// MCP Tool Registry Cache
let toolRegistry: Map<string, { endpoint: string; params: string[] }> = new Map();

/**
 * Query MCP Registry for available tools
 * CRITICAL: Always validate tool exists before calling
 */
export async function queryMCPRegistry(): Promise<Map<string, { endpoint: string; params: string[] }>> {
  try {
    const response = await fetch(`${MCP_REGISTRY_URL}/tools`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`MCP Registry error: ${response.status}`);
    }
    
    const tools = await response.json();
    toolRegistry = new Map(Object.entries(tools));
    return toolRegistry;
  } catch (error) {
    console.error('Failed to query MCP Registry:', error);
    throw new Error('MCP Server unavailable - cannot proceed');
  }
}

/**
 * Execute MCP Tool via N8n Workflow
 * ALL business logic resides in N8n - frontend is pure UI
 */
export async function executeMCPTool<T>(
  toolName: string, 
  params: Record<string, unknown>,
  authToken?: string
): Promise<MCPResponse<T>> {
  // Validate tool exists in registry
  if (toolRegistry.size === 0) {
    await queryMCPRegistry();
  }
  
  const tool = toolRegistry.get(toolName);
  if (!tool) {
    throw new Error(`MCP Tool '${toolName}' not found in registry. Available: ${Array.from(toolRegistry.keys()).join(', ')}`);
  }
  
  // Construct webhook URL from tool registry
  const webhookUrl = `${N8N_BASE_URL}/webhook${tool.endpoint}`;
  
  const request: MCPRequest = {
    tool: toolName,
    params,
    authToken,
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`N8n workflow error: ${error}`);
    }
    
    const result: MCPResponse<T> = await response.json();
    return result;
  } catch (error) {
    console.error(`MCP Tool execution failed: ${toolName}`, error);
    throw error;
  }
}

// ============================================================
// PRE-DEFINED MCP TOOL INTERFACES
// These map UI actions to N8n workflows
// ============================================================

export const MCPTools = {
  // Authentication
  AUTH_LOGIN: 'auth.login',
  AUTH_REGISTER: 'auth.register',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_REFRESH: 'auth.refresh',
  
  // Panel Management (20 Guest System)
  PANEL_JOIN: 'panel.join',
  PANEL_LEAVE: 'panel.leave',
  PANEL_UPDATE_GUEST: 'panel.updateGuest',
  PANEL_SET_SPOTLIGHT: 'panel.setSpotlight',
  PANEL_REORDER: 'panel.reorder',
  
  // Watch Party Sync
  WATCHPARTY_SYNC: 'watchparty.sync',
  WATCHPARTY_PLAY: 'watchparty.play',
  WATCHPARTY_PAUSE: 'watchparty.pause',
  WATCHPARTY_SEEK: 'watchparty.seek',
  
  // Chat & Moderation
  CHAT_SEND: 'chat.send',
  CHAT_DELETE: 'chat.delete',
  CHAT_MODERATE: 'chat.moderate',
  CHAT_BAN_USER: 'chat.banUser',
  
  // Atomic Ledger (90/10 Split)
  LEDGER_CREATE_TRANSACTION: 'ledger.createTransaction',
  LEDGER_GET_BALANCE: 'ledger.getBalance',
  LEDGER_GET_HISTORY: 'ledger.getHistory',
  
  // Stream Management
  STREAM_START: 'stream.start',
  STREAM_STOP: 'stream.stop',
  STREAM_RESTART: 'stream.restart',
  STREAM_GET_STATUS: 'stream.getStatus',
  
  // AI Services
  AI_MODERATE: 'ai.moderate',
  AI_TRANSCRIBE: 'ai.transcribe',
  AI_SUMMARIZE: 'ai.summarize',
  AI_HYPE_DETECT: 'ai.hypeDetect',
  
  // Recording & Clips
  RECORDING_START: 'recording.start',
  RECORDING_STOP: 'recording.stop',
  CLIP_CREATE: 'clip.create',
} as const;

// ============================================================
// TYPED TOOL EXECUTORS
// Type-safe wrappers for common operations
// ============================================================

export async function loginUser(email: string, password: string) {
  return executeMCPTool<{ user: any; token: string }>(MCPTools.AUTH_LOGIN, { email, password });
}

export async function joinPanel(roomId: string, guestData: { name: string; streamKey: string }, authToken: string) {
  return executeMCPTool<{ position: number; guests: any[] }>(MCPTools.PANEL_JOIN, { roomId, guestData }, authToken);
}

export async function syncWatchParty(sessionId: string, clientTimestamp: number, authToken: string) {
  return executeMCPTool<{ serverTimestamp: number; drift: number; isSynced: boolean }>(
    MCPTools.WATCHPARTY_SYNC, 
    { sessionId, clientTimestamp }, 
    authToken
  );
}

export async function sendChatMessage(roomId: string, content: string, authToken: string) {
  return executeMCPTool<{ messageId: string; status: string }>(
    MCPTools.CHAT_SEND, 
    { roomId, content }, 
    authToken
  );
}

export async function createTransaction(amount: number, creatorId: string, platformFeePercent: number = 10, authToken: string) {
  return executeMCPTool<{ transactionId: string; platformAmount: number; creatorAmount: number }>(
    MCPTools.LEDGER_CREATE_TRANSACTION,
    { amount, creatorId, platformFeePercent },
    authToken
  );
}

export async function checkHypeVelocity(roomId: string, messageCount: number, timeWindow: number, authToken: string) {
  return executeMCPTool<{ isHype: boolean; velocity: number; shouldClip: boolean }>(
    MCPTools.AI_HYPE_DETECT,
    { roomId, messageCount, timeWindow },
    authToken
  );
}
