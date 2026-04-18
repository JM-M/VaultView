import type { StateCreator } from "zustand";

export interface ScanProgress {
  total: number;
  processed: number;
  currentDir: string;
}

export interface ScanSlice {
  isScanning: boolean;
  progress: ScanProgress;
  startScan: () => void;
  updateProgress: (progress: Partial<ScanProgress>) => void;
  endScan: () => void;
}

export const createScanSlice: StateCreator<ScanSlice> = (set, get) => ({
  isScanning: false,
  progress: { total: 0, processed: 0, currentDir: "" },

  startScan: () =>
    set({
      isScanning: true,
      progress: { total: 0, processed: 0, currentDir: "" },
    }),

  updateProgress: (partial) =>
    set({ progress: { ...get().progress, ...partial } }),

  endScan: () => set({ isScanning: false }),
});
