import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Compass, 
  MessageSquare, 
  PlusCircle, 
  Image as ImageIcon,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  Layers
} from 'lucide-react';
import { ImageSize, StoryMode } from '../types';

interface NavbarProps {
  storyTitle: string;
  genre: string;
  artStyleName: string;
  preferredImageSize: ImageSize;
  onSelectImageSize: (size: ImageSize) => void;
  storyMode: StoryMode;
  onSelectStoryMode: (mode: StoryMode) => void;
  onOpenNewStory: () => void;
  onToggleChat: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  totalChapters: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  storyTitle,
  genre,
  artStyleName,
  preferredImageSize,
  onSelectImageSize,
  storyMode,
  onSelectStoryMode,
  onOpenNewStory,
  onToggleChat,
  onToggleSidebar,
  isSidebarOpen,
  isChatOpen,
  totalChapters,
}) => {
  const [showSettingsDropdown, setShowSettingsDropdown] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Branding & Story Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg border transition-all lg:hidden ${
              isSidebarOpen 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
            }`}
            title="Toggle Quest & Inventory Sidebar"
            aria-label="Toggle Sidebar"
          >
            <Compass className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center shadow-lg shadow-amber-950/40 border border-amber-500/30">
              <BookOpen className="w-5 h-5 text-amber-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-['Cinzel'] font-bold text-base tracking-wide text-amber-100 truncate">
                  CHRONICLE WEAVER
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Infinite Engine
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate flex items-center gap-1.5">
                <span className="text-stone-300 font-medium truncate">{storyTitle}</span>
                <span className="text-stone-600">•</span>
                <span className="text-stone-500 hidden md:inline">{genre}</span>
                <span className="text-stone-600 hidden md:inline">•</span>
                <span className="text-amber-400/80 font-mono text-[11px]">Ch. {totalChapters}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Engine Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Image Size Selector Affordance (1K, 2K, 4K) */}
          <div className="hidden sm:flex items-center bg-stone-900/90 rounded-lg border border-stone-800 p-0.5 shadow-inner">
            <div className="px-2 py-1 text-[11px] font-medium text-stone-400 flex items-center gap-1 border-r border-stone-800">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Art Res</span>
            </div>
            {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
              <button
                key={size}
                onClick={() => onSelectImageSize(size)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  preferredImageSize === size
                    ? 'bg-amber-600 text-amber-50 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
                title={`Generate illustrations at ${size} resolution with gemini-3-pro-image-preview`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Engine Speed / Model Mode Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                storyMode === 'fast'
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60 hover:bg-cyan-900/40'
                  : storyMode === 'deep-lore'
                  ? 'bg-purple-950/60 text-purple-300 border-purple-800/60 hover:bg-purple-900/40'
                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800/60'
              }`}
              title="Story Mode & AI Model Settings"
            >
              {storyMode === 'fast' ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden md:inline">Fast Mode</span>
                  <span className="text-[10px] text-cyan-400/80 font-mono">Flash Lite</span>
                </>
              ) : storyMode === 'deep-lore' ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden md:inline">Deep Lore</span>
                  <span className="text-[10px] text-purple-400/80 font-mono">Pro</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Standard</span>
                  <span className="text-[10px] text-stone-400 font-mono">Flash</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showSettingsDropdown && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-2.5 z-50 text-xs"
                onMouseLeave={() => setShowSettingsDropdown(false)}
              >
                <div className="px-2 py-1 font-semibold text-stone-300 border-b border-stone-800 mb-1.5">
                  Story Engine Mode
                </div>
                
                <button
                  onClick={() => { onSelectStoryMode('standard'); setShowSettingsDropdown(false); }}
                  className={`w-full text-left p-2 rounded-lg transition-all flex flex-col gap-0.5 ${
                    storyMode === 'standard' ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30' : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Standard Balanced
                    </span>
                    <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">gemini-3.5-flash</span>
                  </div>
                  <span className="text-[11px] text-stone-400">Balanced depth, high narrative fidelity and steady tempo.</span>
                </button>

                <button
                  onClick={() => { onSelectStoryMode('fast'); setShowSettingsDropdown(false); }}
                  className={`w-full text-left p-2 rounded-lg transition-all flex flex-col gap-0.5 mt-1 ${
                    storyMode === 'fast' ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30' : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Low-Latency Fast
                    </span>
                    <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-300 font-mono">gemini-3.1-flash-lite</span>
                  </div>
                  <span className="text-[11px] text-stone-400">Near-instant responses for rapid action and fast gameplay.</span>
                </button>

                <button
                  onClick={() => { onSelectStoryMode('deep-lore'); setShowSettingsDropdown(false); }}
                  className={`w-full text-left p-2 rounded-lg transition-all flex flex-col gap-0.5 mt-1 ${
                    storyMode === 'deep-lore' ? 'bg-purple-500/15 text-purple-200 border border-purple-500/30' : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      Deep Lore & Complex
                    </span>
                    <span className="text-[10px] bg-purple-950 px-1.5 py-0.5 rounded text-purple-300 font-mono">gemini-3.1-pro-preview</span>
                  </div>
                  <span className="text-[11px] text-stone-400">Deep psychological nuance, elaborate mythos and tactical depth.</span>
                </button>

                {/* Mobile image size affordance fallback */}
                <div className="sm:hidden pt-2 mt-2 border-t border-stone-800">
                  <div className="font-semibold text-stone-400 mb-1.5 px-1">Art Resolution:</div>
                  <div className="flex gap-1">
                    {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => { onSelectImageSize(size); setShowSettingsDropdown(false); }}
                        className={`flex-1 py-1 rounded text-center text-xs font-semibold ${
                          preferredImageSize === size ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gemini Chatbot button (DM / Lorekeeper / Companion) */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm ${
              isChatOpen
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-semibold'
                : 'bg-stone-900 text-amber-200 border-amber-600/40 hover:bg-stone-850 hover:border-amber-500'
            }`}
            title="Consult the Gemini Oracle / Dungeon Master Chatbot"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Oracle Chat</span>
          </button>

          {/* New Adventure Button */}
          <button
            onClick={onOpenNewStory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-950/40 border border-amber-500/40 transition-all active:scale-95"
            title="Start a new adventure story"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Journey</span>
          </button>

        </div>
      </div>
    </header>
  );
};
