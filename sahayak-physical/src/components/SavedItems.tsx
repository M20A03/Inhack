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

  if (items.length === 0) return null;

  return (
    <div className="mt-8 bg-black border border-yellow-500 p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-4 border-b border-yellow-500/20 pb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
           <Database className="text-yellow-400" size={24} />
           Offline History
        </h2>
        <button onClick={handleClearAll} className="text-red-500 p-2 hover:bg-zinc-900 rounded-lg transition-colors" aria-label="Clear all history">
          <ArchiveX size={20} />
        </button>
      </div>
      
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-2">
        {items.map(item => (
          <div key={item.id} className="bg-zinc-900/50 p-4 rounded-xl flex justify-between items-start gap-4 border border-yellow-500/20">
            <div className="flex-1">
              <span className="text-xs text-yellow-400 uppercase font-bold tracking-wider mb-1 block">
                {item.type.replace('_', ' ')} • {new Date(item.timestamp).toLocaleTimeString()}
              </span>
              <p className="text-sm text-yellow-300 font-semibold">{item.content}</p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-3 text-yellow-600 hover:text-red-500 transition-colors bg-black border border-yellow-500/20 rounded-lg"
              aria-label="Delete item"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
