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

// Auto-ensure required tables & columns exist
client.execute("ALTER TABLE users ADD COLUMN email TEXT;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'main_product';").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN homepage_slot TEXT;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN mrp REAL;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN sku TEXT;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN parent_product_id INTEGER;").catch(() => {});
client.execute("ALTER TABLE homepage_categories ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;").catch(() => {});
client.execute("ALTER TABLE navigation_menu ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;").catch(() => {});
client.execute("ALTER TABLE orders ADD COLUMN phonepe_order_id TEXT;").catch(() => {});
client.execute("ALTER TABLE orders ADD COLUMN phonepe_payment_id TEXT;").catch(() => {});
client.execute("ALTER TABLE orders ADD COLUMN payment_gateway TEXT DEFAULT 'phonepe';").catch(() => {});
client.execute("ALTER TABLE orders ADD COLUMN courier_service_name TEXT;").catch(() => {});
client.execute("ALTER TABLE orders ADD COLUMN courier_id TEXT;").catch(() => {});
client.execute("ALTER TABLE orders ADD COLUMN tracking_number TEXT;").catch(() => {});
client.execute("ALTER TABLE orders ADD COLUMN tracking_link TEXT;").catch(() => {});
client.execute("ALTER TABLE orders ADD COLUMN estimated_delivery_date INTEGER;").catch(() => {});
client.execute("ALTER TABLE orders ADD COLUMN shipping_notes TEXT;").catch(() => {});
client.execute("ALTER TABLE orders ADD COLUMN cancellation_reason TEXT;").catch(() => {});
client.execute("ALTER TABLE reels ADD COLUMN creator_handle TEXT DEFAULT '@creator';").catch(() => {});
client.execute(`
  CREATE TABLE IF NOT EXISTS reels (
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
  );
`).catch(() => {});
client.execute(`
  CREATE TABLE IF NOT EXISTS product_reviews (
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
  );
`).catch(() => {});

export const db = drizzle(client, { schema });
