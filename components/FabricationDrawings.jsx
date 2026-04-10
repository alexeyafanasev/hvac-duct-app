export function StraightFlatPattern({
  width = "",
  height = "",
  length = "",
  className = "w-full max-w-3xl",
}) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const l = Number(length) || 0;

  const realFlatWidth = w * 2 + h * 2;
  const realFlatHeight = l;

  const maxDrawWidth = 700;
  const maxDrawHeight = 300;

  const scale = Math.min(
    maxDrawWidth / (realFlatWidth || 1),
    maxDrawHeight / (realFlatHeight || 1)
  );

  const drawWidth = realFlatWidth * scale;
  const drawHeight = realFlatHeight * scale;

  const panel1 = w * scale;
  const panel2 = h * scale;
  const panel3 = w * scale;
  const panel4 = h * scale;

  const x0 = 40;
  const y0 = 60;

  const x1 = x0 + panel1;
  const x2 = x1 + panel2;
  const x3 = x2 + panel3;
  const x4 = x3 + panel4;

  const topY = y0;
  const bottomY = y0 + drawHeight;
  const centerY = y0 + drawHeight / 2;

  const rightDimX = x4 + 32;
  const rightTextX = x4 + 52;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 900 420"
        className="w-full h-auto border rounded-xl bg-white"
      >
        <text x="40" y="26" fontSize="18" fontWeight="600" fill="#111827">
          Straight Duct Flat Pattern
        </text>


        {/* outer rectangle */}
        <rect
          x={x0}
          y={topY}
          width={drawWidth}
          height={drawHeight}
          fill="#F9FAFB"
          stroke="#111827"
          strokeWidth="2"
        />

        {/* fold lines */}
        <line
          x1={x1}
          y1={topY}
          x2={x1}
          y2={bottomY}
          stroke="#6B7280"
          strokeDasharray="6 4"
          strokeWidth="2"
        />
        <line
          x1={x2}
          y1={topY}
          x2={x2}
          y2={bottomY}
          stroke="#6B7280"
          strokeDasharray="6 4"
          strokeWidth="2"
        />
        <line
          x1={x3}
          y1={topY}
          x2={x3}
          y2={bottomY}
          stroke="#6B7280"
          strokeDasharray="6 4"
          strokeWidth="2"
        />

        {/* panel labels */}
        <text
          x={x0 + panel1 / 2}
          y={centerY}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#B91C1C"
        >
          {w || "-"}
        </text>

        <text
          x={x1 + panel2 / 2}
          y={centerY}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#B91C1C"
        >
          {h || "-"}
        </text>

        <text
          x={x2 + panel3 / 2}
          y={centerY}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#B91C1C"
        >
          {w || "-"}
        </text>

        <text
          x={x3 + panel4 / 2}
          y={centerY}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#B91C1C"
        >
          {h || "-"}
        </text>

        {/* top dimension line for developed width */}
        <line
          x1={x0}
          y1={topY - 10}
          x2={x4}
          y2={topY - 10}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line
          x1={x0}
          y1={topY - 16}
          x2={x0}
          y2={topY - 4}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line
          x1={x4}
          y1={topY - 16}
          x2={x4}
          y2={topY - 4}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <text
          x={(x0 + x4) / 2}
          y={topY - 14}
          textAnchor="middle"
          fontSize="14"
          fill="#111827"
        >
          Developed Width = {realFlatWidth || "-"}
        </text>

        {/* right vertical dimension for length */}
        <line
          x1={rightDimX}
          y1={topY}
          x2={rightDimX}
          y2={bottomY}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line
          x1={rightDimX - 6}
          y1={topY}
          x2={rightDimX + 6}
          y2={topY}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line
          x1={rightDimX - 6}
          y1={bottomY}
          x2={rightDimX + 6}
          y2={bottomY}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <text
          x={rightTextX}
          y={(topY + bottomY) / 2}
          transform={`rotate(90 ${rightTextX} ${(topY + bottomY) / 2})`}
          textAnchor="middle"
          fontSize="16"
          fontWeight="600"
          fill="#111827"
        >
          Length = {l || "-"}
        </text>

        {/* fold labels */}
        <text
          x={x1}
          y={bottomY + 24}
          textAnchor="middle"
          fontSize="12"
          fill="#6B7280"
        >
          Fold
        </text>
        <text
          x={x2}
          y={bottomY + 24}
          textAnchor="middle"
          fontSize="12"
          fill="#6B7280"
        >
          Fold
        </text>
        <text
          x={x3}
          y={bottomY + 24}
          textAnchor="middle"
          fontSize="12"
          fill="#6B7280"
        >
          Fold
        </text>

        {/* summary */}
        <text x="40" y="360" fontSize="13" fill="#374151">
          W = {w || "-"}, H = {h || "-"}, L = {l || "-"}
        </text>
      </svg>
    </div>
  );
}

