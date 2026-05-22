"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BijeenWordmark } from "@/components/ui/bijeen-wordmark";
import { AlertTriangle } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:   "Er is een configuratiefout op de server.",
  AccessDenied:    "Toegang geweigerd.",
  Verification:    "De inloglink is verlopen of al gebruikt. Vraag een nieuwe aan.",
  OAuthSignin:     "Er ging iets mis met inloggen. Probeer opnieuw.",
  OAuthCallback:   "Er ging iets mis met de callback. Probeer opnieuw.",
  OAuthCreateAccount: "Account kon niet worden aangemaakt.",
  EmailCreateAccount: "Account kon niet worden aangemaakt.",
  Callback:        "Er ging iets mis. Probeer opnieuw.",
  OAuthAccountNotLinked: "Dit e-mailadres is al gekoppeld aan een andere provider.",
  EmailSignin:     "De inloglink kon niet worden verstuurd.",
  CredentialsSignin: "Onjuiste inloggegevens.",
  SessionRequired: "Je moet ingelogd zijn om deze pagina te bekijken.",
  Default:         "Er is een onbekende fout opgetreden.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#F0E8DC] p-8 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-[#1C1814] mb-2">Inloggen mislukt</h2>
      <p className="text-sm text-[#6B6560] leading-relaxed mb-2">{message}</p>
      <p className="text-xs text-[#B8B3AC] mb-6 font-mono">Foutcode: {error}</p>
      <Link
        href="/sign-in"
        className="inline-flex items-center justify-center w-full bg-[#C8522A] hover:bg-[#B04624] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        Opnieuw proberen
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <header className="px-6 py-4 border-b border-[#F0E8DC]">
        <Link href="/">
          <BijeenWordmark variant="dark" size="md" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Suspense fallback={null}>
            <ErrorContent />
          </Suspense>
        </div>
      </main>
      <footer className="px-6 py-4 text-center text-xs text-[#B8B3AC]">
        © {new Date().getFullYear()} Bijeen
      </footer>
    </div>
  );
}
