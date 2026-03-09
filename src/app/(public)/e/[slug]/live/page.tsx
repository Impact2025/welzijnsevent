import { db, events, qaMessages, polls } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EventNav }  from "@/components/public/event-nav";
import { QAForm }    from "@/components/public/qa-form";
import { PollVote }  from "@/components/public/poll-vote";
import { MessageSquare, BarChart3, CheckCircle2, ThumbsUp } from "lucide-react";
import { formatRelative } from "@/lib/utils";

export default async function LivePage({ params }: { params: { slug: string } }) {
  const [event] = await db.select().from(events).where(eq(events.slug, params.slug));
  if (!event || !event.isPublic) notFound();

  const primaryColor = event.websiteColor ?? "#C8522A";

  const [activePoll] = await db
    .select()
    .from(polls)
    .where(and(eq(polls.eventId, event.id), eq(polls.isActive, true)));

  const approvedMessages = await db
    .select()
    .from(qaMessages)
    .where(and(eq(qaMessages.eventId, event.id), eq(qaMessages.status, "goedgekeurd")))
    .orderBy(desc(qaMessages.upvotes), desc(qaMessages.createdAt));

  return (
    <div className="min-h-screen bg-gray-50">
      <EventNav slug={params.slug} eventTitle={event.title} primaryColor={primaryColor} />

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 pb-24">

        {/* Live status banner */}
        {event.status === "live" && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80">Evenement is Live</p>
              <p className="text-sm font-bold">{event.title}</p>
            </div>
          </div>
        )}

        {/* Active poll */}
        {activePoll ? (
          <PollVote poll={activePoll} primaryColor={primaryColor} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <BarChart3 size={26} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-400">Geen actieve poll</p>
            <p className="text-xs text-gray-300 mt-0.5">De organisatie start een poll zodra het begint</p>
          </div>
        )}

        {/* Q&A submit form */}
        <QAForm eventId={event.id} primaryColor={primaryColor} />

        {/* Approved Q&A messages */}
        {approvedMessages.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <MessageSquare size={13} className="text-gray-400" />
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Goedgekeurde vragen ({approvedMessages.length})
              </p>
            </div>
            <div className="space-y-2.5">
              {approvedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-800 leading-relaxed flex-1">{msg.content}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
                    <p className="text-[11px] text-gray-400 font-medium">
                      {msg.isAnonymous || !msg.authorName ? "Anoniem" : msg.authorName}
                      {msg.createdAt && (
                        <> · {formatRelative(msg.createdAt)}</>
                      )}
                    </p>
                    {(msg.upvotes ?? 0) > 0 && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                        <ThumbsUp size={11} />
                        {msg.upvotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {approvedMessages.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <MessageSquare size={26} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-400">Nog geen vragen goedgekeurd</p>
            <p className="text-xs text-gray-300 mt-0.5">Stel hierboven een vraag</p>
          </div>
        )}
      </div>
    </div>
  );
}
