import { useEffect, useState } from 'react';
import { Trash2, ArchiveX, Database } from 'lucide-react';
import { getAllItems, deleteItem, clearAllItems, SavedItem } from '../utils/storage';

interface SavedItemsProps {
  refreshTrigger: number;
}

export function SavedItems({ refreshTrigger }: SavedItemsProps) {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    loadItems();
  }, [refreshTrigger]);

  const loadItems = async () => {
    const data = await getAllItems();
    setItems(data); // getAllItems already sorts desc
  };

  const handleDelete = async (id?: number) => {
    if (id === undefined) return;
    await deleteItem(id);
    loadItems();
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all saved history?')) {
      await clearAllItems();
      loadItems();
    }
  };

  return (
    <div className="bg-surface-dark border border-emerald-900/30 p-6 rounded-3xl shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b border-emerald-900/20 pb-3">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary font-display">
           <Database className="text-primary" size={24} />
           Offline History
        </h2>
        {items.length > 0 && (
          <button onClick={handleClearAll} className="text-rose-400 p-2 hover:bg-rose-950/40 rounded-xl transition-colors" aria-label="Clear all history">
            <ArchiveX size={20} />
          </button>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="p-4 bg-deep-forest/40 border border-emerald-900/20 rounded-2xl text-center text-on-surface-variant text-xs font-semibold">
          📝 No actions recorded yet. Voice commands and scanned medicine text will be logged here automatically offline.
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {items.map(item => (
            <div key={item.id} className="bg-deep-forest/40 p-4 rounded-2xl flex justify-between items-start gap-4 border border-emerald-900/20">
              <div className="flex-1">
                <span className="text-xs text-primary uppercase font-bold tracking-wider mb-1 block">
                  {item.type.replace('_', ' ')} • {new Date(item.timestamp).toLocaleTimeString()}
                </span>
                <p className="text-sm text-on-surface font-semibold">{item.content}</p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2.5 text-on-surface-variant hover:text-rose-400 transition-colors bg-surface-dark border border-emerald-900/30 rounded-xl shadow-xs"
                aria-label="Delete item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


