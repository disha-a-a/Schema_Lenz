import { useState } from "react";
import { normalize } from "../../api/schemaLenzApi";

export default function FDInputPanel({ onResult }) {
  const [attrs, setAttrs] = useState("");        // "A,B,C,D"
  const [fds, setFds] = useState([{ lhs: "", rhs: "" }]);
  const [targetNF, setTargetNF] = useState("BCNF");
  const [loading, setLoading] = useState(false);

  const addFD = () => setFds([...fds, { lhs: "", rhs: "" }]);

  const updateFD = (i, side, val) => {
    const updated = [...fds];
    updated[i][side] = val;
    setFds(updated);
  };

  const submit = async () => {
    setLoading(true);
    try {
        const attrList = attrs.split(",").map(a => a.trim()).filter(a => a);
        const fdList = fds.map(fd => ({
            lhs: fd.lhs.split(",").map(a => a.trim()).filter(a => a),
            rhs: fd.rhs.split(",").map(a => a.trim()).filter(a => a)
        })).filter(fd => fd.lhs.length > 0 && fd.rhs.length > 0);
        
        const { data } = await normalize(attrList, fdList, targetNF);
        onResult(data);
    } catch (error) {
        console.error("Normalization failed", error);
        alert("Error normalizing. Check backend or input format.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fd-panel">
      <div className="input-group">
        <label>Attributes</label>
        <input
            placeholder="e.g. A,B,C,D"
            value={attrs}
            onChange={e => setAttrs(e.target.value)}
        />
      </div>
      
      <div className="fds-list">
        <label>Functional Dependencies</label>
        {fds.map((fd, i) => (
            <div key={i} className="fd-row">
            <input placeholder="LHS: A,B" value={fd.lhs}
                onChange={e => updateFD(i, "lhs", e.target.value)} />
            <span>→</span>
            <input placeholder="RHS: C,D" value={fd.rhs}
                onChange={e => updateFD(i, "rhs", e.target.value)} />
            </div>
        ))}
      </div>
      
      <div className="actions">
        <button className="secondary" onClick={addFD}>+ Add FD</button>
        <select value={targetNF} onChange={e => setTargetNF(e.target.value)}>
            <option value="BCNF">BCNF</option>
            <option value="3NF">3NF</option>
        </select>
        <button className="primary" onClick={submit} disabled={loading}>
            {loading ? "Analyzing..." : "Normalize"}
        </button>
      </div>
    </div>
  );
}