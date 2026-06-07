import { getServerSession } from "@/lib/auth-session";
import {
  CHAT_INITIAL_MESSAGE_LIMIT,
  CHAT_LOAD_OLDER_LIMIT,
} from "@/lib/chat/constants";
import { getChatMessagesPage } from "@/lib/chat/persistence";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const before = searchParams.get("before") ?? undefined;
  const limitParam = searchParams.get("limit");

  let limit = before ? CHAT_LOAD_OLDER_LIMIT : CHAT_INITIAL_MESSAGE_LIMIT;
  if (limitParam) {
    const parsed = Number.parseInt(limitParam, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      limit = Math.min(
        parsed,
        before ? CHAT_LOAD_OLDER_LIMIT : CHAT_INITIAL_MESSAGE_LIMIT,
      );
    }
  }

  const page = await getChatMessagesPage(session.user.id, {
    limit,
    before,
  });

  return Response.json(page);
}
