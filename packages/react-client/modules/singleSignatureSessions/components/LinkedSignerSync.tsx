import { useLinkedSignerSync } from '../hooks/useLinkedSignerSync';

// useLinkedSignerSync requires access to SubaccountContext, creating a component helps facilitate that
export function LinkedSignerSync() {
  useLinkedSignerSync();
  return null;
}
