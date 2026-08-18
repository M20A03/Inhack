import React, { useEffect, useState } from 'react';
import { Trash2, ArchiveX } from 'lucide-react';
import { getSavedItems, deleteItem, clearAllItems } from '../utils/storage';

interface SavedItemsProps {
  refreshTrigger: number;
}

export function SavedItems({ refreshTrigger }: SavedItemsProps) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadItems();
  }, [refreshTrigger]);

  const loadItems = async () => {
    const data = await getSavedItems();
    setItems(data.reverse()); // latest first
  };

  const handleDelete = async (id: number) => {
    await deleteItem(id);
    loadItems();
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all saved items?')) {
      await clearAllItems();
      loadItems();
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-8 cognitive-hide">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Saved Items</h2>
        <button onClick={handleClearAll} className="text-red-400 p-2 hover:bg-red-400/20 rounded-lg">
          <ArchiveX size={20} />
        </button>
      </div>
      
      <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
        {items.map(item => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-start gap-4">
            <div className="flex-1">
              <span className="text-xs text-accent uppercase font-bold tracking-wider mb-1 block">
                {item.type} • {new Date(item.timestamp).toLocaleDateString()}
              </span>
              <p className="text-sm text-gray-200 line-clamp-2">{item.text}</p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-2 text-gray-400 hover:text-red-400"
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
