import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-terra-500 mb-2">404</p>
        <h1 className="text-2xl font-bold text-ink mb-3">Pagina niet gevonden</h1>
        <p className="text-ink/60 mb-8">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 bg-terra-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-terra-600 transition-colors"
          >
            <Home size={15} />
            Naar homepage
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-white text-ink font-semibold px-5 py-2.5 rounded-xl text-sm border border-ink/10 hover:bg-sand transition-colors"
          >
            <Search size={15} />
            Naar dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
