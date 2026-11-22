'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminListSearchCombobox from '@/components/search/AdminListSearchCombobox';
import { matchesPublicSearchFields } from '@/lib/publicTypeaheadSearch';

interface FocusGroupWithEvents {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  searchText?: string;
  events?: any[];
}

interface FocusGroupsGridWithSearchProps {
  groups: FocusGroupWithEvents[];
  total: number;
}

export default function FocusGroupsGridWithSearch({ groups, total }: FocusGroupsGridWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const filteredGroups = searchTerm.trim()
    ? groups.filter((g) =>
        matchesPublicSearchFields([g.searchText, g.name, g.slug, g.description, g.id], searchTerm),
      )
    : groups;

  const filteredCount = filteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const startItem = filteredCount > 0 ? page * pageSize + 1 : 0;
  const endItem = filteredCount > 0 ? Math.min((page + 1) * pageSize, filteredCount) : 0;
  const paginatedGroups = filteredGroups.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const isPrevDisabled = page <= 0;
  const isNextDisabled = page + 1 >= totalPages;
  const displayPage = page + 1;

  const commitSearch = (value: string) => {
    setSearchTerm(value.trim());
    setSearchDraft(value.trim());
  };

  return (
    <div className="space-y-6">
      <div className="mh-events-search">
        <div>
          <label htmlFor="focus-groups-public-search">Search focus groups</label>
          <AdminListSearchCombobox
            items={groups as (FocusGroupWithEvents & Record<string, unknown>)[]}
            committedValue={searchTerm}
            onCommit={commitSearch}
            onInputChange={setSearchDraft}
            inputId="focus-groups-public-search"
            ariaLabel="Search focus groups by name, slug, description, or OCR text"
            placeholder="Search by name, slug, or id…"
            className="relative w-full max-w-xl"
            inputClassName="w-full max-w-xl px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            getSearchFields={(g) => [g.searchText, g.name, g.slug, g.description, g.id]}
            getCommitValue={(g) => g.name || g.slug || ''}
            formatPrimary={(g) => g.name || g.slug || 'Focus group'}
            formatSecondary={(g) =>
              [g.slug, g.id != null ? `ID: ${g.id}` : null].filter(Boolean).join(' · ')
            }
          />
        </div>
        <div className="mh-events-search-actions">
          <button
            type="button"
            onClick={() => commitSearch(searchDraft)}
            className="mh-btn mh-btn-primary"
            title="Search"
            aria-label="Search"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
          <button
            type="button"
            onClick={() => commitSearch('')}
            className="mh-btn mh-btn-calendar"
            title="Clear"
            aria-label="Clear search"
          >
            Clear
          </button>
        </div>
        {searchTerm.trim() ? (
          <p className="mh-events-search-active">
            <strong>Search active:</strong> showing {filteredCount} of {groups.length} group
            {groups.length !== 1 ? 's' : ''}
            {typeof total === 'number' && total > groups.length
              ? ` (loaded ${groups.length} of ${total})`
              : ''}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {paginatedGroups.map((g, index) => {
          const colorScheme = [
            {
              card: 'bg-blue-50/80 border-l-4 border-blue-500',
              title: 'group-hover:text-blue-700',
              accent: 'text-blue-600',
              border: 'border-blue-200',
              eventHover: 'hover:bg-blue-100',
            },
            {
              card: 'bg-teal-50/80 border-l-4 border-teal-500',
              title: 'group-hover:text-teal-700',
              accent: 'text-teal-600',
              border: 'border-teal-200',
              eventHover: 'hover:bg-teal-100',
            },
            {
              card: 'bg-amber-50/80 border-l-4 border-amber-500',
              title: 'group-hover:text-amber-700',
              accent: 'text-amber-600',
              border: 'border-amber-200',
              eventHover: 'hover:bg-amber-100',
            },
            {
              card: 'bg-indigo-50/80 border-l-4 border-indigo-500',
              title: 'group-hover:text-indigo-700',
              accent: 'text-indigo-600',
              border: 'border-indigo-200',
              eventHover: 'hover:bg-indigo-100',
            },
          ][index % 4];
          return (
            <div
              key={g.id}
              className={`group block rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 ${colorScheme.card}`}
            >
              <Link
                href={`/focus-groups/${encodeURIComponent(g.slug || '')}`}
                className="block text-center"
              >
                <div
                  className="h-60 rounded-lg mb-4 overflow-hidden flex items-center justify-center bg-white/60"
                  style={{
                    ...(g.coverImageUrl
                      ? {
                          backgroundImage: `url(${g.coverImageUrl})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }
                      : { backgroundColor: 'rgba(243, 244, 246, 0.8)' }),
                  }}
                />
                <h3
                  className={`text-xl font-semibold text-gray-900 mb-2 transition-colors duration-300 ${colorScheme.title}`}
                >
                  {g.name}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
                  {g.description || 'No description provided.'}
                </p>
              </Link>

              {g.events && g.events.length > 0 && (
                <div className={`mt-4 pt-4 border-t ${colorScheme.border} text-center`}>
                  <h4 className={`text-sm font-semibold mb-2 ${colorScheme.accent}`}>
                    Upcoming Events
                  </h4>
                  <div className="space-y-2">
                    {g.events.slice(0, 3).map((event: any) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className={`block p-2 rounded-lg transition-colors duration-300 ${colorScheme.eventHover}`}
                      >
                        <div className="text-xs text-gray-600">
                          {event.startDate} • {event.startTime}
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">
                          {event.title}
                        </div>
                      </Link>
                    ))}
                    {g.events.length > 3 && (
                      <Link
                        href={`/focus-groups/${encodeURIComponent(g.slug || '')}`}
                        className={`block text-xs mt-2 font-medium transition-colors duration-300 ${colorScheme.accent} hover:opacity-80`}
                      >
                        View all {g.events.length} events →
                      </Link>
                    )}
                  </div>
                </div>
              )}
              {g.events && g.events.length === 0 && (
                <div className={`mt-4 pt-4 border-t ${colorScheme.border} text-center`}>
                  <p className="text-xs text-gray-500">No upcoming events</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCount === 0 && (
        <div className="mh-events-banner mh-events-banner--info text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3>
            {searchTerm.trim() ? 'No focus groups match your search.' : 'No focus groups found'}
          </h3>
          <p>
            {searchTerm.trim()
              ? 'Try a different search term, or clear the filter.'
              : 'New focus groups will appear here once they are created.'}
          </p>
        </div>
      )}

      {filteredCount > 0 && (
        <div className="mh-events-pagination">
          <div className="mh-events-pagination-row">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={isPrevDisabled}
              className="mh-btn mh-btn-readmore"
              title="Previous Page"
              aria-label="Previous Page"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <div className="mh-events-page-info">
              Page <strong>{displayPage}</strong> of <strong>{totalPages}</strong>
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={isNextDisabled}
              className="mh-btn mh-btn-readmore"
              title="Next Page"
              aria-label="Next Page"
            >
              Next
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="mh-events-count">
            Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
            <strong>{filteredCount}</strong> focus groups
            {searchTerm.trim() ? ` (filtered from ${groups.length})` : ''}
          </div>
        </div>
      )}
    </div>
  );
}
