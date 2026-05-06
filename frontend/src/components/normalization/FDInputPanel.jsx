import { useState, useEffect } from "react";
import { normalize } from "../../api/schemaLenzApi";
import { Plus, Trash2, ArrowRight, Play, Database, FileText, ChevronDown, X } from "lucide-react";

const MultiSelect = ({ options, selected, onChange, placeholder, activeColor = "#63f7ff" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()) && !selected.includes(opt));

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minHeight: "40px", padding: "8px 12px", background: "#131318", border: "1px solid #3a494a",
          borderRadius: "8px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", cursor: "pointer"
        }}
      >
        {selected.length === 0 && <span style={{ color: "#5a696a", fontSize: "12px" }}>{placeholder}</span>}
        {selected.map(item => (
          <span key={item} style={{ 
            background: `${activeColor}22`, color: activeColor, border: `1px solid ${activeColor}55`,
            borderRadius: "4px", padding: "2px 8px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px"
          }}>
            {item}
            <X size={10} onClick={(e) => { e.stopPropagation(); onChange(selected.filter(i => i !== item)); }} style={{ cursor: "pointer" }} />
          </span>
        ))}
        <ChevronDown size={14} style={{ marginLeft: "auto", color: "#5a696a" }} />
      </div>

      {isOpen && (
        <div style={{ 
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, 
          background: "#1b1b20", border: "1px solid #3a494a", borderRadius: "8px", 
          marginTop: "4px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", overflow: "hidden"
        }}>
          <input 
            autoFocus
            placeholder="Search attributes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: "100%", padding: "10px", background: "#0e0e13", border: "none", 
              borderBottom: "1px solid #3a494a", color: "#fff", fontSize: "12px", outline: "none"
            }}
          />
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filtered.map(opt => (
              <div 
                key={opt}
                onClick={() => { onChange([...selected, opt]); setSearch(""); }}
                style={{ padding: "10px", fontSize: "12px", color: "#b9caca", cursor: "pointer", borderBottom: "1px solid #2a292f" }}
                onMouseEnter={e => e.currentTarget.style.background = "#2a292f"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {opt}
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: "10px", fontSize: "11px", color: "#5a696a" }}>No attributes found</div>}
          </div>
        </div>
      )}
      {isOpen && <div onClick={() => setIsOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
    </div>
  );
};

