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

      <path
        d="M24 3.5C15.4 3.5 8.5 10.2 8.5 18.6 8.5 26.9 24 44.5 24 44.5s15.5-17.6 15.5-25.9C39.5 10.2 32.6 3.5 24 3.5z"
        fill="url(#bek-logo-grad)"
      />

      <path
        d="M13.5 11.5c3.2-1.9 6.8-2.9 10.5-2.9s7.3 1 10.5 2.9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />

      <g className="logo-eye">
        <path
          d="M24 14.5c-6.6 0-11 5.1-11.6 6.1.6 1 5 6.1 11.6 6.1s11-5.1 11.6-6.1c-.6-1-5-6.1-11.6-6.1z"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      <g className="logo-pupil">
        <circle cx="24" cy="21" r="3.1" fill="white" />
        <circle cx="25.1" cy="19.9" r="0.9" fill="#0d9488" />
      </g>
    </svg>
  );
}