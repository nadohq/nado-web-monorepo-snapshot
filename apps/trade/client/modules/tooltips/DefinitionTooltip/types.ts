import type { TFunction } from 'i18next';
import { ReactNode } from 'react';

export interface DefinitionTooltipContent {
  title: ReactNode;
  content: ReactNode;
}

export type DefinitionTooltipConfig =
  | DefinitionTooltipContent
  | ((t: TFunction) => DefinitionTooltipContent);
