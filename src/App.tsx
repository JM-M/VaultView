import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toolbar } from "@/components/layout/Toolbar";
import { Dashboard } from "@/components/layout/Dashboard";
import { MediaGrid } from "@/components/media/MediaGrid";
import { ViewerModal } from "@/components/viewer/ViewerModal";
import { Settings } from "@/components/settings/Settings";

export default function App() {
  const loadFolders = useStore((s) => s.loadFolders);
  const activeFolderId = useStore((s) => s.activeFolderId);
  const addFolder = useStore((s) => s.addFolder);
  const setActiveFolder = useStore((s) => s.setActiveFolder);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const handleAddFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      const folder = await addFolder(handle);
      setActiveFolder(folder.id);
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--color-bg)]">
      <Toolbar onOpenSettings={() => setSettingsOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {activeFolderId ? <MediaGrid /> : <Dashboard onAddFolder={handleAddFolder} />}
      </div>
      <ViewerModal />
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
