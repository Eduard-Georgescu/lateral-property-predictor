interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * LatERAL geometric mark — a stylized lattice-cell intersected by a
 * directional vector. Pure SVG, themed via design tokens.
 */
export const BrandMark = ({ size = 32, className }: BrandMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    className={className}
  >
    <defs>
      <linearGradient id="brand-grad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--accent))" />
      </linearGradient>
    </defs>
    {/* Cube wireframe */}
    <path
      d="M8 12 L20 6 L32 12 L32 26 L20 32 L8 26 Z"
      stroke="url(#brand-grad)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M8 12 L20 18 L32 12 M20 18 L20 32"
      stroke="url(#brand-grad)"
      strokeWidth="1.5"
      strokeLinejoin="round"
      opacity="0.7"
    />
    {/* Diagonal vector */}
    <path
      d="M6 34 L34 8"
      stroke="hsl(var(--primary-glow))"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeDasharray="2 3"
      opacity="0.9"
    />
    {/* Atom */}
    <circle cx="20" cy="18" r="2" fill="hsl(var(--accent))" />
  </svg>
);
