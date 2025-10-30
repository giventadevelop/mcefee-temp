'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EventForm } from '@/components/EventForm';
import type { EventDetailsDTO, EventTypeDetailsDTO } from '@/types';
import Link from 'next/link';
import { FaUsers, FaPhotoVideo, FaCalendarAlt, FaTags, FaTicketAlt, FaHome, FaMicrophone, FaAddressBook, FaHandshake, FaEnvelope, FaUserTie } from 'react-icons/fa';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;
  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/proxy/event-details/${eventId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setEvent(data));
    fetch('/api/proxy/event-type-details')
      .then(res => res.ok ? res.json() : [])
      .then(data => setEventTypes(Array.isArray(data) ? data : []));
  }, [eventId]);

  async function handleSubmit(updatedEvent: EventDetailsDTO) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/event-details/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
      if (!res.ok) throw new Error('Failed to update event');
      router.push('/admin');
    } catch (e: any) {
      setError(e.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  }

  if (!event) return <div className="p-8">Loading event details...</div>;

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto" style={{ paddingTop: '118px' }}>
      {/* Dashboard Card with Grid Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Link href="/admin" className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg shadow-sm px-4 py-4 transition font-semibold text-sm">
              <FaHome className="mb-2 text-2xl" />
              <span>Admin Home</span>
            </Link>
            <Link href="/admin/manage-usage" className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg shadow-sm px-4 py-4 transition font-semibold text-sm">
              <FaUsers className="mb-2 text-2xl" />
              <span>Manage Usage</span>
              <span className="text-xs text-blue-500 mt-1">[Users]</span>
            </Link>
            <Link href={`/admin/events/${eventId}/media/list`} className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg shadow-sm px-4 py-4 transition font-semibold text-sm">
              <FaPhotoVideo className="mb-2 text-2xl" />
              Manage Media Files
            </Link>
            <Link href="/admin" className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 rounded-lg shadow-sm px-4 py-4 transition font-semibold text-sm">
              <FaCalendarAlt className="mb-2 text-2xl" />
              Manage Events
            </Link>
            {event?.admissionType === 'ticketed' && (
              <>
                <Link href={`/admin/events/${eventId}/ticket-types/list`} className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg shadow-sm px-4 py-4 transition font-semibold text-sm">
                  <FaTags className="mb-2 text-2xl" />
                  Manage Ticket Types
                </Link>
                <Link href={`/admin/events/${eventId}/tickets/list`} className="flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg shadow-sm px-4 py-4 transition font-semibold text-sm">
                  <FaTicketAlt className="mb-2 text-2xl" />
                  Manage Tickets
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Special Event Management Features Card */}
      <div className="flex justify-center mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl shadow-lg p-6 w-full max-w-4xl">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-purple-800 mb-2">🎭 Event Management Features</h2>
            <p className="text-sm text-purple-600">Manage performers, contacts, sponsors, emails, and program directors for this event</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Link href={`/admin/events/${eventId}/performers`} className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg shadow-sm px-4 py-6 transition font-semibold text-sm border border-pink-200 hover:border-pink-300 hover:shadow-md">
              <FaMicrophone className="mb-2 text-3xl" />
              Featured Performers
            </Link>
            <Link href={`/admin/events/${eventId}/contacts`} className="flex flex-col items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg shadow-sm px-4 py-6 transition font-semibold text-sm border border-emerald-200 hover:border-emerald-300 hover:shadow-md">
              <FaAddressBook className="mb-2 text-3xl" />
              Event Contacts
            </Link>
            <Link href={`/admin/events/${eventId}/sponsors`} className="flex flex-col items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg shadow-sm px-4 py-6 transition font-semibold text-sm border border-amber-200 hover:border-amber-300 hover:shadow-md">
              <FaHandshake className="mb-2 text-3xl" />
              Event Sponsors
            </Link>
            <Link href={`/admin/events/${eventId}/emails`} className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg shadow-sm px-4 py-6 transition font-semibold text-sm border border-blue-200 hover:border-blue-300 hover:shadow-md">
              <FaEnvelope className="mb-2 text-3xl" />
              Event Emails
            </Link>
            <Link href={`/admin/events/${eventId}/program-directors`} className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg shadow-sm px-4 py-6 transition font-semibold text-sm border border-indigo-200 hover:border-indigo-300 hover:shadow-md">
              <FaUserTie className="mb-2 text-3xl" />
              Program Directors
            </Link>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Edit Event - ID: {eventId}</h1>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}
      <div className="border rounded p-4 bg-white shadow-sm min-h-[200px]">
        <EventForm event={event} eventTypes={eventTypes} onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}