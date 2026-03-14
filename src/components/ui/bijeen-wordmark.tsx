/**
 * BijeenWordmark — logo met PNG icoon + tekstwoordmerk.
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
  sm: { height: 28, iconSize: 28, fontSize: 15, gap: 8  },
  md: { height: 42, iconSize: 42, fontSize: 18, gap: 10 },
  lg: { height: 52, iconSize: 52, fontSize: 22, gap: 12 },
};

export function BijeenWordmark({
  variant = "dark",
  size = "md",
  className,
}: BijeenWordmarkProps) {
  const { height, iconSize, fontSize, gap } = SIZES[size];
  const textColor = variant === "light" ? "#FFFFFF" : "#1C1814";

  return (
    <span
      className={`inline-flex items-center ${className ?? ""}`}
      style={{ gap, height }}
      aria-label="Bijeen"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Bijeen-logo-icon.png"
        alt=""
        width={iconSize}
        height={iconSize}
        style={{
          width: iconSize,
          height: iconSize,
          objectFit: "contain",
          filter: variant === "light" ? "brightness(0) invert(1)" : undefined,
        }}
      />
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
