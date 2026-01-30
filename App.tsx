
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Persona, Message, SimulationState } from './types';
import { generateAgentResponse } from './geminiService';
import Sidebar from './components/Sidebar';
import SimulationTheater from './components/SimulationTheater';
import ConfigPanel from './components/ConfigPanel';
import Header from './components/Header';

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: '1',
    name: 'Socrates',
    avatar: 'https://picsum.photos/seed/socrates/200',
    color: '#3b82f6',
    systemPrompt: 'You are Socrates. Speak in the Socratic method. Question everything and seek truth through dialectic.',
    provider: 'gemini',
    model: 'gemini-3-flash-preview',
    temperature: 0.8,
    maxTokens: 500
  },
  {
    id: '2',
    name: 'Machiavelli',
    avatar: 'https://picsum.photos/seed/niccolo/200',
    color: '#ef4444',
    systemPrompt: 'You are Niccolò Machiavelli. You are pragmatic, cynical, and focused on power, statecraft, and realpolitik.',
    provider: 'gemini',
    model: 'gemini-3-flash-preview',
    temperature: 0.9,
    maxTokens: 500
  }
];

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    isPaused: false,
    genesisPrompt: "Discuss the nature of justice in a modern digital society.",
    metaInstructions: "Maintain your personas strictly. Keep responses concise (under 100 words).",
    currentAgentIndex: 0,
    messages: [],
    personas: DEFAULT_PERSONAS,
    openRouterKey: localStorage.getItem('openrouter_key') || ''
  });

  const [view, setView] = useState<'theater' | 'config'>('theater');
  const [streamingText, setStreamingText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const loopRef = useRef<boolean>(false);

  // Sync OpenRouter key to local storage for convenience
  useEffect(() => {
    localStorage.setItem('openrouter_key', state.openRouterKey);
  }, [state.openRouterKey]);

  const startSimulation = () => {
    setState(prev => ({ ...prev, isRunning: true, isPaused: false }));
    loopRef.current = true;
  };

  const pauseSimulation = () => {
    setState(prev => ({ ...prev, isPaused: true }));
    loopRef.current = false;
  };

  const resetSimulation = () => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      messages: [],
      currentAgentIndex: 0
    }));
    loopRef.current = false;
  };

  const handleNextTurn = useCallback(async () => {
    if (!loopRef.current || state.isPaused || isProcessing || state.personas.length === 0) return;

    setIsProcessing(true);
    const currentAgent = state.personas[state.currentAgentIndex];
    setStreamingText("");

    try {
      const response = await generateAgentResponse(
        currentAgent,
        state.messages.slice(-10), 
        state.genesisPrompt,
        state.metaInstructions,
        state.openRouterKey,
        (chunk) => setStreamingText(prev => prev + chunk)
      );

      const newMessage: Message = {
        id: crypto.randomUUID(),
        agentId: currentAgent.id,
        agentName: currentAgent.name,
        content: response.text,
        role: 'model',
        metadata: {
          latencyMs: response.latency,
          tokenCount: response.tokens,
          timestamp: Date.now(),
          costEstimate: (response.tokens / 1000000) * 0.15 
        }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        currentAgentIndex: (prev.currentAgentIndex + 1) % prev.personas.length
      }));
    } catch (error: any) {
      console.error("Simulation step failed:", error);
      pauseSimulation();
      alert(`Agent Error (${currentAgent.name}): ${error.message}`);
    } finally {
      setIsProcessing(false);
      setStreamingText("");
    }
  }, [state, isProcessing]);

  // Fix: Completed the simulation loop useEffect and handled the 'is' (isProcessing) reference to resolve truncation error
  useEffect(() => {
    let timeout: any;
    if (state.isRunning && !state.isPaused && !isProcessing) {
      timeout = setTimeout(() => {
        handleNextTurn();
      }, 1500);
    }
    return () => clearTimeout(timeout);
  }, [state.isRunning, state.isPaused, isProcessing, handleNextTurn]);

  // Fix: Added return statement to resolve "Type '() => void' is not assignable to type 'FC<{}>'" error
  return (
    <div className="flex flex-col h-screen bg-[#050505] text-gray-300 overflow-hidden">
      <Header 
        state={state} 
        onStart={startSimulation} 
        onPause={pauseSimulation} 
        onReset={resetSimulation} 
      />
      
      <main className="flex flex-1 overflow-hidden">
        <Sidebar state={state} setView={setView} currentView={view} />
        
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {view === 'theater' ? (
            <SimulationTheater 
              messages={state.messages}
              personas={state.personas}
              streamingText={streamingText}
              currentAgentId={state.personas[state.currentAgentIndex]?.id || ''}
              isProcessing={isProcessing}
            />
          ) : (
            <ConfigPanel state={state} setState={setState} />
          )}
        </div>
      </main>
    </div>
  );
};

// Fix: Added default export to resolve "Module '"file:///App"' has no default export."
export default App;
