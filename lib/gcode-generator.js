/**
 * CNC Laser G-code Generator for HVAC Sheet Metal (Inches & Imperial units)
 * Produces clean, robust G-code (ISO 6983 / RS-274 / GRBL / Mach3 / LinuxCNC).
 */

import { round4 } from "./hvac-geometry.js";

/**
 * Default Laser CNC Settings (Inches)
 */
export const DEFAULT_GCODE_CONFIG = {
  unit: "G20", // G20 = inches, G21 = mm
  cutFeedRate: 150, // IPM (Inches Per Minute) for cutting
  rapidFeedRate: 500, // IPM for rapid traverse
  markFeedRate: 250, // IPM for bend line etching/marking
  laserOnCut: "M3 S1000",
  laserOnMark: "M3 S300",
  laserOff: "M5",
  pierceDwell: 0.2, // seconds
  enableLeadIn: false,
  leadInLength: 0.125, // 1/8"
  includeBendLines: true, // etch bend lines before cutting outer contours
  origin: "bottom-left", // "bottom-left" or "top-left"
};

/**
 * Generates full G-code program string for a nested metal sheet.
 *
 * @param {Object} sheet - Sheet object from nestPiecesOnSheets
 * @param {Object} meta - Optional metadata (orderName, projectName, sheetIndex, gauge)
 * @param {Object} customConfig - User-specified G-code settings
 *
 * @returns {string} Clean formatted G-code text
 */
