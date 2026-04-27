import {
  EngineServerFailureError,
  TriggerServerFailureError,
} from '@nadohq/client'; // Takes an error and returns some debuggable-ish text
import { PlaceOrderExecuteResultError } from 'client/utils/errors/placeOrderExecuteResultError';
import type { TFunction } from 'i18next';
import safeStringify from 'safe-stable-stringify';

/**
 * Structured error information for display in UI components
 *
 * This interface represents parsed error data that has been processed from various error types
 * (server errors, client errors, etc.) into a consistent format suitable for display.
 *
 * @property {string} errorMessage - The main error message to display to the user
 * @property {string} [detailedErrorMessage] - Optional detailed error information for expanded error views
 */
export interface ParsedExecuteError {
  errorMessage: string;
  detailedErrorMessage?: string;
}

/**
 * Checks if an error message is readable and suitable for displaying in the regular action toast body
 * @param message The error message to validate
 * @returns {boolean} true if the message is 60 characters or less and no single word exceeds 30 characters
 */
function isMessageReadable(message: string): boolean {
  const MAX_MESSAGE_LENGTH = 60;
  const MAX_WORD_LENGTH = 30;
  if (message.length > MAX_MESSAGE_LENGTH) return false;

  const words = message.split(/\s+/);
  return !words.some((word) => word.length > MAX_WORD_LENGTH);
}

/**
 * Parses an error and returns structured error information for debugging
 * @param t The t function
 * @param err The error to parse
 * @returns {ParsedExecuteError} parsed object containing errorMessage and optional detailedErrorMessage
 */
export function parseExecuteError(t: TFunction, err?: any): ParsedExecuteError {
  // Handle place order errors
  if (err instanceof PlaceOrderExecuteResultError) {
    const numberOfErrorMessages = err.getNumberOfErrorMessages();

    if (numberOfErrorMessages > 1) {
      return {
        errorMessage: t(($) => $.errors.orderFailed, {
          count: numberOfErrorMessages,
        }),
        detailedErrorMessage: err.message,
      };
    }
    return {
      errorMessage: err.message,
    };
  }

  // Handle backend errors
  if (
    err instanceof EngineServerFailureError ||
    err instanceof TriggerServerFailureError
  ) {
    return {
      errorMessage: err.responseData.error,
    };
  }
  // Handle errors with standard message properties
  if (err && !!err.shortMessage && typeof err.shortMessage === 'string') {
    // shortMessage is a property of Viem errors occurring with both desktop and mobile wallets
    // https://v1.viem.sh/docs/glossary/errors.html
    return {
      errorMessage: err.shortMessage,
    };
  } else if (err && !!err.message && typeof err.message === 'string') {
    // Message fits in toast body, use directly
    if (isMessageReadable(err.message)) {
      return {
        errorMessage: err.message,
      };
    }
    // Message too long/complex, use generic error with and pass detailed message
    return {
      errorMessage: t(($) => $.errors.generic),
      detailedErrorMessage: err.message,
    };
  }

  // Fallback to return generic error and the entire error
  try {
    // Stringify error for debugging
    return {
      errorMessage: t(($) => $.errors.unknown),
      detailedErrorMessage: safeStringify(err),
    };
  } catch (e) {
    // Stringify failed, use string coercion
    return {
      errorMessage: t(($) => $.errors.unknown),
      detailedErrorMessage: `${e}`,
    };
  }
}
