import Link from "next/link";
import { Clock } from "lucide-react";
import { db, events } from "@/db";
import { eq } from "drizzle-orm";

export default async function WaitlistSuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { position?: string; lang?: string };
}) {
  const [event] = await db.select().from(events).where(eq(events.slug, params.slug));
  const primaryColor = event?.websiteColor ?? "#C8522A";
  const position = parseInt(searchParams.position ?? "1");
  const langParam = searchParams.lang === "en" ? "?lang=en" : "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-sm w-full space-y-5">

        {/* Icoon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: "#6B728020" }}
        >
          <Clock size={36} className="text-gray-500" />
        </div>

        {/* Titel */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Je staat op de wachtlijst!</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            We hebben je aanmelding ontvangen. Je ontvangt een e-mail zodra er een plek vrijkomt.
          </p>
        </div>

        {/* Positie */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Jouw positie</p>
          <p className="text-5xl font-black text-gray-800">#{position}</p>
          <p className="text-xs text-gray-500 mt-2">in de wachtrij</p>
        </div>

        {event && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-left">
            <p className="text-xs text-gray-400 mb-1">Evenement</p>
            <p className="text-sm font-semibold text-gray-900">{event.title}</p>
          </div>
        )}

        {/* Info blok */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
          <p className="text-sm font-semibold text-amber-800 mb-1">Wat gebeurt er nu?</p>
          <ul className="text-xs text-amber-700 space-y-1.5 leading-relaxed">
            <li>• Je ontvangt een bevestigingsmail op het opgegeven e-mailadres</li>
            <li>• Zodra er een plek vrijkomt, sturen we je een link om je definitief aan te melden</li>
            <li>• Je hebt dan 48 uur om je plek te bevestigen</li>
          </ul>
        </div>

        <Link
          href={`/e/${params.slug}${langParam}`}
          className="block w-full py-3 rounded-2xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          Terug naar het evenement
        </Link>
      </div>
    </div>
  );
}
