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
        const rawL = Number(item.length) || 0;

        if (w <= 0 || h <= 0 || rawL <= 0) break;

        // Cut length rule:
        // If ordered length == 48" => cut length = 48" (standard sheet width, no length trim)
        // If ordered length < 48" => cut length = ordered length - 1"
        // (If ordered length > 48" and not 48", cutL = max(0, rawL - 1))
        const cutL = round4(Math.abs(rawL - 48) < 1e-4 ? 48.0 : Math.max(0, rawL - 1.0));
        if (cutL <= 0) break;

        const pocketAllowance = 1.0; // 1" for Pittsburgh pocket on one long side
        const flangeAllowance = 0.25; // 1/4" for Pittsburgh flange on second long side
        const cleatNotch = 1.0; // 1" end notch on corners for S-cleat and Drive-cleat

        if (straightMode === "full") {
          // 1 full wrapper: body width = 2W + 2H
          const bodyW = round4(2 * w + 2 * h);
          const notched = createStraightNotchedSegments(
            bodyW,
            cutL,
            pocketAllowance,
            flangeAllowance,
            cleatNotch
          );
          const bendLines = [
            { x1: round4(pocketAllowance + w), y1: 0, x2: round4(pocketAllowance + w), y2: cutL, label: "Fold" },
            { x1: round4(pocketAllowance + w + h), y1: 0, x2: round4(pocketAllowance + w + h), y2: cutL, label: "Fold" },
            { x1: round4(pocketAllowance + 2 * w + h), y1: 0, x2: round4(pocketAllowance + 2 * w + h), y2: cutL, label: "Fold" },
            { x1: round4(pocketAllowance), y1: round4(cleatNotch), x2: round4(pocketAllowance), y2: round4(cutL - cleatNotch), label: "Pittsburgh Lock" },
            { x1: round4(pocketAllowance + bodyW), y1: round4(cleatNotch), x2: round4(pocketAllowance + bodyW), y2: round4(cutL - cleatNotch), label: "Flange (1/4\")" },
          ];

          pieces.push({
            id: `${item.id}-wrapper-${q}`,
            itemId: item.id,
            parentName: `${item.name || "Straight"} ${w}"x${h}"x${rawL}"${qtySuffix}`,
            partName: `Wrapper`,
            type: "straight",
            ductLength: cutL,
            orderedLength: rawL,
            width: notched.width,
            height: notched.height,
            area: notched.area,
            segments: notched.segments,
            bendLines,
          });
        } else {
          // 2 L-shaped sections: each body width (W + H)
          const bodyW = round4(w + h);
          for (let s = 1; s <= 2; s++) {
            const notched = createStraightNotchedSegments(
              bodyW,
              cutL,
              pocketAllowance,
              flangeAllowance,
              cleatNotch
            );
            const bendLines = [
              { x1: round4(pocketAllowance + w), y1: 0, x2: round4(pocketAllowance + w), y2: cutL, label: "Fold" },
              { x1: round4(pocketAllowance), y1: round4(cleatNotch), x2: round4(pocketAllowance), y2: round4(cutL - cleatNotch), label: "Pittsburgh Lock" },
              { x1: round4(pocketAllowance + bodyW), y1: round4(cleatNotch), x2: round4(pocketAllowance + bodyW), y2: round4(cutL - cleatNotch), label: "Flange (1/4\")" },
            ];

            pieces.push({
              id: `${item.id}-lsec-${s}-${q}`,
              itemId: item.id,
              parentName: `${item.name || "Straight"} ${w}"x${h}"x${rawL}"${qtySuffix}`,
              partName: `L-Section ${s === 1 ? "A" : "B"}`,
              type: "straight",
              ductLength: cutL,
              orderedLength: rawL,
              width: notched.width,
              height: notched.height,
              area: notched.area,
              segments: notched.segments,
              bendLines,
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
        const rawL = Number(item.length) || 0;
        const justification = item.justification || "center";

        if (w1 <= 0 || h1 <= 0 || w2 <= 0 || h2 <= 0 || rawL <= 0) break;

        // Transition trapezoid body height is 1" less than ordered size:
        const lBody = Math.max(1, rawL - 1.0);

        const dW = w1 - w2;
        const dH = h1 - h2;
        const { dx, dy } = getTransitionOffsets(justification, dW, dH);
        const trueLength = (x, y) => Math.sqrt(lBody * lBody + x * x + y * y);

        // Slant offsets from 3D geometry
        const topEdgeOffset = dy + dH / 2;
        const bottomEdgeOffset = dy - dH / 2;
        const leftEdgeOffset = dx + dW / 2;
        const rightEdgeOffset = dx - dW / 2;

        // Allowances per user specification:
        // - Left & Right panels: 1.0" Pittsburgh pockets on BOTH lateral sides (p = 1.0, f = 1.0)
        // - Top & Bottom panels: 0.25" Pittsburgh flanges on BOTH lateral sides (p = 0.25, f = 0.25)
        // - Transverse base ends: 1.0" flange along bases for S-cleat and Drive-cleat (cleatNotch = 1.0)
        const cleatNotch = 1.0;

        const topBottomOpts = {
          leftAllowance: 0.25,
          rightAllowance: 0.25,
          cleatNotch,
          leftType: "pittsburgh-flange",
          rightType: "pittsburgh-flange",
          leftLabel: "Pittsburgh Flange (1/4″)",
          rightLabel: "Pittsburgh Flange (1/4″)",
        };

        const leftRightOpts = {
          leftAllowance: 1.0,
          rightAllowance: 1.0,
          cleatNotch,
          leftType: "pittsburgh-pocket",
          rightType: "pittsburgh-pocket",
          leftLabel: "Pittsburgh Pocket (1″)",
          rightLabel: "Pittsburgh Pocket (1″)",
        };

        // 1. Top Panel (bases w1 to w2, side slants topLeft & topRight)
        const topLeft = trueLength(leftEdgeOffset, topEdgeOffset);
        const topRight = trueLength(rightEdgeOffset, topEdgeOffset);
        const topPanel = createTransitionNotchedPanel(w1, w2, topLeft, topRight, topBottomOpts);
        pieces.push({
          id: `${item.id}-trans-top-${q}`,
          itemId: item.id,
          parentName: `${item.name || "Transition"} ${w1}x${h1} → ${w2}x${h2}${qtySuffix}`,
          partName: "Top Panel",
          type: "transition-panel",
          orderedLength: rawL,
          width: topPanel.width,
          height: topPanel.height,
          area: topPanel.area,
          segments: topPanel.segments,
          bendLines: topPanel.bendLines,
        });

        // 2. Bottom Panel (bases w1 to w2, side slants bottomLeft & bottomRight)
        const bottomLeft = trueLength(leftEdgeOffset, bottomEdgeOffset);
        const bottomRight = trueLength(rightEdgeOffset, bottomEdgeOffset);
        const botPanel = createTransitionNotchedPanel(w1, w2, bottomLeft, bottomRight, topBottomOpts);
        pieces.push({
          id: `${item.id}-trans-bot-${q}`,
          itemId: item.id,
          parentName: `${item.name || "Transition"} ${w1}x${h1} → ${w2}x${h2}${qtySuffix}`,
          partName: "Bottom Panel",
          type: "transition-panel",
          orderedLength: rawL,
          width: botPanel.width,
          height: botPanel.height,
          area: botPanel.area,
          segments: botPanel.segments,
          bendLines: botPanel.bendLines,
        });

        // 3. Left Panel (bases h1 to h2, side slants leftTop & leftBottom)
        const leftTop = trueLength(leftEdgeOffset, topEdgeOffset);
        const leftBottom = trueLength(leftEdgeOffset, bottomEdgeOffset);
        const leftPanel = createTransitionNotchedPanel(h1, h2, leftTop, leftBottom, leftRightOpts);
        pieces.push({
          id: `${item.id}-trans-left-${q}`,
          itemId: item.id,
          parentName: `${item.name || "Transition"} ${w1}x${h1} → ${w2}x${h2}${qtySuffix}`,
          partName: "Left Panel",
          type: "transition-panel",
          orderedLength: rawL,
          width: leftPanel.width,
          height: leftPanel.height,
          area: leftPanel.area,
          segments: leftPanel.segments,
          bendLines: leftPanel.bendLines,
        });

        // 4. Right Panel (bases h1 to h2, side slants rightTop & rightBottom)
        const rightTop = trueLength(rightEdgeOffset, topEdgeOffset);
        const rightBottom = trueLength(rightEdgeOffset, bottomEdgeOffset);
        const rightPanel = createTransitionNotchedPanel(h1, h2, rightTop, rightBottom, leftRightOpts);
        pieces.push({
          id: `${item.id}-trans-right-${q}`,
          itemId: item.id,
          parentName: `${item.name || "Transition"} ${w1}x${h1} → ${w2}x${h2}${qtySuffix}`,
          partName: "Right Panel",
          type: "transition-panel",
          orderedLength: rawL,
          width: rightPanel.width,
          height: rightPanel.height,
          area: rightPanel.area,
          segments: rightPanel.segments,
          bendLines: rightPanel.bendLines,
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
        const flange = item.flange !== undefined && item.flange !== "" ? Math.max(0, Number(item.flange)) : 1.0;

        if (w <= 0 || h <= 0) break;

        // Notched rectangle with 45-degree miter corner cutouts passing directly through bend line corners
        const endcup = createNotchedFlangePlate(w, h, flange);
        pieces.push({
          id: `${item.id}-endcup-${q}`,
          itemId: item.id,
          parentName: `${item.name || "End Cap"} ${w}"x${h}"${flange > 0 ? ` F=${flange}"` : ""}${qtySuffix}`,
          partName: "End Cap Plate",
          type: "endcup",
          width: endcup.width,
          height: endcup.height,
          area: endcup.area,
          segments: endcup.segments,
          bendLines: flange > 0.001 ? [
            { x1: round4(flange), y1: round4(flange), x2: round4(flange + w), y2: round4(flange), label: "Fold" },
            { x1: round4(flange + w), y1: round4(flange), x2: round4(flange + w), y2: round4(flange + h), label: "Fold" },
            { x1: round4(flange + w), y1: round4(flange + h), x2: round4(flange), y2: round4(flange + h), label: "Fold" },
            { x1: round4(flange), y1: round4(flange + h), x2: round4(flange), y2: round4(flange), label: "Fold" },
          ] : [],
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
 * Calculates transition alignment offsets (dx, dy) based on justification.
 */
export function getTransitionOffsets(just, dW, dH) {
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

/**
 * Creates a general trapezoid flat panel (symmetric, right-angled, or skewed)
 * given its top base width, bottom base width, and left & right edge slant lengths.
 *
 * @param {number} top - top base width
 * @param {number} bottom - bottom base width
 * @param {number} left - left edge true slant length
 * @param {number} right - right edge true slant length
 */
export function createTrueTrapezoidPanel(top, bottom, left, right) {
  if (top <= 0 || bottom <= 0 || left <= 0 || right <= 0) {
    return {
      width: round4(Math.max(top, bottom)),
      height: 0,
      area: 0,
      segments: [],
    };
  }

  let x, h;
  // Symmetric case: equal side lengths -> centered isosceles trapezoid
  if (Math.abs(left - right) < 0.0001) {
    const inset = (top - bottom) / 2;
    h = Math.sqrt(Math.max(left ** 2 - inset ** 2, 0));
    x = inset;
  } else {
    // General case:
    // p1 = (0, 0), p2 = (top, 0), p4 = (x, h), p3 = (x + bottom, h)
    // |p1 - p4|^2 = left^2  => x^2 + h^2 = left^2
    // |p2 - p3|^2 = right^2 => (x + bottom - top)^2 + h^2 = right^2
    // 2 * x * (top - bottom) = left^2 - right^2 + (top - bottom)^2
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

  // Normalize so the bounding box starts at (0, 0)
  const minX = Math.min(rawP1.x, rawP2.x, rawP3.x, rawP4.x);
  const maxX = Math.max(rawP1.x, rawP2.x, rawP3.x, rawP4.x);
  const minY = Math.min(rawP1.y, rawP2.y, rawP3.y, rawP4.y);
  const maxY = Math.max(rawP1.y, rawP2.y, rawP3.y, rawP4.y);

  const p1 = { x: round4(rawP1.x - minX), y: round4(rawP1.y - minY) };
  const p2 = { x: round4(rawP2.x - minX), y: round4(rawP2.y - minY) };
  const p3 = { x: round4(rawP3.x - minX), y: round4(rawP3.y - minY) };
  const p4 = { x: round4(rawP4.x - minX), y: round4(rawP4.y - minY) };

  const segments = [
    { cmd: "M", x: p1.x, y: p1.y },
    { cmd: "L", x: p2.x, y: p2.y },
    { cmd: "L", x: p3.x, y: p3.y },
    { cmd: "L", x: p4.x, y: p4.y },
    { cmd: "Z", x: p1.x, y: p1.y },
  ];

  return {
    width: round4(maxX - minX),
    height: round4(maxY - minY),
    area: round4(0.5 * (top + bottom) * h),
    segments,
  };
}

/**
 * Finds the intersection point of two lines given in point-direction form:
 * Line 1: p1 + t * d1
 * Line 2: p2 + u * d2
 */
export function lineIntersection(p1, d1, p2, d2) {
  const det = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(det) < 1e-9) {
    // Parallel lines; fallback
    return { x: p1.x, y: p1.y };
  }
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const t = (dx * d2.y - dy * d2.x) / det;
  return {
    x: p1.x + t * d1.x,
    y: p1.y + t * d1.y,
  };
}

/**
 * Creates a transition flat panel with allowances and 45° corner miter notches:
 * - Nominal trapezoid vertices: P1(0,0), P2(top,0), P3(x+bottom,h), P4(x,h)
 * - Top base: S-cleat / Drive-cleat flange (depth n = cleatNotch, default 1.0")
 * - Bottom base: S-cleat / Drive-cleat flange (depth n = cleatNotch, default 1.0")
 * - Left slant edge (P1 -> P4): Pittsburgh pocket (allowance p = pocketAllowance, default 1.0")
 * - Right slant edge (P2 -> P3): Pittsburgh flange (allowance f = flangeAllowance, default 0.25")
 * - 45° corner miter notches meeting directly at the 4 bend line corner vertices (P1, P2, P3, P4)
 */
export function createTransitionNotchedPanel(
  top,
  bottom,
  left,
  right,
  opts = {}
) {
  const leftAllowance =
    opts.leftAllowance !== undefined
      ? opts.leftAllowance
      : opts.pocketAllowance !== undefined
      ? opts.pocketAllowance
      : 1.0;
  const rightAllowance =
    opts.rightAllowance !== undefined
      ? opts.rightAllowance
      : opts.flangeAllowance !== undefined
      ? opts.flangeAllowance
      : 0.25;
  const n = opts.cleatNotch !== undefined ? opts.cleatNotch : 1.0;

  const leftLabel =
    opts.leftLabel ||
    (Math.abs(leftAllowance - 1.0) < 1e-4
      ? "Pittsburgh Pocket (1″)"
      : `Pittsburgh Flange (${leftAllowance}″)`);
  const rightLabel =
    opts.rightLabel ||
    (Math.abs(rightAllowance - 0.25) < 1e-4
      ? "Pittsburgh Flange (1/4″)"
      : `Pittsburgh Pocket (${rightAllowance}″)`);

  const leftType =
    opts.leftType ||
    (Math.abs(leftAllowance - 1.0) < 1e-4
      ? "pittsburgh-pocket"
      : "pittsburgh-flange");
  const rightType =
    opts.rightType ||
    (Math.abs(rightAllowance - 0.25) < 1e-4
      ? "pittsburgh-flange"
      : "pittsburgh-pocket");

  const p = leftAllowance;
  const f = rightAllowance;

  if (top <= 0 || bottom <= 0 || left <= 0 || right <= 0) {
    return {
      width: round4(Math.max(top, bottom)),
      height: 0,
      area: 0,
      segments: [],
      bendLines: [],
    };
  }

  // 1. Solve the trapezoid body corners: P1, P2, P3, P4
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

  // 2. Outward unit normals for left edge (P1 -> P4) and right edge (P2 -> P3)
  // Left edge vector:
  const vLeft = { x: rawP4.x - rawP1.x, y: rawP4.y - rawP1.y };
  const lenLeft = Math.sqrt(vLeft.x ** 2 + vLeft.y ** 2) || 1;
  const dirLeft = { x: vLeft.x / lenLeft, y: vLeft.y / lenLeft };
  // Normal pointing outward (leftwards): (-dirLeft.y, dirLeft.x)
  const normLeft = { x: -dirLeft.y, y: dirLeft.x };

  // Right edge vector:
  const vRight = { x: rawP3.x - rawP2.x, y: rawP3.y - rawP2.y };
  const lenRight = Math.sqrt(vRight.x ** 2 + vRight.y ** 2) || 1;
  const dirRight = { x: vRight.x / lenRight, y: vRight.y / lenRight };
  // Normal pointing outward (rightwards): (dirRight.y, -dirRight.x)
  const normRight = { x: dirRight.y, y: -dirRight.x };

  // 3. Pittsburgh outer allowance lines:
  // Left allowance line passes through rawP1 + p * normLeft with direction dirLeft
  const ptLeftLine = {
    x: rawP1.x + p * normLeft.x,
    y: rawP1.y + p * normLeft.y,
  };
  // Right allowance line passes through rawP2 + f * normRight with direction dirRight
  const ptRightLine = {
    x: rawP2.x + f * normRight.x,
    y: rawP2.y + f * normRight.y,
  };

  // 4. Corner miter lines at 45° meeting directly at vertices P1..P4:
  // - Top-left (at P1): 45° towards (-x, -y), direction (-1, 1) in coordinate system
  const rayP1 = { x: -1, y: 1 };
  const interTL = lineIntersection(rawP1, rayP1, ptLeftLine, dirLeft);

  // Top-right (at P2): ray goes dx = 1, dy = 1
  const rayP2 = { x: 1, y: 1 };
  const interTR = lineIntersection(rawP2, rayP2, ptRightLine, dirRight);

  // Bottom-right (at P3): ray goes dx = -1, dy = 1
  const rayP3 = { x: -1, y: 1 };
  const interBR = lineIntersection(rawP3, rayP3, ptRightLine, dirRight);

  // Bottom-left (at P4): ray goes dx = -1, dy = -1
  const rayP4 = { x: -1, y: -1 };
  const interBL = lineIntersection(rawP4, rayP4, ptLeftLine, dirLeft);

  // 5. Build 12 raw contour vertices in clockwise order:
  const rawPoints = [
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

  // 6. Normalize so bounding box starts at (0, 0)
  const minX = Math.min(...rawPoints.map((pt) => pt.x));
  const maxX = Math.max(...rawPoints.map((pt) => pt.x));
  const minY = Math.min(...rawPoints.map((pt) => pt.y));
  const maxY = Math.max(...rawPoints.map((pt) => pt.y));

  const pts = rawPoints.map((pt) => ({
    x: round4(pt.x - minX),
    y: round4(pt.y - minY),
  }));

  const p1 = { x: round4(rawP1.x - minX), y: round4(rawP1.y - minY) };
  const p2 = { x: round4(rawP2.x - minX), y: round4(rawP2.y - minY) };
  const p3 = { x: round4(rawP3.x - minX), y: round4(rawP3.y - minY) };
  const p4 = { x: round4(rawP4.x - minX), y: round4(rawP4.y - minY) };

  const segments = [
    { cmd: "M", x: pts[0].x, y: pts[0].y },
    ...pts.slice(1).map((pt) => ({ cmd: "L", x: pt.x, y: pt.y })),
    { cmd: "Z", x: pts[0].x, y: pts[0].y },
  ];

  // Calculate area using Shoelace formula
  let polyArea = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    polyArea += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  polyArea = Math.abs(polyArea) / 2;

  // Bend lines:
  // - Top S/Drive cleat: P1 -> P2
  // - Bottom S/Drive cleat: P4 -> P3
  // - Left lateral edge: P1 -> P4
  // - Right lateral edge: P2 -> P3
  const bendLines = [
    {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      label: "Top Cleat Flange (1″)",
      type: "cleat",
    },
    {
      x1: p4.x,
      y1: p4.y,
      x2: p3.x,
      y2: p3.y,
      label: "Bottom Cleat Flange (1″)",
      type: "cleat",
    },
    {
      x1: p1.x,
      y1: p1.y,
      x2: p4.x,
      y2: p4.y,
      label: leftLabel,
      type: leftType,
    },
    {
      x1: p2.x,
      y1: p2.y,
      x2: p3.x,
      y2: p3.y,
      label: rightLabel,
      type: rightType,
    },
  ];

  return {
    width: round4(maxX - minX),
    height: round4(maxY - minY),
    area: round4(polyArea),
    segments,
    bendLines,
    nominalCorners: { p1, p2, p3, p4 },
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
 * Creates an end cap flat plate with 45-degree corner miter notches for folding flanges.
 * The notch line enters directly into each bend line corner:
 * (effF, effF), (effF + w, effF), (effF + w, effF + h), (effF, effF + h)
 */
function createNotchedFlangePlate(w, h, f) {
  if (f <= 0.001) {
    return {
      width: round4(w),
      height: round4(h),
      area: round4(w * h),
      segments: createRectSegments(w, h),
    };
  }

  const effF = Math.min(f, (w - 0.1) / 2, (h - 0.1) / 2);
  const totalW = round4(w + 2 * effF);
  const totalH = round4(h + 2 * effF);

  // Mitered corner cuts meeting directly at the 4 bend line corners
  const segments = [
    { cmd: "M", x: round4(2 * effF), y: 0 },
    { cmd: "L", x: round4(w), y: 0 },
    { cmd: "L", x: round4(effF + w), y: round4(effF) },
    { cmd: "L", x: totalW, y: round4(2 * effF) },
    { cmd: "L", x: totalW, y: round4(h) },
    { cmd: "L", x: round4(effF + w), y: round4(effF + h) },
    { cmd: "L", x: round4(w), y: totalH },
    { cmd: "L", x: round4(2 * effF), y: totalH },
    { cmd: "L", x: round4(effF), y: round4(effF + h) },
    { cmd: "L", x: 0, y: round4(h) },
    { cmd: "L", x: 0, y: round4(2 * effF) },
    { cmd: "L", x: round4(effF), y: round4(effF) },
    { cmd: "Z", x: round4(2 * effF), y: 0 },
  ];

  const area = round4(totalW * totalH - 8 * effF * effF);

  return {
    width: totalW,
    height: totalH,
    area,
    segments,
  };
}

/**
 * Creates straight duct perimeter segments with 45-degree corner miter notches
 * meeting directly at the bend line / cleat corners:
 * (p, n), (p + bodyW, n), (p + bodyW, cutL - n), (p, cutL - n)
 *
 * Allowances:
 * - Pocket (Pittsburgh female lock): 1.0" along left edge (x: 0 to 1.0)
 * - Flange (Pittsburgh male edge): 0.25" along right edge (x: 1.0 + bodyW to 1.0 + bodyW + 0.25)
 * - Cleat clearance notch: 1.0" deep from top and bottom ends (y: 0 to 1.0 and y: cutL - 1.0 to cutL)
 *
 * @param {number} bodyW - Nominal unfolded width of duct body (W + H for L-shape, or 2W + 2H for wrapper)
 * @param {number} cutL - Fabrication cut length (48" if ordered 48", or L - 1" if ordered < 48")
 * @param {number} pocketAllowance - Pittsburgh pocket allowance (default 1.0")
 * @param {number} flangeAllowance - Pittsburgh flange allowance (default 0.25")
 * @param {number} cleatNotch - S-cleat / Drive-cleat clearance notch depth (default 1.0")
 */
export function createStraightNotchedSegments(
  bodyW,
  cutL,
  pocketAllowance = 1.0,
  flangeAllowance = 0.25,
  cleatNotch = 1.0
) {
  const p = pocketAllowance;
  const f = flangeAllowance;
  const n = Math.min(cleatNotch, cutL / 2 - 0.1);
  const totalW = round4(p + bodyW + f);

  if (n <= 0.001 || cutL <= 2 * (n + Math.max(p, f))) {
    return {
      width: totalW,
      height: round4(cutL),
      area: round4(totalW * cutL),
      segments: createRectSegments(totalW, cutL),
    };
  }

  // 12-vertex contour with 45° miter notches meeting directly at the 4 bend line corners:
  // Top-left: (p, n)
  // Top-right: (p + bodyW, n)
  // Bottom-right: (p + bodyW, cutL - n)
  // Bottom-left: (p, cutL - n)
  const segments = [
    { cmd: "M", x: round4(p + n), y: 0 },
    { cmd: "L", x: round4(p + bodyW - n), y: 0 },
    { cmd: "L", x: round4(p + bodyW), y: round4(n) },
    { cmd: "L", x: totalW, y: round4(n + f) },
    { cmd: "L", x: totalW, y: round4(cutL - n - f) },
    { cmd: "L", x: round4(p + bodyW), y: round4(cutL - n) },
    { cmd: "L", x: round4(p + bodyW - n), y: round4(cutL) },
    { cmd: "L", x: round4(p + n), y: round4(cutL) },
    { cmd: "L", x: round4(p), y: round4(cutL - n) },
    { cmd: "L", x: 0, y: round4(cutL - n - p) },
    { cmd: "L", x: 0, y: round4(n + p) },
    { cmd: "L", x: round4(p), y: round4(n) },
    { cmd: "Z", x: round4(p + n), y: 0 },
  ];

  // Cutout areas at 4 corners:
  // Left corners: 2 * (0.5 * (p + n)^2) = (p + n)^2
  // Right corners: 2 * (0.5 * (n + f)^2) = (n + f)^2
  const cutoutArea = Math.pow(p + n, 2) + Math.pow(n + f, 2);
  const area = round4(totalW * cutL - cutoutArea);

  return {
    width: totalW,
    height: round4(cutL),
    area,
    segments,
  };
}
