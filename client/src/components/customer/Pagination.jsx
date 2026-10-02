import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 my-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
      </button>

      {[...Array(totalPages)].map((_, index) => {
        const pageNum = index + 1;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-1.5 border rounded text-xs font-semibold ${
              page === pageNum
                ? 'bg-amazon-blue text-white border-amazon-blue'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center"
      >
        Next <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
};

export default Pagination;
