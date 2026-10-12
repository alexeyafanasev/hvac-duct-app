/**
 * HVAC Sheet Metal 2D Nesting Engine (Inches)
 * Uses a MaxRects Best-Short-Side-Fit (BSSF) 2D bin packing algorithm.
 * Supports multi-sheet allocation, 90-degree part rotation, sheet margins, and kerf spacing.
 */

import { round2, round4 } from "./hvac-geometry.js";

/**
 * Standard North American Sheet Size Presets (in inches)
 */
export const SHEET_PRESETS = [
  { label: '48" × 96" (4×8 ft)', width: 96, height: 48 },
  { label: '48" × 120" (4×10 ft)', width: 120, height: 48 },
  { label: '60" × 120" (5×10 ft)', width: 120, height: 60 },
  { label: '60" × 144" (5×12 ft)', width: 144, height: 60 },
  { label: '36" × 96" (3×8 ft)', width: 96, height: 36 },
  { label: 'Custom', width: 96, height: 48 },
];

/**
 * Pack cut pieces onto one or more metal sheets.
 *
 * @param {Array} pieces - Array of CutPiece from decomposeItemToCutPieces
 * @param {Object} options
 * @param {number} options.sheetWidth - Sheet length along X (inches, e.g. 96 or 120)
 * @param {number} options.sheetHeight - Sheet width along Y (inches, e.g. 48 or 60)
 * @param {number} options.margin - Distance from sheet edge (inches, default 0.5")
 * @param {number} options.spacing - Gap between nested parts for laser kerf (inches, default 0.25")
 * @param {boolean} options.allowRotation - Allow 90-deg rotation (default true)
 *
 * @returns {Array} Array of Sheet objects, each containing placedPieces and statistics.
 */
/**
 * Check if a cut piece is a straight duct piece whose length matches
 * the sheet's width or height (e.g. 48" length on a 48" wide sheet).
 */
export function isFullWidthStraightPiece(piece, sheetWidth, sheetHeight) {
  if (piece.type !== "straight") return false;
  const l = Number(piece.ductLength) || Number(piece.height) || 0;
  // Duct length matches either sheet dimension (e.g. 48" on a 48x96 or 48x120 sheet)
  return Math.abs(l - sheetHeight) < 0.1 || Math.abs(l - sheetWidth) < 0.1;
}

/**
 * Pack cut pieces onto one or more metal sheets.
 *
 * @param {Array} pieces - Array of CutPiece from decomposeItemToCutPieces
 * @param {Object} options
 * @param {number} options.sheetWidth - Sheet length along X (inches, e.g. 96 or 120)
 * @param {number} options.sheetHeight - Sheet width along Y (inches, e.g. 48 or 60)
 * @param {number} options.margin - Distance from sheet edge (inches, default 0.5")
 * @param {number} options.spacing - Gap between nested parts for laser kerf (inches, default 0.25")
 * @param {boolean} options.zeroMarginStraight - If true, full-width straight duct pieces (e.g. 48")
 *                   are packed onto dedicated sheets with 0" margin and 0" spacing. All other pieces
 *                   (fittings & custom lengths) are always packed with standard margins and kerf spacing.
 * @param {boolean} options.allowRotation - Allow 90-deg rotation (default true)
 *
 * @returns {Array} Array of Sheet objects, each containing placedPieces and statistics.
 */
