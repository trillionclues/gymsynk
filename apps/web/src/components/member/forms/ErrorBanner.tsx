import { MONO } from "@/lib/constants";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-2 border px-4 py-3 text-[12px]"
      style={{
        ...MONO,
        color:       'var(--color-status-expired)',
        borderColor: 'var(--color-plate-rust-border)',
        background:  'var(--color-status-expired-bg)',
      }}
    >
      <span
        className="h-[6px] w-[6px] shrink-0"
        style={{ background: 'var(--color-status-expired)' }}
      />
      {message}
    </div>
  );
}