import Dexie, { type EntityTable } from "dexie";
import type { FolderRecord, FileRecord } from "./models";

class VaultViewDB extends Dexie {
  folders!: EntityTable<FolderRecord, "id">;
  files!: EntityTable<FileRecord, "id">;

  constructor() {
    super("vaultview");
    this.version(1).stores({
      folders: "id, name",
      files: "id, folderId, path, mediaType, modified, thumbKey",
    });
  }
}

export const db = new VaultViewDB();
