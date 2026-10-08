import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Sword, 
  Shield, 
  Package, 
  Award, 
  Zap, 
  CornerDownRight,
  RefreshCw
} from 'lucide-react';
import { InventoryItem } from '../types';

interface ItemInspectModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onUseInAction: (itemName: string) => void;
  currentScene: string;
}

export const ItemInspectModal: React.FC<ItemInspectModalProps> = ({
  item,
  onClose,
  onUseInAction,
  currentScene,
}) => {
  const [appraisal, setAppraisal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    const fetchAppraisal = async () => {
      setIsLoading(true);
      setError(null);
      setAppraisal('');
      try {
        const res = await fetch('/api/adventure/inspect-item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item, currentScene }),
        });
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.appraisal) {
            setAppraisal(data.appraisal);
          } else {
            setAppraisal(item.description);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setAppraisal(item.description);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAppraisal();
    return () => {
      isMounted = false;
    };
  }, [item, currentScene]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md select-none">
      <div 
        className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-5 space-y-4"
        role="dialog"
        aria-label="Inspect Item"
      >
        <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono">
              {item.rarity} {item.type}
            </span>
            <h3 className="font-['Cinzel'] font-bold text-lg text-stone-100">
              {item.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 font-serif leading-relaxed">
            {item.description}
          </div>

          {item.effect && (
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{item.effect}</span>
            </div>
          )}

          {/* Low Latency Appraisal from gemini-3.1-flash-lite */}
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Situational Appraisal (Flash Lite)</span>
              </span>
              {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />}
            </div>

            {isLoading ? (
              <p className="text-xs text-stone-400 italic">
                Appraising item against current surroundings...
              </p>
            ) : appraisal ? (
              <p className="text-xs text-cyan-100 font-serif leading-relaxed italic">
                "{appraisal}"
              </p>
            ) : null}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-800">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => {
              onUseInAction(item.name);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-100 text-xs font-semibold shadow-md shadow-amber-950/40 border border-amber-500/40 transition-all active:scale-95"
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>Use in Next Turn Action</span>
          </button>
        </div>
      </div>
    </div>
  );
};
