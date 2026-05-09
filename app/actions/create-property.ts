"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export type CreatePropertyActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const API_BASE_URL =
  process.env.BOOKING_ENGINE_API_URL ?? "https://booking-engine-vq7e.onrender.com";

export async function createPropertyAction(
  _previousState: CreatePropertyActionState,
  formData: FormData
): Promise<CreatePropertyActionState> {
  const session = await getSession();
  if (!session) {
    return { status: "error", message: "Not authenticated" };
  }

  const payload = {
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    country: formData.get("country"),
    description: formData.get("description") || "",
  };

  try {
    const response = await fetch(`${API_BASE_URL}/properties/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        status: "error",
        message: errorData.detail || `Backend error: ${response.status}`,
      };
    }

    revalidatePath("/dashboard/settings");

    return {
      status: "success",
      message: "New property created successfully.",
    };
  } catch (error) {
    console.error("[createProperty] Fetch error:", error);
    return {
      status: "error",
      message: "Unable to connect to the booking-engine API.",
    };
  }
}
