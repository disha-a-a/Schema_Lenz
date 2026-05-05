import { useState } from "react";
import { normalize } from "../../api/schemaLenzApi";

export default function FDInputPanel({ onResult }) {
  const [attrs, setAttrs] = useState("");
  const [fds, setFds] = useState([{ lhs: "", rhs: "" }]);
  const [targetNF, setTargetNF] = useState("BCNF");
  const [loading, setLoading] = useState(false);
  const [unsaved, setUnsaved] = useState(true);

  const addFD = () => {
    setFds([...fds, { lhs: "", rhs: "" }]);
    setUnsaved(true);
  };

  const updateFD = (i, side, val) => {
    const updated = [...fds];
    updated[i][side] = val;
    setFds(updated);
    setUnsaved(true);
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
        setUnsaved(false);
    } catch (error) {
        console.error("Normalization failed", error);
        alert("Error normalizing. Check backend or input format.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="editor-cell" style={{display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--font-mono)'}}>
      
      {/* File Tab */}
      <div style={{display: 'flex', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)'}}>
          <div style={{
              background: 'var(--bg-deep)', 
              color: 'var(--text-bright)', 
              padding: '0.4rem 1rem', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              borderTop: '1px solid var(--primary)'
          }}>
              normalization_config.json
              {unsaved && <span style={{display: 'inline-block', width: '8px', height: '8px', background: 'var(--text-main)', borderRadius: '50%'}}></span>}
          </div>
      </div>

      <div style={{padding: '1.5rem', background: 'var(--bg-deep)', flex: 1}}>
          <div style={{color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.8rem'}}>// Define schema attributes</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
              <span style={{color: 'var(--keyword)'}}>const</span> 
              <span style={{color: 'var(--function)'}}>attributes</span> = [
              <input
                  style={{background: 'transparent', border: 'none', borderBottom: '1px solid transparent', color: 'var(--string)', width: '300px', padding: '0.2rem', outline: 'none', borderBottomColor: attrs ? 'transparent' : 'var(--border)'}}
                  placeholder='"A", "B", "C"'
                  value={attrs}
                  onChange={e => { setAttrs(e.target.value); setUnsaved(true); }}
              />
              ];
          </div>

          <div style={{color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.8rem'}}>// Define functional dependencies</div>
          <div style={{color: 'var(--keyword)', marginBottom: '0.5rem'}}>const <span style={{color: 'var(--function)'}}>dependencies</span> = {"{"}</div>
          
          <div style={{paddingLeft: '2rem'}}>
            {fds.map((fd, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                    <span style={{color: 'var(--text-muted)'}}>{i + 1}</span>
                    <input 
                        style={{background: 'transparent', border: 'none', borderBottom: '1px solid transparent', color: 'var(--function)', width: '120px', textAlign: 'right', outline: 'none'}} 
                        placeholder='"A, B"' 
                        value={fd.lhs}
                        onChange={e => updateFD(i, "lhs", e.target.value)} 
                    />
                    <span style={{color: 'var(--text-muted)'}}>:</span>
                    <input 
                        style={{background: 'transparent', border: 'none', borderBottom: '1px solid transparent', color: 'var(--string)', width: '150px', outline: 'none'}} 
                        placeholder='"C"' 
                        value={fd.rhs}
                        onChange={e => updateFD(i, "rhs", e.target.value)} 
                    />
                    <span style={{color: 'var(--text-muted)'}}>,</span>
                    {fds.length > 1 && (
                        <span 
                            onClick={() => {
                                setFds(fds.filter((_, j) => j !== i));
                                setUnsaved(true);
                            }}
                            style={{color: 'var(--danger)', cursor: 'pointer', marginLeft: '0.5rem', opacity: 0.8, fontSize: '0.8rem'}}
                            onMouseEnter={e => e.target.style.opacity = 1}
                            onMouseLeave={e => e.target.style.opacity = 0.8}
                        >
                            ✕
                        </span>
                    )}
                </div>
            ))}
            <div 
                style={{color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-block', marginTop: '0.5rem', opacity: 0.8}}
                onClick={addFD}
                onMouseEnter={e => e.target.style.color = 'var(--text-bright)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >
                + Add Dependency...
            </div>
          </div>
          <div style={{color: 'var(--keyword)', marginTop: '0.5rem'}}>{"}"};</div>

          <div style={{marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <span style={{color: 'var(--keyword)'}}>let</span> <span style={{color: 'var(--function)'}}>targetNF</span> = 
              <select 
                  value={targetNF} 
                  onChange={e => { setTargetNF(e.target.value); setUnsaved(true); }}
                  style={{background: 'var(--bg-input)', color: 'var(--string)', border: '1px solid var(--border)', padding: '0.2rem', borderRadius: '2px', fontFamily: 'var(--font-mono)', outline: 'none'}}
              >
                  <option value="BCNF">"BCNF"</option>
                  <option value="3NF">"3NF"</option>
              </select>;
          </div>

          <div style={{marginTop: '2rem'}}>
              <button 
                  className="primary-btn" 
                  onClick={submit} 
                  disabled={loading}
                  style={{boxShadow: '0 0 10px var(--primary-glow)', width: '200px'}}
              >
                  {loading ? "Analyzing..." : "Execute Normalization"}
              </button>
          </div>
      </div>
    </div>
  );
}