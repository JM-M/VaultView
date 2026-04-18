import { Button } from "@/components/ui/Button";

interface DashboardProps {
  onAddFolder: () => void;
}

export function Dashboard({ onAddFolder }: DashboardProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-white">
          Welcome to VaultView
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Choose a folder to start browsing your media
        </p>
      </div>
      <Button variant="primary" onClick={onAddFolder} className="px-6 py-2.5 text-base">
        Choose Folder
      </Button>
    </div>
  );
}
