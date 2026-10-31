CREATE TABLE `coupons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`description` text NOT NULL,
	`discount_type` text NOT NULL,
	`discount_value` real NOT NULL,
	`min_purchase_amount` real DEFAULT 0 NOT NULL,
	`cutoff_price` real,
	`target_type` text DEFAULT 'all' NOT NULL,
	`target_value` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
DROP INDEX "coupons_code_unique";--> statement-breakpoint
DROP INDEX "users_phone_number_unique";--> statement-breakpoint
ALTER TABLE `orders` ALTER COLUMN "status" TO "status" text DEFAULT 'payment_pending';--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_number_unique` ON `users` (`phone_number`);--> statement-breakpoint
ALTER TABLE `orders` ADD `coupon_code` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `discount_amount` real;--> statement-breakpoint
ALTER TABLE `orders` ADD `razorpay_order_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `razorpay_payment_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `razorpay_signature` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_status` text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` ADD `courier_service_name` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `courier_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `tracking_number` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `tracking_link` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `estimated_delivery_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_notes` text;--> statement-breakpoint
ALTER TABLE `products` ADD `specifications` text;