import { MONO } from "@/lib/constants";
import { cn } from "@/lib/utils";

import {
  useRef,
  type KeyboardEvent,
} from 'react';

export function OtpInput({
  value,
  onChange,
  disabled,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  hasError: boolean;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits    = value.padEnd(6, '').split('').slice(0, 6);

  const update = (index: number, char: string) => {
    const sanitised = char.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, i) => (i === index ? sanitised : d)).join('');
    onChange(next.replace(/\s/g, ''));
    if (sanitised && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const nextFocus = Math.min(pasted.length, 5);
    setTimeout(() => inputsRef.current[nextFocus]?.focus(), 0);
  };

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ''}
          onChange={(e) => update(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={cn(
            'h-14 w-full border text-center text-[22px] font-bold outline-none transition',
            'bg-[color:var(--color-surface-2)] disabled:opacity-50',
            hasError
              ? 'border-[color:var(--color-status-expired)]'
              : digits[i]
              ? 'border-[color:var(--color-border-strong)]'
              : 'border-[color:var(--color-border)] focus:border-[color:var(--color-accent)]',
          )}
          style={{ ...MONO, color: 'var(--color-text-strong)' }}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}