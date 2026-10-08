import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Zap, 
  Layers, 
  Scroll, 
  Shield, 
  Dice5,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { ChatMessage, StoryState } from '../types';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyState: StoryState;
}

type ChatRole = 'dungeon_master' | 'lorekeeper' | 'companion';
type ChatModelPreference = 'auto' | 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';

export const ChatbotModal: React.FC<ChatbotModalProps> = ({
  isOpen,
  onClose,
  storyState,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content: `Greetings, traveler. I am the chronicle's Oracle and Dungeon Master. Ask me of the ancient ruins, assess the peril of upcoming maneuvers, or consult your companions along the trail. What whispers into your mind?`,
      timestamp: Date.now(),
      modelUsed: 'gemini-3.5-flash',
      roleName: 'Dungeon Master',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<ChatRole>('dungeon_master');
  const [modelPreference, setModelPreference] = useState<ChatModelPreference>('auto');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsSending(true);
    setErrorMsg(null);

    try {
      const activeChapter = storyState.chapters[storyState.activeChapterIndex];
      const gameContext = {
        characterName: storyState.character.name,
        characterRole: storyState.character.role,
        health: storyState.character.health,
        maxHealth: storyState.character.maxHealth,
        chapterTitle: activeChapter?.title,
        questTitle: storyState.quest.title,
        questStep: storyState.quest.currentStep,
        inventoryItems: storyState.inventory.map((i) => i.name),
        currentSceneNarrative: activeChapter?.narrativeText,
      };

      const res = await fetch('/api/adventure/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          role: selectedRole,
          modelPreference,
          gameContext,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.reply,
          timestamp: Date.now(),
          modelUsed: data.modelUsed,
          roleName:
            selectedRole === 'dungeon_master'
              ? 'Dungeon Master'
              : selectedRole === 'lorekeeper'
              ? 'Lorekeeper'
              : 'Companion',
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setErrorMsg(data.error || 'Failed to receive counsel.');
      }
    } catch (err: any) {
      setErrorMsg('Network error communicating with the oracle.');
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        content: `The slate is cleansed. Speak anew, traveler.`,
        timestamp: Date.now(),
        modelUsed: 'gemini-3.5-flash',
        roleName: 'Dungeon Master',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md select-none">
      <div 
        className="w-full max-w-2xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] overflow-hidden"
        role="dialog"
        aria-label="Oracle Chatbot"
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-sm text-stone-100 flex items-center gap-2">
                <span>ORACLE OF THE CHRONICLE</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                  Gemini Multi-Turn
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                In-world lore, tactical assessments & rules consultation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Reset Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              aria-label="Close Oracle Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role & Model Controls Strip */}
        <div className="px-4 py-2 bg-stone-950/40 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Persona / Role Selector */}
          <div className="flex items-center gap-1">
            <span className="text-stone-500 text-[11px] font-medium mr-1">Role:</span>
            <button
              onClick={() => setSelectedRole('dungeon_master')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedRole === 'dungeon_master'
                  ? 'bg-amber-600 text-stone-50 font-semibold'
                  : 'bg-stone-800/70 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Dice5 className="w-3 h-3" />
              <span>Dungeon Master</span>
            </button>

            <button
              onClick={() => setSelectedRole('lorekeeper')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedRole === 'lorekeeper'
                  ? 'bg-purple-600 text-stone-50 font-semibold'
                  : 'bg-stone-800/70 text-stone-400 hover:text-stone-200'
              }`}
              title="Specialized in mythos and ancient mysteries"
            >
              <Scroll className="w-3 h-3" />
              <span>Lorekeeper</span>
            </button>

            <button
              onClick={() => setSelectedRole('companion')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedRole === 'companion'
                  ? 'bg-emerald-600 text-stone-50 font-semibold'
                  : 'bg-stone-800/70 text-stone-400 hover:text-stone-200'
              }`}
              title="In-character travel companion"
            >
              <Shield className="w-3 h-3" />
              <span>Companion</span>
            </button>
          </div>

          {/* Model Selection Affordance */}
          <div className="flex items-center gap-1">
            <span className="text-stone-500 text-[11px] font-medium mr-1">Model:</span>
            <select
              value={modelPreference}
              onChange={(e) => setModelPreference(e.target.value as ChatModelPreference)}
              className="bg-stone-800 border border-stone-700 text-stone-200 rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-amber-500"
            >
              <option value="auto">Auto (Smart Route)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash (General Tasks)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
            </select>
          </div>

        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border ${
                  msg.role === 'user'
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-stone-800 border-stone-700 text-amber-300'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-sm font-sans ${
                  msg.role === 'user'
                    ? 'bg-amber-600/90 text-stone-100 rounded-tr-none'
                    : 'bg-stone-800/90 text-stone-200 rounded-tl-none border border-stone-700/60 font-serif'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-stone-700/50 text-[10px] text-amber-400 font-mono">
                    <span className="font-semibold">{msg.roleName || 'Oracle'}</span>
                    {msg.modelUsed && (
                      <>
                        <span className="text-stone-500">•</span>
                        <span className="text-stone-400">{msg.modelUsed}</span>
                      </>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-[9px] text-stone-400 text-right mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-stone-400 text-xs italic pl-9">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>The Oracle ponders the strands of fate...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Prompts */}
        <div className="px-4 py-1.5 bg-stone-950/40 border-t border-stone-800/60 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-stone-500 text-[10px] shrink-0 font-medium">Ask:</span>
          {[
            'What are my survival odds if I charge?',
            'What lore surrounds this cathedral?',
            'How can I use my runic dagger here?',
            'Companion, what is your intuition?',
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(promptText)}
              disabled={isSending}
              className="px-2 py-0.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 shrink-0 border border-stone-700 transition-all text-[11px]"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-stone-800 bg-stone-950 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask the ${selectedRole === 'dungeon_master' ? 'Dungeon Master' : selectedRole === 'lorekeeper' ? 'Lorekeeper' : 'Companion'} anything...`}
            disabled={isSending}
            className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-md shadow-amber-950/40"
            aria-label="Send message to Oracle"
          >
            <Send className="w-4 h-4 text-stone-950" />
          </button>
        </form>

      </div>
    </div>
  );
};
