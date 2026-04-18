import { Button } from "./Button";

interface PermissionBannerProps {
  folderName: string;
  onRegrant: () => void;
}

export function PermissionBanner({ folderName, onRegrant }: PermissionBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="flex-shrink-0 text-yellow-400"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span className="flex-1 text-sm text-yellow-200">
        Permission lost for <strong>{folderName}</strong>
      </span>
      <Button variant="primary" onClick={onRegrant}>
        Re-grant Access
      </Button>
    </div>
  );
}
