import { useState, useEffect, useRef } from "react";

const DB_SPECIFIC_INDEXES = {
  "Social Media": [
    {
      id: "user_id",
      label: "Index on user_id",
      color: "#63f7ff",
      rows: 5000,
      seekRows: 12,
      desc: "B+ Tree index on user_id allows direct seek to matching rows without reading the full table.",
      costMultiplier: 0.003,
    },
    {
      id: "city",
      label: "Index on city",
      color: "#c792ea",
      rows: 5000,
      seekRows: 25,
      desc: "B+ Tree index on city — useful for equality predicates (city = 'Berlin'). Lower selectivity than user_id.",
      costMultiplier: 0.005,
    },
  ],
  "University": [
    {
      id: "student_id",
      label: "Index on student_id",
      color: "#63f7ff",
      rows: 3000,
      seekRows: 1,
      desc: "Primary Key index on student_id. Instant lookup (O(log N)) to a unique student record.",
      costMultiplier: 0.0005,
    },
    {
      id: "course_id",
      label: "Index on course_id",
      color: "#c792ea",
      rows: 3000,
      seekRows: 45,
      desc: "Clustered index on course_id. Efficient for retrieving all students enrolled in a specific class.",
      costMultiplier: 0.01,
    },
  ],
  "Employee": [
    {
      id: "emp_id",
      label: "Index on emp_id",
      color: "#63f7ff",
      rows: 2000,
      seekRows: 1,
      desc: "Unique index on emp_id. Bypasses sequential scan entirely for point queries.",
      costMultiplier: 0.001,
    },
    {
      id: "dept_id",
      label: "Index on dept_id",
      color: "#c792ea",
      rows: 2000,
      seekRows: 150,
      desc: "Non-unique index on dept_id. Speeds up aggregation and filtering by department.",
      costMultiplier: 0.02,
    },
  ],
};

const DEFAULT_NONE = {
  id: "none",
  label: "No Index",
  color: "#849495",
  rows: 5000,
  seekRows: 5000,
  desc: "No index exists. The engine must read every page in the heap file sequentially.",
  costMultiplier: 1,
};

function AnimatedBar({ value, max, color, label, sublabel, animate }) {
  const pct = Math.min((value / max) * 100, 100);
  const barRef = useRef(null);

  useEffect(() => {
    if (!barRef.current) return;
    barRef.current.style.width = "0%";
    const t = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = pct + "%";
    }, 50);
    return () => clearTimeout(t);
  }, [pct, animate]);

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "baseline" }}>
        <span style={{ fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontFamily: "Fira Code, monospace", fontSize: "16px", fontWeight: 700, color }}>
            {value.toLocaleString()}
          </span>
          <span style={{ fontFamily: "Fira Code, monospace", fontSize: "10px", color: "#849495", marginLeft: "4px" }}>
            {sublabel}
          </span>
        </div>
      </div>
      <div style={{ height: "10px", background: "#1b1b20", borderRadius: "99px", overflow: "hidden" }}>
        <div
          ref={barRef}
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            borderRadius: "99px",
            width: "0%",
            transition: "width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

