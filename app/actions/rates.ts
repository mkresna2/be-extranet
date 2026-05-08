"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

const API_BASE_URL = process.env.BOOKING_ENGINE_API_URL || "https://booking-engine-vq7e.onrender.com";

export type RateActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function updateRates(
  _previousState: RateActionState,
  formData: FormData,
): Promise<RateActionState> {
  const session = await getSession();
  if (!session) return { status: "error", message: "You must be signed in." };

  const roomTypeId = formData.get("roomTypeId") as string;
  const price = Number(formData.get("price"));
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  if (!roomTypeId || !price || !startDate || !endDate) {
    return { status: "error", message: "All fields are required." };
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const rates = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      rates.push({
        date: d.toISOString().split('T')[0],
        price: price,
        available: 5 // Default for now
      });
    }

    const response = await fetch(`${API_BASE_URL}/room-types/${roomTypeId}/rates/upsert`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rates }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update rates.");
    }

    revalidatePath("/dashboard/rates");
    revalidatePath("/dashboard/availability");
    return { status: "success", message: "Rates updated successfully!" };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "An error occurred." };
  }
}

export async function getRoomRates(roomTypeId: string, startDate: string, endDate: string) {
  const session = await getSession();
  if (!session) return [];

  const response = await fetch(`${API_BASE_URL}/room-types/${roomTypeId}/rates/?start_date=${startDate}&end_date=${endDate}`, {
    headers: { "Authorization": `Bearer ${session.accessToken}` },
  });

  if (!response.ok) return [];
  return response.json();
}
