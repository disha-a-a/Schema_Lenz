import React, { useState, useEffect } from "react";
import { Database, Table as TableIcon, X, Share2 } from "lucide-react";

export default function DecomposedSchemaPage({ result, flatFileData, onViewTree }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [selectedRelation, setSelectedRelation] = useState(null);

  useEffect(() => {
    if (result?.decomposedRelations) {
      setVisibleCount(0);
      const timer = setInterval(() => {
        setVisibleCount(prev => {
          if (prev < result.decomposedRelations.length) return prev + 1;
          clearInterval(timer);
          return prev;
        });
      }, 300);
      return () => clearInterval(timer);
    }
  }, [result]);

  if (!result || !result.decomposedRelations) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#849495" }}>
        <Database size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
        <p>No decomposed schema available. Run normalization first.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#131318", height: "100%", overflowY: "auto" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontFamily: "Space Grotesk", fontSize: "18px", color: "#8fdb00", marginBottom: "8px" }}>
            Decomposed Normalized Schema
          </h2>
          <p style={{ color: "#849495", fontSize: "12px", maxWidth: "600px" }}>
            The following relations were generated to satisfy {result.targetNF || "BCNF"} requirements. Redundancy has been eliminated through systematic decomposition.
          </p>
        </div>
        <button 
          onClick={onViewTree}
          style={{
            background: "rgba(99, 247, 255, 0.1)", color: "#63f7ff", border: "1px solid #63f7ff",
            padding: "10px 20px", borderRadius: "8px", cursor: "pointer",
            fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "12px",
            display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(99, 247, 255, 0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(99, 247, 255, 0.1)"; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>account_tree</span>
          VIEW DECOMPOSITION FLOW
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: "24px" }}>
        {result.decomposedRelations.map((rel, i) => {
            const projectedData = [];
            const seen = new Set();
            
            if (flatFileData && flatFileData.length > 0) {
              flatFileData.forEach(row => {
                const newRow = {};
                rel.attributes.forEach(attr => {
                  newRow[attr] = row[attr];
                });
                const hash = JSON.stringify(newRow);
                if (!seen.has(hash)) {
                  seen.add(hash);
                  projectedData.push(newRow);
                }
              });
            }

            return (
            <div 
              key={i} 
              onClick={() => setSelectedRelation({ rel, index: i, data: projectedData })}
              style={{ 
              background: "rgba(27, 27, 32, 0.7)", 
              border: "1px solid rgba(255, 255, 255, 0.08)", 
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              opacity: i < visibleCount ? 1 : 0,
              transform: i < visibleCount ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              display: "flex",
              flexDirection: "column",
              height: "500px",
              cursor: "pointer",
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexShrink: 0 }}>
                <div style={{ padding: "8px", background: "rgba(143, 219, 0, 0.1)", borderRadius: "8px", color: "#8fdb00" }}>
                  <TableIcon size={18} />
                </div>
                <h3 style={{ fontFamily: "Space Grotesk", fontSize: "14px", fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>
                  Relation_{i}
                </h3>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px", flexShrink: 0 }}>
                {rel.attributes.map(attr => (
                  <span key={attr} style={{
                    padding: "4px 10px",
                    background: "#0e0e13",
                    border: "1px solid #3a494a",
                    borderRadius: "4px",
                    color: "#b9caca",
                    fontSize: "11px",
                    fontFamily: "Fira Code, monospace"
                  }}>
                    {attr}
                  </span>
                ))}
              </div>

              {/* Data Table */}
              <div style={{ flex: 1, overflow: "auto", border: "1px solid #2a292f", borderRadius: "8px", background: "#0e0e13" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: "Fira Code, monospace", color: "#e4e1e9" }}>
                  <thead style={{ position: "sticky", top: 0, background: "#1f1f25", zIndex: 1 }}>
                    <tr>
                      {rel.attributes.map(attr => (
                        <th key={attr} style={{ padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #3a494a", color: "#63f7ff", fontWeight: 800, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                          {attr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projectedData.length > 0 ? projectedData.map((row, rowIndex) => (
                      <tr key={rowIndex} style={{ borderBottom: "1px solid #2a292f" }}>
                        {rel.attributes.map(attr => (
                          <td key={attr} style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                            {row[attr] !== undefined && row[attr] !== null ? String(row[attr]) : "NULL"}
                          </td>
                        ))}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={rel.attributes.length} style={{ padding: "16px", textAlign: "center", color: "#849495", fontStyle: "italic" }}>
                          No data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })}
        </div>

        {/* ── FULL SCREEN RELATION MODAL ── */}
        {selectedRelation && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            zIndex: 9999, background: "rgba(13, 13, 18, 0.98)", backdropFilter: "blur(30px)",
            display: "flex", flexDirection: "column", padding: "40px", animation: "fadeIn 0.2s ease"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ padding: "12px", background: "rgba(143, 219, 0, 0.1)", borderRadius: "12px", color: "#8fdb00" }}>
                  <TableIcon size={32} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "Space Grotesk", fontSize: "32px", fontWeight: 700, color: "#fff", margin: 0 }}>
                    Relation_{selectedRelation.index}
                  </h2>
                  <p style={{ color: "#849495", fontSize: "14px", marginTop: "4px" }}>
                    Projected normalized tuples
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRelation(null)}
                style={{
                  background: "rgba(255, 75, 137, 0.1)", color: "#ff4b89", border: "1px solid #ff4b89",
                  padding: "12px", borderRadius: "50%", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#ff4b89"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 75, 137, 0.1)"; e.currentTarget.style.color = "#ff4b89"; }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: "auto", border: "1px solid #3a494a", borderRadius: "16px", background: "#0e0e13" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", fontFamily: "Fira Code, monospace", color: "#e4e1e9" }}>
                <thead style={{ position: "sticky", top: 0, background: "#1f1f25", zIndex: 1 }}>
                  <tr>
                    {selectedRelation.rel.attributes.map(attr => (
                      <th key={attr} style={{ padding: "16px 24px", textAlign: "left", borderBottom: "2px solid #3a494a", color: "#63f7ff", fontWeight: 700 }}>
                        {attr}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedRelation.data.length > 0 ? selectedRelation.data.map((row, rowIndex) => (
                    <tr key={rowIndex} style={{ borderBottom: "1px solid #2a292f" }}>
                      {selectedRelation.rel.attributes.map(attr => (
                        <td key={attr} style={{ padding: "12px 24px", whiteSpace: "nowrap" }}>
                          {row[attr] !== undefined && row[attr] !== null ? String(row[attr]) : "NULL"}
                        </td>
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={selectedRelation.rel.attributes.length} style={{ padding: "32px", textAlign: "center", color: "#849495", fontStyle: "italic", fontSize: "16px" }}>
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
