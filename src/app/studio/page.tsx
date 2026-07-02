import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import StudioClient from "./StudioClient";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return <StudioClient user={{
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    credits: user.credits,
    isUnlimited: user.isUnlimited,
    plan: user.plan,
    avatarColor: user.avatarColor,
  }} />;
}
