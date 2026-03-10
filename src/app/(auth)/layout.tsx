import Link from "next/link";
import { BijeenWordmark } from "@/components/ui/bijeen-wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-6 py-4">
        <Link href="/" className="inline-flex items-center px-1 py-1">
          <BijeenWordmark variant="dark" size="md" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
      <footer className="px-6 py-4 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} Bijeen — Van aanmelding tot impact, alles bijeen!
      </footer>
    </div>
  );
}
