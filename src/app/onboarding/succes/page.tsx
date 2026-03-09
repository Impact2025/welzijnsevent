import Link from "next/link";
import { CheckCircle, Zap } from "lucide-react";

export default function OnboardingSuccesPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-terra-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-terra-500/30">
          <Zap size={22} className="text-white fill-white" />
        </div>

        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-ink mb-2">Betaling ontvangen!</h1>
        <p className="text-ink-muted mb-8">
          Je abonnement is actief. Welkom bij Bijeen — je bent klaar om je eerste evenement te maken.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
        >
          Naar dashboard
        </Link>
      </div>
    </div>
  );
}
