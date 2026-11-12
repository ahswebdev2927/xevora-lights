import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Disable SSL certificate verification check to allow local connections through firewalls/proxies
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = process.env.DATABASE_URL || process.env.DATABASE_URI;
const authToken = process.env.DATABASE_AUTH_TOKEN;

// Prevent multiple instances of database connection client in development
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
};

export const client = globalForDb.client ?? (
  (url && url !== "file:sqlite.db") 
    ? createClient({ url, authToken })
    : createClient({ url: "file:sqlite.db" })
);

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

// Ensure migrations execute on BOTH primary client (Turso) and local SQLite file
const migrationClients: ReturnType<typeof createClient>[] = [client];

if (url && url !== "file:sqlite.db") {
  try {
    const localDbClient = createClient({ url: "file:sqlite.db" });
    migrationClients.push(localDbClient);
  } catch {}
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

for (const dbClient of migrationClients) {
  for (const sql of migrationStatements) {
    dbClient.execute(sql).catch(() => {});
  }
}

export const db = drizzle(client, { schema });
