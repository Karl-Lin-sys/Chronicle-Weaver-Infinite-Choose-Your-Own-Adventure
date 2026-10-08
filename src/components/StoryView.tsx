import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  ShieldCheck, 
  Send, 
  RefreshCw, 
  Maximize2, 
  Lightbulb, 
  Zap, 
  HelpCircle,
  Dice5,
  Layers,
  ChevronRight,
  Compass,
  AlertCircle
} from 'lucide-react';
import { StoryChapter, StoryChoice, ImageSize, CharacterStatus, InventoryItem } from '../types';

interface StoryViewProps {
  chapter: StoryChapter;
  isLatestChapter: boolean;
  onMakeChoice: (choiceText: string) => void;
  onGenerateImage: (chapterId: string, resolution: ImageSize) => void;
  isGeneratingTurn: boolean;
  preferredImageSize: ImageSize;
  onSelectImageSize: (size: ImageSize) => void;
  onOpenLightbox: (imageUrl: string, title: string, prompt: string) => void;
  artStyleName: string;
  character: CharacterStatus;
  inventory: InventoryItem[];
  prefilledAction?: string;
  onClearPrefilledAction?: () => void;
}

export const StoryView: React.FC<StoryViewProps> = ({
  chapter,
  isLatestChapter,
  onMakeChoice,
  onGenerateImage,
  isGeneratingTurn,
  preferredImageSize,
  onSelectImageSize,
  onOpenLightbox,
  artStyleName,
  character,
  inventory,
  prefilledAction = '',
  onClearPrefilledAction,
}) => {
  const [customActionText, setCustomActionText] = useState<string>('');
  const [quickIdeas, setQuickIdeas] = useState<string[]>([]);
  const [isLoadingQuickIdeas, setIsLoadingQuickIdeas] = useState<boolean>(false);
  const [quickIdeasError, setQuickIdeasError] = useState<string | null>(null);

  // Sync prefilled action if user clicked "Use in Action" in inventory
  React.useEffect(() => {
    if (prefilledAction) {
      setCustomActionText(`I use the ${prefilledAction} to `);
      if (onClearPrefilledAction) onClearPrefilledAction();
    }
  }, [prefilledAction, onClearPrefilledAction]);

  // Request low-latency action suggestions using gemini-3.1-flash-lite
  const fetchQuickActionSuggestions = async () => {
    try {
      setIsLoadingQuickIdeas(true);
      setQuickIdeasError(null);
      const res = await fetch('/api/adventure/quick-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneText: chapter.narrativeText,
          inventory,
          character,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.actions)) {
        setQuickIdeas(data.actions);
      } else {
        setQuickIdeasError('Could not retrieve suggestions.');
      }
    } catch (err: any) {
      setQuickIdeasError('Network error retrieving suggestions.');
    } finally {
      setIsLoadingQuickIdeas(false);
    }
  };

  const handleCustomActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActionText.trim() || isGeneratingTurn) return;
    onMakeChoice(customActionText.trim());
    setCustomActionText('');
    setQuickIdeas([]);
  };

  const getRiskIcon = (risk: StoryChoice['riskLevel']) => {
    switch (risk) {
      case 'perilous':
        return <Flame className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'moderate':
        return <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
  };

  const getRiskBadge = (risk: StoryChoice['riskLevel']) => {
    switch (risk) {
      case 'perilous':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'moderate':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-8">

      {/* Chapter Title & Number Banner */}
      <div className="text-center space-y-2 border-b border-stone-800/80 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-xs font-mono text-amber-400">
          <Compass className="w-3.5 h-3.5 text-amber-500" />
          <span>CHAPTER {chapter.chapterNumber}</span>
          {chapter.choiceTaken && (
            <>
              <span className="text-stone-600">•</span>
              <span className="text-stone-400 font-sans truncate max-w-xs sm:max-w-md">
                Led by: "{chapter.choiceTaken}"
              </span>
            </>
          )}
        </div>
        <h1 className="font-['Cinzel'] font-bold text-2xl sm:text-3xl md:text-4xl text-stone-100 tracking-wide leading-tight">
          {chapter.title}
        </h1>
      </div>

      {/* Real-Time Generated Image Section */}
      <div className="rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-2xl relative group">
        
        {/* Image Display */}
        {chapter.imageUrl ? (
          <div className="relative aspect-video sm:aspect-[21/9] bg-stone-950 overflow-hidden">
            <img
              src={chapter.imageUrl}
              alt={chapter.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102 cursor-pointer"
              onClick={() => onOpenLightbox(chapter.imageUrl!, chapter.title, chapter.visualSceneDescription)}
            />
            
            {/* Top Overlay Badge & Affordances */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-700/80 text-[11px] text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">{artStyleName}</span>
                <span className="text-stone-500">•</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-600/30 text-amber-300 font-mono font-bold">
                  {chapter.imageResolution || preferredImageSize}
                </span>
              </div>

              <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-950/80 backdrop-blur-md p-1 rounded-lg border border-stone-700/80">
                <button
                  onClick={() => onOpenLightbox(chapter.imageUrl!, chapter.title, chapter.visualSceneDescription)}
                  className="p-1.5 rounded text-stone-300 hover:text-stone-100 hover:bg-stone-800 transition-colors"
                  title="View full resolution in lightbox"
                  aria-label="View Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent p-4 pt-12 flex items-center justify-between text-xs text-stone-300">
              <p className="line-clamp-1 italic font-serif text-stone-400 max-w-xl">
                "{chapter.visualSceneDescription}"
              </p>
              
              {/* Quick Regenerate Affordance */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onGenerateImage(chapter.id, preferredImageSize)}
                  disabled={chapter.imageLoading}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-600/60 transition-all disabled:opacity-50"
                  title={`Regenerate illustration with gemini-3-pro-image-preview at ${preferredImageSize}`}
                >
                  <RefreshCw className={`w-3 h-3 ${chapter.imageLoading ? 'animate-spin' : ''}`} />
                  <span>Regen Art</span>
                </button>
              </div>
            </div>
          </div>
        ) : chapter.imageLoading ? (
          /* Image Generating State */
          <div className="aspect-video sm:aspect-[21/9] bg-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
              <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <h4 className="font-['Cinzel'] font-bold text-amber-200 text-sm">
                Generating Real-Time Scene Illustration...
              </h4>
              <p className="text-xs text-stone-400 font-mono">
                Model: gemini-3-pro-image-preview ({preferredImageSize})
              </p>
              <p className="text-xs text-stone-500 italic max-w-md">
                Injecting consistent character anchors and {artStyleName} aesthetic...
              </p>
            </div>
          </div>
        ) : (
          /* Placeholder / Manual Generate State */
          <div className="aspect-video sm:aspect-[21/9] bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-4 border border-stone-800/80">
            <div className="max-w-md space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-['Cinzel'] font-bold text-stone-200 text-sm">
                Scene Illustration Pending
              </h4>
              <p className="text-xs text-stone-400 font-serif line-clamp-2">
                "{chapter.visualSceneDescription}"
              </p>
            </div>

            {/* Resolution Selector Affordance (1K, 2K, 4K) */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs">
                <span className="text-[11px] text-stone-400 px-2">Size:</span>
                {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => onSelectImageSize(size)}
                    className={`px-2 py-0.5 rounded font-semibold text-xs transition-all ${
                      preferredImageSize === size
                        ? 'bg-amber-600 text-white'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onGenerateImage(chapter.id, preferredImageSize)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-50 text-xs font-semibold shadow-lg shadow-amber-950/50 border border-amber-500/40 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Illustrate Scene ({preferredImageSize})</span>
              </button>
            </div>

            {chapter.imageError && (
              <p className="text-xs text-amber-400/80 max-w-md">
                Note: {chapter.imageError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Narrative Prose */}
      <article className="prose prose-invert max-w-none">
        <div className="p-6 sm:p-8 rounded-2xl bg-stone-900/60 border border-stone-800/80 shadow-xl backdrop-blur-sm">
          {chapter.narrativeText.split('\n\n').map((paragraph, idx) => (
            <p
              key={idx}
              className={`text-stone-200 text-base sm:text-lg leading-relaxed font-['EB_Garamond',serif] mb-5 last:mb-0 ${
                idx === 0 ? 'first-letter:font-["Cinzel_Decorative"] first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-bold first-letter:text-amber-400 first-letter:float-left first-letter:mr-3 first-letter:pr-1 first-letter:leading-none' : ''
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      {/* Choices & Decision Section (Only active on latest chapter) */}
      {isLatestChapter ? (
        <section className="space-y-6 pt-4 border-t border-stone-800/80">
          
          <div className="flex items-center justify-between">
            <h3 className="font-['Cinzel'] font-bold text-lg text-stone-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <span>WHAT DO YOU DO NEXT?</span>
            </h3>
            <span className="text-xs text-stone-400 italic">
              Your choices permanently shape the unfolding story.
            </span>
          </div>

          {/* Preset AI Choices */}
          <div className="grid gap-3">
            {chapter.choicesAvailable.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onMakeChoice(choice.text)}
                disabled={isGeneratingTurn}
                className="group w-full text-left p-4 sm:p-4.5 rounded-xl bg-stone-900/80 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/60 transition-all duration-200 shadow-md hover:shadow-amber-950/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-stone-950 border border-stone-800 group-hover:border-amber-500/40 transition-colors">
                    {getRiskIcon(choice.riskLevel)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-stone-100 text-sm sm:text-base group-hover:text-amber-200 transition-colors">
                        {choice.text}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border shrink-0 ${getRiskBadge(choice.riskLevel)}`}>
                        {choice.riskLevel}
                      </span>
                    </div>

                    {choice.hint && (
                      <p className="text-xs text-stone-400 font-serif italic line-clamp-1">
                        Hint: {choice.hint}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>

          {/* Quick Idea Generator (Low-Latency gemini-3.1-flash-lite) */}
          <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Low-Latency Tactical Ideas (Flash Lite)</span>
              </div>
              <button
                onClick={fetchQuickActionSuggestions}
                disabled={isLoadingQuickIdeas || isGeneratingTurn}
                className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-100 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-700/40 px-2.5 py-1 rounded-md transition-all disabled:opacity-50"
                title="Generates 3 clever tactical moves using low-latency gemini-3.1-flash-lite"
              >
                <Lightbulb className={`w-3.5 h-3.5 ${isLoadingQuickIdeas ? 'animate-spin' : ''}`} />
                <span>{isLoadingQuickIdeas ? 'Consulting...' : 'Suggest Creative Moves'}</span>
              </button>
            </div>

            {quickIdeas.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-2 pt-1">
                {quickIdeas.map((idea, idx) => (
                  <button
                    key={idx}
                    onClick={() => onMakeChoice(idea)}
                    disabled={isGeneratingTurn}
                    className="p-2.5 rounded-lg bg-stone-900 hover:bg-cyan-950/30 border border-stone-800 hover:border-cyan-500/40 text-left text-xs text-stone-300 hover:text-cyan-200 transition-all font-serif italic"
                  >
                    "{idea}"
                  </button>
                ))}
              </div>
            )}

            {quickIdeasError && (
              <p className="text-xs text-rose-400">{quickIdeasError}</p>
            )}
          </div>

          {/* Free-form Custom Action Input */}
          <form onSubmit={handleCustomActionSubmit} className="space-y-2">
            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Or Type Any Custom Action (Infinite Agency):
              </span>
              <span className="text-[11px] text-stone-500">
                You can try anything—inspect, speak, cast, or flee
              </span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customActionText}
                onChange={(e) => setCustomActionText(e.target.value)}
                placeholder="e.g., I examine the carvings on the submerged gargoyle with my runic dagger..."
                disabled={isGeneratingTurn}
                className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />

              <button
                type="submit"
                disabled={!customActionText.trim() || isGeneratingTurn}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-100 font-semibold text-sm shadow-lg shadow-amber-950/50 border border-amber-500/40 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
              >
                {isGeneratingTurn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span className="hidden sm:inline">Weaving...</span>
                  </>
                ) : (
                  <>
                    <span>Act</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

        </section>
      ) : (
        /* Older Chapter Navigation Notice */
        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 text-center space-y-1">
          <p className="text-xs text-stone-400 italic">
            You are viewing a past chapter of your chronicle.
          </p>
          <p className="text-xs text-amber-400/90 font-medium">
            Jump to the latest chapter to make your next decision!
          </p>
        </div>
      )}

    </div>
  );
};
