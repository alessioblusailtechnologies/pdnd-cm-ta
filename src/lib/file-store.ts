import { randomUUID } from 'node:crypto';

export type StoredFileKind = 'pdf' | 'word' | 'excel';

export interface StoredFile {
  id: string;
  kind: StoredFileKind;
  filename: string;
  contentType: string;
  buffer: Buffer;
  createdAt: number;
}

const TTL_MS = 1000 * 60 * 60 * 24;

declare global {
  // eslint-disable-next-line no-var
  var __pdmdFileStore: Map<string, StoredFile> | undefined;
}

const store: Map<string, StoredFile> =
  globalThis.__pdmdFileStore ?? (globalThis.__pdmdFileStore = new Map());

function cleanup() {
  const now = Date.now();
  for (const [id, file] of store.entries()) {
    if (now - file.createdAt > TTL_MS) store.delete(id);
  }
}

export function storeFile(input: Omit<StoredFile, 'id' | 'createdAt'>): StoredFile {
  cleanup();
  const id = randomUUID();
  const file: StoredFile = { ...input, id, createdAt: Date.now() };
  store.set(id, file);
  return file;
}

export function getFile(id: string): StoredFile | null {
  cleanup();
  return store.get(id) ?? null;
}
