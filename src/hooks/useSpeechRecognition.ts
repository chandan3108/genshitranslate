'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { playChime } from '@/lib/audio';

interface UseSpeechRecognitionProps {
  onTranscriptComplete: (transcript: string, detectedLang?: 'ja-JP' | 'en-US') => void;
  lang?: 'ja-JP' | 'en-US';
  continuous?: boolean;
}

export function useSpeechRecognition({
  onTranscriptComplete,
  lang = 'en-US',
  continuous = false,
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);
  const isListeningRef = useRef(false);

  // Store callback in a ref to avoid tearing down recognition on every parent render!
  const onCompleteRef = useRef(onTranscriptComplete);
  useEffect(() => {
    onCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  // Keep lang in a ref for callbacks
  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = lang;
      } catch (e) {}
    }
  }, [lang]);

  const continuousRef = useRef(continuous);
  useEffect(() => {
    continuousRef.current = continuous;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.continuous = continuous;
      } catch (e) {}
    }
  }, [continuous]);

  // Initialize SpeechRecognition once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setSpeechError('Speech recognition is not supported in this browser. Please type or use Chrome/Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuousRef.current;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = langRef.current;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setSpeechError(null);
        playChime('start');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalTranscript.trim()) {
          playChime('success');
          setInterimTranscript('');
          if (onCompleteRef.current) {
            onCompleteRef.current(finalTranscript.trim(), langRef.current);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow mic access in your browser address bar.');
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error === 'service-not-allowed') {
          setSpeechError('Speech service not allowed. If on mobile, ensure Safari/Chrome has microphone permission in OS Settings.');
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error === 'no-speech') {
          // Normal timeout if user was silent, don't crash
        } else {
          setSpeechError(`Speech recognition: ${event.error}`);
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onend = () => {
        // If continuous mode is enabled and user did not stop manually, keep running
        if (continuousRef.current && !isManuallyStoppedRef.current) {
          try {
            recognition.start();
            return;
          } catch (e) {
            console.warn('Continuous restart error:', e);
          }
        }

        setIsListening(false);
        isListeningRef.current = false;
        playChime('stop');
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Failed to initialize speech recognition:', err);
      setIsSupported(false);
      setSpeechError(err.message);
    }

    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []); // Only run once on mount!

  const startListening = useCallback(async () => {
    setSpeechError(null);
    setInterimTranscript('');
    isManuallyStoppedRef.current = false;

    // First request mic permission if navigator.mediaDevices is available
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Close temporary track so SpeechRecognition can take over the mic cleanly
        stream.getTracks().forEach((track) => track.stop());
      } catch (micErr: any) {
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          setSpeechError('Microphone permission blocked. Click the lock/tune icon in the URL bar to allow microphone.');
          return;
        }
      }
    }

    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not initialized.');
      return;
    }

    try {
      recognitionRef.current.lang = langRef.current;
      recognitionRef.current.continuous = continuousRef.current;
      recognitionRef.current.start();
    } catch (e: any) {
      // If already started, ignore or restart
      if (e.name !== 'InvalidStateError') {
        console.warn('Error starting recognition:', e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    isListeningRef.current = false;
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  return {
    isListening,
    interimTranscript,
    isSupported,
    speechError,
    startListening,
    stopListening,
    toggleListening,
  };
}
