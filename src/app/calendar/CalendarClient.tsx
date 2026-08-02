"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { CalendarEventDTO } from './ApiServerActions';
import { fetchEventsForMonthServer } from './ApiServerActions';
import { toCalendarEvents } from './utils/eventFormatters';
import { ViewSwitcher } from './components/ViewSwitcher';
import { CalendarPagination } from './components/CalendarPagination';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { useCalendarNav } from './hooks/useCalendarNav';
import { LiturgyViewSwitcher } from '@/app/mosc-redesign/(syro)/liturgical-calendar/components/LiturgyViewSwitcher';

export default function CalendarClient({
  initialEvents,
  initialYear,
  initialMonth,
  focusGroup,
  initialView = 'month',
  initialDate = new Date(),
  basePath = '/calendar',
  theme = 'default',
  homepageDesign = false,
}: {
  initialEvents: CalendarEventDTO[];
  initialYear: number;
  initialMonth: number;
  focusGroup?: string;
  initialView?: 'month' | 'week' | 'day';
  initialDate?: Date;
  /** Route base for view/date query navigation (e.g. /mosc-redesign/mosc-calendar) */
  basePath?: string;
  /** MOSC redesign shell — matches liturgical calendar Syro styling */
  theme?: 'default' | 'syro';
  /** Modernist design system (/calendar) — same shell as /events */
  homepageDesign?: boolean;
}) {
  const isSyro = theme === 'syro';
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState(toCalendarEvents(initialEvents));
  const [loading, setLoading] = useState(false);

  const urlView = (searchParams.get('view') as 'month' | 'week' | 'day' | null) || initialView;
  const urlDateStr = searchParams.get('date');

  let currentDate = initialDate;
  if (urlDateStr) {
    try {
      const [year, month, day] = urlDateStr.split('-').map(Number);
      if (year && month && day) {
        currentDate = new Date(year, month - 1, day);
      }
    } catch {
      // Invalid date, use initialDate
    }
  }

  if (isNaN(currentDate.getTime())) {
    currentDate = initialDate;
  }

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const nav = useCalendarNav(initialYear, initialMonth);

  useEffect(() => {
    if (urlView && urlView !== nav.view) {
      nav.setView(urlView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlView, searchParams]);

  useEffect(() => {
    if (urlView === 'day' || urlView === 'week') {
      if (currentYear !== nav.year || currentMonth !== nav.month) {
        nav.setYear(currentYear);
        nav.setMonth(currentMonth);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth, urlView, urlDateStr]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchEventsForMonthServer(nav.year, nav.month, focusGroup);
        setEvents(toCalendarEvents(data));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nav.year, nav.month, focusGroup]);

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    if ((newView === 'day' || newView === 'week') && !params.has('date')) {
      const today = new Date();
      params.set(
        'date',
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      );
    }
    router.push(`${basePath}?${params.toString()}`);
  };

  const handlePrev = () => {
    if (nav.view === 'day') {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
      router.push(`${basePath}?view=day&date=${dateStr}`);
    } else if (nav.view === 'week') {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 7);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
      router.push(`${basePath}?view=week&date=${dateStr}`);
    } else {
      nav.prev();
    }
  };

  const handleNext = () => {
    if (nav.view === 'day') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      router.push(`${basePath}?view=day&date=${dateStr}`);
    } else if (nav.view === 'week') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 7);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      router.push(`${basePath}?view=week&date=${dateStr}`);
    } else {
      nav.next();
    }
  };

  const handleToday = () => {
    const today = new Date();
    if (nav.view === 'day') {
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      router.push(`${basePath}?view=day&date=${dateStr}`);
    } else if (nav.view === 'week') {
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      router.push(`${basePath}?view=week&date=${dateStr}`);
    } else {
      nav.today();
    }
  };

  const displayView = urlView || nav.view;

  const periodLabel =
    displayView === 'day'
      ? currentDate.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : displayView === 'week'
        ? (() => {
            const weekStart = new Date(currentDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
          })()
        : new Date(nav.year, nav.month - 1, 1).toLocaleString(undefined, {
            month: 'long',
            year: 'numeric',
          });

  const todayLabel =
    displayView === 'week' ? 'This Week' : displayView === 'day' ? 'Today' : 'This Month';

  if (homepageDesign && !isSyro) {
    return (
      <div className="mh-calendar">
        <div className="mh-events-toolbar">
          <div className="mh-events-head">
            <h2>{periodLabel}</h2>
            <div className="mh-calendar-nav" role="group" aria-label="Calendar navigation">
              <button
                type="button"
                onClick={handlePrev}
                className="mh-btn mh-btn-readmore"
                title="Previous"
                aria-label="Previous"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="mh-btn mh-btn-calendar"
                title={todayLabel}
                aria-label={todayLabel}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{todayLabel}</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="mh-btn mh-btn-readmore"
                title="Next"
                aria-label="Next"
              >
                <span>Next</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <p className="mh-events-hint">Switch between month, week, and day to explore the schedule.</p>
          <ViewSwitcher view={displayView} onChange={handleViewChange} homepageDesign />
        </div>

        {loading ? (
          <div className="mh-events-loading">Loading events…</div>
        ) : (
          <>
            {displayView === 'month' && (
              <MonthView
                events={events}
                year={nav.year}
                month={nav.month}
                theme={theme}
                calendarBasePath={basePath}
                homepageDesign
              />
            )}
            {displayView === 'week' && (
              <WeekView
                events={events}
                anchorDate={currentDate}
                theme={theme}
                calendarBasePath={basePath}
                homepageDesign
              />
            )}
            {displayView === 'day' && (
              <DayView events={events} date={currentDate} theme={theme} homepageDesign />
            )}
          </>
        )}

        <CalendarPagination
          totalCount={events.length}
          onPrevMonth={handlePrev}
          onNextMonth={handleNext}
          view={displayView}
          theme={theme}
          homepageDesign
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div
          className={`text-lg sm:text-xl font-bold ${
            isSyro ? 'text-syro-blue font-syro-display' : 'text-gray-900'
          }`}
        >
          {periodLabel}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrev}
            className={
              isSyro
                ? 'flex items-center gap-2 px-3 py-2 bg-[#f0f4f8] hover:bg-[#e2e8f0] text-syro-blue rounded-lg shadow-sm transition-all duration-300 hover:scale-105'
                : 'flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shadow-md transition-all duration-300 hover:scale-105'
            }
            title="Previous"
            aria-label="Previous"
            type="button"
          >
            {!isSyro && (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            )}
            {isSyro && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            )}
            <span className="hidden sm:inline font-semibold">Previous</span>
          </button>

          <button
            onClick={handleToday}
            className={
              isSyro
                ? 'flex items-center gap-2 px-3 py-2 bg-syro-red/10 hover:bg-syro-red/20 text-syro-red rounded-lg shadow-sm transition-all duration-300 hover:scale-105'
                : 'flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-md transition-all duration-300 hover:scale-105'
            }
            title={todayLabel}
            aria-label={todayLabel}
            type="button"
          >
            {!isSyro && (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {isSyro && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            <span className="hidden sm:inline font-semibold">
              {displayView === 'week' ? 'This Week' : 'Today'}
            </span>
          </button>

          <button
            onClick={handleNext}
            className={
              isSyro
                ? 'flex items-center gap-2 px-3 py-2 bg-[#f0f4f8] hover:bg-[#e2e8f0] text-syro-blue rounded-lg shadow-sm transition-all duration-300 hover:scale-105'
                : 'flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg shadow-md transition-all duration-300 hover:scale-105'
            }
            title="Next"
            aria-label="Next"
            type="button"
          >
            <span className="hidden sm:inline font-semibold">Next</span>
            {!isSyro && (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
            {isSyro && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isSyro ? (
        <LiturgyViewSwitcher view={displayView} onChange={handleViewChange} />
      ) : (
        <ViewSwitcher view={displayView} onChange={handleViewChange} />
      )}

      {isSyro && !loading && events.length === 0 && displayView === 'month' && (
        <div className="inline-flex items-center gap-2 px-4 py-3 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm mb-4">
          <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-orange-700 font-syro-primary">
            No events found for this month. Try another month or check that events are published for your
            tenant.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <svg
              className={`animate-spin w-6 h-6 ${isSyro ? 'text-syro-red' : 'text-indigo-600'}`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span
              className={`text-sm font-medium ${
                isSyro ? 'text-[#798daf] font-syro-primary' : 'text-gray-600'
              }`}
            >
              Loading events...
            </span>
          </div>
        </div>
      ) : (
        <>
          {displayView === 'month' && (
            <MonthView events={events} year={nav.year} month={nav.month} theme={theme} calendarBasePath={basePath} />
          )}
          {displayView === 'week' && (
            <WeekView events={events} anchorDate={currentDate} theme={theme} calendarBasePath={basePath} />
          )}
          {displayView === 'day' && <DayView events={events} date={currentDate} theme={theme} />}
        </>
      )}

      <CalendarPagination
        totalCount={events.length}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
        view={displayView}
        theme={theme}
        homepageDesign={homepageDesign}
      />
    </div>
  );
}