export function generateSheetGcode(sheet, meta = {}, customConfig = {}) {
  const cfg = { ...DEFAULT_GCODE_CONFIG, ...customConfig };
  const lines = [];

  const dateStr = new Date().toISOString().replace("T", " ").substring(0, 19);
  const sheetNum = sheet.sheetNumber || (sheet.sheetIndex !== undefined ? sheet.sheetIndex + 1 : 1);

  // Program Header Comments
  lines.push(`(==============================================)`);
  lines.push(`( PROGRAM: HVAC LASER CUTTING - SHEET ${sheetNum} )`);
  lines.push(`( DATE:    ${dateStr} )`);
  if (meta.projectName) lines.push(`( PROJECT: ${meta.projectName} )`);
  if (meta.orderName) lines.push(`( ORDER:   ${meta.orderName} )`);
  lines.push(`( SHEET:   ${sheet.sheetWidth}" x ${sheet.sheetHeight}" )`);
  lines.push(`( PARTS:   ${sheet.placedPieces ? sheet.placedPieces.length : 0} PCS )`);
  lines.push(`( UNITS:   INCHES [G20] )`);
  lines.push(`( FEED:    CUT ${cfg.cutFeedRate} IPM | RAPID ${cfg.rapidFeedRate} IPM )`);
  lines.push(`(==============================================)`);
  lines.push(``);

  // Safety & Setup Block
  lines.push(`G90 G17 G40 G49 G80 (Absolute, XY plane, cancel comp)`);
  lines.push(`${cfg.unit} (Inches mode)`);
  lines.push(`F${cfg.rapidFeedRate}`);
  lines.push(cfg.laserOff);
  lines.push(``);

  if (!sheet.placedPieces || sheet.placedPieces.length === 0) {
    lines.push(`(No parts to cut)`);
    lines.push(`M30`);
    return lines.join("\n");
  }

  // --- LAYER 1: BEND / FOLD LINES (Marking / Low Power Etch) ---
  if (cfg.includeBendLines) {
    let hasBendLines = false;
    sheet.placedPieces.forEach((p) => {
      if (p.transformedBendLines && p.transformedBendLines.length > 0) {
        hasBendLines = true;
      }
    });

    if (hasBendLines) {
      lines.push(`(----------------------------------------------)`);
      lines.push(`( LAYER 1: BEND & FOLD LINE MARKING / ETCHING )`);
      lines.push(`(----------------------------------------------)`);
      lines.push(`F${cfg.markFeedRate}`);

      for (let i = 0; i < sheet.placedPieces.length; i++) {
        const item = sheet.placedPieces[i];
        const bendLines = item.transformedBendLines || [];

        if (bendLines.length === 0) continue;

        lines.push(`(Mark part #${i + 1}: ${item.piece.partName})`);

        for (const line of bendLines) {
          const y1 = convertY(line.y1, sheet.sheetHeight, cfg.origin);
          const y2 = convertY(line.y2, sheet.sheetHeight, cfg.origin);

          // Rapid move to start of bend line
          lines.push(`G0 X${formatCoord(line.x1)} Y${formatCoord(y1)}`);
          // Laser ON (marking power)
          lines.push(`${cfg.laserOnMark}`);
          // Linear feed along bend line
          lines.push(`G1 X${formatCoord(line.x2)} Y${formatCoord(y2)} F${cfg.markFeedRate}`);
          // Laser OFF
          lines.push(cfg.laserOff);
        }
      }
      lines.push(``);
    }
  }

  // --- LAYER 2: OUTER CONTOURS CUTTING (Full Laser Power) ---
  lines.push(`(----------------------------------------------)`);
  lines.push(`( LAYER 2: OUTER PERIMETER CUTTING )`);
  lines.push(`(----------------------------------------------)`);
  lines.push(`F${cfg.cutFeedRate}`);

  for (let i = 0; i < sheet.placedPieces.length; i++) {
    const item = sheet.placedPieces[i];
    const segs = item.transformedSegments || [];

    if (segs.length === 0) continue;

    lines.push(``);
    lines.push(`(Part #${i + 1}: ${item.piece.parentName} - ${item.piece.partName})`);

    let currentX = 0;
    let currentY = 0;
    let firstCutPoint = null;

    for (let s = 0; s < segs.length; s++) {
      const seg = segs[s];

      if (seg.cmd === "M") {
        const sy = convertY(seg.y, sheet.sheetHeight, cfg.origin);
        currentX = seg.x;
        currentY = sy;
        firstCutPoint = { x: currentX, y: currentY };

        // Rapid move to contour start
        lines.push(`G0 X${formatCoord(currentX)} Y${formatCoord(currentY)}`);

        // Laser Pierce
        lines.push(cfg.laserOnCut);
        if (cfg.pierceDwell > 0) {
          lines.push(`G4 P${round4(cfg.pierceDwell)} (Pierce dwell)`);
        }
      } else if (seg.cmd === "L") {
        const targetY = convertY(seg.y, sheet.sheetHeight, cfg.origin);
        lines.push(`G1 X${formatCoord(seg.x)} Y${formatCoord(targetY)} F${cfg.cutFeedRate}`);
        currentX = seg.x;
        currentY = targetY;
      } else if (seg.cmd === "A") {
        // Arc command: G2 (CW) or G3 (CCW)
        const targetY = convertY(seg.y, sheet.sheetHeight, cfg.origin);
        const arcCmd = seg.cw ? "G2" : "G3";

        // Center offsets I and J relative to current starting point
        let iVal = 0;
        let jVal = 0;
        if (seg.cx !== undefined && seg.cy !== undefined) {
          const cyConv = convertY(seg.cy, sheet.sheetHeight, cfg.origin);
          iVal = round4(seg.cx - currentX);
          jVal = round4(cyConv - currentY);
          lines.push(
            `${arcCmd} X${formatCoord(seg.x)} Y${formatCoord(targetY)} I${formatCoord(iVal)} J${formatCoord(jVal)} F${cfg.cutFeedRate}`
          );
        } else if (seg.r) {
          // Radius format alternative
          lines.push(
            `${arcCmd} X${formatCoord(seg.x)} Y${formatCoord(targetY)} R${formatCoord(seg.r)} F${cfg.cutFeedRate}`
          );
        }
        currentX = seg.x;
        currentY = targetY;
      } else if (seg.cmd === "Z") {
        // Close path back to first point if needed
        if (
          firstCutPoint &&
          (Math.abs(currentX - firstCutPoint.x) > 0.002 ||
            Math.abs(currentY - firstCutPoint.y) > 0.002)
        ) {
          lines.push(
            `G1 X${formatCoord(firstCutPoint.x)} Y${formatCoord(firstCutPoint.y)} F${cfg.cutFeedRate}`
          );
        }
        // Laser OFF at end of contour
        lines.push(cfg.laserOff);
      }
    }

    // Ensure laser is turned off after part
    lines.push(cfg.laserOff);
  }

  // --- PROGRAM END ---
  lines.push(``);
  lines.push(`(----------------------------------------------)`);
  lines.push(`( END OF SHEET PROGRAM )`);
  lines.push(`(----------------------------------------------)`);
  lines.push(cfg.laserOff);
  lines.push(`G0 X0.0000 Y0.0000 F${cfg.rapidFeedRate} (Return to home origin)`);
  lines.push(`M30 (Program End & Rewind)`);

  return lines.join("\n");
}

/**
 * Format coordinate number to 4 decimal places string
 */
function formatCoord(val) {
  const n = Number(val) || 0;
  return (Math.round((n + Number.EPSILON) * 10000) / 10000).toFixed(4);
}

/**
 * Convert Y coordinate if origin is inverted
 */
function convertY(y, sheetHeight, origin) {
  if (origin === "top-left") {
    return round4(sheetHeight - y);
  }
  return round4(y);
}
