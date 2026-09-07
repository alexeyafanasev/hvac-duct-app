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
 * Internal helper to pack a group of pieces on sheets with given dimensions, margin, and spacing.
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

  // Clone pieces and sort descending by max dimension, then area (Best-Fit Decreasing)
  const sortedPieces = [...pieces].sort((a, b) => {
    const maxA = Math.max(a.width, a.height);
    const maxB = Math.max(b.width, b.height);
    if (Math.abs(maxB - maxA) > 0.01) return maxB - maxA;
    return b.area - a.area;
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
      // Initial free rectangle covers the usable area inside margins
      freeRects: [
        {
          x: margin,
          y: margin,
          width: usableW,
          height: usableH,
        },
      ],
      placedPieces: [],
    };
  }

  // Place each piece
  for (const piece of sortedPieces) {
    let placed = false;

    // Try placing on existing sheets in this group first
    for (const sheet of sheets) {
      if (tryPlacePieceOnSheet(piece, sheet, spacing, allowRotation)) {
        placed = true;
        break;
      }
    }

    // If it didn't fit on any existing sheet, create a new one
    if (!placed) {
      const newSheet = createNewSheet(sheets.length);
      sheets.push(newSheet);
      if (!tryPlacePieceOnSheet(piece, newSheet, spacing, allowRotation)) {
        // Piece is larger than usable sheet dimensions!
        // Place it anyway at margin with a warning flag so user sees it overflows
        forcePlaceOverflowPiece(piece, newSheet, margin);
      }
    }
  }

  // Calculate stats for each sheet
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

    // Calculate total cut perimeter in inches
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
 * MaxRects Best-Short-Side-Fit placement
 */
function tryPlacePieceOnSheet(piece, sheet, spacing, allowRotation) {
  let bestRectIndex = -1;
  let bestShortSideFit = Infinity;
  let bestLongSideFit = Infinity;
  let bestRotated = false;
  let bestWidth = 0;
  let bestHeight = 0;

  for (let i = 0; i < sheet.freeRects.length; i++) {
    const free = sheet.freeRects[i];

    // Check normal orientation (piece.width x piece.height)
    if (piece.width <= free.width + 0.001 && piece.height <= free.height + 0.001) {
      const leftoverW = free.width - piece.width;
      const leftoverH = free.height - piece.height;
      const shortSideFit = Math.min(leftoverW, leftoverH);
      const longSideFit = Math.max(leftoverW, leftoverH);

      if (
        shortSideFit < bestShortSideFit ||
        (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)
      ) {
        bestRectIndex = i;
        bestShortSideFit = shortSideFit;
        bestLongSideFit = longSideFit;
        bestRotated = false;
        bestWidth = piece.width;
        bestHeight = piece.height;
      }
    }

    // Check rotated 90 degrees (piece.height x piece.width)
    if (allowRotation) {
      if (piece.height <= free.width + 0.001 && piece.width <= free.height + 0.001) {
        const leftoverW = free.width - piece.height;
        const leftoverH = free.height - piece.width;
        const shortSideFit = Math.min(leftoverW, leftoverH);
        const longSideFit = Math.max(leftoverW, leftoverH);

        if (
          shortSideFit < bestShortSideFit ||
          (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)
        ) {
          bestRectIndex = i;
          bestShortSideFit = shortSideFit;
          bestLongSideFit = longSideFit;
          bestRotated = true;
          bestWidth = piece.height;
          bestHeight = piece.width;
        }
      }
    }
  }

  if (bestRectIndex === -1) {
    return false;
  }

  const freeRect = sheet.freeRects[bestRectIndex];
  const placedX = freeRect.x;
  const placedY = freeRect.y;

  // The bounding box reserved on the sheet includes spacing for laser kerf
  const occupyWidth = bestWidth + spacing;
  const occupyHeight = bestHeight + spacing;

  // Record placed piece
  const transformedData = transformPieceGeometry(
    piece,
    placedX,
    placedY,
    bestRotated
  );

  sheet.placedPieces.push({
    piece,
    x: round4(placedX),
    y: round4(placedY),
    placedWidth: round4(bestWidth),
    placedHeight: round4(bestHeight),
    rotated: bestRotated,
    overflow: false,
    transformedSegments: transformedData.segments,
    transformedBendLines: transformedData.bendLines,
  });

  // Split all free rectangles that intersect with this placed piece box
  splitFreeRects(sheet, placedX, placedY, occupyWidth, occupyHeight);

  // Prune contained / redundant rectangles
  pruneFreeRects(sheet);

  return true;
}

/**
 * Handle edge-case piece larger than sheet
 */
