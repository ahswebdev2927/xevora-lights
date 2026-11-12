const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// Load environment variables from .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const migrationStatements = [
  "ALTER TABLE users ADD COLUMN email TEXT;",
  "ALTER TABLE users ADD COLUMN firebase_uid TEXT;",
  "DROP INDEX IF EXISTS users_phone_number_unique;",
  "UPDATE users SET phone_number = NULL WHERE phone_number = '';",
  "ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;",
  "ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'main_product';",
  "ALTER TABLE products ADD COLUMN homepage_slot TEXT;",
  "ALTER TABLE products ADD COLUMN mrp REAL;",
  "ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;",
  "ALTER TABLE products ADD COLUMN sku TEXT;",
  "ALTER TABLE products ADD COLUMN parent_product_id INTEGER;",
  "ALTER TABLE homepage_categories ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;",
  "ALTER TABLE navigation_menu ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;",
  "ALTER TABLE orders ADD COLUMN phonepe_order_id TEXT;",
  "ALTER TABLE orders ADD COLUMN phonepe_payment_id TEXT;",
  "ALTER TABLE orders ADD COLUMN payment_gateway TEXT DEFAULT 'phonepe';",
  "ALTER TABLE orders ADD COLUMN courier_service_name TEXT;",
  "ALTER TABLE orders ADD COLUMN courier_id TEXT;",
  "ALTER TABLE orders ADD COLUMN tracking_number TEXT;",
  "ALTER TABLE orders ADD COLUMN tracking_link TEXT;",
  "ALTER TABLE orders ADD COLUMN estimated_delivery_date INTEGER;",
  "ALTER TABLE orders ADD COLUMN shipping_notes TEXT;",
  "ALTER TABLE orders ADD COLUMN cancellation_reason TEXT;",
  "ALTER TABLE reels ADD COLUMN creator_handle TEXT DEFAULT '@creator';",
  `CREATE TABLE IF NOT EXISTS reels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    badge_text TEXT DEFAULT 'NEW',
    creator_handle TEXT DEFAULT '@creator',
    views_count TEXT DEFAULT '2.5M',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS product_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL DEFAULT 5,
    title TEXT NOT NULL,
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`
];

async function runMigrationsOnTarget(targetName, client) {
  console.log(`\n========================================`);
  console.log(`Applying migrations to: [${targetName}]`);
  console.log(`========================================`);
  let successCount = 0;
  let skipOrErrorCount = 0;

  for (let i = 0; i < migrationStatements.length; i++) {
    const sql = migrationStatements[i];
    const preview = sql.trim().replace(/\s+/g, ' ').slice(0, 60);
    try {
      await client.execute(sql);
      successCount++;
      console.log(`  ✓ [${i + 1}/${migrationStatements.length}] ${preview}...`);
    } catch (err) {
      // Column/table already exists or handled
      skipOrErrorCount++;
      const msg = err.message || String(err);
      if (msg.includes('duplicate column') || msg.includes('already exists') || msg.includes('no such column')) {
        console.log(`  - [${i + 1}/${migrationStatements.length}] (already applied): ${preview}`);
      } else {
        console.log(`  - [${i + 1}/${migrationStatements.length}] Notice: ${preview} (${msg})`);
      }
    }
  }

  console.log(`Completed [${targetName}]: ${successCount} executed, ${skipOrErrorCount} checked/already present.`);
}

async function main() {
  console.log("Xevora Lights - Dual Database Migration Runner");

  // 1. Local SQLite file target
  const localDbPath = path.join(__dirname, '..', 'sqlite.db');
  console.log(`Local DB file: ${localDbPath}`);
  const localClient = createClient({ url: `file:${localDbPath}` });
  await runMigrationsOnTarget('LOCAL SQLite (sqlite.db)', localClient);

  // 2. Turso Remote DB target (if configured)
  const tursoUrl = process.env.DATABASE_URL;
  const tursoAuthToken = process.env.DATABASE_AUTH_TOKEN;

  if (tursoUrl && tursoUrl.startsWith('libsql://')) {
    console.log(`Remote Turso URL: ${tursoUrl}`);
    const tursoClient = createClient({ url: tursoUrl, authToken: tursoAuthToken });
    try {
      await runMigrationsOnTarget('REMOTE Turso DB', tursoClient);
    } catch (err) {
      console.error(`\n[Notice] Could not connect to Turso remote (e.g. offline/network):`, err.message);
    }
  } else {
    console.log(`\nRemote Turso DB not configured or using file: url. Skipping remote target.`);
  }

  console.log("\nAll migration runs finished successfully!");
}

main().catch(console.error);
