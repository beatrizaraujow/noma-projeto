// Type definitions for integration services

// Helper to check if error is an Error instance
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Helper to get error message safely
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

export {};
