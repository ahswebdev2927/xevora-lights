const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

// Accept a path from command-line argument, or default to ../sqlite.db
const inputPath = process.argv[2] 
  ? path.resolve(process.cwd(), process.argv[2]) 
  : path.resolve(__dirname, '../sqlite.db');

const dbPath = path.normalize(inputPath);
const backupPath = `${dbPath}.bak`;

if (!fs.existsSync(dbPath)) {
  console.error(`Error: Database not found at: ${dbPath}`);
  console.log('\nUsage: node scripts/enable-wal.cjs [path/to/database.db]');
  process.exit(1);
}

console.log(`Processing database: ${dbPath}`);

// 1. Create safety backup
fs.copyFileSync(dbPath, backupPath);
console.log(`Backup created at:    ${backupPath}`);

// 2. Open DB and inspect current mode
const db = new DatabaseSync(dbPath);
const before = db.prepare('PRAGMA journal_mode;').get();
console.log(`Previous mode:        ${before.journal_mode}`);

// 3. Set WAL mode
const result = db.prepare('PRAGMA journal_mode = WAL;').get();
console.log(`Updated mode:         ${result.journal_mode}`);

// 4. Checkpoint to sync all pages back to main database file
db.prepare('PRAGMA wal_checkpoint(TRUNCATE);').run();
db.close();

// 5. Verify on re-open
const verifyDb = new DatabaseSync(dbPath);
const after = verifyDb.prepare('PRAGMA journal_mode;').get();
verifyDb.close();

if (after.journal_mode === 'wal') {
  console.log(`\nSuccess: "${path.basename(dbPath)}" is now configured with journal_mode=WAL and ready for Turso!`);
} else {
  console.error(`Unexpected journal mode: ${after.journal_mode}`);
  process.exit(1);
}
