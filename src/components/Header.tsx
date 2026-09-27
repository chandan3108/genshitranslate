'use client';

import React from 'react';
import { Menu, Layers, ChevronDown } from 'lucide-react';
import { SituationConfig } from '@/lib/types';
import { SituationIcon } from './SituationIcon';

interface HeaderProps {
  currentSituation: SituationConfig;
  onOpenDrawer: () => void;
  onOpenCounterBoard: () => void;
  ambientCopilot?: boolean;
  continuousMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentSituation,
  onOpenDrawer,
  onOpenCounterBoard,
  ambientCopilot = false,
  continuousMode = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-japan-indigo/98 backdrop-blur-md border-b border-japan-border px-3 sm:px-4 pt-header-safe pb-2.5 text-white shadow-md">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Navigation Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          className="relative p-2 rounded-xl bg-japan-card hover:bg-japan-slate border border-japan-border text-gray-200 transition-colors flex items-center justify-center"
          title="Open Menu & Settings"
        >
          <Menu className="w-5 h-5" />
          {(ambientCopilot || continuousMode) && (
            <span
              className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                ambientCopilot ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
              }`}
            />
          )}
        </button>

        {/* Center: Active Venue Selector Pill */}
        <button
          onClick={onOpenDrawer}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-japan-card hover:bg-japan-slate border border-japan-border/80 text-white transition-all shadow-sm max-w-[200px] sm:max-w-xs truncate"
          title="Tap to change venue"
        >
          <div className="p-1 rounded-full bg-japan-crimson/30 text-japan-cherry flex-shrink-0">
            <SituationIcon id={currentSituation.id} className="w-3.5 h-3.5" />
          </div>
          <div className="truncate text-left">
            <p className="text-xs font-bold leading-tight truncate">{currentSituation.name}</p>
            <p className="text-[10px] text-gray-400 leading-none">{currentSituation.japaneseName}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-0.5" />
        </button>

        {/* Right: Counter Board Button */}
        <button
          onClick={onOpenCounterBoard}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-japan-crimson hover:bg-red-700 text-white font-semibold text-xs transition-transform active:scale-95 shadow-md shadow-japan-crimson/30 flex-shrink-0"
          title="Zero-Speaking Counter Board"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Counter Board</span>
          <span className="sm:hidden">Board</span>
        </button>
      </div>
    </header>
  );
};
