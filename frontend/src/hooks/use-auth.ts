import * as React from 'react';

import type { AuthContextValue } from '@/contexts/auth-context';
import { AuthContext } from '@/contexts/auth-context';

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('auth must be used within a AuthProvider');
  }

  return context;
}
