import { LoginForm } from './login-form';
import { LoginHero } from './login-hero';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] px-4 py-6 text-[color:var(--color-text)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <LoginHero />
        <LoginForm />
      </div>
    </div>
  );
}
