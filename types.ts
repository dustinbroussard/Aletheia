
export type Role = 'system' | 'user' | 'model';
export type ModelProvider = 'gemini' | 'openrouter';

export interface Persona {
  id: string;
  name: string;
  avatar: string;
  color: string;
  systemPrompt: string;
  provider: ModelProvider;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface MessageMetadata {
  latencyMs: number;
  tokenCount: number;
  timestamp: number;
  costEstimate: number;
  reasoning?: string;
}

export interface Message {
  id: string;
  agentId: string; // The ID of the persona who generated this
  agentName: string;
  content: string;
  role: Role;
  metadata: MessageMetadata;
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  genesisPrompt: string;
  metaInstructions: string;
  currentAgentIndex: number;
  messages: Message[];
  personas: Persona[];
  openRouterKey: string;
}
