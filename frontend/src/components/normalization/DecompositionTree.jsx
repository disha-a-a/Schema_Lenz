import { useEffect, useState, useMemo, useCallback } from "react";
import ReactFlow, { Background, Controls, Position, MarkerType, useReactFlow, ReactFlowProvider } from "reactflow";
import { Play, RotateCcw, FastForward } from "lucide-react";
import "reactflow/dist/style.css";
import RelationNode from "./RelationNode";

const nodeTypes = { relationNode: RelationNode };
const NF_LABELS = ["1NF", "2NF", "3NF", "BCNF"];

const LEVEL_COLORS = {
  0: "#00dce5", // cyan
  1: "#ff4b89", // pink
  2: "#8fdb00", // lime
  3: "#a855f7", // purple
};

function DecompositionTreeInner({ result, fullScreen }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { fitView } = useReactFlow();

  // BFS the tree to build the flat node/edge arrays
  const { allNodes, allEdges, steps } = useMemo(() => {
    if (!result?.decompositionTree) return { allNodes: [], allEdges: [], steps: [] };

    const nodes = [];
    const edges = [];
    const queue = [{ node: result.decompositionTree, level: 0, parentId: null }];
    const levelCounts = {};

    while (queue.length > 0) {
      const { node, level, parentId } = queue.shift();
      const indexInLevel = levelCounts[level] || 0;
      levelCounts[level] = indexInLevel + 1;

      const nodeId = node.id || `n-${Math.random()}`;
      
      nodes.push({
        id: nodeId,
        type: "relationNode",
        position: { x: level * 450, y: indexInLevel * 280 },
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
          style: { opacity: 0, stroke: LEVEL_COLORS[level % 4], strokeWidth: 3, transition: "opacity 0.4s ease" },
          markerEnd: { type: MarkerType.ArrowClosed, color: LEVEL_COLORS[level % 4] }
        });
      }

      if (node.children) {
        node.children.forEach(child => {
          queue.push({ node: child, level: level + 1, parentId: nodeId });
        });
      }
    }

    // Center the levels vertically
    const maxNodesInLevel = Math.max(...Object.values(levelCounts));
    const canvasHeight = maxNodesInLevel * 280;
    nodes.forEach(n => {
      const count = levelCounts[n.data.level];
      const levelHeight = count * 280;
      const offset = (canvasHeight - levelHeight) / 2;
      n.position.y += offset;
    });

    // Build steps
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
        // Step: Show edges first to imply left-to-right flow
        const inEdges = edges.filter(e => byLevel[lvl].includes(e.target)).map(e => e.id);
        if (inEdges.length) {
          stepList.push({ type: "SHOW_EDGES", ids: inEdges });
          stepList.push({ type: "PAUSE", ms: 400 });
        }
        
        // Step: Show the nodes at this level
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
    <div style={{ height: fullScreen ? "100%" : "650px", width: "100%", background: "#0e0e13", borderRadius: "16px", border: "1px solid #3a494a", position: "relative", overflow: "hidden" }}>
      {/* NF Layer Labels */}
      <div style={{ 
        position: "absolute", 
        top: 0, left: 0, height: "40px", display: "flex", zIndex: 5,
        pointerEvents: "none", background: "rgba(14, 14, 19, 0.9)", borderBottom: "1px solid rgba(58, 73, 74, 0.5)", backdropFilter: "blur(8px)",
        width: "1600px"
      }}>
        {NF_LABELS.map((label, i) => (
          <div key={label} style={{ 
            width: "400px", display: "flex", justifyContent: "center", alignItems: "center",
            fontSize: "13px", fontWeight: 900, 
            color: LEVEL_COLORS[i] || "#63f7ff", 
            letterSpacing: "0.3em", opacity: 0.8,
            borderRight: "1px dashed rgba(58, 73, 74, 0.3)",
            background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* Animation Controls */}
      <div style={{ position: "absolute", bottom: "20px", left: "20px", zIndex: 10, display: "flex", gap: "10px", background: "#1b1b20", padding: "10px", borderRadius: "12px", border: "1px solid #3a494a" }}>
        <button 
          onClick={() => {
            setNodes(allNodes.map(n => ({ ...n, style: { ...n.style, opacity: 0 } })));
            setEdges(allEdges.map(e => ({ ...e, style: { ...e.style, opacity: 0 }, animated: false })));
            setStepIdx(0);
            setIsPlaying(true);
          }}
          title="Replay"
          style={{ background: "#2a292f", border: "none", color: "#63f7ff", padding: "8px", borderRadius: "6px", cursor: "pointer" }}
        >
          <RotateCcw size={18} />
        </button>

        <button 
          onClick={() => setStepIdx(prev => Math.max(0, prev - 1))}
          style={{ background: "#2a292f", border: "none", color: "#849495", padding: "8px", borderRadius: "6px", cursor: "pointer" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_left</span>
        </button>

        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ background: isPlaying ? "#ff4b89" : "#8fdb00", border: "none", color: "#000", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}
        >
          {isPlaying ? "PAUSE" : <><Play size={16} /> PLAY</>}
        </button>

        <button 
          onClick={() => setStepIdx(prev => Math.min(steps.length, prev + 1))}
          style={{ background: "#2a292f", border: "none", color: "#849495", padding: "8px", borderRadius: "6px", cursor: "pointer" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_right</span>
        </button>

        <button 
          onClick={() => {
            setNodes(allNodes.map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
            setEdges(allEdges.map(e => ({ ...e, style: { ...e.style, opacity: 1 }, animated: true })));
            setStepIdx(steps.length);
            setIsPlaying(false);
          }}
          title="Fast Forward"
          style={{ background: "#2a292f", border: "none", color: "#849495", padding: "8px", borderRadius: "6px", cursor: "pointer" }}
        >
          <FastForward size={18} />
        </button>
        <div style={{ color: "#849495", fontSize: "12px", display: "flex", alignItems: "center", marginLeft: "10px", fontWeight: 600 }}>
          STEP {stepIdx} / {steps.length}
        </div>
      </div>

      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes} 
        fitView
        minZoom={0.1}
      >
        <Background variant="dots" color="#1f1f25" gap={20} />
        <Controls style={{ background: "#1b1b20", border: "1px solid #3a494a", color: "#63f7ff" }} />
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