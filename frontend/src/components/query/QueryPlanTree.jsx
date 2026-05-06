import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

const OP_CONFIG = {
  SELECT:  { symbol: "σ", color: "#ffb4ab", desc: "Filters rows using a predicate. Push down as early as possible to reduce cardinality." },
  PROJECT: { symbol: "π", color: "#63f7ff", desc: "Retains only specified columns. Applied after selection to limit data width." },
  JOIN:    { symbol: "⋈", color: "#c792ea", desc: "Combines tuples from two relations. Most expensive — Hash Join preferred over Nested Loop." },
  TABLE:   { symbol: "Ω", color: "#8fdb00", desc: "Base relation scan. Seq Scan reads all pages; Index Scan uses B+ Tree lookup." },
  SORT:    { symbol: "τ", color: "#ffcb6b", desc: "Orders the output relation. O(N log N). Avoid when outer operator doesn't need ordering." },
  GROUP:   { symbol: "γ", color: "#ffcb6b", desc: "Groups rows and applies aggregate functions (COUNT, SUM, AVG)." },
};

function detectOpType(name = "") {
  const n = name.toUpperCase();
  if (n.includes("SELECT") || n.startsWith("σ") || n.startsWith("FILTER") || n.startsWith("WHERE")) return "SELECT";
  if (n.includes("PROJECT") || n.startsWith("π")) return "PROJECT";
  if (n.includes("JOIN") || n.startsWith("⋈")) return "JOIN";
  if (n.includes("SORT") || n.includes("ORDER")) return "SORT";
  if (n.includes("GROUP") || n.includes("AGGREGATE")) return "GROUP";
  return "TABLE";
}

// Extract short predicate label from node name
function shortLabel(name = "") {
  const trimmed = name.replace(/^(SELECT|PROJECT|JOIN|SORT|GROUP BY|FILTER)\s*/i, "").trim();
  if (trimmed.length > 30) return trimmed.slice(0, 30) + "…";
  return trimmed || name;
}

// ── BFS layout ──────────────────────────────────────────────────────────────
function buildGraph(node, parentId = null, level = 0, pos = [0], result = { nodes: [], edges: [], idCounter: [0] }) {
  if (!node) return result;
  const id = `n${result.idCounter[0]++}`;
  const opType = detectOpType(node.name);
  const config = OP_CONFIG[opType];

  const X_GAP = 200;
  const Y_GAP = 140;
  const x = pos[0] * X_GAP;
  const y = level * Y_GAP;

  result.nodes.push({
    id,
    type: "opNode",
    position: { x, y },
    data: { node, opType, config },
  });

  if (parentId) {
    result.edges.push({
      id: `e-${parentId}-${id}`,
      source: parentId,
      target: id,
      type: "straight",
      style: { stroke: "#3a494a", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.Arrow, color: "#3a494a", width: 12, height: 12 },
    });
  }

  const children = node.children || [];
  const total = children.length;
  children.forEach((child, i) => {
    const offset = (i - (total - 1) / 2) * 1;
    const childPos = [pos[0] + offset];
    buildGraph(child, id, level + 1, childPos, result);
  });

  return result;
}

