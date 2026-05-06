import React, { useState, useEffect } from "react";
import { Database, Table as TableIcon } from "lucide-react";

export default function DecomposedSchemaPage({ result }) {
  const [visibleCount, setVisibleCount] = useState(0);

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
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontFamily: "Space Grotesk", fontSize: "18px", color: "#8fdb00", marginBottom: "8px" }}>
          Decomposed Normalized Schema
        </h2>
        <p style={{ color: "#849495", fontSize: "12px" }}>
          The following relations were generated to satisfy {result.targetNF || "BCNF"} requirements. Redundancy has been eliminated.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {result.decomposedRelations.map((rel, i) => (
          <div key={i} style={{ 
            background: "#1b1b20", 
            border: "1px solid #3a494a", 
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ padding: "8px", background: "rgba(143, 219, 0, 0.1)", borderRadius: "8px", color: "#8fdb00" }}>
                <TableIcon size={18} />
              </div>
              <h3 style={{ fontFamily: "Space Grotesk", fontSize: "14px", fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>
                Relation_{i}
              </h3>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {rel.map(attr => (
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
          </div>
        ))}
      </div>
    </div>
  );
}
