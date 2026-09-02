import React from 'react';

/**
 * WSIB (Workplace Safety and Insurance Board) Vector Shield Emblem.
 * Completely transparent background, mathematical vector curves, pixel-perfect at all display scales.
 */
export const WsibLogo: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5',
  size
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="WSIB Logo"
    >
      {/* Top Green Shield Band */}
      <path
        d="M6.5 39.8C10.8 28.5 24.2 11.2 55.4 8.2C72.2 6.6 84.8 11.1 91.5 14.5C92.2 17.5 91.8 21.8 91.2 23.8C81.2 20.8 62.4 19.8 45.1 22.8C25.8 26.2 12.8 34.2 6.5 39.8Z"
        fill="#74BF36"
      />
      {/* Middle Teal/Cyan Shield Band */}
      <path
        d="M1.5 66.8C7.2 57.5 24.6 39.2 58.2 30.5C76.8 25.7 89.2 28.1 98.8 32.2C99.2 34.5 99.5 37.8 98.2 40.5C83.5 37.8 61.2 39.8 40.8 48.2C22.4 55.8 10.5 64.8 1.5 66.8Z"
        fill="#00B5CB"
      />
      {/* Bottom Blue Shield Blade / Lower Arc */}
      <path
        d="M29.5 78.5C36.8 68.2 55.4 56.5 85.5 48.2C85.8 50.8 84.8 54.5 82.2 58.5C71.8 74.2 56.5 87.8 47.8 92.5C40.8 90.2 34.2 84.5 29.5 78.5Z"
        fill="#0080C8"
      />
    </svg>
  );
};

/**
 * Official Ontario Trillium Black Circular Badge.
 * Exact match to the official Government of Ontario / Business Registry emblem.
 * Solid dark circular canvas with crisp white 3-petal interlocking trillium flower.
 */
export const OntarioTrilliumLogo: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = 'w-5 h-5', size }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Ontario Business Registry Logo"
    >
      {/* Outer Solid Dark Circular Badge */}
      <circle cx="50" cy="50" r="48" fill="#1B2126" />

      {/* High-Precision 3-Fold Symmetric Ontario Trillium */}
      <g fill="#FFFFFF">
        {/* Central Pinwheel Swirl Core */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M50 49C47.2 49 45 46.8 45 44C45 41.2 47.2 39 50 39C52.8 39 55 41.2 55 44C55 46.8 52.8 49 50 49Z"
          fill="#1B2126"
        />
        
        {/* Bottom Petal */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M50 85C42.5 76 35 63.5 37.5 49.5C40.5 53 45.2 55 50 55C54.8 55 59.5 53 62.5 49.5C65 63.5 57.5 76 50 85ZM50 76C54.2 68.5 58 59.5 56.5 53.5C54.5 54.8 52.2 55.5 50 55.5C47.8 55.5 45.5 54.8 43.5 53.5C42 59.5 45.8 68.5 50 76Z"
        />

        {/* Top-Right Petal (Rotated 120deg) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M50 85C42.5 76 35 63.5 37.5 49.5C40.5 53 45.2 55 50 55C54.8 55 59.5 53 62.5 49.5C65 63.5 57.5 76 50 85ZM50 76C54.2 68.5 58 59.5 56.5 53.5C54.5 54.8 52.2 55.5 50 55.5C47.8 55.5 45.5 54.8 43.5 53.5C42 59.5 45.8 68.5 50 76Z"
          transform="rotate(120 50 48)"
        />

        {/* Top-Left Petal (Rotated 240deg) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M50 85C42.5 76 35 63.5 37.5 49.5C40.5 53 45.2 55 50 55C54.8 55 59.5 53 62.5 49.5C65 63.5 57.5 76 50 85ZM50 76C54.2 68.5 58 59.5 56.5 53.5C54.5 54.8 52.2 55.5 50 55.5C47.8 55.5 45.5 54.8 43.5 53.5C42 59.5 45.8 68.5 50 76Z"
          transform="rotate(240 50 48)"
        />

        {/* Interlocking Central Spirals / Pinwheel Blades */}
        <path
          d="M50 48C46 44 42 45 38 49C40 43 45 40 50 40C55 40 60 43 62 49C58 45 54 44 50 48Z"
          fill="#FFFFFF"
        />
        <path
          d="M50 48C46 44 42 45 38 49C40 43 45 40 50 40C55 40 60 43 62 49C58 45 54 44 50 48Z"
          transform="rotate(120 50 48)"
          fill="#FFFFFF"
        />
        <path
          d="M50 48C46 44 42 45 38 49C40 43 45 40 50 40C55 40 60 43 62 49C58 45 54 44 50 48Z"
          transform="rotate(240 50 48)"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
};

