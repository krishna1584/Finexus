interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: string;
}

export function Skeleton({ className = '', height = 'h-4', width = 'w-full', rounded = 'rounded-lg' }: SkeletonProps) {
  return <div className={`skeleton ${height} ${width} ${rounded} ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton height="h-3" width="w-24" />
          <Skeleton height="h-6" width="w-36" />
        </div>
        <Skeleton height="h-10" width="w-10" rounded="rounded-xl" />
      </div>
      <Skeleton height="h-3" width="w-28" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]"
        >
          <Skeleton height="h-9" width="w-9" rounded="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton height="h-3" width="w-32" />
            <Skeleton height="h-3" width="w-20" />
          </div>
          <Skeleton height="h-4" width="w-20" />
          <Skeleton height="h-6" width="w-16" rounded="rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height="h-3" width={i === lines - 1 ? 'w-2/3' : 'w-full'} />
      ))}
    </div>
  );
}
