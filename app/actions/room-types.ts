"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

const API_BASE_URL =
  process.env.BOOKING_ENGINE_API_URL || "https://booking-engine-vq7e.onrender.com";

export type RoomType = {
  id: string;
  name: string;
  description: string | null;
  max_occupancy: number;
  total_rooms: number;
  bed_type: string;
};

export type RoomTypeActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

type RoomTypePayload = {
  name: string;
  description: string;
  max_occupancy: number;
  total_rooms: number;
  bed_type: string;
};

function getPropertyRoomTypesPath(propertyId: string) {
  return `/properties/${propertyId}/room-types/`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeRoomType(value: unknown): RoomType {
  if (!isRecord(value)) {
    throw new Error("Invalid room type payload received from the booking-engine API.");
  }

  return {
    id: asString(value.id),
    name: asString(value.name),
    description: asNullableString(value.description),
    max_occupancy: asNumber(value.max_occupancy),
    total_rooms: asNumber(value.total_rooms),
    bed_type: asString(value.bed_type),
  };
}

async function readApiErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as unknown;

    if (isRecord(payload)) {
      if (typeof payload.detail === "string" && payload.detail.trim()) {
        return payload.detail;
      }

      if (Array.isArray(payload.detail)) {
        return payload.detail
          .map((detail) => {
            if (!isRecord(detail)) {
              return null;
            }

            return typeof detail.msg === "string" ? detail.msg : null;
          })
          .filter(Boolean)
          .join(" ");
      }

      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
      }
    }
  } catch {
    // Use the fallback when the backend response is not JSON.
  }

  return fallback;
}

function readRequiredString(formData: FormData, key: keyof RoomTypePayload) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Name, max occupancy, total rooms, and bed type are required.");
  }

  return value.trim();
}

function readRequiredPositiveInteger(formData: FormData, key: keyof RoomTypePayload) {
  const rawValue = readRequiredString(formData, key);
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 1) {
    throw new Error("Max occupancy and total rooms must be positive whole numbers.");
  }

  return value;
}

async function getCurrentPropertyContext() {
  const session = await getSession();

  if (!session) {
    throw new Error("You must be signed in to manage room types.");
  }

  const propertyId = session.currentProperty?.id;

  if (!propertyId) {
    throw new Error("No active property found.");
  }

  return {
    accessToken: session.accessToken,
    propertyId,
  };
}

export async function getRoomTypes(): Promise<RoomType[]> {
  const { accessToken, propertyId } = await getCurrentPropertyContext();

  const response = await fetch(
    `${API_BASE_URL}${getPropertyRoomTypesPath(propertyId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readApiErrorMessage(response, "Failed to fetch room types."),
    );
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    throw new Error("Invalid room types payload received from the booking-engine API.");
  }

  return payload.map(normalizeRoomType);
}

export async function createRoomType(
  _previousState: RoomTypeActionState,
  formData: FormData,
): Promise<RoomTypeActionState> {
  try {
    const { accessToken, propertyId } = await getCurrentPropertyContext();
    const description = formData.get("description");

    const payload: RoomTypePayload = {
      name: readRequiredString(formData, "name"),
      description: typeof description === "string" ? description.trim() : "",
      max_occupancy: readRequiredPositiveInteger(formData, "max_occupancy"),
      total_rooms: readRequiredPositiveInteger(formData, "total_rooms"),
      bed_type: readRequiredString(formData, "bed_type"),
    };

    const response = await fetch(
      `${API_BASE_URL}${getPropertyRoomTypesPath(propertyId)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      return {
        status: "error",
        message: await readApiErrorMessage(response, "Failed to create room type."),
      };
    }

    revalidatePath("/dashboard/room-types");
    revalidatePath("/dashboard/availability");

    return {
      status: "success",
      message: `Created room type "${payload.name}".`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to create room type.",
    };
  }
}
