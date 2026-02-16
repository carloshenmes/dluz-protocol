export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer coin ring */}
      <circle cx="32" cy="32" r="30" stroke="url(#coinGrad)" strokeWidth="3" fill="none" />
      <circle cx="32" cy="32" r="26" fill="url(#bgGrad)" />

      {/* Inner ridge (coin detail) */}
      <circle cx="32" cy="32" r="23" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />

      {/* Sun body */}
      <circle cx="32" cy="32" r="9" fill="url(#sunGrad)" />

      {/* Sun rays — 8 simple lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 32 + 12 * Math.cos(rad);
        const y1 = 32 + 12 * Math.sin(rad);
        const x2 = 32 + 17 * Math.cos(rad);
        const y2 = 32 + 17 * Math.sin(rad);
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#rayGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}

      <defs>
        <linearGradient id="coinGrad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <radialGradient id="bgGrad" cx="32" cy="32" r="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#022c22" />
        </radialGradient>
        <radialGradient id="sunGrad" cx="32" cy="32" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <linearGradient id="rayGrad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
    </svg>
  );
}
