import { expect } from '@playwright/test';

/**
 * Utility type for defining expected data in assertions.
 * Allows fields to be either the exact type or an 'expect.any()' placeholder.
 */
export type Expected<T> = {
  [K in keyof T]?: T[K] | ReturnType<typeof expect.any>;
};

export enum MarginMode {
  Cross = 'Cross',
  Isolated = 'Isolated',
}

export interface ToastData {
  title: string;
  description?: string;
}
