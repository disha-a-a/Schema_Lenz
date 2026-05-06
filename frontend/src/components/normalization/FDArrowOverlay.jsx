import React, { useEffect, useState } from "react";

// Props: attributes (array of strings), fds (array of { lhs: string, rhs: string })
export default function FDArrowOverlay({ attributes, fds }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const newLines = [];
    fds.forEach((fd, idx) => {
      const lhsAttrs = fd.lhs.split(',').map(a => a.trim()).filter(Boolean);
      const rhsAttrs = fd.rhs.split(',').map(a => a.trim()).filter(Boolean);
      lhsAttrs.forEach(lhs => {
        rhsAttrs.forEach(rhs => {
          const lhsEl = document.querySelector(`[data-attr="${lhs}"]`);
          const rhsEl = document.querySelector(`[data-attr="${rhs}"]`);
          if (lhsEl && rhsEl) {
            const lhsRect = lhsEl.getBoundingClientRect();
            const rhsRect = rhsEl.getBoundingClientRect();
            const containerRect = lhsEl.parentElement.parentElement.getBoundingClientRect();
            const startX = lhsRect.left + lhsRect.width / 2 - containerRect.left;
            const startY = lhsRect.top + lhsRect.height / 2 - containerRect.top;
            const endX = rhsRect.left + rhsRect.width / 2 - containerRect.left;
            const endY = rhsRect.top + rhsRect.height / 2 - containerRect.top;
            newLines.push({ id: `${lhs}-${rhs}-${idx}`, startX, startY, endX, endY, color: getColor(idx) });
          }
        });
      });
    });
    setLines(newLines);
  }, [attributes, fds]);

  const getColor = (i) => {
    const palette = ["#ff4b89", "#63f7ff", "#ffb400", "#8fdb00", "#ff6f61"];
    return palette[i % palette.length];
  };

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {lines.map(line => (
        <line
          key={line.id}
          x1={line.startX}
          y1={line.startY}
          x2={line.endX}
          y2={line.endY}
          stroke={line.color}
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      ))}
    </svg>
  );
}
