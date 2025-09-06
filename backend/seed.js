
import dotenv from 'dotenv';
import db from './db.js';
import bcrypt from 'bcryptjs';

dotenv.config();
const pw = bcrypt.hashSync('password', 10);
const u1 = db.prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)').run('Sahil','sahil@example.com',pw).lastInsertRowid;
const u2 = db.prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)').run('Ava','ava@example.com',pw).lastInsertRowid;
const p1 = db.prepare('INSERT INTO projects (name,description,owner_id) VALUES (?,?,?)').run('Apollo','Launch MVP for SynergySphere',u1).lastInsertRowid;
db.prepare('INSERT INTO memberships (project_id,user_id,role) VALUES (?,?,?)').run(p1,u1,'owner');
db.prepare('INSERT INTO memberships (project_id,user_id,role) VALUES (?,?,?)').run(p1,u2,'member');
const tasks=[
  ['Design Auth Screens','Create login/signup pages',u2,'2025-09-15','inprogress'],
  ['Kanban Board','Implement columns and drag',u1,'2025-09-20','todo'],
  ['Project Chat','Realtime threaded chat',null,null,'todo'],
  ['Deployment','Dockerize & deploy',u1,'2025-10-01','todo']
];
for (const t of tasks){
  db.prepare('INSERT INTO tasks (project_id,title,description,assignee_id,due_date,status) VALUES (?,?,?,?,?,?)').run(p1,...t);
}
db.prepare('INSERT INTO messages (project_id,user_id,body) VALUES (?,?,?)').run(p1,u1,'Welcome to Apollo project 👋');
db.prepare('INSERT INTO messages (project_id,user_id,body) VALUES (?,?,?)').run(p1,u2,'Got it! Working on auth!');
console.log('Seeded. Login: sahil@example.com / password');
