import { create } from 'zustand';

/**
 * Global authentication state.
 * - user: null | { userId, name, email, role }
 * - setUser(user): store logged-in user
 * - clearUser(): remove user on logout
 */
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useAuthStore;
