'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  showHandle?: boolean;
}

const maxWidthMap = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
};

export function BottomSheet({
  open,
  onClose,
  title,
  titleIcon,
  children,
  maxWidth = 'md',
  showHandle = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchDeltaY = useRef(0);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
    if (touchDeltaY.current > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${touchDeltaY.current}px)`;
      sheetRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = () => {
    if (touchDeltaY.current > 120) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = '';
      sheetRef.current.style.transition = '';
    }
    touchDeltaY.current = 0;
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={sheetRef}
        className={cn(
          'w-full rounded-t-2xl sm:rounded-2xl border border-[color:var(--color-border)]',
          'bg-[color:var(--color-surface)] shadow-2xl flex flex-col',
          'animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300',
          maxWidthMap[maxWidth],
        )}
        style={{ maxHeight: '92dvh' }}
      >
        {showHandle && (
          <div
            className="flex justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <span className="h-1 w-10 rounded-full bg-[color:var(--color-border-strong)] opacity-60" />
          </div>
        )}

        {(title !== undefined || titleIcon !== undefined) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[color:var(--color-border)] shrink-0">
            <div className="flex items-center gap-2">
              {titleIcon}
              {title && (
                <h3 className="text-base font-extrabold text-[color:var(--color-text-strong)]">
                  {title}
                </h3>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[color:var(--color-text-subtle)] hover:bg-[color:var(--color-surface-2)] transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
