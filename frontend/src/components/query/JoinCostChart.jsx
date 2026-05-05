export default function JoinCostChart({ nestedLoopCost, hashJoinCost }) {
    if (!nestedLoopCost || !hashJoinCost) return null;

    const maxCost = Math.max(nestedLoopCost, hashJoinCost);
    const nlHeight = Math.max((nestedLoopCost / maxCost) * 100, 2); // min 2% to be visible
    const hjHeight = Math.max((hashJoinCost / maxCost) * 100, 2);

    return (
        <div className="join-cost-chart" style={{marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid var(--border)'}}>
            <h5 style={{color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.85rem'}}>Cost Comparison Chart</h5>
            
            <div style={{display: 'flex', alignItems: 'flex-end', height: '120px', gap: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)'}}>
                {/* Nested Loop Bar */}
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                    <span style={{fontSize: '0.7rem', color: 'var(--text-main)', marginBottom: '0.3rem'}}>{nestedLoopCost.toLocaleString()}</span>
                    <div style={{
                        width: '40px', 
                        height: `${nlHeight}%`, 
                        background: 'var(--danger)', 
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.5s ease-in-out'
                    }}></div>
                </div>

                {/* Hash Join Bar */}
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                    <span style={{fontSize: '0.7rem', color: 'var(--text-main)', marginBottom: '0.3rem'}}>{hashJoinCost.toLocaleString()}</span>
                    <div style={{
                        width: '40px', 
                        height: `${hjHeight}%`, 
                        background: 'var(--success)', 
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.5s ease-in-out'
                    }}></div>
                </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-bright)'}}>
                <span style={{width: '100%', textAlign: 'center'}}>Nested Loop</span>
                <span style={{width: '100%', textAlign: 'center'}}>Hash Join</span>
            </div>
        </div>
    );
}
