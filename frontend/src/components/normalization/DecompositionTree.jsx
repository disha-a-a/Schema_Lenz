import { useEffect, useState, useMemo, useCallback } from "react";
import ReactFlow, { Background, Controls, MiniMap, Position, MarkerType, useReactFlow, ReactFlowProvider } from "reactflow";
import { Play, RotateCcw, FastForward, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import "reactflow/dist/style.css";
import RelationNode from "./RelationNode";

const nodeTypes = { relationNode: RelationNode };
const NF_LABELS = ["1NF", "2NF", "3NF", "BCNF"];

const LEVEL_COLORS = {
  0: "#00dce5", // cyan (1NF)
  1: "#ff4b89", // pink (2NF)
  2: "#8fdb00", // lime (3NF)
  3: "#a855f7", // purple (BCNF)
};

const NODE_WIDTH = 400; // Increased horizontal spread
const NODE_HEIGHT = 180; // Standard height for spacing calculations
const VERTICAL_GAP = 120; // Minimum gap between siblings

function DecompositionTreeInner({ result, fullScreen }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // BFS the tree to build the flat node/edge arrays
    const { allNodes, allEdges, steps } = useMemo(() => {
    if (!result?.decompositionTree) return { allNodes: [], allEdges: [], steps: [] };

    const nodes = [];
    const edges = [];

    // 1. Compute subtree height for each node (recursive)
    // This allows us to allocate enough vertical space for each branch
    const computeSubtreeHeight = (node) => {
      if (!node.children || node.children.length === 0) {
        node._subtreeHeight = NODE_HEIGHT + VERTICAL_GAP;
        return node._subtreeHeight;
      }
      let totalHeight = 0;
      node.children.forEach(child => {
        totalHeight += computeSubtreeHeight(child);
      });
      node._subtreeHeight = Math.max(NODE_HEIGHT + VERTICAL_GAP, totalHeight);
      return node._subtreeHeight;
    };

    // 2. Assign positions using the precomputed subtree heights
    const assignPositions = (node, level, startY, parentId) => {
      const nodeId = node.id || `n-${Math.random().toString(36).substr(2, 9)}`;
      const x = level * NODE_WIDTH;
      // Position this node in the center of its own vertical allocation
      const y = startY + (node._subtreeHeight / 2) - (NODE_HEIGHT / 2);

      nodes.push({
        id: nodeId,
        type: "relationNode",
        position: { x, y },
        data: { 
          ...node, 
          level, 
          isRoot: parentId === null 
        },
        style: { opacity: 0, transition: "opacity 0.5s ease" },
      });

      if (parentId) {
        edges.push({
          id: `e-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: "smoothstep",
          animated: false,
          style: { opacity: 0, stroke: LEVEL_COLORS[level % 4] || "#63f7ff", strokeWidth: 3, transition: "opacity 0.4s ease" },
          markerEnd: { type: MarkerType.ArrowClosed, color: LEVEL_COLORS[level % 4] || "#63f7ff" }
        });
      }

      if (node.children) {
        let currentY = startY;
        node.children.forEach(child => {
          assignPositions(child, level + 1, currentY, nodeId);
          currentY += child._subtreeHeight;
        });
      }
    };

    // Run the layout
    computeSubtreeHeight(result.decompositionTree);
    assignPositions(result.decompositionTree, 0, 0, null);

    // Build steps for animation
    const stepList = [];
    const byLevel = {};
    nodes.forEach(n => {
      (byLevel[n.data.level] = byLevel[n.data.level] || []).push(n.id);
    });

    Object.keys(byLevel).sort().forEach(lvl => {
      const levelInt = parseInt(lvl);
      if (levelInt === 0) {
        stepList.push({ type: "SHOW_NODES", ids: byLevel[lvl] });
        stepList.push({ type: "PAUSE", ms: 800 });
      } else {
        const inEdges = edges.filter(e => byLevel[lvl].includes(e.target)).map(e => e.id);
        if (inEdges.length) {
          stepList.push({ type: "SHOW_EDGES", ids: inEdges });
          stepList.push({ type: "PAUSE", ms: 400 });
        }
        stepList.push({ type: "SHOW_NODES", ids: byLevel[lvl] });
        stepList.push({ type: "PAUSE", ms: 800 });
      }
    });

    return { allNodes: nodes, allEdges: edges, steps: stepList };
  }, [result]);

  useEffect(() => {
    setNodes(allNodes);
    setEdges(allEdges);
    setStepIdx(0);
    setIsPlaying(true);
  }, [allNodes, allEdges]);

  const runStep = useCallback((idx) => {
    if (idx >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const currentStep = steps[idx];
    if (currentStep.type === "SHOW_NODES") {
      setNodes(prev => prev.map(n => 
        currentStep.ids.includes(n.id) ? { ...n, style: { ...n.style, opacity: 1 } } : n
      ));
    } else if (currentStep.type === "SHOW_EDGES") {
      setEdges(prev => prev.map(e => 
        currentStep.ids.includes(e.id) ? { ...e, style: { ...e.style, opacity: 1 }, animated: true } : e
      ));
    }

    const delay = currentStep.type === "PAUSE" ? currentStep.ms : 600;
    setTimeout(() => {
      setStepIdx(idx + 1);
    }, delay);
  }, [steps]);

  useEffect(() => {
    if (isPlaying) {
      runStep(stepIdx);
    }
  }, [isPlaying, stepIdx, runStep]);

  useEffect(() => {
    if (stepIdx > 0) {
      fitView({ duration: 800, padding: 0.2 });
    }
  }, [stepIdx, fitView]);

  return (
    <div style={{ 
      height: fullScreen ? "calc(100vh - 160px)" : "650px", 
      width: "100%", 
      background: "#0e0e13", 
      borderRadius: "16px", 
      border: "1px solid #3a494a", 
      position: "relative", 
      overflow: "hidden" 
    }}>
      {/* NF Stage Column Headers (Fixed) */}
      <div style={{ 
        position: "absolute", 
        top: 0, left: 0, right: 0, height: "40px", 
        display: "flex", zIndex: 10,
        background: "rgba(13, 13, 18, 0.9)", 
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(58, 73, 74, 0.5)"
      }}>
        {NF_LABELS.map((label, i) => (
          <div key={label} style={{ 
            flex: 1, 
            display: "flex", justifyContent: "center", alignItems: "center",
            fontSize: "12px", fontWeight: 900, 
            color: LEVEL_COLORS[i] || "#63f7ff", 
            letterSpacing: "0.2em",
            borderRight: i < 3 ? "1px solid rgba(58, 73, 74, 0.3)" : "none"
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* Animation Controls */}
      <div style={{ position: "absolute", bottom: "24px", left: "24px", zIndex: 10, display: "flex", gap: "12px", background: "#1b1b20", padding: "12px", borderRadius: "14px", border: "1px solid #3a494a", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        <button 
          onClick={() => {
            setNodes(allNodes.map(n => ({ ...n, style: { ...n.style, opacity: 0 } })));
            setEdges(allEdges.map(e => ({ ...e, style: { ...e.style, opacity: 0 }, animated: false })));
            setStepIdx(0);
            setIsPlaying(true);
          }}
          title="Restart Animation"
          style={{ background: "#2a292f", border: "1px solid #3a494a", color: "#63f7ff", padding: "10px", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}
        >
          <RotateCcw size={18} />
        </button>

        <button 
          onClick={() => {
            setIsPlaying(false);
            setStepIdx(prev => Math.max(0, prev - 1));
          }}
          disabled={stepIdx <= 0}
          style={{ background: "#2a292f", border: "1px solid #3a494a", color: stepIdx <= 0 ? "#444" : "#849495", padding: "10px", borderRadius: "8px", cursor: stepIdx <= 0 ? "not-allowed" : "pointer" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_left</span>
        </button>

        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ background: isPlaying ? "#ff4b89" : "#8fdb00", border: "none", color: "#000", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
        >
          {isPlaying ? "PAUSE" : <><Play size={18} fill="currentColor" /> PLAY</>}
        </button>

        <button 
          onClick={() => {
            setIsPlaying(false);
            setStepIdx(prev => Math.min(steps.length, prev + 1));
          }}
          disabled={stepIdx >= steps.length}
          style={{ background: "#2a292f", border: "1px solid #3a494a", color: stepIdx >= steps.length ? "#444" : "#849495", padding: "10px", borderRadius: "8px", cursor: stepIdx >= steps.length ? "not-allowed" : "pointer" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_right</span>
        </button>

        <button 
          onClick={() => {
            setNodes(allNodes.map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
            setEdges(allEdges.map(e => ({ ...e, style: { ...e.style, opacity: 1 }, animated: true })));
            setStepIdx(steps.length);
            setIsPlaying(false);
            setTimeout(() => fitView({ padding: 0.15, duration: 800 }), 100);
          }}
          title="Skip to End"
          style={{ background: "#2a292f", border: "1px solid #3a494a", color: "#849495", padding: "10px", borderRadius: "8px", cursor: "pointer" }}
        >
          <FastForward size={18} />
        </button>

        <div style={{ width: "1px", background: "#3a494a", margin: "0 8px" }} />

        <button 
          onClick={() => zoomIn({ duration: 300 })}
          title="Zoom In"
          style={{ background: "#2a292f", border: "1px solid #3a494a", color: "#63f7ff", padding: "10px", borderRadius: "8px", cursor: "pointer" }}
        >
          <ZoomIn size={18} />
        </button>

        <button 
          onClick={() => zoomOut({ duration: 300 })}
          title="Zoom Out"
          style={{ background: "#2a292f", border: "1px solid #3a494a", color: "#63f7ff", padding: "10px", borderRadius: "8px", cursor: "pointer" }}
        >
          <ZoomOut size={18} />
        </button>

        <button 
          onClick={() => fitView({ padding: 0.15, duration: 800 })}
          title="Center View"
          style={{ background: "#2a292f", border: "1px solid #3a494a", color: "#63f7ff", padding: "10px", borderRadius: "8px", cursor: "pointer" }}
        >
          <Maximize size={18} />
        </button>

        <div style={{ color: "#849495", fontSize: "12px", display: "flex", alignItems: "center", marginLeft: "10px", fontWeight: 700, fontFamily: "Space Grotesk" }}>
          STEP {stepIdx} / {steps.length}
        </div>
      </div>

      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes} 
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.05}
        maxZoom={1.5}
      >
        <Background variant="dots" color="#1f1f25" gap={20} />
        <Controls style={{ background: "#1b1b20", border: "1px solid #3a494a", color: "#63f7ff" }} />
        <MiniMap 
          style={{ background: "#1b1b20", border: "1px solid #3a494a", borderRadius: "8px" }}
          maskColor="rgba(0,0,0,0.5)"
          nodeColor={n => LEVEL_COLORS[n.data.level] || "#63f7ff"}
        />
      </ReactFlow>
    </div>
  );
}

export default function DecompositionTree(props) {
  return (
    <ReactFlowProvider>
      <DecompositionTreeInner {...props} />
    </ReactFlowProvider>
  );
}