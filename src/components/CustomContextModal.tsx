'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { Tone } from '@/lib/types';

interface CustomContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  tone: Tone;
  onToneChange: (tone: Tone) => void;
  customContext: string;
  onCustomContextChange: (context: string) => void;
}

const PRESET_CONTEXTS = [
  { label: 'Vegetarian (No Meat / Fish Broth)', text: 'I am a strict vegetarian: no meat, poultry, seafood, or fish dashi broth.' },
  { label: 'Vegan', text: 'I am vegan: no animal products, meat, fish, eggs, dairy, or honey.' },
  { label: 'No Pork / Halal', text: 'No pork, bacon, lard, or alcohol in food preparation.' },
  { label: 'Shellfish Allergy', text: 'Severe allergy to shrimp, crab, squid, and all shellfish.' },
  { label: 'Traveling with Kids', text: 'Traveling with small children; prefer family-friendly, gentle phrasing.' },
  { label: 'Izakaya Counter Chat', text: 'Sitting at an izakaya counter chatting with locals and bartender. Friendly and relaxed.' },
  { label: 'Host Family / Airbnb', text: 'Staying with a Japanese host family. Warm, respectful, and friendly.' },
  { label: 'Budget Traveler', text: 'Looking for budget-friendly recommendations and economical options.' },
];

export const CustomContextModal: React.FC<CustomContextModalProps> = ({
  isOpen,
  onClose,
  tone,
  onToneChange,
  customContext,
  onCustomContextChange,
}) => {
  const [localTone, setLocalTone] = useState<Tone>(tone);
  const [localContext, setLocalContext] = useState<string>(customContext);

  useEffect(() => {
    if (isOpen) {
      setLocalTone(tone);
      setLocalContext(customContext);
    }
  }, [isOpen, tone, customContext]);

  if (!isOpen) return null;

  const handleSelectPreset = (presetText: string) => {
    if (!localContext.trim()) {
      setLocalContext(presetText);
    } else if (localContext.includes(presetText)) {
      // Toggle off if already present
      const updated = localContext
        .replace(presetText, '')
        .replace(/\n\n+/g, '\n')
        .trim();
      setLocalContext(updated);
    } else {
      setLocalContext(`${localContext.trim()}\n${presetText}`);
    }
  };

  const handleSave = () => {
    onToneChange(localTone);
    onCustomContextChange(localContext.trim());
    try {
      localStorage.setItem('genshi_tone', localTone);
      localStorage.setItem('genshi_custom_context', localContext.trim());
    } catch (e) {}
    onClose();
  };

  const handleReset = () => {
    setLocalTone('polite');
    setLocalContext('');
    onToneChange('polite');
    onCustomContextChange('');
    try {
      localStorage.setItem('genshi_tone', 'polite');
      localStorage.removeItem('genshi_custom_context');
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-japan-card border border-japan-border rounded-3xl max-w-lg w-full p-5 sm:p-6 text-white shadow-2xl space-y-5 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-japan-border pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-japan-crimson/20 text-japan-cherry border border-japan-crimson/40">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">AI Tone & Custom Context</h3>
              <p className="text-[11px] text-gray-400">Personalize formality and travel background</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-japan-slate text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Section 1: Politeness Tone */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider block">
                Politeness & Formality Level
              </label>
              <span className="text-[10px] text-japan-gold font-medium">
                Affects all generated Japanese
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Casual */}
              <button
                type="button"
                onClick={() => setLocalTone('casual')}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  localTone === 'casual'
                    ? 'bg-amber-500/15 border-amber-500/80 ring-1 ring-amber-500/50 text-white'
                    : 'bg-japan-indigo/60 border-japan-border hover:bg-japan-slate text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Casual / Friendly</span>
                  {localTone === 'casual' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[10px] text-amber-300/90 font-medium">ため口 (Plain Form)</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                  Natural peer talk. Drops stiff keigo. Best for izakayas & making friends.
                </p>
              </button>

              {/* Polite (Default) */}
              <button
                type="button"
                onClick={() => setLocalTone('polite')}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  localTone === 'polite'
                    ? 'bg-japan-crimson/20 border-japan-crimson ring-1 ring-japan-crimson/50 text-white'
                    : 'bg-japan-indigo/60 border-japan-border hover:bg-japan-slate text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Natural Polite</span>
                  {localTone === 'polite' && <Check className="w-3.5 h-3.5 text-japan-cherry" />}
                </div>
                <p className="text-[10px] text-japan-cherry font-medium">丁寧語 (Desu / Masu)</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                  Standard respectful travel tone. Ideal for shops, trains, taxi & hotel.
                </p>
              </button>

              {/* Formal */}
              <button
                type="button"
                onClick={() => setLocalTone('formal')}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  localTone === 'formal'
                    ? 'bg-indigo-500/20 border-indigo-500/80 ring-1 ring-indigo-500/50 text-white'
                    : 'bg-japan-indigo/60 border-japan-border hover:bg-japan-slate text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Formal / Keigo</span>
                  {localTone === 'formal' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[10px] text-indigo-300 font-medium">敬語 (High Respect)</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                  Elevated honorifics. Suitable for business meetings & luxury ryokan.
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Custom Traveler Context & Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider block">
                Traveler Profile & Constraints
              </label>
              {localContext && (
                <button
                  type="button"
                  onClick={() => setLocalContext('')}
                  className="text-[10px] text-gray-400 hover:text-red-400 transition-colors"
                >
                  Clear notes
                </button>
              )}
            </div>

            <textarea
              value={localContext}
              onChange={(e) => setLocalContext(e.target.value)}
              placeholder="e.g., I am a vegetarian (no meat, seafood, or fish dashi). Traveling with my 8yo son. Having drinks at an izakaya with local friends..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-japan-indigo/70 border border-japan-border focus:border-japan-cherry focus:outline-none text-xs text-white placeholder-gray-500 leading-relaxed resize-none"
            />

            {/* Quick Preset Context Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-japan-gold" />
                Tap to toggle preset background tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CONTEXTS.map((p, idx) => {
                  const isActive = localContext.includes(p.text);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(p.text)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 font-medium ${
                        isActive
                          ? 'bg-japan-cherry/20 border-japan-cherry text-white ring-1 ring-japan-cherry/40'
                          : 'bg-japan-slate/60 border-japan-border/70 hover:bg-japan-slate text-gray-300'
                      }`}
                    >
                      {isActive && <Check className="w-2.5 h-2.5 text-japan-cherry" />}
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-japan-border flex-shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-japan-slate hover:bg-japan-border text-xs text-gray-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-japan-slate hover:bg-japan-border text-xs text-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-japan-crimson hover:bg-red-700 text-xs text-white font-semibold transition-colors shadow-md shadow-japan-crimson/30"
            >
              Apply Context
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
