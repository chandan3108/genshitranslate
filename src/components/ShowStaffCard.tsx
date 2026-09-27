'use client';

import React from 'react';
import { X, Volume2, Maximize2 } from 'lucide-react';
import { playJapaneseSpeech } from '@/lib/audio';

interface ShowStaffCardProps {
  japanese: string;
  romaji: string;
  english: string;
  onClose: () => void;
}

export const ShowStaffCard: React.FC<ShowStaffCardProps> = ({
  japanese,
  romaji,
  english,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col justify-between p-6 sm:p-10 animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-japan-gold font-bold flex items-center gap-1.5">
          <Maximize2 className="w-4 h-4" /> Show Screen To Staff
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-japan-card hover:bg-japan-slate text-gray-300 hover:text-white border border-japan-border transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Massive Japanese Text */}
      <div className="my-auto text-center space-y-6">
        <div className="bg-japan-card/90 border-2 border-japan-crimson/80 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-japan-crimson/20">
          <p className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-relaxed tracking-wider font-japanese select-all">
            {japanese}
          </p>
        </div>

        {/* Romaji & English for the Tourist */}
        <div className="space-y-2 max-w-xl mx-auto">
          <p className="text-base sm:text-xl font-medium text-japan-cherry tracking-wide">
            {romaji}
          </p>
          <p className="text-sm sm:text-base text-gray-400 italic">
            "{english}"
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => playJapaneseSpeech(japanese)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-japan-crimson hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-japan-crimson/40 transition-transform active:scale-95"
        >
          <Volume2 className="w-5 h-5" />
          <span>Play Native Audio</span>
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full bg-japan-card hover:bg-japan-slate text-gray-300 hover:text-white text-sm font-medium border border-japan-border transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
