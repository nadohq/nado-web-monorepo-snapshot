import { perpConfig } from 'client/modules/tables/customizableTables/tableConfigs/perpPositions';
import { CustomizableTableConfig } from 'client/modules/tables/customizableTables/types';

export const CUSTOMIZABLE_TABLE_TYPES = ['perpPositions'] as const;

export type CustomizableTableType = (typeof CUSTOMIZABLE_TABLE_TYPES)[number];

export const CUSTOMIZABLE_TABLE_CONFIG_BY_TYPE = {
  perpPositions: perpConfig,
} as const satisfies Record<
  CustomizableTableType,
  CustomizableTableConfig<string>
>;
