'use client';

import React, { useState } from 'react';
import { SituationConfig, QuickAction, ExpectedPhrase, Tone } from '@/lib/types';
import { Sparkles, Info, ChevronDown, ChevronUp, Volume2, Sliders } from 'lucide-react';
import { playJapaneseSpeech } from '@/lib/audio';

interface SituationBarProps {
  currentSituation: SituationConfig;
  onSelectQuickAction: (action: QuickAction) => void;
  tone?: Tone;
  hasCustomContext?: boolean;
  onOpenContextModal?: () => void;
}

export const SituationBar: React.FC<SituationBarProps> = ({
  currentSituation,
  onSelectQuickAction,
  tone = 'polite',
  hasCustomContext = false,
  onOpenContextModal,
}) => {
  const [showPhrases, setShowPhrases] = useState(false);

  return (
    <div className="bg-japan-indigo/90 border-b border-japan-border px-3 py-1.5 text-white">
      <div className="max-w-2xl mx-auto space-y-1.5">
        {/* Single Compact Quick Chip Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 no-scrollbar flex-1 min-w-0">
            <span className="text-[10px] font-bold text-japan-gold uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick:
            </span>
            {currentSituation.quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onSelectQuickAction(action)}
                className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-japan-card hover:bg-japan-slate text-japan-cherry hover:text-white border border-japan-border/80 transition-colors flex items-center gap-1 font-medium shadow-sm"
                title={`${action.english} (${action.romaji})`}
              >
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Tone & Context pill */}
            {onOpenContextModal && (
              <button
                onClick={onOpenContextModal}
                className={`text-[10px] flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all font-semibold ${
                  tone === 'casual'
                    ? 'bg-amber-500/20 border-amber-500/70 text-amber-300 hover:bg-amber-500/30'
                    : tone === 'formal'
                    ? 'bg-indigo-500/20 border-indigo-500/70 text-indigo-300 hover:bg-indigo-500/30'
                    : hasCustomContext
                    ? 'bg-japan-card border-japan-cherry/70 text-japan-cherry hover:bg-japan-slate'
                    : 'bg-japan-card border-japan-border/80 text-gray-300 hover:text-white hover:bg-japan-slate'
                }`}
                title="Customize AI politeness tone and traveler context notes"
              >
                <Sliders className="w-3 h-3" />
                <span>{tone === 'casual' ? 'Casual' : tone === 'formal' ? 'Formal' : 'Tone'}</span>
                {hasCustomContext && (
                  <span className="w-1.5 h-1.5 rounded-full bg-japan-cherry" title="Custom Context Active" />
                )}
              </button>
            )}

            {/* Toggle Phrases button */}
            <button
              onClick={() => setShowPhrases(!showPhrases)}
              className="text-[10px] text-gray-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-full bg-japan-card border border-japan-border/80 transition-colors font-medium"
              title="Common phrases staff say here"
            >
              <Info className="w-3 h-3 text-japan-gold" />
              <span className="hidden sm:inline">Phrases</span>
              {showPhrases ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Expandable Expected Phrases Drawer */}
        {showPhrases && (
          <div className="p-3 rounded-2xl bg-japan-card border border-japan-border text-xs text-gray-300 space-y-2.5 animate-fadeIn shadow-xl">
            <div className="flex items-center justify-between border-b border-japan-border/60 pb-1.5">
              <span className="font-bold text-white text-xs">
                Phrases staff frequently say at {currentSituation.name}:
              </span>
              <span className="text-[10px] text-japan-cherry">Tap speaker to listen</span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {currentSituation.commonPhrasesToExpect.map((item: ExpectedPhrase, idx: number) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-japan-indigo/70 border border-japan-border/60 flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-white font-japanese">
                      {item.japanese}
                    </p>
                    <p className="text-[11px] font-medium text-japan-cherry">
                      {item.romaji}
                    </p>
                    <p className="text-[11px] text-gray-300">
                      "{item.english}"
                    </p>
                    {item.tip && (
                      <p className="text-[10px] text-japan-gold pt-0.5">
                        Note: {item.tip}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => playJapaneseSpeech(item.japanese)}
                    title="Listen to native pronunciation"
                    className="p-1.5 rounded-lg bg-japan-slate group-hover:bg-japan-crimson text-gray-300 group-hover:text-white transition-colors flex-shrink-0 mt-0.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
