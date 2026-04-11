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
          {toInchesFraction(w) || "-"}
        </text>

        <text
          x={x1 + panel2 / 2}
          y={centerY}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#B91C1C"
        >
          {toInchesFraction(h) || "-"}
        </text>

        <text
          x={x2 + panel3 / 2}
          y={centerY}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#B91C1C"
        >
          {toInchesFraction(w) || "-"}
        </text>

        <text
          x={x3 + panel4 / 2}
          y={centerY}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#B91C1C"
        >
          {toInchesFraction(h) || "-"}
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
          Developed Width = {toInchesFraction(realFlatWidth) || "-"}
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
          Length = {toInchesFraction(l) || "-"}
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
          W = {toInchesFraction(w) || "-"}, H = {toInchesFraction(h) || "-"}, L = {toInchesFraction(l) || "-"}
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
  const turningSize = w;
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
  const L = Number(length) || 0;

  const dW = w1 - w2;
  const dH = h1 - h2;

  function getPanelBounds(panel) {
    const xs = [panel.p1.x, panel.p2.x, panel.p3.x, panel.p4.x];
    const ys = [panel.p1.y, panel.p2.y, panel.p3.y, panel.p4.y];

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
    const canvasHeight = 560;
    const padding = 40;

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
    return Math.sqrt(L ** 2 + x ** 2 + y ** 2);
  }

  // True slant lengths from 3D geometry

    // Top edge difference
    const topEdgeOffset = dy + dH / 2;

    // Bottom edge difference
    const bottomEdgeOffset = dy - dH / 2;

    // Left edge difference
    const leftEdgeOffset = dx + dW / 2;

    // Right edge difference
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

    function buildTruePanel(top, bottom, left, right) {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: top, y: 0 };

        if (top <= 0 || bottom <= 0) {
        return {
            p1,
            p2,
            p3: { x: top, y: 0 },
            p4: { x: 0, y: 0 },
            lengths: { top, right, bottom, left },
            rawHeight: 0,
        };
        }

    // Symmetric case: equal side lengths -> centered trapezoid
    if (Math.abs(left - right) < 0.0001) {
      const inset = (top - bottom) / 2;
      const h = Math.sqrt(Math.max(left ** 2 - inset ** 2, 0));

      return {
        p1,
        p2,
        p3: { x: inset + bottom, y: h },
        p4: { x: inset, y: h },
        lengths: { top, right, bottom, left },
        rawHeight: h,
      };
    }

    // General case:
    // p1=(0,0), p2=(top,0), p4=(x,h), p3=(x+bottom,h)
    // |p1-p4| = left
    // |p2-p3| = right
    const denom = 2 * (top - bottom);

    let x;
    if (Math.abs(denom) < 0.0001) {
      // If top ~= bottom, solve as near-parallelogram but keep bases horizontal
      x = (left ** 2 - right ** 2) / (4 * top || 0.0001);
    } else {
      x = (left ** 2 - right ** 2 + (top - bottom) ** 2) / denom;
    }

    const h = Math.sqrt(Math.max(left ** 2 - x ** 2, 0));

    return {
      p1,
      p2,
      p3: { x: x + bottom, y: h },
      p4: { x: x, y: h },
      lengths: { top, right, bottom, left },
      rawHeight: h,
    };
  }

  function normalizePanel(panel) {
    const minX = Math.min(panel.p1.x, panel.p2.x, panel.p3.x, panel.p4.x);
    const minY = Math.min(panel.p1.y, panel.p2.y, panel.p3.y, panel.p4.y);

    return {
      ...panel,
      p1: { x: panel.p1.x - minX, y: panel.p1.y - minY },
      p2: { x: panel.p2.x - minX, y: panel.p2.y - minY },
      p3: { x: panel.p3.x - minX, y: panel.p3.y - minY },
      p4: { x: panel.p4.x - minX, y: panel.p4.y - minY },
    };
  }

  const topPanelRaw = normalizePanel(buildTruePanel(w1, w2, topLeft, topRight));
  const bottomPanelRaw = normalizePanel(
    buildTruePanel(w1, w2, bottomLeft, bottomRight)
  );
  const leftPanelRaw = normalizePanel(
    buildTruePanel(h1, h2, leftTop, leftBottom)
  );
  const rightPanelRaw = normalizePanel(
    buildTruePanel(h1, h2, rightTop, rightBottom)
  );

  function getPanelSize(panel) {
    const xs = [panel.p1.x, panel.p2.x, panel.p3.x, panel.p4.x];
    const ys = [panel.p1.y, panel.p2.y, panel.p3.y, panel.p4.y];

    return {
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  }

    const topBounds = getPanelSize(topPanelRaw);
    const bottomBounds = getPanelSize(bottomPanelRaw);
    const leftBounds = getPanelSize(leftPanelRaw);
    const rightBounds = getPanelSize(rightPanelRaw);

  const maxPanelWidth = Math.max(
    topBounds.width,
    bottomBounds.width,
    leftBounds.width,
    rightBounds.width,
    1
  );
  const maxPanelHeight = Math.max(
    topBounds.height,
    bottomBounds.height,
    leftBounds.height,
    rightBounds.height,
    1
  );

  const targetPanelWidth = 300;
  const targetPanelHeight = 200;

  const scale = Math.min(
    targetPanelWidth / maxPanelWidth,
    targetPanelHeight / maxPanelHeight
  );

  function scaleAndPlacePanel(panel, offsetX, offsetY) {
    return {
      ...panel,
      p1: { x: panel.p1.x * scale + offsetX, y: panel.p1.y * scale + offsetY },
      p2: { x: panel.p2.x * scale + offsetX, y: panel.p2.y * scale + offsetY },
      p3: { x: panel.p3.x * scale + offsetX, y: panel.p3.y * scale + offsetY },
      p4: { x: panel.p4.x * scale + offsetX, y: panel.p4.y * scale + offsetY },
    };
  }

  const startX = 40;
  const startY = 110;
  const gapX = 70;
  const gapY = 90;

  const topPanel = scaleAndPlacePanel(topPanelRaw, startX, startY);
  const bottomPanel = scaleAndPlacePanel(
    bottomPanelRaw,
    startX ,
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
    return {
        ...panel,
        p1: {
        x: (panel.p1.x - combinedBounds.minX) * fitScale + drawingOffsetX,
        y: (panel.p1.y - combinedBounds.minY) * fitScale + drawingOffsetY,
        },
        p2: {
        x: (panel.p2.x - combinedBounds.minX) * fitScale + drawingOffsetX,
        y: (panel.p2.y - combinedBounds.minY) * fitScale + drawingOffsetY,
        },
        p3: {
        x: (panel.p3.x - combinedBounds.minX) * fitScale + drawingOffsetX,
        y: (panel.p3.y - combinedBounds.minY) * fitScale + drawingOffsetY,
        },
        p4: {
        x: (panel.p4.x - combinedBounds.minX) * fitScale + drawingOffsetX,
        y: (panel.p4.y - combinedBounds.minY) * fitScale + drawingOffsetY,
        },
    };
  }

  const fittedTopPanel = fitPanelToCanvas(topPanel);
  const fittedLeftPanel = fitPanelToCanvas(leftPanel);
  const fittedRightPanel = fitPanelToCanvas(rightPanel);
  const fittedBottomPanel = fitPanelToCanvas(bottomPanel);

  function panelPath(panel) {
    return `
      M ${panel.p1.x} ${panel.p1.y}
      L ${panel.p2.x} ${panel.p2.y}
      L ${panel.p3.x} ${panel.p3.y}
      L ${panel.p4.x} ${panel.p4.y}
      Z
    `;
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
    const labelY = Math.min(panel.p1.y, panel.p2.y) - 14;

    return (
      <g key={label}>
        <path
          d={panelPath(panel)}
          fill={color}
          stroke="#111827"
          strokeWidth="2"
        />

        <text
          x={labelX}
          y={labelY - 10}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
        >
          {label}
        </text>

        <text
          x={topMidX}
          y={topMidY - 8}
          textAnchor="middle"
          fontSize="12"
          fill="#B91C1C"
        >
          {toInchesFraction(panel.lengths.top)}
        </text>

        <text
          x={bottomMidX}
          y={bottomMidY + 18}
          textAnchor="middle"
          fontSize="12"
          fill="#B91C1C"
        >
          {toInchesFraction(panel.lengths.bottom)}
        </text>

        <text
          x={leftMidX - 10}
          y={leftMidY + 7}
          textAnchor="end"
          fontSize="12"
          fill="#1F2937"
        >
          {toInchesFraction(panel.lengths.left)}
        </text>

        <text
          x={rightMidX + 10}
          y={rightMidY - 7}
          textAnchor="start"
          fontSize="12"
          fill="#1F2937"
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
        ? `left ${Math.abs(dx).toFixed(1)}`
        : `right ${Math.abs(dx).toFixed(1)}`;

    const vertical =
      dy === 0
        ? "centered"
        : dy < 0
        ? `up ${Math.abs(dy).toFixed(1)}`
        : `down ${Math.abs(dy).toFixed(1)}`;

    return `Width offset: ${horizontal}, Height offset: ${vertical}`;
  }

  return (
    <div className={className}>
      <svg
        viewBox="0 0 1100 560"
        className="w-full h-auto border rounded-xl bg-white"
      >
        <text x="30" y="26" fontSize="18" fontWeight="600" fill="#111827">
          Transition Flat Pattern
        </text>

        <text x="30" y="52" fontSize="12" fill="#4B5563">
          Justification = {justification}, IN = {w1 || "-"} × {h1 || "-"}, OUT ={" "}
          {w2 || "-"} × {h2 || "-"}, L = {L || "-"}
        </text>

        <text x="30" y="70" fontSize="12" fill="#4B5563">
          {offsetText()}
        </text>

    {renderPanel(fittedTopPanel, "Top Panel", "#F9FAFB")}
    {renderPanel(fittedLeftPanel, "Left Panel", "#F9FAFB")}
    {renderPanel(fittedRightPanel, "Right Panel", "#F9FAFB")}
    {renderPanel(fittedBottomPanel, "Bottom Panel", "#F3F4F6")}

        <text x="30" y="470" fontSize="13" fill="#374151">
          Top Panel: top {toInchesFraction(topPanelRaw.lengths.top)}, bottom{" "}
          {toInchesFraction(topPanelRaw.lengths.bottom)}, left{" "}
          {toInchesFraction(topPanelRaw.lengths.left)}, right{" "}
          {toInchesFraction(topPanelRaw.lengths.right)}
        </text>

        <text x="30" y="490" fontSize="13" fill="#374151">
          Bottom Panel: top {toInchesFraction(bottomPanelRaw.lengths.top)}, bottom{" "}
          {toInchesFraction(bottomPanelRaw.lengths.bottom)}, left{" "}
          {toInchesFraction(bottomPanelRaw.lengths.left)}, right{" "}
          {toInchesFraction(bottomPanelRaw.lengths.right)}
        </text>

        <text x="30" y="510" fontSize="13" fill="#374151">
          Left Panel: top {toInchesFraction(leftPanelRaw.lengths.top)}, bottom{" "}
          {toInchesFraction(leftPanelRaw.lengths.bottom)}, left{" "}
          {toInchesFraction(leftPanelRaw.lengths.left)}, right{" "}
          {toInchesFraction(leftPanelRaw.lengths.right)}
        </text>

        <text x="30" y="530" fontSize="13" fill="#374151">
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

        <line
            x1={extensionPoint1.x}
            y1={extensionPoint1.y}
            x2={extensionPoint2.x}
            y2={extensionPoint2.y}
            stroke="red"
            strokeWidth="2"
        />

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

        <line
            x1={extensionPoint1.x}
            y1={extensionPoint1.y}
            x2={extensionPoint2.x}
            y2={extensionPoint2.y}
            stroke="red"
            strokeWidth="2"
        />

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