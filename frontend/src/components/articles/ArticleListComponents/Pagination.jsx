import React from 'react';

const Pagination = ({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;
  
  return (
    <div className="pagination">
      <button 
        className="pagination-button" 
        onClick={() => onPageChange(1)} 
        disabled={pagination.page === 1}
      >
        &laquo;
      </button>
      
      <button 
        className="pagination-button" 
        onClick={() => onPageChange(pagination.page - 1)} 
        disabled={pagination.page === 1}
      >
        &lsaquo;
      </button>
      
      <div className="pagination-info">
        Page {pagination.page} of {pagination.totalPages}
      </div>
      
      <button 
        className="pagination-button" 
        onClick={() => onPageChange(pagination.page + 1)} 
        disabled={pagination.page === pagination.totalPages}
      >
        &rsaquo;
      </button>
      
      <button 
        className="pagination-button" 
        onClick={() => onPageChange(pagination.totalPages)} 
        disabled={pagination.page === pagination.totalPages}
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
