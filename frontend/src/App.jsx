import { useState } from "react";
import FDInputPanel from "./components/normalization/FDInputPanel";
import DecompositionTree from "./components/normalization/DecompositionTree";
import ClosureVisualizer from "./components/normalization/ClosureVisualizer";
import QueryBuilder from "./components/query/QueryBuilder";
import PlanTree from "./components/query/PlanTree";
import OptimizationDiff from "./components/query/OptimizationDiff";
import ExecutionHighlighter from "./components/query/ExecutionHighlighter";
import WorkspaceDashboard from "./components/workspace/WorkspaceDashboard";
import IndexBuilder from "./components/index/IndexBuilder";
import BPlusTreeRenderer from "./components/index/BPlusTreeRenderer";

export default function App() {
  const [normResult, setNormResult] = useState(null);
  const [queryPlan, setQueryPlan] = useState(null);
  const [indexTree, setIndexTree] = useState(null);
  const [activePlanNode, setActivePlanNode] = useState(null);
  const [tab, setTab] = useState("normalize");
  const [workspace, setWorkspace] = useState(null);

  return (
    <div className="bento-app">
      {/* Top Header / Activity Bar */}
      <header className="app-header">
        <h1>Schema<span>Lenz</span></h1>
        <nav className="nav-tabs">
          <div 
            className={`nav-tab ${tab === "normalize" ? "active" : ""}`}
            onClick={() => setTab("normalize")}
          >
            Normalization
          </div>
          <div 
            className={`nav-tab ${tab === "query" ? "active" : ""}`}
            onClick={() => setTab("query")}
          >
            Query Lab
          </div>
          <div 
            className={`nav-tab ${tab === "index" ? "active" : ""}`}
            onClick={() => setTab("index")}
          >
            Indexing
          </div>
          <div 
            className={`nav-tab ${tab === "workspaces" ? "active" : ""}`}
            onClick={() => setTab("workspaces")}
          >
            Workspaces
          </div>
        </nav>
        <div className="status-icons">
          <span style={{color: 'var(--success)'}}>● Online</span>
        </div>
      </header>

      {/* Left Sidebar - Navigation / Tree */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <span className="section-label">Explorer</span>
          <div className="workspace-card active">
            <span>📁</span> Current Session
          </div>
          <div className="workspace-card">
            <span>📄</span> schema_v1.sql
          </div>
          <div className="workspace-card">
            <span>📄</span> dependencies.json
          </div>
        </div>
        
        <div className="sidebar-section">
          <span className="section-label">Recent Projects</span>
          <WorkspaceDashboard mini onSelectWorkspace={setWorkspace} />
        </div>
      </aside>

      {/* Center - Main Editor */}
      <main className="editor-container">
        <div className="editor-header">
          {tab === "normalize" ? "normalization_config.json" : tab === "query" ? "query_analysis.sql" : "index_builder.config"}
        </div>
        <div className="editor-main">
          {tab === "normalize" && (
            <div className="editor-layout">
              <FDInputPanel onResult={setNormResult} />
              {normResult && (
                <div style={{marginTop: '2rem'}}>
                  <ClosureVisualizer 
                    attributes={normResult.attributes || []} 
                    fds={normResult.fds || []} 
                  />
                </div>
              )}
            </div>
          )}
          {tab === "query" && (
            <div className="editor-layout">
              <QueryBuilder onPlan={setQueryPlan} />
              <div style={{marginTop: '2rem'}}>
                <ExecutionHighlighter activeNode={activePlanNode} planData={queryPlan} />
              </div>
            </div>
          )}
          {tab === "index" && (
            <div className="editor-layout">
              <IndexBuilder onTreeGenerated={setIndexTree} />
              {indexTree && (
                  <div className="cost-analysis" style={{marginTop: '2rem', padding: '1rem', background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid var(--border)'}}>
                    <h5 style={{color: 'var(--primary)', marginBottom: '0.5rem'}}>Tree Statistics</h5>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-main)'}}>
                        <span>Height: {indexTree.height}</span>
                        <span>Total Nodes: {indexTree.totalNodes}</span>
                    </div>
                  </div>
              )}
            </div>
          )}
          {tab === "workspaces" && (
            <WorkspaceDashboard onSelectWorkspace={setWorkspace} />
          )}
        </div>
      </main>

      {/* Right - Results & Visualizer */}
      <section className="results-panel">
        <div className="panel-header">Output / Visualizer</div>
        <div className="panel-content">
          {tab === "normalize" && <DecompositionTree result={normResult} />}
          {tab === "query" && <OptimizationDiff planData={queryPlan} onNodeHover={setActivePlanNode} />}
          {tab === "index" && <BPlusTreeRenderer treeData={indexTree} />}
          {!normResult && !queryPlan && !indexTree && (
            <div className="empty-state">
              <p>Ready to analyze. Run an operation in the editor to see results here.</p>
            </div>
          )}
        </div>
      </section>

      {/* Status Bar */}
      <footer className="status-bar">
        <span>UTF-8</span>
        <span>JSON / SQL</span>
        <span>SchemaLenz Core v1.0</span>
        <span style={{marginLeft: 'auto'}}>Ln 1, Col 1</span>
      </footer>
    </div>
  );
}