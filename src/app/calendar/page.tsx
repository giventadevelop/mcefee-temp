import Image from 'next/image';
import { fetchEventsForMonthServer } from './ApiServerActions';
import CalendarClient from './CalendarClient';
import CalendarPageBackground from './CalendarPageBackground';
import '@/styles/modernist-homepage.css';

export default async function CalendarPage({
  searchParams,
}: {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}) {
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<unknown>).then === 'function'
      ? await searchParams
      : searchParams;

  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;

  const dateParam = typeof resolvedSearchParams?.date === 'string' ? resolvedSearchParams.date : undefined;
  if (dateParam) {
    try {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        year = date.getFullYear();
        month = date.getMonth() + 1;
      }
    } catch {
      // Invalid date, use today
    }
  }

  const focusGroup = typeof resolvedSearchParams?.focusGroup === 'string' ? resolvedSearchParams?.focusGroup : undefined;
  const initialView = typeof resolvedSearchParams?.view === 'string' ? resolvedSearchParams.view : 'month';
  const initialDate = dateParam ? new Date(dateParam) : today;
  const initialEvents = await fetchEventsForMonthServer(year, month, focusGroup);

  return (
    <>
      <CalendarPageBackground />
      <main className="mh-events-page modernist-home mh-calendar-page">
        <section className="mh-events-hero" aria-label="Calendar">
          <figure className="mh-events-hero-media">
            <Image
              src="/images/mcefee_event/mcefee_ribbon_image_transparent.png"
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
              <span>MCEFEE schedule</span>
            </div>
            <h1>Event Calendar</h1>
            <p className="mh-events-hero-lede">
              Browse and explore upcoming events across all months.
            </p>
          </div>
        </section>

        <div className="mh-events-body">
          <CalendarClient
            initialEvents={initialEvents}
            initialYear={year}
            initialMonth={month}
            focusGroup={focusGroup}
            initialView={initialView as 'month' | 'week' | 'day'}
            initialDate={initialDate}
            homepageDesign
          />
        </div>
      </main>
    </>
  );
}
