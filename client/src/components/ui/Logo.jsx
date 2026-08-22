export default function Logo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {/* Background Rounded Square */}
      <rect width="100" height="100" rx="22" fill="#2563EB" />
      
      {/* Left Bracket - Solid White */}
      <path
        d="M44 34H28V66H44V59.5H34.5V40.5H44V34Z"
        fill="#FFFFFF"
      />
      
      {/* Right Bracket - Translucent Accent */}
      <path
        d="M56 34H72V66H56V59.5H65.5V40.5H56V34Z"
        fill="#A5C4FF"
      />
      
      {/* Center Pill */}
      <rect
        x="38"
        y="46.5"
        width="24"
        height="7"
        rx="3.5"
        fill="#FFFFFF"
      />
    </svg>
  );
}
