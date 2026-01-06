import React from 'react';

interface InstallPromptProps {
  isVisible: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ isVisible, onInstall, onDismiss }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center md:justify-end pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 bg-[rgba(9,14,28,0.92)] p-5 shadow-[0_24px_60px_rgba(6,10,20,0.45)] backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400/30 via-sky-500/20 to-amber-400/30 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
            <svg className="h-full w-full text-cyan-200" fill="none" viewBox="0 0 24 24">
              <path d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.2l5-.7L12 3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Install Aletheia</h3>
            <p className="mt-1 text-sm text-[var(--text-subtle)]">
              Keep the simulation lab on your home screen for instant access and offline mode.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={onInstall}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_10px_20px_rgba(93,212,255,0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                Install app
              </button>
              <button
                onClick={onDismiss}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/30 hover:text-white"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="rounded-full border border-transparent p-1 text-white/40 transition-colors hover:text-white"
            aria-label="Dismiss install prompt"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
