'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { playChime, unlockMobileAudio } from '@/lib/audio';
import { hapticTap } from '@/lib/haptics';

interface UseAudioRecorderProps {
  onAudioRecorded: (base64Audio: string, mimeType: string) => void;
  onNoSpeechDetected?: () => void;
  autoStopOnSilence?: boolean;
  silenceThresholdMs?: number;
  highGainMultiplier?: number; // e.g. 2.5x gain boost for far-field audio
  silentMode?: boolean; // When true (ambient copilot), do not play start/stop chimes
}

export const useAudioRecorder = ({
  onAudioRecorded,
  onNoSpeechDetected,
  autoStopOnSilence = true,
  silenceThresholdMs = 750,
  highGainMultiplier = 2.4, // +7.6 dB acoustic boost for far-field speech
  silentMode = false,
}: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 1 for visualizer
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recorderError, setRecorderError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const rawStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onAudioRecordedRef = useRef(onAudioRecorded);
  const onNoSpeechDetectedRef = useRef(onNoSpeechDetected);
  const silentModeRef = useRef(silentMode);

  // VAD refs
  const hasSpokenRef = useRef(false);
  const speechFramesRef = useRef(0);
  const totalSpeechFramesRef = useRef(0);
  const peakAudioLevelRef = useRef(0);
  const silenceStartRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const autoStopOnSilenceRef = useRef(autoStopOnSilence);
  const silenceThresholdRef = useRef(silenceThresholdMs);

  useEffect(() => {
    onAudioRecordedRef.current = onAudioRecorded;
    onNoSpeechDetectedRef.current = onNoSpeechDetected;
    autoStopOnSilenceRef.current = autoStopOnSilence;
    silenceThresholdRef.current = silenceThresholdMs;
    silentModeRef.current = silentMode;
  }, [onAudioRecorded, onNoSpeechDetected, autoStopOnSilence, silenceThresholdMs, silentMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (rawStreamRef.current) {
        rawStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

    hapticTap();

    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    try {
      mediaRecorderRef.current.stop();
    } catch (e) {}

    if (rawStreamRef.current) {
      rawStreamRef.current.getTracks().forEach((track) => track.stop());
      rawStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
    // Note: Do NOT reset hasSpokenRef.current here!
    // recorder.onstop will read hasSpokenRef to decide whether to process audio or call onNoSpeechDetected
  }, []);

  const startRecording = useCallback(async () => {
    setRecorderError(null);
    audioChunksRef.current = [];
    setRecordingDuration(0);
    hasSpokenRef.current = false;
    speechFramesRef.current = 0;
    totalSpeechFramesRef.current = 0;
    peakAudioLevelRef.current = 0;
    silenceStartRef.current = null;
    recordingStartTimeRef.current = Date.now();

    hapticTap();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser.');
      }

      // Unlock mobile audio session
      unlockMobileAudio();

      // 1. Capture microphone stream directly from device
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      rawStreamRef.current = stream;

      // 2. Visualizer and VAD via AudioContext
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            await ctx.resume().catch(() => {});
          }
          audioContextRef.current = ctx;

          const sourceNode = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          // Connect source directly to analyser for visualizer & VAD
          sourceNode.connect(analyser);

          // Start Visualizer and VAD Loop
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkAudioLoop = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(1, (avg / 128) * 1.8);
            setAudioLevel(normalized);

            const elapsed = Date.now() - recordingStartTimeRef.current;
            const isPastStartupGrace = elapsed > 350; // ignore first 350ms of stream init & touch pop

            if (isPastStartupGrace && normalized > peakAudioLevelRef.current) {
              peakAudioLevelRef.current = normalized;
            }

            // Voice Activity Detection (VAD)
            if (autoStopOnSilenceRef.current) {
              // Real voice speech threshold: normalized > 0.16 (ambient room noise is typically 0.03 - 0.10)
              if (isPastStartupGrace && normalized > 0.16) {
                speechFramesRef.current += 1;
                totalSpeechFramesRef.current += 1;

                // At least 6 consecutive frames (~100ms) of sustained acoustic energy to confirm human voice
                if (speechFramesRef.current >= 6) {
                  hasSpokenRef.current = true;
                  silenceStartRef.current = null;
                }
              } else {
                speechFramesRef.current = 0;
                if (hasSpokenRef.current) {
                  if (silenceStartRef.current === null) {
                    silenceStartRef.current = Date.now();
                  } else {
                    // Adaptive silence cutoff: if user spoke a substantial phrase (>=16 speech frames, ~260ms),
                    // allow a crisp cutoff at 550ms. If they just started or said a single syllable, use the full threshold.
                    const dynamicThreshold = totalSpeechFramesRef.current >= 16 
                      ? Math.min(silenceThresholdRef.current, 550) 
                      : silenceThresholdRef.current;

                    if (Date.now() - silenceStartRef.current > dynamicThreshold) {
                      stopRecording();
                      return;
                    }
                  }
                } else {
                  // User has not spoken yet - if total silence exceeds 5 seconds, auto-stop
                  if (elapsed > 5000) {
                    stopRecording();
                    return;
                  }
                }
              }
            }

            animationFrameRef.current = requestAnimationFrame(checkAudioLoop);
          };
          checkAudioLoop();
        }
      } catch (visErr) {
        console.warn('Visualizer setup warning:', visErr);
      }

      // 3. Determine best supported MIME type on this device
      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        const candidates = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/aac',
          'audio/ogg;codecs=opus',
        ];
        for (const candidate of candidates) {
          if (MediaRecorder.isTypeSupported(candidate)) {
            mimeType = candidate;
            break;
          }
        }
      }

      // Record directly from the native microphone stream (critical for iOS Safari compatibility!)
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (!silentModeRef.current) playChime('stop');

        // Real human speech verification:
        // 1) hasSpokenRef must be true (sustained consecutive voice frames)
        // 2) totalSpeechFrames must be at least 8 (at least ~130ms of active speech)
        // 3) peakAudioLevel must have reached at least 0.20 (genuine spoken voice volume)
        const genuineSpeech = 
          hasSpokenRef.current && 
          totalSpeechFramesRef.current >= 8 && 
          peakAudioLevelRef.current >= 0.20;

        hasSpokenRef.current = false;
        speechFramesRef.current = 0;
        totalSpeechFramesRef.current = 0;
        peakAudioLevelRef.current = 0;
        silenceStartRef.current = null;

        // If genuine human speech was not detected, do NOT send audio to translation API!
        if (!genuineSpeech) {
          if (onNoSpeechDetectedRef.current) {
            onNoSpeechDetectedRef.current();
          }
          return;
        }

        const effectiveMime = recorder.mimeType || mimeType || 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type: effectiveMime });

        if (audioBlob.size < 3000) {
          if (onNoSpeechDetectedRef.current) {
            onNoSpeechDetectedRef.current();
          }
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          if (base64Data && onAudioRecordedRef.current) {
            onAudioRecordedRef.current(base64Data, effectiveMime.split(';')[0]);
          }
        };
      };

      recorder.start(500);
      setIsRecording(true);
      if (!silentModeRef.current) playChime('start');

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setRecorderError('Microphone blocked. Please grant microphone access in your browser / phone settings.');
      } else {
        setRecorderError(err.message || 'Could not access microphone.');
      }
      setIsRecording(false);
    }
  }, [stopRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    audioLevel,
    recordingDuration,
    recorderError,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
