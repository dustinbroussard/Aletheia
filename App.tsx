
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Persona, Message, SimulationState, SavedPersona } from './types';
import { generateAgentResponse } from './geminiService';
import Sidebar from './components/Sidebar';
import SimulationTheater from './components/SimulationTheater';
import ConfigPanel from './components/ConfigPanel';
import Header from './components/Header';
import InstallPrompt from './components/InstallPrompt';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const INSTALL_PROMPT_SESSION_KEY = 'pwa_install_prompt_session';
const INSTALL_PROMPT_LAST_SHOWN_KEY = 'pwa_install_prompt_last_shown';
const INSTALL_PROMPT_COOLDOWN_DAYS = 0;
const SAVED_PERSONAS_KEY = 'aletheia_saved_personas';

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

  const [savedPersonas, setSavedPersonas] = useState<SavedPersona[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_PERSONAS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (error) {
      console.warn('Failed to parse saved personas', error);
      return [];
    }
  });

  const [view, setView] = useState<'theater' | 'config'>('theater');
  const [streamingText, setStreamingText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const loopRef = useRef<boolean>(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Sync OpenRouter key to local storage for convenience
  useEffect(() => {
    localStorage.setItem('openrouter_key', state.openRouterKey);
  }, [state.openRouterKey]);

  useEffect(() => {
    localStorage.setItem(SAVED_PERSONAS_KEY, JSON.stringify(savedPersonas));
  }, [savedPersonas]);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone;

    if (isStandalone) {
      setShowInstallPrompt(false);
      return;
    }

    if (!installPromptEvent) return;

    const dismissedThisSession = sessionStorage.getItem(INSTALL_PROMPT_SESSION_KEY) === '1';
    if (dismissedThisSession) return;

    if (INSTALL_PROMPT_COOLDOWN_DAYS > 0) {
      const lastShown = Number(localStorage.getItem(INSTALL_PROMPT_LAST_SHOWN_KEY) || 0);
      const cooldownMs = INSTALL_PROMPT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() - lastShown < cooldownMs) return;
    }

    setShowInstallPrompt(true);
  }, [installPromptEvent]);

  const markInstallPromptDismissed = () => {
    sessionStorage.setItem(INSTALL_PROMPT_SESSION_KEY, '1');
    if (INSTALL_PROMPT_COOLDOWN_DAYS > 0) {
      localStorage.setItem(INSTALL_PROMPT_LAST_SHOWN_KEY, Date.now().toString());
    }
  };

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    setShowInstallPrompt(false);
    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    markInstallPromptDismissed();
    if (choice.outcome === 'accepted') {
      setInstallPromptEvent(null);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    markInstallPromptDismissed();
  };

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

  const savePersona = (persona: Persona) => {
    setSavedPersonas(prev => [
      {
        ...persona,
        savedId: crypto.randomUUID(),
        savedAt: Date.now()
      },
      ...prev
    ]);
  };

  const updateSavedPersona = (savedId: string, updates: Partial<SavedPersona>) => {
    setSavedPersonas(prev => prev.map(p => p.savedId === savedId ? { ...p, ...updates } : p));
  };

  const deleteSavedPersona = (savedId: string) => {
    setSavedPersonas(prev => prev.filter(p => p.savedId !== savedId));
  };

  const recallSavedPersona = (savedId: string) => {
    const saved = savedPersonas.find(p => p.savedId === savedId);
    if (!saved) return;
    const { savedId: _savedId, savedAt: _savedAt, ...persona } = saved;
    const newPersona: Persona = {
      ...persona,
      id: crypto.randomUUID()
    };
    setState(prev => ({ ...prev, personas: [...prev.personas, newPersona] }));
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
    <div className="flex flex-col h-full bg-[var(--bg-ink)] text-[var(--text-main)] overflow-hidden">
      <Header 
        state={state} 
        onStart={startSimulation} 
        onPause={pauseSimulation} 
        onReset={resetSimulation} 
      />
      
      <main className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar 
          state={state} 
          setView={setView} 
          currentView={view} 
          savedPersonas={savedPersonas}
          onRecallSavedPersona={recallSavedPersona}
          onDeleteSavedPersona={deleteSavedPersona}
          onUpdateSavedPersona={updateSavedPersona}
        />
        
        <div className="flex-1 min-h-0 p-6 overflow-hidden flex flex-col">
          {view === 'theater' ? (
            <SimulationTheater 
              messages={state.messages}
              personas={state.personas}
              streamingText={streamingText}
              currentAgentId={state.personas[state.currentAgentIndex]?.id || ''}
              isProcessing={isProcessing}
            />
          ) : (
            <ConfigPanel state={state} setState={setState} onSavePersona={savePersona} />
          )}
        </div>
      </main>
      <InstallPrompt
        isVisible={showInstallPrompt}
        onInstall={handleInstall}
        onDismiss={handleDismissInstall}
      />
    </div>
  );
};

// Fix: Added default export to resolve "Module '"file:///App"' has no default export."
export default App;
