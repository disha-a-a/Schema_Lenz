import { Handle, Position } from "reactflow";
import { AlertCircle, ArrowRight, Key } from "lucide-react";

const LEVEL_COLORS = {
  0: "#00dce5", // cyan (1NF)
  1: "#ff4b89", // pink (2NF)
  2: "#8fdb00", // lime (3NF)
  3: "#a855f7", // purple (BCNF)
};

export default function RelationNode({ data }) {
  const { id, attributes, isRoot, level = 0, violatingFD, reason, candidateKeys = [] } = data;
  const levelColor = LEVEL_COLORS[level % 4] || LEVEL_COLORS[0];

  const bgColor = "#1b1b20";

  // Determine if an attribute is part of the violation (RHS of violating FD)
  const isViolating = (attr) => violatingFD && violatingFD.rhs.includes(attr);
  const isKey = (attr) => candidateKeys.some(key => key.includes(attr));
  const isDeterminant = (attr) => (violatingFD && violatingFD.lhs.includes(attr)) || isKey(attr);

  return (
    <div style={{
      width: "320px",
      minHeight: "120px",
      background: "#1b1b20",
      border: `1px solid rgba(255, 255, 255, 0.1)`,
      borderLeft: `4px solid ${levelColor}`,
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "Space Grotesk, sans-serif",
      boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
      position: "relative",
      transition: "all 0.3s ease",
    }}>
      {/* Top Header */}
      <div style={{
        background: `${levelColor}15`,
        padding: "8px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid ${levelColor}20`
      }}>
        <div style={{ fontWeight: 700, fontSize: "14px", color: levelColor, textTransform: "uppercase" }}>
          Relation_{id.split('-').pop()}
        </div>
        <div style={{ background: levelColor, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 900, color: "#000" }}>
          {data.nfStage || "1NF"}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Attribute Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {attributes.map((attr, idx) => {
            const determinant = isDeterminant(attr);
            const keyPart = isKey(attr);
            
            return (
              <span key={idx} style={{
                background: determinant ? `${levelColor}20` : "rgba(255, 255, 255, 0.05)",
                color: determinant ? levelColor : "#e4e1e9",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "12px",
                fontFamily: "Fira Code, monospace",
                border: `1px solid ${determinant ? levelColor : "rgba(255, 255, 255, 0.1)"}`,
                fontWeight: determinant ? 700 : 400,
                textDecoration: keyPart ? "underline" : "none",
              }}>
                {attr}
              </span>
            );
          })}
        </div>

        {/* Violation Info */}
        {violatingFD && (
          <div style={{ 
            marginTop: "6px", 
            padding: "12px", 
            background: "rgba(255, 75, 137, 0.08)", 
            borderRadius: "10px",
            border: "1px solid rgba(255, 75, 137, 0.2)",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff4b89", fontSize: "12px", fontWeight: 800, textTransform: "uppercase" }}>
              <AlertCircle size={14} />
              <span>{reason} VIOLATION DETECTED</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#e4e1e9", fontSize: "14px", fontFamily: "Fira Code", background: "#0e0e13", padding: "8px", borderRadius: "6px" }}>
              <span style={{ color: levelColor, fontWeight: 700 }}>{violatingFD.lhs.join(", ")}</span>
              <ArrowRight size={14} color="#ff4b89" />
              <span style={{ color: "#ff4b89", fontWeight: 700 }}>{violatingFD.rhs.join(", ")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Handles */}
      {!isRoot && (
        <Handle 
          type="target" 
          position={Position.Left} 
          style={{ background: levelColor, width: '10px', height: '10px', border: '2px solid #1b1b20', left: '-5px' }} 
        />
      )}
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: levelColor, width: '10px', height: '10px', border: '2px solid #1b1b20', right: '-5px' }} 
      />
    </div>
  );
}
