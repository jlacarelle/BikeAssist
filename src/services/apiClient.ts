export class ApiError extends Error {}

const NETWORK_ERROR_MESSAGE =
  "Impossible de joindre le serveur. Vérifiez votre connexion, puis rechargez la page si votre session a expiré.";
const UNEXPECTED_ERROR_MESSAGE = "Une erreur inattendue est survenue.";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const hasBody = options.body !== undefined;
  let response: Response;
  try {
    response = await fetch(`/api/${path}`, {
      method: options.method ?? "GET",
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      credentials: "same-origin",
    });
  } catch {
    // Une session expirée provoque une redirection vers la page de connexion Microsoft,
    // que le navigateur bloque en tant que requête inter-origines.
    throw new ApiError(NETWORK_ERROR_MESSAGE);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : UNEXPECTED_ERROR_MESSAGE;
    throw new ApiError(message);
  }

  return payload as T;
}

export function getErrorMessage(
  error: unknown,
  fallback = UNEXPECTED_ERROR_MESSAGE,
): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
