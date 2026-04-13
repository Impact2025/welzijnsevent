/**
 * BijeenWordmark — inline SVG icoon + tekstwoordmerk.
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
  sm: { height: 28, iconSize: 22, fontSize: 15, gap: 7  },
  md: { height: 36, iconSize: 28, fontSize: 18, gap: 9  },
  lg: { height: 44, iconSize: 36, fontSize: 22, gap: 11 },
};

export function BijeenWordmark({
  variant = "dark",
  size = "md",
  className,
}: BijeenWordmarkProps) {
  const { height, iconSize, fontSize, gap } = SIZES[size];
  const color      = variant === "light" ? "#FFFFFF" : "#C8522A";
  const textColor  = variant === "light" ? "#FFFFFF" : "#1C1814";

  return (
    <span
      className={`inline-flex items-center ${className ?? ""}`}
      style={{ gap, height }}
      aria-label="Bijeen"
    >
      {/* Inline SVG — geen netwerk-request, altijd zichtbaar */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Linker persoon */}
        <circle cx="15" cy="16" r="7" stroke={color} strokeWidth="2.8" />
        {/* Rechter persoon */}
        <circle cx="29" cy="16" r="7" stroke={color} strokeWidth="2.8" />
        {/* Verbindingspunt in het midden */}
        <circle cx="22" cy="16" r="3" fill={color} />
        {/* Schouders — mensen samen */}
        <path
          d="M5 34 Q22 26 39 34"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
          fontWeight: 800,
          fontSize,
          color: textColor,
          letterSpacing: "-0.4px",
          lineHeight: 1,
        }}
      >
        Bijeen
      </span>
    </span>
  );
}

/** Alleen het icoon — voor favicon of kleine formaten */
export function BijeenIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/Bijeen-logo-icon.png"
      alt="Bijeen"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
    />
  );
}
