import { useState, useEffect } from "react";
import { getAllWorkspaces, createWorkspace, renameWorkspace, deleteWorkspace } from "../../api/schemaLenzApi";

export default function WorkspaceDashboard({ onSelectWorkspace, mini = false }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const fetchWorkspaces = async () => {
    try {
      const { data } = await getAllWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      console.error("Failed to fetch workspaces", error);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) return;
    setLoading(true);
    try {
      await createWorkspace(newWorkspaceName);
      setNewWorkspaceName("");
      fetchWorkspaces();
    } catch (error) {
      console.error("Failed to create workspace", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id, e) => {
    e.stopPropagation();
    if (!editName.trim()) return setEditingId(null);
    try {
      await renameWorkspace(id, editName);
      setEditingId(null);
      fetchWorkspaces();
    } catch (error) {
      console.error("Failed to rename workspace", error);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this workspace?")) {
      try {
        await deleteWorkspace(id);
        fetchWorkspaces();
      } catch (error) {
        console.error("Failed to delete workspace", error);
      }
    }
  };

  const startEdit = (ws, e) => {
    e.stopPropagation();
    setEditingId(ws.id);
    setEditName(ws.name);
  };

  if (mini) {
      return (
          <div className="workspace-mini-list">
              {workspaces.map(ws => (
                  <div key={ws.id} className="workspace-card" onClick={() => onSelectWorkspace(ws)}>
                      <span>📄</span> {ws.name}
                  </div>
              ))}
              {workspaces.length === 0 && <div className="workspace-card mute">No recent projects</div>}
          </div>
      );
  }

  return (
    <div className="workspace-dashboard" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div className="workspace-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2>Your Workspace Hub</h2>
        <div className="workspace-actions" style={{display: 'flex', gap: '0.5rem'}}>
          <input 
            className="mono-code"
            style={{padding: '0.4rem 0.8rem'}}
            placeholder="New Workspace Name..." 
            value={newWorkspaceName}
            onChange={e => setNewWorkspaceName(e.target.value)}
          />
          <button className="primary-btn" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>

      <div className="workspace-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', overflowY: 'auto', paddingRight: '1rem'}}>
        {workspaces.map(ws => (
          <div key={ws.id} className="workspace-card-detailed" onClick={() => onSelectWorkspace(ws)} style={{background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid var(--border)', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', position: 'relative'}}>
            
            <div className="card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                {editingId === ws.id ? (
                    <div style={{display: 'flex', gap: '0.5rem'}} onClick={e => e.stopPropagation()}>
                        <input value={editName} onChange={e => setEditName(e.target.value)} className="mono-code" autoFocus style={{padding: '0.2rem', width: '150px'}} />
                        <button className="secondary-btn" onClick={(e) => handleRename(ws.id, e)} style={{padding: '0.2rem 0.5rem', fontSize: '0.8rem'}}>Save</button>
                    </div>
                ) : (
                    <h3 style={{color: 'var(--primary)', margin: 0}}>{ws.name}</h3>
                )}
                
                <div className="actions" style={{display: 'flex', gap: '0.5rem'}}>
                    {editingId !== ws.id && (
                        <button className="icon-btn" onClick={(e) => startEdit(ws, e)} title="Rename" style={{background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6}}>✏️</button>
                    )}
                    <button className="icon-btn" onClick={(e) => handleDelete(ws.id, e)} title="Delete" style={{background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6}}>🗑️</button>
                </div>
            </div>

            <div className="card-body" style={{fontSize: '0.85rem', color: 'var(--text-main)'}}>
                <div style={{marginBottom: '0.5rem'}}><strong>ID:</strong> <span className="mono-code">{ws.id}</span></div>
                <div style={{marginBottom: '1rem'}}><strong>Tables:</strong> {ws.tables?.length || 0}</div>
                
                <div className="table-preview" style={{borderTop: '1px solid var(--border)', paddingTop: '0.8rem'}}>
                    <strong style={{color: 'var(--keyword)', display: 'block', marginBottom: '0.5rem'}}>Recent Schema:</strong>
                    {ws.tables && ws.tables.length > 0 ? (
                        <TableSchemaCard table={ws.tables[0]} />
                    ) : (
                        <span style={{opacity: 0.5}}>No schemas generated yet. Run normalization to save schemas.</span>
                    )}
                </div>
            </div>
          </div>
        ))}
        {workspaces.length === 0 && (
          <div className="empty-state" style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', opacity: 0.6}}>
            No workspaces found. Create your first project above.
          </div>
        )}
      </div>
    </div>
  );
}

function TableSchemaCard({ table }) {
    if (!table) return null;
    return (
        <div className="table-schema-card" style={{background: 'var(--bg-surface)', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)'}}>
            <div style={{fontWeight: 'bold', color: 'var(--string)', marginBottom: '0.5rem'}}>🗄️ {table.name || 'Relation'}</div>
            <div className="columns" style={{display: 'flex', gap: '0.3rem', flexWrap: 'wrap'}}>
                {table.columns?.map(col => (
                    <span key={col} className="col-badge" style={{background: 'rgba(56, 189, 248, 0.1)', color: 'var(--function)', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.75rem'}}>
                        {col}
                    </span>
                )) || <span style={{opacity: 0.5}}>Attributes missing</span>}
            </div>
            {table.indexes && table.indexes.length > 0 && (
                <div className="indexes" style={{marginTop: '0.5rem'}}>
                    {table.indexes.map(idx => (
                        <IndexEntry key={idx.name} index={idx} />
                    ))}
                </div>
            )}
        </div>
    );
}

function IndexEntry({ index }) {
    return (
        <div className="index-entry" style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', marginTop: '0.3rem'}}>
            <span style={{color: 'var(--danger)'}}>⚡</span>
            <span style={{color: 'var(--keyword)'}}>{index.name}</span>
            <span style={{color: 'var(--text-main)', opacity: 0.7}}>({index.columns.join(', ')})</span>
        </div>
    );
}