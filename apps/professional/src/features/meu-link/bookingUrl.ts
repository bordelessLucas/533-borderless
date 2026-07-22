const PRODUCTION_BOOKING_ORIGIN = 'https://socio247.app';

export function getBookingOrigin(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? PRODUCTION_BOOKING_ORIGIN;
}

/** Origem estável para SSR / primeiro paint (evita mismatch de hidratação). */
export function getDefaultBookingOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? PRODUCTION_BOOKING_ORIGIN;
}

export function buildBookingLink(slug: string): string {
  return `${getBookingOrigin()}/b/${slug}`;
}

export function buildShareMessage(bookingLink: string, businessName?: string | null): string {
  const name = businessName?.trim();
  if (name) {
    return `Olá! Agende seu horário em ${name} por este link: ${bookingLink}`;
  }
  return `Olá! Agende seu horário por este link: ${bookingLink}`;
}

export function buildQrCodeImageUrl(bookingLink: string, size = 220): string {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: bookingLink,
    margin: '12',
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}