export function ElbowFlatPattern({
  width = "",
  height = "",
  radius = "",
  angle = "90",
  bendType = "short",
  className = "w-full max-w-4xl",
}) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const r = Number(radius) || 0;
  const a = Number(angle) || 90;

  const angleRad = (a * Math.PI) / 180;

  // Short Way: поворот по ширине
  // Long Way: поворот по высоте
  const turningSize = bendType === "long" ? h : w;
  const fixedSide = bendType === "long" ? w : h;

  const innerArc = 2 * r;
  const outerArc = angleRad * (r + turningSize);

  // ===== Drawing scale =====
  const maxSectorBox = 250; // коробка для одной кривой детали
  const maxRectWidth = 300;
  const maxRectHeight = 100;

  const sectorScale = Math.min(
    maxSectorBox / Math.max(r + turningSize, 1),
    maxSectorBox / Math.max(r + turningSize, 1)
  );

  const rectScale = Math.min(
    maxRectWidth / Math.max(outerArc, 1),
    maxRectHeight / Math.max(fixedSide, 1)
  );

  const scale = Math.min(sectorScale, rectScale);

  const innerR = r * scale;
  const outerR = (r + turningSize) * scale;

  const innerRectW = innerArc * scale;
  const outerRectW = outerArc * scale;
  const rectH = fixedSide * scale;

  // ===== SVG helpers =====
  const polar = (cx, cy, radiusValue, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: cx + radiusValue * Math.cos(rad),
      y: cy + radiusValue * Math.sin(rad),
    };
  };

  const makeSectorPath = (cx, cy, rInner, rOuter, startDeg, endDeg) => {
    const outerStart = polar(cx, cy, rOuter, startDeg);
    const outerEnd = polar(cx, cy, rOuter, endDeg);
    const innerEnd = polar(cx, cy, rInner, endDeg);
    const innerStart = polar(cx, cy, rInner, startDeg);

    const largeArcFlag = endDeg - startDeg <= 180 ? 0 : 1;

    return `
      M ${outerStart.x} ${outerStart.y}
      A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}
      L ${innerEnd.x} ${innerEnd.y}
      L ${innerEnd.x} ${innerEnd.y-rInner}
      L ${innerEnd.x-rInner} ${innerEnd.y-rInner}
      A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}
      Z
    `;
  };

  const sectorPath = makeSectorPath(0, 0, innerR, outerR, 0, a);

  // ===== Layout positions =====
  const sectorBoxX1 = 60;
  const sectorBoxY1 = 90;

  const sectorBoxX2 = 360;
  const sectorBoxY2 = 90;

  const rectX = 650;
  const innerRectY = 110;
  const outerRectY = 240;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 980 430"
        className="w-full h-auto border rounded-xl bg-white"
      >
        <text x="30" y="26" fontSize="18" fontWeight="600" fill="#111827">
          Elbow Flat Pattern
        </text>

        <text x="30" y="64" fontSize="12" fill="#4B5563">
          Angle = {a}°, Radius = {r}, Width = {w}, Height = {h}, Bend Type ={" "}
          {bendType === "long" ? "Long Way" : "Short Way"}
        </text>

        {/* ===== Curved piece 1 ===== */}
        <g transform={`translate(${sectorBoxX1 + 80}, ${sectorBoxY1 + outerR})`}>
          <path
            d={sectorPath}
            fill="#F9FAFB"
            stroke="#111827"
            strokeWidth="2"
          />
        </g>

        <text
          x={sectorBoxX1 }
          y={sectorBoxY1 + outerR + 30}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
        >
          Side Piece 1
        </text>

        <text
          x={sectorBoxX1 - 40}
          y={sectorBoxY1 + 10}
          fontSize="13"
          fill="#B91C1C"
        >
          Outer R = {(r + turningSize) || "-"}
        </text>

        <text
          x={sectorBoxX1  - 30}
          y={sectorBoxY1 + outerR - 20}
          fontSize="13"
          fill="#B91C1C"
        >
          Inner R = {r || "-"}
        </text>

        <text
          x={sectorBoxX1  + 60}
          y={sectorBoxY1 + outerR - 10}
          fontSize="13"
          fill="#111827"
        >
          {a}°
        </text>

        <text
          x={sectorBoxX1 + innerR + 70}
          y={sectorBoxY1 + outerR + 35}
          fontSize="13"
          fill="#111827"
        >
          Turning Size = {turningSize || "-"}
        </text>

        {/* ===== Curved piece 2 ===== */}
        <g transform={`translate(${sectorBoxX2 + 60}, ${sectorBoxY2 + outerR})`}>
          <path
            d={sectorPath}
            fill="#F3F4F6"
            stroke="#111827"
            strokeWidth="2"
          />
        </g>

        <text
          x={sectorBoxX2 }
          y={sectorBoxY2 + outerR + 30}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
        >
          Side Piece 2
        </text>

        <text
          x={sectorBoxX2 - 50}
          y={sectorBoxY2 + 10}
          fontSize="13"
          fill="#B91C1C"
        >
          Outer R = {(r + turningSize) || "-"}
        </text>

        <text
          x={sectorBoxX2 - 30}
          y={sectorBoxY2 + outerR - 20 }
          fontSize="13"
          fill="#B91C1C"
        >
          Inner R = {r || "-"}
        </text>

        <text
          x={sectorBoxX2 + 60}
          y={sectorBoxY2 + outerR - 10}
          fontSize="13"
          fill="#111827"
        >
          {a}°
        </text>

        <text
          x={sectorBoxX2 + innerR + 70}
          y={sectorBoxY2 + outerR + 35}
          fontSize="13"
          fill="#111827"
        >
          Turning Size = {turningSize || "-"}
        </text>

        {/* ===== Inner rectangle ===== */}
        <rect
          x={rectX + 20}
          y={innerRectY}
          width={innerRectW}
          height={rectH}
          fill="#F9FAFB"
          stroke="#111827"
          strokeWidth="2"
        />

        <text
          x={rectX + innerRectW / 2 + 20}
          y={innerRectY - 10}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
        >
          Inner Side
        </text>

        <text
          x={rectX + innerRectW / 2 + 20}
          y={innerRectY + rectH / 2}
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#B91C1C"
        >
          {innerArc ? innerArc.toFixed(2) : "-"} × {h || "-"}
        </text>

        {/* ===== Outer rectangle ===== */}
        <rect
          x={rectX}
          y={outerRectY}
          width={outerRectW}
          height={rectH}
          fill="#F3F4F6"
          stroke="#111827"
          strokeWidth="2"
        />

        <text
          x={rectX + outerRectW / 2}
          y={outerRectY - 10}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
        >
          Outer Side
        </text>

        <text
          x={rectX + outerRectW / 2}
          y={outerRectY + rectH / 2}
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#B91C1C"
        >
          {outerArc ? outerArc.toFixed(2) : "-"} × {h || "-"}
        </text>

        {/* Summary */}
        <text x="30" y="380" fontSize="13" fill="#374151">
          Inner Arc = {innerArc ? innerArc.toFixed(2) : "-"}
        </text>
        <text x="30" y="398" fontSize="13" fill="#374151">
          Outer Arc = {outerArc ? outerArc.toFixed(2) : "-"}
        </text>
        <text x="30" y="416" fontSize="13" fill="#374151">
          Fixed Side = {fixedSide || "-"}
        </text>
      </svg>
    </div>
  );
}

