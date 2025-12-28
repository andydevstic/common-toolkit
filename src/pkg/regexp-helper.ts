export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const TRASH_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "10minutemail.net",
  "guerrillamail.com",
  "guerrillamail.net",
  "dispostable.com",
  "yopmail.com",
  "yopmail.net",
  "yopmail.fr",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "getnada.com",
  "maildrop.cc",
  "fakeinbox.com",
  "trashmail.com",
  "mintemail.com",
  "emailondeck.com",
]);

export function isValidEmail(
  email: string,
  options?: {
    allowTrashEmail?: boolean;
  }
): boolean {
  if (!EMAIL_REGEX.test(email)) {
    return false;
  }

  if (options?.allowTrashEmail) {
    return true;
  }

  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    return false;
  }

  // Block exact domain and subdomains
  for (const trashDomain of TRASH_EMAIL_DOMAINS) {
    if (domain === trashDomain || domain.endsWith(`.${trashDomain}`)) {
      return false;
    }
  }

  return true;
}
