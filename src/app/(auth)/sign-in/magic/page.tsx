"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BijeenWordmark } from "@/components/ui/bijeen-wordmark";
import { LogIn } from "lucide-react";

function MagicLinkButton() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const href = `/api/auth/callback/resend?${new URLSearchParams({ token, email, callbackUrl })}`;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#F0E8DC] p-8 text-center">
      <div className="w-14 h-14 bg-[#FFF0EA] rounded-2xl flex items-center justify-center mx-auto mb-5">
        <LogIn size={24} className="text-[#C8522A]" />
      </div>
      <h2 className="text-xl font-bold text-[#1C1814] mb-2">Je inloglink is klaar</h2>
      <p className="text-sm text-[#6B6560] leading-relaxed mb-6">
        Klik op de knop hieronder om in te loggen bij Bijeen.
        Deze link is eenmalig en 15 minuten geldig.
      </p>
      <a
        href={href}
        className="inline-flex items-center justify-center gap-2 w-full bg-[#C8522A] hover:bg-[#B04624] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
      >
        Inloggen bij Bijeen →
      </a>
      <p className="text-xs text-[#9E9890] mt-5">
        Heb je dit niet aangevraagd?{" "}
        <Link href="/sign-in" className="text-[#C8522A] hover:underline">
          Negeer deze mail.
        </Link>
      </p>
    </div>
  );
}

export default function MagicLinkPage() {
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
            <MagicLinkButton />
          </Suspense>
        </div>
      </main>
      <footer className="px-6 py-4 text-center text-xs text-[#B8B3AC]">
        © {new Date().getFullYear()} Bijeen — Van aanmelding tot impact, alles bijeen!
      </footer>
    </div>
  );
}
