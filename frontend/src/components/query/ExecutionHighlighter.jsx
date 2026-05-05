import JoinCostChart from "./JoinCostChart";

export default function ExecutionHighlighter({ activeNode, planData }) {
  return (
    <div className="execution-highlighter active">
      {activeNode ? (
        <>
            <div className="highlight-header">
                <h4>Operator: {activeNode.name}</h4>
                <span className="badge">Cost: {activeNode.cost || 'N/A'}</span>
            </div>
            <div className="highlight-body">
                {activeNode.relationalAlgebra && (
                    <div style={{marginBottom: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--string)'}}>
                        Algebra: {activeNode.relationalAlgebra}
                    </div>
                )}
                <p><strong>Description:</strong> {activeNode.details || `This operator performs ${activeNode.name.toLowerCase()} on the input stream.`}</p>
            </div>
        </>
      ) : (
        <div className="highlight-header">
            <h4>Cost Simulation Results</h4>
        </div>
      )}
      
      {planData?.cost && (
        <div className="cost-analysis" style={{marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem'}}>
            <h5 style={{color: 'var(--keyword)', marginBottom: '0.5rem'}}>Join Strategy Cost Estimate</h5>
            <div className="stats">
                <div className="stat-item" style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}>
                    <span className="label">Nested Loop:</span>
                    <span className="value mono-code" style={{color: 'var(--function)', padding:0, border:'none'}}>{planData.cost.nestedLoopCost.toLocaleString()} ops</span>
                </div>
                <div className="stat-item" style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}>
                    <span className="label">Hash Join:</span>
                    <span className="value mono-code" style={{color: 'var(--function)', padding:0, border:'none'}}>{planData.cost.hashJoinCost.toLocaleString()} ops</span>
                </div>
                
                <JoinCostChart nestedLoopCost={planData.cost.nestedLoopCost} hashJoinCost={planData.cost.hashJoinCost} />

                <div className="stat-item" style={{display:'flex', justifyContent:'space-between', marginTop:'0.8rem', background:'var(--bg-sidebar)', padding:'0.5rem', borderRadius:'4px'}}>
                    <span className="label">Recommendation:</span>
                    <span className="value" style={{color: 'var(--success)', fontWeight:'bold'}}>{planData.cost.recommendation}</span>
                </div>
            </div>
        </div>
      )}

      {!activeNode && !planData?.cost && (
         <div className="empty" style={{opacity: 0.6}}>
            <p>Hover over a plan node to see execution details, or run an analysis to view cost simulation.</p>
         </div>
      )}
    </div>
  );
}