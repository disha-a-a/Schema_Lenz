import { useEffect, useState } from "react";
import ReactFlow, { Background, Controls, Position, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import RelationNode from "./RelationNode";

const nodeTypes = { relationNode: RelationNode };

export default function DecompositionTree({ result, stepIndex = 999, isPlaying = false }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (!result || !result.decompositionTree) return;

    const { nodes: newNodes, edges: newEdges } = buildLayout(result.decompositionTree, stepIndex, isPlaying);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [result, stepIndex, isPlaying]);

  const buildLayout = (treeRoot, limit, playing) => {
    const nodesOutput = [];
    const edgesOutput = [];
    let counter = 0;

    // Use BFS to determine positions
    const queue = [{ 
      node: treeRoot, 
      level: 0, 
      parentId: null, 
      parentX: -200, // For entry animation
      parentY: 300 
    }];
    
    const tempNodes = [];

    while (queue.length > 0 && counter <= limit) {
      const current = queue.shift();
      const { node, level, parentId, parentX, parentY } = current;

      tempNodes.push({
        id: node.id,
        type: "relationNode",
        level,
        parentId,
        parentX,
        parentY,
        attributes: node.attributes,
        nodeData: node
      });

      counter++;

      if (node.children) {
        node.children.forEach(child => {
          queue.push({ 
            node: child, 
            level: level + 1, 
            parentId: node.id,
            parentX: level * 350,
            parentY: 0, // Will be calculated below
            reason: node.violatingFD ? `Violates ${node.reason}: ${node.violatingFD.lhs.join(',')} → ${node.violatingFD.rhs.join(',')}` : ''
          });
        });
      }
    }

    // Now calculate final positions and build edges
    tempNodes.forEach((n) => {
      const nodesInLevel = tempNodes.filter(tn => tn.level === n.level);
      const indexInLevel = nodesInLevel.indexOf(n);
      const levelHeight = nodesInLevel.length * 180;
      const startY = 300 - (levelHeight / 2) + 90; // +90 to offset first node center
      
      const finalX = n.level * 350;
      const finalY = startY + (indexInLevel * 180);

      nodesOutput.push({
        id: n.id,
        type: "relationNode",
        // Animation: starts at parent position, moves to final
        position: { x: n.parentId ? n.parentX : -100, y: n.parentId ? n.parentY : 300 },
        data: { 
          id: n.id, 
          attributes: n.attributes, 
          isRoot: n.level === 0,
          level: n.level
        },
        style: { transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }, // Bouncy slide
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      // Update position to final after a tick for the animation
      setTimeout(() => {
        setNodes(prev => prev.map(node => 
          node.id === n.id ? { ...node, position: { x: finalX, y: finalY } } : node
        ));
      }, 50);

      if (n.parentId) {
        edgesOutput.push({
          id: `e-${n.parentId}-${n.id}`,
          source: n.parentId,
          target: n.id,
          label: n.nodeData.reason || '',
          type: "smoothstep",
          animated: playing,
          style: { stroke: n.level % 2 === 0 ? '#ff4b89' : '#00dce5', strokeWidth: 2 },
          labelStyle: { fill: '#ffb4ab', fontSize: 10, fontWeight: 600 },
          labelBgStyle: { fill: '#1b1b20', fillOpacity: 0.8 },
          markerEnd: { type: MarkerType.ArrowClosed, color: n.level % 2 === 0 ? '#ff4b89' : '#00dce5' }
        });
      }
    });

    return { nodes: nodesOutput, edges: edgesOutput };
  };

  return (
    <div style={{ height: "600px", width: "100%", background: "#0e0e13", borderRadius: "12px", border: "1px solid #3a494a" }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes} 
        fitView
      >
        <Background variant="lines" color="#1f1f25" gap={40} />
        <Controls style={{ background: "#1b1b20", border: "1px solid #3a494a", color: "#63f7ff" }} />
      </ReactFlow>
    </div>
  );
}