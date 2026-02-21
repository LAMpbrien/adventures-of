const isDev = process.env.NODE_ENV === "development";

const ERROR_PATTERNS: [RegExp, string][] = [
  [/row-level security/i, "Your session may have expired. Please log in again."],
  [/JWT expired/i, "Your session has expired. Please log in again."],
  [/invalid.*token/i, "Your session is invalid. Please log in again."],
  [/duplicate key/i, "This record already exists."],
  [/relation.*does not exist/i, "Database setup issue. Please contact support."],
  [/violates foreign key/i, "A referenced record no longer exists."],
  [/violates check constraint/i, "Invalid data provided. Please check your input."],
  [/permission denied/i, "You don't have permission to perform this action."],
  [/network/i, "Network error. Please check your connection and try again."],
  [/fetch failed/i, "Could not connect to the server. Please try again."],
];

export function getUserMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  // In development, always show the raw error message for debugging
  if (isDev) {
    return message || "Something went wrong (no error message).";
  }

  for (const [pattern, userMessage] of ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return userMessage;
    }
  }

  if (message) {
    return message;
  }

  return "Something went wrong. Please try again.";
}
