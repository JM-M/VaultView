interface ProgressBarProps {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface)]">
      <div
        className="h-full rounded-full bg-blue-500 transition-all duration-200"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
