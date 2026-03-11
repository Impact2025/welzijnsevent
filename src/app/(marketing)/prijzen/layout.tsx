import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prijzen — Bijeen",
  description: "Transparante prijzen voor eventplatform Bijeen. Betaal per event of kies een voordelig jaarabonnement.",
};

export default function PrijzenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
