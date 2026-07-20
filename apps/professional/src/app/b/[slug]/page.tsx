import { BookingPageClient } from './BookingPageClient';

interface BookingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug } = await params;
  return <BookingPageClient slug={slug} />;
}
