/**
 * Utility for parsing and validating administrative access.
 * Supports comma-separated admin phone numbers (ADMIN_NUMBERS)
 * and admin emails (ADMIN_EMAILS).
 */

export function getAdminPhones(): string[] {
  const envVal = process.env.ADMIN_NUMBERS || "";
  return envVal
    .split(",")
    .map((num) => num.replace(/\D/g, "").slice(-10)) // Normalizes to 10 digits
    .filter((num) => num.length === 10);
}

export function isAdminPhone(phone: string): boolean {
  if (!phone) return false;
  // Normalize the input phone number (strip country prefix +91 and non-digits, take last 10 digits)
  const normalizedInput = phone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
  const adminPhones = getAdminPhones();
  return adminPhones.includes(normalizedInput);
}

export function getAdminEmails(): string[] {
  const envVal = process.env.ADMIN_EMAILS || "";
  return envVal
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const adminEmails = getAdminEmails();
  return adminEmails.includes(normalized);
}

export function isAuthorizedAdmin(identifier: { email?: string | null; phone?: string | null }): boolean {
  if (identifier.email && isAdminEmail(identifier.email)) return true;
  if (identifier.phone && isAdminPhone(identifier.phone)) return true;
  return false;
}
