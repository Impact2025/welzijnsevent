/**
 * De root layout (src/app/layout.tsx) hangt via `title.template` automatisch
 * " — Bijeen" achter elke pagina-title. Reken dat mee in Google's ~60-tekens
 * budget en voeg zelf GEEN merk-suffix meer toe — dat leidde eerder tot dubbele
 * branding in de rendered <title>, bijvoorbeeld "X | Bijeen — Bijeen".
 */
const TEMPLATE_SUFFIX_LENGTH = " — Bijeen".length;

export function truncateMetaTitle(title: string, maxLength = 60): string {
  // Strip een eventuele handmatige merk-suffix uit bestaande content/AI-output.
  const base = title.replace(/\s*[|—-]\s*Bijeen(\s+Kennisbank)?\s*$/i, "").trim();
  const budget = maxLength - TEMPLATE_SUFFIX_LENGTH;
  if (base.length <= budget) return base;
  return base.slice(0, budget).replace(/\s+\S*$/, "").trim();
}

/**
 * Google knipt meta descriptions af rond ~155-160 tekens.
 */
export function truncateMetaDescription(description: string, maxLength = 155): string {
  if (description.length <= maxLength) return description;
  const cut = description.slice(0, maxLength - 1).replace(/\s+\S*$/, "").trim();
  return `${cut}…`;
}
