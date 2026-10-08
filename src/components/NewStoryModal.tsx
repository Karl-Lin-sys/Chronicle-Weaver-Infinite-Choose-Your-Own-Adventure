import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  BookOpen, 
  User, 
  Palette, 
  Zap, 
  ArrowRight,
  Compass,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { GENRE_PRESETS, ART_STYLES } from '../constants/presets';
import { ImageSize, StoryMode, StorySettings, CharacterStatus, StoryState } from '../types';

interface NewStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStory: (newStory: StoryState) => void;
}

export const NewStoryModal: React.FC<NewStoryModalProps> = ({
  isOpen,
  onClose,
  onStartStory,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('eldritch_fantasy');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Form state
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customGenre, setCustomGenre] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  const [charName, setCharName] = useState<string>('Kaelen Vane');
  const [charRole, setCharRole] = useState<string>('Exiled Tide-Caster');
  const [charVisualAnchor, setCharVisualAnchor] = useState<string>(
    'Weathered pale wanderer with silver-streaked raven hair tied back in a leather thong, scarred left temple, glowing aqua runic brand on right forearm, dressed in a salt-stained dark teal hooded coat with brass buckles and worn leather bracers.'
  );

  const [selectedArtStyleId, setSelectedArtStyleId] = useState<string>('grimdark_oil');
  const [selectedImageSize, setSelectedImageSize] = useState<ImageSize>('1K');
  const [selectedStoryMode, setSelectedStoryMode] = useState<StoryMode>('standard');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    setIsCustomMode(false);
    const preset = GENRE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCharName(preset.defaultCharacter.name);
      setCharRole(preset.defaultCharacter.role);
      setCharVisualAnchor(preset.defaultCharacter.visualAnchor);
      setSelectedArtStyleId(preset.suggestedArtStyle);
    }
  };

  const handleStartAdventure = async () => {
    setIsInitializing(true);

    const artStyle = ART_STYLES.find((a) => a.id === selectedArtStyleId) || ART_STYLES[0];
    const preset = GENRE_PRESETS.find((p) => p.id === selectedPresetId);

    const finalTitle = isCustomMode ? customTitle || 'A Chronicle in the Dark' : preset?.name || 'New Adventure';
    const finalGenre = isCustomMode ? customGenre || 'High Fantasy' : preset?.tagline || 'Grimdark Fantasy';
    const startingPrompt = isCustomMode ? customPrompt : preset?.startingPrompt || '';

    const newCharacter: CharacterStatus = {
      name: charName.trim() || 'Wanderer',
      role: charRole.trim() || 'Adventurer',
      visualAnchor: charVisualAnchor.trim() || 'Traveler in dark cloak with travel-worn gear',
      health: 100,
      maxHealth: 100,
      resolve: 100,
      maxResolve: 100,
      statusEffects: [],
      title: 'The Seeker',
    };

    const newSettings: StorySettings = {
      genre: finalGenre,
      artStyleName: artStyle.name,
      artStylePrefix: artStyle.promptPrefix,
      preferredImageSize: selectedImageSize,
      autoGenerateImages: true,
      storyMode: selectedStoryMode,
    };

    try {
      // Call server to generate prologue Chapter 1
      const res = await fetch('/api/adventure/next-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPrologue: true,
          character: newCharacter,
          storyGenre: finalGenre,
          artStyle,
          mode: selectedStoryMode,
          storyPrompt: startingPrompt,
        }),
      });

      const responseData = await res.json();
      if (responseData.success && responseData.data) {
        const chapterData = responseData.data;

        const newStory: StoryState = {
          id: `story-${Date.now()}`,
          title: finalTitle,
          genre: finalGenre,
          startedAt: Date.now(),
          settings: newSettings,
          character: {
            ...newCharacter,
            statusEffects: chapterData.characterStatusDelta?.addedEffects || [],
          },
          quest: {
            id: `quest-${Date.now()}`,
            title: chapterData.questUpdate?.title || preset?.startingQuest.title || 'The Initial Objective',
            description: chapterData.questUpdate?.description || preset?.startingQuest.description || 'Survive and explore.',
            progressPercentage: chapterData.questUpdate?.progressPercentage || 10,
            currentStep: chapterData.questUpdate?.currentStep || preset?.startingQuest.currentStep || 'Take your first step.',
            completedSteps: [],
            recentMilestone: chapterData.questUpdate?.recentMilestone || 'Adventure begun.',
          },
          inventory: chapterData.inventoryDelta?.added || preset?.startingInventory || [],
          charactersMet: chapterData.charactersMetDelta?.newCharacters || [],
          chapters: [
            {
              id: `chap-1-${Date.now()}`,
              chapterNumber: 1,
              title: chapterData.chapterTitle || 'Chapter 1: The Beginning',
              narrativeText: chapterData.narrative,
              choicesAvailable: chapterData.choices || [],
              visualSceneDescription: chapterData.sceneImagePrompt || 'An adventurer begins their journey.',
              timestamp: Date.now(),
            },
          ],
          activeChapterIndex: 0,
          isGeneratingTurn: false,
          turnError: null,
        };

        onStartStory(newStory);
        onClose();
      } else {
        throw new Error(responseData.error || 'Server error creating adventure');
      }
    } catch (err: any) {
      console.error('Failed to create new adventure:', err);
      // Fallback: create starter story locally if network issue
      if (preset) {
        const fallbackStory: StoryState = {
          id: `story-fb-${Date.now()}`,
          title: preset.name,
          genre: preset.tagline,
          startedAt: Date.now(),
          settings: newSettings,
          character: newCharacter,
          quest: {
            id: `quest-${Date.now()}`,
            ...preset.startingQuest,
            progressPercentage: 10,
            completedSteps: [],
          },
          inventory: preset.startingInventory,
          charactersMet: [],
          chapters: [
            {
              id: `chap-1-${Date.now()}`,
              chapterNumber: 1,
              title: 'Chapter 1: The Threshold',
              narrativeText: preset.startingPrompt,
              choicesAvailable: [
                { id: 'fb-1', text: 'Step forward cautiously and inspect the perimeter.', riskLevel: 'safe' },
                { id: 'fb-2', text: 'Draw your weapon and advance swiftly.', riskLevel: 'moderate' },
                { id: 'fb-3', text: 'Call out into the darkness to see who answers.', riskLevel: 'perilous' },
              ],
              visualSceneDescription: 'An atmospheric beginning of an epic quest.',
              timestamp: Date.now(),
            },
          ],
          activeChapterIndex: 0,
          isGeneratingTurn: false,
          turnError: null,
        };
        onStartStory(fallbackStory);
        onClose();
      }
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-label="Create New Adventure"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-amber-200 border border-amber-500/30 shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-bold text-lg text-stone-100">
                WEAVE A NEW CHRONICLE
              </h2>
              <p className="text-xs text-stone-400">
                Choose a world seed, configure visual continuity, and begin an infinite journey.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

          {/* 1. Setting & Scenario Presets */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>1. Choose Scenario Preset or Custom Sandbox</span>
            </label>

            <div className="grid sm:grid-cols-3 gap-3">
              {GENRE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    !isCustomMode && selectedPresetId === preset.id
                      ? 'bg-amber-600/15 border-amber-500 shadow-md shadow-amber-950/30'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono text-amber-400/90 uppercase tracking-wider block mb-1">
                      {preset.tagline}
                    </span>
                    <h4 className="font-['Cinzel'] font-bold text-xs sm:text-sm text-stone-100 mb-1">
                      {preset.name}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-serif line-clamp-3">
                      {preset.description}
                    </p>
                  </div>
                  {!isCustomMode && selectedPresetId === preset.id && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Mode Toggle */}
            <div className="pt-1">
              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  isCustomMode
                    ? 'bg-amber-600 text-stone-100 border-amber-500'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-stone-100'
                }`}
              >
                {isCustomMode ? '✓ Custom Mode Active' : '+ Or Write Custom Setting / World Premise'}
              </button>
            </div>

            {isCustomMode && (
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Adventure Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. The Spire of the Frozen Moon"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Genre / Theme</label>
                    <input
                      type="text"
                      value={customGenre}
                      onChange={(e) => setCustomGenre(e.target.value)}
                      placeholder="e.g. Cosmic Horror, Steampunk Western, Norse Myth"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Opening Scene Premise</label>
                  <textarea
                    rows={2}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe where your journey begins and what mystery confronts you..."
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-xs text-stone-100 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Protagonist & Character Visual Anchor (Essential for Art Style Consistency) */}
          <div className="space-y-3 p-4 rounded-xl bg-stone-950/70 border border-stone-800">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>2. Protagonist & Persistent Visual Anchor</span>
              </span>
              <span className="text-[10px] text-amber-300 font-mono font-normal">
                Ensures Character Visual Continuity
              </span>
            </label>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Character Name</label>
                <input
                  type="text"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Role / Class / Archetype</label>
                <input
                  type="text"
                  value={charRole}
                  onChange={(e) => setCharRole(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-stone-300 font-medium block mb-1">
                Persistent Physical Appearance / Visual Anchor (Injected into every image prompt):
              </label>
              <textarea
                rows={3}
                value={charVisualAnchor}
                onChange={(e) => setCharVisualAnchor(e.target.value)}
                placeholder="Describe hair, scars, armor, eyes, clothing so the AI reproduces the exact character in every scene..."
                className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-xs text-stone-200 font-serif leading-relaxed"
              />
              <p className="text-[11px] text-stone-500 italic mt-1">
                * Consistent details (e.g. "scarred left eye, teal hooded tunic with brass buckles") ensure {charName || 'your character'} looks identical in every real-time generated image.
              </p>
            </div>
          </div>

          {/* 3. Art Style Preset */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Palette className="w-4 h-4" />
              <span>3. Consistent Art Style Direction</span>
            </label>

            <div className="grid sm:grid-cols-3 gap-2.5">
              {ART_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedArtStyleId(style.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedArtStyleId === style.id
                      ? 'bg-amber-600/15 border-amber-500 shadow-md'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="w-3 h-3 rounded-full border border-stone-700 shrink-0" 
                      style={{ backgroundColor: style.previewColor }}
                    />
                    <h5 className="font-semibold text-xs text-stone-200 truncate">
                      {style.name}
                    </h5>
                  </div>
                  <p className="text-[10px] text-stone-400 line-clamp-2">
                    {style.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Generation Options (Affordance for 1K, 2K, 4K & Model Speed) */}
          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-950/80 border border-stone-800">
            {/* Image Resolution (1K, 2K, 4K) */}
            <div>
              <label className="text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Image Resolution (gemini-3-pro-image-preview):</span>
              </label>
              <div className="flex gap-2">
                {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedImageSize(size)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      selectedImageSize === size
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                Select output resolution for scene illustrations.
              </p>
            </div>

            {/* Story Engine Mode */}
            <div>
              <label className="text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Story Mode / Latency:</span>
              </label>
              <select
                value={selectedStoryMode}
                onChange={(e) => setSelectedStoryMode(e.target.value as StoryMode)}
                className="w-full bg-stone-900 border border-stone-700 text-stone-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="standard">Standard Balanced (gemini-3.5-flash)</option>
                <option value="fast">Low-Latency Fast (gemini-3.1-flash-lite)</option>
                <option value="deep-lore">Deep Lore & Complexity (gemini-3.1-pro-preview)</option>
              </select>
              <p className="text-[10px] text-stone-500 mt-1">
                Fast mode offers snappy ~1s responses; Deep Lore offers maximum world-building.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleStartAdventure}
            disabled={isInitializing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-100 font-semibold text-xs sm:text-sm shadow-lg shadow-amber-950/60 border border-amber-500/40 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
          >
            {isInitializing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>Weaving Chapter 1...</span>
              </>
            ) : (
              <>
                <span>Begin Adventure</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
