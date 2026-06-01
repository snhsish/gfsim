import { hasCompletedOnboarding } from "@/lib/gf-profile";

export async function getPostAuthPath(userId: string): Promise<string> {
  const onboarded = await hasCompletedOnboarding(userId);
  return onboarded ? "/chat" : "/onboarding";
}
