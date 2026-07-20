/** Normaliza entrada comum (BR) para E.164 exigido pelo domínio. */
export function normalizePhoneToE164(input: string): string {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (trimmed.startsWith('+')) {
    return `+${digits}`;
  }

  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits}`;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  return `+${digits}`;
}

export function formatPhoneDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, '');

  if (digits.startsWith('55') && digits.length >= 12) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);
    if (rest.length === 9) {
      return `+55 ${ddd} ${rest.slice(0, 5)}-${rest.slice(5)}`;
    }
    if (rest.length === 8) {
      return `+55 ${ddd} ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
  }

  return e164;
}

export function phoneMatchesQuery(phoneNumber: string, query: string): boolean {
  const phoneDigits = phoneNumber.replace(/\D/g, '');
  const queryDigits = query.replace(/\D/g, '');
  if (queryDigits.length > 0) {
    return phoneDigits.includes(queryDigits);
  }
  return phoneNumber.toLowerCase().includes(query.toLowerCase());
}
