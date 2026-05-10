"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

const API_BASE_URL =
  process.env.BOOKING_ENGINE_API_URL || "https://booking-engine-vq7e.onrender.com";

export type RatePlan = {
  id: string;
  room_type_id: string;
  name: string;
  description: string | null;
  cancellation_policy: string | null;
  meal_plan: string | null;
  pricing_strategy: "manual" | "derived_from_bar";
  adjustment_type: "percentage" | "fixed_amount" | null;
  adjustment_value: number | null;
  created_at: string;
};

export type RatePlanPayload = {
  room_type_id: string;
  name: string;
  description?: string;
  cancellation_policy?: string;
  meal_plan?: string;
  pricing_strategy: "manual" | "derived_from_bar";
  adjustment_type?: "percentage" | "fixed_amount" | "";
  adjustment_value?: number | null;
};

const RATE_PLANS_TAG = "rate-plans";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNullableNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeRatePlan(value: unknown): RatePlan {
  if (!isRecord(value)) {
    throw new Error("Invalid rate plan payload received from the booking-engine API.");
  }

  return {
    id: asString(value.id),
    room_type_id: asString(value.room_type_id),
    name: asString(value.name),
    description: asNullableString(value.description),
    cancellation_policy: asNullableString(value.cancellation_policy),
    meal_plan: asNullableString(value.meal_plan),
    pricing_strategy:
      value.pricing_strategy === "derived_from_bar" ? "derived_from_bar" : "manual",
    adjustment_type:
      value.adjustment_type === "percentage" || value.adjustment_type === "fixed_amount"
        ? value.adjustment_type
        : null,
    adjustment_value: asNullableNumber(value.adjustment_value),
    created_at: asString(value.created_at),
  };
}

async function getCurrentPropertyContext() {
  const session = await getSession();
  if (!session?.currentProperty) {
    throw new Error("No property selected");
  }

  return {
    propertyId: session.currentProperty.id,
    accessToken: session.accessToken,
  };
}

async function readApiErrorMessage(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type")?.toLowerCase() || "";

  if (contentType.includes("json")) {
    try {
      const payload = (await response.json()) as { detail?: string; message?: string };
      if (typeof payload.detail === "string" && payload.detail.trim()) {
        return payload.detail;
      }
      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
      }
    } catch {
      return fallback;
    }
  }

  return response.status === 500 ? "Internal Server Error" : fallback;
}

function sanitizeRatePlanPayload(data: RatePlanPayload) {
  const pricingStrategy = data.pricing_strategy || "manual";
  const adjustmentType =
    pricingStrategy === "derived_from_bar" && data.adjustment_type
      ? data.adjustment_type
      : undefined;
  const adjustmentValue =
    pricingStrategy === "derived_from_bar" && typeof data.adjustment_value === "number"
      ? data.adjustment_value
      : undefined;

  return {
    room_type_id: data.room_type_id,
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    cancellation_policy: data.cancellation_policy?.trim() || undefined,
    meal_plan: data.meal_plan?.trim() || undefined,
    pricing_strategy: pricingStrategy,
    adjustment_type: adjustmentType === "" ? undefined : adjustmentType,
    adjustment_value: adjustmentValue,
  };
}

export async function getRatePlans(roomTypeId?: string): Promise<RatePlan[]> {
  const { propertyId, accessToken } = await getCurrentPropertyContext();

  const url = new URL(`${API_BASE_URL}/properties/${propertyId}/rate-plans/`);
  if (roomTypeId) {
    url.searchParams.append("room_type_id", roomTypeId);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { tags: [RATE_PLANS_TAG] },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeRatePlan) : [];
  } catch (error) {
    console.error("Failed to fetch rate plans:", error);
    return [];
  }
}

export async function createRatePlan(data: RatePlanPayload) {
  const { propertyId, accessToken } = await getCurrentPropertyContext();

  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/rate-plans/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(sanitizeRatePlanPayload(data)),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to create rate plan"));
  }

  revalidatePath("/dashboard/rate-plans");
  revalidatePath("/dashboard/rates");
  revalidatePath("/dashboard/availability");
  return normalizeRatePlan(await response.json());
}

export async function updateRatePlan(ratePlanId: string, data: RatePlanPayload) {
  const { propertyId, accessToken } = await getCurrentPropertyContext();

  const response = await fetch(
    `${API_BASE_URL}/properties/${propertyId}/rate-plans/${ratePlanId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(sanitizeRatePlanPayload(data)),
    },
  );

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to update rate plan"));
  }

  revalidatePath("/dashboard/rate-plans");
  revalidatePath("/dashboard/rates");
  revalidatePath("/dashboard/availability");
  return normalizeRatePlan(await response.json());
}
