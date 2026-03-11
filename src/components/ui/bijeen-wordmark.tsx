/**
 * BijeenWordmark — inline SVG logo, exact nagebootst naar Bijeen-logo.png.
 * Twee gevulde mensenfiguren (opgeheven armen) + woordmerk "Bijeen".
 *
 * variant="light"  → wit woordmerk  (donkere sidebar / dark backgrounds)
 * variant="dark"   → ink woordmerk  (lichte backgrounds)
 *
 * size: "sm" | "md" | "lg"
 */

interface BijeenWordmarkProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { width: 88,  height: 24 },
  md: { width: 108, height: 30 },
  lg: { width: 132, height: 36 },
};

export function BijeenWordmark({
  variant = "dark",
  size = "md",
  className,
}: BijeenWordmarkProps) {
  const { width, height } = SIZES[size];
  const textColor  = variant === "light" ? "#FFFFFF" : "#1C1814";
  const iconColor  = "#C8522A";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 108 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bijeen"
      role="img"
    >
      {/* ── Linker figuur ───────────────────────────────────── */}
      {/* Hoofd */}
      <circle cx="9" cy="6.5" r="3.2" fill={iconColor} />
      {/* Lichaam met opgeheven linker arm */}
      <path
        d="
          M 9 10.5
          C 7 9.5, 4.5 8.5, 2.5 7
          C 1 6, 0.5 7.5, 1 11
          C 1 16, 3 21, 5.5 25.5
          L 15 25.5
          C 13 21, 11.5 16, 9 10.5
          Z
        "
        fill={iconColor}
      />

      {/* ── Rechter figuur (spiegel) ─────────────────────────── */}
      {/* Hoofd */}
      <circle cx="21" cy="6.5" r="3.2" fill={iconColor} />
      {/* Lichaam met opgeheven rechter arm */}
      <path
        d="
          M 21 10.5
          C 23 9.5, 25.5 8.5, 27.5 7
          C 29 6, 29.5 7.5, 29 11
          C 29 16, 27 21, 24.5 25.5
          L 15 25.5
          C 17 21, 18.5 16, 21 10.5
          Z
        "
        fill={iconColor}
      />

      {/* ── Woordmerk ────────────────────────────────────────── */}
      <text
        x="35"
        y="22"
        fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif"
        fontWeight="800"
        fontSize="18"
        fill={textColor}
        letterSpacing="-0.4"
      >
        Bijeen
      </text>
    </svg>
  );
}

/** Alleen het icoon — voor kleine formaten of favicon-gebruik */
export function BijeenIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const iconColor = "#C8522A";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Linker figuur */}
      <circle cx="9" cy="6.5" r="3.2" fill={iconColor} />
      <path
        d="
          M 9 10.5
          C 7 9.5, 4.5 8.5, 2.5 7
          C 1 6, 0.5 7.5, 1 11
          C 1 16, 3 21, 5.5 25.5
          L 15 25.5
          C 13 21, 11.5 16, 9 10.5
          Z
        "
        fill={iconColor}
      />
      {/* Rechter figuur */}
      <circle cx="21" cy="6.5" r="3.2" fill={iconColor} />
      <path
        d="
          M 21 10.5
          C 23 9.5, 25.5 8.5, 27.5 7
          C 29 6, 29.5 7.5, 29 11
          C 29 16, 27 21, 24.5 25.5
          L 15 25.5
          C 17 21, 18.5 16, 21 10.5
          Z
        "
        fill={iconColor}
      />
    </svg>
  );
}
