import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-terra-500 flex items-center justify-center shadow-lg shadow-terra-500/30">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-bold text-ink text-base tracking-tight">Bijeen</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
      <footer className="px-6 py-4 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} Bijeen — Evenementenplatform voor de welzijnssector
      </footer>
    </div>
  );
}
