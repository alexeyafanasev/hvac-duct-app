/**
 * HVAC Duct 2D Flat Pattern Geometry Engine
 * Decomposes 3D duct fittings into 2D cut pieces with exact contours and bend lines.
 * All dimensions are in INCHES.
 */

/**
 * Format a number to 4 decimal places for CNC/G-code precision
 */
export function round4(n) {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Convert an order item into an array of individual 2D cut pieces (CutPiece).
 *
 * Each CutPiece contains:
 * - id: unique string
 * - itemId: parent order item id
 * - parentName: human-readable name of parent fitting
 * - partName: name of this specific piece (e.g. "Cheek #1", "Throat", "L-Section A")
 * - type: fitting sub-type
 * - width: bounding box width in inches
 * - height: bounding box height in inches
 * - area: cut area in sq inches
 * - segments: array of contour path commands (M, L, A)
 * - bendLines: array of { x1, y1, x2, y2, label } in local coordinates
 */
export function decomposeItemToCutPieces(item, options = {}) {
  const pieces = [];
  const qty = Math.max(1, Number(item.quantity) || 1);
  const straightMode = options.straightMode || "l-shape"; // "l-shape" (2 pieces) or "full" (1 piece wrapper)
  const flangeAllowance = Number(options.flangeAllowance) || 0; // extra flange length allowance

  for (let q = 1; q <= qty; q++) {
    const qtySuffix = qty > 1 ? ` (${q}/${qty})` : "";

    switch (item.type) {
      case "straight": {
        const w = Number(item.width) || 0;
        const h = Number(item.height) || 0;
        const l = (Number(item.length) || 0) + flangeAllowance;

        if (w <= 0 || h <= 0 || l <= 0) break;

        if (straightMode === "full") {
          // 1 full wrapper: 2W + 2H by L
          const totalW = round4(2 * w + 2 * h);
          const bendLines = [
            { x1: round4(w), y1: 0, x2: round4(w), y2: l, label: "Fold" },
            { x1: round4(w + h), y1: 0, x2: round4(w + h), y2: l, label: "Fold" },
            { x1: round4(2 * w + h), y1: 0, x2: round4(2 * w + h), y2: l, label: "Fold" },
          ];

          pieces.push({
            id: `${item.id}-wrapper-${q}`,
            itemId: item.id,
            parentName: `${item.name || "Straight"} ${w}"x${h}"x${l}"${qtySuffix}`,
            partName: `Wrapper`,
            type: "straight",
            ductLength: round4(l),
            width: totalW,
            height: round4(l),
            area: round4(totalW * l),
            segments: createRectSegments(totalW, l),
            bendLines,
          });
        } else {
          // 2 L-shaped sections: each (W + H) by L with fold line at W
          for (let s = 1; s <= 2; s++) {
            const pieceW = round4(w + h);
            pieces.push({
              id: `${item.id}-lsec-${s}-${q}`,
              itemId: item.id,
              parentName: `${item.name || "Straight"} ${w}"x${h}"x${l}"${qtySuffix}`,
              partName: `L-Section ${s === 1 ? "A" : "B"}`,
              type: "straight",
              ductLength: round4(l),
              width: pieceW,
              height: round4(l),
              area: round4(pieceW * l),
              segments: createRectSegments(pieceW, l),
              bendLines: [
                { x1: round4(w), y1: 0, x2: round4(w), y2: l, label: "Fold" },
              ],
            });
          }
        }
        break;
      }

      case "elbow": {
        const w = Number(item.width) || 0;
        const h = Number(item.height) || 0;
        const r = Number(item.radius) || 0;
        const angleDeg = Number(item.angle) || 90;
        const bendType = item.bendType || (h >= w ? "short" : "long");

        if (w <= 0 || h <= 0) break;

        const turningSize = bendType === "long" ? h : w;
        const fixedSide = bendType === "long" ? w : h;
        const angleRad = (angleDeg * Math.PI) / 180;
        const rOuter = round4(r + turningSize);

        // 1. Two Cheeks - Quarter circle with square cutout
        for (let c = 1; c <= 2; c++) {
          const cheek = createElbowCheek(r, turningSize, angleDeg);
          pieces.push({
            id: `${item.id}-cheek-${c}-${q}`,
            itemId: item.id,
            parentName: `${item.name || "Elbow"} ${w}"x${h}" R=${r}" ${angleDeg}°${qtySuffix}`,
            partName: `Cheek ${c}`,
            type: "elbow-cheek",
            width: cheek.width,
            height: cheek.height,
            area: cheek.area,
            segments: cheek.segments,
            bendLines: [],
          });
        }

        // 2. Throat (inner side) - flat rectangle: 2 * r by fixedSide with 90° bend line at r
        if (r > 0) {
          const throatLength = round4(2 * r);
          pieces.push({
            id: `${item.id}-throat-${q}`,
            itemId: item.id,
            parentName: `${item.name || "Elbow"} ${w}"x${h}" R=${r}"${qtySuffix}`,
            partName: "Throat (Inner)",
            type: "elbow-throat",
            width: throatLength,
            height: round4(fixedSide),
            area: round4(throatLength * fixedSide),
            segments: createRectSegments(throatLength, fixedSide),
            bendLines: [
              {
                x1: round4(r),
                y1: 0,
                x2: round4(r),
                y2: round4(fixedSide),
                label: "Bend 90°",
              },
            ],
          });
        }

        // 3. Heel (outer side) - flat rectangle: developed outer arc by fixedSide
        const heelLength = round4(angleRad * rOuter);
        pieces.push({
          id: `${item.id}-heel-${q}`,
          itemId: item.id,
          parentName: `${item.name || "Elbow"} ${w}"x${h}" R=${r}"${qtySuffix}`,
          partName: "Heel (Outer)",
          type: "elbow-heel",
          width: heelLength,
          height: round4(fixedSide),
          area: round4(heelLength * fixedSide),
          segments: createRectSegments(heelLength, fixedSide),
          bendLines: [],
        });
        break;
      }

      case "transition": {
        const w1 = Number(item.width1) || 0;
        const h1 = Number(item.height1) || 0;
        const w2 = Number(item.width2) || 0;
        const h2 = Number(item.height2) || 0;
        const l = Number(item.length) || 0;

        if (w1 <= 0 || h1 <= 0 || w2 <= 0 || h2 <= 0 || l <= 0) break;

        // Top & Bottom panels (width transition: w1 to w2, slant based on (h1-h2)/2)
        const hDiff = Math.abs(h1 - h2) / 2;
        const topBottomSlant = round4(Math.sqrt(l * l + hDiff * hDiff));

        const wDiff = Math.abs(w1 - w2) / 2;
        const leftRightSlant = round4(Math.sqrt(l * l + wDiff * wDiff));

        // Top panel
        const topPanel = createTrapezoid(w1, w2, topBottomSlant);
        pieces.push({
          id: `${item.id}-trans-top-${q}`,
          itemId: item.id,
          parentName: `${item.name || "Transition"} ${w1}x${h1} → ${w2}x${h2}${qtySuffix}`,
          partName: "Top Panel",
          type: "transition-panel",
          width: topPanel.width,
          height: topPanel.height,
          area: topPanel.area,
          segments: topPanel.segments,
          bendLines: [],
        });

        // Bottom panel
        const botPanel = createTrapezoid(w1, w2, topBottomSlant);
        pieces.push({
          id: `${item.id}-trans-bot-${q}`,
          itemId: item.id,
          parentName: `${item.name || "Transition"} ${w1}x${h1} → ${w2}x${h2}${qtySuffix}`,
          partName: "Bottom Panel",
          type: "transition-panel",
          width: botPanel.width,
          height: botPanel.height,
          area: botPanel.area,
          segments: botPanel.segments,
          bendLines: [],
        });

        // Left panel
        const leftPanel = createTrapezoid(h1, h2, leftRightSlant);
        pieces.push({
          id: `${item.id}-trans-left-${q}`,
          itemId: item.id,
          parentName: `${item.name || "Transition"} ${w1}x${h1} → ${w2}x${h2}${qtySuffix}`,
          partName: "Left Panel",
          type: "transition-panel",
          width: leftPanel.width,
          height: leftPanel.height,
          area: leftPanel.area,
          segments: leftPanel.segments,
          bendLines: [],
        });

        // Right panel
        const rightPanel = createTrapezoid(h1, h2, leftRightSlant);
        pieces.push({
          id: `${item.id}-trans-right-${q}`,
          itemId: item.id,
          parentName: `${item.name || "Transition"} ${w1}x${h1} → ${w2}x${h2}${qtySuffix}`,
          partName: "Right Panel",
          type: "transition-panel",
          width: rightPanel.width,
          height: rightPanel.height,
          area: rightPanel.area,
          segments: rightPanel.segments,
          bendLines: [],
        });
        break;
      }

      case "offset": {
        const w = Number(item.width) || 0;
        const h = Number(item.height) || 0;
        const l = Number(item.length) || 0;
        const o = Number(item.offset) || 0;
        const dir = item.direction || "right";

        if (w <= 0 || h <= 0 || l <= 0 || o <= 0) break;

        const isHorizontal = dir === "right" || dir === "left";
        const offsetDim = isHorizontal ? w : h;
        const fixedDim = isHorizontal ? h : w;

        // Radius of tangent circular arcs: rp = (o^2 + l^2) / (4 * o)
        const r = (o * o + l * l) / (4 * o);
        const alpha = Math.asin(Math.min(1, l / (2 * r)));
        const developedCurveLength = round4(2 * r * alpha);

        // 1. Two S-Curved Panels (Top & Bottom if horizontal, or Left & Right if vertical)
        const sPanel = createOffsetSCurvePanel(l, offsetDim, o);
        for (let c = 1; c <= 2; c++) {
          const name = isHorizontal
            ? (c === 1 ? "Top Panel" : "Bottom Panel")
            : (c === 1 ? "Left Panel" : "Right Panel");

          pieces.push({
            id: `${item.id}-offset-spanel-${c}-${q}`,
            itemId: item.id,
            parentName: `${item.name || "Offset"} ${w}"x${h}" L=${l}" O=${o}"${qtySuffix}`,
            partName: `${name} (S-Curve)`,
            type: "offset-panel",
            width: sPanel.width,
            height: sPanel.height,
            area: sPanel.area,
            segments: sPanel.segments,
            bendLines: [],
          });
        }

        // 2. Two Flat Rectangular Panels (Left & Right if horizontal, or Top & Bottom if vertical)
        for (let wr = 1; wr <= 2; wr++) {
          const name = isHorizontal
            ? (wr === 1 ? "Left Panel" : "Right Panel")
            : (wr === 1 ? "Top Panel" : "Bottom Panel");

          pieces.push({
            id: `${item.id}-offset-rect-${wr}-${q}`,
            itemId: item.id,
            parentName: `${item.name || "Offset"} ${w}"x${h}" L=${l}" O=${o}"${qtySuffix}`,
            partName: `${name} (Flat)`,
            type: "offset-rect",
            width: developedCurveLength,
            height: round4(fixedDim),
            area: round4(developedCurveLength * fixedDim),
            segments: createRectSegments(developedCurveLength, fixedDim),
            bendLines: [],
          });
        }
        break;
      }

      case "endcup": {
        const w = Number(item.width) || 0;
        const h = Number(item.height) || 0;
        const flange = 1.0; // 1 inch flange fold on all 4 sides

        if (w <= 0 || h <= 0) break;

        const totalW = round4(w + 2 * flange);
        const totalH = round4(h + 2 * flange);

        // Notched rectangle with 45-degree corner cutouts
        const endcup = createNotchedFlangePlate(w, h, flange);
        pieces.push({
          id: `${item.id}-endcup-${q}`,
          itemId: item.id,
          parentName: `${item.name || "End Cap"} ${w}"x${h}"${qtySuffix}`,
          partName: "End Cap Plate",
          type: "endcup",
          width: totalW,
          height: totalH,
          area: round4(totalW * totalH - 4 * (0.5 * flange * flange)),
          segments: endcup.segments,
          bendLines: [
            { x1: flange, y1: flange, x2: flange + w, y2: flange, label: "Fold" },
            { x1: flange + w, y1: flange, x2: flange + w, y2: flange + h, label: "Fold" },
            { x1: flange + w, y1: flange + h, x2: flange, y2: flange + h, label: "Fold" },
            { x1: flange, y1: flange + h, x2: flange, y2: flange, label: "Fold" },
          ],
        });
        break;
      }

      default:
        break;
    }
  }

  return pieces;
}

/**
 * Creates standard rectangle contour segments [M, L, L, L, Z]
 */
function createRectSegments(w, h) {
  return [
    { cmd: "M", x: 0, y: 0 },
    { cmd: "L", x: w, y: 0 },
    { cmd: "L", x: w, y: h },
    { cmd: "L", x: 0, y: h },
    { cmd: "Z", x: 0, y: 0 },
  ];
}

/**
 * Creates an elbow cheek contour:
 * For 90 degrees: A quarter-circle of radius rOuter = (r + turningSize)
 * with a square cutout of size r x r at the inner corner.
 */
function createElbowCheek(r, turningSize, angleDeg = 90) {
  const rOuter = round4(r + turningSize);

  if (angleDeg === 90) {
    if (r > 0) {
      // 90-degree standard elbow cheek with r x r square cutout
      const segments = [
        { cmd: "M", x: 0, y: r },
        { cmd: "L", x: r, y: r },
        { cmd: "L", x: r, y: 0 },
        { cmd: "L", x: rOuter, y: 0 },
        {
          cmd: "A",
          x: 0,
          y: rOuter,
          r: rOuter,
          cw: false, // CCW in Cartesian (from angle 0 to 90 deg)
          largeArc: false,
          cx: 0,
          cy: 0,
        },
        { cmd: "L", x: 0, y: r },
        { cmd: "Z", x: 0, y: r },
      ];

      const area = round4((Math.PI / 4) * rOuter * rOuter - r * r);

      return {
        width: rOuter,
        height: rOuter,
        area,
        segments,
      };
    } else {
      // 90-degree zero-radius sharp throat elbow cheek
      const segments = [
        { cmd: "M", x: 0, y: 0 },
        { cmd: "L", x: rOuter, y: 0 },
        {
          cmd: "A",
          x: 0,
          y: rOuter,
          r: rOuter,
          cw: false,
          largeArc: false,
          cx: 0,
          cy: 0,
        },
        { cmd: "L", x: 0, y: 0 },
        { cmd: "Z", x: 0, y: 0 },
      ];

      const area = round4((Math.PI / 4) * rOuter * rOuter);

      return {
        width: rOuter,
        height: rOuter,
        area,
        segments,
      };
    }
  }

  // Generalized angle
  const angleRad = (angleDeg * Math.PI) / 180;
  const p1 = { x: r, y: 0 };
  const p2 = { x: round4(r * Math.cos(angleRad)), y: round4(r * Math.sin(angleRad)) };
  const p3 = { x: round4(rOuter * Math.cos(angleRad)), y: round4(rOuter * Math.sin(angleRad)) };
  const p4 = { x: rOuter, y: 0 };

  const minX = Math.min(0, p1.x, p2.x, p3.x, p4.x);
  const minY = Math.min(0, p1.y, p2.y, p3.y, p4.y);
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

  const dx = -minX;
  const dy = -minY;

  const segments = [
    { cmd: "M", x: round4(p1.x + dx), y: round4(p1.y + dy) },
    { cmd: "L", x: round4(dx), y: round4(dy) },
    { cmd: "L", x: round4(p2.x + dx), y: round4(p2.y + dy) },
    { cmd: "L", x: round4(p3.x + dx), y: round4(p3.y + dy) },
    {
      cmd: "A",
      x: round4(p4.x + dx),
      y: round4(p4.y + dy),
      r: rOuter,
      cw: false,
      largeArc: angleDeg > 180,
      cx: dx,
      cy: dy,
    },
    { cmd: "Z", x: round4(p1.x + dx), y: round4(p1.y + dy) },
  ];

  return {
    width: round4(maxX - minX),
    height: round4(maxY - minY),
    area: round4((angleRad / 2) * rOuter * rOuter - (r * r) / 2),
    segments,
  };
}

/**
 * Creates a symmetric trapezoid flat panel
 */
function createTrapezoid(b1, b2, height) {
  const maxB = Math.max(b1, b2);
  const x0 = round4((maxB - b1) / 2);
  const x1 = round4(x0 + b1);
  const x2 = round4((maxB - b2) / 2 + b2);
  const x3 = round4((maxB - b2) / 2);

  const segments = [
    { cmd: "M", x: x0, y: 0 },
    { cmd: "L", x: x1, y: 0 },
    { cmd: "L", x: x2, y: height },
    { cmd: "L", x: x3, y: height },
    { cmd: "Z", x: x0, y: 0 },
  ];

  return {
    width: round4(maxB),
    height: round4(height),
    area: round4(0.5 * (b1 + b2) * height),
    segments,
  };
}

/**
 * Creates an offset S-shaped panel constructed from two tangent circular arcs
 * of radius R = (shift^2 + length^2) / (4 * shift) on each side.
 */
function createOffsetSCurvePanel(length, panelWidth, offset) {
  const l = Number(length) || 0;
  const wp = Number(panelWidth) || 0;
  const s = Math.abs(Number(offset)) || 0;

  if (s <= 0.001) {
    return {
      width: round4(l),
      height: round4(wp),
      area: round4(l * wp),
      segments: createRectSegments(l, wp),
    };
  }

  // Radius of the two tangent arcs: rp = (s^2 + l^2) / (4 * s)
  const r = round4((s * s + l * l) / (4 * s));
  const midX = round4(l / 2);
  const midY = round4(s / 2);

  // 4 Arcs forming the smooth S-panel:
  // Side 1 (bottom curve):
  // - Arc 1: (0, 0) -> (midX, midY), center (0, r), CCW (cw: false)
  // - Arc 2: (midX, midY) -> (l, s), center (l, s - r), CW (cw: true)
  // Right straight end: (l, s) -> (l, s + wp)
  // Side 2 (top curve):
  // - Arc 4: (l, s + wp) -> (midX, midY + wp), center (l, s - r + wp), CCW (cw: false)
  // - Arc 3: (midX, midY + wp) -> (0, wp), center (0, r + wp), CW (cw: true)
  // Left straight end: (0, wp) -> (0, 0)
  const segments = [
    { cmd: "M", x: 0, y: 0 },
    {
      cmd: "A",
      x: midX,
      y: midY,
      r: r,
      cw: false,
      largeArc: false,
      cx: 0,
      cy: r,
    },
    {
      cmd: "A",
      x: round4(l),
      y: round4(s),
      r: r,
      cw: true,
      largeArc: false,
      cx: round4(l),
      cy: round4(s - r),
    },
    { cmd: "L", x: round4(l), y: round4(s + wp) },
    {
      cmd: "A",
      x: midX,
      y: round4(midY + wp),
      r: r,
      cw: false,
      largeArc: false,
      cx: round4(l),
      cy: round4(s - r + wp),
    },
    {
      cmd: "A",
      x: 0,
      y: round4(wp),
      r: r,
      cw: true,
      largeArc: false,
      cx: 0,
      cy: round4(r + wp),
    },
    { cmd: "L", x: 0, y: 0 },
    { cmd: "Z", x: 0, y: 0 },
  ];

  return {
    width: round4(l),
    height: round4(wp + s),
    area: round4(l * wp),
    radiusPoint: r,
    segments,
  };
}

/**
 * Creates an end cap flat plate with 45-degree corner notches for folding flanges
 */
function createNotchedFlangePlate(w, h, f) {
  const totalW = round4(w + 2 * f);
  const totalH = round4(h + 2 * f);

  const segments = [
    { cmd: "M", x: f, y: 0 },
    { cmd: "L", x: round4(f + w), y: 0 },
    { cmd: "L", x: totalW, y: f },
    { cmd: "L", x: totalW, y: round4(f + h) },
    { cmd: "L", x: round4(f + w), y: totalH },
    { cmd: "L", x: f, y: totalH },
    { cmd: "L", x: 0, y: round4(f + h) },
    { cmd: "L", x: 0, y: f },
    { cmd: "Z", x: f, y: 0 },
  ];

  return {
    segments,
  };
}
