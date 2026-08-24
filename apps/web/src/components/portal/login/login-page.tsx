import { LoginForm } from './login-form';
import { LoginHero } from './login-hero';

export function LoginPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="mx-auto grid min-h-screen max-w-[1200px] lg:grid-cols-[1.1fr_0.9fr]">
        <LoginHero />
        <LoginForm />
      </div>
    </div>
  );
}
