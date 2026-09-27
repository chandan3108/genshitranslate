'use client';

import React, { useState } from 'react';
import { SITUATIONS } from '@/lib/situations';
import { SituationConfig, SituationId, QuickAction, ExpectedPhrase } from '@/lib/types';
import { Sparkles, Info, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { playJapaneseSpeech } from '@/lib/audio';

interface SituationBarProps {
  currentSituation: SituationConfig;
  onSelectSituation: (id: SituationId) => void;
  onSelectQuickAction: (action: QuickAction) => void;
}

export const SituationBar: React.FC<SituationBarProps> = ({
  currentSituation,
  onSelectSituation,
  onSelectQuickAction,
}) => {
  const [showTips, setShowTips] = useState(false);
  const situationList = Object.values(SITUATIONS);

  return (
    <div className="bg-japan-indigo border-b border-japan-border px-3 py-2 text-white">
      <div className="max-w-2xl mx-auto space-y-2">
        {/* Horizontal Scrollable Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 no-scrollbar">
          {situationList.map((sit) => {
            const isSelected = sit.id === currentSituation.id;
            return (
              <button
                key={sit.id}
                onClick={() => onSelectSituation(sit.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-japan-crimson text-white shadow-md shadow-japan-crimson/30 ring-1 ring-white/30 scale-105'
                    : 'bg-japan-card/80 text-gray-300 hover:text-white hover:bg-japan-slate border border-japan-border/60'
                }`}
              >
                <span>{sit.icon}</span>
                <span>{sit.name}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">{sit.japaneseName}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Action Chips for Current Situation */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 no-scrollbar">
            <span className="text-[11px] font-semibold text-japan-gold uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick:
            </span>
            {currentSituation.quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onSelectQuickAction(action)}
                className="flex-shrink-0 text-xs px-2.5 py-1 rounded-md bg-japan-slate/60 hover:bg-japan-slate text-japan-cherry hover:text-white border border-japan-border transition-colors flex items-center gap-1"
                title={`${action.english} (${action.romaji})`}
              >
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {/* Toggle Venue Tips & Expected Phrases */}
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex-shrink-0 text-[11px] text-japan-gold hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-full bg-japan-card border border-japan-border transition-colors font-medium"
          >
            <Info className="w-3.5 h-3.5 text-japan-gold" />
            <span>Venue Phrases</span>
            {showTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expandable Expected Phrases with Romaji & Audio */}
        {showTips && (
          <div className="mt-2 p-3.5 rounded-xl bg-japan-card border border-japan-border text-xs text-gray-300 space-y-3 animate-fadeIn shadow-xl">
            <div className="flex items-center justify-between border-b border-japan-border/60 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{currentSituation.icon}</span>
                <span className="font-bold text-white text-xs">Phrases Staff Frequently Say Here:</span>
              </div>
              <span className="text-[10px] text-japan-cherry">Tap speaker icon to listen</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {currentSituation.commonPhrasesToExpect.map((item: ExpectedPhrase, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-japan-indigo/70 border border-japan-border/60 hover:border-japan-cherry/40 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-bold text-white font-japanese">
                      {item.japanese}
                    </p>
                    <p className="text-xs font-medium text-japan-cherry">
                      {item.romaji}
                    </p>
                    <p className="text-[11px] text-gray-300 font-normal">
                      "{item.english}"
                    </p>
                    {item.tip && (
                      <p className="text-[10px] text-japan-gold pt-0.5">
                        💡 {item.tip}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => playJapaneseSpeech(item.japanese)}
                    title="Listen to native pronunciation"
                    className="p-2 rounded-lg bg-japan-slate group-hover:bg-japan-crimson text-gray-300 group-hover:text-white transition-colors flex-shrink-0 mt-0.5"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-gray-400 border-t border-japan-border/40 pt-2 flex items-center gap-1">
              <span>🏮</span>
              <span>{currentSituation.description}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
