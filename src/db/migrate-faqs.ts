import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Migrating FAQs table...");
  try {
    await db.run(sql.raw(`
      CREATE TABLE IF NOT EXISTS "faqs" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "display_order" INTEGER NOT NULL DEFAULT 0,
        "created_at" TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `));
    console.log("FAQs table successfully migrated!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main().then(() => process.exit(0));
