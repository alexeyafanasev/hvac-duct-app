export function OffsetDrawing({
  direction = "right",
  width = "",
  height = "",
  length = "",
  offset = "",
  className = "w-full max-w-sm",
}) {
  const drawings = {
    right: {
      title: "Offset Right",
      top: `
        M1 68
        Q30 55 90 56
        Q130 55 143 50
        L200 50
        Q185 70 115 68
        Q80 65 64 70
        Z
      `,
      leftFace: `
        M1 68
        L64 70
        L64 112
        L1 110
        Z
      `,
      centerFace: `
        M200 50
        Q185 70 115 68
        Q80 65 64 70
        L64 70
        L64 112
        Q65 100 140 105
        Q180 105 200 82
        Z
      `,
      offsetLines: `
        M35 135
        L65 111
        Z
        M145 135
        L200 83
        Z
      `,
      lengthLines: `
        M65 110
        L220 110
        Z
        M200 83
        L230 83
        Z
      `,
      wPos: { x: 25, y: 85 },
      hPos: { x: 67, y: 92 },
      lPos: { x: 200, y: 102 },
      oPos: { x: 94, y: 133 },
      dirPos: { x: 18, y: 150 },
    },

    left: {
      title: "Offset Left",
      top: `
        M70 50
        Q80 56 100 57
        Q208 56 218 70
        L155 73
        Q155 70 75 70
        Q40 68 21 50
        Z
      `,
      leftFace: `
        M218 70
        L155 73
        L155 112
        L218 109
        Z
      `,
      centerFace: `
        M155 73
        Q155 70 75 70
        Q40 68 21 50
        L21 50
        L21 80
        Q40 100 90 99
        Q148 100 155 112
        Z
      `,
      offsetLines: `
        M21 80
        L75 141
        Z
        M155 112
        L190 141
        Z
      `,
      lengthLines: `
        M0 112
        L155 112
        Z
        M0 80
        L21 80
        Z
      `,
      wPos: { x: 176, y: 86 },
      hPos: { x: 135, y: 96 },
      lPos: { x: 4, y: 102 },
      oPos: { x: 119, y: 140 },
      dirPos: { x: 18, y: 250 },
    },

    up: {
      title: "Offset Up",
      top: `
        M26 82
        L82 82
        L110 42
        L166 42
        L188 54
        L132 54
        L104 94
        L48 94
        Z
      `,
      leftFace: `
        M26 82
        L48 94
        L48 126
        L26 114
        Z
      `,
      centerFace: `
        M82 82
        L104 94
        L104 126
        L82 114
        Z
      `,
      rightFace: `
        M166 42
        L188 54
        L188 86
        L166 74
        Z
      `,
      connectorFace: `
        M110 42
        L132 54
        L132 86
        L110 74
        Z
      `,
      wPos: { x: 148, y: 36 },
      hPos: { x: 8, y: 106 },
      lPos: { x: 78, y: 144 },
      oPos: { x: 92, y: 22 },
      dirPos: { x: 18, y: 150 },
    },

    down: {
      title: "Offset Down",
      top: `
        M28 42
        L84 42
        L112 82
        L168 82
        L190 94
        L134 94
        L106 54
        L50 54
        Z
      `,
      leftFace: `
        M28 42
        L50 54
        L50 86
        L28 74
        Z
      `,
      centerFace: `
        M84 42
        L106 54
        L106 86
        L84 74
        Z
      `,
      rightFace: `
        M168 82
        L190 94
        L190 126
        L168 114
        Z
      `,
      connectorFace: `
        M112 82
        L134 94
        L134 126
        L112 114
        Z
      `,
      wPos: { x: 148, y: 76 },
      hPos: { x: 8, y: 66 },
      lPos: { x: 78, y: 144 },
      oPos: { x: 94, y: 24 },
      dirPos: { x: 18, y: 150 },
    },
  };

  const d = drawings[direction] || drawings.right;

  return (
    <div className={className}>
      <svg viewBox="0 0 220 160" className="w-full h-auto">
        <defs>
          <linearGradient id={`offset-front-${direction}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#747987" />
            <stop offset="100%" stopColor="#dadee6" />
          </linearGradient>

          <linearGradient id={`offset-side-${direction}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8790a4" />
            <stop offset="100%" stopColor="#5e6679" />
          </linearGradient>

          <linearGradient id={`offset-top-${direction}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7e8695" />
            <stop offset="100%" stopColor="#7c8392" />
          </linearGradient>
        </defs>

        <text x="18" y="18" fontSize="12" fill="#374151">
          {d.title}
        </text>

        {/* top */}
        <path
          d={d.top}
          fill={`url(#offset-top-${direction})`}
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* left side */}
        <path
          d={d.leftFace}
          fill={`url(#offset-side-${direction})`}
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* center/front */}
        <path
          d={d.centerFace}
          fill={`url(#offset-front-${direction})`}
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* right side */}
        <path
          d={d.rightFace}
          fill={`url(#offset-side-${direction})`}
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* connector/front */}
        <path
          d={d.connectorFace}
          fill={`url(#offset-front-${direction})`}
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* center/front */}
        <path
          d={d.offsetLines}
          fill={`url(#offset-front-${direction})`}
          stroke="#374151"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* center/front */}
        <path
          d={d.lengthLines}
          fill={`url(#offset-front-${direction})`}
          stroke="#374151"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* labels */}
        <text
          x={d.wPos.x}
          y={d.wPos.y}
          fontSize="16"
          fontWeight="700"
          fill="#b91c1c"
        >
          {width || "-"}
        </text>

        <text
          x={d.hPos.x}
          y={d.hPos.y}
          fontSize="16"
          fontWeight="700"
          fill="#b91c1c"
        >
          {height || "-"}
        </text>

        <text
          x={d.lPos.x}
          y={d.lPos.y}
          fontSize="14"
          fontWeight="600"
          fill="#374151"
        >
          {length || "-"}
        </text>

        <text
          x={d.oPos.x}
          y={d.oPos.y}
          fontSize="14"
          fontWeight="600"
          fill="#374151"
        >
          {offset || "-"}
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