'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Send, Sparkles, Radio, User, Languages, AlertCircle } from 'lucide-react';
import { Speaker } from '@/lib/types';

interface InputDockProps {
  currentSpeaker: Speaker;
  onToggleSpeaker: () => void;
  onSendMessage: (text: string, speaker: Speaker) => void;
  isRecording: boolean;
  audioLevel: number;
  recordingDuration: number;
  onToggleRecording: () => void;
  isLoading: boolean;
  recorderError?: string | null;
}

export const InputDock: React.FC<InputDockProps> = ({
  currentSpeaker,
  onToggleSpeaker,
  onSendMessage,
  isRecording,
  audioLevel,
  recordingDuration,
  onToggleRecording,
  isLoading,
  recorderError,
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    onSendMessage(inputText.trim(), currentSpeaker);
    setInputText('');
  };

  const getSpeakerBadge = () => {
    if (currentSpeaker === 'auto') {
      return (
        <span className="flex items-center gap-1.5 text-japan-gold font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Detect (日英自動)</span>
          <span className="text-[10px] text-gray-400 font-normal">Detects EN or JA</span>
        </span>
      );
    }
    if (currentSpeaker === 'tourist') {
      return (
        <span className="flex items-center gap-1.5 text-japan-cherry font-bold">
          <User className="w-3.5 h-3.5" />
          <span>English Input</span>
          <span className="text-[10px] text-gray-400 font-normal">→ Japanese</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-japan-gold font-bold">
        <Languages className="w-3.5 h-3.5" />
        <span>Japanese Input</span>
        <span className="text-[10px] text-gray-400 font-normal">→ English</span>
      </span>
    );
  };

  return (
    <div className="sticky bottom-0 z-40 bg-japan-indigo/95 backdrop-blur-md border-t border-japan-border px-3 pt-3 pb-dock-safe shadow-2xl">
      <div className="max-w-2xl mx-auto space-y-2">
        {/* Mode Selector & Quick Switch */}
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onToggleSpeaker}
            title="Tap to switch between Auto-Detect, English, or Japanese"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all border border-japan-border bg-japan-card hover:bg-japan-slate shadow-sm"
          >
            {getSpeakerBadge()}
          </button>

          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            {isRecording ? (
              <span className="text-red-400 font-medium flex items-center gap-1 animate-pulse">
                <Radio className="w-3 h-3 text-red-400" />
                Listening ({recordingDuration}s)... pauses auto-submit
              </span>
            ) : (
              <span>Tap mic or type</span>
            )}
          </span>
        </div>

        {/* Live Audio Wave Visualizer when Recording */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-950/50 border border-red-500/40 rounded-xl animate-fadeIn">
            <span className="text-xs text-red-200 font-semibold mr-1">
              Voice Active:
            </span>
            {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9, 0.7, 1.1, 0.4].map((mult, idx) => {
              const height = Math.max(6, Math.min(30, (audioLevel * 45 + 6) * mult));
              return (
                <div
                  key={idx}
                  className="w-1.5 bg-red-500 rounded-full transition-all duration-75"
                  style={{ height: `${height}px` }}
                />
              );
            })}
            <span className="text-xs font-mono text-red-300 ml-2">
              0:0{recordingDuration}
            </span>
          </div>
        )}

        {/* Error notice if microphone is blocked */}
        {recorderError && (
          <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 text-xs text-red-200 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{recorderError}</span>
          </div>
        )}

        {/* Unified Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Big Push-to-Talk / Tap-to-Talk Mic Button */}
          <button
            type="button"
            onClick={onToggleRecording}
            disabled={isLoading}
            title={isRecording ? "Stop & Translate Now" : "Tap to Speak"}
            className={`relative p-3.5 rounded-2xl flex-shrink-0 transition-all ${
              isRecording
                ? 'bg-red-600 text-white ring-4 ring-red-500/50 shadow-lg shadow-red-600/50 scale-105'
                : 'bg-japan-card hover:bg-japan-slate text-japan-cherry border border-japan-border hover:border-japan-cherry/50'
            }`}
          >
            {isRecording ? (
              <Square className="w-5 h-5 fill-white text-white" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            {isRecording && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          {/* Typing Text Input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isRecording
                  ? 'Listening... pause to translate'
                  : currentSpeaker === 'auto'
                  ? 'Type or tap mic to speak...'
                  : currentSpeaker === 'tourist'
                  ? 'Type in English...'
                  : 'Type in Japanese...'
              }
              disabled={isLoading || isRecording}
              className="w-full bg-japan-card/90 text-white placeholder-gray-400 rounded-2xl px-4 py-3 text-xs sm:text-sm border border-japan-border focus:outline-none focus:ring-2 focus:ring-japan-cherry/50 focus:border-japan-cherry transition-all shadow-inner disabled:opacity-60"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || isRecording}
            className="p-3.5 rounded-2xl bg-japan-crimson hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-japan-crimson text-white transition-all flex-shrink-0 shadow-md shadow-japan-crimson/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
