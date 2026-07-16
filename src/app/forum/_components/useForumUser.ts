'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ForumUserState {
  loading: boolean;
  userId: string | null;
  isVerified: boolean;
}

export function useForumUser(): ForumUserState {
  const [state, setState] = useState<ForumUserState>({
    loading: true,
    userId: null,
    isVerified: false,
  });

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) setState({ loading: false, userId: null, isVerified: false });
        return;
      }
      const { data } = await supabase
        .from('sanitaire_claims')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'verified')
        .limit(1);
      if (active) {
        setState({
          loading: false,
          userId: user.id,
          isVerified: (data?.length || 0) > 0,
        });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
