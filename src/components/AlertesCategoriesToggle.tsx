'use client';
import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';

interface AlertesCategoriesToggleProps {
  categories: { id: string; name: string; slug: string }[];
}

export default function AlertesCategoriesToggle({ categories }: AlertesCategoriesToggleProps) {
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetch('/api/alertes')
      .then(r => r.json())
      .then(data => {
        setSubscribed(new Set(data.alertes || []));
        setInitialized(true);
      })
      .catch(() => setInitialized(true));
  }, []);

  const toggle = async (categoryId: string) => {
    if (loading.has(categoryId)) return;
    setLoading(prev => new Set(prev).add(categoryId));
    const isSub = subscribed.has(categoryId);
    try {
      if (isSub) {
        await fetch(`/api/alertes?category_id=${categoryId}`, { method: 'DELETE' });
        setSubscribed(prev => { const s = new Set(prev); s.delete(categoryId); return s; });
      } else {
        await fetch('/api/alertes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category_id: categoryId }),
        });
        setSubscribed(prev => new Set(prev).add(categoryId));
      }
    } catch {}
    setLoading(prev => { const s = new Set(prev); s.delete(categoryId); return s; });
  };

  if (!initialized) return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <Loader2 size={14} className="animate-spin" /> Chargement...
    </div>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(cat => {
        const isSub = subscribed.has(cat.id);
        const isLoading = loading.has(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => toggle(cat.id)}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              isSub
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : isSub ? (
              <Bell size={12} className="fill-white" />
            ) : (
              <BellOff size={12} />
            )}
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