// ── Clean minimal operator node ─────────────────────────────────────────────
function OpNode({ data, selected }) {
  const { node, opType, config } = data;
  const label = shortLabel(node.name);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* Operator symbol circle */}
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: `2px solid ${config.color}`,
          background: selected
            ? config.color
            : `radial-gradient(circle at 40% 40%, ${config.color}22, #0e0e13)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          fontWeight: 900,
          color: selected ? "#0e0e13" : config.color,
          boxShadow: selected
            ? `0 0 20px ${config.color}88`
            : `0 0 12px ${config.color}33`,
          transition: "all 0.2s ease",
        }}
      >
        {config.symbol}
      </div>

      {/* Predicate label */}
      {label && (
        <div
          style={{
            fontFamily: "Fira Code, monospace",
            fontSize: "10px",
            color: selected ? config.color : "#849495",
            textAlign: "center",
            maxWidth: "120px",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {label}
        </div>
      )}

      {/* Invisible React Flow Handles for edge routing */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: "1px", height: "1px",
          background: "transparent", border: "none",
          top: 0, opacity: 0
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: "1px", height: "1px",
          background: "transparent", border: "none",
          bottom: 0, opacity: 0
        }}
      />
    </div>
  );
}

const nodeTypes = { opNode: OpNode };

// ── Sidebar ──────────────────────────────────────────────────────────────────
function NodeSidebar({ nodeData, onClose }) {
  if (!nodeData) return null;
  const { node, config } = nodeData;

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, height: "100%", width: "260px",
      background: "#131318", borderLeft: "1px solid #3a494a",
      display: "flex", flexDirection: "column", zIndex: 10,
      animation: "slideInRight 0.2s ease"
    }}>
      <div style={{ padding: "16px", borderBottom: "1px solid #3a494a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px", color: config.color, fontWeight: 900 }}>{config.symbol}</span>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff", fontFamily: "Space Grotesk" }}>{nodeData.opType}</div>
            <div style={{ fontSize: "10px", color: "#849495", textTransform: "uppercase", letterSpacing: "0.08em" }}>Operator</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#849495", fontSize: "18px", cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ padding: "16px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <div style={{ fontSize: "9px", color: "#849495", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Expression</div>
          <div style={{ fontFamily: "Fira Code, monospace", fontSize: "11px", color: config.color, background: `${config.color}11`, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${config.color}33`, lineHeight: 1.6, wordBreak: "break-word" }}>
            {node.name}
          </div>
        </div>

        {node.relationalAlgebra && (
          <div>
            <div style={{ fontSize: "9px", color: "#849495", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Algebra</div>
            <div style={{ fontFamily: "Fira Code, monospace", fontSize: "11px", color: "#ffcb6b", background: "rgba(255,203,107,0.08)", padding: "8px 10px", borderRadius: "6px", border: "1px solid rgba(255,203,107,0.2)", lineHeight: 1.6 }}>
              {node.relationalAlgebra}
            </div>
          </div>
        )}

        {node.cost != null && (
          <div>
            <div style={{ fontSize: "9px", color: "#849495", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Estimated Cost</div>
            <div style={{ fontFamily: "Fira Code, monospace", fontSize: "22px", fontWeight: 700, color: "#8fdb00" }}>
              {typeof node.cost === "number" ? node.cost.toLocaleString() : node.cost}
              <span style={{ fontSize: "11px", color: "#849495", marginLeft: "6px" }}>ops</span>
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: "9px", color: "#849495", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Explanation</div>
          <p style={{ fontSize: "11px", color: "#b9caca", lineHeight: 1.7, margin: 0 }}>{config.desc}</p>
        </div>
      </div>
    </div>
  );
}

// ── Inner component (needs ReactFlowProvider context) ────────────────────────
function Inner({ planData, label }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (!planData) return;
    const { nodes: n, edges: e } = buildGraph(planData);
    setNodes(n);
    setEdges(e);
    setSelectedNodeData(null);
    setTimeout(() => fitView({ padding: 0.4, duration: 400 }), 100);
  }, [planData]);

  const onNodeClick = useCallback((_, node) => setSelectedNodeData(node.data), []);
  const onPaneClick = useCallback(() => setSelectedNodeData(null), []);

  return (
    <div style={{ width: "100%", height: "460px", background: "#0e0e13", borderRadius: "14px", border: "1px solid #3a494a", position: "relative", overflow: "hidden" }}>
      {/* Label */}
      <div style={{ position: "absolute", top: "12px", left: "14px", zIndex: 5, fontFamily: "Space Grotesk", fontSize: "10px", fontWeight: 700, color: "#849495", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        style={{ background: "transparent" }}
      >
        <Background color="#1b1b20" gap={28} size={1} variant="dots" />
      </ReactFlow>

      {/* Sliding sidebar */}
      {selectedNodeData && (
        <NodeSidebar nodeData={selectedNodeData} onClose={() => setSelectedNodeData(null)} />
      )}
    </div>
  );
}

// ── Exported component ───────────────────────────────────────────────────────
export default function QueryPlanTree({ planData, label = "Query Plan" }) {
  if (!planData) return null;
  return (
    <ReactFlowProvider>
      <Inner planData={planData} label={label} />
    </ReactFlowProvider>
  );
}

