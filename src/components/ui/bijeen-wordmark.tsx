/**
 * BijeenWordmark — inline SVG logo, geen PNG, geen witte box.
 * Adapteert automatisch aan lichte/donkere achtergrond.
 *
 * variant="light"  → wit woordmerk  (voor donkere sidebars/backgrounds)
 * variant="dark"   → ink woordmerk  (voor lichte backgrounds)
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
  const textColor = variant === "light" ? "#FFFFFF" : "#1C1814";
  const iconColor = "#C8522A";

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
      {/* Icon: twee overlappende cirkels (mensen/verbinding motief) */}
      <g>
        {/* Linker cirkel */}
        <circle cx="9"  cy="10" r="5" fill="none" stroke={iconColor} strokeWidth="2" />
        {/* Rechter cirkel */}
        <circle cx="19" cy="10" r="5" fill="none" stroke={iconColor} strokeWidth="2" />
        {/* Overlap punt */}
        <circle cx="14" cy="10" r="2" fill={iconColor} />
        {/* Schouder boog */}
        <path
          d="M2 22 Q14 17 26 22"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Woordmerk: "Bijeen" */}
      <text
        x="32"
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

/** Alleen het icoon, voor heel kleine formaten of favicon-gebruik */
export function BijeenIcon({ size = 24, className }: { size?: number; className?: string }) {
  const iconColor = "#C8522A";
  const scale = size / 28;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9"  cy="10" r="5.5" fill="none" stroke={iconColor} strokeWidth="2.2" />
      <circle cx="19" cy="10" r="5.5" fill="none" stroke={iconColor} strokeWidth="2.2" />
      <circle cx="14" cy="10" r="2.2" fill={iconColor} />
      <path
        d="M2 22 Q14 16.5 26 22"
        fill="none"
        stroke={iconColor}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
