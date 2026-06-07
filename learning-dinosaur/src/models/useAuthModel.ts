import { useState, useCallback, useEffect } from 'react';
import { User } from '../services/typing';
import { getCurrentUser, login, register, logout, getMe, loginWithGoogle, updateProfile } from '../services';

export default function useAuthModel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const localUser = getCurrentUser();
    if (localUser) {
      setUser(localUser);
    }
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await getMe();
      setUser(freshUser);
      return freshUser;
    } catch (error) {
      setUser(null);
      logout();
      throw error;
    }
  }, []);

  const loginUser = useCallback(async (payload: { email: string; password?: string }) => {
    const loggedInUser = await login(payload);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const loginGoogleUser = useCallback(async (idToken: string) => {
    const loggedInUser = await loginWithGoogle(idToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const registerUser = useCallback(async (payload: { email: string; password?: string; displayName: string }) => {
    const registeredUser = await register(payload);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logoutUser = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  const updateUserProfile = useCallback(async (payload: { displayName?: string; email?: string; avatarIndex?: number; avatarUrl?: string | null }) => {
    const updated = await updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  return {
    user,
    setUser,
    loading,
    refreshUser,
    loginUser,
    loginGoogleUser,
    registerUser,
    logoutUser,
    updateUserProfile,
  };
}