export function nestPiecesOnSheets(pieces, options = {}) {
  const sheetWidth = Number(options.sheetWidth) || 96;
  const sheetHeight = Number(options.sheetHeight) || 48;
  const zeroMarginStraight = options.zeroMarginStraight === true;
  const allowRotation = options.allowRotation !== false;

  const rawMargin =
    options.margin !== undefined && !isNaN(Number(options.margin))
      ? Math.max(0, Number(options.margin))
      : 0.5;
  const rawSpacing =
    options.spacing !== undefined && !isNaN(Number(options.spacing))
      ? Math.max(0, Number(options.spacing))
      : 0.25;

  if (!pieces || pieces.length === 0) {
    return [];
  }

  // If zeroMarginStraight is enabled, separate pieces into:
  // 1. Full-width straight duct pieces (length matches sheet width/height) -> dedicated sheets (0" margin & gap)
  // 2. All other pieces (fittings, custom lengths) -> standard sheets with configured margin & spacing
  if (zeroMarginStraight) {
    const fullWidthStraights = [];
    const otherPieces = [];

    for (const piece of pieces) {
      if (isFullWidthStraightPiece(piece, sheetWidth, sheetHeight)) {
        fullWidthStraights.push(piece);
      } else {
        otherPieces.push(piece);
      }
    }

    const allSheets = [];

    // 1. Pack full-width straight pieces onto dedicated zero-margin sheets
    if (fullWidthStraights.length > 0) {
      const straightSheets = packPieceGroup(fullWidthStraights, {
        sheetWidth,
        sheetHeight,
        margin: 0,
        spacing: 0,
        allowRotation,
        sheetType: "straight-flush",
        sheetLabel: "Straight Ducts (Flush 0\" Margin)",
      });
      allSheets.push(...straightSheets);
    }

    // 2. Pack remaining pieces onto standard sheets with normal margins & spacing
    if (otherPieces.length > 0) {
      const standardSheets = packPieceGroup(otherPieces, {
        sheetWidth,
        sheetHeight,
        margin: rawMargin,
        spacing: rawSpacing,
        allowRotation,
        sheetType: "standard",
        sheetLabel: "Fittings & Standard Parts",
      });
      allSheets.push(...standardSheets);
    }

    // Renumber sheet indices
    return allSheets.map((sheet, idx) => ({
      ...sheet,
      sheetIndex: idx,
      sheetNumber: idx + 1,
    }));
  }

  // When zeroMarginStraight is disabled, pack all pieces together with user-configured margin and spacing
  return packPieceGroup(pieces, {
    sheetWidth,
    sheetHeight,
    margin: rawMargin,
    spacing: rawSpacing,
    allowRotation,
    sheetType: "standard",
    sheetLabel: "Standard Nesting",
  });
}

/**
 * Internal helper to pack a group of pieces on sheets with true-shape contour nesting.
 */
