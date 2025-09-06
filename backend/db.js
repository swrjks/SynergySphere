
import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('./data.sqlite');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
const schema = fs.readFileSync(new URL('./schema.sql', import.meta.url)).toString();
db.exec(schema);
export default db;
