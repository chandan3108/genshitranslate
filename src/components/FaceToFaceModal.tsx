'use client';

import React from 'react';
import { X, Mic, Square, Volume2, Store, User } from 'lucide-react';
import { Turn } from '@/lib/types';
import { playJapaneseSpeech } from '@/lib/audio';

interface FaceToFaceModalProps {
  lastTurn: Turn | null;
  isLoading: boolean;
  onSpeakLocal: () => void;
  onSpeakTourist: () => void;
  isRecording: boolean;
  recordingDuration: number;
  activeSpeaker: 'local' | 'tourist';
  onClose: () => void;
}

export const FaceToFaceModal: React.FC<FaceToFaceModalProps> = ({
  lastTurn,
  isLoading,
  onSpeakLocal,
  onSpeakTourist,
  isRecording,
  recordingDuration,
  activeSpeaker,
  onClose,
}) => {
  const isRecordingJa = isRecording && activeSpeaker === 'local';
  const isRecordingEn = isRecording && activeSpeaker === 'tourist';

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none animate-fadeIn">
      {/* ================= TOP HALF (FACES JAPANESE LOCAL - ROTATED 180°) ================= */}
      <div className="flex-1 bg-japan-indigo p-6 flex flex-col justify-between transform rotate-180 border-b border-japan-border relative">
        <div className="flex items-center justify-between text-xs text-japan-gold">
          <div className="flex items-center gap-1.5 font-bold">
            <Store className="w-4 h-4" />
            <span>日本語（店員・相手側）</span>
          </div>
          <span className="text-[10px] text-gray-400">相手に向ける面</span>
        </div>

        {/* Japanese Content */}
        <div className="my-auto text-center space-y-2">
          {lastTurn ? (
            <div className="space-y-2">
              <p className="text-2xl sm:text-4xl font-extrabold text-white font-japanese leading-relaxed">
                {lastTurn.japanese}
              </p>
              <button
                onClick={() => playJapaneseSpeech(lastTurn.japanese)}
                className="inline-flex items-center gap-1 text-xs text-japan-cherry hover:text-white px-3 py-1 rounded-full bg-japan-card border border-japan-border"
              >
                <Volume2 className="w-3.5 h-3.5" /> 音声再生
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-japanese">
              下のボタンを押してお話しください
            </p>
          )}
        </div>

        {/* Japanese Speak Button */}
        <div className="flex justify-center">
          <button
            onClick={onSpeakLocal}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-xl transition-all ${
              isRecordingJa
                ? 'bg-red-600 text-white ring-4 ring-red-500/50 animate-pulse'
                : 'bg-japan-gold text-japan-indigo hover:bg-yellow-500'
            }`}
          >
            {isRecordingJa ? <Square className="w-5 h-5 fill-white" /> : <Mic className="w-5 h-5" />}
            <span>{isRecordingJa ? `録音中 (${recordingDuration}s)... 押して完了` : '日本語で話す'}</span>
          </button>
        </div>
      </div>

      {/* ================= MIDDLE DIVIDER BAR ================= */}
      <div className="bg-japan-card border-y border-japan-border px-4 py-1.5 flex items-center justify-between text-xs text-gray-400 z-10">
        <span className="text-[10px] uppercase tracking-wider text-japan-gold font-bold">Tabletop Split Mode</span>
        <button
          onClick={onClose}
          className="p-1 rounded-full bg-japan-slate hover:bg-japan-border text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ================= BOTTOM HALF (FACES TOURIST - YOU) ================= */}
      <div className="flex-1 bg-japan-card p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-japan-cherry">
          <div className="flex items-center gap-1.5 font-bold">
            <User className="w-4 h-4" />
            <span>Tourist Side (English)</span>
          </div>
          <span className="text-[10px] text-gray-400">Facing You</span>
        </div>

        {/* English & Romaji Content */}
        <div className="my-auto text-center space-y-2">
          {isLoading ? (
            <p className="text-sm text-japan-gold animate-pulse">
              Translating with situational context...
            </p>
          ) : lastTurn ? (
            <div className="space-y-1.5">
              <p className="text-lg sm:text-2xl font-bold text-white">
                "{lastTurn.english}"
              </p>
              <p className="text-xs sm:text-sm font-medium text-japan-cherry">
                {lastTurn.romaji}
              </p>
              {lastTurn.situationalIntent && (
                <p className="text-[11px] text-japan-gold bg-japan-indigo/80 p-1.5 rounded-lg border border-japan-border inline-block max-w-sm">
                  💡 {lastTurn.situationalIntent}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Tap the button below to speak English.
            </p>
          )}
        </div>

        {/* Tourist Speak Button */}
        <div className="flex justify-center">
          <button
            onClick={onSpeakTourist}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-xl transition-all ${
              isRecordingEn
                ? 'bg-red-600 text-white ring-4 ring-red-500/50 animate-pulse'
                : 'bg-japan-crimson hover:bg-red-700 text-white'
            }`}
          >
            {isRecordingEn ? <Square className="w-5 h-5 fill-white" /> : <Mic className="w-5 h-5" />}
            <span>{isRecordingEn ? `Listening (${recordingDuration}s)... tap to send` : 'Speak English'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