export function TransitionFlatPattern({
  justification = "center",
  width1 = "",
  height1 = "",
  width2 = "",
  height2 = "",
  length = "",
  className = "w-full max-w-4xl",
}) {
  const w1 = Number(width1) || 0;
  const h1 = Number(height1) || 0;
  const w2 = Number(width2) || 0;
  const h2 = Number(height2) || 0;
  const l = Number(length) || 0;

  const maxDim = Math.max(w1, h1, w2, h2, l, 1);
  const scale = Math.min(100 / Math.max(maxDim, 1), 4);

  const inletW = w1 * scale;
  const inletH = h1 * scale;
  const outletW = w2 * scale;
  const outletH = h2 * scale;
  const bodyL = l * scale;

  const startX = 80;
  const startY = 90;
  const gap = 36;

  const panelTopY = startY;
  const panelBottomY = startY + Math.max(inletH, outletH) + 90;

  const topPanelX = startX;
  const bottomPanelX = startX;
  const leftPanelX = startX + Math.max(inletW, outletW) + gap;
  const rightPanelX = leftPanelX + bodyL + gap;

  const developedTopIn = inletW;
  const developedTopOut = outletW;

  const developedSideIn = inletH;
  const developedSideOut = outletH;

  const makeTrapezoid = (x, y, inSize, outSize, depth, label) => {
    const maxSize = Math.max(inSize, outSize);
    const minSize = Math.min(inSize, outSize);
    const offset = (maxSize - minSize) / 2;

    const topWidth = inSize;
    const bottomWidth = outSize;

    const topX = x + (maxSize - topWidth) / 2;
    const bottomX = x + (maxSize - bottomWidth) / 2;

    return (
      <g key={label}>
        <path
          d={`
            M ${topX} ${y}
            L ${topX + topWidth} ${y}
            L ${bottomX + bottomWidth} ${y + depth}
            L ${bottomX} ${y + depth}
            Z
          `}
          fill="#F9FAFB"
          stroke="#111827"
          strokeWidth="2"
        />

        <text
          x={x + maxSize / 2}
          y={y - 12}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
        >
          {label}
        </text>

        <text
          x={topX + topWidth / 2}
          y={y - 28}
          textAnchor="middle"
          fontSize="12"
          fill="#B91C1C"
        >
          IN = {Math.round(inSize / scale) || "-"}
        </text>

        <text
          x={bottomX + bottomWidth / 2}
          y={y + depth + 18}
          textAnchor="middle"
          fontSize="12"
          fill="#B91C1C"
        >
          OUT = {Math.round(outSize / scale) || "-"}
        </text>

        <text
          x={x + maxSize + 14}
          y={y + depth / 2}
          fontSize="12"
          fill="#111827"
        >
          L = {l || "-"}
        </text>
      </g>
    );
  };

  return (
    <div className={className}>
      <svg
        viewBox="0 0 980 460"
        className="w-full h-auto border rounded-xl bg-white"
      >
        <text x="30" y="26" fontSize="18" fontWeight="600" fill="#111827">
          Transition Flat Pattern
        </text>

        <text x="30" y="54" fontSize="12" fill="#4B5563">
          Justification = {justification}, IN = {w1 || "-"} × {h1 || "-"}, OUT ={" "}
          {w2 || "-"} × {h2 || "-"}, L = {l || "-"}
        </text>

        {makeTrapezoid(
          topPanelX,
          panelTopY,
          developedTopIn,
          developedTopOut,
          bodyL,
          "Top Panel"
        )}

        {makeTrapezoid(
          bottomPanelX,
          panelBottomY,
          developedTopIn,
          developedTopOut,
          bodyL,
          "Bottom Panel"
        )}

        {makeTrapezoid(
          leftPanelX,
          panelTopY,
          developedSideIn,
          developedSideOut,
          bodyL,
          "Left Panel"
        )}

        {makeTrapezoid(
          rightPanelX,
          panelTopY,
          developedSideIn,
          developedSideOut,
          bodyL,
          "Right Panel"
        )}

        <text x="30" y="398" fontSize="13" fill="#374151">
          Top / Bottom: {w1 || "-"} → {w2 || "-"}
        </text>
        <text x="30" y="416" fontSize="13" fill="#374151">
          Left / Right: {h1 || "-"} → {h2 || "-"}
        </text>
        <text x="30" y="434" fontSize="13" fill="#374151">
          Length = {l || "-"}
        </text>
      </svg>
    </div>
  );
}