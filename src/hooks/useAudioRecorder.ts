'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { playChime } from '@/lib/audio';

interface UseAudioRecorderProps {
  onAudioRecorded: (base64Audio: string, mimeType: string) => void;
  autoStopOnSilence?: boolean;
  silenceThresholdMs?: number;
  highGainMultiplier?: number; // e.g. 2.5x gain boost for far-field audio
}

export const useAudioRecorder = ({
  onAudioRecorded,
  autoStopOnSilence = true,
  silenceThresholdMs = 1200,
  highGainMultiplier = 2.4, // +7.6 dB acoustic boost for far-field speech
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

  // VAD refs
  const hasSpokenRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const autoStopOnSilenceRef = useRef(autoStopOnSilence);
  const silenceThresholdRef = useRef(silenceThresholdMs);

  useEffect(() => {
    onAudioRecordedRef.current = onAudioRecorded;
    autoStopOnSilenceRef.current = autoStopOnSilence;
    silenceThresholdRef.current = silenceThresholdMs;
  }, [onAudioRecorded, autoStopOnSilence, silenceThresholdMs]);

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
    hasSpokenRef.current = false;
    silenceStartRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setRecorderError(null);
    audioChunksRef.current = [];
    setRecordingDuration(0);
    hasSpokenRef.current = false;
    silenceStartRef.current = null;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser.');
      }

      // 1. Capture microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      rawStreamRef.current = stream;

      // 2. High-Gain Acoustic Pre-Amp & Dynamics Compression Pipeline
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const sourceNode = ctx.createMediaStreamSource(stream);

      // Pre-amp gain boost (boosts distant / quiet voices 1-3 meters away)
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(highGainMultiplier, ctx.currentTime);

      // Dynamics compressor (normalizes loud sounds, prevents clipping distortion)
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      // Visualizer analyser
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      // Destination stream for MediaRecorder
      const destNode = ctx.createMediaStreamDestination();

      // Connect graph: source -> gain -> compressor -> destNode
      sourceNode.connect(gainNode);
      gainNode.connect(compressor);
      compressor.connect(destNode);
      compressor.connect(analyser);

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
        const normalized = Math.min(1, avg / 128);
        setAudioLevel(normalized);

        // Voice Activity Detection (VAD)
        if (autoStopOnSilenceRef.current) {
          if (normalized > 0.08) {
            hasSpokenRef.current = true;
            silenceStartRef.current = null;
          } else if (hasSpokenRef.current) {
            if (silenceStartRef.current === null) {
              silenceStartRef.current = Date.now();
            } else if (Date.now() - silenceStartRef.current > silenceThresholdRef.current) {
              stopRecording();
              return;
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkAudioLoop);
      };
      checkAudioLoop();

      // Determine best supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'; // Safari iOS support
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      // Record from the pre-amplified, normalized destination stream!
      const recorder = new MediaRecorder(destNode.stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        playChime('stop');
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 0) {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            if (base64Data && onAudioRecordedRef.current) {
              onAudioRecordedRef.current(base64Data, mimeType.split(';')[0]);
            }
          };
        }
      };

      recorder.start(250);
      setIsRecording(true);
      playChime('start');

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    } catch (err: any) {
      console.error('Failed to start high-gain recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setRecorderError('Microphone blocked. Please click the tune/lock icon in your address bar to allow microphone.');
      } else {
        setRecorderError(err.message || 'Could not access microphone.');
      }
      setIsRecording(false);
    }
  }, [highGainMultiplier, stopRecording]);

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
