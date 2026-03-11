/**
 * BijeenWordmark — inline SVG logo.
 * Twee overlappende mensenfiguren (cirkelhoofd + lichaam met been-uitsparing).
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

// Originele paden (uit het aangeleverde 400×300 ontwerp)
const ICON_PATHS = (color: string) => (
  <g fill={color}>
    {/* Linker figuur */}
    <circle cx="145" cy="115" r="28" />
    <path d="M145,145 C110,145 75,185 75,260 L135,260 C135,235 155,235 155,260 L215,260 C215,185 180,145 145,145 Z" />

    {/* Rechter figuur */}
    <circle cx="215" cy="115" r="28" />
    <path d="M215,145 C180,145 145,185 145,260 L205,260 C205,235 225,235 225,260 L285,260 C285,185 250,145 215,145 Z" />
  </g>
);

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
      {/*
        Geneste SVG: viewBox crop op de twee figuren (x70–290, y85–265).
        preserveAspectRatio centreert + past proportioneel aan.
      */}
      <svg
        x="0"
        y="0"
        width="40"
        height="30"
        viewBox="68 82 225 185"
        preserveAspectRatio="xMidYMid meet"
      >
        {ICON_PATHS(iconColor)}
      </svg>

      {/* Woordmerk */}
      <text
        x="45"
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

/** Alleen het icoon — voor favicon of kleine formaten */
export function BijeenIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="68 82 225 185"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS("#C8522A")}
    </svg>
  );
}