function packPieceGroup(pieces, config) {
  const {
    sheetWidth,
    sheetHeight,
    margin,
    spacing,
    allowRotation,
    sheetType = "standard",
    sheetLabel = "Standard",
  } = config;

  const usableW = sheetWidth - 2 * margin;
  const usableH = sheetHeight - 2 * margin;

  if (usableW <= 0 || usableH <= 0 || !pieces || pieces.length === 0) {
    return [];
  }

  const dy = 0.1; // vertical profile sampling resolution (inches)
  const angles = allowRotation ? [0, 90, 180, 270] : [0];

  // Precompute true-shape profiles for all pieces across all tested rotation angles
  const pieceProfiles = pieces.map((piece, idx) => {
    const profiles = {};
    for (const a of angles) {
      profiles[a] = createPieceProfile(piece, a, dy);
    }
    return { piece, profiles, originalIndex: idx };
  });

  // Sort pieces descending by max dimension and area (Best-Fit Decreasing)
  pieceProfiles.sort((a, b) => {
    const maxA = Math.max(a.piece.width, a.piece.height);
    const maxB = Math.max(b.piece.width, b.piece.height);
    if (Math.abs(maxB - maxA) > 0.01) return maxB - maxA;
    return b.piece.area - a.piece.area;
  });

  const sheets = [];

  function createNewSheet(index) {
    return {
      index,
      sheetWidth,
      sheetHeight,
      margin,
      spacing,
      sheetType,
      sheetLabel,
      placedPieces: [],
    };
  }

  // Place each piece using true-shape contour positioning
  for (const item of pieceProfiles) {
    let bestPlacement = null;
    let targetSheetIndex = -1;

    // Try placing on existing sheets in this group first
    for (let sIdx = 0; sIdx < sheets.length; sIdx++) {
      const sh = sheets[sIdx];
      const placement = findBestPositionOnSheet(
        item,
        sh,
        sheetWidth,
        sheetHeight,
        margin,
        spacing,
        dy,
        angles
      );
      if (placement) {
        bestPlacement = placement;
        targetSheetIndex = sIdx;
        break;
      }
    }

    // If it didn't fit on any existing sheet, create a new sheet
    if (!bestPlacement) {
      const newSh = createNewSheet(sheets.length);
      sheets.push(newSh);
      targetSheetIndex = sheets.length - 1;
      bestPlacement = findBestPositionOnSheet(
        item,
        newSh,
        sheetWidth,
        sheetHeight,
        margin,
        spacing,
        dy,
        angles
      );
    }

    if (bestPlacement) {
      const dilated = dilateProfile(bestPlacement.profile, spacing);
      const transformedData = transformPieceGeometry(
        item.piece,
        bestPlacement.x,
        bestPlacement.y,
        bestPlacement.angle
      );

      sheets[targetSheetIndex].placedPieces.push({
        piece: item.piece,
        x: round4(bestPlacement.x),
        y: round4(bestPlacement.y),
        placedWidth: round4(bestPlacement.profile.width),
        placedHeight: round4(bestPlacement.profile.height),
        rotated: bestPlacement.angle !== 0,
        rotationAngle: bestPlacement.angle,
        overflow: false,
        transformedSegments: transformedData.segments,
        transformedBendLines: transformedData.bendLines,
        // Cached profile for subsequent piece collision checks on this sheet
        profile: bestPlacement.profile,
        dilated,
      });
    } else {
      // Piece exceeds sheet usable dimensions: force-place with warning
      const fallbackAngle = 0;
      const transformedData = transformPieceGeometry(
        item.piece,
        margin,
        margin,
        fallbackAngle
      );
      const fallbackProf = item.profiles[0];
      const fallbackDilated = dilateProfile(fallbackProf, spacing);

      const overflowSheet = sheets[targetSheetIndex];
      overflowSheet.placedPieces.push({
        piece: item.piece,
        x: round4(margin),
        y: round4(margin),
        placedWidth: round4(item.piece.width),
        placedHeight: round4(item.piece.height),
        rotated: false,
        rotationAngle: 0,
        overflow: true,
        transformedSegments: transformedData.segments,
        transformedBendLines: transformedData.bendLines,
        profile: fallbackProf,
        dilated: fallbackDilated,
      });
    }
  }

  // Calculate statistics for each sheet
  return sheets.map((sheet, idx) => {
    const totalSheetAreaSqIn = sheet.sheetWidth * sheet.sheetHeight;
    const totalSheetAreaSqFt = round2(totalSheetAreaSqIn / 144);

    const partsAreaSqIn = sheet.placedPieces.reduce(
      (sum, p) => sum + (p.piece.area || p.placedWidth * p.placedHeight),
      0
    );
    const partsAreaSqFt = round2(partsAreaSqIn / 144);
    const scrapAreaSqFt = round2(Math.max(0, totalSheetAreaSqFt - partsAreaSqFt));

    const efficiencyPercent = round2(
      Math.min(100, (partsAreaSqIn / totalSheetAreaSqIn) * 100)
    );

    let cutLengthInches = 0;
    sheet.placedPieces.forEach((p) => {
      cutLengthInches += 2 * (p.piece.width + p.piece.height);
    });

    return {
      sheetIndex: idx,
      sheetNumber: idx + 1,
      sheetWidth: sheet.sheetWidth,
      sheetHeight: sheet.sheetHeight,
      margin: sheet.margin,
      spacing: sheet.spacing,
      sheetType: sheet.sheetType,
      sheetLabel: sheet.sheetLabel,
      placedPieces: sheet.placedPieces,
      stats: {
        totalParts: sheet.placedPieces.length,
        efficiencyPercent,
        totalSheetAreaSqFt,
        partsAreaSqFt,
        scrapAreaSqFt,
        cutLengthInches: round2(cutLengthInches),
        cutLengthFeet: round2(cutLengthInches / 12),
      },
    };
  });
}

