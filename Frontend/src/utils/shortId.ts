// Convert UUID to a shorter base62 string
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function shortenUuid(uuid: string | null | undefined): string {
  if (!uuid) return '';
  
  // Validate UUID format
  if (!/^[0-9a-fA-F-]{36}$/.test(uuid)) return uuid;
  
  // Remove hyphens from UUID
  const cleanUuid = uuid.replace(/-/g, '');
  
  // Convert hex to decimal
  let decimal = BigInt('0x' + cleanUuid);
  
  // Convert to base62
  let shortId = '';
  while (decimal > 0n) {
    const remainder = Number(decimal % 62n);
    shortId = ALPHABET[remainder] + shortId;
    decimal = decimal / 62n;
  }
  
  // Pad with leading zeros if necessary to maintain consistent length
  while (shortId.length < 22) {
    shortId = '0' + shortId;
  }
  
  return shortId;
}

export function isValidShortId(id: string): boolean {
  return /^[0-9A-Za-z]{22}$/.test(id);
}

// Example:
// UUID: b44a3bf1-c7fe-4785-bfcd-b4112bcd8dc5
// ShortId: 4r9bKP2mL8hN3vX7tY5wJs
