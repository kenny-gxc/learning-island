const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'learning.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'data', 'schema.sql');

async function initDB() {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('🗑️  已删除旧数据库');
  }

  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new SQL.Database();
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.run(schema);

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  console.log('✅ 数据库初始化完成');
  db.close();
}

initDB().catch(err => {
  console.error('❌ 初始化失败:', err);
  process.exit(1);
});
