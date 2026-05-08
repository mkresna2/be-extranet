import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE_URL =
  process.env.BOOKING_ENGINE_API_URL ?? "https://booking-engine-vq7e.onrender.com";

const ACCESS_TOKEN_COOKIE = "be-extranet-access-token";
const REFRESH_TOKEN_COOKIE = "be-extranet-refresh-token";
const SESSION_MAX_AGE = 60 * 60 * 8;

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
};

export type AuthProperty = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  isActive: boolean;
  createdAt: string;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
  properties: AuthProperty[];
  currentProperty: AuthProperty | null;
};

export class BookingEngineAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "BookingEngineAuthError";
  }
}

type ErrorWithDigest = Error & {
  digest?: string;
  cause?: unknown;
};

function getApiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNonEmptyString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function serializePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function logAuthError(
  scope: string,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  const authError = error as ErrorWithDigest;

  console.error(`[auth] ${scope}`, {
    message: authError?.message ?? String(error),
    name: authError?.name,
    digest: authError?.digest,
    cause: authError?.cause,
    ...extra,
  });
}

async function readApiErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { detail?: string };

    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
  } catch {
    // Ignore malformed error payloads and use the fallback message.
  }

  return fallback;
}

function normalizeUser(value: unknown): AuthUser {
  if (!isRecord(value)) {
    throw new BookingEngineAuthError(
      "Invalid user payload received from the booking-engine API.",
      502,
    );
  }

  return {
    id: asNonEmptyString(value.id),
    email: asNonEmptyString(value.email),
    fullName: asNonEmptyString(value.full_name),
    isActive: asBoolean(value.is_active),
    createdAt: asNonEmptyString(value.created_at),
  };
}

function normalizeProperty(value: unknown): AuthProperty {
  if (!isRecord(value)) {
    throw new BookingEngineAuthError(
      "Invalid property payload received from the booking-engine API.",
      502,
    );
  }

  return {
    id: asNonEmptyString(value.id),
    name: asNonEmptyString(value.name),
    description: asNullableString(value.description),
    address: asNonEmptyString(value.address),
    city: asNonEmptyString(value.city),
    country: asNonEmptyString(value.country),
    isActive: asBoolean(value.is_active),
    createdAt: asNonEmptyString(value.created_at),
  };
}

function normalizeTokenResponse(value: unknown): TokenResponse {
  if (!isRecord(value)) {
    throw new BookingEngineAuthError(
      "Invalid token payload received from the booking-engine API.",
      502,
    );
  }

  const accessToken = asNonEmptyString(value.access_token);
  const refreshToken = asNonEmptyString(value.refresh_token);
  const tokenType = asNonEmptyString(value.token_type, "Bearer");

  if (!accessToken || !refreshToken) {
    throw new BookingEngineAuthError(
      "Incomplete token payload received from the booking-engine API.",
      502,
    );
  }

  return serializePlain({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: tokenType,
  });
}

function normalizeProperties(value: unknown): AuthProperty[] {
  if (!Array.isArray(value)) {
    throw new BookingEngineAuthError(
      "Invalid properties payload received from the booking-engine API.",
      502,
    );
  }

  return serializePlain(value.map(normalizeProperty));
}

export async function loginWithBackend(email: string, password: string) {
  let response: Response;
  const payload: LoginRequest = { email, password };

  try {
    response = await fetch(getApiUrl("/auth/login"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (error) {
    logAuthError("loginWithBackend.fetch", error, { email });

    throw new BookingEngineAuthError(
      "Unable to reach the booking-engine API right now. Please try again.",
      503,
    );
  }

  if (!response.ok) {
    const message = await readApiErrorMessage(
      response,
      "Unable to sign in with the booking-engine API.",
    );

    throw new BookingEngineAuthError(message, response.status);
  }

  try {
    return normalizeTokenResponse(await response.json());
  } catch (error) {
    logAuthError("loginWithBackend.parse", error, { email });

    if (error instanceof BookingEngineAuthError) {
      throw error;
    }

    throw new BookingEngineAuthError(
      "Unable to read the booking-engine login response.",
      502,
    );
  }
}

async function fetchSessionData(accessToken: string) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  let userResponse: Response;
  let propertiesResponse: Response;

  try {
    [userResponse, propertiesResponse] = await Promise.all([
      fetch(getApiUrl("/auth/me"), {
        headers,
        cache: "no-store",
      }),
      fetch(getApiUrl("/properties/my"), {
        headers,
        cache: "no-store",
      }),
    ]);
  } catch (error) {
    logAuthError("fetchSessionData.fetch", error);

    throw new BookingEngineAuthError(
      "Unable to load the current session from the booking-engine API.",
      503,
    );
  }

  if (!userResponse.ok) {
    const message = await readApiErrorMessage(
      userResponse,
      "Unable to load the current user session.",
    );

    throw new BookingEngineAuthError(message, userResponse.status);
  }

  if (!propertiesResponse.ok) {
    const message = await readApiErrorMessage(
      propertiesResponse,
      "Unable to load the current user's properties.",
    );

    throw new BookingEngineAuthError(message, propertiesResponse.status);
  }

  let userPayload: unknown;
  let propertiesPayload: unknown;

  try {
    [userPayload, propertiesPayload] = await Promise.all([
      userResponse.json(),
      propertiesResponse.json(),
    ]);
  } catch (error) {
    logAuthError("fetchSessionData.parse", error);

    throw new BookingEngineAuthError(
      "Unable to read the current session payload from the booking-engine API.",
      502,
    );
  }

  const user = normalizeUser(userPayload);
  const properties = normalizeProperties(propertiesPayload);

  return {
    user,
    properties,
  };
}

export async function createSession(tokens: TokenResponse) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export const getSession = cache(async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const { user, properties } = await fetchSessionData(accessToken);

    return serializePlain({
      accessToken,
      user,
      properties,
      currentProperty: properties[0] ?? null,
    });
  } catch (error) {
  if (
    error instanceof BookingEngineAuthError &&
    [401, 403].includes(error.status)
  ) {
    // Cannot clear session (modify cookies) inside getSession/Server Component
    return null;
  }

    logAuthError("getSession", error);
    throw error;
  }
});

export async function getSessionForPublicRoute() {
  try {
    return await getSession();
  } catch (error) {
    logAuthError("getSessionForPublicRoute", error);
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
