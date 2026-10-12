function toInchesFraction(value) {
  const num = Number(value);

  if (!Number.isFinite(num)) return "-";

  const sign = num < 0 ? "-" : "";
  const absValue = Math.abs(num);

  let inches = Math.floor(absValue);
  const fraction = absValue - inches;

  const denominator = 16;
  let numerator = Math.round(fraction * denominator);

  if (numerator === denominator) {
    inches += 1;
    numerator = 0;
  }

  if (numerator === 0) {
    return `${sign}${inches}"`;
  }

  function gcd(a, b) {
    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));

    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }

    return a || 1;
  }

  const divisor = gcd(numerator, denominator);

  return `${sign}${inches} ${numerator / divisor}/${denominator / divisor}"`;
}

export function StraightFlatPattern({
  width = "",
  height = "",
  length = "",
  className = "w-full max-w-4xl",
}) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const rawL = Number(length) || 0;

  // Cut length rule:
  // If ordered length == 48" => cut length = 48" (standard sheet width, no length trim)
  // If ordered length < 48" => cut length = ordered length - 1"
  // (If ordered length > 48" and not 48", cutL = max(0, rawL - 1))
  const cutL = Math.abs(rawL - 48) < 1e-4 ? 48.0 : Math.max(0, rawL - 1.0);

  const pocketAllowance = 1.0; // 1" for Pittsburgh pocket
  const flangeAllowance = 0.25; // 1/4" for Pittsburgh flange
  const cleatNotch = 1.0; // 1" end notch on corners for S-cleat and Drive-cleat

  // L-Section flat blank dimensions (2 pieces make 1 complete duct)
  const bodyW = w + h;
  const realFlatWidth = pocketAllowance + bodyW + flangeAllowance; // W + H + 1.25"
  const realFlatHeight = cutL;

  const maxDrawW = 580;
  const maxDrawH = 260;

  const scale = Math.min(
    maxDrawW / (realFlatWidth || 1),
    maxDrawH / (realFlatHeight || 1)
  );

  const drawTotalW = realFlatWidth * scale;
  const drawTotalH = realFlatHeight * scale;

  const originX = 150 + (maxDrawW - drawTotalW) / 2;
  const originY = 85 + (maxDrawH - drawTotalH) / 2;

  const drawP = pocketAllowance * scale;
  const drawF = flangeAllowance * scale;
  const drawN = Math.min(cleatNotch * scale, drawTotalH / 2 - 2);
  const drawW = w * scale;
  const drawH = h * scale;
  const drawBodyW = drawW + drawH;

  const xPocket = originX;
  const xBodyLeft = originX + drawP;
  const xCornerFold = originX + drawP + drawW;
  const xBodyRight = originX + drawP + drawBodyW;
  const xFlange = originX + drawTotalW;

  const yTop = originY;
  const yNotchTop = originY + drawN;
  const yNotchBottom = originY + drawTotalH - drawN;
  const yBottom = originY + drawTotalH;

  // 45-degree corner miter cuts meeting directly at the 4 bend line corners:
  // Top-left: (xBodyLeft, yNotchTop)
  // Top-right: (xBodyRight, yNotchTop)
  // Bottom-right: (xBodyRight, yNotchBottom)
  // Bottom-left: (xBodyLeft, yNotchBottom)
  const cutPath = [
    `M ${xBodyLeft + drawN} ${yTop}`,
    `L ${xBodyRight - drawN} ${yTop}`,
    `L ${xBodyRight} ${yNotchTop}`,
    `L ${xFlange} ${yNotchTop + drawF}`,
    `L ${xFlange} ${yNotchBottom - drawF}`,
    `L ${xBodyRight} ${yNotchBottom}`,
    `L ${xBodyRight - drawN} ${yBottom}`,
    `L ${xBodyLeft + drawN} ${yBottom}`,
    `L ${xBodyLeft} ${yNotchBottom}`,
    `L ${xPocket} ${yNotchBottom - drawP}`,
    `L ${xPocket} ${yNotchTop + drawP}`,
    `L ${xBodyLeft} ${yNotchTop}`,
    `Z`,
  ].join(" ");

  const rightDimX = xFlange + 36;
  const rightTextX = xFlange + 54;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 920 450"
        className="w-full h-auto border rounded-xl bg-white shadow-xs"
      >
        {/* Title & subtitle */}
        <text x="30" y="28" fontSize="16" fontWeight="700" fill="#0f172a">
          Straight Duct Flat Pattern — L-Section (2 pcs per duct)
        </text>
        <text x="30" y="48" fontSize="12" fill="#64748b">
          Ordered: {toInchesFraction(w)} × {toInchesFraction(h)} × {toInchesFraction(rawL)} | Total Cut: {toInchesFraction(realFlatWidth)} × {toInchesFraction(cutL)}
          {rawL !== cutL ? ` (${toInchesFraction(rawL)} - 1″ S/Drive allowance)` : " (48″ sheet flush)"}
        </text>

        {/* Outer cut blank with corner notches */}
        <path
          d={cutPath}
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* 90° Corner bend line between width and height panels */}
        <line
          x1={xCornerFold}
          y1={yTop}
          x2={xCornerFold}
          y2={yBottom}
          stroke="#dc2626"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        {/* Pittsburgh Lock fold line (1" pocket) */}
        <line
          x1={xBodyLeft}
          y1={yNotchTop}
          x2={xBodyLeft}
          y2={yNotchBottom}
          stroke="#2563eb"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />

        {/* Pittsburgh Flange fold line (1/4" flange) */}
        <line
          x1={xBodyRight}
          y1={yNotchTop}
          x2={xBodyRight}
          y2={yNotchBottom}
          stroke="#059669"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />

        {/* 1" S-Cleat & Drive-Cleat reference lines (top and bottom) */}
        <line
          x1={xBodyLeft}
          y1={yNotchTop}
          x2={xBodyRight}
          y2={yNotchTop}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1={xBodyLeft}
          y1={yNotchBottom}
          x2={xBodyRight}
          y2={yNotchBottom}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* S-Cleat / Drive-Cleat end zone labels */}
        {drawN > 14 && (
          <>
            <text
              x={(xBodyLeft + xBodyRight) / 2}
              y={yTop + drawN / 2 + 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#64748b"
            >
              1″ S-Cleat / Drive-Cleat Zone
            </text>
            <text
              x={(xBodyLeft + xBodyRight) / 2}
              y={yBottom - drawN / 2 + 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#64748b"
            >
              1″ S-Cleat / Drive-Cleat Zone
            </text>
          </>
        )}

        {/* Panel Labels (Width & Height) */}
        <text
          x={xBodyLeft + drawW / 2}
          y={(yTop + yBottom) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="18"
          fontWeight="700"
          fill="#1e293b"
        >
          {toInchesFraction(w)}
        </text>
        <text
          x={xBodyLeft + drawW / 2}
          y={(yTop + yBottom) / 2 + 18}
          textAnchor="middle"
          fontSize="11"
          fill="#64748b"
        >
          Panel W
        </text>

        <text
          x={xCornerFold + drawH / 2}
          y={(yTop + yBottom) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="18"
          fontWeight="700"
          fill="#1e293b"
        >
          {toInchesFraction(h)}
        </text>
        <text
          x={xCornerFold + drawH / 2}
          y={(yTop + yBottom) / 2 + 18}
          textAnchor="middle"
          fontSize="11"
          fill="#64748b"
        >
          Panel H
        </text>

        {/* Longitudinal Seam Annotations */}
        <text
          x={originX - 10}
          y={(yTop + yBottom) / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${originX - 10} ${(yTop + yBottom) / 2})`}
          fontSize="11"
          fontWeight="600"
          fill="#2563eb"
        >
          +1″ Pittsburgh Pocket
        </text>

        <text
          x={xFlange + 12}
          y={(yTop + yBottom) / 2}
          textAnchor="middle"
          transform={`rotate(90 ${xFlange + 12} ${(yTop + yBottom) / 2})`}
          fontSize="11"
          fontWeight="600"
          fill="#059669"
        >
          +1/4″ Pittsburgh Flange
        </text>

        {/* Corner Notch Callout Labels */}
        <text
          x={xPocket - 6}
          y={yTop + drawN / 2 + 4}
          textAnchor="end"
          fontSize="10"
          fill="#94a3b8"
        >
          45° notch
        </text>
        <text
          x={xPocket - 6}
          y={yBottom - drawN / 2 + 4}
          textAnchor="end"
          fontSize="10"
          fill="#94a3b8"
        >
          45° notch
        </text>

        {/* Top dimension line for developed cut width */}
        <line
          x1={xPocket}
          y1={yTop - 14}
          x2={xFlange}
          y2={yTop - 14}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <line
          x1={xPocket}
          y1={yTop - 20}
          x2={xPocket}
          y2={yTop - 8}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <line
          x1={xFlange}
          y1={yTop - 20}
          x2={xFlange}
          y2={yTop - 8}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <text
          x={(xPocket + xFlange) / 2}
          y={yTop - 19}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="#0f172a"
        >
          Total Cut Width = {toInchesFraction(realFlatWidth)} (1″ + {w}″ + {h}″ + 1/4″)
        </text>

        {/* Right vertical dimension for cut length */}
        <line
          x1={rightDimX}
          y1={yTop}
          x2={rightDimX}
          y2={yBottom}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <line
          x1={rightDimX - 5}
          y1={yTop}
          x2={rightDimX + 5}
          y2={yTop}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <line
          x1={rightDimX - 5}
          y1={yBottom}
          x2={rightDimX + 5}
          y2={yBottom}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <text
          x={rightTextX}
          y={(yTop + yBottom) / 2}
          transform={`rotate(90 ${rightTextX} ${(yTop + yBottom) / 2})`}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          Cut Length = {toInchesFraction(cutL)}
          {rawL !== cutL ? ` (Ordered: ${toInchesFraction(rawL)})` : ""}
        </text>

        {/* Fold line label at bottom */}
        <text
          x={xCornerFold}
          y={yBottom + 20}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill="#dc2626"
        >
          90° Corner Fold
        </text>

        {/* Legend / summary at bottom */}
        <text x="30" y="432" fontSize="11" fill="#64748b">
          Legend: Red dashed = 90° corner fold; Blue dashed = 1″ Pittsburgh pocket seam; Green dashed = 1/4″ Pittsburgh flange; Gray dashed = 1″ S-Cleat / Drive-Cleat end zone.
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

  // Short Way: turning along width
  // Long Way: turning along height
  const turningSize = w;
  const fixedSide = bendType === "long" ? w : h;

  const innerArc = 2 * r;
  const outerArc = angleRad * (r + turningSize);

  // ===== Drawing scale =====
  const maxSectorBox = 250; // bounding box for a single curved piece
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
          Angle = {a}°, Radius = {toInchesFraction(r)}, Width = {toInchesFraction(w)}, Height = {toInchesFraction(h)}, Bend Type ={" "}
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
         Outer R = {toInchesFraction(r + turningSize) || "-"}
        </text>

        <text
          x={sectorBoxX1  - 30}
          y={sectorBoxY1 + outerR - 20}
          fontSize="13"
          fill="#B91C1C"
        >
          Inner R = {toInchesFraction(r) || "-"}
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
          Turning Size = {toInchesFraction(turningSize) || "-"}
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
          Outer R = {toInchesFraction(r + turningSize) || "-"}
        </text>

        <text
          x={sectorBoxX2 - 30}
          y={sectorBoxY2 + outerR - 20 }
          fontSize="13"
          fill="#B91C1C"
        >
          Inner R = {toInchesFraction(r) || "-"}
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
          Turning Size = {toInchesFraction(turningSize) || "-"}
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
          {innerArc ? toInchesFraction(innerArc) : "-"} × {toInchesFraction(h) || "-"}
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
          {outerArc ? toInchesFraction(outerArc) : "-"} × {toInchesFraction(h) || "-"}
        </text>

        {/* Summary */}
        <text x="30" y="380" fontSize="13" fill="#374151">
          Inner Arc = {innerArc ? toInchesFraction(innerArc) : "-"}
        </text>
        <text x="30" y="398" fontSize="13" fill="#374151">
          Outer Arc = {outerArc ? toInchesFraction(outerArc) : "-"}
        </text>
        <text x="30" y="416" fontSize="13" fill="#374151">
          Fixed Side = {toInchesFraction(fixedSide) || "-"}
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
  const rawL = Number(length) || 0;

  // Trapezoid body height is 1" less than ordered size
  const lBody = Math.max(1, rawL - 1.0);

  const dW = w1 - w2;
  const dH = h1 - h2;

  function getOffsets(just) {
    switch (just) {
      case "left":
        return { dx: -dW / 2, dy: 0 };
      case "right":
        return { dx: dW / 2, dy: 0 };
      case "top":
        return { dx: 0, dy: -dH / 2 };
      case "bottom":
        return { dx: 0, dy: dH / 2 };
      case "top-left":
        return { dx: -dW / 2, dy: -dH / 2 };
      case "top-right":
        return { dx: dW / 2, dy: -dH / 2 };
      case "bottom-left":
        return { dx: -dW / 2, dy: dH / 2 };
      case "bottom-right":
        return { dx: dW / 2, dy: dH / 2 };
      case "center":
      default:
        return { dx: 0, dy: 0 };
    }
  }

  const { dx, dy } = getOffsets(justification);

  function trueLength(x, y) {
    return Math.sqrt(lBody ** 2 + x ** 2 + y ** 2);
  }

  // Slant differences from 3D geometry
  const topEdgeOffset = dy + dH / 2;
  const bottomEdgeOffset = dy - dH / 2;
  const leftEdgeOffset = dx + dW / 2;
  const rightEdgeOffset = dx - dW / 2;

  // Top panel
  const topLeft = trueLength(leftEdgeOffset, topEdgeOffset);
  const topRight = trueLength(rightEdgeOffset, topEdgeOffset);

  // Bottom panel
  const bottomLeft = trueLength(leftEdgeOffset, bottomEdgeOffset);
  const bottomRight = trueLength(rightEdgeOffset, bottomEdgeOffset);

  // Left panel
  const leftTop = trueLength(leftEdgeOffset, topEdgeOffset);
  const leftBottom = trueLength(leftEdgeOffset, bottomEdgeOffset);

  // Right panel
  const rightTop = trueLength(rightEdgeOffset, topEdgeOffset);
  const rightBottom = trueLength(rightEdgeOffset, bottomEdgeOffset);

  function lineInter(p1, d1, p2, d2) {
    const det = d1.x * d2.y - d1.y * d2.x;
    if (Math.abs(det) < 1e-9) return { x: p1.x, y: p1.y };
    const dX = p2.x - p1.x;
    const dY = p2.y - p1.y;
    const t = (dX * d2.y - dY * d2.x) / det;
    return { x: p1.x + t * d1.x, y: p1.y + t * d1.y };
  }

  function buildNotchedPanel(
    top,
    bottom,
    left,
    right,
    leftAllowance = 1.0,
    rightAllowance = 0.25
  ) {
    const p = leftAllowance;
    const f = rightAllowance;
    const n = 1.0; // 1" Cleat allowance along bases

    if (top <= 0 || bottom <= 0 || left <= 0 || right <= 0) {
      return {
        path: "",
        width: Math.max(top, bottom),
        height: 0,
        bendLines: [],
        p1: { x: 0, y: 0 },
        p2: { x: top, y: 0 },
        p3: { x: bottom, y: 0 },
        p4: { x: 0, y: 0 },
        lengths: { top, right, bottom, left },
      };
    }

    let x, h;
    if (Math.abs(left - right) < 0.0001) {
      const inset = (top - bottom) / 2;
      h = Math.sqrt(Math.max(left ** 2 - inset ** 2, 0));
      x = inset;
    } else {
      const denom = 2 * (top - bottom);
      if (Math.abs(denom) < 0.0001) {
        x = (left ** 2 - right ** 2) / (4 * top || 0.0001);
      } else {
        x = (left ** 2 - right ** 2 + (top - bottom) ** 2) / denom;
      }
      h = Math.sqrt(Math.max(left ** 2 - x ** 2, 0));
    }

    const rawP1 = { x: 0, y: 0 };
    const rawP2 = { x: top, y: 0 };
    const rawP3 = { x: x + bottom, y: h };
    const rawP4 = { x: x, y: h };

    const vLeft = { x: rawP4.x - rawP1.x, y: rawP4.y - rawP1.y };
    const lenLeft = Math.sqrt(vLeft.x ** 2 + vLeft.y ** 2) || 1;
    const dirLeft = { x: vLeft.x / lenLeft, y: vLeft.y / lenLeft };
    const normLeft = { x: -dirLeft.y, y: dirLeft.x };

    const vRight = { x: rawP3.x - rawP2.x, y: rawP3.y - rawP2.y };
    const lenRight = Math.sqrt(vRight.x ** 2 + vRight.y ** 2) || 1;
    const dirRight = { x: vRight.x / lenRight, y: vRight.y / lenRight };
    const normRight = { x: dirRight.y, y: -dirRight.x };

    const ptLeftLine = {
      x: rawP1.x + p * normLeft.x,
      y: rawP1.y + p * normLeft.y,
    };
    const ptRightLine = {
      x: rawP2.x + f * normRight.x,
      y: rawP2.y + f * normRight.y,
    };

    const rayP1 = { x: -1, y: 1 };
    const interTL = lineInter(rawP1, rayP1, ptLeftLine, dirLeft);

    const rayP2 = { x: 1, y: 1 };
    const interTR = lineInter(rawP2, rayP2, ptRightLine, dirRight);

    const rayP3 = { x: -1, y: 1 };
    const interBR = lineInter(rawP3, rayP3, ptRightLine, dirRight);

    const rayP4 = { x: -1, y: -1 };
    const interBL = lineInter(rawP4, rayP4, ptLeftLine, dirLeft);

    const rawPts = [
      { x: rawP1.x + n, y: -n },
      { x: rawP2.x - n, y: -n },
      { x: rawP2.x, y: rawP2.y },
      interTR,
      interBR,
      { x: rawP3.x, y: rawP3.y },
      { x: rawP3.x - n, y: h + n },
      { x: rawP4.x + n, y: h + n },
      { x: rawP4.x, y: rawP4.y },
      interBL,
      interTL,
      { x: rawP1.x, y: rawP1.y },
    ];

    const minX = Math.min(...rawPts.map((pt) => pt.x));
    const maxX = Math.max(...rawPts.map((pt) => pt.x));
    const minY = Math.min(...rawPts.map((pt) => pt.y));
    const maxY = Math.max(...rawPts.map((pt) => pt.y));

    const pts = rawPts.map((pt) => ({
      x: pt.x - minX,
      y: pt.y - minY,
    }));

    const p1 = { x: rawP1.x - minX, y: rawP1.y - minY };
    const p2 = { x: rawP2.x - minX, y: rawP2.y - minY };
    const p3 = { x: rawP3.x - minX, y: rawP3.y - minY };
    const p4 = { x: rawP4.x - minX, y: rawP4.y - minY };

    const bendLines = [
      { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, color: "#94a3b8" }, // Top cleat
      { x1: p4.x, y1: p4.y, x2: p3.x, y2: p3.y, color: "#94a3b8" }, // Bottom cleat
      { x1: p1.x, y1: p1.y, x2: p4.x, y2: p4.y, color: leftAllowance > 0.5 ? "#2563eb" : "#059669" }, // Left allowance
      { x1: p2.x, y1: p2.y, x2: p3.x, y2: p3.y, color: rightAllowance > 0.5 ? "#2563eb" : "#059669" }, // Right allowance
    ];

    return {
      pts,
      width: maxX - minX,
      height: maxY - minY,
      p1,
      p2,
      p3,
      p4,
      bendLines,
      lengths: { top, right, bottom, left },
    };
  }

  // Top & Bottom panels have 1/4" Pittsburgh flanges on BOTH sides
  const topPanelRaw = buildNotchedPanel(w1, w2, topLeft, topRight, 0.25, 0.25);
  const bottomPanelRaw = buildNotchedPanel(w1, w2, bottomLeft, bottomRight, 0.25, 0.25);

  // Left & Right panels have 1.0" Pittsburgh pockets on BOTH sides
  const leftPanelRaw = buildNotchedPanel(h1, h2, leftTop, leftBottom, 1.0, 1.0);
  const rightPanelRaw = buildNotchedPanel(h1, h2, rightTop, rightBottom, 1.0, 1.0);

  const maxPanelWidth = Math.max(
    topPanelRaw.width,
    bottomPanelRaw.width,
    leftPanelRaw.width,
    rightPanelRaw.width,
    1
  );
  const maxPanelHeight = Math.max(
    topPanelRaw.height,
    bottomPanelRaw.height,
    leftPanelRaw.height,
    rightPanelRaw.height,
    1
  );

  const targetPanelWidth = 280;
  const targetPanelHeight = 180;

  const scale = Math.min(
    targetPanelWidth / maxPanelWidth,
    targetPanelHeight / maxPanelHeight
  );

  function scaleAndPlacePanel(panel, offsetX, offsetY) {
    return {
      ...panel,
      pts: panel.pts.map((pt) => ({
        x: pt.x * scale + offsetX,
        y: pt.y * scale + offsetY,
      })),
      p1: { x: panel.p1.x * scale + offsetX, y: panel.p1.y * scale + offsetY },
      p2: { x: panel.p2.x * scale + offsetX, y: panel.p2.y * scale + offsetY },
      p3: { x: panel.p3.x * scale + offsetX, y: panel.p3.y * scale + offsetY },
      p4: { x: panel.p4.x * scale + offsetX, y: panel.p4.y * scale + offsetY },
      bendLines: panel.bendLines.map((bl) => ({
        ...bl,
        x1: bl.x1 * scale + offsetX,
        y1: bl.y1 * scale + offsetY,
        x2: bl.x2 * scale + offsetX,
        y2: bl.y2 * scale + offsetY,
      })),
    };
  }

  const startX = 40;
  const startY = 110;
  const gapX = 70;
  const gapY = 90;

  const topPanel = scaleAndPlacePanel(topPanelRaw, startX, startY);
  const bottomPanel = scaleAndPlacePanel(
    bottomPanelRaw,
    startX,
    startY + maxPanelHeight * scale + gapY
  );
  const leftPanel = scaleAndPlacePanel(
    leftPanelRaw,
    startX + maxPanelWidth * scale + gapX,
    startY
  );
  const rightPanel = scaleAndPlacePanel(
    rightPanelRaw,
    startX + maxPanelWidth * scale + gapX,
    startY + maxPanelHeight * scale + gapY
  );

  function getPanelBounds(panel) {
    const xs = panel.pts.map((pt) => pt.x);
    const ys = panel.pts.map((pt) => pt.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }

  function getCombinedBounds(panels) {
    const bounds = panels.map(getPanelBounds);
    return {
      minX: Math.min(...bounds.map((b) => b.minX)),
      maxX: Math.max(...bounds.map((b) => b.maxX)),
      minY: Math.min(...bounds.map((b) => b.minY)),
      maxY: Math.max(...bounds.map((b) => b.maxY)),
    };
  }

  const canvasWidth = 1100;
  const canvasHeight = 580;

  const combinedBounds = getCombinedBounds([
    topPanel,
    leftPanel,
    rightPanel,
    bottomPanel,
  ]);

  const contentWidth = combinedBounds.maxX - combinedBounds.minX;
  const contentHeight = combinedBounds.maxY - combinedBounds.minY;

  const drawingOffsetX = 400;
  const drawingOffsetY = 90;
  const rightPadding = 40;
  const bottomPadding = 40;

  const fitScale = Math.min(
    (canvasWidth - drawingOffsetX - rightPadding) / Math.max(contentWidth, 1),
    (canvasHeight - drawingOffsetY - bottomPadding) / Math.max(contentHeight, 1),
    1
  );

  function fitPanelToCanvas(panel) {
    const mapPt = (pt) => ({
      x: (pt.x - combinedBounds.minX) * fitScale + drawingOffsetX,
      y: (pt.y - combinedBounds.minY) * fitScale + drawingOffsetY,
    });
    return {
      ...panel,
      pts: panel.pts.map(mapPt),
      p1: mapPt(panel.p1),
      p2: mapPt(panel.p2),
      p3: mapPt(panel.p3),
      p4: mapPt(panel.p4),
      bendLines: panel.bendLines.map((bl) => ({
        ...bl,
        x1: (bl.x1 - combinedBounds.minX) * fitScale + drawingOffsetX,
        y1: (bl.y1 - combinedBounds.minY) * fitScale + drawingOffsetY,
        x2: (bl.x2 - combinedBounds.minX) * fitScale + drawingOffsetX,
        y2: (bl.y2 - combinedBounds.minY) * fitScale + drawingOffsetY,
      })),
    };
  }

  const fittedTopPanel = fitPanelToCanvas(topPanel);
  const fittedLeftPanel = fitPanelToCanvas(leftPanel);
  const fittedRightPanel = fitPanelToCanvas(rightPanel);
  const fittedBottomPanel = fitPanelToCanvas(bottomPanel);

  function panelPath(pts) {
    if (!pts || pts.length === 0) return "";
    return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((pt) => `L ${pt.x} ${pt.y}`).join(" ") + " Z";
  }

  function renderPanel(panel, label, color = "#F9FAFB") {
    const topMidX = (panel.p1.x + panel.p2.x) / 2;
    const topMidY = (panel.p1.y + panel.p2.y) / 2;

    const bottomMidX = (panel.p3.x + panel.p4.x) / 2;
    const bottomMidY = (panel.p3.y + panel.p4.y) / 2;

    const leftMidX = (panel.p1.x + panel.p4.x) / 2;
    const leftMidY = (panel.p1.y + panel.p4.y) / 2;

    const rightMidX = (panel.p2.x + panel.p3.x) / 2;
    const rightMidY = (panel.p2.y + panel.p3.y) / 2;

    const labelX = (panel.p1.x + panel.p2.x) / 2;
    const labelY = Math.min(panel.p1.y, panel.p2.y) - 18;

    return (
      <g key={label}>
        {/* Cut Contour */}
        <path
          d={panelPath(panel.pts)}
          fill={color}
          stroke="#111827"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Dashed Bend Lines */}
        {panel.bendLines.map((bl, i) => (
          <line
            key={i}
            x1={bl.x1}
            y1={bl.y1}
            x2={bl.x2}
            y2={bl.y2}
            stroke={bl.color}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        ))}

        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
        >
          {label}
        </text>

        <text
          x={topMidX}
          y={topMidY - 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="500"
          fill="#b91c1c"
        >
          {toInchesFraction(panel.lengths.top)}
        </text>

        <text
          x={bottomMidX}
          y={bottomMidY + 14}
          textAnchor="middle"
          fontSize="11"
          fontWeight="500"
          fill="#b91c1c"
        >
          {toInchesFraction(panel.lengths.bottom)}
        </text>

        <text
          x={leftMidX - 8}
          y={leftMidY + 4}
          textAnchor="end"
          fontSize="11"
          fontWeight="500"
          fill="#1f2937"
        >
          {toInchesFraction(panel.lengths.left)}
        </text>

        <text
          x={rightMidX + 8}
          y={rightMidY + 4}
          textAnchor="start"
          fontSize="11"
          fontWeight="500"
          fill="#1f2937"
        >
          {toInchesFraction(panel.lengths.right)}
        </text>
      </g>
    );
  }

  function offsetText() {
    const horizontal =
      dx === 0
        ? "centered"
        : dx < 0
        ? `left ${Math.abs(dx).toFixed(1)}"`
        : `right ${Math.abs(dx).toFixed(1)}"`;

    const vertical =
      dy === 0
        ? "centered"
        : dy < 0
        ? `up ${Math.abs(dy).toFixed(1)}"`
        : `down ${Math.abs(dy).toFixed(1)}"`;

    return `Width offset: ${horizontal}, Height offset: ${vertical}`;
  }

  return (
    <div className={className}>
      <svg
        viewBox="0 0 1100 580"
        className="w-full h-auto border rounded-xl bg-white shadow-xs"
      >
        <text x="30" y="26" fontSize="18" fontWeight="600" fill="#111827">
          Transition Flat Pattern
        </text>

        <text x="30" y="50" fontSize="12" fill="#4b5563">
          Justification = {justification}, IN = {w1 || "-"} × {h1 || "-"}, OUT ={" "}
          {w2 || "-"} × {h2 || "-"}, Ordered L = {rawL || "-"}″ (Body Height = {lBody}″)
        </text>

        <text x="30" y="68" fontSize="12" fill="#4b5563">
          {offsetText()} | Allowances: 1″ Cleat flanges (transverse), 1″ Pittsburgh pockets (Left &amp; Right), 1/4″ Pittsburgh flanges (Top &amp; Bottom)
        </text>

        {renderPanel(fittedTopPanel, "Top Panel", "#F9FAFB")}
        {renderPanel(fittedLeftPanel, "Left Panel", "#F9FAFB")}
        {renderPanel(fittedRightPanel, "Right Panel", "#F9FAFB")}
        {renderPanel(fittedBottomPanel, "Bottom Panel", "#F3F4F6")}

        <text x="30" y="480" fontSize="13" fill="#374151">
          Top Panel: top {toInchesFraction(topPanelRaw.lengths.top)}, bottom{" "}
          {toInchesFraction(topPanelRaw.lengths.bottom)}, left{" "}
          {toInchesFraction(topPanelRaw.lengths.left)}, right{" "}
          {toInchesFraction(topPanelRaw.lengths.right)}
        </text>

        <text x="30" y="502" fontSize="13" fill="#374151">
          Bottom Panel: top {toInchesFraction(bottomPanelRaw.lengths.top)}, bottom{" "}
          {toInchesFraction(bottomPanelRaw.lengths.bottom)}, left{" "}
          {toInchesFraction(bottomPanelRaw.lengths.left)}, right{" "}
          {toInchesFraction(bottomPanelRaw.lengths.right)}
        </text>

        <text x="30" y="524" fontSize="13" fill="#374151">
          Left Panel: top {toInchesFraction(leftPanelRaw.lengths.top)}, bottom{" "}
          {toInchesFraction(leftPanelRaw.lengths.bottom)}, left{" "}
          {toInchesFraction(leftPanelRaw.lengths.left)}, right{" "}
          {toInchesFraction(leftPanelRaw.lengths.right)}
        </text>

        <text x="30" y="546" fontSize="13" fill="#374151">
          Right Panel: top {toInchesFraction(rightPanelRaw.lengths.top)}, bottom{" "}
          {toInchesFraction(rightPanelRaw.lengths.bottom)}, left{" "}
          {toInchesFraction(rightPanelRaw.lengths.left)}, right{" "}
          {toInchesFraction(rightPanelRaw.lengths.right)}
        </text>
      </svg>
    </div>
  );
}

export function OffsetFlatPattern({
  direction = "right",
  width = "",
  height = "",
  length = "",
  offset = "",
  className = "w-full max-w-4xl",
}) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const l = Number(length) || 0;
  const o = Number(offset) || 0;

  const trueLength = (4 * Math.sqrt(l ** 2 + o ** 2) - l) / 3 ;

  const maxPanelWidth = 260;
  const maxPanelHeight = 140;

  const scale = Math.min(
    maxPanelWidth / Math.max(w, h, 1),
    maxPanelHeight / Math.max(trueLength, 1)
  );

  const drawW = w * scale;
  const drawH = h * scale;
  const drawL = l * scale;
  const drawO = Math.abs(o) * scale;

  const startX = 450;
  const startY = 110;
  const gapX = 70;
  const gapY = 90;

  function rectPanel(x, y, panelWidth, panelHeight, label, realWidth, realHeight, fill) {
    return (
      <g key={label}>
        <rect
          x={x}
          y={y}
          width={panelWidth}
          height={panelHeight}
          fill={fill}
          stroke="#111827"
          strokeWidth="2"
        />

        <text
          x={x + panelWidth / 2}
          y={y - 12}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
        >
          {label}
        </text>

        <text
          x={x + panelWidth / 2}
          y={y - 28}
          textAnchor="middle"
          fontSize="12"
          fill="#B91C1C"
        >
          {toInchesFraction(realWidth)}
        </text>

        <text
          x={x + panelWidth + 12}
          y={y + panelHeight / 2}
          fontSize="12"
          fill="#1F2937"
        >
          {toInchesFraction(realHeight)}
        </text>
      </g>
    );
  }

  function drawExtensionPoint(p1, p2, distanceInInches, scale) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return null;

    const ux = dx / length;
    const uy = dy / length;

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    const dist = distanceInInches;

    const pointX = midX + ux * dist;
    const pointY = midY + uy * dist;

    return { x: pointX, y: pointY };
  }

  // Vertical S-panel:
  // top width = bottom width = panelWidth
  // left and right edges are S-curves
  function verticalSCurvePanel(x, y, panelWidth, panelHeight, shift, label, realWidth, realHeight, fill) {
    const c1 = panelHeight * 0.4;
    const c2 = panelHeight * 0.6;

    const p1 = { x: x, y: y };
    const p2 = { x: x + panelWidth, y: y };
    const p3 = { x: x - shift, y: y + panelHeight };
    const p4 = { x: x - shift + panelWidth, y: y + panelHeight };
    const rp = (shift**2 + (l*scale)**2)/(4*shift);

    const extensionPoint1 = drawExtensionPoint(p1, p2, -rp, scale);
    const extensionPoint2 = drawExtensionPoint(p3, p4, rp, scale);

    const path = `
      M ${x} ${y}
      L ${x + panelWidth} ${y}
      C ${x + panelWidth + 0.1*shift} ${y + c1},
        ${x + panelWidth - 1.1*shift} ${y + c2},
        ${x + panelWidth - shift} ${y + panelHeight}
      L ${x - shift} ${y + panelHeight}
      C ${x - 1.1*shift} ${y + c2},
        ${x + 0.1*shift} ${y + c1},
        ${x} ${y}
      Z
    `;

    return (
      <g key={label}>
        <path d={path} fill={fill} stroke="#111827" strokeWidth="2" />
        
        {extensionPoint1 && (
            <circle
                cx={extensionPoint1.x}
                cy={extensionPoint1.y}
                r={3}
                fill="blue"
            />
        )}

        {extensionPoint2 && (
            <circle
                cx={extensionPoint2.x}
                cy={extensionPoint2.y}
                r={3}
                fill="blue"
            />
        )}

        {extensionPoint1 && extensionPoint2 && (
            <line
                x1={extensionPoint1.x}
                y1={extensionPoint1.y}
                x2={extensionPoint2.x}
                y2={extensionPoint2.y}
                stroke="red"
                strokeWidth="2"
            />
        )}

        <text
          x={x - 100}
          y={y + 50}
          textAnchor="middle"
          fontSize="14"
          fontWeight="400"
          fill="#111827"
        >
            <tspan x={x - 100} dy="0">Radius point {toInchesFraction(Math.abs(rp)/scale)}</tspan>
            <tspan x={x - 100} dy="1.2em">from the center line</tspan>
        </text>

        <text
          x={x + panelWidth / 2}
          y={y - 12}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
        >
          {label}
        </text>

        <text
          x={x + panelWidth / 2}
          y={y - 28}
          textAnchor="middle"
          fontSize="12"
          fill="#B91C1C"
        >
          {toInchesFraction(realWidth)}
        </text>

        <text
          x={x + panelWidth + Math.abs(shift) + 12}
          y={y + panelHeight / 2}
          fontSize="12"
          fill="#1F2937"
        >
          {toInchesFraction(realHeight)}
        </text>
      </g>
    );
  }

  // Horizontal S-panel:
  // left height = right height = panelHeight
  // top and bottom edges are S-curves
  function horizontalSCurvePanel(x, y, panelWidth, panelHeight, shift, label, realWidth, realHeight, fill) {
    const c1 = panelWidth * 0.4;
    const c2 = panelWidth * 0.6;

    const p1 = { x: x, y: y };
    const p2 = { x: x + panelWidth, y: y };
    const p3 = { x: x - shift, y: y + panelHeight };
    const p4 = { x: x - shift + panelWidth, y: y + panelHeight };
    const rp = (shift**2 + (l*scale)**2)/(4*shift);

    const extensionPoint1 = {x:x + panelWidth, y: y + panelHeight/2 - shift + rp};
    const extensionPoint2 = {x:x , y: y + panelHeight/2 - rp};

    const path = `
      M ${x} ${y}
      C ${x + c1} ${y + 0.1*shift},
        ${x + c2} ${y - 1.1*shift},
        ${x + panelWidth} ${y - shift}
      L ${x + panelWidth} ${y + panelHeight - shift}
      C ${x + c2} ${y + panelHeight - 1.1*shift},
        ${x + c1} ${y + panelHeight + 0.1*shift},
        ${x} ${y + panelHeight}
      Z
    `;

    return (
      <g key={label}>
        <path d={path} fill={fill} stroke="#111827" strokeWidth="2" />
        
        {extensionPoint1 && (
            <circle
                cx={extensionPoint1.x}
                cy={extensionPoint1.y}
                r={3}
                fill="blue"
            />
        )}

        {extensionPoint2 && (
            <circle
                cx={extensionPoint2.x}
                cy={extensionPoint2.y}
                r={3}
                fill="blue"
            />
        )}

        {extensionPoint1 && extensionPoint2 && (
            <line
                x1={extensionPoint1.x}
                y1={extensionPoint1.y}
                x2={extensionPoint2.x}
                y2={extensionPoint2.y}
                stroke="red"
                strokeWidth="2"
            />
        )}

        <text
          x={x + 250}
          y={y + 50}
          textAnchor="middle"
          fontSize="14"
          fontWeight="400"
          fill="#111827"
        >
            <tspan x={x + 250} dy="0">Radius point {toInchesFraction(Math.abs(rp)/scale)}</tspan>
            <tspan x={x + 250} dy="1.2em">from the center line</tspan>
        </text>

        <text
          x={x + panelWidth / 2}
          y={y - signedShift/3 - 35}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
        >
          {label}
        </text>

        <text
          x={x + panelWidth / 2}
          y={y - signedShift/3 - 50}
          textAnchor="middle"
          fontSize="12"
          fill="#B91C1C"
        >
          {toInchesFraction(realWidth)}
        </text>

        <text
          x={x - 30}
          y={y + panelHeight / 2}
          fontSize="12"
          fill="#1F2937"
        >
          {toInchesFraction(realHeight)}
        </text>
      </g>
    );
  }

  const signedShift =
    direction === "left" || direction === "up" ? -drawO  : drawO ;

  const isHorizontalOffset = direction === "right" || direction === "left";

  const topX = startX;
  const topY = startY;

  const bottomX = startX;
  const bottomY = startY + drawL + gapY;

  const leftX = startX + drawW + gapX + Math.abs(signedShift);
  const leftY = startY ;

  const rightX = leftX;
  const rightY = bottomY ;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 1100 540"
        className="w-full h-auto border rounded-xl bg-white"
      >
        <text x="30" y="26" fontSize="18" fontWeight="600" fill="#111827">
          Offset Flat Pattern
        </text>

        <text x="30" y="52" fontSize="12" fill="#4B5563">
          Direction = {direction}, W = {toInchesFraction(w)}, H = {toInchesFraction(h)}, L = {toInchesFraction(l)}, Offset = {toInchesFraction(o)}
        </text>

        <text x="30" y="70" fontSize="12" fill="#4B5563">
          True Length = {toInchesFraction(trueLength)}
        </text>

        {isHorizontalOffset ? (
          <>
            {verticalSCurvePanel(
              topX,
              topY,
              drawW,
              drawL,
              signedShift,
              "Top Panel",
              w,
              trueLength,
              "#F9FAFB"
            )}

            {verticalSCurvePanel(
              bottomX,
              bottomY,
              drawW,
              drawL,
              signedShift,
              "Bottom Panel",
              w,
              trueLength,
              "#F3F4F6"
            )}

            {rectPanel(
              leftX,
              leftY,
              drawH,
              drawL,
              "Left Panel",
              h,
              trueLength,
              "#F9FAFB"
            )}

            {rectPanel(
              rightX,
              rightY,
              drawH,
              drawL,
              "Right Panel",
              h,
              trueLength,
              "#F3F4F6"
            )}
          </>
        ) : (
          <>
            {rectPanel(
              topX,
              topY,
              drawW,
              drawL,
              "Top Panel",
              w,
              trueLength,
              "#F9FAFB"
            )}

            {rectPanel(
              bottomX,
              bottomY,
              drawW,
              drawL,
              "Bottom Panel",
              w,
              trueLength,
              "#F3F4F6"
            )}

            {horizontalSCurvePanel(
              leftX,
              leftY+ signedShift/3,
              drawL,
              drawH,
              signedShift,
              "Left Panel",
              trueLength,
              h,
              "#F9FAFB"
            )}

            {horizontalSCurvePanel(
              rightX,
              rightY,
              drawL,
              drawH,
              signedShift,
              "Right Panel",
              trueLength,
              h,
              "#F3F4F6"
            )}
          </>
        )}

        <text x="30" y="470" fontSize="13" fill="#374151">
          True Length = {toInchesFraction(trueLength)}
        </text>

        <text x="30" y="490" fontSize="13" fill="#374151">
          {isHorizontalOffset
            ? `Top / Bottom = ${toInchesFraction(w)} × ${toInchesFraction(trueLength)}`
            : `Top / Bottom = ${toInchesFraction(w)} × ${toInchesFraction(trueLength)}`}
        </text>

        <text x="30" y="510" fontSize="13" fill="#374151">
          {isHorizontalOffset
            ? `Left / Right = ${toInchesFraction(h)} × ${toInchesFraction(trueLength)}`
            : `Left / Right = ${toInchesFraction(h)} × ${toInchesFraction(trueLength)}`}
        </text>
      </svg>
    </div>
  );
}

