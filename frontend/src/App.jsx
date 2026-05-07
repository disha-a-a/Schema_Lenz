import { useState, useEffect } from "react";
import FDInputPanel from "./components/normalization/FDInputPanel";
import DBBrowser from "./components/normalization/DBBrowser";
import AttributeGrid from "./components/normalization/AttributeGrid";
import QueryBuilder from "./components/query/QueryBuilder";
import OptimizationDiff from "./components/query/OptimizationDiff";
import FDArrowOverlay from "./components/normalization/FDArrowOverlay";
import DemoControls from "./components/normalization/DemoControls.jsx";
import ExecutionHighlighter from "./components/query/ExecutionHighlighter";
import QueryPlanTree from "./components/query/QueryPlanTree";
import ScanStrategySimulator from "./components/query/ScanStrategySimulator";
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
  { id: "flat_file",     label: "Raw Input" },
  { id: "normalize",     label: "Decompose" },
  { id: "final_schema",  label: "Architecture" },
  { id: "query",         label: "Query Engine" },
  { id: "index",         label: "B+ Tree" },
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

  useEffect(() => {
    setQueryPlan(null);
  }, [currentDB]);

  const [sidebarOpen,    setSidebarOpen]    = useState(true);
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

        {/* ── LEFT SIDEBAR — context-aware, collapsible ── */}
        <aside style={{
          width: sidebarOpen ? "240px" : "46px", flexShrink: 0, background: "#1b1b20",
          borderRight: "1px solid #3a494a", display: "flex", flexDirection: "column",
          transition: "width 0.2s ease", overflow: "hidden",
        }}>
          {/* Toggle button */}
          <div style={{ padding: sidebarOpen ? "12px 16px" : "12px 8px", borderBottom: "1px solid #3a494a", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center" }}>
            {sidebarOpen && (
              <span style={{ fontFamily: "Space Grotesk", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#63f7ff", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {tab === "flat_file" ? "Tables" : tab === "normalize" ? "Analysis" : tab === "final_schema" ? "Schema" : tab === "query" ? "Tables" : tab === "index" ? "Index Info" : "Context"}
              </span>
            )}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#849495", padding: "2px", display: "flex", alignItems: "center" }}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{sidebarOpen ? "chevron_left" : "chevron_right"}</span>
            </button>
          </div>

          {/* Context content — only rendered when expanded */}
          {sidebarOpen && (
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>

              {/* ── RAW INPUT tab: list tables in current DB ── */}
              {tab === "flat_file" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {Object.entries(DATABASES).map(([dbName, tables]) => (
                    <div key={dbName}>
                      <div style={{ padding: "6px 16px", fontSize: "10px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Space Grotesk" }}>{dbName}</div>
                      {tables.map(t => (
                        <div
                          key={t.name}
                          onClick={() => { setCurrentDB(dbName); setActiveTable(t); }}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px",
                            cursor: "pointer", transition: "all 0.15s",
                            color: activeTable?.name === t.name && currentDB === dbName ? "#63f7ff" : "#b9caca",
                            background: activeTable?.name === t.name && currentDB === dbName ? "rgba(99,247,255,0.08)" : "transparent",
                            borderLeft: activeTable?.name === t.name && currentDB === dbName ? "2px solid #63f7ff" : "2px solid transparent",
                            fontSize: "12px", fontFamily: "Fira Code, monospace",
                          }}
                          onMouseEnter={e => { if (!(activeTable?.name === t.name && currentDB === dbName)) e.currentTarget.style.background = "#2a292f"; }}
                          onMouseLeave={e => { if (!(activeTable?.name === t.name && currentDB === dbName)) e.currentTarget.style.background = "transparent"; }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>table_chart</span>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* ── DECOMPOSE tab: NF detection + candidate keys ── */}
              {tab === "normalize" && (
                <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {normResult ? (
                    <>
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "Space Grotesk" }}>Detected Normal Form</div>
                        <div style={{ padding: "10px 14px", background: "#131318", border: "1px solid #3a494a", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "20px", fontWeight: 900, fontFamily: "Fira Code, monospace", color: normResult.currentNF === "BCNF" ? "#8fdb00" : normResult.currentNF === "3NF" ? "#63f7ff" : "#ffb4ab" }}>{normResult.currentNF || "—"}</span>
                          <span style={{ fontSize: "10px", color: "#849495" }}>current</span>
                        </div>
                      </div>
                      {normResult.candidateKeys && normResult.candidateKeys.length > 0 && (
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "Space Grotesk" }}>Candidate Keys</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {normResult.candidateKeys.map((ck, i) => (
                              <div key={i} style={{ padding: "6px 10px", background: "#131318", border: "1px solid #3a494a", borderRadius: "6px", fontSize: "11px", fontFamily: "Fira Code, monospace", color: "#c792ea" }}>
                                {Array.isArray(ck) ? `{${ck.join(", ")}}` : `{${ck}}`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {normResult.decomposedRelations && (
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "Space Grotesk" }}>Decomposed</div>
                          <div style={{ fontSize: "22px", fontWeight: 900, fontFamily: "Fira Code, monospace", color: "#8fdb00" }}>{normResult.decomposedRelations.length} <span style={{ fontSize: "11px", color: "#849495", fontWeight: 600 }}>relations</span></div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: "#849495", fontSize: "12px", fontFamily: "Space Grotesk", opacity: 0.6, padding: "8px 0" }}>Run normalization to see analysis results here.</div>
                  )}
                </div>
              )}

              {/* ── ARCHITECTURE tab: decomposed relations list ── */}
              {tab === "final_schema" && (
                <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {normResult?.decomposedRelations ? (
                    normResult.decomposedRelations.map((rel, i) => (
                      <div key={i} style={{ padding: "8px 12px", background: "#131318", border: "1px solid #3a494a", borderRadius: "8px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#63f7ff", fontFamily: "Space Grotesk", marginBottom: "4px" }}>R{i + 1}</div>
                        <div style={{ fontSize: "11px", fontFamily: "Fira Code, monospace", color: "#b9caca", wordBreak: "break-all" }}>
                          {Array.isArray(rel.attributes) ? rel.attributes.join(", ") : (rel.attributes ? Object.keys(rel.attributes).join(", ") : "—")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "#849495", fontSize: "12px", fontFamily: "Space Grotesk", opacity: 0.6, padding: "8px 0" }}>Decompose a schema first to see relations here.</div>
                  )}
                </div>
              )}

              {/* ── QUERY ENGINE tab: available tables for joins ── */}
              {tab === "query" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ padding: "6px 16px", fontSize: "10px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Space Grotesk" }}>{currentDB} Tables</div>
                  {DATABASES[currentDB]?.map(t => (
                    <div
                      key={t.name}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px",
                        cursor: "pointer", transition: "all 0.15s",
                        color: "#b9caca", fontSize: "12px", fontFamily: "Fira Code, monospace",
                        borderLeft: "2px solid transparent",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#2a292f"; e.currentTarget.style.color = "#63f7ff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#b9caca"; }}
                      title={`Click to copy: ${t.name}`}
                      onClick={() => navigator.clipboard.writeText(t.name)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>table_chart</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                      <span style={{ marginLeft: "auto", fontSize: "10px", opacity: 0.5 }}>{t.data?.length || 0}r</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── B+ TREE tab: index statistics ── */}
              {tab === "index" && (
                <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {indexTree ? (
                    <>
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "Space Grotesk" }}>Tree Height</div>
                        <div style={{ fontSize: "28px", fontWeight: 900, fontFamily: "Fira Code, monospace", color: "#63f7ff" }}>{indexTree.height}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "Space Grotesk" }}>Total Nodes</div>
                        <div style={{ fontSize: "28px", fontWeight: 900, fontFamily: "Fira Code, monospace", color: "#c792ea" }}>{indexTree.totalNodes}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "Space Grotesk" }}>Status</div>
                        <div style={{ padding: "6px 10px", background: "rgba(143,219,0,0.08)", border: "1px solid rgba(143,219,0,0.3)", borderRadius: "6px", fontSize: "11px", color: "#8fdb00", fontWeight: 700, fontFamily: "Space Grotesk", display: "inline-block" }}>INSERT-BASED</div>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "#849495", fontSize: "12px", fontFamily: "Space Grotesk", opacity: 0.6, padding: "8px 0" }}>Build a B+ tree to see index stats here.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Collapsed icon strip */}
          {!sidebarOpen && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", paddingTop: "8px" }}>
              {TABS.map(t => (
                <div
                  key={t.id}
                  onClick={() => { setTab(t.id); setSidebarOpen(true); }}
                  title={t.label}
                  style={{
                    width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", borderRadius: "6px", transition: "all 0.15s",
                    color: tab === t.id ? "#63f7ff" : "#849495",
                    background: tab === t.id ? "rgba(99,247,255,0.08)" : "transparent",
                  }}
                  onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = "#2a292f"; }}
                  onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = tab === t.id ? "rgba(99,247,255,0.08)" : "transparent"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    {t.id === "flat_file" ? "table_chart" : t.id === "normalize" ? "data_object" : t.id === "final_schema" ? "inventory" : t.id === "query" ? "database" : "account_tree"}
                  </span>
                </div>
              ))}
            </div>
          )}
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
                <QueryBuilder 
                  onPlan={setQueryPlan} 
                  currentDB={currentDB}
                  databases={DATABASES}
                  baseRowCount={(() => {
                    const db = DATABASES[currentDB];
                    const flatFile = db.find(t => t.name.includes("Universal"));
                    return flatFile && flatFile.data ? flatFile.data.length : 10;
                  })()}
                />
                {queryPlan && (
                  <div style={{ marginTop: "32px" }}>
                    <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                      {[
                        { symbol: "σ", label: "Select",  color: "#ffb4ab" },
                        { symbol: "π", label: "Project", color: "#63f7ff" },
                        { symbol: "⋈", label: "Join",    color: "#c792ea" },
                        { symbol: "⊛", label: "Table",   color: "#8fdb00" },
                        { symbol: "τ", label: "Sort",    color: "#ffcb6b" },
                        { symbol: "γ", label: "Group",   color: "#ffcb6b" },
                      ].map(l => (
                        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "16px", color: l.color, fontWeight: 900 }}>{l.symbol}</span>
                          <span style={{ fontSize: "11px", color: "#849495", fontFamily: "Space Grotesk", fontWeight: 700 }}>{l.label}</span>
                        </div>
                      ))}
                      <span style={{ marginLeft: "auto", fontSize: "11px", color: "#849495", fontStyle: "italic", fontFamily: "Space Grotesk" }}>Click any node for details →</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#849495", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "Space Grotesk" }}>Original Plan (Unoptimized)</div>
                        <QueryPlanTree planData={queryPlan.original} label="Original AST" />
                      </div>
                      <div style={{ position: "relative" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#8fdb00", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "Space Grotesk", display: "flex", alignItems: "center", gap: "8px" }}>
                          Optimized Plan <span style={{ background: "#8fdb00", color: "#003739", padding: "2px 8px", borderRadius: "4px", fontSize: "9px" }}>HEURISTIC APPLIED</span>
                        </div>
                        <QueryPlanTree planData={queryPlan.optimized} label="Optimized Plan" />
                      </div>
                    </div>
                    {queryPlan.cost && (
                      <div style={{ marginTop: "20px", padding: "16px 24px", background: "#1b1b20", border: "1px solid #3a494a", borderRadius: "12px", display: "flex", gap: "40px", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "#849495", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px", fontFamily: "Space Grotesk" }}>Nested Loop Cost</div>
                          <div style={{ fontSize: "20px", fontFamily: "Fira Code, monospace", color: "#ffb4ab", fontWeight: 700 }}>{queryPlan.cost.nestedLoopCost?.toLocaleString()} ops</div>
                        </div>
                        <div style={{ fontSize: "24px", color: "#3a494a" }}>→</div>
                        <div>
                          <div style={{ fontSize: "10px", color: "#849495", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px", fontFamily: "Space Grotesk" }}>Hash Join Cost</div>
                          <div style={{ fontSize: "20px", fontFamily: "Fira Code, monospace", color: "#8fdb00", fontWeight: 700 }}>{queryPlan.cost.hashJoinCost?.toLocaleString()} ops</div>
                        </div>
                        <div style={{ marginLeft: "auto", padding: "8px 20px", background: "rgba(143,219,0,0.1)", border: "1px solid #8fdb00", borderRadius: "8px" }}>
                          <div style={{ fontSize: "10px", color: "#849495", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px", fontFamily: "Space Grotesk" }}>Recommendation</div>
                          <div style={{ fontSize: "13px", color: "#8fdb00", fontWeight: 700, fontFamily: "Space Grotesk" }}>{queryPlan.cost.recommendation}</div>
                        </div>
                      </div>
                    )}
                    {/* Scan Strategy Simulator */}
                    <ScanStrategySimulator currentDB={currentDB} />
                  </div>
                )}
              </div>
            )}
            {tab === "index" && (
              <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
                {/* ── LEFT: Controls Sidebar ── */}
                <div style={{ 
                  width: "320px", flexShrink: 0, overflowY: "auto", 
                  borderRight: "1px solid #3a494a", padding: "20px",
                  display: "flex", flexDirection: "column", gap: "20px"
                }}>
                  <IndexBuilder onTreeGenerated={setIndexTree} />
                  
                  {indexTree && (
                    <div style={{ padding: "16px", background: "#1b1b20", border: "1px solid #3a494a", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#63f7ff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", fontFamily: "Space Grotesk" }}>Index Statistics</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "Space Grotesk" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: "10px", color: "#849495", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Tree Height</div>
                            <div style={{ fontSize: "24px", fontFamily: "Fira Code, monospace", color: "#e4e1e9", fontWeight: 700 }}>{indexTree.height}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "10px", color: "#849495", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Total Nodes</div>
                            <div style={{ fontSize: "24px", fontFamily: "Fira Code, monospace", color: "#e4e1e9", fontWeight: 700 }}>{indexTree.totalNodes}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "11px", color: "#849495", background: "#131318", padding: "6px 12px", borderRadius: "6px", border: "1px solid #3a494a", fontWeight: 600 }}>
                            Mode: <span style={{ color: "#63f7ff" }}>SIMULATED</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── RIGHT: Tree Visualization ── */}
                <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
                  {indexTree ? (
                    <BPlusTreeRenderer treeData={indexTree} />
                  ) : (
                    <div style={{ 
                      height: "100%", display: "flex", alignItems: "center", justifyContent: "center", 
                      flexDirection: "column", gap: "16px", color: "#849495" 
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "48px", opacity: 0.3 }}>account_tree</span>
                      <div style={{ fontFamily: "Space Grotesk", fontSize: "14px", fontWeight: 600 }}>No tree generated yet</div>
                      <div style={{ fontFamily: "Space Grotesk", fontSize: "12px", opacity: 0.6 }}>Enter values and click BUILD ALL or STEP INSERT</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {tab === "flat_file" && (
              <FlatFileViewer />
            )}
            {tab === "final_schema" && (
              <DecomposedSchemaPage 
                result={normResult} 
                onViewTree={() => setShowVisualizer(true)}
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