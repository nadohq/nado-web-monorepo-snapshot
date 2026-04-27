import { Context, use } from 'react';

/**
 * Safely uses a React Context with automatic error handling.
 *
 * @template TContextValue - The type of the context value
 * @param context - The React Context to consume
 * @returns The context value (with null excluded)
 * @throws {Error} If the context is undefined (i.e., used outside its Provider)
 */
export function useRequiredContext<TContextValue>(
  context: Context<TContextValue>,
): NonNullable<TContextValue> {
  const contextValue = use(context);

  // If context value is null/undefined, it means the context is not being used within its corresponding Provider. So throw an error.
  if (contextValue == null) {
    throw new Error(
      `useRequiredContext must be used within its corresponding Context Provider`,
    );
  }

  return contextValue as NonNullable<TContextValue>;
}
