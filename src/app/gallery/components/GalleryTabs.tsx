'use client';

interface GalleryTabsProps {
  activeTab: 'albums' | 'events';
  onTabChange: (tab: 'albums' | 'events') => void;
  albumsCount: number;
  eventsCount: number;
  loading?: boolean;
}

export function GalleryTabs({
  activeTab,
  onTabChange,
  albumsCount,
  eventsCount,
  loading = false,
}: GalleryTabsProps) {
  const albumsDisabled = albumsCount === 0 && !loading;
  const eventsDisabled = eventsCount === 0 && !loading;
  const showEvents = activeTab === 'events';

  return (
    <div className="mh-events-head mh-gallery-head">
      <h2>{showEvents ? 'Event based albums' : 'Albums'}</h2>
      <div
        className={`mh-events-toggle mh-gallery-toggle ${showEvents ? 'mh-gallery-toggle--events' : 'mh-gallery-toggle--albums'}`}
        role="group"
        aria-label="Gallery view switch"
      >
        <span
          className={`mh-events-toggle-label mh-gallery-toggle-label mh-gallery-toggle-label--albums ${!showEvents ? 'is-active' : ''}`}
        >
          Albums{!loading ? ` (${albumsCount})` : ''}
        </span>
        <button
          type="button"
          onClick={() => {
            if (showEvents && !albumsDisabled) onTabChange('albums');
            else if (!showEvents && !eventsDisabled) onTabChange('events');
          }}
          disabled={
            (showEvents && albumsDisabled) || (!showEvents && eventsDisabled)
          }
          className={`mh-events-toggle-btn mh-gallery-toggle-btn ${showEvents ? 'is-past' : ''}`}
          title={showEvents ? 'Show Albums' : 'Show Event based albums'}
          aria-label={showEvents ? 'Show Albums' : 'Show Event based albums'}
          aria-pressed={showEvents}
        >
          <span className="mh-events-toggle-thumb mh-gallery-toggle-thumb" aria-hidden="true">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d={
                  showEvents
                    ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    : 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                }
              />
            </svg>
          </span>
        </button>
        <span
          className={`mh-events-toggle-label mh-gallery-toggle-label mh-gallery-toggle-label--events ${showEvents ? 'is-active' : ''}`}
        >
          Event based albums{!loading ? ` (${eventsCount})` : ''}
        </span>
      </div>
    </div>
  );
}
