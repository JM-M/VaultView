/**
 * Search worker with in-memory inverted index.
 * Maintains a Map<token, Set<fileId>> for prefix-match queries.
 */

const index = new Map<string, Set<string>>();
const fileTokens = new Map<string, string[]>();

function tokenize(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
}

function indexFile(id: string, name: string) {
  const tokens = tokenize(name);
  fileTokens.set(id, tokens);
  for (const token of tokens) {
    let set = index.get(token);
    if (!set) {
      set = new Set();
      index.set(token, set);
    }
    set.add(id);
  }
}

function removeFile(id: string) {
  const tokens = fileTokens.get(id);
  if (!tokens) return;
  for (const token of tokens) {
    const set = index.get(token);
    if (set) {
      set.delete(id);
      if (set.size === 0) index.delete(token);
    }
  }
  fileTokens.delete(id);
}

function search(query: string): string[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  let resultSet: Set<string> | null = null;

  for (const qt of queryTokens) {
    // Prefix match: find all index keys that start with this token
    const matches = new Set<string>();
    for (const [token, ids] of index) {
      if (token.startsWith(qt)) {
        for (const id of ids) matches.add(id);
      }
    }

    if (resultSet === null) {
      resultSet = matches;
    } else {
      // Intersect
      for (const id of resultSet) {
        if (!matches.has(id)) resultSet.delete(id);
      }
    }

    if (resultSet.size === 0) return [];
  }

  return resultSet ? Array.from(resultSet) : [];
}

self.onmessage = (e: MessageEvent) => {
  const { type, id } = e.data;

  switch (type) {
    case "index": {
      const files: Array<{ id: string; name: string }> = e.data.files;
      for (const f of files) indexFile(f.id, f.name);
      self.postMessage({ id, type: "indexed" });
      break;
    }
    case "search": {
      const results = search(e.data.query);
      self.postMessage({ id, type: "results", results });
      break;
    }
    case "remove": {
      const fileIds: string[] = e.data.fileIds;
      for (const fid of fileIds) removeFile(fid);
      self.postMessage({ id, type: "removed" });
      break;
    }
    case "clear": {
      index.clear();
      fileTokens.clear();
      self.postMessage({ id, type: "cleared" });
      break;
    }
  }
};
