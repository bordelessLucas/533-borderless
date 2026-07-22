import { Linking } from 'react-native';

export function digitsOnlyPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function openWhatsApp(phone: string, message: string): Promise<void> {
  const digits = digitsOnlyPhone(phone);
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  return Linking.openURL(url).then(() => undefined);
}

export function formatMoneyBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function todayLongLabel(date = new Date()): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
