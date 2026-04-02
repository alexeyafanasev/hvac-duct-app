export function OffsetDrawing({
  direction = "right",
  className = "w-full max-w-xs",
}) {
  const topPath = {
    right: "M20 40 H70 L105 25 H140",
    left: "M20 25 H55 L90 40 H140",
    up: "M20 55 H65 L95 25 H140",
    down: "M20 25 H65 L95 55 H140",
  }[direction];

  const bottomPath = {
    right: "M20 70 H70 L105 55 H140",
    left: "M20 55 H55 L90 70 H140",
    up: "M20 85 H65 L95 55 H140",
    down: "M20 55 H65 L95 85 H140",
  }[direction];

  const arrow = {
    right: { x1: 78, y1: 48, x2: 102, y2: 48 },
    left: { x1: 102, y1: 48, x2: 78, y2: 48 },
    up: { x1: 80, y1: 58, x2: 80, y2: 30 },
    down: { x1: 80, y1: 30, x2: 80, y2: 58 },
  }[direction];

  const label = {
    right: "Offset Right",
    left: "Offset Left",
    up: "Offset Up",
    down: "Offset Down",
  }[direction];

  return (
    <div className={className}>
      <svg viewBox="0 0 160 110" className="w-full h-auto text-gray-800">
        <defs>
          <marker
            id={`arrow-${direction}`}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
          </marker>
        </defs>

        <path
          d={topPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={bottomPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <line
          x1={arrow.x1}
          y1={arrow.y1}
          x2={arrow.x2}
          y2={arrow.y2}
          stroke="currentColor"
          strokeWidth="2.5"
          markerEnd={`url(#arrow-${direction})`}
          opacity="0.9"
        />

        <text x="20" y="18" fontSize="12" fill="currentColor">
          {label}
        </text>

        <text x="8" y="58" fontSize="11" fill="currentColor">
          H
        </text>
        <text x="72" y="18" fontSize="11" fill="currentColor">
          O
        </text>
        <text x="122" y="18" fontSize="11" fill="currentColor">
          L
        </text>
      </svg>
    </div>
  );
}

export function ElbowDrawing({
  bendType = "short",
  className = "w-full max-w-xs",
}) {
  const isShort = bendType === "short";

  return (
    <div className={className}>
      <svg viewBox="0 0 160 120" className="w-full h-auto text-gray-800">
        <text x="20" y="18" fontSize="12" fill="currentColor">
          {isShort ? "Elbow - Short Way" : "Elbow - Long Way"}
        </text>

        {isShort ? (
          <>
            <path
              d="M25 30 H95 V50 H45 V100 H25 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M45 30 H115 V70 H65 V100"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinejoin="round"
              opacity="0.65"
            />
            <text x="102" y="62" fontSize="11" fill="currentColor">
              SW
            </text>
          </>
        ) : (
          <>
            <path
              d="M25 30 H110 V45 H60 V100 H25 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M40 30 H125 V60 H75 V100"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinejoin="round"
              opacity="0.65"
            />
            <text x="110" y="58" fontSize="11" fill="currentColor">
              LW
            </text>
          </>
        )}

        <path
          d="M112 26 A22 22 0 0 1 134 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.8"
        />
        <text x="126" y="24" fontSize="11" fill="currentColor">
          90°
        </text>

        <text x="12" y="68" fontSize="11" fill="currentColor">
          H
        </text>
        <text x="62" y="112" fontSize="11" fill="currentColor">
          W
        </text>
      </svg>
    </div>
  );
}