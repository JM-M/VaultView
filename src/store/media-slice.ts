import type { StateCreator } from "zustand";
import type { FileRecord, MediaType } from "@/db";

export interface MediaFilters {
  mediaType: MediaType | null;
  searchQuery: string;
  searchResultIds: Set<string> | null;
}

export interface MediaSlice {
  files: FileRecord[];
  selectedFile: FileRecord | null;
  selectedIndex: number;
  filters: MediaFilters;
  setFiles: (files: FileRecord[]) => void;
  addFiles: (files: FileRecord[]) => void;
  updateFile: (id: string, updates: Partial<FileRecord>) => void;
  removeFilesForFolder: (folderId: string) => void;
  setSelectedFile: (file: FileRecord | null, index?: number) => void;
  setMediaTypeFilter: (mediaType: MediaType | null) => void;
  setSearchFilter: (query: string, resultIds: Set<string> | null) => void;
  clearFilters: () => void;
}

const defaultFilters: MediaFilters = {
  mediaType: null,
  searchQuery: "",
  searchResultIds: null,
};

export const createMediaSlice: StateCreator<MediaSlice> = (set, get) => ({
  files: [],
  selectedFile: null,
  selectedIndex: -1,
  filters: { ...defaultFilters },

  setFiles: (files) => set({ files }),

  addFiles: (files) =>
    set({ files: [...get().files, ...files] }),

  updateFile: (id, updates) =>
    set({
      files: get().files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }),

  removeFilesForFolder: (folderId) =>
    set({ files: get().files.filter((f) => f.folderId !== folderId) }),

  setSelectedFile: (file, index = -1) =>
    set({ selectedFile: file, selectedIndex: index }),

  setMediaTypeFilter: (mediaType) =>
    set({ filters: { ...get().filters, mediaType } }),

  setSearchFilter: (query, resultIds) =>
    set({
      filters: { ...get().filters, searchQuery: query, searchResultIds: resultIds },
    }),

  clearFilters: () => set({ filters: { ...defaultFilters } }),
});
