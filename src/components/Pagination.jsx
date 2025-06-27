import React from "react";
import { Button } from "@dhis2/ui";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="mt-4 flex justify-center gap-2">
      <Button
        small
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        Previous
      </Button>
      <span className="px-2 py-1 select-none">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        small
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;