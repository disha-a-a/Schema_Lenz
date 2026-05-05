import { useState } from "react";
import FDInputPanel from "./components/normalization/FDInputPanel";
import DecompositionTree from "./components/normalization/DecompositionTree";
import ClosureVisualizer from "./components/normalization/ClosureVisualizer";
import QueryBuilder from "./components/query/QueryBuilder";
import OptimizationDiff from "./components/query/OptimizationDiff";
import ExecutionHighlighter from "./components/query/ExecutionHighlighter";
import IndexBuilder from "./components/index/IndexBuilder";
import BPlusTreeRenderer from "./components/index/BPlusTreeRenderer";
import WorkspaceDashboard from "./components/workspace/WorkspaceDashboard";

const TABS = [
  { id: "normalize", label: "Explorer" },
  { id: "query",     label: "Refactor" },
  { id: "index",     label: "Verify"   },
  { id: "workspaces",label: "Docs"     },
];

const FILE_TAB = {
  normalize:  { icon: "data_object",  name: "normalization_config.json", tag: "EDITING" },
  query:      { icon: "database",     name: "query_analysis.sql",        tag: "SQL"     },
  index:      { icon: "account_tree", name: "index_builder.config",      tag: "CONFIG"  },
  workspaces: { icon: "folder",       name: "workspaces.json",           tag: "READ"    },
};

