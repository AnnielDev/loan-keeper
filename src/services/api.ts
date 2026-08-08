import type { ApiSuccess } from "@/types/auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type AuthAccessor = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
};

let authAccessor: AuthAccessor | null = null;

// Set by the auth store after creation, avoiding a store <-> api import cycle.
export function setAuthAccessor(accessor: AuthAccessor) {
  authAccessor = accessor;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ApiFetchOptions = RequestInit & {
  /** Skip attaching the Authorization header (e.g. sign-in/sign-up). */
  skipAuth?: boolean;
  /** Skip the automatic 401 refresh-and-retry (used by the refresh call itself). */
  skipRefresh?: boolean;
};

async function rawFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message = body?.message ?? response.statusText;
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, response.status);
  }

  return body as T;
}

let refreshPromise: Promise<string | null> | null = null;

// Coalesces concurrent 401s into a single refresh call instead of racing.
function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authAccessor?.getRefreshToken() ?? null;
  if (!refreshToken) {
    return Promise.resolve(null);
  }

  if (!refreshPromise) {
    refreshPromise = rawFetch<
      ApiSuccess<{ accessToken: string; refreshToken: string }>
    >("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
      .then(({ data }) => {
        authAccessor?.setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      })
      .catch(() => {
        authAccessor?.clearAuth();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, skipRefresh, ...rest } = options;
  const accessToken = authAccessor?.getAccessToken() ?? null;

  const headers = {
    ...rest.headers,
    ...(accessToken && !skipAuth ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  try {
    return await rawFetch<T>(path, { ...rest, headers });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && accessToken && !skipRefresh) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        return rawFetch<T>(path, {
          ...rest,
          headers: { ...rest.headers, Authorization: `Bearer ${newAccessToken}` },
        });
      }
    }
    throw error;
  }
}
