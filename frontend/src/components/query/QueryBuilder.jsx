import { useState } from "react";
import { analyzeQuery } from "../../api/schemaLenzApi";

export default function QueryBuilder({ onPlan }) {
    const [sql, setSql] = useState("SELECT name, age FROM users WHERE age > 20");
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const { data } = await analyzeQuery(sql);
            onPlan(data);
        } catch (error) {
            console.error("Query analysis failed", error);
            alert("Error parsing SQL. Ensure JSqlParser can handle the syntax.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="query-builder">
            <div className="input-group">
                <label>SQL Query</label>
                <textarea 
                    rows={4}
                    value={sql}
                    onChange={e => setSql(e.target.value)}
                    placeholder="Enter SELECT statement..."
                />
            </div>
            <button className="primary" onClick={handleAnalyze} disabled={loading}>
                {loading ? "Parsing..." : "Analyze Plan"}
            </button>
        </div>
    );
}