"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const result = await signIn("resend", {
      email: email.trim(),
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-sand p-8 text-center">
          <div className="w-14 h-14 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            📬
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Check je inbox</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-4">
            We hebben een inloglink verstuurd naar <strong className="text-ink">{email}</strong>.
            Klik op de link in de e-mail om in te loggen.
          </p>
          <p className="text-xs text-ink-muted">
            Geen mail ontvangen?{" "}
            <button
              onClick={() => setSent(false)}
              className="text-terra-500 font-semibold hover:underline"
            >
              Opnieuw proberen
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-sand p-8">
        <div className="mb-6">
          <div className="w-12 h-12 bg-terra-100 rounded-2xl flex items-center justify-center mb-4">
            <Mail size={22} className="text-terra-600" />
          </div>
          <h1 className="text-2xl font-bold text-ink mb-1">Welkom terug</h1>
          <p className="text-sm text-ink-muted">
            Vul je e-mailadres in. Je ontvangt een inloglink — geen wachtwoord nodig.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
              E-mailadres
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@organisatie.nl"
              autoFocus
              required
              className="w-full bg-cream border border-sand rounded-xl px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-300 transition placeholder-ink-muted/40"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Versturen...</>
            ) : (
              <>Stuur inloglink <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted mt-5">
          Nog geen account?{" "}
          <span className="text-ink font-medium">
            Je account wordt automatisch aangemaakt.
          </span>
        </p>
      </div>
    </div>
  );
}
