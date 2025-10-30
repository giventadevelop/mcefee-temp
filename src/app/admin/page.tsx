'use client';
import { EventDetailsDTO, EventTypeDetailsDTO, UserProfileDTO, EventCalendarEntryDTO } from '@/types';
import React, { useState, useEffect } from 'react';
import { EventList } from '@/components/EventList';
import { useAuth } from "@clerk/nextjs";
import { FaUsers, FaCalendarAlt, FaPlus, FaEnvelope, FaCreditCard } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import Image from 'next/image';
import {
  fetchEventsFilteredServer,
  fetchEventTypesServer,
  fetchCalendarEventsServer,
  cancelEventServer,
  deleteCalendarEventForEventServer,
} from './ApiServerActions';


export default function AdminPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<EventCalendarEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  // Search/filter state
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCaption, setSearchCaption] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchAdmissionType, setSearchAdmissionType] = useState('');
  const [sort, setSort] = useState('startDate,asc');
  const [searchField, setSearchField] = useState<'title' | 'id' | 'caption'>('title');
  const [searchId, setSearchId] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);

  async function loadAll(pageNum = 0) {
    setLoading(true);
    setError(null);
    try {
      // Build date filtering based on toggle
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const filterParams: any = {
        admissionType: searchAdmissionType,
        sort: showPastEvents ? 'startDate,desc' : 'startDate,asc', // Override sort based on toggle
        pageNum,
        pageSize,
      };

      // Apply date filtering based on toggle
      if (showPastEvents) {
        // Show events that ended before today
        filterParams.endDate = today;
      } else {
        // Show events that start today or later (future events including today)
        filterParams.startDate = today;
      }

      // Override with manual date filters if provided
      if (searchStartDate) filterParams.startDate = searchStartDate;
      if (searchEndDate) filterParams.endDate = searchEndDate;

      if (searchField === 'title') filterParams.title = searchTitle;
      else if (searchField === 'id') filterParams.id = searchId;
      else if (searchField === 'caption') filterParams.caption = searchCaption;
      const { events: eventsResult, totalCount: fetchedTotalCount } = await fetchEventsFilteredServer(filterParams);
      const types = await fetchEventTypesServer();
      const calendarEventsResult = await fetchCalendarEventsServer();
      setEvents(eventsResult);
      setTotalCount(fetchedTotalCount);
      setEventTypes(types);
      setCalendarEvents(calendarEventsResult);
    } catch (e: any) {
      setError(e.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTitle, searchId, searchCaption, searchField, searchStartDate, searchEndDate, searchAdmissionType, sort, showPastEvents]);

  async function handleCancel(event: EventDetailsDTO) {
    setLoading(true);
    setError(null);
    try {
      await cancelEventServer(event);
      try {
        await deleteCalendarEventForEventServer(event);
      } catch (calendarErr) {
        setError((prev) => (prev ? prev + '\\n' : '') + (calendarErr instanceof Error ? calendarErr.message : String(calendarErr)));
      }
      await loadAll(page);
    } catch (e: any) {
      setError(e.message || 'Failed to cancel event');
    } finally {
      setLoading(false);
    }
  }

  // Pagination controls
  function handlePrevPage() {
    setPage((p) => Math.max(0, p - 1));
  }
  function handleNextPage() {
    setPage((p) => p + 1);
  }

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Event Management</h1>
      <AdminNavigation />


      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="text-lg font-semibold text-blue-800 mb-4">Search Events</div>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold mb-1">Search By</label>
              <select className="border px-3 py-2 rounded w-40" value={searchField} onChange={e => setSearchField(e.target.value as 'title' | 'id' | 'caption')}>
                <option value="title">Title</option>
                <option value="id">ID</option>
                <option value="caption">Caption</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">{searchField === 'id' ? 'Event ID' : searchField.charAt(0).toUpperCase() + searchField.slice(1)}</label>
              <input
                type={searchField === 'id' ? 'number' : 'text'}
                className="border px-3 py-2 rounded w-48"
                value={searchField === 'title' ? searchTitle : searchField === 'id' ? searchId : searchCaption}
                onChange={e => {
                  if (searchField === 'title') setSearchTitle(e.target.value);
                  else if (searchField === 'id') setSearchId(e.target.value);
                  else setSearchCaption(e.target.value);
                }}
                placeholder={`Search by ${searchField === 'id' ? 'ID' : searchField}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Start Date (from)</label>
              <input type="date" className="border px-3 py-2 rounded w-40" value={searchStartDate} onChange={e => setSearchStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">End Date (to)</label>
              <input type="date" className="border px-3 py-2 rounded w-40" value={searchEndDate} onChange={e => setSearchEndDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Admission Type</label>
              <select className="border px-3 py-2 rounded w-40" value={searchAdmissionType} onChange={e => setSearchAdmissionType(e.target.value)}>
                <option value="">All</option>
                <option value="FREE">Free</option>
                <option value="TICKETED">Ticketed</option>
                <option value="INVITATION_ONLY">Invitation Only</option>
                <option value="DONATION_BASED">Donation Based</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Sort By</label>
              <select className="border px-3 py-2 rounded w-56" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="startDate,asc">Start Date (Earliest)</option>
                <option value="startDate,desc">Start Date (Latest)</option>
                <option value="title,asc">Title (A-Z)</option>
                <option value="title,desc">Title (Z-A)</option>
              </select>
            </div>
            <button className="ml-auto px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold" onClick={() => {
              setSearchTitle('');
              setSearchId('');
              setSearchCaption('');
              setSearchStartDate('');
              setSearchEndDate('');
              setSearchAdmissionType('');
              setSort('startDate,asc');
              setShowPastEvents(false); // Reset to future events
            }}>Clear</button>
          </div>
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <Link
          href="/admin/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow font-bold flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FaPlus />
          Create Event
        </Link>
      </div>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}

      {/* Event Filter Toggle - Above Event List */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex justify-center items-center gap-4 mb-2">
            <span className={`text-lg font-medium ${!showPastEvents ? 'text-blue-600' : 'text-gray-500'}`}>
              Future Events
            </span>
            <button
              onClick={() => {
                setShowPastEvents(!showPastEvents);
                setPage(0); // Reset to first page when switching
              }}
              className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: showPastEvents ? '#3b82f6' : '#d1d5db' }}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${showPastEvents ? 'translate-x-7' : 'translate-x-1'
                  }`}
              />
            </button>
            <span className={`text-lg font-medium ${showPastEvents ? 'text-blue-600' : 'text-gray-500'}`}>
              Past Events
            </span>
          </div>

          {/* Filter Description */}
          <p className="text-gray-600 text-sm text-center">
            {showPastEvents
              ? 'Showing past events (events that have already ended)'
              : 'Showing future events (including events happening today)'
            }
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {showPastEvents ? 'Past Events' : 'Future Events'}
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <EventList
            events={events}
            eventTypes={eventTypes}
            calendarEvents={calendarEvents}
            onEdit={event => router.push(`/admin/events/${event.id}/edit`)}
            onCancel={handleCancel}
            loading={loading}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            page={page + 1}
            totalCount={totalCount}
            pageSize={pageSize}
            boldEventIdLabel={true}
            showDetailsOnHover={true}
          />
        </div>
      </div>
    </div>
  );
}