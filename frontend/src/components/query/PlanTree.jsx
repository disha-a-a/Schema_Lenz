import { useState } from "react";

export default function PlanTree({ planData, onNodeHover }) {
  const [view, setView] = useState("optimized");
  
  if (!planData) return null;

  const renderNode = (node, depth = 0) => {
    if (!node) return null;
    return (
      <div 
          key={node.name + depth + Math.random()} 
          style={{ marginLeft: depth * 24 }} 
          className="plan-node"
          onMouseEnter={() => onNodeHover?.(node)}
          onMouseLeave={() => onNodeHover?.(null)}
      >
        <div className="node-content" style={{padding: '0.4rem', borderLeft: '2px solid var(--border)', marginBottom: '0.2rem'}}>
          <span className="node-icon">⚡</span>
          <span className="node-label">{node.name}</span>
          {node.relationalAlgebra && (
              <span className="node-algebra" style={{marginLeft: '0.5rem', color: 'var(--string)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>
                  {node.relationalAlgebra}
              </span>
          )}
        </div>
        {node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  const currentPlan = view === "optimized" ? planData.optimized : planData.original;

  return (
    <div className="plan-tree-container">
      <div className="view-toggles" style={{marginBottom: '1.5rem', display: 'flex', gap: '0.5rem'}}>
        <button 
            className={`secondary-btn ${view === "original" ? "active" : ""}`} 
            onClick={() => setView("original")}
            style={{background: view === "original" ? 'var(--primary)' : 'transparent', color: view === "original" ? 'white' : 'var(--text-main)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'}}
        >
            Original AST
        </button>
        <button 
            className={`secondary-btn ${view === "optimized" ? "active" : ""}`} 
            onClick={() => setView("optimized")}
            style={{background: view === "optimized" ? 'var(--primary)' : 'white', color: view === "optimized" ? 'white' : 'var(--text-main)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'}}
        >
            Heuristic Optimized
        </button>
      </div>
      
      <div className="tree-root" style={{background: 'var(--bg-deep)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)'}}>
        {renderNode(currentPlan)}
      </div>
    </div>
  );
}