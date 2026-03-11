/**
 * BijeenWordmark — inline SVG logo.
 * Gebruikt de exacte paden uit Bijeen-logo.png via een geneste SVG viewport.
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

// Originele paden uit het logo (viewBox 800×600)
// Bounding box figuren: x 55–745, y 85–510
const ICON_PATHS = (color: string) => (
  <>
    <path
      d="M70.5,491.5 C70.5,491.5 130,280 230,260 C210,230 195,190 205,155 C215,120 250,100 285,110 C320,120 340,155 330,190 C325,210 310,230 290,245 C350,250 420,330 455,491.5 L345,491.5 C345,491.5 280,360 215,491.5 L70.5,491.5 Z"
      fill={color}
    />
    <path
      d="M729.5,491.5 C729.5,491.5 670,280 570,260 C590,230 605,190 595,155 C585,120 550,100 515,110 C480,120 460,155 470,190 C475,210 490,230 510,245 C450,250 380,330 345,491.5 L455,491.5 C455,491.5 520,360 585,491.5 L729.5,491.5 Z"
      fill={color}
    />
  </>
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
        Geneste SVG: geeft de icon-paden hun eigen coördinatenstelsel.
        viewBox geeft exact het gedeelte van de originele 800×600 SVG
        dat de twee figuren bevat. preserveAspectRatio centreert + past aan.
      */}
      <svg
        x="0"
        y="0"
        width="42"
        height="30"
        viewBox="55 88 690 420"
        preserveAspectRatio="xMidYMid meet"
      >
        {ICON_PATHS(iconColor)}
      </svg>

      {/* Woordmerk */}
      <text
        x="47"
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
      viewBox="55 88 690 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS("#C8522A")}
    </svg>
  );
}
