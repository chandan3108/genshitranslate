'use client';

import React from 'react';
import {
  X,
  Radio,
  Ear,
  Smartphone,
  Volume2,
  Trash2,
  ChevronRight,
  Sparkles,
  Layers,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { SITUATIONS } from '@/lib/situations';
import { SituationConfig, SituationId, Tone } from '@/lib/types';
import { SituationIcon } from './SituationIcon';
import { Sliders } from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSituation: SituationConfig;
  onSelectSituation: (id: SituationId) => void;
  continuousMode: boolean;
  ambientCopilot: boolean;
  tone: Tone;
  customContext: string;
  onSelectTone: (tone: Tone) => void;
  onOpenContextModal: () => void;
  onToggleContinuous: () => void;
  onToggleAmbientCopilot: () => void;
  onOpenVoiceSettings: () => void;
  onOpenFaceToFace: () => void;
  onClearHistory: () => void;
  historyCount: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  currentSituation,
  onSelectSituation,
  continuousMode,
  ambientCopilot,
  tone,
  customContext,
  onSelectTone,
  onOpenContextModal,
  onToggleContinuous,
  onToggleAmbientCopilot,
  onOpenVoiceSettings,
  onOpenFaceToFace,
  onClearHistory,
  historyCount,
}) => {
  if (!isOpen) return null;

  const situationsList = Object.values(SITUATIONS);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      {/* Drawer Container */}
      <div className="relative w-80 max-w-[85vw] bg-japan-indigo/98 border-r border-japan-border h-full flex flex-col z-10 shadow-2xl text-white">
        {/* Drawer Header */}
        <div className="p-4 border-b border-japan-border flex items-center justify-between pt-header-safe">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-japan-crimson flex items-center justify-center font-bold text-white shadow-sm text-sm">
              言
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">GENSHI</h2>
              <p className="text-[10px] text-gray-400">Japan Travel Copilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-japan-slate text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section 1: Travel Venues */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Travel Venues
            </span>
            <div className="space-y-1">
              {situationsList.map((sit) => {
                const isActive = sit.id === currentSituation.id;
                return (
                  <button
                    key={sit.id}
                    onClick={() => {
                      onSelectSituation(sit.id);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-japan-crimson/20 border-japan-crimson text-white font-medium shadow-sm'
                        : 'bg-japan-card/60 border-japan-border/60 hover:bg-japan-slate text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isActive ? 'bg-japan-crimson text-white' : 'bg-japan-slate text-gray-400'
                        }`}
                      >
                        <SituationIcon id={sit.id} className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold truncate">{sit.name}</p>
                        <p className="text-[10px] text-gray-400">{sit.japaneseName}</p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-japan-cherry flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: AI Tone & Custom Context */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                AI Tone & Context
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenContextModal();
                }}
                className="text-[10px] text-japan-cherry hover:text-white transition-colors font-medium"
              >
                Customize
              </button>
            </div>

            {/* Quick 3-Way Tone Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-japan-slate/60 p-1 rounded-xl border border-japan-border/60">
              <button
                onClick={() => onSelectTone('casual')}
                className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                  tone === 'casual'
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
                title="Casual / Friendly (ため口) - No keigo"
              >
                <span className="text-[11px] block leading-tight">Casual</span>
                <span className="text-[9px] opacity-80 block leading-tight">ため口</span>
              </button>

              <button
                onClick={() => onSelectTone('polite')}
                className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                  tone === 'polite'
                    ? 'bg-japan-crimson text-white font-bold shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
                title="Standard Travel Polite (丁寧語 - です/ます)"
              >
                <span className="text-[11px] block leading-tight">Polite</span>
                <span className="text-[9px] opacity-80 block leading-tight">丁寧語</span>
              </button>

              <button
                onClick={() => onSelectTone('formal')}
                className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                  tone === 'formal'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
                title="Formal / Business Keigo (敬語)"
              >
                <span className="text-[11px] block leading-tight">Formal</span>
                <span className="text-[9px] opacity-80 block leading-tight">敬語</span>
              </button>
            </div>

            {/* Custom Context Preview Card */}
            <button
              onClick={() => {
                onClose();
                onOpenContextModal();
              }}
              className="w-full p-2.5 rounded-xl bg-japan-card/60 border border-japan-border/60 hover:bg-japan-slate text-left flex items-center justify-between transition-colors group"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sliders className="w-3.5 h-3.5 text-japan-gold flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-200">
                    {customContext ? 'Traveler Context Active' : 'Custom Context'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 truncate">
                  {customContext ? customContext : 'Dietary, companions, social notes...'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors flex-shrink-0" />
            </button>
          </div>

          {/* Section 2: Listening & Dialogue Modes */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Listening Modes
            </span>
            <div className="space-y-2">
              {/* Ambient Copilot */}
              <div
                onClick={onToggleAmbientCopilot}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  ambientCopilot
                    ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-400/40'
                    : 'bg-japan-card/60 border-japan-border/60 hover:bg-japan-slate'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Ear className={`w-4 h-4 ${ambientCopilot ? 'text-amber-400' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold">Ambient Copilot</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      ambientCopilot
                        ? 'bg-amber-500 text-black'
                        : 'bg-japan-slate text-gray-400'
                    }`}
                  >
                    {ambientCopilot ? 'Active' : 'Off'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Leave phone on taxi seat or table. Silently ignores English family banter and only translates when Japanese is spoken.
                </p>
              </div>

              {/* Hands-Free Live Convo */}
              <div
                onClick={onToggleContinuous}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  continuousMode
                    ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-400/40'
                    : 'bg-japan-card/60 border-japan-border/60 hover:bg-japan-slate'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${continuousMode ? 'text-emerald-400' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold">Live Conversation</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      continuousMode
                        ? 'bg-emerald-500 text-black'
                        : 'bg-japan-slate text-gray-400'
                    }`}
                  >
                    {continuousMode ? 'Active' : 'Off'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Continuous back-and-forth speech detection without tapping mic repeatedly.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Tools & Audio */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Preferences & Tools
            </span>
            <div className="space-y-1.5">
              {/* Voice Settings */}
              <button
                onClick={() => {
                  onClose();
                  onOpenVoiceSettings();
                }}
                className="w-full p-2.5 rounded-xl bg-japan-card/60 border border-japan-border/60 hover:bg-japan-slate text-left flex items-center justify-between text-xs text-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-japan-cherry" />
                  <span>Japanese Voice & Audio</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>

              {/* Face to Face */}
              <button
                onClick={() => {
                  onClose();
                  onOpenFaceToFace();
                }}
                className="w-full p-2.5 rounded-xl bg-japan-card/60 border border-japan-border/60 hover:bg-japan-slate text-left flex items-center justify-between text-xs text-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-japan-gold" />
                  <span>Tabletop Split Screen</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Section 4: History */}
          {historyCount > 0 && (
            <div className="pt-2 border-t border-japan-border/60">
              <button
                onClick={() => {
                  onClearHistory();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl bg-red-950/30 border border-red-900/50 hover:bg-red-950/60 text-left flex items-center gap-2 text-xs text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Clear Conversation History ({historyCount})</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-japan-border text-center text-[10px] text-gray-500 pb-dock-safe">
          Genshi Travel Engine · Vercel Production
        </div>
      </div>
    </div>
  );
};
