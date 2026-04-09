"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, KeyRound } from "lucide-react";
import { BijeenWordmark } from "@/components/ui/bijeen-wordmark";

export default function DemoLoginPage() {
  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    const result = await signIn("demo-code", {
      code: code.trim(),
      callbackUrl: "/dashboard",
      redirect: false,
    });

    setLoading(false);
    if (result?.error || !result?.ok) {
      setError("Ongeldige of verlopen code. Neem contact op met de afzender.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <BijeenWordmark variant="dark" size="md" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-[#F0E8DC] p-8">
          <div className="w-12 h-12 bg-[#FFF0EA] rounded-2xl flex items-center justify-center mb-5">
            <KeyRound size={22} className="text-[#C8522A]" />
          </div>

          <h1 className="text-xl font-bold text-[#1C1814] mb-1">Demo toegang</h1>
          <p className="text-sm text-[#6B6560] mb-6">
            Voer de code in die je hebt ontvangen om de demo te bekijken.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
              placeholder="BIJEEN-DEMO"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-[#FAF6F0] border border-[#F0E8DC] rounded-xl px-4 py-3 text-sm text-[#1C1814] outline-none focus:ring-2 focus:ring-[#C8522A]/20 focus:border-[#C8522A]/40 transition placeholder-[#9E9890]/60 font-mono tracking-widest text-center uppercase"
            />

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#C8522A] hover:bg-[#B04624] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : <><ArrowRight size={16} /> Bekijk demo</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#B8B3AC] mt-6">
          © {new Date().getFullYear()} Bijeen
        </p>
      </div>
    </div>
  );
}
