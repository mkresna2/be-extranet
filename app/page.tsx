import { redirect } from "next/navigation";
import { getSessionForPublicRoute } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSessionForPublicRoute();

  redirect(session ? "/dashboard" : "/login");
}
