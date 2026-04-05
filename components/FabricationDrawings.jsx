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