"use client";

import { useState } from "react";
import { Code2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  slug: string;
}

export function EmbedSnippet({ slug }: Props) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

  const snippet = `<iframe
  src="${appUrl}/e/${slug}/embed"
  width="100%"
  height="520"
  frameborder="0"
  style="border-radius:16px;border:1px solid #e5e7eb;"
  title="Aanmelden voor evenement"
></iframe>
<script>
  window.addEventListener('message', function(e) {
    if (e.data?.type === 'bijeen-embed-height') {
      document.querySelector('iframe[src*="${slug}/embed"]').height = e.data.height + 24;
    }
  });
</script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-base overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-5 py-3 border-b border-sand bg-sand/30 hover:bg-sand/50 transition-colors"
      >
        <Code2 size={16} className="text-terra-500" />
        <h2 className="font-bold text-ink text-sm">Embed widget</h2>
        <span className="ml-2 text-[10px] font-bold text-terra-600 bg-terra-100 px-2 py-0.5 rounded-full">
          NIEUW
        </span>
        <span className="ml-auto text-ink-muted">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {open && (
        <div className="p-5 space-y-3">
          <p className="text-xs text-ink-muted leading-relaxed">
            Embed het aanmeldformulier op je eigen website. Kopieer onderstaande code en plak hem in de HTML van je pagina.
          </p>

          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-[11px] leading-relaxed overflow-x-auto font-mono whitespace-pre-wrap break-all">
              {snippet}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <><Check size={11} /> Gekopieerd!</> : <><Copy size={11} /> Kopieer</>}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-800 mb-0.5">Preview</p>
            <p className="text-xs text-blue-700">
              Bekijk hoe het formulier eruitziet:{" "}
              <a
                href={`/e/${slug}/embed`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                /e/{slug}/embed ↗
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
