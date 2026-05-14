"use client";

import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";

interface CommunityBannerProps {
  eventsUsed: number;
  eventsMax: number;
}

export function CommunityBanner({ eventsUsed, eventsMax }: CommunityBannerProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
      <div className="mb-5 bg-gradient-to-r from-terra-50 to-amber-50 border border-terra-200/60 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-terra-100 flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-terra-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-terra-800">
            Gratis plan · {eventsUsed}/{eventsMax} events gebruikt
          </p>
          <p className="text-xs text-terra-600/80 mt-0.5">
            Meer events, AI-netwerkkoppeling en eigen branding? Ontdek de betaalde plannen.
          </p>
        </div>
        <button
          onClick={() => setUpgradeOpen(true)}
          className="shrink-0 flex items-center gap-1.5 bg-terra-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-terra-600 transition-colors group"
        >
          Upgrade
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
      />
    </>
  );
}
