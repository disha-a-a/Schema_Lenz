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
        <div className="status-icons" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <span className="pulse-indicator" style={{display: 'inline-block', width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%'}}></span>
        </div>
      </header>

      {/* Left Sidebar - Navigation / Tree */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <span className="section-label">Explorer</span>
          <div className="workspace-card active">
            <span style={{color: 'var(--keyword)'}}>🗂️</span> Current Session
          </div>
          <div className="workspace-card">
            <span style={{color: 'var(--function)'}}>📄</span> schema_v1.sql
          </div>
          <div className="workspace-card">
            <span style={{color: 'var(--string)'}}>📄</span> dependencies.json
          </div>
        </div>
        
        <div className="sidebar-section">
          <span className="section-label">Recent Projects</span>
          <WorkspaceDashboard mini onSelectWorkspace={setWorkspace} />
        </div>
      </aside>

      {/* Center - Main Editor */}
      <main className="editor-container">
        <div className="editor-main" style={{padding: 0}}>
          {tab === "normalize" && (
            <div className="editor-layout" style={{height: '100%'}}>
              <FDInputPanel onResult={setNormResult} />
            </div>
          )}
          {tab === "query" && (
            <div className="editor-layout" style={{padding: '1.5rem'}}>
              <div className="editor-header" style={{margin: '-1.5rem -1.5rem 1.5rem -1.5rem'}}>query_analysis.sql</div>
              <QueryBuilder onPlan={setQueryPlan} />
              <div style={{marginTop: '2rem'}}>
                <ExecutionHighlighter activeNode={activePlanNode} planData={queryPlan} />
              </div>
            </div>
          )}
          {tab === "index" && (
            <div className="editor-layout" style={{padding: '1.5rem'}}>
              <div className="editor-header" style={{margin: '-1.5rem -1.5rem 1.5rem -1.5rem'}}>index_builder.config</div>
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
            <div style={{padding: '1.5rem', height: '100%'}}>
               <WorkspaceDashboard onSelectWorkspace={setWorkspace} />
            </div>
          )}
        </div>
      </main>

      {/* Right - Results & Visualizer */}
      <section className="results-panel">
        <div className="panel-header">Output / Visualizer</div>
        <div className="panel-content">
          {tab === "normalize" && (
              <>
                  <DecompositionTree result={normResult} />
                  {normResult && (
                    <div style={{marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem'}}>
                      <h3 style={{color: 'var(--function)', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase'}}>Closure Analysis</h3>
                      <ClosureVisualizer 
                        attributes={normResult.attributes || []} 
                        fds={normResult.fds || []} 
                      />
                    </div>
                  )}
              </>
          )}
          {tab === "query" && <OptimizationDiff planData={queryPlan} onNodeHover={setActivePlanNode} />}
          {tab === "index" && <BPlusTreeRenderer treeData={indexTree} />}
          {!normResult && !queryPlan && !indexTree && tab !== 'workspaces' && (
            <div className="empty-state">
              <p>Ready to analyze. Run an operation in the editor to see results here.</p>
            </div>
          )}
        </div>
      </section>

      {/* Status Bar */}
      <footer className="status-bar">
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span className="pulse-indicator" style={{display: 'inline-block', width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%'}}></span>
            <span>Online</span>
        </div>
        <span>SchemaLenz Core v1.0</span>
        <span style={{marginLeft: 'auto'}}>UTF-8 · JSON / SQL</span>
        <span>Ln 1, Col 1</span>
      </footer>
    </div>
  );
}