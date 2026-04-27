export interface CustomizableTableConfig<TColumnId extends string> {
  defaultColumnOrder: readonly TColumnId[];
}
