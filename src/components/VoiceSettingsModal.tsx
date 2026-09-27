'use client';

import React, { useState, useEffect } from 'react';
import { X, Volume2, Sparkles, Check, Sliders, User } from 'lucide-react';
import { getAvailableJapaneseVoices, playJapaneseSpeech, VoiceOption } from '@/lib/audio';

interface VoiceSettingsModalProps {
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ onClose }) => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.92);
  const [speechPitch, setSpeechPitch] = useState<number>(1.02);

  useEffect(() => {
    // Populate voices
    const updateVoices = () => {
      const list = getAvailableJapaneseVoices();
      setVoices(list);
      const saved = localStorage.getItem('genshi_voice_name');
      if (saved && list.some(v => v.name === saved)) {
        setSelectedVoiceName(saved);
      } else if (list.length > 0) {
        setSelectedVoiceName(list[0].name);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    const savedRate = localStorage.getItem('genshi_voice_rate');
    if (savedRate) setSpeechRate(parseFloat(savedRate));

    const savedPitch = localStorage.getItem('genshi_voice_pitch');
    if (savedPitch) setSpeechPitch(parseFloat(savedPitch));
  }, []);

  const handleSelectVoice = (name: string) => {
    setSelectedVoiceName(name);
    localStorage.setItem('genshi_voice_name', name);
    playJapaneseSpeech('こんにちは！言視へようこそ。', speechRate, speechPitch);
  };

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem('genshi_voice_rate', rate.toString());
  };

  const handlePitchChange = (pitch: number) => {
    setSpeechPitch(pitch);
    localStorage.setItem('genshi_voice_pitch', pitch.toString());
  };

  const handleTestSample = () => {
    playJapaneseSpeech('京都に行ってみたいです。おすすめはありますか？', speechRate, speechPitch);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-japan-card border border-japan-border rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-japan-border pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-japan-gold" />
            <h3 className="font-bold text-base">Japanese Voice Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-japan-slate text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Selection List */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 block">
            Select Japanese Voice ({voices.length} found):
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {voices.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">
                Loading browser speech voices...
              </p>
            ) : (
              voices.map((v) => {
                const isSelected = v.name === selectedVoiceName;
                return (
                  <button
                    key={v.name}
                    onClick={() => handleSelectVoice(v.name)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-japan-crimson/20 border-japan-crimson text-white ring-1 ring-japan-crimson/50'
                        : 'bg-japan-indigo/60 border-japan-border hover:bg-japan-slate text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-3.5 h-3.5 text-japan-cherry flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-medium block truncate">
                          {v.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {v.genderHint === 'female' ? 'Female' : v.genderHint === 'male' ? 'Male' : 'Natural'} • {v.lang}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {v.isEnhanced && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> High-Def
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-japan-crimson" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Sliders for Speed and Pitch */}
        <div className="space-y-4 pt-1">
          {/* Rate Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">Speaking Speed</span>
              <span className="font-mono text-japan-cherry">{Math.round(speechRate * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.2"
              step="0.05"
              value={speechRate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="w-full accent-japan-crimson cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Slower (Clearer)</span>
              <span>Default (92%)</span>
              <span>Faster</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">Voice Pitch</span>
              <span className="font-mono text-japan-gold">{Math.round(speechPitch * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={speechPitch}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="w-full accent-japan-gold cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Deeper</span>
              <span>Natural (102%)</span>
              <span>Higher</span>
            </div>
          </div>
        </div>

        {/* Test Button & Save */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-japan-border">
          <button
            onClick={handleTestSample}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-japan-slate hover:bg-japan-border text-xs text-japan-cherry font-semibold border border-japan-border transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Voice</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-japan-crimson hover:bg-red-700 text-xs text-white font-semibold transition-colors shadow-md shadow-japan-crimson/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
