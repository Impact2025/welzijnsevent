import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Bijeen",
  description: "Veelgestelde vragen over Bijeen: prijzen, AVG, functies, support en meer. Alles wat je wilt weten over het eventplatform voor de welzijnssector.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
