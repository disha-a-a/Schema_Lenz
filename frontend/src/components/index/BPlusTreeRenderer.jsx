import React, { useMemo } from "react";

/**
 * Renders a B+ Tree structure using SVG and a BFS layout.
 */
export default function BPlusTreeRenderer({ treeData }) {
  if (!treeData || !treeData.root) {
    return (
      <div style={{
        height: "400px", display: "flex", alignItems: "center", justifyContent: "center",
        color: "#849495", fontFamily: "Space Grotesk", background: "#0e0e13", borderRadius: "12px", border: "1px dashed #3a494a"
      }}>
        Empty Tree. Add values to build the index.
      </div>
    );
  }

  // 1. Prepare layout data using BFS
  const { nodes, edges, maxLevelWidth } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const levelCounts = {};

    const traverse = (node, level = 0, parentId = null) => {
      const id = Math.random().toString(36).substr(2, 9);
      const levelIdx = levelCounts[level] || 0;
      levelCounts[level] = levelIdx + 1;

      // Jackson serializes Lombok's `boolean isLeaf` as "leaf" (strips `is` prefix).
      // Also use structural fallback: no children → leaf.
      const isLeaf = node.leaf === true || node.isLeaf === true || !node.children || node.children.length === 0;

      const nodeData = {
        id,
        level,
        index: levelIdx,
        keys: node.keys || [],
        isLeaf,
        parentId
      };
      nodes.push(nodeData);

      if (parentId) {
        edges.push({ from: parentId, to: id });
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child, level + 1, id));
      }
    };

    traverse(treeData.root);

    const maxLevelWidth = Math.max(...Object.values(levelCounts));
    return { nodes, edges, maxLevelWidth };
  }, [treeData]);

  // SVG Configuration
  const WIDTH = 800;
  const NODE_W = 120;
  const NODE_H = 40;
  const LEVEL_H = 100;

  const getPos = (node) => {
    const levelNodes = nodes.filter(n => n.level === node.level);
    const totalW = levelNodes.length * (NODE_W + 40);
    const startX = (WIDTH - totalW) / 2 + NODE_W / 2;
    return {
      x: startX + node.index * (NODE_W + 40),
      y: 50 + node.level * LEVEL_H
    };
  };

  return (
    <div style={{ width: "100%", background: "#0e0e13", borderRadius: "16px", border: "1px solid #3a494a", overflow: "hidden" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid #3a494a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#63f7ff", textTransform: "uppercase", letterSpacing: "0.1em" }}>Visual B+ Tree Index</span>
          <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#849495" }}>
                  <div style={{ width: "8px", height: "8px", background: "#c792ea", borderRadius: "2px" }} /> Internal Node
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#849495" }}>
                  <div style={{ width: "8px", height: "8px", background: "#8fdb00", borderRadius: "2px" }} /> Leaf Node
              </div>
          </div>
      </div>

      <svg width="100%" height={treeData.height * LEVEL_H + 100} viewBox={`0 0 ${WIDTH} ${treeData.height * LEVEL_H + 100}`}>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#3a494a" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          const p1 = getPos(fromNode);
          const p2 = getPos(toNode);
          return (
            <line
              key={i}
              x1={p1.x} y1={p1.y + NODE_H / 2}
              x2={p2.x} y2={p2.y - NODE_H / 2}
              stroke="#3a494a" strokeWidth="1.5"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const { x, y } = getPos(node);
          const color = node.isLeaf ? "#8fdb00" : "#c792ea";
          const glow = node.isLeaf ? "0 0 10px rgba(143,219,0,0.4)" : "0 0 10px rgba(199,146,234,0.4)";
          
          return (
            <g key={node.id}>
              {/* Node Box */}
              <rect
                x={x - NODE_W / 2}
                y={y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx="6"
                fill="#1b1b20"
                stroke={color}
                strokeWidth="2"
                style={{ filter: `drop-shadow(${glow})` }}
              />
              
              {/* Keys */}
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill="#e4e1e9"
                style={{ fontFamily: "Fira Code, monospace", fontSize: "12px", fontWeight: 700 }}
              >
                {node.keys.join(" | ")}
              </text>

              {/* Node Metadata (Small) */}
              <text
                x={x - NODE_W/2}
                y={y - NODE_H/2 - 5}
                fill="#849495"
                style={{ fontSize: "8px", fontWeight: 700, textTransform: "uppercase" }}
              >
                {node.isLeaf ? "Leaf" : "Internal"}
              </text>
            </g>
          );
        })}

        {/* Leaf Horizontal Links (The B+ Tree "Chain") */}
        {nodes.filter(n => n.isLeaf).sort((a, b) => a.index - b.index).map((node, i, leafNodes) => {
          if (i === leafNodes.length - 1) return null;
          const nextNode = leafNodes[i + 1];
          const p1 = getPos(node);
          const p2 = getPos(nextNode);
          
          // Draw a curved or dashed line between leaf nodes
          return (
            <path
              key={`link-${i}`}
              d={`M ${p1.x + NODE_W/2} ${p1.y} C ${p1.x + NODE_W/2 + 20} ${p1.y}, ${p2.x - NODE_W/2 - 20} ${p2.y}, ${p2.x - NODE_W/2} ${p2.y}`}
              fill="none"
              stroke="#8fdb00"
              strokeWidth="1"
              strokeDasharray="4 2"
              opacity="0.6"
            />
          );
        })}
      </svg>
    </div>
  );
}
