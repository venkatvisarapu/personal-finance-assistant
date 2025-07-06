// frontend/src/components/Pagination.jsx

import React from 'react';

// this component shows page numbers like 1 2 3 4 ...
function Pagination({ currentPage, totalPages, onPageChange }) {
  // if there's only one page, don't show pagination
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      {pages.map((p) => (
        <button
          key={p}
          // if it's the current page, highlight it
          className={p === currentPage ? 'btn btn-primary' : 'btn btn-outline-primary'}
          onClick={() => onPageChange(p)}
          style={{ margin: '0 4px' }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export default Pagination;
