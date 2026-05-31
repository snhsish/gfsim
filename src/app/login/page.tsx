import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Girlfriend Simulator</CardTitle>
          <CardDescription>
            Sign in with Google to continue. New accounts are created on first
            sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton callbackURL="/" />
        </CardContent>
      </Card>
    </div>
  );
}
