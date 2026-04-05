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
        Q80 67 64 70
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
        Q80 67 64 70
        L64 70
        L64 112
        Q70 104 140 103
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
        Q40 100 90 100
        Q150 103 155 112
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
        M115 40
        Q130 36 150 87
        Q158 116 178 110
        L115 113
        Q103 110 101 90
        Q95 45 71 40
        Z
      `,
      leftFace: `
        M178 110
        L115 113
        L115 152
        L178 149
        Z
      `,
      centerFace: `
        M115 113
        Q103 110 101 90
        Q95 45 71 40
        L71 40
        L71 60
        Q76 58 80 80
        Q80 129 115 152
        Z
      `,
      offsetLines: `
        M31 20
        L71 60
        Z
        M31 70
        L115 152
        Z
      `,
      lengthLines: `
        M178 110
        L213 108
        Z
        M115 40
        L190 35
        Z
      `,
      wPos: { x: 140, y: 146 },
      hPos: { x: 180, y: 136 },
      lPos: { x: 178, y: 74 },
      oPos: { x: 32, y: 55 },
      dirPos: { x: 18, y: 150 },
    },

    down: {
      title: "Offset Down",
      centerFace: `
        M125 40
        Q90 45 68 108
        Q60 125 50 125
        L50 145
        Q70 149 100 100
        Q109 89 125 90
        Z
      `,
      leftFace: `
        M188 41
        L125 40
        L125 90
        L188 89
        Z
      `,
      top: `
        M50 145
        Q70 149 100 100
        Q109 89 125 90
        L188 89
        Q130 95 110 135
        Q105 145 95 145
        Z
      `,
      offsetLines: `
        M125 40
        L30 70
        Z
        M50 125
        L30 132
        Z
      `,
      lengthLines: `
        M188 89
        L208 89
        Z
        M100 145
        L208 145
        Z
      `,
      wPos: { x: 148, y: 36 },
      hPos: { x: 190, y: 70 },
      lPos: { x: 190, y: 124 },
      oPos: { x: 34, y: 104 },
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

            <text x="203" y="93" fontSize="16" fontWeight="700" fill="#b91c1c">
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

export function TransitionDrawing({
  justification = "center",
  width1 = "",
  height1 = "",
  width2 = "",
  height2 = "",
  length = "",
  className = "w-full max-w-sm",
}) {
  const variants = {
    center: {
      title: "Transition - Center",
      top: "M90 60 L140 60 L180 30 L50 30 Z",
      leftFace: "M90 60 L90 110 L50 140 L50 30  Z",
      centerFace: "M140 60 L140 110 L90 110 L90 60 Z",
      rightFace: "M140 60 L140 110 L180 140 L180 30 Z",
      connectorFace: "M90 110 L140 110 L180 140 L50 140 Z",
      inPos: { x: 20, y: 157 },
      outPos: { x: 132, y: 157 },
      lPos: { x: 10, y: 86 },
    },

    left: {
      title: "Transition - Left",
      top: "M50 60 L100 60 L180 30 L50 30 Z",
      centerFace: "M100 60 L100 110 L50 110 L50 60 Z",
      rightFace: "M100 60 L100 110 L180 140 L180 30 Z",
      connectorFace: "M50 110 L100 110 L180 140 L50 140 Z",
      inPos: { x: 20, y: 157 },
      outPos: { x: 132, y: 157 },
      lPos: { x: 10, y: 86 },
    },

    "top-left": {
      title: "Transition - Top Left",
      centerFace: "M100 30 L100 80 L50 80 L50 30 Z",
      rightFace: "M100 30 L100 80 L180 140 L180 30 Z",
      connectorFace: "M50 80 L100 80 L180 140 L50 140 Z",
      inPos: { x: 20, y: 157 },
      outPos: { x: 132, y: 157 },
      lPos: { x: 10, y: 86 },
    },

    top: {
      title: "Transition - Top",
      leftFace: "M90 30 L90 80 L50 140 L50 30  Z",
      centerFace: "M140 30 L140 80 L90 80 L90 30 Z",
      rightFace: "M140 30 L140 80 L180 140 L180 30 Z",
      connectorFace: "M90 80 L140 80 L180 140 L50 140 Z",
      inPos: { x: 20, y: 157 },
      outPos: { x: 132, y: 157 },
      lPos: { x: 10, y: 86 },
    },

    "top-right": {
      title: "Transition - Top Right",
      leftFace: "M130 30 L130 80 L50 140 L50 30  Z",
      centerFace: "M180 30 L180 80 L130 80 L130 30 Z",
      connectorFace: "M130 80 L180 80 L180 140 L50 140 Z",
      inPos: { x: 20, y: 157 },
      outPos: { x: 132, y: 157 },
      lPos: { x: 10, y: 86 },
    },

    right: {
      title: "Transition - Right",
      top: "M130 60 L180 60 L180 30 L50 30 Z",
      leftFace: "M130 60 L130 110 L50 140 L50 30  Z",
      centerFace: "M180 60 L180 110 L130 110 L130 60 Z",
      connectorFace: "M130 110 L180 110 L180 140 L50 140 Z",
      inPos: { x: 20, y: 157 },
      outPos: { x: 132, y: 157 },
      lPos: { x: 10, y: 86 },
    },

    "bottom-right": {
      title: "Transition - Bottom Right",
      top: "M130 90 L180 90 L180 30 L50 30 Z",
      leftFace: "M130 90 L130 140 L50 140 L50 30  Z",
      centerFace: "M180 90 L180 140 L130 140 L130 90 Z",
      inPos: { x: 20, y: 157 },
      outPos: { x: 132, y: 157 },
      lPos: { x: 10, y: 86 },
    },

    bottom: {
      title: "Transition - Bottom",
      top: "M90 90 L140 90 L180 30 L50 30 Z",
      leftFace: "M90 90 L90 140 L50 140 L50 30  Z",
      centerFace: "M140 90 L140 140 L90 140 L90 90 Z",
      rightFace: "M140 90 L140 140 L180 140 L180 30 Z",
      inPos: { x: 20, y: 157 },
      outPos: { x: 132, y: 157 },
      lPos: { x: 10, y: 86 },
    },

    "bottom-left": {
      title: "Transition - Bottom Left",
      top: "M50 90 L50 140 L180 30 L50 30 Z",
      centerFace: "M100 90 L100 140 L50 140 L50 90 Z",
      rightFace: "M100 90 L100 140 L180 140 L180 30 Z",
      inPos: { x: 20, y: 157 },
      outPos: { x: 132, y: 157 },
      lPos: { x: 10, y: 86 },
    },
  };

  const d = variants[justification] || variants.center;

  return (
    <div className={className}>
      <svg viewBox="0 0 220 160" className="w-full h-auto">
        <defs>
          <linearGradient
            id={`tr-front-${justification}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#d9dde7" />
            <stop offset="100%" stopColor="#bcc4d3" />
          </linearGradient>

          <linearGradient
            id={`tr-side-${justification}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#8790a4" />
            <stop offset="100%" stopColor="#5e6679" />
          </linearGradient>

          <linearGradient
            id={`tr-top-${justification}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#c8cfdd" />
            <stop offset="100%" stopColor="#9ea8ba" />
          </linearGradient>
        </defs>

        <text x="18" y="18" fontSize="12" fill="#374151">
          {d.title}
        </text>

        <path
          d={d.top}
          fill={`url(#tr-top-${justification})`}
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d={d.leftFace}
          fill={`url(#tr-side-${justification})`}
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d={d.centerFace}
          fill={`url(#tr-front-${justification})`}
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d={d.rightFace}
          fill={`url(#tr-side-${justification})`}
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d={d.connectorFace}
          fill={`url(#tr-front-${justification})`}
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <text
          x={d.inPos.x}
          y={d.inPos.y}
          fontSize="12"
          fontWeight="700"
          fill="#b91c1c"
        >
          IN {width1 || "-"}x{height1 || "-"}
        </text>

        <text
          x={d.outPos.x}
          y={d.outPos.y}
          fontSize="12"
          fontWeight="700"
          fill="#b91c1c"
        >
          OUT {width2 || "-"}x{height2 || "-"}
        </text>

        <text
          x={d.lPos.x}
          y={d.lPos.y}
          fontSize="14"
          fontWeight="600"
          fill="#374151"
        >
          L={length || "-"}
        </text>
      </svg>
    </div>
  );
}