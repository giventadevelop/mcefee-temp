import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { fetchFeaturedEventsForHomepageServer } from '@/lib/homepage/fetchFeaturedEventsServer';
import {
  fetchHomepageListingEventsServer,
  fetchHomepageSponsorsServer,
  fetchHomepageTeamServer,
} from '@/lib/homepage/fetchHomepageDirectoryServer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Home | MCEFEE' },
  description:
    'The Malayali Cultural Exchange Foundation for Education and Events in New Jersey. Cultural programs, education, and community events.',
  keywords: ['MCEFEE', 'Malayali', 'Kerala culture', 'New Jersey', 'events'],
};

export default async function HomePage() {
  const [initialFeaturedEvents, listing, initialTeam, initialSponsors] = await Promise.all([
    fetchFeaturedEventsForHomepageServer(),
    fetchHomepageListingEventsServer(),
    fetchHomepageTeamServer(),
    fetchHomepageSponsorsServer(),
  ]);
  return (
    <HomePageClient
      initialFeaturedEvents={initialFeaturedEvents}
      initialListingEvents={listing.events}
      initialListingIsUpcoming={listing.isUpcoming}
      initialTeam={initialTeam}
      initialSponsors={initialSponsors}
    />
  );
}
