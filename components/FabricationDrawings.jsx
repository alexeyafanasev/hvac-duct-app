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

  // Упрощённая логика:
  // short way -> поворот по width
  // long way  -> поворот по height
  const turningSize = bendType === "long" ? h : w;
  const fixedSize = bendType === "long" ? w : h;

  const innerArc = angleRad * r;
  const centerArc = angleRad * (r + turningSize / 2);
  const outerArc = angleRad * (r + turningSize);

  const maxDrawWidth = 720;
  const maxDrawHeight = 220;

  const realPatternWidth = outerArc || 1;
  const realPatternHeight = fixedSize * 4 || 1;

  const scale = Math.min(
    maxDrawWidth / realPatternWidth,
    maxDrawHeight / realPatternHeight
  );

  const drawInner = innerArc * scale;
  const drawCenter = centerArc * scale;
  const drawOuter = outerArc * scale;

  const panelH = fixedSize * scale;

  const x0 = 40;
  const y0 = 70;

  const y1 = y0 + panelH;
  const y2 = y1 + panelH;
  const y3 = y2 + panelH;
  const y4 = y3 + panelH;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 900 420"
        className="w-full h-auto border rounded-xl bg-white"
      >
        <text x="40" y="26" fontSize="18" fontWeight="600" fill="#111827">
          Elbow Flat Pattern
        </text>

        <text x="40" y="46" fontSize="12" fill="#4B5563">
          Approximate panel development · {bendType === "long" ? "Long Way" : "Short Way"}
        </text>

        <text x="40" y="62" fontSize="12" fill="#4B5563">
          Angle = {a}°, Radius = {r}, Width = {w}, Height = {h}
        </text>

        {/* Panel 1 */}
        <polygon
          points={`
            ${x0},${y0}
            ${x0 + drawOuter},${y0}
            ${x0 + drawInner},${y1}
            ${x0},${y1}
          `}
          fill="#F9FAFB"
          stroke="#111827"
          strokeWidth="2"
        />

        {/* Panel 2 */}
        <polygon
          points={`
            ${x0},${y1}
            ${x0 + drawInner},${y1}
            ${x0 + drawOuter},${y2}
            ${x0},${y2}
          `}
          fill="#F3F4F6"
          stroke="#111827"
          strokeWidth="2"
        />

        {/* Panel 3 */}
        <polygon
          points={`
            ${x0},${y2}
            ${x0 + drawOuter},${y2}
            ${x0 + drawInner},${y3}
            ${x0},${y3}
          `}
          fill="#F9FAFB"
          stroke="#111827"
          strokeWidth="2"
        />

        {/* Panel 4 */}
        <polygon
          points={`
            ${x0},${y3}
            ${x0 + drawInner},${y3}
            ${x0 + drawOuter},${y4}
            ${x0},${y4}
          `}
          fill="#F3F4F6"
          stroke="#111827"
          strokeWidth="2"
        />

        {/* horizontal separators */}
        <line x1={x0} y1={y1} x2={x0 + drawOuter} y2={y1} stroke="#6B7280" strokeDasharray="6 4" />
        <line x1={x0} y1={y2} x2={x0 + drawOuter} y2={y2} stroke="#6B7280" strokeDasharray="6 4" />
        <line x1={x0} y1={y3} x2={x0 + drawOuter} y2={y3} stroke="#6B7280" strokeDasharray="6 4" />

        {/* panel labels */}
        <text x={x0 + 8} y={y0 + panelH / 2} fontSize="14" fontWeight="600" fill="#111827">
          Panel 1
        </text>
        <text x={x0 + 8} y={y1 + panelH / 2} fontSize="14" fontWeight="600" fill="#111827">
          Panel 2
        </text>
        <text x={x0 + 8} y={y2 + panelH / 2} fontSize="14" fontWeight="600" fill="#111827">
          Panel 3
        </text>
        <text x={x0 + 8} y={y3 + panelH / 2} fontSize="14" fontWeight="600" fill="#111827">
          Panel 4
        </text>

        {/* outer arc dimension */}
        <line
          x1={x0}
          y1={y0 - 20}
          x2={x0 + drawOuter}
          y2={y0 - 20}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line x1={x0} y1={y0 - 26} x2={x0} y2={y0 - 14} stroke="#111827" strokeWidth="1.5" />
        <line
          x1={x0 + drawOuter}
          y1={y0 - 26}
          x2={x0 + drawOuter}
          y2={y0 - 14}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <text
          x={x0 + drawOuter / 2}
          y={y0 - 28}
          textAnchor="middle"
          fontSize="13"
          fill="#111827"
        >
          Outer Arc = {outerArc ? outerArc.toFixed(2) : "-"}
        </text>

        {/* inner arc dimension */}
        <line
          x1={x0}
          y1={y4 + 20}
          x2={x0 + drawInner}
          y2={y4 + 20}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line x1={x0} y1={y4 + 14} x2={x0} y2={y4 + 26} stroke="#111827" strokeWidth="1.5" />
        <line
          x1={x0 + drawInner}
          y1={y4 + 14}
          x2={x0 + drawInner}
          y2={y4 + 26}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <text
          x={x0 + drawInner / 2}
          y={y4 + 38}
          textAnchor="middle"
          fontSize="13"
          fill="#111827"
        >
          Inner Arc = {innerArc ? innerArc.toFixed(2) : "-"}
        </text>

        {/* center arc label */}
        <text
          x={x0 + drawCenter + 20}
          y={y2}
          fontSize="14"
          fontWeight="600"
          fill="#B91C1C"
        >
          Center Arc = {centerArc ? centerArc.toFixed(2) : "-"}
        </text>

        {/* panel height dimension */}
        <line
          x1={x0 + drawOuter + 40}
          y1={y0}
          x2={x0 + drawOuter + 40}
          y2={y1}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line
          x1={x0 + drawOuter + 34}
          y1={y0}
          x2={x0 + drawOuter + 46}
          y2={y0}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line
          x1={x0 + drawOuter + 34}
          y1={y1}
          x2={x0 + drawOuter + 46}
          y2={y1}
          stroke="#111827"
          strokeWidth="1.5"
        />
        <text
          x={x0 + drawOuter + 58}
          y={(y0 + y1) / 2}
          transform={`rotate(90 ${x0 + drawOuter + 58} ${(y0 + y1) / 2})`}
          textAnchor="middle"
          fontSize="14"
          fill="#111827"
        >
          Panel Height = {fixedSize || "-"}
        </text>

        {/* summary */}
        <text x="40" y="360" fontSize="13" fill="#374151">
          Turning size = {turningSize || "-"} · Fixed side = {fixedSize || "-"}
        </text>
        <text x="40" y="380" fontSize="13" fill="#374151">
          This is an approximate fabrication layout for elbow panels, without seam/flange allowances.
        </text>
      </svg>
    </div>
  );
}