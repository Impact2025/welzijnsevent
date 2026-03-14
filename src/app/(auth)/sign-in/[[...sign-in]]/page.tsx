"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, Loader2, Lock, Shield, Check, CalendarDays, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import { BijeenWordmark } from "@/components/ui/bijeen-wordmark";

const ADMIN_EMAIL = "hello@bijeen.app";

const BENEFITS = [
  {
    icon: CalendarDays,
    title: "Events in minuten live",
    desc: "Aanmeldpagina, QR check-in en e-mailbevestigingen — zonder technische kennis.",
  },
  {
    icon: Users,
    title: "AI-netwerkmatching",
    desc: "Deelnemers ontmoeten de juiste mensen op basis van hun profiel en interesses.",
  },
  {
    icon: BarChart3,
    title: "WMO-verantwoording klaar",
    desc: "Eén klik exporteert de rapportage die jouw gemeente of subsidiegever nodig heeft.",
  },
];

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const isNew = searchParams.get("new") === "true";

  const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    if (isAdmin) {
      const result = await signIn("admin-credentials", {
        email: email.trim(),
        password,
        callbackUrl,
        redirect: false,
      });
      setLoading(false);
      if (result?.error || !result?.ok) {
        setError("Onjuist wachtwoord. Probeer opnieuw.");
      } else {
        router.push(callbackUrl);
      }
    } else {
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
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1E3D29] flex-col justify-between px-12 py-10">

        {/* Logo */}
        <div>
          <BijeenWordmark variant="light" size="md" />
        </div>

        {/* Center content */}
        <div>
          <p className="text-[11px] font-bold text-green-400 uppercase tracking-widest mb-4">
            Evenementenplatform voor de welzijnssector
          </p>
          <h2 className="text-[2.1rem] font-extrabold text-white leading-tight tracking-tight mb-4">
            Meer impact,<br />minder werk.
          </h2>
          <p className="text-green-200 text-base leading-relaxed mb-10 max-w-xs">
            Van aanmelding tot WMO-rapportage — Bijeen regelt het, zodat jij je kunt focussen op de mensen.
          </p>

          <div className="space-y-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-green-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
                  <p className="text-green-300 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="border-t border-white/10 pt-6">
          <div className="bg-white/8 rounded-xl p-4">
            <p className="text-green-100 text-xs leading-relaxed italic mb-2">
              &ldquo;Eindelijk een tool die begrijpt hoe wij werken. Alles op één plek — van aanmelding tot rapportage.&rdquo;
            </p>
            <p className="text-green-400 text-[11px] font-semibold">— Vincent, oprichter Bijeen</p>
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="flex-1 bg-[#FAF6F0] flex flex-col">

        {/* Mobile header */}
        <header className="lg:hidden px-6 py-4 border-b border-[#F0E8DC]">
          <Link href="/">
            <BijeenWordmark variant="dark" size="md" />
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">

            {sent ? (
              /* ── Sent state ── */
              <div className="bg-white rounded-2xl shadow-lg border border-[#F0E8DC] p-8 text-center">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-[#1C1814] mb-2">Check je inbox</h2>
                <p className="text-sm text-[#6B6560] leading-relaxed mb-1">
                  We hebben een inloglink verstuurd naar
                </p>
                <p className="text-sm font-semibold text-[#1C1814] mb-5">{email}</p>
                <p className="text-xs text-[#9E9890]">
                  Geen mail?{" "}
                  <button
                    onClick={() => setSent(false)}
                    className="text-[#C8522A] font-semibold hover:underline"
                  >
                    Opnieuw versturen
                  </button>
                </p>
              </div>
            ) : (
              /* ── Form ── */
              <div>
                <div className="mb-7">
                  <div className="w-12 h-12 bg-[#FFF0EA] rounded-2xl flex items-center justify-center mb-4">
                    {isAdmin
                      ? <Shield size={22} className="text-[#C8522A]" />
                      : <Mail size={22} className="text-[#C8522A]" />
                    }
                  </div>
                  <h1 className="text-2xl font-bold text-[#1C1814] mb-1">
                    {isNew ? "Welkom bij Bijeen" : "Welkom terug"}
                  </h1>
                  <p className="text-sm text-[#6B6560]">
                    {isAdmin
                      ? "Admin account — vul je wachtwoord in."
                      : "Vul je e-mailadres in. Je ontvangt een inloglink — geen wachtwoord nodig."
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#9E9890] uppercase tracking-wider mb-2">
                      E-mailadres
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="jij@organisatie.nl"
                      autoFocus
                      required
                      className="w-full bg-white border border-[#F0E8DC] rounded-xl px-4 py-3 text-sm text-[#1C1814] outline-none focus:ring-2 focus:ring-[#C8522A]/20 focus:border-[#C8522A]/40 transition placeholder-[#9E9890]/60"
                    />
                  </div>

                  {isAdmin && (
                    <div>
                      <label className="block text-xs font-bold text-[#9E9890] uppercase tracking-wider mb-2">
                        Wachtwoord
                      </label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9890]" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setError(""); }}
                          placeholder="••••••••"
                          required={isAdmin}
                          autoComplete="current-password"
                          className="w-full bg-white border border-[#F0E8DC] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1C1814] outline-none focus:ring-2 focus:ring-[#C8522A]/20 focus:border-[#C8522A]/40 transition placeholder-[#9E9890]/60"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email.trim() || (isAdmin && !password)}
                    className="w-full flex items-center justify-center gap-2 bg-[#C8522A] hover:bg-[#B04624] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Even wachten…</>
                    ) : isAdmin ? (
                      <>Inloggen als admin <ArrowRight size={16} /></>
                    ) : (
                      <>Stuur inloglink <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>

                {!isAdmin && (
                  <p className="text-center text-xs text-[#9E9890] mt-5">
                    Nog geen account?{" "}
                    <span className="text-[#1C1814] font-medium">
                      Wordt automatisch aangemaakt.
                    </span>
                  </p>
                )}

                {!isAdmin && (
                  <div className="mt-6 pt-5 border-t border-[#F0E8DC] text-center">
                    <p className="text-xs text-[#9E9890] mb-1.5">Liever eerst kennismaken?</p>
                    <a
                      href="mailto:hello@bijeen.app?subject=Demo aanvragen"
                      className="text-sm font-semibold text-[#C8522A] hover:underline"
                    >
                      Plan een gratis demo →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="px-6 py-4 text-center text-xs text-[#B8B3AC]">
          © {new Date().getFullYear()} Bijeen &mdash; Van aanmelding tot impact, alles bijeen!
        </footer>
      </div>
    </div>
  );
}
