import { useEffect, useState } from 'react';
import { Trash2, ArchiveX, Database } from 'lucide-react';
import { getAllItems, deleteItem, clearAllItems } from '../utils/storage';

interface SavedItemsProps {
  refreshTrigger: number;
}

export function SavedItems({ refreshTrigger }: SavedItemsProps) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadItems();
  }, [refreshTrigger]);

  const loadItems = async () => {
    const data = await getAllItems();
    setItems(data.reverse()); // latest first
  };

  const handleDelete = async (id: number) => {
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
    <div className="mt-8 glass-panel p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
           <Database className="text-accent" size={24} />
           Offline History
        </h2>
        <button onClick={handleClearAll} className="text-red-400 p-2 hover:bg-red-900/30 rounded-lg transition-colors" aria-label="Clear all history">
          <ArchiveX size={20} />
        </button>
      </div>
      
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-2">
        {items.map(item => (
          <div key={item.id} className="bg-black/50 p-4 rounded-xl flex justify-between items-start gap-4 border border-gray-800">
            <div className="flex-1">
              <span className="text-xs text-accent uppercase font-bold tracking-wider mb-1 block">
                {item.type.replace('_', ' ')} • {new Date(item.timestamp).toLocaleTimeString()}
              </span>
              <p className="text-sm text-gray-300 line-clamp-3">{item.text}</p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-3 text-gray-500 hover:text-red-400 transition-colors bg-gray-900 rounded-lg"
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