export function EndCupFlatPattern({
  width = "",
  height = "",
  flange = 1,
  className = "w-full max-w-sm",
}) {
  const w = Number(width) || 14;
  const h = Number(height) || 12;
  const f = flange !== undefined && flange !== "" ? Number(flange) : 1;

  // Visual scaling to fit nicely in 400x300 canvas
  const padding = 45;
  const availW = 400 - 2 * padding;
  const availH = 300 - 2 * padding;

  const effF = Math.min(f, (w - 0.1) / 2, (h - 0.1) / 2);
  const totalW = w + 2 * effF;
  const totalH = h + 2 * effF;

  const scale = Math.min(availW / totalW, availH / totalH);
  const drawW = w * scale;
  const drawH = h * scale;
  const drawF = effF * scale;
  const drawTotalW = totalW * scale;
  const drawTotalH = totalH * scale;

  const originX = (400 - drawTotalW) / 2;
  const originY = (300 - drawTotalH) / 2;

  // In SVG coordinates (Y down):
  // Inner rectangle corners:
  const ix = originX + drawF;
  const iy = originY + drawF;
  const iw = drawW;
  const ih = drawH;

  // Cut contour points:
  const x1 = originX;
  const x2 = originX + drawF;
  const x3 = originX + 2 * drawF;
  const x4 = originX + drawTotalW - 2 * drawF;
  const x5 = originX + drawTotalW - drawF;
  const x6 = originX + drawTotalW;

  const y1 = originY;
  const y2 = originY + drawF;
  const y3 = originY + 2 * drawF;
  const y4 = originY + drawTotalH - 2 * drawF;
  const y5 = originY + drawTotalH - drawF;
  const y6 = originY + drawTotalH;

  let cutPath = "";
  if (effF > 0.001) {
    cutPath = [
      `M ${x3} ${y1}`,
      `L ${x4} ${y1}`,
      `L ${x5} ${y2}`,
      `L ${x6} ${y3}`,
      `L ${x6} ${y4}`,
      `L ${x5} ${y5}`,
      `L ${x4} ${y6}`,
      `L ${x3} ${y6}`,
      `L ${x2} ${y5}`,
      `L ${x1} ${y4}`,
      `L ${x1} ${y3}`,
      `L ${x2} ${y2}`,
      `Z`,
    ].join(" ");
  } else {
    cutPath = `M ${originX} ${originY} L ${originX + drawW} ${originY} L ${originX + drawW} ${originY + drawH} L ${originX} ${originY + drawH} Z`;
  }

  const cx = originX + drawTotalW / 2;
  const cy = originY + drawTotalH / 2;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 400 300"
        className="w-full h-auto border rounded-xl bg-white shadow-xs"
      >
        <text x="20" y="24" fontSize="13" fontWeight="600" fill="#374151">
          End Cap Flat Pattern
        </text>

        {/* Centerlines (Dash-dot) */}
        <line
          x1="20"
          y1={cy}
          x2="380"
          y2={cy}
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="16 4 3 4"
        />
        <line
          x1={cx}
          y1="25"
          x2={cx}
          y2="285"
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="16 4 3 4"
        />

        {/* Outer Cut Contour */}
        <path
          d={cutPath}
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Bend Lines (Fold marks) */}
        {effF > 0.001 && (
          <g stroke="#dc2626" strokeWidth="1.2" strokeDasharray="5 3">
            <line x1={ix} y1={iy} x2={ix + iw} y2={iy} />
            <line x1={ix + iw} y1={iy} x2={ix + iw} y2={iy + ih} />
            <line x1={ix + iw} y1={iy + ih} x2={ix} y2={iy + ih} />
            <line x1={ix} y1={iy + ih} x2={ix} y2={iy} />
          </g>
        )}

        {/* Dimension Labels */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="13"
          fontWeight="600"
          fill="#1e293b"
        >
          {w}&quot; × {h}&quot;
          {f > 0 ? ` (Flange: ${f}″)` : ""}
        </text>

        {/* Width label on top */}
        <text
          x={cx}
          y={originY - 8}
          textAnchor="middle"
          fontSize="11"
          fontWeight="500"
          fill="#475569"
        >
          W = {w}&quot; (Total: {Math.round(totalW * 100) / 100}&quot;)
        </text>

        {/* Height label on right */}
        <text
          x={originX + drawTotalW + 8}
          y={cy}
          dominantBaseline="central"
          fontSize="11"
          fontWeight="500"
          fill="#475569"
        >
          H = {h}&quot;
        </text>
      </svg>
    </div>
  );
}