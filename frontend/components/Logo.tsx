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

      <g className="logo-bounce">
        <path
          d="M24 3.5C15.4 3.5 8.5 10.2 8.5 18.6 8.5 26.9 24 44.5 24 44.5s15.5-17.6 15.5-25.9C39.5 10.2 32.6 3.5 24 3.5z"
          fill="url(#bek-logo-grad)"
        />

        <path
          d="M15.5 10.5c-1.9 2.1-2.9 4.8-2.9 7.8"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.55"
        />

        <circle className="logo-blush" cx="16" cy="23.5" r="2.7" fill="#fca5a5" opacity="0.9" />
        <circle className="logo-blush" cx="32" cy="23.5" r="2.7" fill="#fca5a5" opacity="0.9" />

        <path
          d="M18.5 25c1.6 2.4 5.4 2.4 7 0"
          stroke="white"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      </g>

      <g className="logo-wave">
        <path
          d="M31 22c1.4-0.4 2.6-1.2 3.6-2.3"
          stroke="#2563eb"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="36" cy="17.5" r="2.4" fill="white" />
        <path
          d="M37 13.5c0.9 1.1 1.5 2.4 1.8 3.8"
          stroke="#2563eb"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M39.2 16.2c0.4 1.5 0.5 3 0.4 4.5"
          stroke="#2563eb"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
      </g>
    </svg>
  );
}