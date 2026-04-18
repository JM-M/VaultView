import type { StateCreator } from "zustand";
import type { FolderRecord } from "@/db";
import { db } from "@/db";
import { generateId } from "@/lib/utils";

export interface FoldersSlice {
  folders: FolderRecord[];
  activeFolderId: string | null;
  loadFolders: () => Promise<void>;
  addFolder: (handle: FileSystemDirectoryHandle) => Promise<FolderRecord>;
  removeFolder: (id: string) => Promise<void>;
  setActiveFolder: (id: string | null) => void;
  updateFolderScanTime: (id: string) => Promise<void>;
}

export const createFoldersSlice: StateCreator<FoldersSlice> = (set, get) => ({
  folders: [],
  activeFolderId: null,

  loadFolders: async () => {
    const folders = await db.folders.toArray();
    set({ folders });
  },

  addFolder: async (handle) => {
    const now = Date.now();
    const folder: FolderRecord = {
      id: generateId(),
      name: handle.name,
      handle,
      createdAt: now,
      lastScanAt: 0,
    };
    await db.folders.put(folder);
    set({ folders: [...get().folders, folder] });
    return folder;
  },

  removeFolder: async (id) => {
    await db.folders.delete(id);
    await db.files.where("folderId").equals(id).delete();
    set({
      folders: get().folders.filter((f) => f.id !== id),
      activeFolderId:
        get().activeFolderId === id ? null : get().activeFolderId,
    });
  },

  setActiveFolder: (id) => set({ activeFolderId: id }),

  updateFolderScanTime: async (id) => {
    const now = Date.now();
    await db.folders.update(id, { lastScanAt: now });
    set({
      folders: get().folders.map((f) =>
        f.id === id ? { ...f, lastScanAt: now } : f,
      ),
    });
  },
});
