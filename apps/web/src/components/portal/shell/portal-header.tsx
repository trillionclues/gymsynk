import { LogOut } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { logoutStaff } from '@/services/auth-service';
import { useAuthStore } from '@/stores/authStore';

export function PortalHeader() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await logoutStaff();
    } catch {
      // ignore network errors on logout
    }

    clearSession();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-20 rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-nav-bg-scrolled)] px-4 py-4 shadow-[0_18px_50px_var(--color-shadow)] backdrop-blur-sm sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-[color:var(--color-text-subtle)]">
            {user?.email ?? 'Signed in staff'}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-[color:var(--color-text-strong)] sm:text-2xl">
            GymSynk
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="hidden items-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-strong)] transition hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-2)] sm:inline-flex"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
