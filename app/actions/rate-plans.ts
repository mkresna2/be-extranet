import { getSession } from "@/lib/auth";

export async function getRatePlans(roomTypeId?: string) {
  const session = await getSession();
  if (!session?.currentProperty) return [];

  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/properties/${session.currentProperty.id}/rate-plans/`,
  );
  if (roomTypeId) {
    url.searchParams.append("room_type_id", roomTypeId);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    next: { tags: ["rate-plans"] },
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function createRatePlan(data: {
  room_type_id: string;
  name: string;
  description?: string;
  cancellation_policy?: string;
  meal_plan?: string;
}) {
  const session = await getSession();
  if (!session?.currentProperty) throw new Error("No property selected");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/properties/${session.currentProperty.id}/rate-plans/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create rate plan");
  }

  return response.json();
}
