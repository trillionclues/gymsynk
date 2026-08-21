export default function MemberPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(202,138,4,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(24,24,27,0.08),transparent_24%)] px-4 py-6 text-[color:var(--color-text)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center rounded-[36px] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,var(--color-surface),var(--color-surface-2))] p-8 text-center shadow-[0_28px_90px_var(--color-shadow)]">
        <div className="max-w-xl space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-[color:var(--color-text-subtle)]">
            Member portal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--color-text-strong)] sm:text-5xl">
            Member PWA is coming in Phase 3.
          </h1>
          <p className="text-sm leading-7 text-[color:var(--color-text-muted)] sm:text-base">
            Staff can use the cashier portal now. The self-service member workspace will land after the cashier flows are complete.
          </p>
        </div>
      </div>
    </div>
  );
}