export default function App() {
  const [normResult,     setNormResult]     = useState(null);
  const [queryPlan,      setQueryPlan]      = useState(null);
  const [indexTree,      setIndexTree]      = useState(null);
  const [activePlanNode, setActivePlanNode] = useState(null);
  const [tab,            setTab]            = useState("normalize");
  const [workspace,      setWorkspace]      = useState(null);
  const [targetNF,       setTargetNF]       = useState("3NF");
  const [sideItem,       setSideItem]       = useState("Files");

  const ft = FILE_TAB[tab];

  const hasResult = normResult || queryPlan || indexTree;

  // --- health bar values derived from result ---
  const redundancyPct = normResult
    ? normResult.currentNF === "BCNF" ? 5 : normResult.currentNF === "3NF" ? 22 : 42
    : 42;
  const closurePct = 88;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#0D0D12", fontFamily: "Inter, sans-serif", color: "#e4e1e9" }}>

      {/* ── TOP NAV ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: "64px", background: "#131318",
        borderBottom: "1px solid #3a494a", flexShrink: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "22px", fontWeight: 700, color: "#63f7ff", letterSpacing: "-0.02em" }}>
            Schema Lenz
          </span>
          <nav style={{ display: "flex", gap: "24px" }}>
            {TABS.map(t => (
              <a key={t.id} onClick={() => setTab(t.id)} style={{
                fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                color: tab === t.id ? "#63f7ff" : "#b9caca",
                borderBottom: tab === t.id ? "2px solid #63f7ff" : "2px solid transparent",
                paddingBottom: "4px", transition: "all 0.15s",
                textDecoration: "none",
              }}>
                {t.label}
              </a>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ position: "relative" }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "#b9caca" }}>search</span>
            <input placeholder="CMD + K to search..." style={{
              background: "#1f1f25", border: "1px solid #3a494a",
              padding: "6px 12px 6px 32px", fontSize: "13px", color: "#e4e1e9",
              outline: "none", width: "220px", fontFamily: "Fira Code, monospace",
            }} onFocus={e => e.target.style.borderColor = "#63f7ff"}
              onBlur={e => e.target.style.borderColor = "#3a494a"} />
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#b9caca" }}>
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#b9caca" }}>
            <span className="material-symbols-outlined">terminal</span>
          </button>
          <div style={{
            width: "32px", height: "32px", background: "#00f5ff",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#003739", fontWeight: 700, fontSize: "11px",
          }}>SL</div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{
          width: "240px", flexShrink: 0, background: "#1b1b20",
          borderRight: "1px solid #3a494a", display: "flex", flexDirection: "column",
          padding: "12px 0",
        }}>
          <div style={{ padding: "0 16px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#e9feff", textTransform: "uppercase" }}>
                Project_Alpha
              </span>
              <span style={{ fontSize: "10px", color: "#849495", opacity: 0.7 }}>v1.0-stable</span>
            </div>
            <button style={{
              width: "100%", background: "#ff4b89", color: "#590026",
              border: "none", padding: "8px", cursor: "pointer",
              fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", transition: "filter 0.15s",
            }} onMouseEnter={e => e.target.style.filter = "brightness(1.15)"}
              onMouseLeave={e => e.target.style.filter = "brightness(1)"}>
              NEW_SCHEMA
            </button>
          </div>

          <nav style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
            {[
              { id: "Files",     icon: "folder",       children: [
                  { icon: "description",  name: "schema_v1.sql",               active: false },
                  { icon: "data_object",  name: "normalization_config.json",   active: tab === "normalize" },
                ]},
              { id: "Relations", icon: "account_tree" },
              { id: "SQL",       icon: "database"     },
              { id: "History",   icon: "history"      },
              { id: "Logs",      icon: "terminal"     },
            ].map(item => (
              <div key={item.id} style={{ padding: "0 8px" }}>
                <div onClick={() => { setSideItem(item.id); if (item.id === "Files") setTab("normalize"); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px",
                    cursor: "pointer", transition: "all 0.15s",
                    color: sideItem === item.id ? "#ff4b89" : "#b9caca",
                    borderLeft: sideItem === item.id ? "2px solid #ff4b89" : "2px solid transparent",
                    background: sideItem === item.id ? "#2a292f" : "transparent",
                    opacity: sideItem === item.id ? 1 : 0.7,
                    fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{item.icon}</span>
                  {item.id}
                </div>
                {item.children && sideItem === "Files" && (
                  <div style={{ paddingLeft: "28px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                    {item.children.map(f => (
                      <div key={f.name} style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px",
                        cursor: "pointer", fontSize: "12px",
                        color: f.active ? "#63f7ff" : "#b9caca",
                        background: f.active ? "#35343a" : "transparent",
                        opacity: f.active ? 1 : 0.7,
                        transition: "all 0.15s",
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{f.icon}</span>
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div style={{ borderTop: "1px solid #3a494a", paddingTop: "12px" }}>
            {[{ icon: "settings", label: "Settings" }, { icon: "help", label: "Support" }].map(item => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "8px 20px",
                cursor: "pointer", color: "#849495", opacity: 0.7, fontSize: "11px",
                fontFamily: "Space Grotesk", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                transition: "all 0.15s",
              }} onMouseEnter={e => { e.currentTarget.style.background = "#35343a"; e.currentTarget.style.opacity = 1; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.opacity = 0.7; }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTER EDITOR ── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#131318", borderRight: "1px solid #3a494a", overflow: "hidden" }}>

          {/* file tab bar */}
          <div style={{
            height: "40px", background: "#0e0e13", borderBottom: "1px solid #3a494a",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 16px", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#63f7ff" }}>{ft.icon}</span>
              <span style={{ fontSize: "12px", fontFamily: "Fira Code, monospace", color: "#b9caca" }}>{ft.name}</span>
              <span style={{
                fontSize: "10px", background: "#2a292f", padding: "1px 6px",
                color: "#849495", fontFamily: "Space Grotesk", letterSpacing: "0.08em",
              }}>{ft.tag}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {tab === "normalize" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "10px", color: "#849495", fontFamily: "Space Grotesk", letterSpacing: "0.08em", textTransform: "uppercase" }}>targetNF:</span>
                  <select value={targetNF} onChange={e => setTargetNF(e.target.value)} style={{
                    background: "#2a292f", border: "1px solid #3a494a", color: "#63f7ff",
                    fontSize: "11px", fontFamily: "Fira Code, monospace", padding: "2px 8px",
                    outline: "none", cursor: "pointer",
                  }}>
                    <option>1NF</option>
                    <option>2NF</option>
                    <option>3NF</option>
                    <option>BCNF</option>
                  </select>
                </div>
              )}
              <button
                onClick={() => document.dispatchEvent(new CustomEvent("sl-execute"))}
                style={{
                  background: "#3f0019", color: "#ffb1c3", border: "1px solid #ff4b89",
                  padding: "4px 16px", cursor: "pointer",
                  fontFamily: "Space Grotesk", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#ff4b89"; e.currentTarget.style.color = "#3f0019"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#3f0019"; e.currentTarget.style.color = "#ffb1c3"; }}>
                EXECUTE NORMALIZATION
              </button>
            </div>
          </div>

          {/* main editor content */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {tab === "normalize" && <FDInputPanel onResult={setNormResult} externalTargetNF={targetNF} />}
            {tab === "query" && (
              <div style={{ padding: "24px", height: "100%", overflowY: "auto" }}>
                <QueryBuilder onPlan={setQueryPlan} />
                {queryPlan && <div style={{ marginTop: "24px" }}><ExecutionHighlighter activeNode={activePlanNode} planData={queryPlan} /></div>}
              </div>
            )}
            {tab === "index" && (
              <div style={{ padding: "24px", height: "100%", overflowY: "auto" }}>
                <IndexBuilder onTreeGenerated={setIndexTree} />
                {indexTree && (
                  <div style={{ marginTop: "24px", padding: "16px", background: "#0e0e13", border: "1px solid #3a494a" }}>
                    <h5 style={{ color: "#63f7ff", fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Tree Statistics</h5>
                    <div style={{ display: "flex", gap: "32px", fontFamily: "Fira Code, monospace", fontSize: "13px", color: "#e4e1e9" }}>
                      <span>Height: {indexTree.height}</span>
                      <span>Total Nodes: {indexTree.totalNodes}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {tab === "workspaces" && (
              <div style={{ padding: "24px", height: "100%", overflowY: "auto" }}>
                <WorkspaceDashboard onSelectWorkspace={setWorkspace} />
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside style={{ width: "320px", flexShrink: 0, background: "#0e0e13", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* panel header */}
          <div style={{ height: "40px", background: "#1f1f25", borderBottom: "1px solid #3a494a", display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0 }}>
            <span style={{ fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e4e1e9" }}>
              Output / Visualizer
            </span>
          </div>

          {/* terminal / results */}
          <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
            <div style={{
              background: "#000", border: "1px solid #3a494a", padding: "16px",
              minHeight: "200px", fontFamily: "Fira Code, monospace", fontSize: "12px",
              lineHeight: 1.7, position: "relative",
            }}>
              {/* traffic light dots */}
              <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "4px" }}>
                {["#ffb4ab", "#8fdb00", "#63f7ff"].map((c, i) => (
                  <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
                ))}
              </div>

              <p style={{ color: "#849495", marginBottom: "8px" }}>[$] sl-engine --version</p>
              <p style={{ color: "#8fdb00", marginBottom: "16px" }}>Schema Lenz v1.0-stable [64-bit]</p>
              <p style={{ color: "#00dce5", marginBottom: "8px" }}>&gt; Initializing relational analyzer...</p>

              {!hasResult && (
                <>
                  <p style={{ color: "#b9caca", opacity: 0.8 }}>&gt; Ready to analyze. Run an operation in the editor to see results here.</p>
                  <p style={{ color: "#849495", opacity: 0.5, marginTop: "32px", fontStyle: "italic" }}>// Normalization tree visualization will appear here upon execution.</p>
                </>
              )}

              {tab === "normalize" && normResult && (
                <div style={{ marginTop: "8px" }}>
                  <p style={{ color: "#8fdb00" }}>&gt; Analysis complete.</p>
                  <p style={{ color: "#63f7ff", marginTop: "4px" }}>Detected: <strong>{normResult.currentNF}</strong></p>
                  <DecompositionTree result={normResult} />
                  <div style={{ marginTop: "16px", borderTop: "1px solid #3a494a", paddingTop: "16px" }}>
                    <p style={{ color: "#00dce5", fontFamily: "Space Grotesk", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Closure Analysis</p>
                    <ClosureVisualizer attributes={normResult.attributes || []} fds={normResult.fds || []} />
                  </div>
                </div>
              )}
              {tab === "query"  && <OptimizationDiff planData={queryPlan} onNodeHover={setActivePlanNode} />}
              {tab === "index"  && <BPlusTreeRenderer treeData={indexTree} />}
            </div>
          </div>

          {/* dependency health inspector */}
          <div style={{ height: "192px", borderTop: "1px solid #3a494a", background: "#1b1b20", padding: "16px", flexShrink: 0 }}>
            <h4 style={{ fontFamily: "Space Grotesk", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b9caca", marginBottom: "12px" }}>
              Dependency Health
            </h4>

            <HealthBar label="Redundancy" pct={redundancyPct} color="#ffb4ab" valueLabel={`${redundancyPct === 42 ? "High" : redundancyPct === 22 ? "Medium" : "Low"} (${redundancyPct}%)`} />
            <HealthBar label="Transitive Closure" pct={closurePct} color="#63f7ff" valueLabel="Stable" />

            <div style={{ marginTop: "12px" }}>
              <button style={{
                width: "100%", border: "1px solid #849495", background: "transparent",
                padding: "6px", cursor: "pointer",
                fontFamily: "Space Grotesk", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#b9caca", transition: "all 0.15s",
              }} onMouseEnter={e => e.currentTarget.style.background = "#35343a"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                GENERATE REPORT
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── STATUS BAR ── */}
      <footer style={{
        height: "24px", background: "#63f7ff", color: "#003739",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", fontSize: "10px", fontWeight: 600, flexShrink: 0,
        fontFamily: "Space Grotesk", letterSpacing: "0.05em",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>cloud_done</span>
            <span>CONNECTED: localhost:8080</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>code</span>
            <span>JSON ({targetNF})</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>UTF-8</span>
          {normResult && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>warning</span>
              <span>{normResult.decomposedRelations?.length} RELATIONS</span>
            </div>
          )}
          <span style={{ fontWeight: 700 }}>SchemaLenz Core v1.0</span>
        </div>
      </footer>
    </div>
  );
}

function HealthBar({ label, pct, color, valueLabel }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "4px" }}>
        <span style={{ color: "#b9caca" }}>{label}</span>
        <span style={{ color }}>{valueLabel}</span>
      </div>
      <div style={{ width: "100%", height: "4px", background: "#35343a" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}