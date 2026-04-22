export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "");
    if (message) {
      return message;
    }
  }

  return fallback;
}

export function hasErrorCode(error: unknown, code: string) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return String((error as { code?: unknown }).code ?? "") === code;
}
