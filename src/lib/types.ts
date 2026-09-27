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

export interface ExpectedPhrase {
  japanese: string;
  romaji: string;
  english: string;
  tip?: string;
}

export interface QuickAction {
  label: string;
  english: string;
  japanese: string;
  romaji: string;
  situation: SituationId;
}

export interface CounterCard {
  id: string;
  category: SituationId;
  label: string;
  japanese: string;
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
  romaji: string;
  meaning: string;
}

export interface Turn {
  id: string;
  timestamp: number;
  speaker: 'tourist' | 'local';
  input: string;
  japanese: string;
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
}

export interface TranslationResponse {
  isIgnored?: boolean; // Set to true when ambient English conversation is detected and dropped
  detectedSpeaker?: 'tourist' | 'local';
  transcribedInput?: string;
  japanese: string;
  romaji: string;
  english: string;
  situationalIntent: string;
  nuance: string;
  culturalTip: string;
  suggestedReplies: SuggestedReply[];
}
