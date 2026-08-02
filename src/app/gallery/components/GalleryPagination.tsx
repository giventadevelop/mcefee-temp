'use client';

interface GalleryPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  itemType?: 'albums' | 'events';
}

export function GalleryPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  loading = false,
  itemType = 'events',
}: GalleryPaginationProps) {
  const displayPage = currentPage + 1;
  const hasResults = totalCount > 0;
  const startItem = hasResults ? currentPage * pageSize + 1 : 0;
  const endItem = hasResults
    ? currentPage * pageSize + Math.min(pageSize, totalCount - currentPage * pageSize)
    : 0;

  const isPrevDisabled = currentPage === 0 || loading;
  const isNextDisabled = currentPage >= totalPages - 1 || loading;

  return (
    <div className="mh-events-pagination mh-gallery-pagination">
      <div className="mh-events-pagination-row">
        <button
          type="button"
          onClick={() => {
            if (!isPrevDisabled) onPageChange(currentPage - 1);
          }}
          disabled={isPrevDisabled}
          className="mh-btn mh-btn-readmore mh-gallery-action-btn"
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

        <div className="mh-events-page-info mh-gallery-page-info">
          Page <strong>{displayPage}</strong> of <strong>{Math.max(totalPages, 1)}</strong>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isNextDisabled) onPageChange(currentPage + 1);
          }}
          disabled={isNextDisabled}
          className="mh-btn mh-btn-readmore mh-gallery-action-btn"
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
        {hasResults ? (
          <>
            Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
            <strong>{totalCount}</strong> {itemType === 'albums' ? 'albums' : 'events'}
          </>
        ) : (
          <>No {itemType === 'albums' ? 'albums' : 'events'} match your criteria</>
        )}
      </div>
    </div>
  );
}
