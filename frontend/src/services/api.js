import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:8080' });

API.interceptors.request.use((config)=>{
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export const register = (data)=>API.post('/auth/register', data).then(r=>r.data);
export const login = (data)=>API.post('/auth/login', data).then(r=>r.data);
export const getProjects = ()=>API.get('/projects').then(r=>r.data);
export const createProject = (data)=>API.post('/projects', data).then(r=>r.data);
export const deleteProject = (id)=>API.delete(`/projects/${id}`).then(r=>r.data);

export const getProject = (id)=>API.get(`/projects/${id}`).then(r=>r.data);
export const addMember = (id, data)=>API.post(`/projects/${id}/members`, data).then(r=>r.data);
export const getTasks = (id)=>API.get(`/projects/${id}/tasks`).then(r=>r.data);
export const createTask = (id, data)=>API.post(`/projects/${id}/tasks`, data).then(r=>r.data);
export const patchTask = (taskId, data)=>API.patch(`/tasks/${taskId}`, data).then(r=>r.data);
export const getMessages = (id)=>API.get(`/projects/${id}/messages`).then(r=>r.data);
export const postMessage = (id, data)=>API.post(`/projects/${id}/messages`, data).then(r=>r.data);

// Whiteboard
export const getBoard = (id)=>API.get(`/projects/${id}/board`).then(r=>r.data);
export const saveBoard = (id, elements)=>API.post(`/projects/${id}/board/save`, { elements }).then(r=>r.data);
