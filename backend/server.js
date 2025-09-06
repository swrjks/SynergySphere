import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// helpers
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }
}
const userById = (id)=> db.prepare('SELECT id, name, email FROM users WHERE id=?').get(id);
const isMember = (projectId, userId) =>
  !!db.prepare('SELECT 1 FROM memberships WHERE project_id=? AND user_id=?').get(projectId, userId);

// ---------- Auth ----------
app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)').run(name||'', email, hash);
    const user = userById(info.lastInsertRowid);
    const token = jwt.sign({ id:user.id, email:user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch { return res.status(400).json({ error: 'Email already exists' }); }
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE email=?').get(email||'');
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password||'', row.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
  const user = { id: row.id, name: row.name, email: row.email };
  const token = jwt.sign({ id:user.id, email:user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
});

// ---------- Projects ----------
app.get('/projects', auth, (req,res)=>{
  const rows = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id=p.id AND t.status='done') AS done_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id=p.id) AS total_count
    FROM projects p
    JOIN memberships m ON m.project_id=p.id
    WHERE m.user_id=?
    ORDER BY p.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

app.post('/projects', auth, (req,res)=>{
  const { name, description } = req.body;
  const info = db.prepare('INSERT INTO projects (name,description,owner_id) VALUES (?,?,?)')
    .run(name, description||'', req.user.id);
  db.prepare('INSERT INTO memberships (project_id,user_id,role) VALUES (?,?,?)')
    .run(info.lastInsertRowid, req.user.id, 'owner');
  res.json(db.prepare('SELECT * FROM projects WHERE id=?').get(info.lastInsertRowid));
});

app.get('/projects/:id', auth, (req,res)=>{
  const p = db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  if (!isMember(p.id, req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  const members = db.prepare('SELECT u.id,u.name,u.email,m.role FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.project_id=?').all(p.id);
  res.json({ ...p, members });
});

app.post('/projects/:id/members', auth, (req,res)=>{
  const { email, role } = req.body;
  const p = db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  if (p.owner_id !== req.user.id) return res.status(403).json({ error: 'Only owner can add members' });
  const u = db.prepare('SELECT id FROM users WHERE email=?').get(email);
  if (!u) return res.status(404).json({ error: 'User not found' });
  try { db.prepare('INSERT INTO memberships (project_id,user_id,role) VALUES (?,?,?)').run(p.id, u.id, role||'member'); }
  catch { return res.status(400).json({ error: 'Already a member' }); }
  res.json({ ok:true });
});

// delete project (owner only)
app.delete('/projects/:id', auth, (req,res)=>{
  const p = db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  if (p.owner_id !== req.user.id) return res.status(403).json({ error: 'Only owner can delete project' });
  db.prepare('DELETE FROM projects WHERE id=?').run(p.id);
  io.to(`project:${p.id}`).emit('project:deleted', { id: p.id });
  res.json({ ok:true });
});

// ---------- Tasks ----------
app.get('/projects/:id/tasks', auth, (req,res)=>{
  const tasks = db.prepare('SELECT * FROM tasks WHERE project_id=? ORDER BY status, due_date IS NULL, due_date').all(req.params.id);
  res.json(tasks);
});

app.post('/projects/:id/tasks', auth, (req,res)=>{
  const { title, description, assignee_id, due_date, status } = req.body;
  const info = db.prepare('INSERT INTO tasks (project_id,title,description,assignee_id,due_date,status) VALUES (?,?,?,?,?,?)')
    .run(req.params.id, title, description||'', assignee_id||null, due_date||null, status||'todo');
  const task = db.prepare('SELECT * FROM tasks WHERE id=?').get(info.lastInsertRowid);
  io.to(`project:${req.params.id}`).emit('task:new', task);
  res.json(task);
});

app.patch('/tasks/:taskId', auth, (req,res)=>{
  const { title, description, assignee_id, due_date, status } = req.body;
  const t = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.taskId);
  if (!t) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE tasks SET title=COALESCE(?,title), description=COALESCE(?,description), assignee_id=?, due_date=?, status=COALESCE(?,status) WHERE id=?')
    .run(title, description, assignee_id ?? t.assignee_id, due_date ?? t.due_date, status, t.id);
  const updated = db.prepare('SELECT * FROM tasks WHERE id=?').get(t.id);
  io.to(`project:${t.project_id}`).emit('task:update', updated);
  res.json(updated);
});

// ---------- Messages ----------
app.get('/projects/:id/messages', auth, (req,res)=>{
  const rows = db.prepare(`
    SELECT msg.*, u.name AS author_name, u.email AS author_email
    FROM messages msg JOIN users u ON u.id=msg.user_id
    WHERE msg.project_id=? ORDER BY msg.created_at ASC
  `).all(req.params.id);
  res.json(rows);
});

app.post('/projects/:id/messages', auth, (req,res)=>{
  const { body, parent_id } = req.body;
  const info = db.prepare('INSERT INTO messages (project_id,user_id,body,parent_id) VALUES (?,?,?,?)')
    .run(req.params.id, req.user.id, body, parent_id || null);
  const msg = db.prepare('SELECT * FROM messages WHERE id=?').get(info.lastInsertRowid);
  const enriched = { ...msg, author_name: (userById(req.user.id)?.name || ''), author_email: (userById(req.user.id)?.email || '') };
  io.to(`project:${req.params.id}`).emit('message:new', enriched);
  res.json(enriched);
});

// ---------- Whiteboard APIs ----------
app.get('/projects/:id/board', auth, (req,res)=>{
  const pid = Number(req.params.id);
  if (!isMember(pid, req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  let row = db.prepare('SELECT * FROM whiteboards WHERE project_id=?').get(pid);
  if (!row) {
    db.prepare('INSERT INTO whiteboards (project_id,data) VALUES (?,?)').run(pid, '[]');
    row = db.prepare('SELECT * FROM whiteboards WHERE project_id=?').get(pid);
  }
  res.json({ elements: JSON.parse(row.data || '[]'), updated_at: row.updated_at });
});

app.post('/projects/:id/board/save', auth, (req,res)=>{
  const pid = Number(req.params.id);
  if (!isMember(pid, req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  const elements = Array.isArray(req.body.elements) ? req.body.elements : [];
  db.prepare('UPDATE whiteboards SET data=? WHERE project_id=?').run(JSON.stringify(elements), pid);
  io.to(`project:${pid}`).emit('wb:saved', { by: req.user.id, at: Date.now() });
  res.json({ ok:true });
});

// ---------- Socket ----------
io.on('connection', (socket)=>{
  socket.on('join', (projectId)=> socket.join(`project:${projectId}`));

  socket.on('wb:add', ({ projectId, element })=>{
    io.to(`project:${projectId}`).emit('wb:add', { element });
  });
  socket.on('wb:update', ({ projectId, element })=>{
    io.to(`project:${projectId}`).emit('wb:update', { element });
  });
  socket.on('wb:delete', ({ projectId, id })=>{
    io.to(`project:${projectId}`).emit('wb:delete', { id });
  });
  socket.on('wb:clear', ({ projectId })=>{
    io.to(`project:${projectId}`).emit('wb:clear', {});
  });
  socket.on('wb:cursor', ({ projectId, x, y, name, color })=>{
    socket.to(`project:${projectId}`).emit('wb:cursor', { id: socket.id, x, y, name, color, t: Date.now() });
  });
});

server.listen(PORT, ()=> console.log(`SynergySphere backend running on http://localhost:${PORT}`));
