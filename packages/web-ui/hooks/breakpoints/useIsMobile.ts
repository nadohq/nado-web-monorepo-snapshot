import { useSizeClass } from './useSizeClass';

export function useIsMobile() {
  return useSizeClass().isMobile;
}
