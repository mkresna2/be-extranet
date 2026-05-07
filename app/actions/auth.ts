"use server";

import { redirect } from "next/navigation";
import {
  BookingEngineAuthError,
  clearSession,
  createSession,
  loginWithBackend,
} from "@/lib/auth";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  error?: {
    message: string;
    status?: number;
  };
};

export const initialAuthState: AuthActionState = {
  status: "idle",
};

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

  return {
    status: "success",
    message:
      "Mock reset sent. In production this will call the booking-engine API and email a recovery link.",
  };
}
