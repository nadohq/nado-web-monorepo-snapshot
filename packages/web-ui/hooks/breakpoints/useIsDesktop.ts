'use client';

import { useSizeClass } from './useSizeClass';

export function useIsDesktop() {
  return useSizeClass().isDesktop;
}
