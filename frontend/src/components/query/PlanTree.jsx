export default function PlanTree({ plan }) {
  if (!plan) return null;

  const renderNode = (node, depth = 0) => (
    <div key={node.name + depth} style={{ marginLeft: depth * 24 }} className="plan-node">
      <div className="node-content">
        <span className="node-icon">⚡</span>
        <span className="node-label">{node.name}</span>
        {node.cost > 0 && <span className="node-cost"> [Cost: {node.cost}]</span>}
      </div>
      <div className="node-children">
        {node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    </div>
  );

  return (
    <div className="plan-tree">
      <div className="tree-header">
        <h3>Logical Execution Plan</h3>
      </div>
      <div className="tree-body">
        {renderNode(plan)}
      </div>
    </div>
  );
}