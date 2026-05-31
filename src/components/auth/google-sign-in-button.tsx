"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

type GoogleSignInButtonProps = {
  callbackURL?: string;
};

export function GoogleSignInButton({
  callbackURL = "/",
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      disabled={isLoading}
      onClick={handleSignIn}
    >
      {isLoading ? "Redirecting…" : "Continue with Google"}
    </Button>
  );
}
