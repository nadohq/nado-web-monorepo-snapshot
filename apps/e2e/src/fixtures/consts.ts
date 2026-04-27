import * as path from 'path';

/** Absolute path to the storage state file used for authenticated sessions */
export const STORAGE_STATE_PATH = path.join(
  __dirname,
  '.auth/storage-state.json',
);
