import React, { useState } from 'react';
import { 
  Backpack, 
  Compass, 
  User, 
  Users, 
  Scroll, 
  Shield, 
  Sword, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ChevronRight, 
  ChevronDown, 
  X,
  Package,
  Heart,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';
import { InventoryItem, Quest, CharacterStatus, NPC, StoryChapter } from '../types';

interface SidebarProps {
  quest: Quest;
  inventory: InventoryItem[];
  character: CharacterStatus;
  charactersMet: NPC[];
  chapters: StoryChapter[];
  activeChapterIndex: number;
  onSelectChapter: (index: number) => void;
  onInspectItem: (item: InventoryItem) => void;
  onUseItemInAction: (itemName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'quest' | 'inventory' | 'character' | 'party' | 'log';

export const Sidebar: React.FC<SidebarProps> = ({
  quest,
  inventory,
  character,
  charactersMet,
  chapters,
  activeChapterIndex,
  onSelectChapter,
  onInspectItem,
  onUseItemInAction,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('quest');
  const [inventoryFilter, setInventoryFilter] = useState<string>('all');
  const [showCompletedSteps, setShowCompletedSteps] = useState<boolean>(false);

  // Filter items
  const filteredInventory = inventory.filter((item) => {
    if (inventoryFilter === 'all') return true;
    return item.type === inventoryFilter;
  });

  const getRarityBadge = (rarity: InventoryItem['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'epic':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'rare':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'uncommon':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-stone-400 bg-stone-500/10 border-stone-600/30';
    }
  };

  const getRarityCardBorder = (rarity: InventoryItem['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-500/40 hover:border-amber-400/70 bg-gradient-to-br from-amber-950/20 to-stone-900/90';
      case 'epic':
        return 'border-purple-500/40 hover:border-purple-400/70 bg-gradient-to-br from-purple-950/20 to-stone-900/90';
      case 'rare':
        return 'border-sky-500/30 hover:border-sky-400/60 bg-gradient-to-br from-sky-950/20 to-stone-900/90';
      case 'uncommon':
        return 'border-emerald-500/30 hover:border-emerald-400/60 bg-gradient-to-br from-emerald-950/20 to-stone-900/90';
      default:
        return 'border-stone-800 hover:border-stone-700 bg-stone-900/80';
    }
  };

  const getItemTypeIcon = (type: InventoryItem['type']) => {
    switch (type) {
      case 'weapon':
        return <Sword className="w-3.5 h-3.5 text-rose-400" />;
      case 'armor':
        return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      case 'consumable':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'relic':
        return <Award className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Package className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 right-0 bottom-0 w-84 sm:w-96 bg-stone-950/95 lg:bg-stone-950/60 border-l border-stone-800/80 flex flex-col z-40 transition-transform duration-300 ease-in-out select-none backdrop-blur-md ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h2 className="font-['Cinzel'] font-bold text-sm text-stone-200 tracking-wider">
              JOURNAL & CODEX
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-200 lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-5 p-1 bg-stone-900/90 border-b border-stone-800/80 text-[11px] font-medium">
          <button
            onClick={() => setActiveTab('quest')}
            className={`py-2 flex flex-col items-center gap-1 rounded-md transition-all relative ${
              activeTab === 'quest'
                ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
            title="Current Quest & Milestones"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Quest</span>
            {quest.progressPercentage > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 flex flex-col items-center gap-1 rounded-md transition-all relative ${
              activeTab === 'inventory'
                ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
            title="Inventory & Gear"
          >
            <Backpack className="w-4 h-4 text-amber-400" />
            <span>Items</span>
            <span className="absolute top-1 right-1.5 px-1 py-0.2 bg-stone-800 border border-stone-700 rounded-full text-[9px] text-amber-300 font-mono">
              {inventory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('character')}
            className={`py-2 flex flex-col items-center gap-1 rounded-md transition-all ${
              activeTab === 'character'
                ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
            title="Character Sheet & Visual Anchor"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span>Vitals</span>
          </button>

          <button
            onClick={() => setActiveTab('party')}
            className={`py-2 flex flex-col items-center gap-1 rounded-md transition-all ${
              activeTab === 'party'
                ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
            title="NPCs & Encounters"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>NPCs</span>
            {charactersMet.length > 0 && (
              <span className="text-[9px] text-stone-400 font-mono">({charactersMet.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`py-2 flex flex-col items-center gap-1 rounded-md transition-all ${
              activeTab === 'log'
                ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
            title="Chronicle Log & Chapters"
          >
            <Scroll className="w-4 h-4 text-amber-400" />
            <span>Log</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

          {/* ================= 1. CURRENT QUEST TAB ================= */}
          {activeTab === 'quest' && (
            <div className="space-y-4">
              
              {/* Main Quest Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/30 to-stone-900 border border-amber-500/30 shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    Current Quest
                  </span>
                  <span className="text-xs font-mono font-semibold text-amber-300">
                    {quest.progressPercentage}% Complete
                  </span>
                </div>

                <h3 className="font-['Cinzel'] font-bold text-base text-amber-100 mb-1 leading-snug">
                  {quest.title}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed font-serif">
                  {quest.description}
                </p>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800">
                  <div 
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-amber-500/50"
                    style={{ width: `${Math.max(5, Math.min(100, quest.progressPercentage))}%` }}
                  />
                </div>
              </div>

              {/* Active Step */}
              <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-400">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Immediate Objective</span>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-950/80 border border-amber-500/20 text-xs text-stone-200 leading-relaxed font-medium">
                  {quest.currentStep}
                </div>
              </div>

              {/* Recent Milestone */}
              {quest.recentMilestone && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recent Milestone Achieved</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {quest.recentMilestone}
                  </p>
                </div>
              )}

              {/* Completed Steps Collapsible */}
              {quest.completedSteps && quest.completedSteps.length > 0 && (
                <div className="rounded-xl border border-stone-800/80 overflow-hidden bg-stone-900/40">
                  <button
                    onClick={() => setShowCompletedSteps(!showCompletedSteps)}
                    className="w-full px-3 py-2 text-xs flex items-center justify-between text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 transition-colors"
                  >
                    <span className="font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                      Completed Steps ({quest.completedSteps.length})
                    </span>
                    {showCompletedSteps ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {showCompletedSteps && (
                    <div className="p-2.5 pt-0 space-y-1.5 border-t border-stone-800/60">
                      {quest.completedSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-stone-400 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-through text-stone-500">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="text-[11px] text-stone-500 text-center italic pt-2">
                The AI automatically updates your quest based on the choices and discoveries you make in the story.
              </div>
            </div>
          )}

          {/* ================= 2. INVENTORY TAB ================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              {/* Type Filters */}
              <div className="flex flex-wrap gap-1 pb-1">
                {['all', 'weapon', 'consumable', 'tool', 'relic', 'lore'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setInventoryFilter(f)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all ${
                      inventoryFilter === f
                        ? 'bg-amber-600 text-amber-50 shadow-sm'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Items List */}
              {filteredInventory.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs rounded-xl border border-dashed border-stone-800">
                  <Package className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                  No items in this category. Explore the story to discover gear!
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredInventory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all ${getRarityCardBorder(item.rarity)}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {getItemTypeIcon(item.type)}
                          <span className="font-semibold text-xs text-stone-100 truncate">
                            {item.name}
                          </span>
                          {item.quantity > 1 && (
                            <span className="px-1.5 py-0.2 rounded bg-stone-800 text-amber-300 font-mono text-[10px] font-bold">
                              x{item.quantity}
                            </span>
                          )}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${getRarityBadge(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 line-clamp-2 mb-2 font-serif">
                        {item.description}
                      </p>

                      {item.effect && (
                        <div className="text-[10px] text-amber-300/90 bg-amber-950/30 border border-amber-500/20 rounded px-1.5 py-0.5 mb-2 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          <span className="truncate">{item.effect}</span>
                        </div>
                      )}

                      {/* Item Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/60">
                        <button
                          onClick={() => onInspectItem(item)}
                          className="flex items-center gap-1 text-[11px] text-stone-300 hover:text-amber-300 transition-colors py-0.5 px-1.5 rounded hover:bg-stone-800"
                          title="Inspect item with low-latency Gemini 3.1 Flash Lite"
                        >
                          <Eye className="w-3 h-3 text-stone-400" />
                          <span>Inspect</span>
                        </button>

                        <button
                          onClick={() => onUseItemInAction(item.name)}
                          className="text-[10px] font-semibold text-amber-300 hover:text-amber-100 bg-amber-950/40 hover:bg-amber-800/40 border border-amber-600/30 px-2 py-0.5 rounded transition-all"
                          title="Inject into next story action prompt"
                        >
                          Use in Action
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 3. CHARACTER SHEET TAB ================= */}
          {activeTab === 'character' && (
            <div className="space-y-4">
              {/* Header profile */}
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-700 to-amber-900 mx-auto mb-2 flex items-center justify-center border-2 border-amber-500/40 shadow-inner">
                  <User className="w-6 h-6 text-amber-200" />
                </div>
                <h3 className="font-['Cinzel'] font-bold text-stone-100 text-sm">
                  {character.name}
                </h3>
                <p className="text-xs text-amber-400/90 font-medium">
                  {character.role}
                </p>
                {character.title && (
                  <p className="text-[10px] text-stone-400 italic mt-0.5">
                    "{character.title}"
                  </p>
                )}
              </div>

              {/* Vitals */}
              <div className="space-y-2.5 p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                {/* Health */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3.5 h-3.5" />
                      Vitality (HP)
                    </span>
                    <span className="font-mono text-stone-300">
                      {character.health} / {character.maxHealth}
                    </span>
                  </div>
                  <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (character.health / character.maxHealth) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Resolve */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="flex items-center gap-1 text-sky-400">
                      <Flame className="w-3.5 h-3.5" />
                      Resolve / Sanity
                    </span>
                    <span className="font-mono text-stone-300">
                      {character.resolve} / {character.maxResolve}
                    </span>
                  </div>
                  <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800">
                    <div 
                      className="bg-sky-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (character.resolve / character.maxResolve) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Effects */}
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                <span className="text-xs font-semibold text-stone-300 block mb-2">
                  Active Conditions & Status
                </span>
                {character.statusEffects.length === 0 ? (
                  <span className="text-xs text-stone-500 italic">No adverse or blessed conditions.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {character.statusEffects.map((status, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      >
                        {status}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Character Visual Anchor (Essential for Art Style Consistency) */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Persistent Character Visual Anchor</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed font-serif">
                  {character.visualAnchor}
                </p>
                <div className="mt-2 text-[10px] text-amber-400/70 italic border-t border-amber-900/40 pt-1.5">
                  This physical signature is injected into every generated image prompt so {character.name} looks consistent across every chapter!
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. PARTY / NPCS TAB ================= */}
          {activeTab === 'party' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-stone-300 block">
                Dramatis Personae Met Along the Path
              </span>
              {charactersMet.length === 0 ? (
                <div className="p-6 text-center text-stone-500 text-xs rounded-xl border border-dashed border-stone-800">
                  <Users className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                  You travel alone. NPCs you meet in dialogue will be cataloged here.
                </div>
              ) : (
                charactersMet.map((npc) => (
                  <div
                    key={npc.id}
                    className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-stone-200">
                        {npc.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium capitalize border ${
                        npc.attitude === 'allied'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : npc.attitude === 'friendly'
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          : npc.attitude === 'hostile'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-stone-500/15 text-stone-300 border-stone-600/30'
                      }`}>
                        {npc.attitude}
                      </span>
                    </div>

                    <p className="text-[11px] text-amber-400/90 font-medium">
                      {npc.role}
                    </p>
                    <p className="text-[11px] text-stone-400 font-serif leading-relaxed">
                      {npc.notes}
                    </p>
                    <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-800">
                      Met in Chapter {npc.lastSeenChapter}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ================= 5. CHRONICLE LOG TAB ================= */}
          {activeTab === 'log' && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-300 block mb-1">
                Chapters Chronicled ({chapters.length})
              </span>
              {chapters.map((chap, idx) => (
                <button
                  key={chap.id}
                  onClick={() => onSelectChapter(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    activeChapterIndex === idx
                      ? 'bg-amber-600/20 border-amber-500/50 text-amber-100 shadow-md'
                      : 'bg-stone-900/70 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1 font-medium">
                    <span className="text-amber-400 font-mono font-bold">
                      Chapter {chap.chapterNumber}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {new Date(chap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-['Cinzel'] font-bold text-xs truncate mb-1">
                    {chap.title}
                  </h4>
                  {chap.choiceTaken && (
                    <p className="text-[10px] text-stone-400 line-clamp-1 italic">
                      Decision: "{chap.choiceTaken}"
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}

        </div>
      </aside>
    </>
  );
};
