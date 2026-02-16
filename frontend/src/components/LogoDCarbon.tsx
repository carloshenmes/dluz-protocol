export function LogoDCarbon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer coin ring */}
      <circle cx="32" cy="32" r="30" stroke="url(#carbonCoinGrad)" strokeWidth="3" fill="none" />
      <circle cx="32" cy="32" r="26" fill="url(#carbonBgGrad)" />
      <circle cx="32" cy="32" r="23" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />

      {/* Leaf stem */}
      <path
        d="M32 44 C32 44 32 28 32 28"
        stroke="url(#carbonLeafGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Main leaf */}
      <path
        d="M32 28 C24 28 20 22 20 16 C28 16 32 22 32 28Z"
        fill="url(#carbonLeafGrad)"
        opacity="0.9"
      />

      {/* Second leaf */}
      <path
        d="M32 34 C38 32 42 26 42 20 C36 22 32 28 32 34Z"
        fill="url(#carbonLeafGrad)"
        opacity="0.7"
      />

      {/* Leaf veins */}
      <path d="M32 28 C28 26 24 22 22 18" stroke="#064e3b" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M32 34 C36 30 40 26 41 22" stroke="#064e3b" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.5" />

      <defs>
        <linearGradient id="carbonCoinGrad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <radialGradient id="carbonBgGrad" cx="32" cy="32" r="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#022c22" />
        </radialGradient>
        <linearGradient id="carbonLeafGrad" x1="20" y1="16" x2="42" y2="44">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
    </svg>
  );
}
