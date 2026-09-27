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

export async function playJapaneseSpeech(text: string, customRate?: number, customPitch?: number): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Crucial: Wait for the browser to populate the speech voice list
  await ensureVoicesLoaded();

  return new Promise((resolve) => {
    window.speechSynthesis.cancel(); // cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';

    // Retrieve saved user settings
    const savedRate = customRate ?? parseFloat(localStorage.getItem('genshi_voice_rate') || '0.92');
    const savedPitch = customPitch ?? parseFloat(localStorage.getItem('genshi_voice_pitch') || '1.02');
    const savedVoiceName = localStorage.getItem('genshi_voice_name');

    utterance.rate = savedRate;
    utterance.pitch = savedPitch;

    const available = getAvailableJapaneseVoices();
    if (available.length > 0) {
      if (savedVoiceName) {
        const found = available.find(v => v.name === savedVoiceName);
        if (found) {
          utterance.voice = found.voice;
        } else {
          utterance.voice = available[0].voice;
        }
      } else {
        // Default to best ranked voice (e.g. Enhanced Kyoko, Flo, or Google)
        utterance.voice = available[0].voice;
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function playEnglishSpeech(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

// Gentle pleasant beep for voice start/stop feedback
export function playChime(type: 'start' | 'stop' | 'success') {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