/**
 * Finds the tightest collision-free position (X, Y, angle) for a piece on a sheet
 * using true-shape contour profiles.
 */
function findBestPositionOnSheet(item, sheet, sw, sh, margin, spacing, dy, angles) {
  let bestPos = null;
  let bestScore = Infinity;

  // Track the current rightmost extent on this sheet
  let currentSheetMaxX = margin;
  for (const p of sheet.placedPieces) {
    if (p.x + p.placedWidth > currentSheetMaxX) {
      currentSheetMaxX = p.x + p.placedWidth;
    }
  }

  // Build candidate Y coordinates:
  const candidateYs = new Set();
  candidateYs.add(margin);

  for (const p of sheet.placedPieces) {
    const yTop = p.y + p.placedHeight + spacing;
    if (yTop <= sh - margin) candidateYs.add(yTop);
    candidateYs.add(p.y);
  }

  // Add grid steps every 0.5 inches to discover interlocking niches and curve fits
  for (let y = margin; y <= sh - margin; y += 0.5) {
    candidateYs.add(round4(y));
  }

  const sortedYs = Array.from(candidateYs).sort((a, b) => a - b);

  for (const angle of angles) {
    const prof = item.profiles[angle];
    if (!prof) continue;

    // Reject if rotated piece bounding box exceeds sheet dimensions
    if (prof.width > sw - 2 * margin + 1e-4 || prof.height > sh - 2 * margin + 1e-4) {
      continue;
    }

    for (const candY of sortedYs) {
      if (candY + prof.height > sh - margin + 1e-4) continue;

      const minXAllowed = margin;
      const maxXAllowed = sw - margin - prof.width;
      if (minXAllowed > maxXAllowed + 1e-4) continue;

      // Find all forbidden X-intervals generated by already placed pieces
      const forbiddenIntervals = [];

      for (const p of sheet.placedPieces) {
        if (!p.dilated) continue;

        // Fast bounding box vertical overlap pre-check
        const pYStart = p.y - spacing;
        const pYEnd = p.y + p.placedHeight + spacing;
        const cYStart = candY;
        const cYEnd = candY + prof.height;

        if (cYEnd <= pYStart || cYStart >= pYEnd) continue;

        // Calculate exact horizontal collision limits via contour profiles
        let reqRightX = -Infinity;
        let reqLeftX = Infinity;

        for (let b = 0; b < prof.numBins; b++) {
          const ySheet = candY + b * dy;
          const bP = Math.round((ySheet - p.y) / dy) + p.dilated.extraBins;
          if (bP >= 0 && bP < p.dilated.totalBins) {
            const rightLimit = p.x + p.dilated.dilatedMax[bP] - prof.xMin[b];
            if (rightLimit > reqRightX) reqRightX = rightLimit;

            const leftLimit = p.x + p.dilated.dilatedMin[bP] - prof.xMax[b];
            if (leftLimit < reqLeftX) reqLeftX = leftLimit;
          }
        }

        if (reqLeftX < reqRightX) {
          forbiddenIntervals.push([reqLeftX, reqRightX]);
        }
      }

      // Merge overlapping forbidden intervals
      forbiddenIntervals.sort((a, b) => a[0] - b[0]);
      const merged = [];
      for (const inv of forbiddenIntervals) {
        if (merged.length === 0) {
          merged.push([...inv]);
        } else {
          const last = merged[merged.length - 1];
          if (inv[0] <= last[1] + 1e-4) {
            last[1] = Math.max(last[1], inv[1]);
          } else {
            merged.push([...inv]);
          }
        }
      }

      // Find the smallest valid X >= minXAllowed that is outside all forbidden intervals
      let validX = minXAllowed;
      for (const inv of merged) {
        if (validX >= inv[0] - 1e-4 && validX < inv[1] - 1e-4) {
          validX = inv[1];
        }
      }

      if (validX <= maxXAllowed + 1e-4) {
        // Strip packing score:
        // Heavily prioritizes minimizing rightmost sheet width, then part X, then Y
        const resultingMaxX = Math.max(currentSheetMaxX, validX + prof.width);
        const score = resultingMaxX * 100.0 + (validX + prof.width) * 10.0 + candY;

        if (score < bestScore) {
          bestScore = score;
          bestPos = {
            x: Math.round(validX * 1000) / 1000,
            y: Math.round(candY * 1000) / 1000,
            angle,
            profile: prof,
          };
        }
      }
    }
  }

  return bestPos;
}

