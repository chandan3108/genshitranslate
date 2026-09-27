export type SituationId = 
  | 'konbini' 
  | 'izakaya' 
  | 'train' 
  | 'ramen' 
  | 'taxi' 
  | 'hotel' 
  | 'shopping' 
  | 'pharmacy' 
  | 'general';

export type Speaker = 'tourist' | 'local' | 'auto';

export type Tone = 'polite' | 'casual' | 'formal';

export interface ExpectedPhrase {
  japanese: string;
  kanaReading?: string;
  romaji: string;
  english: string;
  tip?: string;
}

export interface QuickAction {
  label: string;
  english: string;
  japanese: string;
  kanaReading?: string;
  romaji: string;
  situation: SituationId;
}

export interface CounterCard {
  id: string;
  category: SituationId;
  label: string;
  japanese: string;
  kanaReading?: string;
  romaji: string;
  english: string;
  icon?: string;
}

export interface SituationConfig {
  id: SituationId;
  name: string;
  japaneseName: string;
  icon: string;
  badge: string;
  description: string;
  commonPhrasesToExpect: ExpectedPhrase[];
  quickActions: QuickAction[];
  systemPromptContext: string;
}

export interface SuggestedReply {
  label: string;
  japanese: string;
  kanaReading?: string;
  romaji: string;
  meaning: string;
}

export interface Turn {
  id: string;
  timestamp: number;
  speaker: 'tourist' | 'local';
  input: string;
  japanese: string;
  kanaReading?: string; // Pure phonetic reading in Hiragana to eliminate ambiguous Kanji TTS pronunciations
  romaji: string;
  english: string;
  situationalIntent?: string;
  nuance?: string;
  culturalTip?: string;
  suggestedReplies?: SuggestedReply[];
}

export interface HistoryTurn {
  speaker: 'tourist' | 'local';
  input: string;
  japanese: string;
  english: string;
  situationalIntent?: string;
}

export interface TranslationRequest {
  input?: string;
  speaker: Speaker;
  situation: SituationId;
  history: HistoryTurn[];
  audioBase64?: string;
  audioMimeType?: string;
  ambientFilter?: boolean; // When true: ignores English conversations, only captures Japanese!
  tone?: Tone; // 'polite' (standard travel keigo/desu-masu), 'casual' (plain form / izakaya talk), 'formal' (business)
  customContext?: string; // User-provided custom situation notes (e.g. vegetarian, with kids, friend conversation)
}

export interface TranslationResponse {
  isIgnored?: boolean; // Set to true when ambient English conversation is detected and dropped
  noSpeechDetected?: boolean; // Set to true when audio contains silence or no intelligible speech
  detectedSpeaker?: 'tourist' | 'local';
  transcribedInput?: string;
  japanese: string;
  kanaReading?: string; // Pure phonetic reading in Hiragana matching Romaji
  romaji: string;
  english: string;
  situationalIntent: string;
  nuance: string;
  culturalTip: string;
  suggestedReplies: SuggestedReply[];
  appliedTone?: Tone;
  appliedContext?: string;
}
