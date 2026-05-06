import React, { useState } from "react";
import { Users, Posts, Comments, Follows, Hashtags, PostTags } from "../../data/socialDB";
import { Table, Database, Info, List, Play, X } from "lucide-react";

const tables = [
  { name: "User", data: Users, icon: <Database size={16} /> },
  { name: "Post", data: Posts, icon: <Database size={16} /> },
  { name: "Comment", data: Comments, icon: <Database size={16} /> },
  { name: "Follow", data: Follows, icon: <Database size={16} /> },
  { name: "Hashtag", data: Hashtags, icon: <Database size={16} /> },
  { name: "PostTag", data: PostTags, icon: <Database size={16} /> },
];

export default function DBBrowser({ onSelectTable, onNormalize }) {
  const [expandedTable, setExpandedTable] = useState(null);

  const handleCardClick = (tbl) => {
    setExpandedTable(tbl);
    onSelectTable && onSelectTable(tbl);
  };

  return (
    <div style={{ padding: "24px", height: "100%", overflowY: "auto", position: "relative" }}>
      {/* ── HEADING ── */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ 
          fontFamily: "Space Grotesk", fontSize: "14px", fontWeight: 700, 
          letterSpacing: "0.2em", textTransform: "uppercase", color: "#63f7ff",
          display: "flex", alignItems: "center", gap: "10px"
        }}>
          <Database size={20} />
          Relations
        </h2>
        <p style={{ color: "#849495", fontSize: "12px", marginTop: "4px", opacity: 0.8 }}>
          Select a relation to explore its structure and data.
        </p>
      </div>

      {/* ── CARD GRID ── */}
      <div style={{ 
        display: "grid", gap: "20px", 
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" 
      }}>
        {tables.map((tbl) => {
          const attrs = Object.keys(tbl.data[0] || {});
          return (
            <div key={tbl.name}
                 onClick={() => handleCardClick(tbl)}
                 style={{
                   borderRadius: "16px",
                   padding: "20px",
                   background: "#1b1b20",
                   border: "1px solid #3a494a",
                   cursor: "pointer",
                   transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                   position: "relative",
                   overflow: "hidden"
                 }}
                 onMouseEnter={e => {
                   e.currentTarget.style.borderColor = "#63f7ff";
                   e.currentTarget.style.transform = "translateY(-4px)";
                   e.currentTarget.style.boxShadow = "0 8px 24px rgba(99, 247, 255, 0.1)";
                 }}
                 onMouseLeave={e => {
                   e.currentTarget.style.borderColor = "#3a494a";
                   e.currentTarget.style.transform = "translateY(0)";
                   e.currentTarget.style.boxShadow = "none";
                 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ 
                  background: "rgba(99, 247, 255, 0.1)", color: "#63f7ff", 
                  padding: "8px", borderRadius: "10px" 
                }}>
                  {tbl.icon}
                </div>
                <div style={{ 
                  fontSize: "10px", color: "#849495", fontFamily: "Space Grotesk", 
                  fontWeight: 700, letterSpacing: "0.05em" 
                }}>
                  {tbl.data.length} ROWS
                </div>
              </div>
              <h3 style={{ 
                fontFamily: "Space Grotesk", fontSize: "18px", fontWeight: 700, 
                color: "#e4e1e9", marginBottom: "12px" 
              }}>
                {tbl.name}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {attrs.slice(0, 4).map(a => (
                  <span key={a} style={{ 
                    fontSize: "10px", color: "#b9caca", background: "#2a292f", 
                    padding: "2px 8px", borderRadius: "4px", border: "1px solid #3a494a" 
                  }}>
                    {a}
                  </span>
                ))}
                {attrs.length > 4 && (
                  <span style={{ fontSize: "10px", color: "#63f7ff" }}>+{attrs.length - 4} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BENTO GRID EXPANSION OVERLAY ── */}
      {expandedTable && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(13, 13, 18, 0.98)", zIndex: 1000,
          display: "flex", flexDirection: "column", padding: "40px",
          backdropFilter: "blur(20px)"
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ background: "#63f7ff", color: "#003739", padding: "12px", borderRadius: "12px" }}>
                <Database size={24} />
              </div>
              <div>
                <h1 style={{ fontFamily: "Space Grotesk", fontSize: "32px", fontWeight: 700, color: "#e4e1e9" }}>
                  {expandedTable.name}
                </h1>
                <p style={{ color: "#849495", fontSize: "14px" }}>Relation Analysis & Exploration</p>
              </div>
            </div>
            <button 
              onClick={() => setExpandedTable(null)}
              style={{ background: "#1f1f25", border: "1px solid #3a494a", color: "#e4e1e9", padding: "8px", borderRadius: "50%", cursor: "pointer" }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Bento Grid Layout */}
          <div style={{ 
            flex: 1, display: "grid", gap: "20px", 
            gridTemplateColumns: "2fr 1fr", gridTemplateRows: "1fr 1fr",
            overflow: "hidden" 
          }}>
            {/* Cell 1: Data Preview (Main) */}
            <div style={{ 
              gridRow: "span 2", background: "#1b1b20", borderRadius: "24px", 
              border: "1px solid #3a494a", padding: "24px", display: "flex", flexDirection: "column"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "#63f7ff" }}>
                <Table size={18} />
                <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Data Preview</span>
              </div>
              <div style={{ flex: 1, overflow: "auto", border: "1px solid #2a292f", borderRadius: "12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "#b9caca", fontSize: "13px" }}>
                  <thead style={{ position: "sticky", top: 0, background: "#2a292f" }}>
                    <tr>
                      {Object.keys(expandedTable.data[0] || {}).map(a => (
                        <th key={a} style={{ textAlign: "left", padding: "12px 16px", borderBottom: "1px solid #3a494a", fontFamily: "Fira Code, monospace" }}>{a}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expandedTable.data.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #2a292f" }}>
                        {Object.keys(row).map(a => (
                          <td key={a} style={{ padding: "12px 16px", fontFamily: "Fira Code, monospace", opacity: 0.9 }}>{row[a]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cell 2: Metadata / Info */}
            <div style={{ 
              background: "#1b1b20", borderRadius: "24px", 
              border: "1px solid #3a494a", padding: "24px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", color: "#ffb4ab" }}>
                <Info size={18} />
                <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Statistics</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#0e0e13", padding: "16px", borderRadius: "16px" }}>
                  <div style={{ fontSize: "10px", color: "#849495", marginBottom: "4px" }}>ROWS</div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#ffb4ab" }}>{expandedTable.data.length}</div>
                </div>
                <div style={{ background: "#0e0e13", padding: "16px", borderRadius: "16px" }}>
                  <div style={{ fontSize: "10px", color: "#849495", marginBottom: "4px" }}>COLUMNS</div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#63f7ff" }}>{Object.keys(expandedTable.data[0] || {}).length}</div>
                </div>
              </div>
              <div style={{ marginTop: "20px", background: "rgba(255, 75, 137, 0.05)", border: "1px solid rgba(255, 75, 137, 0.2)", padding: "16px", borderRadius: "16px" }}>
                <div style={{ fontSize: "11px", color: "#ff4b89", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Play size={14} />
                  QUICK ACTION
                </div>
                <p style={{ color: "#b9caca", fontSize: "12px", marginTop: "8px", lineHeight: 1.5 }}>
                  This table appears to be denormalized. Ready for 3NF decomposition?
                </p>
                <button 
                  onClick={() => onNormalize(expandedTable)}
                  style={{ 
                    marginTop: "12px", width: "100%", background: "#ff4b89", color: "#590026", 
                    border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer",
                    fontWeight: 700, fontSize: "11px", textTransform: "uppercase"
                  }}
                >
                  Start Normalization
                </button>
              </div>
            </div>

            {/* Cell 3: Attributes List */}
            <div style={{ 
              background: "#1b1b20", borderRadius: "24px", 
              border: "1px solid #3a494a", padding: "24px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "#8fdb00" }}>
                <List size={18} />
                <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Schema Attributes</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Object.keys(expandedTable.data[0] || {}).map(a => (
                  <div key={a} style={{ 
                    background: "#0e0e13", border: "1px solid #2a292f", 
                    padding: "8px 12px", borderRadius: "10px", color: "#e4e1e9",
                    fontSize: "12px", fontFamily: "Fira Code, monospace"
                  }}>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
