     1|"use server";
     2|
     3|import { getSession } from "@/lib/auth";
     4|
     5|const API_BASE_URL = process.env.BOOKING_ENGINE_API_URL || "https://booking-engine-vq7e.onrender.com";
     6|
     7|export type InventoryActionState = {
     8|  status: "idle" | "error" | "success";
     9|  message?: string;
    10|};
    11|
    12|export async function syncAvailability(
    13|  _previousState: InventoryActionState,
    14|  _formData: FormData,
    15|): Promise<InventoryActionState> {
    16|  const session = await getSession();
    17|  if (!session) {
    18|    return {
    19|      status: "error",
    20|      message: "You must be signed in to sync availability.",
    21|    };
    22|  }
    23|
    24|  const propertyId = session.currentProperty?.id;
    25|  if (!propertyId) {
    26|    return {
    27|      status: "error",
    28|      message: "No active property found.",
    29|    };
    30|  }
    31|
    32|  // Phase 1: In development, we might just mock the "syncing" or call a refresh.
    33|  // The user wants a button to "update availability" which eventually pulls from Channel Manager.
    34|  // For now, let's look for a room type and upsert a mock rate/availability to demonstrate it works.
    35|
    36|  try {
    37|    // 1. Fetch room types for this property
    38|    const roomTypesRes = await fetch(`${API_BASE_URL}/properties/${propertyId}/room-types/`, {
    39|        headers: {
    40|            "Authorization": `Bearer ${session.accessToken}`
    41|        }
    42|    });
    43|
    44|    if (!roomTypesRes.ok) throw new Error("Failed to fetch room types");
    45|    const roomTypes = await roomTypesRes.json();
    46|
    47|    if (roomTypes.length === 0) {
    48|      return {
    49|        status: "error",
    50|        message: "No room types found to update.",
    51|      };
    52|    }
    53|
    54|    // 2. Mocking an update for the first room type for the next 7 days
    55|    const roomTypeId = roomTypes[0].id;
    56|    const today = new Date();
    57|    const rates = [];
    58|
    59|    for (let i = 0; i < 7; i++) {
    60|        const date = new Date(today);
    61|        date.setDate(today.getDate() + i);
    62|        rates.push({
    63|            date: date.toISOString().split('T')[0],
    64|            price: 1250000,
    65|            available: 5
    66|        });
    67|    }
    68|
    69|    const upsertRes = await fetch(`${API_BASE_URL}/room-types/${roomTypeId}/rates/upsert`, {
    70|        method: "POST",
    71|        headers: {
    72|            "Authorization": `Bearer ${session.accessToken}`,
    73|            "Content-Type": "application/json"
    74|        },
    75|        body: JSON.stringify({ rates })
    76|    });
    77|
    78|    if (!upsertRes.ok) throw new Error("Failed to upsert rates");
    79|
    80|    return {
    81|        status: "success",
    82|        message: `Successfully updated availability for ${roomTypes[0].name} from Channel Manager (Mock).`
    83|    };
    84|
    85|  } catch (error: unknown) {
    86|    console.error("Sync Error:", error);
    87|    return {
    88|      status: "error",
    89|      message: error instanceof Error ? error.message : "Failed to sync availability.",
    90|    };
    91|  }
    92|}
    93|