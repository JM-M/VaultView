import { create } from "zustand";
import { createFoldersSlice, type FoldersSlice } from "./folders-slice";
import { createMediaSlice, type MediaSlice } from "./media-slice";
import { createScanSlice, type ScanSlice } from "./scan-slice";
import { createUISlice, type UISlice } from "./ui-slice";

export type StoreState = FoldersSlice & MediaSlice & ScanSlice & UISlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createFoldersSlice(...a),
  ...createMediaSlice(...a),
  ...createScanSlice(...a),
  ...createUISlice(...a),
}));
