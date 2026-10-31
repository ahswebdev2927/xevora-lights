const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'sqlite.db');
const db = new Database(dbPath);

console.log('Seeding Stitch products in sqlite.db...');

// Check if products exist
const existing10W = db.prepare("SELECT id FROM products WHERE name LIKE '%10W RGB%'").get();
let id10W;
if (existing10W) {
  id10W = existing10W.id;
  db.prepare(`
    UPDATE products SET
      name = 'Xevora G-Flash 10W RGB',
      description = 'Pocket-size handheld optical spotlight projector with 20 precision GOBO pattern discs, full-range RGB spectrum control, and 350-minute runtime.',
      base_price = 7999,
      sale_price = 4999,
      avg_rating = 4.9,
      num_reviews = 158,
      images = ?,
      category = 'G-Flash Series',
      tags = 'g-flash, 10w rgb, gobo projector, pocket light, creator lighting',
      is_featured = 1,
      is_active = 1
    WHERE id = ?
  `).run(JSON.stringify({ Default: ['/images/landing/product-10w-rgb.jpg', '/images/landing/hero-gflash.jpg'] }), id10W);
  console.log('Updated 10W RGB Product ID:', id10W);
} else {
  const insert10W = db.prepare(`
    INSERT INTO products (name, description, base_price, sale_price, avg_rating, num_reviews, images, category, tags, is_featured, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
  `).run(
    'Xevora G-Flash 10W RGB',
    'Pocket-size handheld optical spotlight projector with 20 precision GOBO pattern discs, full-range RGB spectrum control, and 350-minute runtime.',
    7999,
    4999,
    4.9,
    158,
    JSON.stringify({ Default: ['/images/landing/product-10w-rgb.jpg', '/images/landing/hero-gflash.jpg'] }),
    'G-Flash Series',
    'g-flash, 10w rgb, gobo projector, pocket light, creator lighting'
  );
  id10W = insert10W.lastInsertRowid;
  console.log('Inserted 10W RGB Product ID:', id10W);
}

// Ensure variations for 10W
const vars10W = db.prepare("SELECT id FROM product_variations WHERE product_id = ?").all(id10W);
if (vars10W.length === 0) {
  db.prepare(`
    INSERT INTO product_variations (product_id, size, color, mrp, sale_price, stock, sku)
    VALUES (?, 'Standard Edition', 'Matte Stealth Black', 7999, 4999, 250, 'XEV-GFL-10W-STD')
  `).run(id10W);
}

// 30W PRO
const existing30W = db.prepare("SELECT id FROM products WHERE name LIKE '%PRO 30W%' OR name LIKE '%30W PRO%'").get();
let id30W;
if (existing30W) {
  id30W = existing30W.id;
  db.prepare(`
    UPDATE products SET
      name = 'Xevora G-Flash PRO 30W',
      description = 'Flagship 30W high-output optical spotlight projector with 4,800 LUX intensity, active ultra-quiet hydro-bearing cooling, CRI 98+ cinema fidelity, and 20 GOBO patterns.',
      base_price = 10999,
      sale_price = 7499,
      avg_rating = 4.9,
      num_reviews = 341,
      images = ?,
      category = 'G-Flash Series',
      tags = 'g-flash pro, 30w spotlight, gobo projector, flagship cinema, studio keylight',
      is_featured = 1,
      is_active = 1
    WHERE id = ?
  `).run(JSON.stringify({ Default: ['/images/landing/product-30w-pro.jpg', '/images/landing/beam-power-30w.jpg'] }), id30W);
  console.log('Updated 30W PRO Product ID:', id30W);
} else {
  const insert30W = db.prepare(`
    INSERT INTO products (name, description, base_price, sale_price, avg_rating, num_reviews, images, category, tags, is_featured, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
  `).run(
    'Xevora G-Flash PRO 30W',
    'Flagship 30W high-output optical spotlight projector with 4,800 LUX intensity, active ultra-quiet hydro-bearing cooling, CRI 98+ cinema fidelity, and 20 GOBO patterns.',
    10999,
    7499,
    4.9,
    341,
    JSON.stringify({ Default: ['/images/landing/product-30w-pro.jpg', '/images/landing/beam-power-30w.jpg'] }),
    'G-Flash Series',
    'g-flash pro, 30w spotlight, gobo projector, flagship cinema, studio keylight'
  );
  id30W = insert30W.lastInsertRowid;
  console.log('Inserted 30W PRO Product ID:', id30W);
}

// Ensure variations for 30W
const vars30W = db.prepare("SELECT id FROM product_variations WHERE product_id = ?").all(id30W);
if (vars30W.length === 0) {
  db.prepare(`
    INSERT INTO product_variations (product_id, size, color, mrp, sale_price, stock, sku)
    VALUES (?, 'Studio Pro Edition', 'Matte Stealth Black', 10999, 7499, 140, 'XEV-GFL-30W-PRO')
  `).run(id30W);
}

console.log('Product seeding completed.');
