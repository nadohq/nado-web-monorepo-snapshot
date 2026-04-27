/**
 * Creates a composite row ID by joining multiple parts with hyphens.
 * Automatically converts all arguments to strings.
 *
 * @example
 * createRowId(event.submissionIndex, productId) // '12345-67'
 * createRowId(id, name ?? 'default') // '1-default'
 *
 * @param parts - The parts to join into a row ID
 * @returns A hyphen-delimited string
 */
export function createRowId(
  ...parts: Array<string | number | boolean>
): string {
  return parts.map(String).join('-');
}
