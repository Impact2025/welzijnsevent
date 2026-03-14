import Link from "next/link";
import { BijeenWordmark } from "@/components/ui/bijeen-wordmark";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <header className="px-6 py-4 border-b border-[#F0E8DC]">
        <Link href="/">
          <BijeenWordmark variant="dark" size="md" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg border border-[#F0E8DC] p-8 text-center">
            <div className="w-14 h-14 bg-[#FFF0EA] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              📬
            </div>
            <h2 className="text-xl font-bold text-[#1C1814] mb-2">Check je inbox</h2>
            <p className="text-sm text-[#6B6560] leading-relaxed">
              We hebben een inloglink naar je e-mailadres gestuurd.
              Klik op de link om in te loggen bij Bijeen.
            </p>
            <p className="text-xs text-[#9E9890] mt-4">
              De link is 15 minuten geldig.
            </p>
          </div>
        </div>
      </main>
      <footer className="px-6 py-4 text-center text-xs text-[#B8B3AC]">
        © {new Date().getFullYear()} Bijeen — Van aanmelding tot impact, alles bijeen!
      </footer>
    </div>
  );
}
