import { useState } from "react";
import axios from "axios";

export default function IndexBuilder({ onTreeGenerated }) {
    const [input, setInput] = useState("10, 20, 30, 40, 50, 60, 70");
    const [order, setOrder] = useState(3);
    const [loading, setLoading] = useState(false);

    const parseValues = (str) => {
        return str.split(",")
            .map(v => v.trim())
            .filter(v => v !== "")
            .map(v => parseInt(v))
            .filter(v => !isNaN(v));
    };

    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const handleBuild = async () => {
        const values = parseValues(input);
        if (values.length < 1) return;

        setLoading(true);
        try {
            // Use the steps endpoint to get the full history in one call
            const response = await axios.post("http://localhost:8080/api/index/build-steps", {
                values: values,
                order: order
            });
            const steps = response.data;
            if (steps.length > 0) {
                setHistory(steps);
                setHistoryIndex(steps.length - 1);
                onTreeGenerated(steps[steps.length - 1]);
            }
        } catch (error) {
            console.error("Index build failed", error);
            alert("Failed to build index. Ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleStepInsert = async () => {
        const values = parseValues(input);
        if (values.length < 1) return;

        // If no history yet, fetch all steps first
        if (history.length === 0) {
            setLoading(true);
            try {
                const response = await axios.post("http://localhost:8080/api/index/build-steps", {
                    values: values,
                    order: order
                });
                const steps = response.data;
                if (steps.length > 0) {
                    setHistory(steps);
                    setHistoryIndex(0);
                    onTreeGenerated(steps[0]);
                }
            } catch (error) {
                console.error("Step insertion failed", error);
            } finally {
                setLoading(false);
            }
            return;
        }

        // Advance to the next step
        if (historyIndex < history.length - 1) {
            const nextIdx = historyIndex + 1;
            setHistoryIndex(nextIdx);
            onTreeGenerated(history[nextIdx]);
        } else {
            alert("All values already inserted!");
        }
    };

    const addRandom = () => {
        const val = Math.floor(Math.random() * 99) + 1;
        setInput(prev => prev ? `${prev}, ${val}` : `${val}`);
        setHistory([]);
        setHistoryIndex(-1);
    };

    const values = parseValues(input);
    const currentValueLabel = historyIndex >= 0 && historyIndex < values.length
        ? values[historyIndex]
        : null;

    return (
        <div className="index-builder" style={{ 
            background: "#131318", border: "1px solid #3a494a", borderRadius: "16px", padding: "24px",
            fontFamily: "Space Grotesk, sans-serif"
        }}>
            <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#e4e1e9", letterSpacing: "0.02em", textAlign: "center" }}>B+ Tree Builder</div>
                {history.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", background: "#0e0e13", padding: "4px 8px", borderRadius: "8px", border: "1px solid #3a494a", alignItems: "center", width: "100%", justifyContent: "center" }}>
                        <button 
                            disabled={historyIndex <= 0}
                            onClick={() => {
                                const idx = historyIndex - 1;
                                setHistoryIndex(idx);
                                onTreeGenerated(history[idx]);
                            }}
                            style={{ padding: "4px 8px", background: "none", border: "none", color: historyIndex <= 0 ? "#3a494a" : "#63f7ff", cursor: historyIndex <= 0 ? "not-allowed" : "pointer", fontSize: "10px", fontWeight: 700 }}
                        >
                            ◀ PREV
                        </button>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "60px" }}>
                            <span style={{ fontSize: "10px", color: "#849495", fontWeight: 700 }}>
                                {historyIndex + 1} / {history.length}
                            </span>
                            {currentValueLabel !== null && (
                                <span style={{ fontSize: "9px", color: "#63f7ff", fontWeight: 600 }}>
                                    inserted {currentValueLabel}
                                </span>
                            )}
                        </div>
                        <button 
                            disabled={historyIndex >= history.length - 1}
                            onClick={() => {
                                const idx = historyIndex + 1;
                                setHistoryIndex(idx);
                                onTreeGenerated(history[idx]);
                            }}
                            style={{ padding: "4px 8px", background: "none", border: "none", color: historyIndex >= history.length - 1 ? "#3a494a" : "#63f7ff", cursor: historyIndex >= history.length - 1 ? "not-allowed" : "pointer", fontSize: "10px", fontWeight: 700 }}
                        >
                            NEXT ▶
                        </button>
                    </div>
                )}
            </div>

            <div className="input-group" style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#63f7ff", textTransform: "uppercase", letterSpacing: "0.1em" }}>Keys to Insert</label>
                    <button onClick={addRandom} style={{ background: "none", border: "none", color: "#63f7ff", fontSize: "10px", cursor: "pointer", fontWeight: 700 }}>+ RANDOM KEY</button>
                </div>
                <textarea 
                    value={input}
                    onChange={e => {
                        setInput(e.target.value);
                        setHistory([]);
                        setHistoryIndex(-1);
                    }}
                    placeholder="Enter integers (e.g. 10, 20, 30)..."
                    style={{
                        width: "100%", padding: "12px", background: "#0e0e13", color: "#e4e1e9",
                        border: "1px solid #3a494a", borderRadius: "8px", fontFamily: "Fira Code, monospace",
                        fontSize: "13px", outline: "none", resize: "none"
                    }}
                    rows={2}
                />
            </div>
            
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ width: "100px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#63f7ff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Order (m)</label>
                    <input 
                        type="number" 
                        value={order} 
                        onChange={e => setOrder(Math.max(3, parseInt(e.target.value) || 3))} 
                        style={{
                            width: "100%", padding: "10px", background: "#0e0e13", color: "#e4e1e9",
                            border: "1px solid #3a494a", borderRadius: "8px", fontFamily: "Fira Code, monospace",
                            fontSize: "14px", outline: "none"
                        }}
                        min={3} max={10}
                    />
                </div>

                <div style={{ flex: 1, display: "flex", gap: "12px", alignItems: "flex-end" }}>
                    <button 
                        onClick={handleBuild} 
                        disabled={loading}
                        style={{
                            flex: 1, background: "rgba(99, 247, 255, 0.1)", color: "#63f7ff", border: "1px solid #63f7ff", 
                            padding: "12px", borderRadius: "8px", fontFamily: "Space Grotesk", 
                            fontSize: "12px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        BUILD ALL
                    </button>
                    <button 
                        onClick={handleStepInsert} 
                        disabled={loading}
                        style={{
                            flex: 1, background: "#63f7ff", color: "#003739", border: "none", 
                            padding: "12px", borderRadius: "8px", fontFamily: "Space Grotesk", 
                            fontSize: "12px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        {history.length === 0 ? "START STEP" : "STEP INSERT"}
                    </button>
                </div>
            </div>
        </div>
    );
}
