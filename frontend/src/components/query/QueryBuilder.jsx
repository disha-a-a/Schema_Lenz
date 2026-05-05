import { useState } from "react";
import { optimizeQuery, simulateCost } from "../../api/schemaLenzApi";

export default function QueryBuilder({ onPlan }) {
    const [sql, setSql] = useState("SELECT name, age FROM users WHERE age > 20");
    const [leftRows, setLeftRows] = useState(1000);
    const [rightRows, setRightRows] = useState(500);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const optRes = await optimizeQuery(sql);
            const costRes = await simulateCost(leftRows, rightRows);
            
            onPlan({
                original: optRes.data.originalPlan,
                optimized: optRes.data.optimizedPlan,
                cost: costRes.data
            });
        } catch (error) {
            console.error("Query optimization failed", error);
            alert("Error parsing SQL or optimizing. Ensure JSqlParser can handle the syntax.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="query-builder">
            <div className="input-group">
                <label className="section-label">SQL Query Editor</label>
                <textarea 
                    className="mono-code"
                    rows={6}
                    value={sql}
                    onChange={e => setSql(e.target.value)}
                    placeholder="-- Enter SELECT statement here..."
                    style={{marginTop: '0.5rem'}}
                />
            </div>
            
            <div className="cost-sim-inputs" style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <div>
                    <label className="section-label" style={{display:'block'}}>Left Table Rows</label>
                    <input type="number" value={leftRows} onChange={e => setLeftRows(Number(e.target.value))} className="mono-code" style={{padding: '0.5rem'}} />
                </div>
                <div>
                    <label className="section-label" style={{display:'block'}}>Right Table Rows</label>
                    <input type="number" value={rightRows} onChange={e => setRightRows(Number(e.target.value))} className="mono-code" style={{padding: '0.5rem'}} />
                </div>
            </div>

            <div style={{marginTop: '1.5rem'}}>
                <button className="primary-btn" onClick={handleAnalyze} disabled={loading}>
                    {loading ? "Processing..." : "Run Visual Execution"}
                </button>
            </div>
        </div>
    );
}