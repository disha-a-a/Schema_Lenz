import { Handle, Position } from "reactflow";

const LEVEL_COLORS = {
  0: "#00dce5", // cyan
  1: "#ff4b89", // pink
  2: "#8fdb00", // lime
  3: "#a855f7", // purple
};

export default function RelationNode({ data }) {
  const { id, attributes, isRoot, level = 0 } = data;
  const levelColor = LEVEL_COLORS[level % 4] || LEVEL_COLORS[0];

  return (
    <div style={{
      width: "280px",
      background: "#1b1b20",
      border: "1px solid #3a494a",
      borderRadius: "4px",
      display: "flex",
      overflow: "hidden",
      fontFamily: "Space Grotesk, sans-serif",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      position: "relative"
    }}>
      {/* Left Accent Bar */}
      <div style={{
        width: "8px",
        background: levelColor,
        flexShrink: 0
      }} />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "14px", color: "#e4e1e9", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Relation {id}
            </div>
            <div style={{ fontSize: "10px", color: "#849495", marginTop: "2px" }}>
              {attributes.length} attributes
            </div>
          </div>
          
          {/* Mini Bar Chart Visual on the right */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", width: "60px", alignItems: "flex-end" }}>
            {attributes.slice(0, 4).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  height: "4px", 
                  width: `${100 - (i * 20)}%`, 
                  background: levelColor, 
                  borderRadius: "2px",
                  opacity: 0.8 - (i * 0.15)
                }} 
              />
            ))}
          </div>
        </div>

        {/* Attribute Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {attributes.map((attr, idx) => (
            <span key={idx} style={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#b9caca",
              padding: "2px 6px",
              borderRadius: "2px",
              fontSize: "10px",
              fontFamily: "Fira Code, monospace",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              {attr}
            </span>
          ))}
        </div>
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
