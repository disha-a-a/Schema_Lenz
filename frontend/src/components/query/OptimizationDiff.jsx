import PlanTree from "./PlanTree";

export default function OptimizationDiff({ planData, onNodeHover }) {
  if (!planData || !planData.original || !planData.optimized) return null;

  return (
    <div className="optimization-diff" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: '100%' }}>
      <div className="diff-panel" style={{ background: 'var(--bg-sidebar)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>Original AST</h4>
        <PlanTree planData={{ optimized: planData.original }} forceView="optimized" onNodeHover={onNodeHover} />
      </div>
      <div className="diff-panel" style={{ background: 'var(--bg-deep)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--primary)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-10px', right: '1.5rem', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>HEURISTIC APPLIED</div>
        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>Optimized Plan</h4>
        <PlanTree planData={planData} forceView="optimized" onNodeHover={onNodeHover} highlightAmber />
      </div>
    </div>
  );
}
