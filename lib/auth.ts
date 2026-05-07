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

type BackendUserResponse = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
};

type BackendPropertyResponse = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  is_active: boolean;
  created_at: string;
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

function getApiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
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

function mapUser(user: BackendUserResponse): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    isActive: user.is_active,
    createdAt: user.created_at,
  };
}

function mapProperty(property: BackendPropertyResponse): AuthProperty {
  return {
    id: property.id,
    name: property.name,
    description: property.description,
    address: property.address,
    city: property.city,
    country: property.country,
    isActive: property.is_active,
    createdAt: property.created_at,
  };
}

export async function loginWithBackend(email: string, password: string) {
  const response = await fetch(getApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await readApiErrorMessage(
      response,
      "Unable to sign in with the booking-engine API.",
    );

    throw new BookingEngineAuthError(message, response.status);
  }

  return (await response.json()) as TokenResponse;
}

async function fetchSessionData(accessToken: string) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  const [userResponse, propertiesResponse] = await Promise.all([
    fetch(getApiUrl("/auth/me"), {
      headers,
      cache: "no-store",
    }),
    fetch(getApiUrl("/properties/my"), {
      headers,
      cache: "no-store",
    }),
  ]);

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

  const user = (await userResponse.json()) as BackendUserResponse;
  const properties = (await propertiesResponse.json()) as BackendPropertyResponse[];

  return {
    user: mapUser(user),
    properties: properties.map(mapProperty),
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

    return {
      accessToken,
      user,
      properties,
      currentProperty: properties[0] ?? null,
    };
  } catch (error) {
    if (
      error instanceof BookingEngineAuthError &&
      [401, 403].includes(error.status)
    ) {
      await clearSession();
      return null;
    }

    throw error;
  }
});

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
