'use client';

import React from 'react';
import { X, Volume2, Maximize2, Sparkles, Send } from 'lucide-react';
import { COUNTER_CARDS } from '@/lib/counterCards';
import { CounterCard, SituationId, Turn } from '@/lib/types';
import { playJapaneseSpeech } from '@/lib/audio';

interface CounterBoardProps {
  situation: SituationId;
  onClose: () => void;
  onSelectCard: (card: CounterCard) => void;
  onEnlargeCard: (card: CounterCard) => void;
}

export const CounterBoard: React.FC<CounterBoardProps> = ({
  situation,
  onClose,
  onSelectCard,
  onEnlargeCard,
}) => {
  const cards = COUNTER_CARDS[situation] || COUNTER_CARDS.konbini;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-japan-card border border-japan-border rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-japan-border flex items-center justify-between bg-japan-indigo/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Zero-Speaking Counter Board
              </h3>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Read the <span className="text-japan-cherry font-semibold">Romaji</span> aloud, or tap to show the clerk silently.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-japan-slate text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Grid */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {cards.map((card) => (
            <div
              key={card.id}
              className="p-3.5 rounded-2xl bg-japan-indigo/60 border border-japan-border hover:border-japan-cherry/60 transition-all flex flex-col justify-between gap-2.5 group shadow-sm"
            >
              {/* Card Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-japan-gold flex items-center gap-1.5">
                    <span>{card.icon}</span>
                    <span>{card.label}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 italic">
                    "{card.english}"
                  </span>
                </div>

                {/* Japanese Kanji/Kana */}
                <p className="text-base sm:text-lg font-extrabold text-white font-japanese tracking-wide">
                  {card.japanese}
                </p>

                {/* Prominent Syllable Romaji for Direct Pronunciation */}
                <p className="text-xs sm:text-sm font-bold text-japan-cherry tracking-wider">
                  {card.romaji}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-japan-border/40">
                <div className="flex items-center gap-1.5">
                  {/* Audio speak */}
                  <button
                    onClick={() => playJapaneseSpeech(card.japanese)}
                    className="p-1.5 rounded-lg bg-japan-slate hover:bg-japan-border text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                    title="Play Audio"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-japan-cherry" />
                    <span className="text-[10px]">Play</span>
                  </button>

                  {/* Enlarge to show clerk */}
                  <button
                    onClick={() => onEnlargeCard(card)}
                    className="p-1.5 rounded-lg bg-japan-slate hover:bg-japan-border text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                    title="Show to Clerk Full-Screen"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-japan-gold" />
                    <span className="text-[10px]">Show Clerk</span>
                  </button>
                </div>

                {/* Add directly to conversation */}
                <button
                  onClick={() => onSelectCard(card)}
                  className="px-3 py-1.5 rounded-lg bg-japan-crimson hover:bg-red-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>Use This</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-japan-border text-center bg-japan-indigo/80">
          <p className="text-[11px] text-gray-400">
            💡 Simply read the pink Romaji syllables out loud to the clerk!
          </p>
        </div>
      </div>
    </div>
  );
};
