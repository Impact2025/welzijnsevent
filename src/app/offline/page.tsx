import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center">
        <WifiOff size={28} className="text-ink-muted" />
      </div>
      <h1 className="text-xl font-bold text-ink">Geen internetverbinding</h1>
      <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
        Controleer je verbinding en probeer het opnieuw. Gecachte pagina&apos;s zijn beschikbaar.
      </p>
      <a
        href="/"
        className="mt-2 px-5 py-2.5 rounded-xl bg-terra-500 text-white text-sm font-semibold hover:bg-terra-600 transition-colors"
      >
        Opnieuw proberen
      </a>
    </div>
  );
}
