import { BookingPageClient } from './BookingPageClient';

/** Placeholder para static export; slug real vem da URL via rewrite do Hosting. */
export function generateStaticParams() {
  return [{ slug: '_' }];
}

export default function BookingPage() {
  return <BookingPageClient />;
}
