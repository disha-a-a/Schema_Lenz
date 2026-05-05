import { useState } from "react";
import FDInputPanel from "./components/normalization/FDInputPanel";
import DecompositionTree from "./components/normalization/DecompositionTree";
import ClosureVisualizer from "./components/normalization/ClosureVisualizer";
import QueryBuilder from "./components/query/QueryBuilder";
import PlanTree from "./components/query/PlanTree";
import ExecutionHighlighter from "./components/query/ExecutionHighlighter";
import WorkspaceDashboard from "./components/workspace/WorkspaceDashboard";

export default function App() {
  const [normResult, setNormResult] = useState(null);
  const [queryPlan, setQueryPlan] = useState(null);
  const [activePlanNode, setActivePlanNode] = useState(null);
  const [tab, setTab] = useState("normalize");
  const [workspace, setWorkspace] = useState(null);

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>SchemaLenz <span>Normalization & Query Engine</span></h1>
        <nav className="tabs">
          <button 
            className={tab === "normalize" ? "active" : ""} 
            onClick={() => setTab("normalize")}
          >
            Normalization Lab
          </button>
          <button 
            className={tab === "query" ? "active" : ""} 
            onClick={() => setTab("query")}
          >
            Query Lab
          </button>
          <button 
            className={tab === "workspaces" ? "active" : ""} 
            onClick={() => setTab("workspaces")}
          >
            Workspaces
          </button>
        </nav>
      </header>

      <main className="content">
        {tab === "normalize" && (
          <div className="lab-section">
            <div className="input-column">
                <FDInputPanel onResult={setNormResult} />
                {normResult && (
                    <ClosureVisualizer 
                        attributes={normResult.attributes || []} 
                        fds={normResult.fds || []} 
                    />
                )}
            </div>
            <DecompositionTree result={normResult} />
          </div>
        )}
        
        {tab === "query" && (
          <div className="lab-section">
            <div className="input-column">
                <QueryBuilder onPlan={setQueryPlan} />
                <ExecutionHighlighter activeNode={activePlanNode} />
            </div>
            <PlanTree plan={queryPlan} onNodeHover={setActivePlanNode} />
          </div>
        )}

        {tab === "workspaces" && (
            <WorkspaceDashboard onSelectWorkspace={setWorkspace} />
        )}
      </main>
    </div>
  );
}