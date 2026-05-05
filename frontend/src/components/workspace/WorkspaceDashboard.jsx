import { useState, useEffect } from "react";
import { getAllWorkspaces, createWorkspace, getWorkspace } from "../../api/schemaLenzApi";

export default function WorkspaceDashboard({ onSelectWorkspace }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="workspace-dashboard">
      <div className="workspace-header">
        <h2>Your Workspaces</h2>
        <div className="workspace-actions">
          <input 
            placeholder="New Workspace Name..." 
            value={newWorkspaceName}
            onChange={e => setNewWorkspaceName(e.target.value)}
          />
          <button className="primary" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>

      <div className="workspace-grid">
        {workspaces.map(ws => (
          <div key={ws.id} className="workspace-card" onClick={() => onSelectWorkspace(ws)}>
            <h3>{ws.name}</h3>
            <p>{ws.tables?.length || 0} Tables</p>
            <span className="last-updated">ID: {ws.id}</span>
          </div>
        ))}
        {workspaces.length === 0 && (
          <p className="mute">No workspaces found. Create your first project above.</p>
        )}
      </div>
    </div>
  );
}