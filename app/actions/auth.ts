"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  BookingEngineAuthError,
  clearSession,
  createSession,
  loginWithBackend,
} from "@/lib/auth";

const PROPERTY_ID_COOKIE = "be-extranet-property-id";
const SESSION_MAX_AGE = 60 * 60 * 8;

/* Action states defined outside to avoid Next.js 'use server' value export error */
export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  error?: {
    message: string;
    status?: number;
  };
};

export async function setActiveProperty(id: string) {
  const cookieStore = await cookies();
  cookieStore.set(PROPERTY_ID_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  revalidatePath("/");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      status: "error",
      message: "Enter both email and password.",
      error: {
        message: "Enter both email and password.",
      },
    };
  }

  try {
    const tokens = await loginWithBackend(email, password);
    await createSession(tokens);
  } catch (error) {
    if (error instanceof BookingEngineAuthError) {
      console.error("[auth] loginAction", {
        email,
        status: error.status,
        message: error.message,
      });

      return {
        status: "error",
        message: error.message,
        error: {
          message:
            error.status === 401 || error.status === 403
              ? "Invalid email or password."
              : error.message,
          status: error.status,
        },
      };
    }

    console.error("[auth] loginAction", {
      email,
      error,
    });

    return {
      status: "error",
      message: "Unable to reach the booking-engine API right now. Please try again.",
      error: {
        message: "Unable to reach the booking-engine API right now. Please try again.",
      },
    };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

const API_BASE_URL =
  process.env.BOOKING_ENGINE_API_URL ?? "https://booking-engine-vq7e.onrender.com";

export async function recoverPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return {
      status: "error",
      message: "Enter the account email to continue.",
      error: {
        message: "Enter the account email to continue.",
      },
    };
  }

  try {
    await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
    // Always show generic success regardless of backend response
    return {
      status: "success",
      message: "If the account exists, a password reset link has been sent.",
    };
  } catch {
    // Even on network error, don't reveal if email exists
    return {
      status: "success",
      message: "If the account exists, a password reset link has been sent.",
    };
  }
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const token = String(formData.get("token") ?? "").trim();
  const new_password = String(formData.get("new_password") ?? "");
  const confirm_password = String(formData.get("confirm_password") ?? "");

  if (!token) {
    return {
      status: "error",
      message: "Reset token is missing.",
      error: { message: "Reset token is missing." },
    };
  }

  if (!new_password || new_password.length < 8) {
    return {
      status: "error",
      message: "Password must be at least 8 characters.",
      error: { message: "Password must be at least 8 characters." },
    };
  }

  if (new_password !== confirm_password) {
    return {
      status: "error",
      message: "Passwords do not match.",
      error: { message: "Passwords do not match." },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password }),
      cache: "no-store",
    });

    if (!response.ok) {
      const data = (await response.json()) as { detail?: string };
      return {
        status: "error",
        message: data.detail || "Invalid or expired reset token.",
        error: { message: data.detail || "Invalid or expired reset token." },
      };
    }
  } catch {
    return {
      status: "error",
      message: "Unable to reach the server. Please try again.",
      error: { message: "Unable to reach the server. Please try again." },
    };
  }

  redirect("/login?reset=success");
}
