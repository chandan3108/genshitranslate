export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  isEnhanced: boolean;
  genderHint: 'female' | 'male' | 'neutral';
}

export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const current = window.speechSynthesis.getVoices();
    if (current && current.length > 0) {
      resolve(current);
      return;
    }

    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    // Safety fallback timeout
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 400);
  });
}

export function getAvailableJapaneseVoices(): VoiceOption[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  
  const voices = window.speechSynthesis.getVoices();
  const jaVoices = voices.filter(v => v.lang.startsWith('ja') || v.lang.includes('JP'));

  return jaVoices.map(v => {
    const lowerName = v.name.toLowerCase();
    const isEnhanced = lowerName.includes('enhanced') || lowerName.includes('premium') || lowerName.includes('siri') || lowerName.includes('google');
    
    let genderHint: 'female' | 'male' | 'neutral' = 'neutral';
    if (lowerName.includes('kyoko') || lowerName.includes('flo') || lowerName.includes('shelley') || lowerName.includes('sandy') || lowerName.includes('female')) {
      genderHint = 'female';
    } else if (lowerName.includes('eddy') || lowerName.includes('reed') || lowerName.includes('rocko') || lowerName.includes('otoya') || lowerName.includes('male')) {
      genderHint = 'male';
    }

    return {
      voice: v,
      name: v.name,
      lang: v.lang,
      isEnhanced,
      genderHint
    };
  }).sort((a, b) => {
    if (a.isEnhanced && !b.isEnhanced) return -1;
    if (!a.isEnhanced && b.isEnhanced) return 1;
    if (a.name.includes('Kyoko') || a.name.includes('Flo') || a.name.includes('Shelley')) return -1;
    return 0;
  });
}

// Global HTML5 Audio instance for mobile-friendly playback
let globalAudioPlayer: HTMLAudioElement | null = null;
let isAudioUnlocked = false;

function getGlobalAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioPlayer) {
    globalAudioPlayer = new Audio();
    // Allow playsinline on mobile iOS
    globalAudioPlayer.setAttribute('playsinline', 'true');
  }
  return globalAudioPlayer;
}

/**
 * Call this on any user touch/click to unlock mobile browser audio restrictions (especially iOS Safari).
 */
export function unlockMobileAudio() {
  if (typeof window === 'undefined' || isAudioUnlocked) return;
  isAudioUnlocked = true;

  try {
    // 1. Unlock HTML5 Audio
    const audio = getGlobalAudio();
    if (audio) {
      // Play a short silent base64 audio snippet
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      audio.play().then(() => {
        audio.pause();
      }).catch(() => {});
    }

    // 2. Warm up SpeechSynthesis on iOS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0.01;
      silent.rate = 10;
      window.speechSynthesis.speak(silent);
    }
  } catch (e) {}
}

/**
 * Plays Japanese speech using studio-grade neural TTS via /api/tts,
 * with automatic fallback to browser SpeechSynthesis if offline.
 * 
 * Supports an explicit phonetic reading layer (kanaReading):
 * If kanaReading is provided, it is sent to TTS to guarantee 100% unambiguous pronunciation
 * matching the Romaji (e.g. 故郷 read as ふるさと rather than guessing from Kanji).
 */
export async function playJapaneseSpeech(
  text: string,
  kanaReadingOrRate?: string | number,
  customRateOrPitch?: number,
  customPitch?: number
): Promise<void> {
  if (typeof window === 'undefined' || !text.trim()) return;

  unlockMobileAudio();

  let kanaReading: string | undefined;
  let customRate: number | undefined;
  let pitch: number | undefined;

  if (typeof kanaReadingOrRate === 'string') {
    kanaReading = kanaReadingOrRate;
    customRate = customRateOrPitch;
    pitch = customPitch;
  } else if (typeof kanaReadingOrRate === 'number') {
    customRate = kanaReadingOrRate;
    pitch = customRateOrPitch;
  }

  // Use unambiguous phonetic reading if available, else standard text
  const textToSpeak = (kanaReading && kanaReading.trim()) ? kanaReading.trim() : text.trim();
  const savedRate = customRate ?? parseFloat(localStorage.getItem('genshi_voice_rate') || '0.95');

  // Method 1: High-fidelity Neural Audio stream via /api/tts (works 100% on iOS Safari, Android, PWA)
  try {
    const audio = getGlobalAudio();
    if (audio) {
      return new Promise<void>((resolve) => {
        const ttsUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ja`;
        audio.src = ttsUrl;
        audio.playbackRate = Math.max(0.75, Math.min(1.5, savedRate));

        let hasResolved = false;
        const cleanup = () => {
          if (!hasResolved) {
            hasResolved = true;
            audio.removeEventListener('ended', handleEnd);
            audio.removeEventListener('error', handleError);
            resolve();
          }
        };

        const handleEnd = () => cleanup();
        const handleError = () => {
          cleanup();
          // Fall back to SpeechSynthesis if network/upstream fails
          playSpeechSynthesisFallback(textToSpeak, savedRate, pitch);
        };

        audio.addEventListener('ended', handleEnd);
        audio.addEventListener('error', handleError);

        audio.play().catch((err) => {
          console.warn('HTML5 audio play error, falling back to speech synthesis:', err);
          cleanup();
          playSpeechSynthesisFallback(textToSpeak, savedRate, pitch);
        });
      });
    }
  } catch (e) {
    console.warn('TTS streaming failed, attempting synthesis fallback:', e);
  }

  // Fallback to local SpeechSynthesis
  return playSpeechSynthesisFallback(textToSpeak, savedRate, pitch);
}

function playSpeechSynthesisFallback(text: string, rate: number, pitch?: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = rate;
      if (pitch) utterance.pitch = pitch;

      const available = getAvailableJapaneseVoices();
      const savedVoiceName = localStorage.getItem('genshi_voice_name');
      if (available.length > 0) {
        const found = savedVoiceName ? available.find((v) => v.name === savedVoiceName) : null;
        utterance.voice = found ? found.voice : available[0].voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      resolve();
    }
  });
}

export function playEnglishSpeech(text: string): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      resolve();
    }
  });
}

// Gentle pleasant beep for voice start/stop feedback
export function playChime(type: 'start' | 'stop' | 'success') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'start') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'stop') {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {}
}
