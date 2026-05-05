import { useState } from "react";
import axios from "axios";

export default function IndexBuilder({ onTreeGenerated }) {
    const [values, setValues] = useState("10, 20, 30, 40, 50, 60, 70, 80");
    const [order, setOrder] = useState(3);
    const [loading, setLoading] = useState(false);

    const handleBuild = async () => {
        setLoading(true);
        try {
            const intValues = values.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v));
            const response = await axios.post("http://localhost:8080/api/index/build", {
                values: intValues,
                order: order
            });
            onTreeGenerated(response.data);
        } catch (error) {
            console.error("Index build failed", error);
            alert("Failed to build index. Ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="index-builder">
            <div className="input-group">
                <label className="section-label">Index Values (Comma-separated)</label>
                <textarea 
                    className="mono-code"
                    rows={4}
                    value={values}
                    onChange={e => setValues(e.target.value)}
                    placeholder="-- Enter integers here..."
                    style={{marginTop: '0.5rem'}}
                />
            </div>
            
            <div className="input-group" style={{marginTop: '1rem'}}>
                <label className="section-label" style={{display:'block'}}>B+ Tree Order (Degree)</label>
                <input 
                    type="number" 
                    value={order} 
                    onChange={e => setOrder(Number(e.target.value))} 
                    className="mono-code" 
                    style={{padding: '0.5rem', width: '100px'}} 
                    min={3} max={10}
                />
            </div>

            <div style={{marginTop: '1.5rem'}}>
                <button className="primary-btn" onClick={handleBuild} disabled={loading}>
                    {loading ? "Building..." : "Build B+ Tree"}
                </button>
            </div>
        </div>
    );
}
