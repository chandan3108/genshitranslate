'use client';

import React, { useState } from 'react';
import { Turn, SuggestedReply } from '@/lib/types';
import { Volume2, Maximize2, Lightbulb, HelpCircle, MessageSquareQuote, CheckCircle2, ChevronRight, User, Store } from 'lucide-react';
import { playJapaneseSpeech, playEnglishSpeech } from '@/lib/audio';

interface ConversationListProps {
  turns: Turn[];
  isLoading: boolean;
  onSelectReply: (reply: SuggestedReply) => void;
  onOpenShowStaff: (turn: Turn) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  turns,
  isLoading,
  onSelectReply,
  onOpenShowStaff,
}) => {
  const [expandedNuanceId, setExpandedNuanceId] = useState<string | null>(null);

  const toggleNuance = (id: string) => {
    setExpandedNuanceId((prev) => (prev === id ? null : id));
  };

  if (turns.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-4">
        <div className="w-16 h-16 rounded-full bg-japan-card border border-japan-border flex items-center justify-center text-2xl shadow-inner">
          🗾
        </div>
        <div className="max-w-md space-y-1.5">
          <h2 className="text-base font-bold text-white">言視 (Genshi) is Ready</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Choose your venue above, then tap the mic or type. When locals speak, Genshi decodes their hidden intent and gives you 1-tap polite replies.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-left max-w-sm w-full pt-2">
          <div className="p-2.5 rounded-lg bg-japan-card/60 border border-japan-border/60 text-xs">
            <span className="font-semibold text-japan-cherry block mb-0.5">Tourist Mode</span>
            <span className="text-gray-400 text-[11px]">You speak/type English → Natural travel Japanese + Romaji.</span>
          </div>
          <div className="p-2.5 rounded-lg bg-japan-card/60 border border-japan-border/60 text-xs">
            <span className="font-semibold text-japan-gold block mb-0.5">Local Mode</span>
            <span className="text-gray-400 text-[11px]">Staff speaks Japanese → Cultural intent decoded + 1-tap replies.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
      {turns.map((turn) => {
        const isTourist = turn.speaker === 'tourist';
        const isNuanceExpanded = expandedNuanceId === turn.id;

        return (
          <div
            key={turn.id}
            className={`rounded-2xl border transition-all animate-fadeIn ${
              isTourist
                ? 'bg-japan-card border-japan-border shadow-md ml-2 sm:ml-6'
                : 'bg-gradient-to-br from-japan-indigo to-japan-card border-japan-gold/40 shadow-lg mr-2 sm:mr-6'
            }`}
          >
            {/* Turn Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-japan-border/50 text-xs">
              <div className="flex items-center gap-1.5 font-semibold">
                {isTourist ? (
                  <>
                    <User className="w-3.5 h-3.5 text-japan-cherry" />
                    <span className="text-japan-cherry">You (Tourist)</span>
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5 text-japan-gold" />
                    <span className="text-japan-gold">Local Staff / Japanese</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-gray-500">
                {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Turn Content */}
            <div className="p-4 space-y-3">
              {/* Input Original */}
              <div className="text-xs text-gray-400 italic">
                "{turn.input}"
              </div>

              {/* Translated Output */}
              <div className="space-y-1">
                {/* Japanese Kanji/Kana */}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-lg sm:text-xl font-bold text-white font-japanese tracking-wide select-all leading-relaxed">
                    {turn.japanese}
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => playJapaneseSpeech(turn.japanese)}
                      title="Play Japanese audio"
                      className="p-1.5 rounded-lg bg-japan-slate hover:bg-japan-border text-gray-300 hover:text-white transition-colors"
                    >
                      <Volume2 className="w-4 h-4 text-japan-cherry" />
                    </button>
                    {isTourist && (
                      <button
                        onClick={() => onOpenShowStaff(turn)}
                        title="Show Fullscreen Card to Staff"
                        className="p-1.5 rounded-lg bg-japan-slate hover:bg-japan-border text-gray-300 hover:text-white transition-colors"
                      >
                        <Maximize2 className="w-4 h-4 text-japan-gold" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Spaced Hepburn Romaji for natural reading */}
                <p className="text-xs sm:text-sm font-medium text-japan-cherry tracking-wider">
                  {turn.romaji}
                </p>

                {/* Natural English */}
                <p className="text-xs sm:text-sm text-gray-300 font-normal">
                  {turn.english}
                </p>
              </div>

              {/* Local Mode: Situational Intent Decoder ("What they actually mean") */}
              {turn.situationalIntent && (
                <div className="p-2.5 rounded-xl bg-japan-indigo/90 border border-japan-gold/50 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-japan-gold text-[11px] uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Situational Intent (What they mean):</span>
                  </div>
                  <p className="text-gray-200 text-xs leading-relaxed">
                    {turn.situationalIntent}
                  </p>
                </div>
              )}

              {/* Nuance Explainer Pill (Why this phrase was chosen) */}
              {turn.nuance && (
                <div className="space-y-1">
                  <button
                    onClick={() => toggleNuance(turn.id)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-japan-cherry/90 hover:text-japan-cherry transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{isNuanceExpanded ? 'Hide Phrasing Nuance' : 'Why this phrasing? (Nuance)'}</span>
                  </button>
                  {isNuanceExpanded && (
                    <div className="p-2.5 rounded-xl bg-japan-slate/60 border border-japan-border text-xs text-gray-300 space-y-1 animate-fadeIn">
                      <p className="text-[11px] leading-relaxed text-gray-200">
                        {turn.nuance}
                      </p>
                      {turn.culturalTip && (
                        <p className="text-[10px] text-japan-gold pt-1 border-t border-japan-border/40">
                          🏮 <span className="font-semibold">Etiquette Tip:</span> {turn.culturalTip}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Local Mode: 1-Tap Polite Quick Replies */}
              {turn.suggestedReplies && turn.suggestedReplies.length > 0 && (
                <div className="pt-2 border-t border-japan-border/60 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    1-Tap Polite Responses:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {turn.suggestedReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => onSelectReply(reply)}
                        className="text-left p-2.5 rounded-xl bg-japan-slate/70 hover:bg-japan-slate border border-japan-border hover:border-japan-cherry/60 transition-all group flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-white group-hover:text-japan-cherry">
                              {reply.label}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-japan-gold font-japanese truncate">
                            {reply.japanese}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {reply.romaji}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-japan-cherry flex-shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-2xl border border-japan-border bg-japan-card/80 p-4 space-y-3 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-japan-crimson/50"></div>
            <div className="h-3 w-32 bg-japan-slate rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-japan-slate rounded"></div>
            <div className="h-3 w-1/2 bg-japan-slate rounded"></div>
          </div>
          <p className="text-xs text-japan-gold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-japan-gold animate-ping"></span>
            Genshi is analyzing situational nuance and cultural context...
          </p>
        </div>
      )}
    </div>
  );
};
