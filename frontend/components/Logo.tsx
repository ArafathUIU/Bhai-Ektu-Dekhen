export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="bek-logo-grad"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#14b8a6" />
          <stop offset="0.5" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="42" height="42" rx="13" fill="url(#bek-logo-grad)" />
      <g className="logo-eye">
        <path
          d="M24 16.5c-7.2 0-12 5.6-12.6 6.7.6 1.1 5.4 6.7 12.6 6.7s12-5.6 12.6-6.7c-.6-1.1-5.4-6.7-12.6-6.7z"
          stroke="white"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
      </g>
      <path
        className="logo-pupil"
        d="M24 21.3c-1.5 0-2.7 1.1-2.7 2.5 0 1.45 2.7 4.5 2.7 4.5s2.7-3.05 2.7-4.5c0-1.4-1.2-2.5-2.7-2.5z"
        fill="white"
      />
    </svg>
  );
}