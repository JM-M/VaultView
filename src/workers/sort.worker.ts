interface SortRequest {
  id: string;
  files: Array<Record<string, unknown>>;
  sortBy: string;
  direction: "asc" | "desc";
}

self.onmessage = (e: MessageEvent<SortRequest>) => {
  const { id, files, sortBy, direction } = e.data;

  const sorted = [...files].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    let cmp = 0;
    if (typeof aVal === "string" && typeof bVal === "string") {
      cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
    } else if (typeof aVal === "number" && typeof bVal === "number") {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
    }

    return direction === "asc" ? cmp : -cmp;
  });

  self.postMessage({ id, sorted });
};
