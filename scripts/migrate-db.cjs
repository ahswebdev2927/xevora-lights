const fs = require('fs');
const path = require('path');

// 1. Update schema.ts
const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.ts');
let schema = fs.readFileSync(schemaPath, 'utf8');

const targetStr = 'salePrice: real("sale_price"),';
const replacementStr = `salePrice: real("sale_price"),
  mrp: real("mrp"),
  stock: integer("stock").default(0),
  sku: text("sku"),
  productType: text("product_type").default("main_product"),
  homepageSlot: text("homepage_slot"),
  parentProductId: integer("parent_product_id"),`;

if (!schema.includes('productType: text("product_type")')) {
  schema = schema.replace(targetStr, replacementStr);
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('Updated schema.ts with new columns.');
} else {
  console.log('schema.ts already contains productType.');
}

// 2. Update index.ts with safe auto-alter table executions
const indexPath = path.join(__dirname, '..', 'src', 'db', 'index.ts');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const alterTarget = 'client.execute("ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;").catch(() => {});';
const alterAdditions = `client.execute("ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'main_product';").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN homepage_slot TEXT;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN mrp REAL;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN sku TEXT;").catch(() => {});
client.execute("ALTER TABLE products ADD COLUMN parent_product_id INTEGER;").catch(() => {});`;

if (!indexContent.includes('ALTER TABLE products ADD COLUMN product_type')) {
  indexContent = indexContent.replace(alterTarget, alterAdditions);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('Updated index.ts with auto-migration columns.');
} else {
  console.log('index.ts already has new alter statements.');
}

// 3. Also run alter commands right now on sqlite.db directly
const { createClient } = require('@libsql/client');
const dbPath = path.join(__dirname, '..', 'sqlite.db');
const client = createClient({ url: `file:${dbPath}` });

async function runAlters() {
  const alters = [
    "ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'main_product';",
    "ALTER TABLE products ADD COLUMN homepage_slot TEXT;",
    "ALTER TABLE products ADD COLUMN mrp REAL;",
    "ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;",
    "ALTER TABLE products ADD COLUMN sku TEXT;",
    "ALTER TABLE products ADD COLUMN parent_product_id INTEGER;"
  ];
  for (const sql of alters) {
    try {
      await client.execute(sql);
      console.log('Executed:', sql);
    } catch (e) {
      console.log('Column may already exist or error ignored:', e.message);
    }
  }
}
runAlters();
