'use client';

import React from 'react';
import { Volume2, RefreshCw, Smartphone, Radio, LayoutGrid, Ear } from 'lucide-react';
import { SituationConfig } from '@/lib/types';

interface HeaderProps {
  currentSituation: SituationConfig;
  continuousMode: boolean;
  ambientCopilot: boolean;
  onToggleContinuous: () => void;
  onToggleAmbientCopilot: () => void;
  onOpenCounterBoard: () => void;
  onOpenFaceToFace: () => void;
  onOpenVoiceSettings: () => void;
  onClearHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSituation,
  continuousMode,
  ambientCopilot,
  onToggleContinuous,
  onToggleAmbientCopilot,
  onOpenCounterBoard,
  onOpenFaceToFace,
  onOpenVoiceSettings,
  onClearHistory,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-japan-indigo/95 backdrop-blur-md border-b border-japan-border px-3 sm:px-4 pt-header-safe pb-2.5 text-white shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-japan-crimson flex items-center justify-center font-bold text-white shadow-md text-sm flex-shrink-0">
            言
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-wide">GENSHI</span>
              <span className="text-[10px] px-1 py-0.5 rounded bg-japan-crimson/30 text-japan-cherry font-medium border border-japan-crimson/50">
                言視
              </span>
            </div>
            <p className="text-[10px] text-gray-300 flex items-center gap-1 truncate">
              <span>{currentSituation.icon}</span>
              <span className="font-medium text-japan-cherry">{currentSituation.name}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Ambient Copilot Toggle (Passenger / Taxi Mode) */}
          <button
            onClick={onToggleAmbientCopilot}
            title={ambientCopilot ? "Ambient Passenger Mode ON (Ignores English, captures Japanese)" : "Ambient Passenger Mode OFF"}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              ambientCopilot
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/70 shadow-sm ring-1 ring-amber-400/40 animate-pulse'
                : 'bg-japan-card text-gray-300 hover:text-white border border-japan-border'
            }`}
          >
            <Ear className={`w-3.5 h-3.5 ${ambientCopilot ? 'text-amber-400' : 'text-gray-400'}`} />
            <span className="hidden md:inline">{ambientCopilot ? 'Copilot (JA Only)' : 'Copilot'}</span>
          </button>

          {/* Hands-free continuous live conversation */}
          <button
            onClick={onToggleContinuous}
            title={continuousMode ? "Live Convo ON (Auto-Looping)" : "Live Convo OFF"}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              continuousMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-sm animate-pulse'
                : 'bg-japan-card text-gray-300 hover:text-white border border-japan-border'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${continuousMode ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span className="hidden sm:inline">{continuousMode ? 'Live Convo' : 'Live'}</span>
          </button>

          {/* Zero-Speaking Counter Board */}
          <button
            onClick={onOpenCounterBoard}
            title="Zero-Speaking Counter Board (Touch & Speak)"
            className="p-1.5 rounded-lg bg-japan-card hover:bg-japan-slate text-japan-gold border border-japan-border transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Voice settings */}
          <button
            onClick={onOpenVoiceSettings}
            title="Japanese Voice & Audio Settings"
            className="p-1.5 rounded-lg bg-japan-card hover:bg-japan-slate text-japan-cherry border border-japan-border transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Face to Face mode button */}
          <button
            onClick={onOpenFaceToFace}
            title="Split-Screen Table Mode (Face-to-Face)"
            className="p-1.5 rounded-lg bg-japan-card hover:bg-japan-slate text-gray-200 border border-japan-border transition-colors"
          >
            <Smartphone className="w-4 h-4 text-japan-gold" />
          </button>

          {/* Reset buffer button */}
          {historyCount > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear Conversation History"
              className="p-1.5 rounded-lg bg-japan-card hover:bg-japan-slate text-gray-400 hover:text-red-400 border border-japan-border transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
