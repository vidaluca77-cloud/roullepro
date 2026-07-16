'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ViewCounter({ threadId }: { threadId: string }) {
  useEffect(() => {
    const key = `forum_viewed_${threadId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    const supabase = createClient();
    supabase.rpc('increment_forum_thread_views', { p_thread_id: threadId });
  }, [threadId]);

  return null;
}
