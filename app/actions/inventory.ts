"use server";

import { getSession } from "@/lib/auth";

const API_BASE_URL = process.env.BOOKING_ENGINE_API_URL || "https://booking-engine-vq7e.onrender.com";

export type InventoryActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function syncAvailability(
  _previousState: InventoryActionState,
  _formData: FormData,
): Promise<InventoryActionState> {
  const session = await getSession();
  if (!session) {
    return {
      status: "error",
      message: "You must be signed in to sync availability.",
    };
  }

  const propertyId = session.currentProperty?.id;
  if (!propertyId) {
    return {
      status: "error",
      message: "No active property found.",
    };
  }

  // Phase 1: In development, we might just mock the "syncing" or call a refresh.
  // The user wants a button to "update availability" which eventually pulls from Channel Manager.
  // For now, let's look for a room type and upsert a mock rate/availability to demonstrate it works.

  try {
    // 1. Fetch room types for this property
    const roomTypesRes = await fetch(`${API_BASE_URL}/properties/${propertyId}/room-types/`, {
        headers: {
            "Authorization": `Bearer ${session.accessToken}`
        }
    });

    if (!roomTypesRes.ok) throw new Error("Failed to fetch room types");
    const roomTypes = await roomTypesRes.json();

    if (roomTypes.length === 0) {
      return {
        status: "error",
        message: "No room types found to update.",
      };
    }

    // 2. Mocking an update for the first room type for the next 7 days
    const roomTypeId = roomTypes[0].id;
    const today = new Date();
    const rates = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        rates.push({
            date: date.toISOString().split('T')[0],
            base_price: 1250000,
            availability: 5
        });
    }

    const upsertRes = await fetch(`${API_BASE_URL}/room-types/${roomTypeId}/rates/upsert`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${session.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ rates })
    });

    if (!upsertRes.ok) throw new Error("Failed to upsert rates");

    return {
        status: "success",
        message: `Successfully updated availability for ${roomTypes[0].name} from Channel Manager (Mock).`
    };

  } catch (error: unknown) {
    console.error("Sync Error:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to sync availability.",
    };
  }
}
