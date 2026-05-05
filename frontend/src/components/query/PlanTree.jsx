import { useState } from "react";

export default function PlanTree({ planData, onNodeHover, forceView, highlightAmber }) {
  const [view, setView] = useState("optimized");
  
  if (!planData) return null;

  const currentView = forceView || view;

  const renderNode = (node, depth = 0) => {
    if (!node) return null;
    
    // Highlight select nodes in the optimized tree if highlightAmber is true
    const isPushedSelect = highlightAmber && node.name.startsWith("SELECT") && depth > 0;
    
    return (
      <div 
          key={node.name + depth + Math.random()} 
          style={{ marginLeft: depth * 24 }} 
          className="plan-node"
          onMouseEnter={() => onNodeHover?.(node)}
          onMouseLeave={() => onNodeHover?.(null)}
      >
        <div className="node-content" style={{
            padding: '0.4rem', 
            borderLeft: `2px solid ${isPushedSelect ? 'var(--function)' : 'var(--border)'}`, 
            marginBottom: '0.2rem',
            background: isPushedSelect ? 'rgba(251, 191, 36, 0.05)' : 'transparent'
        }}>
          <span className="node-icon">⚡</span>
          <span className="node-label" style={{color: isPushedSelect ? 'var(--function)' : 'inherit'}}>{node.name}</span>
          {node.relationalAlgebra && (
              <span className="node-algebra" style={{marginLeft: '0.5rem', color: isPushedSelect ? 'var(--function)' : 'var(--string)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>
                  {node.relationalAlgebra}
              </span>
          )}
        </div>
        {node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  const currentPlan = currentView === "optimized" ? planData.optimized : planData.original;

  return (
    <div className="plan-tree-container">
      {!forceView && (
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
                style={{background: view === "optimized" ? 'var(--primary)' : 'transparent', color: view === "optimized" ? 'white' : 'var(--text-main)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'}}
            >
                Heuristic Optimized
            </button>
          </div>
      )}
      
      <div className="tree-root" style={{background: forceView ? 'transparent' : 'var(--bg-deep)', padding: forceView ? '0' : '1.5rem', borderRadius: '8px', border: forceView ? 'none' : '1px solid var(--border)'}}>
        {renderNode(currentPlan)}
      </div>
    </div>
  );
}