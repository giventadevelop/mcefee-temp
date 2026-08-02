'use client';

import { useState } from 'react';

interface GallerySearchProps {
  onSearch: (filters: {
    searchTerm: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  loading?: boolean;
  placeholder?: string;
}

export function GallerySearch({
  onSearch,
  loading = false,
  placeholder = 'Search by title…',
}: GallerySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      searchTerm,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    onSearch({
      searchTerm: '',
      startDate: undefined,
      endDate: undefined,
    });
  };

  const hasFilters = Boolean(searchTerm || startDate || endDate);

  return (
    <form className="mh-events-search" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="gallerySearchTitle">Search by Title</label>
        <input
          type="text"
          id="gallerySearchTitle"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
        />
      </div>

      <div>
        <label>Date Range</label>
        <div className="mh-events-search-dates">
          <div>
            <label htmlFor="gallerySearchDateFrom">From</label>
            <input
              type="date"
              id="gallerySearchDateFrom"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="gallerySearchDateTo">To</label>
            <input
              type="date"
              id="gallerySearchDateTo"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="mh-events-search-actions mh-gallery-search-actions">
        <button
          type="submit"
          disabled={loading}
          className="mh-btn mh-btn-primary mh-gallery-action-btn"
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
          {loading ? 'Searching…' : 'Search'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="mh-btn mh-btn-calendar mh-gallery-action-btn"
          title="Clear"
          aria-label="Clear search"
          disabled={loading && !hasFilters}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Clear
        </button>
      </div>

      {hasFilters && (
        <p className="mh-events-search-active">
          <strong>Search active:</strong>
          {searchTerm && ` Title contains "${searchTerm}"`}
          {searchTerm && (startDate || endDate) && ' and'}
          {startDate && endDate && ` date between "${startDate}" and "${endDate}"`}
          {startDate && !endDate && ` date from "${startDate}" onwards`}
          {!startDate && endDate && ` date until "${endDate}"`}
        </p>
      )}
    </form>
  );
}
