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
      width: "420px",
      background: "#1b1b20",
      border: `1px solid rgba(255, 255, 255, 0.1)`,
      borderLeft: `3px solid ${levelColor}`,
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "Space Grotesk, sans-serif",
      boxShadow: `0 10px 30px rgba(0,0,0,0.5)`,
      position: "relative",
      transition: "all 0.3s ease"
    }}>
      {/* Top Header */}
      <div style={{
        background: `${levelColor}15`,
        padding: "8px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid ${levelColor}30`
      }}>
        <div style={{ fontWeight: 800, fontSize: "14px", color: levelColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Relation {data.nfStage || "R"} {id.split('-').pop()}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ background: levelColor, padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 900, color: "#000" }}>
            {data.nfStage || "1NF"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Candidate Keys */}
        {candidateKeys.length > 0 && (
          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
             <Key size={12} color={levelColor} />
             <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
               {candidateKeys.map((key, i) => (
                 <span key={i} style={{ fontSize: "12px", color: levelColor, fontWeight: 700, fontFamily: "Fira Code" }}>
                   ({key.join(", ")}){i < candidateKeys.length - 1 ? "," : ""}
                 </span>
               ))}
             </div>
          </div>
        )}

        {/* Attribute Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {attributes.map((attr, idx) => {
            const determinant = isDeterminant(attr);
            const keyPart = isKey(attr);
            
            return (
              <span key={idx} style={{
                background: determinant ? `${levelColor}22` : "rgba(255, 255, 255, 0.03)",
                color: determinant ? levelColor : "#b9caca",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontFamily: "Fira Code, monospace",
                border: `1px solid ${determinant ? `${levelColor}55` : "rgba(255, 255, 255, 0.1)"}`,
                fontWeight: determinant ? 700 : 400,
                textDecoration: keyPart ? "underline" : "none",
                transition: "all 0.2s"
              }}>
                {attr}
              </span>
            );
          })}
        </div>

        {/* Violation Info */}
        {violatingFD && (
          <div style={{ 
            marginTop: "4px", 
            padding: "10px", 
            background: "rgba(255, 75, 137, 0.05)", 
            borderRadius: "6px",
            border: "1px solid rgba(255, 75, 137, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ff4b89", fontSize: "13px", fontWeight: 700 }}>
              <AlertCircle size={16} />
              <span>VIOLATES {reason}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e4e1e9", fontSize: "14px", fontFamily: "Fira Code" }}>
              <span style={{ color: levelColor }}>{violatingFD.lhs.join(", ")}</span>
              <ArrowRight size={12} color="#849495" />
              <span style={{ color: "#ff4b89" }}>{violatingFD.rhs.join(", ")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Handles */}
      {!isRoot && (
        <Handle 
          type="target" 
          position={Position.Left} 
          style={{ background: levelColor, width: '12px', height: '12px', border: '3px solid #1b1b20', left: '-6px' }} 
        />
      )}
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: levelColor, width: '12px', height: '12px', border: '3px solid #1b1b20', right: '-6px' }} 
      />
    </div>
  );
}