export default function ScanStrategySimulator({ currentDB = "Social Media" }) {
  const [activeIndex, setActiveIndex] = useState("none");
  const [animKey, setAnimKey] = useState(0);

  const dbIndexes = DB_SPECIFIC_INDEXES[currentDB] || [];
  const templates = [
    { ...DEFAULT_NONE, rows: dbIndexes[0]?.rows || 5000, seekRows: dbIndexes[0]?.rows || 5000 },
    ...dbIndexes
  ];
  
  const selected = templates.find((o) => o.id === activeIndex) || templates[0];
  const FULL_SCAN_COST = templates[0].rows;
  const indexCost = Math.round(FULL_SCAN_COST * selected.costMultiplier + (selected.id === 'none' ? 0 : selected.seekRows));
  const maxCost = FULL_SCAN_COST;
  const speedup = (FULL_SCAN_COST / Math.max(indexCost, 1)).toFixed(0);

  useEffect(() => {
    setActiveIndex("none");
    setAnimKey((k) => k + 1);
  }, [currentDB]);

  const handleSelect = (id) => {
    setActiveIndex(id);
    setAnimKey((k) => k + 1);
  };

  return (
    <div style={{
      marginTop: "24px",
      background: "#131318",
      border: "1px solid #3a494a",
      borderRadius: "16px",
      padding: "24px",
      fontFamily: "Space Grotesk, sans-serif",
    }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#e4e1e9", fontFamily: "Space Grotesk", letterSpacing: "0.02em" }}>Scan Strategy Simulator</div>
        <div style={{ fontSize: "11px", color: "#849495", marginTop: "2px" }}>Compare Seq Scan vs Index Seek costs in real time for {currentDB}</div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {templates.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: `1px solid ${activeIndex === opt.id ? opt.color : "#3a494a"}`,
              background: activeIndex === opt.id ? `${opt.color}18` : "#0e0e13",
              color: activeIndex === opt.id ? opt.color : "#849495",
              fontFamily: "Space Grotesk",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: activeIndex === opt.id ? `0 0 12px ${opt.color}33` : "none",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{
            padding: "14px 16px",
            borderRadius: "12px",
            border: `1px solid ${activeIndex === "none" ? "#ffb4ab" : "#3a494a"}`,
            background: activeIndex === "none" ? "rgba(255,180,171,0.08)" : "#0e0e13",
            transition: "all 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffb4ab", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Full Table Scan
              </span>
              <span style={{
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "4px",
                background: "rgba(255,180,171,0.15)",
                color: "#ffb4ab",
                fontWeight: 700,
              }}>
                EXPENSIVE
              </span>
            </div>
            <div style={{ fontFamily: "Fira Code, monospace", fontSize: "11px", color: "#849495", marginBottom: "4px" }}>
              Reads all {FULL_SCAN_COST.toLocaleString()} rows from heap
            </div>
            <div style={{ fontFamily: "Fira Code, monospace", fontSize: "20px", fontWeight: 700, color: "#ffb4ab" }}>
              {FULL_SCAN_COST.toLocaleString()} <span style={{ fontSize: "11px", color: "#849495" }}>I/O ops</span>
            </div>
          </div>

          <div style={{
            padding: "14px 16px",
            borderRadius: "12px",
            border: `1px solid ${activeIndex !== "none" ? "#8fdb00" : "#3a494a"}`,
            background: activeIndex !== "none" ? "rgba(143,219,0,0.08)" : "#0e0e13",
            transition: "all 0.3s ease",
            opacity: activeIndex === "none" ? 0.4 : 1,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#8fdb00", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {activeIndex === "none" ? "Index Seek (disabled)" : `Index Seek on ${activeIndex}`}
              </span>
              {activeIndex !== "none" && (
                <span style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: "rgba(143,219,0,0.15)",
                  color: "#8fdb00",
                  fontWeight: 700,
                }}>
                  {speedup}× FASTER
                </span>
              )}
            </div>
            <div style={{ fontFamily: "Fira Code, monospace", fontSize: "11px", color: "#849495", marginBottom: "4px" }}>
              {activeIndex !== "none"
                ? `B+ Tree traversal → ${selected.seekRows} matching rows`
                : "No index available — engine falls back to Seq Scan"}
            </div>
            {activeIndex !== "none" && (
              <div style={{ fontFamily: "Fira Code, monospace", fontSize: "20px", fontWeight: 700, color: "#8fdb00" }}>
                {indexCost.toLocaleString()} <span style={{ fontSize: "11px", color: "#849495" }}>I/O ops</span>
              </div>
            )}
          </div>

          <div style={{
            padding: "12px 14px",
            borderRadius: "8px",
            background: `${selected.color}0d`,
            border: `1px solid ${selected.color}33`,
          }}>
            <p style={{ fontSize: "11px", color: "#b9caca", lineHeight: 1.7, margin: 0 }}>
              {selected.desc}
            </p>
          </div>
        </div>

        <div style={{ padding: "4px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
            Cost Comparison (I/O Operations)
          </div>

          <AnimatedBar
            key={`full-${animKey}`}
            animate={animKey}
            value={FULL_SCAN_COST}
            max={maxCost}
            color="#ffb4ab"
            label="Full Table Scan"
            sublabel="I/O ops"
          />

          <AnimatedBar
            key={`idx-${animKey}`}
            animate={animKey}
            value={activeIndex !== "none" ? indexCost : FULL_SCAN_COST}
            max={maxCost}
            color={activeIndex !== "none" ? "#8fdb00" : "#849495"}
            label={activeIndex !== "none" ? `Index Seek (${activeIndex})` : "No Index (baseline)"}
            sublabel="I/O ops"
          />

          {activeIndex !== "none" && (
            <div style={{
              marginTop: "20px",
              padding: "14px",
              background: "rgba(143,219,0,0.06)",
              border: "1px solid rgba(143,219,0,0.25)",
              borderRadius: "10px",
              textAlign: "center",
              animation: "fadeIn 0.4s ease",
            }}>
              <div style={{ fontFamily: "Fira Code, monospace", fontSize: "32px", fontWeight: 900, color: "#8fdb00", lineHeight: 1 }}>
                {speedup}×
              </div>
              <div style={{ fontFamily: "Space Grotesk", fontSize: "11px", color: "#849495", marginTop: "4px" }}>
                faster with index on <span style={{ color: selected.color }}>{activeIndex}</span>
              </div>
              <div style={{ fontFamily: "Fira Code, monospace", fontSize: "11px", color: "#849495", marginTop: "8px" }}>
                {FULL_SCAN_COST.toLocaleString()} ops → {indexCost.toLocaleString()} ops
              </div>
            </div>
          )}

          {activeIndex === "none" && (
            <div style={{
              marginTop: "20px",
              padding: "14px",
              background: "rgba(255,180,171,0.06)",
              border: "1px solid rgba(255,180,171,0.2)",
              borderRadius: "10px",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: "Space Grotesk", fontSize: "12px", color: "#ffb4ab" }}>
                No index → Full Scan on every query
              </div>
              <div style={{ fontFamily: "Space Grotesk", fontSize: "11px", color: "#849495", marginTop: "4px" }}>
                Select an index above to see the speedup
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
