import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-6 py-4">
        <Link href="/" className="inline-flex">
          <Image src="/Bijeen-logo.png" alt="Bijeen" width={110} height={34} className="h-9 w-auto" priority />
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
