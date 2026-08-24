import { MONO } from "@/lib/constants";
import { ArrowRight, LoaderCircle } from "lucide-react";

export function PrimaryBtn({
  loading,
  disabled,
  loadingLabel,
  label,
}: {
  loading: boolean;
  disabled?: boolean;
  loadingLabel: string;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="inline-flex w-full items-center justify-center gap-2 border py-[15px] text-[12px] uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        ...MONO,
        background:  'var(--color-primary)',
        borderColor: 'var(--color-primary)',
        color:       'var(--color-text-on-primary)',
      }}
    >
      {loading ? (
        <><LoaderCircle className="h-4 w-4 animate-spin" /> {loadingLabel}</>
      ) : (
        <><ArrowRight className="h-4 w-4" /> {label}</>
      )}
    </button>
  );
}