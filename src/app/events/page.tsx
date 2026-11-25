import type { Metadata } from 'next';
import EventsPageClient from './EventsPageClient';
import { fetchEventsListPageServer } from '@/lib/homepage/fetchHomepageDirectoryServer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Current and upcoming events from the Malayali Cultural Exchange Foundation for Education and Events.',
};

export default async function EventsPage() {
  const initialEvents = await fetchEventsListPageServer();
  return <EventsPageClient initialEvents={initialEvents} />;
}
