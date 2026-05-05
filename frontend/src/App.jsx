import { useState } from "react";
import FDInputPanel from "./components/normalization/FDInputPanel";
import DecompositionTree from "./components/normalization/DecompositionTree";
import QueryBuilder from "./components/query/QueryBuilder";
import PlanTree from "./components/query/PlanTree";

export default function App() {
  const [normResult, setNormResult] = useState(null);
  const [queryPlan, setQueryPlan] = useState(null);
  const [tab, setTab] = useState("normalize");

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
        </nav>
      </header>

      <main className="content">
        {tab === "normalize" && (
          <div className="lab-section">
            <FDInputPanel onResult={setNormResult} />
            <DecompositionTree result={normResult} />
          </div>
        )}
        
        {tab === "query" && (
          <div className="lab-section">
            <QueryBuilder onPlan={setQueryPlan} />
            <PlanTree plan={queryPlan} />
          </div>
        )}
      </main>
    </div>
  );
}