'use client';

import * as React from 'react';

import { authClient } from '@/lib/AuthClient';
import { logger } from '@/lib/DefaultLogger';
import type { Auth } from '@/types/auth';

export interface AuthContextValue {
  auth: Auth | null;
  error: string | null;
  isLoading: boolean;
  checkSession?: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{ auth: Auth | null; error: string | null; isLoading: boolean }>({
    auth: null,
    error: null,
    isLoading: true,
  });

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await authClient.getAuth();

      if (error) {
        logger.error(error);
        setState((prev) => ({ ...prev, auth: null, error: 'Something went wrong', isLoading: false }));
        return;
      }

      setState((prev) => ({ ...prev, auth: data ?? null, error: null, isLoading: false }));
    } catch (err) {
      logger.error(err);
      setState((prev) => ({ ...prev, token: null, error: 'Something went wrong', isLoading: false }));
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err: unknown) => {
      logger.error(err);
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, []);

  return <AuthContext.Provider value={{ ...state, checkSession }}>{children}</AuthContext.Provider>;
}

export const UserConsumer = AuthContext.Consumer;
