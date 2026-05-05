export default function DecompositionTree({ result }) {
  if (!result) return null;
  const { currentNF, candidateKeys, decomposedRelations } = result;

  return (
    <div className="decomp-tree">
      <div className="summary-banner">
        <h3>Detected: <span className="nf-badge">{currentNF}</span></h3>
        <p><strong>Candidate Keys:</strong> {candidateKeys.map(k => `{${k.join(",")}}`).join(", ")}</p>
      </div>
      
      <div className="relations-grid">
        {decomposedRelations.map((rel, i) => (
          <div key={i} className="relation-card">
            <h4>Relation R{i + 1}</h4>
            <div className="rel-info">
                <p><strong>Attributes:</strong> {rel.attributes.join(", ")}</p>
                <div className="fds-box">
                    <strong>Local FDs:</strong>
                    {rel.fds && rel.fds.length > 0 ? (
                        <ul>
                        {rel.fds.map((fd, j) => (
                            <li key={j}>{fd.lhs.join(",")} → {fd.rhs.join(",")}</li>
                        ))}
                        </ul>
                    ) : (
                        <p className="mute">None</p>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}