export default function FDInputPanel({ onResult, availableAttributes, currentSchemaName }) {
  const [fds, setFds] = useState([{ lhs: [], rhs: [] }]);
  const [loading, setLoading] = useState(false);
  const [targetNF, setTargetNF] = useState("3NF");

  const addFD = () => setFds([...fds, { lhs: [], rhs: [] }]);
  const removeFD = (index) => setFds(fds.filter((_, i) => i !== index));
  
  const updateFD = (index, side, value) => {
    const updated = [...fds];
    updated[index][side] = value;
    setFds(updated);
  };

  const submit = async () => {
    if (availableAttributes.length === 0) return;
    setLoading(true);
    try {
        const fdList = fds.filter(fd => fd.lhs.length > 0 && fd.rhs.length > 0);
        const { data } = await normalize(availableAttributes, fdList, targetNF);
        onResult(data);
        document.dispatchEvent(new CustomEvent("sl-execute"));
    } catch (error) {
        console.error("Normalization failed", error);
        alert("Normalization failed. Check inputs.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", background: "#1b1b20", borderRadius: "16px", border: "1px solid #3a494a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <Database size={18} color="#63f7ff" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "10px", color: "#849495", fontWeight: 700, textTransform: "uppercase" }}>Active Schema</span>
            <span style={{ fontSize: "13px", color: "#63f7ff", fontFamily: "Space Grotesk", fontWeight: 700 }}>
              {currentSchemaName || "No Schema Selected"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {["1NF", "2NF", "3NF", "BCNF"].map(nf => (
            <button
              key={nf}
              onClick={() => setTargetNF(nf)}
              style={{
                padding: "6px 12px",
                background: targetNF === nf ? "#63f7ff" : "#2a292f",
                color: targetNF === nf ? "#003739" : "#849495",
                border: "1px solid",
                borderColor: targetNF === nf ? "#63f7ff" : "#3a494a",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {nf}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {fds.map((fd, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#0e0e13", padding: "12px", borderRadius: "12px", border: "1px solid #2a292f" }}>
            <MultiSelect 
              options={availableAttributes} 
              selected={fd.lhs} 
              onChange={(val) => updateFD(i, "lhs", val)} 
              placeholder="Determinants..."
              activeColor="#63f7ff"
            />
            
            <ArrowRight size={18} color="#3a494a" />

            <MultiSelect 
              options={availableAttributes} 
              selected={fd.rhs} 
              onChange={(val) => updateFD(i, "rhs", val)} 
              placeholder="Dependents..."
              activeColor="#ff4b89"
            />

            <button 
              onClick={() => removeFD(i)}
              style={{ background: "transparent", border: "none", color: "#3a494a", cursor: "pointer", padding: "4px" }}
              onMouseEnter={e => e.currentTarget.style.color = "#ff4b89"}
              onMouseLeave={e => e.currentTarget.style.color = "#3a494a"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={addFD}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "10px", border: "1px dashed #3a494a", borderRadius: "8px",
              background: "transparent", color: "#849495", cursor: "pointer", transition: "all 0.15s",
              fontSize: "11px", fontFamily: "Space Grotesk", fontWeight: 700
            }}
          >
            <Plus size={14} /> ADD FD
          </button>
          <button
            onClick={() => {
              if (currentSchemaName?.includes("Social")) {
                setFds([
                  { lhs: ["post_id", "tag_id"], rhs: ["likes"] },             // Key base
                  { lhs: ["post_id"], rhs: ["user_id", "content"] },          // 2NF Partial
                  { lhs: ["user_id"], rhs: ["email", "name"] },                // 3NF Transitive
                  { lhs: ["email"], rhs: ["user_id"] }                        // BCNF Violation
                ]);
              } else if (currentSchemaName?.includes("University")) {
                setFds([
                  { lhs: ["s_id", "c_id"], rhs: ["grade"] },                   // Key base
                  { lhs: ["s_id"], rhs: ["s_name", "s_dept"] },               // 2NF Partial
                  { lhs: ["s_dept"], rhs: ["inst_name"] },                    // 3NF Transitive
                  { lhs: ["inst_name"], rhs: ["s_dept"] }                     // BCNF Violation
                ]);
              } else if (currentSchemaName?.includes("Employee")) {
                setFds([
                  { lhs: ["emp_id", "project_id"], rhs: ["hours"] },           // Key base
                  { lhs: ["emp_id"], rhs: ["emp_name", "dept_id"] },           // 2NF Partial
                  { lhs: ["dept_id"], rhs: ["dept_name", "dept_manager"] },    // 3NF Transitive
                  { lhs: ["dept_manager"], rhs: ["dept_id"] }                 // BCNF Violation
                ]);
              }
            }}
            style={{ flex: 1, background: "#131318", color: "#8fdb00", border: "1px solid #3a494a", borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontWeight: 700 }}
          >
            LOAD DEMO FDs
          </button>
          <button
            onClick={() => setFds([{ lhs: [], rhs: [] }])}
            style={{ padding: "10px 15px", background: "transparent", color: "#ff4b89", border: "1px solid #3a494a", borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontWeight: 700 }}
          >
            CLEAR
          </button>
        </div>

        <button
          onClick={submit}
          disabled={loading || availableAttributes.length === 0}
          style={{
            marginTop: "12px", padding: "14px", borderRadius: "12px", border: "none",
            background: availableAttributes.length > 0 ? "#63f7ff" : "#2a292f", 
            color: availableAttributes.length > 0 ? "#003739" : "#5a696a", 
            fontWeight: 800, fontSize: "12px", cursor: availableAttributes.length > 0 ? "pointer" : "not-allowed", 
            textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
          }}
        >
          {loading ? "PROCESSING..." : <><Play size={16} /> EXECUTE NORMALIZATION</>}
        </button>
      </div>
    </div>
  );
}