export function LogoDEnergy({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer coin ring */}
      <circle cx="32" cy="32" r="30" stroke="url(#energyCoinGrad)" strokeWidth="3" fill="none" />
      <circle cx="32" cy="32" r="26" fill="url(#energyBgGrad)" />
      <circle cx="32" cy="32" r="23" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />

      {/* Lightning bolt */}
      <path
        d="M35 14 L25 32 L31 32 L29 50 L39 30 L33 30 Z"
        fill="url(#energyBoltGrad)"
      />

      {/* Bolt highlight */}
      <path
        d="M34 16 L26 31 L31 31 L29.5 46 L37 31.5 L33 31.5 Z"
        fill="url(#energyBoltHighlight)"
        opacity="0.4"
      />

      <defs>
        <linearGradient id="energyCoinGrad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <radialGradient id="energyBgGrad" cx="32" cy="32" r="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0c1929" />
        </radialGradient>
        <linearGradient id="energyBoltGrad" x1="25" y1="14" x2="39" y2="50">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="energyBoltHighlight" x1="26" y1="16" x2="37" y2="46">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
      </defs>
    </svg>
  );
}
