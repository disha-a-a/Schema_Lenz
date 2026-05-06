import { useState, useEffect } from "react";
import FDInputPanel from "./components/normalization/FDInputPanel";
import DBBrowser from "./components/normalization/DBBrowser";
import AttributeGrid from "./components/normalization/AttributeGrid";
import QueryBuilder from "./components/query/QueryBuilder";
import OptimizationDiff from "./components/query/OptimizationDiff";
import FDArrowOverlay from "./components/normalization/FDArrowOverlay";
import DemoControls from "./components/normalization/DemoControls.jsx";
import ExecutionHighlighter from "./components/query/ExecutionHighlighter";
import IndexBuilder from "./components/index/IndexBuilder";
import BPlusTreeRenderer from "./components/index/BPlusTreeRenderer";
import WorkspaceDashboard from "./components/workspace/WorkspaceDashboard";
import DecompositionTree from "./components/normalization/DecompositionTree";
import FlatFileViewer from "./components/normalization/FlatFileViewer";
import DecomposedSchemaPage from "./components/normalization/DecomposedSchemaPage";
import * as SocialDB from "./data/socialDB";
import * as UniversityDB from "./data/universityDB";
import * as EmployeeDB from "./data/employeeDB";
import { Database, Table as TableIcon, Layers, Zap, FileText, CheckCircle } from "lucide-react";

const DATABASES = {
  "Social Media": [
    { name: "User", data: SocialDB.Users },
    { name: "Post", data: SocialDB.Posts },
    { name: "Comment", data: SocialDB.Comments },
    { name: "Follow", data: SocialDB.Follows },
    { name: "Hashtag", data: SocialDB.Hashtags },
    { name: "PostTag", data: SocialDB.PostTags },
    { name: "Social_Universal_Flat_File", data: SocialDB.Social_Universal_Flat_File },
  ],
  "University": [
    { name: "Students", data: UniversityDB.Students },
    { name: "Courses", data: UniversityDB.Courses },
    { name: "Enrollments", data: UniversityDB.Enrollments },
    { name: "University_Universal_Flat_File", data: UniversityDB.University_Universal_Flat_File },
  ],
  "Employee": [
    { name: "Employee_Universal_Flat_File", data: EmployeeDB.Employee_Universal_Flat_File },
  ]
};

const TABS = [
  { id: "flat_file", label: "Flat File" },
  { id: "normalize", label: "Normalization" },
  { id: "final_schema", label: "Relations" },
  { id: "query",     label: "Refactor" },
  { id: "index",     label: "Verify"   },
  { id: "workspaces",label: "Docs"     },
];

const FILE_TAB = {
  relations:    { icon: "account_tree", name: "social_network.db",          tag: "SCHEMA"  },
  flat_file:    { icon: "table_chart",  name: "social_flat_file.csv",      tag: "RAW"     },
  normalize:    { icon: "data_object",  name: "normalization_config.json", tag: "EDITING" },
  final_schema: { icon: "inventory",    name: "normalized_schema.json",    tag: "OUTPUT"  },
  query:        { icon: "database",     name: "query_analysis.sql",        tag: "SQL"     },
  index:        { icon: "account_tree", name: "index_builder.config",      tag: "CONFIG"  },
  workspaces:   { icon: "folder",       name: "workspaces.json",           tag: "READ"    },
};

