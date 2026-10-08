import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StoryView } from './components/StoryView';
import { ChatbotModal } from './components/ChatbotModal';
import { NewStoryModal } from './components/NewStoryModal';
import { ItemInspectModal } from './components/ItemInspectModal';
import { ImageLightbox } from './components/ImageLightbox';
import { INITIAL_STORY } from './constants/presets';
import { 
  StoryState, 
  ImageSize, 
  StoryMode, 
  InventoryItem, 
  StoryChapter 
} from './types';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'chronicle_weaver_adventure_v1';

export default function App() {
  const [storyState, setStoryState] = useState<StoryState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.chapters && parsed.chapters.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not restore saved story', e);
    }
    return INITIAL_STORY;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isNewStoryOpen, setIsNewStoryOpen] = useState<boolean>(false);
  const [inspectedItem, setInspectedItem] = useState<InventoryItem | null>(null);
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    prompt: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
    prompt: '',
  });

  const [prefilledAction, setPrefilledAction] = useState<string>('');

  // Persist to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storyState));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [storyState]);

  // Handler to generate image for a specific chapter using gemini-3-pro-image-preview
  const handleGenerateImage = async (chapterId: string, resolution: ImageSize) => {
    const chapter = storyState.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;

    // Set loading state for this chapter
    setStoryState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) =>
        c.id === chapterId ? { ...c, imageLoading: true, imageError: undefined } : c
      ),
    }));

    // Construct consistent art prompt combining:
    // 1. Style prefix
    // 2. Character visual anchor
    // 3. Scene visual description
    const fullArtPrompt = `${prevArtPrefix(storyState)}. In this scene: ${chapter.visualSceneDescription}. Protagonist appearance anchor: ${storyState.character.visualAnchor}. Highly detailed visual narrative art, cinematic lighting.`;

    try {
      const res = await fetch('/api/adventure/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullArtPrompt,
          aspectRatio: '16:9',
          imageSize: resolution,
        }),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setStoryState((prev) => ({
          ...prev,
          chapters: prev.chapters.map((c) =>
            c.id === chapterId
              ? {
                  ...c,
                  imageUrl: data.imageUrl,
                  imageResolution: resolution,
                  imageLoading: false,
                }
              : c
          ),
        }));
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      setStoryState((prev) => ({
        ...prev,
        chapters: prev.chapters.map((c) =>
          c.id === chapterId
            ? {
                ...c,
                imageLoading: false,
                imageError: err.message || 'Scene image unavailable at this time',
              }
            : c
        ),
      }));
    }
  };

  function prevArtPrefix(state: StoryState): string {
    return state.settings.artStylePrefix || 'Dark fantasy cinematic masterpiece oil painting';
  }

  // Handler for taking an action or choice in the story
  const handleMakeChoice = async (choiceText: string) => {
    if (storyState.isGeneratingTurn) return;

    setStoryState((prev) => ({
      ...prev,
      isGeneratingTurn: true,
      turnError: null,
    }));

    try {
      const recentHistory = storyState.chapters.slice(-4).map((c) => ({
        chapterNumber: c.chapterNumber,
        title: c.title,
        choiceTaken: c.choiceTaken,
        narrativeText: c.narrativeText,
      }));

      const res = await fetch('/api/adventure/next-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: storyState.character,
          inventory: storyState.inventory,
          quest: storyState.quest,
          recentHistory,
          choiceMade: choiceText,
          storyGenre: storyState.genre,
          artStyle: {
            artStyleName: storyState.settings.artStyleName,
            artStylePrefix: storyState.settings.artStylePrefix,
          },
          mode: storyState.settings.storyMode,
        }),
      });

      const responseData = await res.json();
      if (!responseData.success || !responseData.data) {
        throw new Error(responseData.error || 'The chronicles failed to advance');
      }

      const chapterData = responseData.data;
      const nextChapterNum = storyState.chapters.length + 1;
      const newChapterId = `chap-${nextChapterNum}-${Date.now()}`;

      // 1. Process Inventory Deltas
      let updatedInventory = [...storyState.inventory];
      if (chapterData.inventoryDelta) {
        // Add new items
        if (Array.isArray(chapterData.inventoryDelta.added)) {
          chapterData.inventoryDelta.added.forEach((newItem: any) => {
            const existingIndex = updatedInventory.findIndex(
              (i) => i.name.toLowerCase() === newItem.name.toLowerCase()
            );
            if (existingIndex >= 0) {
              updatedInventory[existingIndex].quantity += newItem.quantity || 1;
            } else {
              updatedInventory.push({
                ...newItem,
                id: newItem.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                acquiredChapter: nextChapterNum,
              });
            }
          });
        }
        // Remove items
        if (Array.isArray(chapterData.inventoryDelta.removedIds)) {
          const toRemove = new Set(chapterData.inventoryDelta.removedIds.map((s: string) => s.toLowerCase()));
          updatedInventory = updatedInventory.filter(
            (i) => !toRemove.has(i.id.toLowerCase()) && !toRemove.has(i.name.toLowerCase())
          );
        }
        // Update items
        if (Array.isArray(chapterData.inventoryDelta.updated)) {
          chapterData.inventoryDelta.updated.forEach((upItem: any) => {
            const idx = updatedInventory.findIndex(
              (i) => i.id === upItem.id || i.name.toLowerCase() === upItem.id?.toLowerCase()
            );
            if (idx >= 0) {
              updatedInventory[idx] = { ...updatedInventory[idx], ...upItem };
            }
          });
        }
      }

      // 2. Process Quest Updates
      const updatedQuest = { ...storyState.quest };
      if (chapterData.questUpdate) {
        if (chapterData.questUpdate.title) updatedQuest.title = chapterData.questUpdate.title;
        if (chapterData.questUpdate.description) updatedQuest.description = chapterData.questUpdate.description;
        if (chapterData.questUpdate.currentStep) updatedQuest.currentStep = chapterData.questUpdate.currentStep;
        if (typeof chapterData.questUpdate.progressPercentage === 'number') {
          updatedQuest.progressPercentage = Math.min(100, Math.max(0, chapterData.questUpdate.progressPercentage));
        }
        if (chapterData.questUpdate.recentMilestone) {
          updatedQuest.recentMilestone = chapterData.questUpdate.recentMilestone;
        }
        if (chapterData.questUpdate.addCompletedStep) {
          updatedQuest.completedSteps = [
            ...(updatedQuest.completedSteps || []),
            chapterData.questUpdate.addCompletedStep,
          ];
        }
      }

      // 3. Process Character Status Deltas
      const updatedCharacter = { ...storyState.character };
      if (chapterData.characterStatusDelta) {
        if (typeof chapterData.characterStatusDelta.healthChange === 'number') {
          updatedCharacter.health = Math.max(
            0,
            Math.min(
              updatedCharacter.maxHealth,
              updatedCharacter.health + chapterData.characterStatusDelta.healthChange
            )
          );
        }
        if (typeof chapterData.characterStatusDelta.resolveChange === 'number') {
          updatedCharacter.resolve = Math.max(
            0,
            Math.min(
              updatedCharacter.maxResolve,
              updatedCharacter.resolve + chapterData.characterStatusDelta.resolveChange
            )
          );
        }
        if (Array.isArray(chapterData.characterStatusDelta.addedEffects)) {
          updatedCharacter.statusEffects = Array.from(
            new Set([...updatedCharacter.statusEffects, ...chapterData.characterStatusDelta.addedEffects])
          );
        }
        if (Array.isArray(chapterData.characterStatusDelta.removedEffects)) {
          const toRemove = new Set(chapterData.characterStatusDelta.removedEffects);
          updatedCharacter.statusEffects = updatedCharacter.statusEffects.filter((e) => !toRemove.has(e));
        }
      }

      // 4. Process Characters Met (NPCs)
      let updatedNPCs = [...storyState.charactersMet];
      if (chapterData.charactersMetDelta?.newCharacters) {
        chapterData.charactersMetDelta.newCharacters.forEach((newNpc: any) => {
          if (!updatedNPCs.some((n) => n.name.toLowerCase() === newNpc.name.toLowerCase())) {
            updatedNPCs.push({
              ...newNpc,
              id: newNpc.id || `npc-${Date.now()}`,
              lastSeenChapter: nextChapterNum,
            });
          }
        });
      }

      // 5. Construct New Chapter Object
      const newChapter: StoryChapter = {
        id: newChapterId,
        chapterNumber: nextChapterNum,
        title: chapterData.chapterTitle || `Chapter ${nextChapterNum}`,
        narrativeText: chapterData.narrative,
        choiceTaken: choiceText,
        choicesAvailable: chapterData.choices || [],
        visualSceneDescription: chapterData.sceneImagePrompt || 'The adventure continues deeper into the realm.',
        timestamp: Date.now(),
      };

      const newChapters = [...storyState.chapters, newChapter];

      setStoryState((prev) => ({
        ...prev,
        character: updatedCharacter,
        inventory: updatedInventory,
        quest: updatedQuest,
        charactersMet: updatedNPCs,
        chapters: newChapters,
        activeChapterIndex: newChapters.length - 1,
        isGeneratingTurn: false,
        turnError: null,
      }));

      // Automatically generate real-time image if autoGenerateImages is enabled
      if (storyState.settings.autoGenerateImages) {
        handleGenerateImage(newChapterId, storyState.settings.preferredImageSize);
      }
    } catch (err: any) {
      console.error('Turn generation failed:', err);
      setStoryState((prev) => ({
        ...prev,
        isGeneratingTurn: false,
        turnError: err.message || 'An arcane interference disrupted the chronicle. Please try again.',
      }));
    }
  };

  const handleSelectImageSize = (size: ImageSize) => {
    setStoryState((prev) => ({
      ...prev,
      settings: { ...prev.settings, preferredImageSize: size },
    }));
  };

  const handleSelectStoryMode = (mode: StoryMode) => {
    setStoryState((prev) => ({
      ...prev,
      settings: { ...prev.settings, storyMode: mode },
    }));
  };

  const handleStartNewStory = (newStory: StoryState) => {
    setStoryState(newStory);
    // Trigger image generation for chapter 1
    if (newStory.chapters[0] && newStory.settings.autoGenerateImages) {
      handleGenerateImage(newStory.chapters[0].id, newStory.settings.preferredImageSize);
    }
  };

  const activeChapter = storyState.chapters[storyState.activeChapterIndex] || storyState.chapters[0];
  const isLatestChapter = storyState.activeChapterIndex === storyState.chapters.length - 1;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Header Navbar */}
      <Navbar
        storyTitle={storyState.title}
        genre={storyState.genre}
        artStyleName={storyState.settings.artStyleName}
        preferredImageSize={storyState.settings.preferredImageSize}
        onSelectImageSize={handleSelectImageSize}
        storyMode={storyState.settings.storyMode}
        onSelectStoryMode={handleSelectStoryMode}
        onOpenNewStory={() => setIsNewStoryOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        isChatOpen={isChatOpen}
        totalChapters={storyState.chapters.length}
      />

      {/* Main Container: Story Reader + Dynamic Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex overflow-hidden">
        
        {/* Main Story Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          
          {storyState.turnError && (
            <div className="max-w-4xl mx-auto px-4 pt-4">
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{storyState.turnError}</span>
                </div>
                <button
                  onClick={() => setStoryState((p) => ({ ...p, turnError: null }))}
                  className="px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-xs text-rose-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {storyState.isGeneratingTurn && (
            <div className="max-w-4xl mx-auto px-4 pt-6">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 flex items-center justify-center gap-3 animate-pulse shadow-md">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                <span className="font-['Cinzel'] font-bold text-sm tracking-wide">
                  The Chronicle Weaves Your Fate... ({storyState.settings.storyMode === 'fast' ? 'Fast Turn with gemini-3.1-flash-lite' : storyState.settings.storyMode === 'deep-lore' ? 'Deep Lore with gemini-3.1-pro-preview' : 'Standard with gemini-3.5-flash'})
                </span>
              </div>
            </div>
          )}

          <StoryView
            chapter={activeChapter}
            isLatestChapter={isLatestChapter}
            onMakeChoice={handleMakeChoice}
            onGenerateImage={handleGenerateImage}
            isGeneratingTurn={storyState.isGeneratingTurn}
            preferredImageSize={storyState.settings.preferredImageSize}
            onSelectImageSize={handleSelectImageSize}
            onOpenLightbox={(imageUrl, title, prompt) =>
              setLightboxData({ isOpen: true, imageUrl, title, prompt })
            }
            artStyleName={storyState.settings.artStyleName}
            character={storyState.character}
            inventory={storyState.inventory}
            prefilledAction={prefilledAction}
            onClearPrefilledAction={() => setPrefilledAction('')}
          />
        </main>

        {/* Dynamic Sidebar: Tracks Inventory & Current Quest automatically */}
        <Sidebar
          quest={storyState.quest}
          inventory={storyState.inventory}
          character={storyState.character}
          charactersMet={storyState.charactersMet}
          chapters={storyState.chapters}
          activeChapterIndex={storyState.activeChapterIndex}
          onSelectChapter={(idx) =>
            setStoryState((prev) => ({ ...prev, activeChapterIndex: idx }))
          }
          onInspectItem={(item) => setInspectedItem(item)}
          onUseItemInAction={(itemName) => setPrefilledAction(itemName)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

      </div>

      {/* Gemini Chatbot Modal (Multi-Turn Oracle with DM / Lorekeeper / Companion roles) */}
      <ChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        storyState={storyState}
      />

      {/* New Adventure Setup Modal */}
      <NewStoryModal
        isOpen={isNewStoryOpen}
        onClose={() => setIsNewStoryOpen(false)}
        onStartStory={handleStartNewStory}
      />

      {/* Item Inspect Modal (Low-Latency gemini-3.1-flash-lite) */}
      <ItemInspectModal
        item={inspectedItem}
        onClose={() => setInspectedItem(null)}
        onUseInAction={(itemName) => setPrefilledAction(itemName)}
        currentScene={activeChapter?.narrativeText || ''}
      />

      {/* High-Resolution Art Lightbox */}
      <ImageLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((p) => ({ ...p, isOpen: false }))}
        imageUrl={lightboxData.imageUrl}
        title={lightboxData.title}
        prompt={lightboxData.prompt}
      />

    </div>
  );
}
