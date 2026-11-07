const path = require('path');
const { createClient } = require('@libsql/client');

const dbPath = path.join(__dirname, '..', 'sqlite.db');
const client = createClient({ url: `file:${dbPath}` });

async function setupInitialData() {
  // 1. Update Product 14 (10W RGB) as Hero Slot 1
  await client.execute({
    sql: `UPDATE products SET 
      homepage_slot = 'slot_1', 
      is_featured = 1,
      mrp = 7999, 
      base_price = 4999, 
      sale_price = 4999, 
      stock = 25, 
      product_type = 'main_product',
      sku = 'XEV-GFL-10W'
      WHERE id = 14;`
  });

  // 2. Update Product 15 (PRO 30W) as Hero Slot 2 (Flagship)
  await client.execute({
    sql: `UPDATE products SET 
      homepage_slot = 'slot_2', 
      is_featured = 1,
      mrp = 10999, 
      base_price = 7499, 
      sale_price = 7499, 
      stock = 18, 
      product_type = 'main_product',
      sku = 'XEV-GFL-30W'
      WHERE id = 15;`
  });

  // 3. Add a sample spare part if not already existing
  const existingPart = await client.execute("SELECT id FROM products WHERE name = 'Xevora 20-Piece Precision GOBO Filter Plates Set';");
  if (existingPart.rows.length === 0) {
    const specs = JSON.stringify({
      "Compatibility": "Xevora G-Flash 10W & PRO 30W Optical Barrels",
      "Material": "Laser-etched Heat-Resistant Stainless Alloy",
      "Patterns Included": "Venetian Blinds, Window Grids, Tree Canopies, Geometric Arches",
      "Diameter": "42 mm standard projection drop-in"
    });

    await client.execute({
      sql: `INSERT INTO products (name, description, base_price, sale_price, mrp, stock, sku, product_type, parent_product_id, category, specifications, is_active, avg_rating, num_reviews, images)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 4.9, 48, ?);`,
      args: [
        "Xevora 20-Piece Precision GOBO Filter Plates Set",
        "Full set of 20 laser-cut optical shadow projection discs. Transform any studio background into architectural windows, organic textures, and cinematic patterns.",
        1299,
        1299,
        1999,
        75,
        "XEV-ACC-GB20",
        "spare_part",
        15,
        "Spare Parts & Accessories",
        specs,
        JSON.stringify(["/images/landing/product-30w-pro.jpg"])
      ]
    });
    console.log("Seeded sample Spare Part: 20-Piece GOBO Filter Plates Set");
  }

  const res = await client.execute("SELECT id, name, product_type, homepage_slot, mrp, base_price, stock FROM products;");
  console.log("Updated products in DB:");
  console.table(res.rows);
}

setupInitialData();
