import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'ADMIN' | 'CASHIER' | 'MEMBER';

interface SessionUser {
    id: string;
    email: string | null;
    role: UserRole;
    orgId: string;
}

interface AuthStore {
    accessToken: string | null;
    user: SessionUser | null;
    setSession: (token: string, user: SessionUser) => void;
    setAccessToken: (token: string) => void;
    clearSession: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist((set) => ({
        accessToken: null,
        user: null,
        setSession: (accessToken, user) => set({ accessToken, user }),
        setAccessToken: (accessToken) => set({ accessToken }),
        clearSession: () => set({ accessToken: null, user: null }),
    }), {
        name: 'gymsynk-auth',
        // never persist token — memory only. User metadata persists.
        partialize: (state) => ({user: state.user}),
    })
)

export type { UserRole, SessionUser };
