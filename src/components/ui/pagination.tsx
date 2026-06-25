'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  /** 1-indexed current page. */
  value: number;
  onChange: (page: number) => void;
  /** Total number of pages. */
  total: number;
  /** Pages shown on each side of the current page. Default 1. */
  siblings?: number;
  /** Pages always shown at start and end. Default 1. */
  boundaries?: number;
  className?: string;
  disabled?: boolean;
}

type PageItem = number | 'ellipsis-left' | 'ellipsis-right';

/**
 * shadcn-style Pagination — same API surface as Mantine's `<Pagination>` so
 * swapping in/out is a one-line import change. Uses Lucide icons, Tailwind
 * tokens, and the shared `cn` helper.
 *
 *   <Pagination value={page} onChange={setPage} total={20} siblings={1} boundaries={1} />
 */
export function Pagination({
  value,
  onChange,
  total,
  siblings = 1,
  boundaries = 1,
  className,
  disabled,
}: PaginationProps) {
  if (total <= 1) return null;

  const items = buildPageItems({ current: value, total, siblings, boundaries });
  const canPrev = value > 1 && !disabled;
  const canNext = value < total && !disabled;

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
    >
      <ul className="flex flex-row items-center gap-1">
        <li>
          <PaginationButton
            aria-label="Go to previous page"
            disabled={!canPrev}
            onClick={() => canPrev && onChange(value - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </PaginationButton>
        </li>

        {items.map((item, idx) => (
          <li key={`${item}-${idx}`}>
            {item === 'ellipsis-left' || item === 'ellipsis-right' ? (
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <PaginationButton
                isActive={item === value}
                aria-label={`Go to page ${item}`}
                aria-current={item === value ? 'page' : undefined}
                disabled={disabled}
                onClick={() => onChange(item)}
              >
                {item}
              </PaginationButton>
            )}
          </li>
        ))}

        <li>
          <PaginationButton
            aria-label="Go to next page"
            disabled={!canNext}
            onClick={() => canNext && onChange(value + 1)}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </PaginationButton>
        </li>
      </ul>
    </nav>
  );
}

interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

function PaginationButton({ className, isActive, children, ...props }: PaginationButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        isActive
          ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Builds the visible page-number sequence with ellipses. Algorithm:
 *   - Always show `boundaries` pages at start + end
 *   - Always show `current ± siblings` pages
 *   - Fill gaps with at most one ellipsis on each side
 */
function buildPageItems({
  current,
  total,
  siblings,
  boundaries,
}: {
  current: number;
  total: number;
  siblings: number;
  boundaries: number;
}): PageItem[] {
  const totalNumbersShown = siblings * 2 + boundaries * 2 + 3;
  if (total <= totalNumbersShown) {
    return range(1, total);
  }

  const leftSiblingStart = Math.max(current - siblings, boundaries + 2);
  const rightSiblingEnd = Math.min(current + siblings, total - boundaries - 1);

  const showLeftEllipsis = leftSiblingStart > boundaries + 2;
  const showRightEllipsis = rightSiblingEnd < total - boundaries - 1;

  const items: PageItem[] = [];

  items.push(...range(1, boundaries));

  if (showLeftEllipsis) {
    items.push('ellipsis-left');
  } else if (boundaries + 1 < leftSiblingStart) {
    items.push(boundaries + 1);
  }

  items.push(...range(leftSiblingStart, rightSiblingEnd));

  if (showRightEllipsis) {
    items.push('ellipsis-right');
  } else if (rightSiblingEnd + 1 < total - boundaries + 1) {
    items.push(rightSiblingEnd + 1);
  }

  items.push(...range(total - boundaries + 1, total));

  return items;
}

function range(start: number, end: number): number[] {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
