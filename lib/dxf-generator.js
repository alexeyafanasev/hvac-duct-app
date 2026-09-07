/**
 * AutoCAD DXF R12 Generator for HVAC Sheet Metal Laser Cutting (Inches)
 * Compatible with CypCut, LaserCAD, AutoCAD, and CNC CAM software.
 * Contains layers:
 *   - "SHEET": Outer boundary of the raw metal sheet
 *   - "CUT": Outer perimeter cut lines
 *   - "BEND": Internal fold/marking lines
 */

import { round4 } from "./hvac-geometry.js";

export function generateSheetDxf(sheet, meta = {}) {
  const lines = [];

  // DXF Header
  lines.push("0", "SECTION", "2", "HEADER");
  lines.push("9", "$ACADVER", "1", "AC1009"); // AutoCAD R12 ASCII
  lines.push("9", "$INSUNITS", "70", "1"); // 1 = Inches
  lines.push("0", "ENDSEC");

  // TABLES Section (Layers)
  lines.push("0", "SECTION", "2", "TABLES");
  lines.push("0", "TABLE", "2", "LAYER", "70", "3");

  // Layer SHEET (Color 7 = White)
  lines.push("0", "LAYER", "2", "SHEET", "70", "0", "62", "7", "6", "CONTINUOUS");
  // Layer CUT (Color 4 = Cyan)
  lines.push("0", "LAYER", "2", "CUT", "70", "0", "62", "4", "6", "CONTINUOUS");
  // Layer BEND (Color 1 = Red or 6 = Magenta)
  lines.push("0", "LAYER", "2", "BEND", "70", "0", "62", "1", "6", "DASHED");

  lines.push("0", "ENDTAB");
  lines.push("0", "ENDSEC");

  // ENTITIES Section
  lines.push("0", "SECTION", "2", "ENTITIES");

  // 1. Draw raw sheet rectangle on "SHEET" layer
  const sw = sheet.sheetWidth;
  const sh = sheet.sheetHeight;
  dxfLine(lines, "SHEET", 0, 0, sw, 0);
  dxfLine(lines, "SHEET", sw, 0, sw, sh);
  dxfLine(lines, "SHEET", sw, sh, 0, sh);
  dxfLine(lines, "SHEET", 0, sh, 0, 0);

  // 2. Draw nested parts
  const placedPieces = sheet.placedPieces || [];

  for (const item of placedPieces) {
    // A. Draw Bend Lines
    const bendLines = item.transformedBendLines || [];
    for (const bl of bendLines) {
      dxfLine(lines, "BEND", bl.x1, bl.y1, bl.x2, bl.y2);
    }

    // B. Draw Perimeter Contour Segments
    const segs = item.transformedSegments || [];
    let startPoint = null;
    let curr = null;

    for (const seg of segs) {
      if (seg.cmd === "M") {
        startPoint = { x: seg.x, y: seg.y };
        curr = { x: seg.x, y: seg.y };
      } else if (seg.cmd === "L") {
        if (curr) {
          dxfLine(lines, "CUT", curr.x, curr.y, seg.x, seg.y);
        }
        curr = { x: seg.x, y: seg.y };
      } else if (seg.cmd === "A") {
        if (curr && seg.cx !== undefined && seg.cy !== undefined) {
          // Arc in DXF: center (cx, cy), radius r, start_angle, end_angle in degrees CCW
          const r = seg.r || Math.hypot(curr.x - seg.cx, curr.y - seg.cy);
          let startDeg = (Math.atan2(curr.y - seg.cy, curr.x - seg.cx) * 180) / Math.PI;
          let endDeg = (Math.atan2(seg.y - seg.cy, seg.x - seg.cx) * 180) / Math.PI;

          if (startDeg < 0) startDeg += 360;
          if (endDeg < 0) endDeg += 360;

          if (seg.cw) {
            // Swap for DXF standard (DXF angles are always CCW)
            dxfArc(lines, "CUT", seg.cx, seg.cy, r, endDeg, startDeg);
          } else {
            dxfArc(lines, "CUT", seg.cx, seg.cy, r, startDeg, endDeg);
          }
        } else if (curr) {
          dxfLine(lines, "CUT", curr.x, curr.y, seg.x, seg.y);
        }
        curr = { x: seg.x, y: seg.y };
      } else if (seg.cmd === "Z") {
        if (curr && startPoint) {
          dxfLine(lines, "CUT", curr.x, curr.y, startPoint.x, startPoint.y);
        }
      }
    }
  }

  lines.push("0", "ENDSEC");
  lines.push("0", "EOF");

  return lines.join("\n");
}

function dxfLine(lines, layer, x1, y1, x2, y2) {
  lines.push("0", "LINE");
  lines.push("8", layer);
  lines.push("10", round4(x1).toFixed(4));
  lines.push("20", round4(y1).toFixed(4));
  lines.push("30", "0.0");
  lines.push("11", round4(x2).toFixed(4));
  lines.push("20", round4(y2).toFixed(4));
  lines.push("31", "0.0");
}

function dxfArc(lines, layer, cx, cy, r, startAngle, endAngle) {
  lines.push("0", "ARC");
  lines.push("8", layer);
  lines.push("10", round4(cx).toFixed(4));
  lines.push("20", round4(cy).toFixed(4));
  lines.push("30", "0.0");
  lines.push("40", round4(r).toFixed(4));
  lines.push("50", round4(startAngle).toFixed(2));
  lines.push("51", round4(endAngle).toFixed(2));
}
