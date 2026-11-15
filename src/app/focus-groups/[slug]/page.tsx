import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { getAppUrl, getAppUrlFromRequestHeaders } from '@/lib/env';
import { fetchUserProfileServer } from '@/app/profile/ApiServerActions';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';
import subpageStyles from '@/components/SubpageHomeDesign.module.css';
import { parseFocusGroupDescription } from '@/lib/focusGroupExtras';
import FocusGroupJoinLeave from './FocusGroupJoinLeave';
import FocusGroupGuestInterestForm from './FocusGroupGuestInterestForm';
import {
  fetchFocusGroupEventsServer,
  fetchFocusGroupGalleryMediaServer,
  fetchFocusGroupMemberCountServer,
  fetchFocusGroupMembersPublicServer,
} from './FocusGroupDetailApiServerActions';

async function fetchGroup(baseUrl: string, slug: string) {
  try {
    const res = await fetch(
      `${baseUrl}/api/proxy/focus-groups?slug.equals=${encodeURIComponent(slug)}&size=1`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

/** Fetch current user's membership for this focus group, if any. */
async function fetchMyMembership(baseUrl: string, focusGroupId: number, userProfileId: number) {
  try {
    const res = await fetch(
      `${baseUrl}/api/proxy/focus-group-members?focusGroupId.equals=${focusGroupId}&userProfileId.equals=${userProfileId}&size=1`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    return list.length > 0 ? list[0] : null;
  } catch {
    return null;
  }
}

/** Fetch members with role EXECUTIVE or ORGANISER (committee / contact organisers). */
async function fetchCommitteeMembers(baseUrl: string, focusGroupId: number) {
  try {
    const res = await fetch(
      `${baseUrl}/api/proxy/focus-group-members?focusGroupId.equals=${focusGroupId}&role.in=EXECUTIVE&role.in=ORGANISER&size=50`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchUserProfileById(baseUrl: string, id: number) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/user-profiles/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.id ? data : null;
  } catch {
    return null;
  }
}

type PageParams = Promise<{ slug: string }> | { slug: string };

async function resolveSlug(params: PageParams): Promise<string> {
  const resolved =
    typeof (params as Promise<{ slug: string }>).then === 'function'
      ? await (params as Promise<{ slug: string }>)
      : (params as { slug: string });
  return typeof resolved.slug === 'string'
    ? resolved.slug
    : Array.isArray(resolved.slug)
      ? resolved.slug[0]
      : '';
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const slug = await resolveSlug(params);
  const baseUrl = getAppUrl();
  const group = await fetchGroup(baseUrl, slug);
  if (!group) {
    return { title: 'Focus Group' };
  }
  const { description } = parseFocusGroupDescription(group.description);
  const title = group.name || 'Focus Group';
  const desc =
    description?.slice(0, 160) ||
    `Join ${title} — community focus group events, meetings, and updates.`;
  const cover =
    typeof group.coverImageUrl === 'string' && group.coverImageUrl.trim()
      ? group.coverImageUrl.trim()
      : undefined;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      ...(cover ? { images: [{ url: cover }] } : {}),
      type: 'website',
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title,
      description: desc,
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

export default async function FocusGroupDetailPage({ params }: { params: PageParams }) {
  const slug = await resolveSlug(params);
  const baseUrl = await getAppUrlFromRequestHeaders();
  const group = await fetchGroup(baseUrl, slug);

  const { description: publicDescription, extras } = parseFocusGroupDescription(group?.description);
  const events = group?.id ? await fetchFocusGroupEventsServer(group.id) : [];
  const memberCount = group?.id ? await fetchFocusGroupMemberCountServer(group.id) : 0;
  const galleryMedia = group?.id ? await fetchFocusGroupGalleryMediaServer(group.id) : [];

  const { userId } = await auth();
  const profile = userId ? await fetchUserProfileServer(userId) : null;
  const isLoggedIn = !!userId;
  const myMembership =
    group?.id && profile?.id ? await fetchMyMembership(baseUrl, group.id, profile.id) : null;
  const isMember = !!myMembership && (myMembership.status === 'ACTIVE' || !myMembership.status);
  const membershipId = myMembership?.id ?? null;

  const showMemberGallery = extras.showMemberGalleryPublic === true || isMember;
  const memberGallery =
    showMemberGallery && group?.id ? await fetchFocusGroupMembersPublicServer(group.id) : [];

  const committeeRaw = group?.id ? await fetchCommitteeMembers(baseUrl, group.id) : [];
  const committeeWithProfiles = await Promise.all(
    committeeRaw.map(async (m: { userProfileId?: number; id?: number; role?: string }, idx: number) => {
      const userProfileId = m?.userProfileId ?? (m as { user_profile_id?: number }).user_profile_id;
      const profileData = userProfileId ? await fetchUserProfileById(baseUrl, userProfileId) : null;
      const first =
        (profileData as { firstName?: string })?.firstName ??
        (profileData as { first_name?: string })?.first_name ??
        '';
      const last =
        (profileData as { lastName?: string })?.lastName ??
        (profileData as { last_name?: string })?.last_name ??
        '';
      const email = (profileData as { email?: string })?.email ?? '';
      const name = profileData
        ? [first, last].filter(Boolean).join(' ') || email || 'Organiser'
        : 'Organiser';
      return {
        ...m,
        displayName: name,
        email: isMember ? email : '',
        role: m?.role,
        _idx: idx,
      };
    }),
  );

  const coverUrl =
    typeof group?.coverImageUrl === 'string' && group.coverImageUrl.trim()
      ? group.coverImageUrl.trim()
      : null;
  const groupName = group?.name || 'Focus Group';

  // Cover first, then FG + linked-event public media (deduped by URL)
  const galleryItems: Array<{
    id?: number;
    fileUrl?: string;
    title?: string;
    description?: string;
    altText?: string;
  }> = [];
  if (coverUrl) {
    galleryItems.push({
      fileUrl: coverUrl,
      title: `${groupName} cover`,
      altText: `${groupName} cover`,
    });
  }
  for (const item of galleryMedia) {
    if (!item.fileUrl || item.fileUrl === coverUrl) continue;
    galleryItems.push(item);
  }

  return (
    <>
      <SubpageHomeDesignBackground bodyClass="focus-groups-page-background" />

      <div
        className={`${subpageStyles.subpageRoot} home-page-layout relative z-[1] min-h-screen w-full overflow-x-hidden`}
      >
        <section className="mh-event-detail-hero" aria-label={`${groupName} cover`}>
          {coverUrl ? (
            <>
              <div className="mh-event-detail-hero-bg" aria-hidden>
                <Image
                  src={coverUrl}
                  alt=""
                  fill
                  className="object-cover"
                  style={{ filter: 'blur(28px) brightness(0.85)', transform: 'scale(1.08)' }}
                  priority
                  sizes="100vw"
                />
              </div>
              <div className="mh-event-detail-hero-scrim" aria-hidden />
              <figure className="mh-event-detail-hero-figure">
                <Image
                  src={coverUrl}
                  alt={`${groupName} cover`}
                  width={1600}
                  height={960}
                  className="mh-event-detail-hero-img"
                  sizes="100vw"
                  priority
                />
              </figure>
            </>
          ) : (
            <div className="flex w-full items-center justify-center aspect-[5/3] max-h-[420px] bg-black/40">
              <span className={`${subpageStyles.emptyStateText} text-sm`}>No cover image</span>
            </div>
          )}
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12">
            <div className="text-center sm:text-left mb-4 sm:mb-6">
              <HomeSectionTitle text={groupName} className="mb-3 !text-3xl md:!text-4xl" />
              <p className="text-sm text-gray-500 mb-3">
                {memberCount === 1 ? '1 member' : `${memberCount} members`}
              </p>
              <p className="text-base leading-relaxed text-gray-600 max-w-3xl mx-auto sm:mx-0 whitespace-pre-wrap">
                {publicDescription || 'Details coming soon.'}
              </p>
            </div>
            {group?.id && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <FocusGroupJoinLeave
                    focusGroupId={group.id}
                    isLoggedIn={isLoggedIn}
                    isMember={isMember}
                    membershipId={membershipId}
                    membershipStatus={myMembership?.status ?? null}
                    groupName={groupName}
                    redirectUrl={`/focus-groups/${slug}`}
                  />
                </div>
                {!isLoggedIn && (
                  <FocusGroupGuestInterestForm focusGroupId={group.id} groupName={groupName} />
                )}
              </div>
            )}
          </div>

          {extras.announcements?.trim() && (
            <section className="mb-8 sm:mb-12" aria-label="Announcements">
              <HomeSectionTitle text="Announcements" className="mb-4 sm:mb-6" />
              <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 sm:p-8">
                <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {extras.announcements}
                </p>
              </div>
            </section>
          )}

          {extras.meetingSchedule?.trim() && (
            <section className="mb-8 sm:mb-12" aria-label="Meeting schedule">
              <HomeSectionTitle text="Meeting Schedule" className="mb-4 sm:mb-6" />
              <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 sm:p-8">
                <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {extras.meetingSchedule}
                </p>
              </div>
            </section>
          )}

          <section className="mb-8 sm:mb-12" aria-label="Contact organisers">
            <HomeSectionTitle text="Contact Organisers" className="mb-4 sm:mb-6" />
            <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 sm:p-8">
              {committeeWithProfiles.length > 0 ? (
                <ul className="space-y-3" role="list">
                  {committeeWithProfiles.map(
                    (m: {
                      id?: number;
                      _idx?: number;
                      displayName: string;
                      role?: string;
                      email?: string;
                    }) => (
                      <li
                        key={m.id ?? m._idx ?? 0}
                        className="flex flex-wrap items-center gap-3 text-sm text-gray-700"
                      >
                        <span className="font-medium text-gray-900">{m.displayName}</span>
                        {m.role && (
                          <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-medium">
                            {m.role}
                          </span>
                        )}
                        {m.email && (
                          <a
                            href={`mailto:${m.email}`}
                            className="text-indigo-700 hover:underline"
                          >
                            {m.email}
                          </a>
                        )}
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">
                  Organisers have not been listed yet. Join the group or check back later.
                </p>
              )}
            </div>
          </section>

          <section className="mb-8 sm:mb-12" aria-label="Upcoming Events">
            <HomeSectionTitle text="Upcoming Events" className="mb-4 sm:mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {events.map(
                (e: {
                  id?: number | null;
                  title?: string;
                  startDate?: string;
                  startTime?: string;
                  caption?: string;
                  description?: string;
                }) =>
                  e.id != null ? (
                    <Link
                      key={e.id}
                      href={`/events/${e.id}`}
                      className="homepage-glass-card services-glass-card-face group flex h-full flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                      title={e.title}
                      aria-label={e.title ? `View event ${e.title}` : 'View event'}
                    >
                      <div className="text-sm font-medium text-indigo-600 truncate">
                        {[e.startDate, e.startTime].filter(Boolean).join(' • ')}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-purple-700">
                        {e.title}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {e.caption || e.description || ''}
                      </div>
                    </Link>
                  ) : null,
              )}
              {events.length === 0 && (
                <div className="col-span-full homepage-glass-card services-glass-card-face rounded-2xl p-10 text-center">
                  <p className="text-sm text-gray-600">
                    No upcoming events linked to this focus group yet.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="mb-8 sm:mb-12" aria-label="Members">
            <HomeSectionTitle text="Members" className="mb-4 sm:mb-6" />
            <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 sm:p-8">
              <p className="text-sm text-gray-600 mb-4">
                {memberCount === 1 ? '1 public member' : `${memberCount} public members`}
                {!showMemberGallery && memberCount > 0 && (
                  <span className="block mt-1 text-gray-500">
                    Member gallery is private — join the group to see names and photos.
                  </span>
                )}
              </p>
              {showMemberGallery && memberGallery.length > 0 && (
                <ul
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                  role="list"
                >
                  {memberGallery.map((m) => (
                    <li key={m.membershipId || m.userProfileId} className="text-center">
                      <div className="mx-auto w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mb-2">
                        {m.imageUrl ? (
                          <Image
                            src={m.imageUrl}
                            alt=""
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-lg font-semibold text-gray-500">
                            {m.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {m.displayName}
                      </div>
                      {m.role && m.role !== 'MEMBER' && (
                        <div className="text-[10px] text-blue-600 mt-0.5">{m.role}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="mb-8 sm:mb-12" aria-label="Gallery">
            <HomeSectionTitle text="Gallery" className="mb-4 sm:mb-6" />
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background via-muted to-background border border-border/30 sacred-shadow-lg">
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at top left, rgba(139, 125, 107, 0.08), transparent 55%)',
                }}
              />
              <div className="relative px-6 py-10 sm:px-10 lg:px-14">
                {galleryItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {galleryItems.map((item, idx) => (
                      <div
                        key={item.id ?? item.fileUrl ?? idx}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                      >
                        <div className="relative w-full h-auto aspect-[4/3] overflow-hidden bg-gray-100">
                          {item.fileUrl && (
                            <Image
                              src={item.fileUrl}
                              alt={item.altText || item.title || `${groupName} gallery image`}
                              width={600}
                              height={450}
                              className="w-full h-full object-cover"
                              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                            />
                          )}
                        </div>
                        {(item.title || item.description) && (
                          <div className="p-3">
                            {item.title && (
                              <h3 className="font-semibold text-sm truncate text-gray-900">
                                {item.title}
                              </h3>
                            )}
                            {item.description && (
                              <p className="text-gray-600 text-xs line-clamp-2 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-600">
                      No gallery images yet. Link events to this focus group and upload public media
                      (or FG-tagged media) to populate this section.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
