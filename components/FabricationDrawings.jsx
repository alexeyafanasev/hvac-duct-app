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
  const L = Number(length) || 0;

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

  function getPanelBounds(panel) {
    const xs = [panel.p1.x, panel.p2.x, panel.p3.x, panel.p4.x];
    const ys = [panel.p1.y, panel.p2.y, panel.p3.y, panel.p4.y];

    return {
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  }

  const topBounds = getPanelBounds(topPanelRaw);
  const bottomBounds = getPanelBounds(bottomPanelRaw);
  const leftBounds = getPanelBounds(leftPanelRaw);
  const rightBounds = getPanelBounds(rightPanelRaw);

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

  const targetPanelWidth = 250;
  const targetPanelHeight = 150;

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

  const startX = 450;
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


  function panelPath(panel) {
    return `
      M ${panel.p1.x} ${panel.p1.y}
      L ${panel.p2.x} ${panel.p2.y}
      L ${panel.p3.x} ${panel.p3.y}
      L ${panel.p4.x} ${panel.p4.y}
      Z
    `;
  }

  function formatNum(value) {
    return Number.isFinite(value) ? value.toFixed(1) : "-";
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
          {formatNum(panel.lengths.top)}
        </text>

        <text
          x={bottomMidX}
          y={bottomMidY + 18}
          textAnchor="middle"
          fontSize="12"
          fill="#B91C1C"
        >
          {formatNum(panel.lengths.bottom)}
        </text>

        <text
          x={leftMidX - 10}
          y={leftMidY}
          textAnchor="end"
          fontSize="12"
          fill="#1F2937"
        >
          {formatNum(panel.lengths.left)}
        </text>

        <text
          x={rightMidX + 10}
          y={rightMidY}
          textAnchor="start"
          fontSize="12"
          fill="#1F2937"
        >
          {formatNum(panel.lengths.right)}
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

        {renderPanel(topPanel, "Top Panel", "#F9FAFB")}
        {renderPanel(leftPanel, "Left Panel", "#F9FAFB")}
        {renderPanel(rightPanel, "Right Panel", "#F9FAFB")}
        {renderPanel(bottomPanel, "Bottom Panel", "#F3F4F6")}

        <text x="30" y="470" fontSize="13" fill="#374151">
          Top Panel: top {formatNum(topPanelRaw.lengths.top)}, bottom{" "}
          {formatNum(topPanelRaw.lengths.bottom)}, left{" "}
          {formatNum(topPanelRaw.lengths.left)}, right{" "}
          {formatNum(topPanelRaw.lengths.right)}
        </text>

        <text x="30" y="490" fontSize="13" fill="#374151">
          Bottom Panel: top {formatNum(bottomPanelRaw.lengths.top)}, bottom{" "}
          {formatNum(bottomPanelRaw.lengths.bottom)}, left{" "}
          {formatNum(bottomPanelRaw.lengths.left)}, right{" "}
          {formatNum(bottomPanelRaw.lengths.right)}
        </text>

        <text x="30" y="510" fontSize="13" fill="#374151">
          Left Panel: top {formatNum(leftPanelRaw.lengths.top)}, bottom{" "}
          {formatNum(leftPanelRaw.lengths.bottom)}, left{" "}
          {formatNum(leftPanelRaw.lengths.left)}, right{" "}
          {formatNum(leftPanelRaw.lengths.right)}
        </text>

        <text x="30" y="530" fontSize="13" fill="#374151">
          Right Panel: top {formatNum(rightPanelRaw.lengths.top)}, bottom{" "}
          {formatNum(rightPanelRaw.lengths.bottom)}, left{" "}
          {formatNum(rightPanelRaw.lengths.left)}, right{" "}
          {formatNum(rightPanelRaw.lengths.right)}
        </text>
      </svg>
    </div>
  );
}