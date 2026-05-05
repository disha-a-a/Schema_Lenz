export default function ExecutionHighlighter({ activeNode }) {
  if (!activeNode) {
    return (
      <div className="execution-highlighter empty">
        <p>Hover over a plan node to see execution details.</p>
      </div>
    );
  }

  return (
    <div className="execution-highlighter active">
      <div className="highlight-header">
        <h4>Operator: {activeNode.name}</h4>
        <span className="badge">Cost: {activeNode.cost}</span>
      </div>
      <div className="highlight-body">
        <p><strong>Description:</strong> This operator performs {activeNode.name.toLowerCase()} on the input stream.</p>
        <div className="stats">
            <div className="stat-item">
                <span className="label">Complexity:</span>
                <span className="value">{activeNode.cost > 100 ? "High" : "Low"}</span>
            </div>
            {activeNode.details && (
                <div className="stat-item">
                    <span className="label">Details:</span>
                    <span className="value">{activeNode.details}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}