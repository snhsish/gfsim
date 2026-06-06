export const USER_ONBOARDING_DONE_KEY = "user-onboarding-done";

export function isUserOnboardingDone(): boolean {
  if (typeof window === "undefined") return true;

  try {
    return localStorage.getItem(USER_ONBOARDING_DONE_KEY) === "true";
  } catch {
    return true;
  }
}

export function markUserOnboardingDone(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(USER_ONBOARDING_DONE_KEY, "true");
  } catch {
    // Quota exceeded or private mode — ignore
  }
}
