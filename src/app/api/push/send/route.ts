import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendEventPush } from "@/lib/push";
import { z } from "zod";

const SendSchema = z.object({
  eventId: z.string().uuid(),
  title:   z.string().min(1).max(100),
  body:    z.string().min(1).max(200),
  url:     z.string().optional(),
});

// POST — send a manual push notification to all subscribers of an event
// Only accessible by authenticated organisers
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = SendSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  await sendEventPush(parsed.data.eventId, {
    title: parsed.data.title,
    body:  parsed.data.body,
    url:   parsed.data.url,
  });

  return NextResponse.json({ ok: true });
}
