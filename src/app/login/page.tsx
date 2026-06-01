import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerSession } from "@/lib/auth-session";
import { getPostAuthPath } from "@/lib/redirects";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect(await getPostAuthPath(session.user.id));
  }

  return (
    <div className="h-screen w-full flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login to GFSim</CardTitle>
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
