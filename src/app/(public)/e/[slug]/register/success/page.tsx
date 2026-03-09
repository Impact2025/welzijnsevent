import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { db, events } from "@/db";
import { eq } from "drizzle-orm";
import nlDict from "@/i18n/nl.json";
import enDict from "@/i18n/en.json";

type Dict = typeof nlDict;
function getDict(lang: string | undefined): Dict {
  return lang === "en" ? enDict : nlDict;
}

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { lang?: string; orderId?: string };
}) {
  const t = getDict(searchParams.lang);

  const [event] = await db.select().from(events).where(eq(events.slug, params.slug));
  const primaryColor = event?.websiteColor ?? "#C8522A";
  const langParam = searchParams.lang === "en" ? "?lang=en" : "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-sm w-full space-y-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <CheckCircle2 size={36} style={{ color: primaryColor }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t.success_title}</h1>
          <p className="text-sm text-gray-500 mt-2">{t.success_subtitle}</p>
        </div>
        {event && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-left">
            <p className="text-xs text-gray-400 mb-1">Event</p>
            <p className="text-sm font-semibold text-gray-900">{event.title}</p>
          </div>
        )}
        <Link
          href={`/e/${params.slug}${langParam}`}
          className="block w-full py-3 rounded-2xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          {t.back_to_event}
        </Link>
      </div>
    </div>
  );
}
