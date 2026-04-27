import { TabIdentifiable } from 'client/hooks/ui/tabs/types';
import { ReactNode } from 'react';

/**
 * Settings tab configuration interface.
 * Each tab includes an ID, label, and the content to render.
 */
export interface SettingsTab<
  TTabID extends string = string,
> extends TabIdentifiable<TTabID> {
  label: string;
  content: ReactNode;
}
