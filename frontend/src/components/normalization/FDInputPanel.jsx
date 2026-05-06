import { useState, useEffect } from "react";
import { normalize } from "../../api/schemaLenzApi";
import { Plus, Trash2, ArrowRight, Play, Database, FileText } from "lucide-react";

export default function FDInputPanel({ onResult, availableAttributes = [], targetNF: externalNF }) {
  const [fds, setFds] = useState([{ lhs: [], rhs: [] }]);
  const [loading, setLoading] = useState(false);
  const [targetNF, setTargetNF] = useState(externalNF || "3NF");

  const addFD = () => setFds([...fds, { lhs: [], rhs: [] }]);
  
  const removeFD = (index) => {
    setFds(fds.filter((_, i) => i !== index));
  };

  const toggleAttribute = (index, side, attr) => {
    const updated = [...fds];
    const current = updated[index][side];
    if (current.includes(attr)) {
      updated[index][side] = current.filter(a => a !== attr);
    } else {
      updated[index][side] = [...current, attr];
    }
    setFds(updated);
  };

  const submit = async () => {
    if (availableAttributes.length === 0) return;
    setLoading(true);
    try {
        const fdList = fds.filter(fd => fd.lhs.length > 0 && fd.rhs.length > 0);
        const { data } = await normalize(availableAttributes, fdList, targetNF);
        onResult(data);
    } catch (error) {
        console.error("Normalization failed", error);
        alert("Normalization failed. Ensure backend is running and input is valid.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", background: "#1b1b20", borderRadius: "16px", border: "1px solid #3a494a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ fontFamily: "Space Grotesk", fontSize: "14px", fontWeight: 700, color: "#63f7ff", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={16} />
          Configure Dependencies
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: "#849495" }}>Target NF:</span>
          <select 
            value={targetNF} 
            onChange={e => setTargetNF(e.target.value)}
            style={{ background: "#2a292f", color: "#e4e1e9", border: "1px solid #3a494a", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", outline: "none" }}
          >
            <option value="3NF">3NF</option>
            <option value="BCNF">BCNF</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {fds.map((fd, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#0e0e13", padding: "16px", borderRadius: "12px", border: "1px solid #2a292f" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: "#849495", marginBottom: "8px", textTransform: "uppercase" }}>Determinants (LHS)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {availableAttributes.map(attr => (
                  <button
                    key={attr}
                    onClick={() => toggleAttribute(i, "lhs", attr)}
                    style={{
                      padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", border: "1px solid",
                      transition: "all 0.15s",
                      background: fd.lhs.includes(attr) ? "rgba(99, 247, 255, 0.2)" : "transparent",
                      color: fd.lhs.includes(attr) ? "#63f7ff" : "#849495",
                      borderColor: fd.lhs.includes(attr) ? "#63f7ff" : "#3a494a",
                    }}
                  >
                    {attr}
                  </button>
                ))}
              </div>
            </div>

            <ArrowRight size={20} color="#3a494a" />

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: "#849495", marginBottom: "8px", textTransform: "uppercase" }}>Dependent (RHS)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {availableAttributes.map(attr => (
                  <button
                    key={attr}
                    onClick={() => toggleAttribute(i, "rhs", attr)}
                    style={{
                      padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", border: "1px solid",
                      transition: "all 0.15s",
                      background: fd.rhs.includes(attr) ? "rgba(255, 75, 137, 0.2)" : "transparent",
                      color: fd.rhs.includes(attr) ? "#ff4b89" : "#849495",
                      borderColor: fd.rhs.includes(attr) ? "#ff4b89" : "#3a494a",
                    }}
                  >
                    {attr}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => removeFD(i)}
              style={{ background: "transparent", border: "none", color: "#849495", cursor: "pointer", padding: "4px" }}
              onMouseEnter={e => e.currentTarget.style.color = "#ff4b89"}
              onMouseLeave={e => e.currentTarget.style.color = "#849495"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button
          onClick={addFD}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "12px", border: "1px dashed #3a494a", borderRadius: "12px",
            background: "transparent", color: "#849495", cursor: "pointer", transition: "all 0.15s",
            fontSize: "12px", fontFamily: "Space Grotesk", fontWeight: 700
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#63f7ff"; e.currentTarget.style.color = "#63f7ff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#3a494a"; e.currentTarget.style.color = "#849495"; }}
        >
          <Plus size={16} />
          ADD FUNCTIONAL DEPENDENCY
        </button>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            onClick={() => {
              setFds([
                { lhs: ["user_id"], rhs: ["name", "email", "city"] },
                { lhs: ["post_id"], rhs: ["user_id", "content", "likes", "p_created_at"] },
                { lhs: ["comment_id"], rhs: ["post_id", "user_id", "c_text", "c_created_at"] },
                { lhs: ["tag_id"], rhs: ["tag_name"] }
              ]);
            }}
            style={{
              flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #3a494a",
              background: "#131318", color: "#63f7ff", fontSize: "11px", cursor: "pointer",
              fontFamily: "Space Grotesk", fontWeight: 700, textTransform: "uppercase"
            }}
          >
            LOAD DEMO FDs (Flat File)
          </button>
          <button
            onClick={() => setFds([{ lhs: [], rhs: [] }])}
            style={{
              padding: "10px 20px", borderRadius: "8px", border: "1px solid #3a494a",
              background: "transparent", color: "#ff4b89", fontSize: "11px", cursor: "pointer",
              fontFamily: "Space Grotesk", fontWeight: 700, textTransform: "uppercase"
            }}
          >
            CLEAR ALL
          </button>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          style={{
            marginTop: "8px", padding: "14px", borderRadius: "12px", border: "none",
            background: "#63f7ff", color: "#003739", fontWeight: 800, fontSize: "12px",
            cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          {loading ? "ANALYZING SCHEMA..." : (
            <>
              <Play size={16} />
              EXECUTE NORMALIZATION
            </>
          )}
        </button>
      </div>
    </div>
  );
}