"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export type PropertyActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const API_BASE_URL =
  process.env.BOOKING_ENGINE_API_URL ?? "https://booking-engine-vq7e.onrender.com";

export async function updateProperty(
  _previousState: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  const session = await getSession();
  if (!session) {
    return { status: "error", message: "Not authenticated" };
  }

  const propertyId = formData.get("id");
  if (!propertyId) {
    return { status: "error", message: "Property ID is missing" };
  }

  const payload = {
    name: formData.get("name"),
    description: formData.get("description"),
    address: formData.get("address"),
    city: formData.get("city"),
    country: formData.get("country"),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: "PATCH",
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
      message: "Property configuration updated successfully.",
    };
  } catch (error) {
    console.error("[updateProperty] Fetch error:", error);
    return {
      status: "error",
      message: "Unable to connect to the booking-engine API.",
    };
  }
}
