import React from 'react';

interface PosterPlaceholderProps {
  title?: string;
  category?: string;
  version?: string;
  className?: string;
}

export function PosterPlaceholder({
  category = 'Research Paper',
  version = 'v1.0',
  className = '',
}: PosterPlaceholderProps) {
  return (
    <div
      className={`relative h-full w-full select-none overflow-hidden bg-[#0A0A0A] ${className}`}
      aria-hidden="true"
    >
      {/* Subtle Dark Carbon Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#181818] via-[#0D0D0D] to-[#060606]" />

      {/* High-Precision Architectural Schematic SVG */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="poster-arch-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.75"
              strokeOpacity="0.04"
            />
          </pattern>
          <linearGradient id="poster-wire-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Blueprint Grid Pattern */}
        <rect width="600" height="800" fill="url(#poster-arch-grid)" />

        {/* Outer Hairline Framing & Corner Registration Crosshairs */}
        <rect
          x="24"
          y="24"
          width="552"
          height="752"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.08"
          strokeWidth="1"
        />

        {/* Four Technical Crosshairs (+) */}
        <g stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1.2">
          <path d="M 24 16 L 24 32 M 16 24 L 32 24" />
          <path d="M 576 16 L 576 32 M 568 24 L 584 24" />
          <path d="M 24 768 L 24 784 M 16 776 L 32 776" />
          <path d="M 576 768 L 576 784 M 568 776 L 584 776" />
        </g>

        {/* Central Geometric Kinetic Ring & Vector Schematics */}
        <g transform="translate(300, 380)">
          {/* Subtle Outer Axis Lines */}
          <line x1="-220" y1="0" x2="220" y2="0" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="-220" x2="0" y2="220" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 3" />

          {/* Large Concentric Arcs */}
          <circle cx="0" cy="0" r="180" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="8 6" fill="none" />
          <circle cx="0" cy="0" r="130" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />
          <circle cx="0" cy="0" r="85" stroke="url(#poster-wire-grad)" strokeWidth="2" fill="#FFFFFF" fillOpacity="0.015" />

          {/* Isometric Diamond Grid */}
          <polygon
            points="0,-130 130,0 0,130 -130,0"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.14"
            strokeWidth="1.2"
          />
          <polygon
            points="0,-85 85,0 0,85 -85,0"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.22"
            strokeWidth="1.5"
          />

          {/* Core Rotor Nodes */}
          <circle cx="0" cy="0" r="8" fill="#FFFFFF" fillOpacity="0.8" />
          <circle cx="0" cy="-85" r="4" fill="#FFFFFF" fillOpacity="0.7" />
          <circle cx="85" cy="0" r="4" fill="#FFFFFF" fillOpacity="0.7" />
          <circle cx="0" cy="85" r="4" fill="#FFFFFF" fillOpacity="0.7" />
          <circle cx="-85" cy="0" r="4" fill="#FFFFFF" fillOpacity="0.7" />

          {/* Technical Diagonal Vectors */}
          <line x1="-90" y1="-90" x2="90" y2="90" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="-90" y1="90" x2="90" y2="-90" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
        </g>

        {/* Technical Header Monogram & Reference Coordinates */}
        <text
          x="44"
          y="56"
          fill="#FFFFFF"
          fillOpacity="0.65"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
          letterSpacing="0.18em"
        >
          0101 // ARCHIVE
        </text>

        <text
          x="556"
          y="56"
          textAnchor="end"
          fill="#FFFFFF"
          fillOpacity="0.5"
          fontFamily="monospace"
          fontSize="10"
          letterSpacing="0.12em"
        >
          SPEC: {version.toUpperCase()}
        </text>

        {/* Technical Sub-Stamp */}
        <text
          x="44"
          y="76"
          fill="#FFFFFF"
          fillOpacity="0.3"
          fontFamily="monospace"
          fontSize="9"
          letterSpacing="0.1em"
        >
          DISCIPLINE: {category.toUpperCase()}
        </text>

        <text
          x="556"
          y="76"
          textAnchor="end"
          fill="#FFFFFF"
          fillOpacity="0.3"
          fontFamily="monospace"
          fontSize="9"
          letterSpacing="0.1em"
        >
          SYS // 0x7F
        </text>
      </svg>
    </div>
  );
}
