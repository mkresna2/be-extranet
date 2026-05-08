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

  try {
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
        message: "No room types found. Please create at least one in the Room Types page first.",
      };
    }

    const today = new Date();
    
    for (const roomType of roomTypes) {
        const rates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            rates.push({
                date: date.toISOString().split('T')[0],
                price: 1250000,
                available: 5
            });
        }

        const upsertRes = await fetch(`${API_BASE_URL}/room-types/${roomType.id}/rates/upsert`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ rates })
        });

        if (!upsertRes.ok) {
            console.error(`Failed to upsert rates for room type ${roomType.name}`);
        }
    }

    return {
        status: "success",
        message: `Successfully updated availability for all ${roomTypes.length} room types from Channel Manager (Mock).`
    };

  } catch (error: unknown) {
    console.error("Sync Error:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to sync availability.",
    };
  }
}
