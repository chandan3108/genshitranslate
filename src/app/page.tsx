'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { SituationBar } from '@/components/SituationBar';
import { ConversationList } from '@/components/ConversationList';
import { InputDock } from '@/components/InputDock';
import { ShowStaffCard } from '@/components/ShowStaffCard';
import { FaceToFaceModal } from '@/components/FaceToFaceModal';
import { VoiceSettingsModal } from '@/components/VoiceSettingsModal';
import { CounterBoard } from '@/components/CounterBoard';
import { SidebarDrawer } from '@/components/SidebarDrawer';
import { SITUATIONS } from '@/lib/situations';
import { SituationId, Speaker, Turn, SuggestedReply, QuickAction, TranslationResponse, CounterCard } from '@/lib/types';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { playJapaneseSpeech, ensureVoicesLoaded, playChime, unlockMobileAudio } from '@/lib/audio';
import { Ear, AlertCircle, MicOff } from 'lucide-react';

export default function Home() {
  const [situationId, setSituationId] = useState<SituationId>('konbini');
  const [speaker, setSpeaker] = useState<Speaker>('auto'); // Default: Auto-Detect
  const [turns, setTurns] = useState<Turn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [ambientCopilot, setAmbientCopilot] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showStaffCardTurn, setShowStaffCardTurn] = useState<Turn | null>(null);
  const [showFaceToFace, setShowFaceToFace] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showCounterBoard, setShowCounterBoard] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noSpeechNotice, setNoSpeechNotice] = useState(false);
  const noSpeechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerNoSpeechNotice = useCallback(() => {
    setNoSpeechNotice(true);
    if (noSpeechTimeoutRef.current) clearTimeout(noSpeechTimeoutRef.current);
    noSpeechTimeoutRef.current = setTimeout(() => {
      setNoSpeechNotice(false);
    }, 2200);
  }, []);

  const turnsEndRef = useRef<HTMLDivElement>(null);
  const continuousModeRef = useRef(continuousMode);
  continuousModeRef.current = continuousMode;
  const ambientCopilotRef = useRef(ambientCopilot);
  ambientCopilotRef.current = ambientCopilot;

  const currentSituation = SITUATIONS[situationId] || SITUATIONS.konbini;

  // Load saved turns, pre-warm audio voices, and register PWA service worker
  useEffect(() => {
    ensureVoicesLoaded();
    try {
      const saved = localStorage.getItem('genshi_turns');
      if (saved) {
        setTurns(JSON.parse(saved));
      }
      const savedSituation = localStorage.getItem('genshi_situation') as SituationId;
      if (savedSituation && SITUATIONS[savedSituation]) {
        setSituationId(savedSituation);
      }
    } catch (e) {}

    // Unlock mobile audio on first user touch / click
    const handleFirstTouch = () => {
      unlockMobileAudio();
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
    window.addEventListener('touchstart', handleFirstTouch, { passive: true });
    window.addEventListener('click', handleFirstTouch);

    // Register PWA service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.debug('ServiceWorker registration error:', err);
        });
      });
    }

    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
  }, []);

  // Save turns to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('genshi_turns', JSON.stringify(turns.slice(-20)));
      localStorage.setItem('genshi_situation', situationId);
    } catch (e) {}
  }, [turns, situationId]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isLoading]);

  const recorderStartRef = useRef<() => void>(() => {});

  // Send typed text to translate API
  const handleSendMessage = useCallback(
    async (text: string, activeSpeaker: Speaker) => {
      if (!text.trim() || isLoading) return;
      unlockMobileAudio();
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const historyPayload = turns.slice(-6).map((t) => ({
          speaker: t.speaker,
          input: t.input,
          japanese: t.japanese,
          english: t.english,
          situationalIntent: t.situationalIntent,
        }));

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: text.trim(),
            speaker: activeSpeaker,
            situation: situationId,
            history: historyPayload,
            ambientFilter: ambientCopilotRef.current,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Translation error: ${res.status}`);
        }

        const data: TranslationResponse = await res.json();

        // If no speech was detected, show small prompt and abort turn creation
        if (data.noSpeechDetected) {
          triggerNoSpeechNotice();
          return;
        }

        // If ambient filter dropped English conversation, silently ignore!
        if (data.isIgnored) {
          return;
        }

        const resolvedSpeaker = data.detectedSpeaker || (activeSpeaker === 'local' ? 'local' : 'tourist');

        const newTurn: Turn = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          speaker: resolvedSpeaker,
          input: text.trim(),
          japanese: data.japanese,
          romaji: data.romaji,
          english: data.english,
          situationalIntent: data.situationalIntent,
          nuance: data.nuance,
          culturalTip: data.culturalTip,
          suggestedReplies: data.suggestedReplies || [],
        };

        setTurns((prev) => [...prev, newTurn]);

        if (resolvedSpeaker === 'tourist') {
          await playJapaneseSpeech(data.japanese);
        }

        // If continuous mode or ambient copilot is ON, re-arm microphone
        if (continuousModeRef.current || ambientCopilotRef.current) {
          setTimeout(() => {
            if (continuousModeRef.current || ambientCopilotRef.current) {
              recorderStartRef.current();
            }
          }, 600);
        }
      } catch (err: any) {
        console.error('Failed to translate:', err);
        setErrorMessage(err.message || 'Failed to connect to translation service');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, turns, situationId]
  );

  // Send spoken audio to Gemini for direct multimodal transcription & translation!
  const handleAudioRecorded = useCallback(
    async (base64Audio: string, mimeType: string) => {
      unlockMobileAudio();
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const historyPayload = turns.slice(-6).map((t) => ({
          speaker: t.speaker,
          input: t.input,
          japanese: t.japanese,
          english: t.english,
          situationalIntent: t.situationalIntent,
        }));

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            audioMimeType: mimeType,
            speaker: speaker,
            situation: situationId,
            history: historyPayload,
            ambientFilter: ambientCopilotRef.current,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Audio translation error: ${res.status}`);
        }

        const data: TranslationResponse = await res.json();

        // If silence or no intelligible speech was found, show prompt only on manual mic, not in passive ambient mode
        if (data.noSpeechDetected) {
          if (!ambientCopilotRef.current && !continuousModeRef.current) {
            triggerNoSpeechNotice();
          }
          if (ambientCopilotRef.current || continuousModeRef.current) {
            setTimeout(() => {
              if (ambientCopilotRef.current || continuousModeRef.current) {
                recorderStartRef.current();
              }
            }, 500);
          }
          return;
        }

        // If ambient filter dropped English conversation with family, ignore and re-arm!
        if (data.isIgnored) {
          if (ambientCopilotRef.current) {
            setTimeout(() => {
              if (ambientCopilotRef.current) {
                recorderStartRef.current();
              }
            }, 300);
          }
          return;
        }

        playChime('success');

        const resolvedSpeaker = data.detectedSpeaker || (speaker === 'local' ? 'local' : 'tourist');

        const newTurn: Turn = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          speaker: resolvedSpeaker,
          input: data.transcribedInput || (resolvedSpeaker === 'tourist' ? data.english : data.japanese),
          japanese: data.japanese,
          romaji: data.romaji,
          english: data.english,
          situationalIntent: data.situationalIntent,
          nuance: data.nuance,
          culturalTip: data.culturalTip,
          suggestedReplies: data.suggestedReplies || [],
        };

        setTurns((prev) => [...prev, newTurn]);

        if (resolvedSpeaker === 'tourist') {
          await playJapaneseSpeech(data.japanese);
        }

        // If continuous live mode or ambient copilot is ON, re-arm microphone
        if (continuousModeRef.current || ambientCopilotRef.current) {
          setTimeout(() => {
            if (continuousModeRef.current || ambientCopilotRef.current) {
              recorderStartRef.current();
            }
          }, 600);
        }
      } catch (err: any) {
        console.error('Failed to translate audio:', err);
        setErrorMessage(err.message || 'Failed to process audio translation');
      } finally {
        setIsLoading(false);
      }
    },
    [turns, speaker, situationId, triggerNoSpeechNotice]
  );

  // Audio recorder hook with high-gain pre-amp boost and silence detection
  const {
    isRecording,
    audioLevel,
    recordingDuration,
    recorderError,
    startRecording,
    stopRecording,
    toggleRecording,
  } = useAudioRecorder({
    onAudioRecorded: handleAudioRecorded,
    onNoSpeechDetected: () => {
      // Only display the "No input detected" prompt if user manually tapped mic
      if (!ambientCopilotRef.current && !continuousModeRef.current) {
        triggerNoSpeechNotice();
      }
      if (ambientCopilotRef.current || continuousModeRef.current) {
        setTimeout(() => {
          if (ambientCopilotRef.current || continuousModeRef.current) {
            recorderStartRef.current();
          }
        }, 500);
      }
    },
    autoStopOnSilence: true,
    silenceThresholdMs: 1200,
    highGainMultiplier: 2.4, // +7.6 dB acoustic boost for far-field voices
    silentMode: ambientCopilot, // Stealth listening: no start/stop beeps in Ambient mode
  });

  recorderStartRef.current = startRecording;

  // Toggle Live Convo
  const handleToggleContinuous = () => {
    const nextMode = !continuousMode;
    setContinuousMode(nextMode);
    if (nextMode) {
      setAmbientCopilot(false);
      startRecording();
    } else {
      stopRecording();
    }
  };

  // Toggle Ambient Passenger Copilot Mode (Ignores English, captures Japanese)
  const handleToggleAmbientCopilot = () => {
    const nextMode = !ambientCopilot;
    setAmbientCopilot(nextMode);
    if (nextMode) {
      setContinuousMode(false);
      startRecording();
    } else {
      stopRecording();
    }
  };

  // Handle 1-tap quick reply selection
  const handleSelectReply = (reply: SuggestedReply) => {
    const newTurn: Turn = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      speaker: 'tourist',
      input: reply.meaning,
      japanese: reply.japanese,
      romaji: reply.romaji,
      english: reply.meaning,
      nuance: `Quick reply: "${reply.meaning}"`,
    };
    setTurns((prev) => [...prev, newTurn]);
    playJapaneseSpeech(reply.japanese);
  };

  // Handle Quick Action chip from SituationBar
  const handleSelectQuickAction = (action: QuickAction) => {
    const newTurn: Turn = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      speaker: 'tourist',
      input: action.english,
      japanese: action.japanese,
      romaji: action.romaji,
      english: action.english,
      nuance: `Quick phrase for ${currentSituation.name}`,
    };
    setTurns((prev) => [...prev, newTurn]);
    playJapaneseSpeech(action.japanese);
  };

  // Handle Counter Card selection
  const handleSelectCounterCard = (card: CounterCard) => {
    const newTurn: Turn = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      speaker: 'tourist',
      input: card.english,
      japanese: card.japanese,
      romaji: card.romaji,
      english: card.english,
      nuance: `Counter phrase: ${card.label}`,
    };
    setTurns((prev) => [...prev, newTurn]);
    playJapaneseSpeech(card.japanese);
    setShowCounterBoard(false);
  };

  const handleEnlargeCounterCard = (card: CounterCard) => {
    setShowStaffCardTurn({
      id: card.id,
      timestamp: Date.now(),
      speaker: 'tourist',
      input: card.english,
      japanese: card.japanese,
      romaji: card.romaji,
      english: card.english,
    });
    setShowCounterBoard(false);
  };

  const handleClearHistory = () => {
    if (confirm('Clear the current conversation context?')) {
      setTurns([]);
      localStorage.removeItem('genshi_turns');
    }
  };

  const handleToggleSpeaker = () => {
    if (speaker === 'auto') setSpeaker('tourist');
    else if (speaker === 'tourist') setSpeaker('local');
    else setSpeaker('auto');
  };

  const handleFaceToFaceLocalSpeak = () => {
    setSpeaker('local');
    toggleRecording();
  };

  const handleFaceToFaceTouristSpeak = () => {
    setSpeaker('tourist');
    toggleRecording();
  };

  const displayedError = errorMessage || recorderError;

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-japan-indigo">
      {/* Slide-out Navigation Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentSituation={currentSituation}
        onSelectSituation={(id) => setSituationId(id)}
        continuousMode={continuousMode}
        ambientCopilot={ambientCopilot}
        onToggleContinuous={handleToggleContinuous}
        onToggleAmbientCopilot={handleToggleAmbientCopilot}
        onOpenVoiceSettings={() => setShowVoiceSettings(true)}
        onOpenFaceToFace={() => setShowFaceToFace(true)}
        onClearHistory={handleClearHistory}
        historyCount={turns.length}
      />

      {/* Top Header */}
      <Header
        currentSituation={currentSituation}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenCounterBoard={() => setShowCounterBoard(true)}
        ambientCopilot={ambientCopilot}
        continuousMode={continuousMode}
      />

      {/* Situation Picker & Quick Chips */}
      <SituationBar
        currentSituation={currentSituation}
        onSelectQuickAction={handleSelectQuickAction}
      />

      {/* Ambient Copilot Banner when active */}
      {ambientCopilot && (
        <div className="bg-amber-500/15 border-b border-amber-500/40 text-amber-200 text-xs px-3 py-1.5 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Ear className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-semibold text-[11px]">
              Ambient Copilot Active: Listening for Japanese only. English family chatter is ignored.
            </span>
          </div>
          <button
            onClick={() => setAmbientCopilot(false)}
            className="text-[10px] uppercase font-bold text-amber-300 hover:text-white underline ml-2"
          >
            Turn Off
          </button>
        </div>
      )}

      {/* Error Banner */}
      {displayedError && (
        <div className="bg-red-500/20 border-b border-red-500/50 text-red-200 text-xs px-4 py-2 flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{displayedError}</span>
          </span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs underline hover:text-white ml-2 flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Conversation Feed */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <ConversationList
          turns={turns}
          isLoading={isLoading}
          onSelectReply={handleSelectReply}
          onOpenShowStaff={(turn) => setShowStaffCardTurn(turn)}
        />
        <div ref={turnsEndRef} />
      </div>

      {/* Unified Input Dock */}
      <InputDock
        currentSpeaker={speaker}
        onToggleSpeaker={handleToggleSpeaker}
        onSendMessage={handleSendMessage}
        isRecording={isRecording}
        audioLevel={audioLevel}
        recordingDuration={recordingDuration}
        onToggleRecording={toggleRecording}
        isLoading={isLoading}
        recorderError={recorderError}
      />

      {/* Small Floating Prompt: No input detected */}
      {noSpeechNotice && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-slate-200 text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-fadeIn pointer-events-none transition-all">
          <MicOff className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium tracking-wide">No input detected</span>
        </div>
      )}

      {/* Full-Screen "Show to Staff" Flip Card */}
      {showStaffCardTurn && (
        <ShowStaffCard
          japanese={showStaffCardTurn.japanese}
          romaji={showStaffCardTurn.romaji}
          english={showStaffCardTurn.english}
          onClose={() => setShowStaffCardTurn(null)}
        />
      )}

      {/* Zero-Speaking Counter Board Modal */}
      {showCounterBoard && (
        <CounterBoard
          situation={situationId}
          onClose={() => setShowCounterBoard(false)}
          onSelectCard={handleSelectCounterCard}
          onEnlargeCard={handleEnlargeCounterCard}
        />
      )}

      {/* Tabletop Split-Screen Face-to-Face Mode */}
      {showFaceToFace && (
        <FaceToFaceModal
          lastTurn={turns.length > 0 ? turns[turns.length - 1] : null}
          isLoading={isLoading}
          onSpeakLocal={handleFaceToFaceLocalSpeak}
          onSpeakTourist={handleFaceToFaceTouristSpeak}
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          activeSpeaker={speaker === 'local' ? 'local' : 'tourist'}
          onClose={() => setShowFaceToFace(false)}
        />
      )}

      {/* Japanese Voice & Audio Settings Modal */}
      {showVoiceSettings && (
        <VoiceSettingsModal onClose={() => setShowVoiceSettings(false)} />
      )}
    </main>
  );
}
