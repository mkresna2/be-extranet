"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export type PropertyActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function updateProperty(
  _previousState: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  const session = await getSession();
  if (!session) {
    return { status: "error", message: "Not authenticated" };
  }

  // STUB: In the future, this will call the backend API
  // const name = formData.get("name");
  // const address = formData.get("address");
  // ...

  console.log("Property update stub called with:", Object.fromEntries(formData));

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  revalidatePath("/dashboard/settings");
  
  return {
    status: "success",
    message: "Property configuration updated successfully (stub).",
  };
}
