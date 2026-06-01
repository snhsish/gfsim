import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth-session";
import { getPostAuthPath } from "@/lib/redirects";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  redirect(await getPostAuthPath(session.user.id));
}