export default function App() {
  const [normResult,     setNormResult]     = useState(null);
  const [queryPlan,      setQueryPlan]      = useState(null);
  const [indexTree,      setIndexTree]      = useState(null);
  const [activePlanNode, setActivePlanNode] = useState(null);
  const [tab,            setTab]            = useState("flat_file");
  const [workspace,      setWorkspace]      = useState(null);
  const [currentDB,      setCurrentDB]      = useState("Social Media");
  const [demoPhase,      setDemoPhase]      = useState("browse"); 
  const [targetNF,       setTargetNF]       = useState("BCNF");
  const [activeTable,    setActiveTable]    = useState(null); 
  // Utility for button actions
  // Playback control state
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };
  const handleReplay = () => {
    setStepIndex(0);
    setIsPlaying(false);
  };
  const handleNextStep = () => {
    setStepIndex(prev => prev + 1);
  };
  const handlePrevStep = () => {
    setStepIndex(prev => (prev > 0 ? prev - 1 : 0));
  };
  const handleButtonClick = (label) => {
    console.log(`Button clicked: ${label}`);
    if (label === 'NEW_SCHEMA') {
      setDemoPhase("browse");
      setNormResult(null);
      setStepIndex(0);
      setIsPlaying(false);
    } else {
      alert(`Feature coming soon: ${label}`);
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setStepIndex(prev => prev + 1);
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const [sideItem,       setSideItem]       = useState("Files");
  const [panelHeight,    setPanelHeight]    = useState(300);
  const [isResizing,     setIsResizing]     = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);

  useEffect(() => {
    const handleExecute = () => {
      setShowVisualizer(true);
    };
    document.addEventListener("sl-execute", handleExecute);
    return () => document.removeEventListener("sl-execute", handleExecute);
  }, []);

  const startResizing = () => setIsResizing(true);
  const stopResizing  = () => setIsResizing(false);
  const resize        = (e) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY - 24; // 24 is status bar height
      if (newHeight > 100 && newHeight < 600) setPanelHeight(newHeight);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

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
          <button 
            onClick={() => handleButtonClick('Settings')}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#b9caca" }}>
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button 
            onClick={() => handleButtonClick('Terminal')}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#b9caca" }}>
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
            <button
              onClick={() => handleButtonClick('NEW_SCHEMA')}
              style={{
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
                <div onClick={() => { 
                  setSideItem(item.id); 
                  if (item.id === "Files") setTab("normalize"); 
                  if (item.id === "Relations") setTab("relations");
                  handleButtonClick(item.id);
                }}
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
              {/* Top right area can be used for other actions later */}
            </div>
          </div>

          {/* main editor content */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {tab === "relations" && (
              <DBBrowser
                onSelectTable={setActiveTable}
                onNormalize={() => {
                  setTab("normalize");
                  setDemoPhase("fd-input");
                }}
              />
            )}
            {tab === "normalize" && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "24px", overflowY: "auto" }}>
                {/* ── STEP 1: DB SELECTION ── */}
                <div style={{ marginBottom: "32px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#849495", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                    <Database size={14} />
                    Step 1: Select Database
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {Object.keys(DATABASES).map(dbName => (
                      <button 
                        key={dbName}
                        onClick={() => {
                          setCurrentDB(dbName);
                          setActiveTable(DATABASES[dbName][0]);
                          setDemoPhase("fd-input");
                        }}
                        style={{
                          padding: "10px 20px", borderRadius: "12px", border: "1px solid",
                          fontFamily: "Space Grotesk", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                          transition: "all 0.2s",
                          background: currentDB === dbName ? "rgba(99, 247, 255, 0.1)" : "#1b1b20",
                          color: currentDB === dbName ? "#63f7ff" : "#849495",
                          borderColor: currentDB === dbName ? "#63f7ff" : "#3a494a",
                          boxShadow: currentDB === dbName ? "0 4px 12px rgba(99, 247, 255, 0.15)" : "none"
                        }}
                      >
                        {dbName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── STEP 2: FD CONFIGURATION ── */}
                <div style={{ marginBottom: "32px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#849495", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                    <Zap size={14} />
                    Step 2: Define Dependencies
                  </div>
                  <FDInputPanel 
                    onResult={setNormResult} 
                    availableAttributes={(() => {
                      const db = DATABASES[currentDB];
                      const flatFile = db.find(t => t.name.includes("Universal"));
                      return flatFile ? Object.keys(flatFile.data[0] || {}) : [];
                    })()}
                    currentSchemaName={(() => {
                      const db = DATABASES[currentDB];
                      const flatFile = db.find(t => t.name.includes("Universal"));
                      return flatFile?.name;
                    })()}
                  />
                </div>
              </div>
            )}

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
            {tab === "flat_file" && (
              <FlatFileViewer />
            )}
            {tab === "final_schema" && (
              <DecomposedSchemaPage 
                result={normResult} 
                flatFileData={(() => {
                  const db = DATABASES[currentDB];
                  const flatFile = db.find(t => t.name.includes("Universal"));
                  return flatFile ? flatFile.data : [];
                })()}
              />
            )}
            {tab === "workspaces" && (
              <div style={{ padding: "24px", height: "100%", overflowY: "auto" }}>
                <WorkspaceDashboard onSelectWorkspace={setWorkspace} />
              </div>
            )}
          </div>


        </main>


      </div>

      {/* ── VISUALIZATION MODAL ── */}
      {showVisualizer && normResult && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          zIndex: 9999, background: "rgba(13, 13, 18, 0.95)", backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column", padding: "40px", animation: "fadeIn 0.3s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <div>
              <h2 style={{ fontFamily: "Space Grotesk", fontSize: "28px", fontWeight: 700, color: "#63f7ff", margin: 0 }}>
                Normalization Decomposition Flow
              </h2>
              <p style={{ color: "#849495", fontSize: "14px", marginTop: "4px" }}>
                Recursive tree view of relation decomposition from 1NF to {targetNF}
              </p>
            </div>
            <button 
              onClick={() => setShowVisualizer(false)}
              style={{
                background: "rgba(255, 75, 137, 0.1)", color: "#ff4b89", border: "1px solid #ff4b89",
                padding: "10px 24px", borderRadius: "12px", cursor: "pointer",
                fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "14px", transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ff4b89"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 75, 137, 0.1)"; e.currentTarget.style.color = "#ff4b89"; }}
            >
              CLOSE VISUALIZER
            </button>
          </div>
          
          <div style={{ flex: 1, position: "relative", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(99, 247, 255, 0.2)" }}>
            <DecompositionTree result={normResult} fullScreen={true} />
          </div>
        </div>
      )}

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