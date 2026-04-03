export function OffsetDrawing({
  direction = "right",
  width = "",
  height = "",
  length = "",
  offset = "",
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
      <svg viewBox="0 0 180 120" className="w-full h-auto text-gray-800">
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

        <text x="20" y="16" fontSize="12" fill="currentColor">
          {label}
        </text>

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

        <text x="8" y="58" fontSize="11" fill="currentColor">
          H={height || "-"}
        </text>

        <text x="62" y="102" fontSize="11" fill="currentColor">
          L={length || "-"}
        </text>

        <text x="70" y="20" fontSize="11" fill="currentColor">
          O={offset || "-"}
        </text>

        <text x="118" y="76" fontSize="11" fill="currentColor">
          W={width || "-"}
        </text>
      </svg>
    </div>
  );
}

export function ElbowDrawing({
  bendType = "short",
  width = "",
  height = "",
  radius = "",
  angle = "90",
  className = "w-full max-w-sm",
}) {
  const isShort = bendType === "short";

  return (
    <div className={className}>
      <svg viewBox="0 0 220 170" className="w-full h-auto">
        <defs>
          <linearGradient id="frontFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d9dde7" />
            <stop offset="100%" stopColor="#bfc6d6" />
          </linearGradient>

          <linearGradient id="sideFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b93a7" />
            <stop offset="100%" stopColor="#5f677b" />
          </linearGradient>

          <linearGradient id="topFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c7ccda" />
            <stop offset="100%" stopColor="#9ea6ba" />
          </linearGradient>
        </defs>

        <text x="18" y="18" fontSize="12" fill="#374151">
          {isShort ? "Elbow - Short Way" : "Elbow - Long Way"}
        </text>

        <text x="165" y="24" fontSize="12" fill="#374151">
          {angle}°
        </text>

        {isShort ? (
          <>
            {/* top */}
            <path
              d="M35 58
                 Q95 14 158 56
                 L132 83
                 L74 74
                 L35 58 Z"
              fill="url(#topFace)"
              stroke="#374151"
              strokeWidth="1.5"
            />

            {/* left side */}
            <path
              d="M35 58
                 L74 75
                 L74 145
                 L35 130 Z"
              fill="url(#sideFace)"
              stroke="#374151"
              strokeWidth="1.5"
            />

            {/* center/front */}
            <path
              d="M74 74
                 L102 60
                 L102 130
                 L74 145 Z"
              fill="url(#frontFace)"
              stroke="#374151"
              strokeWidth="1.5"
            />

            {/* right side */}
            <path
              d="M132 73
                 L158 57
                 L158 123
                 L132 139 Z"
              fill="url(#sideFace)"
              stroke="#374151"
              strokeWidth="1.5"
            />

            {/* center inner */}
            <path
              d="M102 60
                 L132 73
                 L132 139
                 L102 130 Z"
              fill="url(#frontFace)"
              stroke="#374151"
              strokeWidth="1.5"
            />

            <text x="145" y="146" fontSize="16" fontWeight="700" fill="#b91c1c">
              {width || "-"}
            </text>

            <text x="163" y="93" fontSize="16" fontWeight="700" fill="#b91c1c">
              {height || "-"}
            </text>

            <text x="90" y="150" fontSize="14" fontWeight="600" fill="#b91c1c">
              {radius || "-"}
            </text>

          </>
        ) : (
          <>
            {/* top */}
            <path
              d="M0 74
                 Q100 18 200 72
                 L142 88
                 L106 78
                 L72 88 Z"
              fill="url(#topFace)"
              stroke="#374151"
              strokeWidth="1.5"
            />

            {/* left side */}
            <path
              d="M0 74
                 L72 88
                 L72 128
                 L0 114 Z"
              fill="url(#sideFace)"
              stroke="#374151"
              strokeWidth="1.5"
            />

            {/* middle front */}
            <path
              d="M72 88
                 L106 78
                 L106 118
                 L72 128 Z"
              fill="url(#frontFace)"
              stroke="#374151"
              strokeWidth="1.5"
            />

            {/* right side */}
            <path
              d="M142 88
                 L200 72
                 L200 112
                 L142 128 Z"
              fill="url(#sideFace)"
              stroke="#374151"
              strokeWidth="1.5"
            />

            {/* inner front */}
            <path
              d="M106 78
                 L142 88
                 L142 128
                 L106 118 Z"
              fill="url(#frontFace)"
              stroke="#374151"
              strokeWidth="1.5"
            />

            <text x="170" y="136" fontSize="16" fontWeight="700" fill="#b91c1c">
              {width || "-"}
            </text>

            <text x="210" y="93" fontSize="16" fontWeight="700" fill="#b91c1c">
              {height || "-"}
            </text>

            <text x="90" y="140" fontSize="14" fontWeight="600" fill="#b91c1c">
              {radius || "-"}
            </text>

          </>
        )}

        {/* labels */}

        <text x="16" y="150" fontSize="12" fill="#374151">
          {isShort ? "SW" : "LW"}
        </text>
      </svg>
    </div>
  );
}