/**
 * Discretizes contour segments (M, L, A, Z) into a polygon of 2D vertices.
 */
function discretizeSegments(segments, maxChord = 0.2) {
  const points = [];
  let curr = { x: 0, y: 0 };

  for (const seg of segments) {
    if (seg.cmd === "M" || seg.cmd === "L") {
      curr = { x: seg.x, y: seg.y };
      points.push({ ...curr });
    } else if (seg.cmd === "A") {
      const cx = seg.cx !== undefined ? seg.cx : 0;
      const cy = seg.cy !== undefined ? seg.cy : 0;
      let startAngle = Math.atan2(curr.y - cy, curr.x - cx);
      let endAngle = Math.atan2(seg.y - cy, seg.x - cx);
      let sweep = endAngle - startAngle;

      if (seg.cw && sweep > 0) sweep -= 2 * Math.PI;
      if (!seg.cw && sweep < 0) sweep += 2 * Math.PI;

      const arcLen = Math.abs(sweep * seg.r);
      const steps = Math.max(8, Math.min(36, Math.ceil(arcLen / maxChord)));

      for (let s = 1; s <= steps; s++) {
        const theta = startAngle + (sweep * s) / steps;
        points.push({
          x: cx + seg.r * Math.cos(theta),
          y: cy + seg.r * Math.sin(theta),
        });
      }
      curr = { x: seg.x, y: seg.y };
    }
  }

  return points;
}

/**
 * Rotates a 2D point (x, y) inside a bounding box [0, origW] x [0, origH]
 * by angle in {0, 90, 180, 270} degrees clockwise.
 */
export function transformPoint(x, y, origW, origH, angle) {
  switch (angle) {
    case 90:
      return { x: y, y: origW - x };
    case 180:
      return { x: origW - x, y: origH - y };
    case 270:
      return { x: origH - y, y: x };
    default:
      return { x, y };
  }
}

/**
 * Precomputes vertical slice profile xMin[b] and xMax[b] for a piece at a given rotation angle.
 */
function createPieceProfile(piece, angle, dy = 0.1) {
  const rawPts = discretizeSegments(piece.segments || []);
  const rotated = rawPts.map((p) =>
    transformPoint(p.x, p.y, piece.width, piece.height, angle)
  );

  const minX = Math.min(...rotated.map((p) => p.x));
  const maxX = Math.max(...rotated.map((p) => p.x));
  const minY = Math.min(...rotated.map((p) => p.y));
  const maxY = Math.max(...rotated.map((p) => p.y));

  const norm = rotated.map((p) => ({ x: p.x - minX, y: p.y - minY }));
  const W = maxX - minX;
  const H = maxY - minY;

  const numBins = Math.ceil(H / dy) + 1;
  const xMin = new Float32Array(numBins);
  const xMax = new Float32Array(numBins);

  for (let b = 0; b < numBins; b++) {
    const y = b * dy;
    let minVal = Infinity;
    let maxVal = -Infinity;

    for (let i = 0; i < norm.length; i++) {
      const p1 = norm[i];
      const p2 = norm[(i + 1) % norm.length];
      const yA = Math.min(p1.y, p2.y);
      const yB = Math.max(p1.y, p2.y);

      if (y >= yA - 1e-6 && y <= yB + 1e-6) {
        let xVal = p1.x;
        if (Math.abs(p2.y - p1.y) > 1e-6) {
          xVal = p1.x + ((y - p1.y) / (p2.y - p1.y)) * (p2.x - p1.x);
        }
        if (xVal < minVal) minVal = xVal;
        if (xVal > maxVal) maxVal = xVal;
      }
    }

    xMin[b] = minVal === Infinity ? 0 : minVal;
    xMax[b] = maxVal === -Infinity ? W : maxVal;
  }

  return { angle, width: W, height: H, dy, numBins, xMin, xMax, polygon: norm };
}

