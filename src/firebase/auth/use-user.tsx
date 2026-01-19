'use client';

import { useFirebase, type UserWithClaims } from '@/firebase/provider';

export interface UserHookResult {
  user: UserWithClaims | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * Hook specifically for accessing the authenticated user's state, including custom claims.
 * This provides the User object with claims, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
