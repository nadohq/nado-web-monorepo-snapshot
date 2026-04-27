import { first } from 'lodash';

export class PlaceOrderExecuteResultError extends Error {
  private readonly errorMessages: string[];

  constructor(errors: string[], options?: ErrorOptions) {
    // Because the error messages could be duplicates to avoid clutter, we use the first one as the main error message.
    // Fallback to 'Unknown error' if the first error message is not provided.
    super(first(errors) ?? 'Unknown error', options);
    this.name = 'PlaceOrderExecuteResultError';
    this.errorMessages = errors;
  }

  public getNumberOfErrorMessages() {
    return this.errorMessages.length;
  }
}
