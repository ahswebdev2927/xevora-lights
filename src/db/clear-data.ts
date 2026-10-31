import { db } from "./index";
import { 
  products, 
  productVariations, 
  navigationMenu, 
  pageSections, 
  homepageCategories, 
  cartItems, 
  orders, 
  orderItems, 
  wishlists, 
  events, 
  eventRegistrations, 
  coupons, 
  offerBanners, 
  users, 
  siteSettings 
} from "./schema";
import { notInArray } from "drizzle-orm";

async function clearData() {
  console.log("Cleaning database data (removing all items except admin users)...");

  try {
    // 1. Delete relations/child tables first to satisfy foreign key constraints
    await db.delete(productVariations);
    await db.delete(orderItems);
    await db.delete(cartItems);
    await db.delete(wishlists);
    await db.delete(eventRegistrations);

    // 2. Delete main entity tables
    await db.delete(products);
    await db.delete(navigationMenu);
    await db.delete(pageSections);
    await db.delete(homepageCategories);
    await db.delete(orders);
    await db.delete(events);
    await db.delete(coupons);
    await db.delete(offerBanners);

    // 3. Reset homepage_banner setting
    await db.delete(siteSettings);

    // 4. Delete users EXCEPT system administrators
    await db.delete(users).where(
      notInArray(users.phoneNumber, ["9999999999", "9876543210"])
    );

    console.log("Wipe complete! All products, categories, navigation items, orders, coupons, events and non-admin users have been successfully cleared.");
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
}

clearData();