function forcePlaceOverflowPiece(piece, sheet, margin) {
  const transformedData = transformPieceGeometry(piece, margin, margin, false);

  sheet.placedPieces.push({
    piece,
    x: round4(margin),
    y: round4(margin),
    placedWidth: round4(piece.width),
    placedHeight: round4(piece.height),
    rotated: false,
    overflow: true,
    transformedSegments: transformedData.segments,
    transformedBendLines: transformedData.bendLines,
  });
}

/**
 * Split free rectangles intersected by newly placed part
 */
function splitFreeRects(sheet, px, py, pw, ph) {
  const newFreeRects = [];

  for (const rect of sheet.freeRects) {
    // Check intersection
    if (
      px >= rect.x + rect.width ||
      px + pw <= rect.x ||
      py >= rect.y + rect.height ||
      py + ph <= rect.y
    ) {
      newFreeRects.push(rect);
      continue;
    }

    // New right rect
    if (px + pw < rect.x + rect.width) {
      newFreeRects.push({
        x: px + pw,
        y: rect.y,
        width: rect.x + rect.width - (px + pw),
        height: rect.height,
      });
    }

    // New left rect
    if (px > rect.x) {
      newFreeRects.push({
        x: rect.x,
        y: rect.y,
        width: px - rect.x,
        height: rect.height,
      });
    }

    // New top rect
    if (py + ph < rect.y + rect.height) {
      newFreeRects.push({
        x: rect.x,
        y: py + ph,
        width: rect.width,
        height: rect.y + rect.height - (py + ph),
      });
    }

    // New bottom rect
    if (py > rect.y) {
      newFreeRects.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: py - rect.y,
      });
    }
  }

  sheet.freeRects = newFreeRects;
}

/**
 * Remove free rects that are wholly enclosed within another free rect
 */
function pruneFreeRects(sheet) {
  const rects = sheet.freeRects;
  const filtered = [];

  for (let i = 0; i < rects.length; i++) {
    let isContained = false;
    for (let j = 0; j < rects.length; j++) {
      if (i === j) continue;
      const a = rects[i];
      const b = rects[j];

      if (
        a.x >= b.x - 0.001 &&
        a.y >= b.y - 0.001 &&
        a.x + a.width <= b.x + b.width + 0.001 &&
        a.y + a.height <= b.y + b.height + 0.001
      ) {
        isContained = true;
        break;
      }
    }
    if (!isContained && rects[i].width > 0.1 && rects[i].height > 0.1) {
      filtered.push(rects[i]);
    }
  }

  sheet.freeRects = filtered;
}

/**
 * Transforms part segments and bend lines from local part coordinates to sheet coordinates.
 * Supports 90-deg rotation if rotated is true.
 */
export function transformPieceGeometry(piece, sheetX, sheetY, rotated) {
  const segments = (piece.segments || []).map((seg) => {
    if (seg.cmd === "Z") {
      return { cmd: "Z" };
    }

    let tx, ty;
    if (rotated) {
      // Rotate 90 deg clockwise: (x, y) -> (y, piece.width - x) or similar
      // Here: x_placed = y_local, y_placed = x_local
      tx = sheetX + seg.y;
      ty = sheetY + (piece.width - seg.x);
    } else {
      tx = sheetX + seg.x;
      ty = sheetY + seg.y;
    }

    const transformed = {
      cmd: seg.cmd,
      x: round4(tx),
      y: round4(ty),
    };

    if (seg.cmd === "A") {
      transformed.r = seg.r;
      transformed.largeArc = seg.largeArc;
      transformed.cw = seg.cw;
      if (seg.cx !== undefined && seg.cy !== undefined) {
        if (rotated) {
          transformed.cx = round4(sheetX + seg.cy);
          transformed.cy = round4(sheetY + (piece.width - seg.cx));
        } else {
          transformed.cx = round4(sheetX + seg.cx);
          transformed.cy = round4(sheetY + seg.cy);
        }
      }
    }

    return transformed;
  });

  const bendLines = (piece.bendLines || []).map((b) => {
    let bx1, by1, bx2, by2;
    if (rotated) {
      bx1 = sheetX + b.y1;
      by1 = sheetY + (piece.width - b.x1);
      bx2 = sheetX + b.y2;
      by2 = sheetY + (piece.width - b.x2);
    } else {
      bx1 = sheetX + b.x1;
      by1 = sheetY + b.y1;
      bx2 = sheetX + b.x2;
      by2 = sheetY + b.y2;
    }

    return {
      x1: round4(bx1),
      y1: round4(by1),
      x2: round4(bx2),
      y2: round4(by2),
      label: b.label,
    };
  });

  return { segments, bendLines };
}
