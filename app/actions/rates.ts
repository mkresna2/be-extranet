     1|"use server";
     2|
     3|import { revalidatePath } from "next/cache";
     4|import { getSession } from "@/lib/auth";
     5|
     6|const API_BASE_URL = process.env.BOOKING_ENGINE_API_URL || "https://booking-engine-vq7e.onrender.com";
     7|
     8|export type RateActionState = {
     9|  status: "idle" | "error" | "success";
    10|  message?: string;
    11|};
    12|
    13|export async function updateRates(
    14|  _previousState: RateActionState,
    15|  formData: FormData,
    16|): Promise<RateActionState> {
    17|  const session = await getSession();
    18|  if (!session) return { status: "error", message: "You must be signed in." };
    19|
    20|  const roomTypeId = formData.get("roomTypeId") as string;
    21|  const price = Number(formData.get("price"));
    22|  const startDate = formData.get("startDate") as string;
    23|  const endDate = formData.get("endDate") as string;
    24|
    25|  if (!roomTypeId || !price || !startDate || !endDate) {
    26|    return { status: "error", message: "All fields are required." };
    27|  }
    28|
    29|  try {
    30|    const start = new Date(startDate);
    31|    const end = new Date(endDate);
    32|    const rates = [];
    33|
    34|    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    35|      rates.push({
    36|        date: d.toISOString().split('T')[0],
    37|        price: price,
    38|        available: 5 // Default for now
    39|      });
    40|    }
    41|
    42|    const response = await fetch(`${API_BASE_URL}/room-types/${roomTypeId}/rates/upsert`, {
    43|      method: "POST",
    44|      headers: {
    45|        "Authorization": `Bearer ${session.accessToken}`,
    46|        "Content-Type": "application/json",
    47|      },
    48|      body: JSON.stringify({ rates }),
    49|    });
    50|
    51|    if (!response.ok) {
    52|      const errorData = await response.json();
    53|      throw new Error(errorData.detail || "Failed to update rates.");
    54|    }
    55|
    56|    revalidatePath("/dashboard/rates");
    57|    revalidatePath("/dashboard/availability");
    58|    return { status: "success", message: "Rates updated successfully!" };
    59|  } catch (error) {
    60|    return { status: "error", message: error instanceof Error ? error.message : "An error occurred." };
    61|  }
    62|}
    63|
    64|export async function getRoomRates(roomTypeId: string, startDate: string, endDate: string) {
    65|  const session = await getSession();
    66|  if (!session) return [];
    67|
    68|  const response = await fetch(`${API_BASE_URL}/room-types/${roomTypeId}/rates/?start_date=${startDate}&end_date=${endDate}`, {
    69|    headers: { "Authorization": `Bearer ${session.accessToken}` },
    70|  });
    71|
    72|  if (!response.ok) return [];
    73|  return response.json();
    74|}
    75|