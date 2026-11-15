import Image from 'next/image';
import { getAppUrlFromRequestHeaders } from '@/lib/env';
import FocusGroupsGridWithSearch from './FocusGroupsGridWithSearch';
import FocusGroupsPageBackground from './FocusGroupsPageBackground';

async function fetchEventsForGroup(baseUrl: string, groupId: number) {
  try {
    const res = await fetch(
      `${baseUrl}/api/proxy/event-details?focusGroupId.equals=${groupId}&isActive.equals=true&sort=startDate,asc&size=3`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function FocusGroupsPage() {
  const baseUrl = await getAppUrlFromRequestHeaders();
  const sort = 'name,asc';
  const size = 50;

  let groups: any[] = [];
  let total = 0;
  try {
    const res = await fetch(
      `${baseUrl}/api/proxy/focus-groups?isActive.equals=true&page=0&size=${size}&sort=${encodeURIComponent(sort)}`,
      {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (res.ok) {
      const data = await res.json();
      groups = Array.isArray(data) ? data : [];
      total = Number(res.headers.get('x-total-count') || groups.length || 0);
    }
  } catch {
    /* leave empty */
  }

  const groupsWithEvents = await Promise.all(
    groups.map(async (group) => {
      const events = group?.id ? await fetchEventsForGroup(baseUrl, group.id) : [];
      return { ...group, events };
    }),
  );

  return (
    <>
      <FocusGroupsPageBackground />
      <main className="mh-events-page modernist-home mh-focus-groups-page">
        <section className="mh-events-hero" aria-label="Focus Groups">
          <figure className="mh-events-hero-media mh-grayscale">
            <Image
              src="/images/default_placeholder_hero_image.jpeg"
              alt=""
              fill
              priority
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          </figure>
          <div className="mh-events-hero-scrim" aria-hidden="true" />
          <div className="mh-events-hero-content">
            <div className="mh-events-hero-kicker">
              <span className="mh-dot" aria-hidden="true" />
              <span>Community circles</span>
            </div>
            <h1>Focus Groups</h1>
            <p className="mh-events-hero-lede">
              Explore our specialized groups and their upcoming activities.
            </p>
          </div>
        </section>

        <div className="mh-events-body">
          <FocusGroupsGridWithSearch groups={groupsWithEvents} total={total} />
        </div>
      </main>
    </>
  );
}
