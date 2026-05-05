import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

export const normalize = (attrs, fds, targetNF) =>
  api.post('/normalization/normalize', { attributes: attrs, fds, targetNF });

export const analyzeQuery = (sql, workspaceId) =>
  api.post('/query/explain', { sql, workspaceId });

export const optimizeQuery = (sql, workspaceId) =>
  api.post('/query/optimize', { sql, workspaceId });

export const simulateCost = (leftRows, rightRows) =>
  api.post('/query/cost', { leftRows, rightRows });

export const getAllWorkspaces = () =>
  api.get('/workspaces');

export const createWorkspace = (name) =>
  api.post('/workspaces', name);

export const getWorkspace = (id) =>
  api.get(`/workspaces/${id}`);