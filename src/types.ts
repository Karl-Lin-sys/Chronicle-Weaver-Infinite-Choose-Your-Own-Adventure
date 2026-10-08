export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '16:9' | '4:3' | '1:1';
export type StoryMode = 'standard' | 'deep-lore' | 'fast';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'relic' | 'key' | 'tool' | 'lore';
  quantity: number;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isEquipped?: boolean;
  effect?: string;
  acquiredChapter?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progressPercentage: number;
  currentStep: string;
  completedSteps: string[];
  subTasks?: string[];
  recentMilestone?: string;
}

export interface CharacterStatus {
  name: string;
  role: string;
  visualAnchor: string; // Persistent physical appearance description
  health: number;
  maxHealth: number;
  resolve: number;
  maxResolve: number;
  statusEffects: string[];
  title?: string;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  attitude: 'allied' | 'friendly' | 'neutral' | 'wary' | 'hostile';
  visualAnchor: string;
  notes: string;
  lastSeenChapter: number;
}

export interface StoryChoice {
  id: string;
  text: string;
  riskLevel: 'safe' | 'moderate' | 'perilous';
  hint?: string;
  requiredItem?: string;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  narrativeText: string;
  choiceTaken?: string;
  choicesAvailable: StoryChoice[];
  visualSceneDescription: string;
  imageUrl?: string;
  imageResolution?: ImageSize;
  imageLoading?: boolean;
  imageError?: string;
  timestamp: number;
  diceRoll?: {
    action: string;
    roll: number;
    target: number;
    outcome: 'success' | 'failure' | 'critical';
  };
}

export interface StorySettings {
  genre: string;
  artStyleName: string;
  artStylePrefix: string;
  preferredImageSize: ImageSize;
  autoGenerateImages: boolean;
  storyMode: StoryMode;
}

export interface StoryState {
  id: string;
  title: string;
  genre: string;
  startedAt: number;
  settings: StorySettings;
  character: CharacterStatus;
  quest: Quest;
  inventory: InventoryItem[];
  charactersMet: NPC[];
  chapters: StoryChapter[];
  activeChapterIndex: number;
  isGeneratingTurn: boolean;
  turnError: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
  roleName?: string;
}