/**
 * Computes dilated Minkowski sum of a piece profile with a kerf disk of radius spacing.
 */
function dilateProfile(profile, spacing) {
  const { dy, numBins } = profile;

  if (spacing <= 0.001) {
    return {
      ...profile,
      extraBins: 0,
      totalBins: numBins,
      dilatedMax: profile.xMax,
      dilatedMin: profile.xMin,
    };
  }

  const sSteps = Math.ceil(spacing / dy);
  const extraBins = sSteps;
  const totalBins = numBins + 2 * extraBins;
  const dilatedMax = new Float32Array(totalBins);
  const dilatedMin = new Float32Array(totalBins);

  for (let b = 0; b < totalBins; b++) {
    const y = (b - extraBins) * dy;
    let maxVal = -Infinity;
    let minVal = Infinity;

    const startSrc = Math.max(0, b - extraBins - sSteps);
    const endSrc = Math.min(numBins - 1, b - extraBins + sSteps);

    for (let k = startSrc; k <= endSrc; k++) {
      const srcY = k * dy;
      const deltaY = y - srcY;
      if (Math.abs(deltaY) <= spacing + 1e-5) {
        const deltaX = Math.sqrt(Math.max(0, spacing * spacing - deltaY * deltaY));
        if (profile.xMax[k] + deltaX > maxVal) maxVal = profile.xMax[k] + deltaX;
        if (profile.xMin[k] - deltaX < minVal) minVal = profile.xMin[k] - deltaX;
      }
    }

    dilatedMax[b] = maxVal;
    dilatedMin[b] = minVal;
  }

  return {
    ...profile,
    extraBins,
    totalBins,
    dilatedMax,
    dilatedMin,
  };
}

/**
 * Transforms part segments and bend lines from local part coordinates to sheet coordinates.
 * Supports rotation angles in {0, 90, 180, 270} degrees.
 */
export function transformPieceGeometry(piece, sheetX, sheetY, rotation) {
  let angle = 0;
  if (typeof rotation === "number") {
    angle = rotation;
  } else if (rotation === true) {
    angle = 90;
  }

  const origW = piece.width;
  const origH = piece.height;

  const segments = (piece.segments || []).map((seg) => {
    if (seg.cmd === "Z") {
      return { cmd: "Z" };
    }

    const tp = transformPoint(seg.x, seg.y, origW, origH, angle);
    const transformed = {
      cmd: seg.cmd,
      x: round4(sheetX + tp.x),
      y: round4(sheetY + tp.y),
    };

    if (seg.cmd === "A") {
      transformed.r = seg.r;
      transformed.largeArc = seg.largeArc;
      transformed.cw = seg.cw;
      if (seg.cx !== undefined && seg.cy !== undefined) {
        const tcp = transformPoint(seg.cx, seg.cy, origW, origH, angle);
        transformed.cx = round4(sheetX + tcp.x);
        transformed.cy = round4(sheetY + tcp.y);
      }
    }

    return transformed;
  });

  const bendLines = (piece.bendLines || []).map((b) => {
    const tp1 = transformPoint(b.x1, b.y1, origW, origH, angle);
    const tp2 = transformPoint(b.x2, b.y2, origW, origH, angle);
    return {
      x1: round4(sheetX + tp1.x),
      y1: round4(sheetY + tp1.y),
      x2: round4(sheetX + tp2.x),
      y2: round4(sheetY + tp2.y),
      label: b.label,
    };
  });

  return { segments, bendLines };
}
