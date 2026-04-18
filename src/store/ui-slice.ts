import type { StateCreator } from "zustand";

export type Theme = "dark" | "light";
export type SortBy = "name" | "modified" | "size" | "mediaType";
export type SortDir = "asc" | "desc";

export interface UISlice {
  theme: Theme;
  gridSize: number;
  viewerOpen: boolean;
  sidebarOpen: boolean;
  sortBy: SortBy;
  sortDir: SortDir;
  toggleTheme: () => void;
  setGridSize: (size: number) => void;
  openViewer: () => void;
  closeViewer: () => void;
  toggleSidebar: () => void;
  setSort: (by: SortBy, dir: SortDir) => void;
}

export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  theme: "dark",
  gridSize: 200,
  viewerOpen: false,
  sidebarOpen: true,
  sortBy: "name",
  sortDir: "asc",

  toggleTheme: () =>
    set({ theme: get().theme === "dark" ? "light" : "dark" }),

  setGridSize: (gridSize) => set({ gridSize }),

  openViewer: () => set({ viewerOpen: true }),

  closeViewer: () => set({ viewerOpen: false }),

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

  setSort: (sortBy, sortDir) => set({ sortBy, sortDir }),
});
