import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountProfile } from "@/components/account/account-profile";
import { getServerSession } from "@/lib/auth-session";
import { getUserProfileById } from "@/lib/user-profile";

export const metadata: Metadata = {
  title: "Account · GFSim",
  description: "Manage your GFSim account details",
};

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getUserProfileById(session.user.id);
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Account
          </h1>
          <p className="text-sm text-muted-foreground">
            View and update your profile details.
          </p>
        </div>

        <AccountProfile profile={profile} />
      </div>
    </div>
  );
}
