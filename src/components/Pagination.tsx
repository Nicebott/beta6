import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  itemsPerPage: number;
  totalItems: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
  darkMode: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  itemsPerPage,
  totalItems,
  paginate,
  currentPage,
  darkMode
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];
    
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    for (let i = 0; i < range.length; i++) {
      if (l) {
        if (range[i] - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (range[i] - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(range[i]);
      l = range[i];
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  if (pageNumbers.length <= 1) return null;

  return (
    <nav className="flex justify-center items-center space-x-1 mt-4" aria-label="Pagination">
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${
          darkMode
            ? 'bg-gray-800 text-blue-400 hover:bg-gray-700 disabled:text-gray-600'
            : 'bg-white text-blue-600 hover:bg-blue-50 disabled:text-gray-400'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>
      
      {pageNumbers.map((number, index) => (
        <button
          key={index}
          onClick={() => typeof number === 'number' ? paginate(number) : undefined}
          disabled={typeof number !== 'number'}
          className={`px-3 py-1 rounded-md ${
            currentPage === number
              ? darkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-600 text-white'
              : darkMode
                ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                : 'bg-white text-blue-600 hover:bg-blue-50'
          } ${typeof number !== 'number' ? 'cursor-default' : ''}`}
          aria-current={currentPage === number ? 'page' : undefined}
        >
          {number}
        </button>
      ))}

      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${
          darkMode
            ? 'bg-gray-800 text-blue-400 hover:bg-gray-700 disabled:text-gray-600'
            : 'bg-white text-blue-600 hover:bg-blue-50 disabled:text-gray-400'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;