import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface Gate {
  n: number;
  gate_id: number;
  table: number[][];
  flat: number[];
}

function getColorClass(value: number): string {
  switch (value) {
    case 0:
      return 'bg-blue-500 text-white';
    case 1:
      return 'bg-green-500 text-white';
    case 2:
      return 'bg-purple-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

function TruthTable({ table, gateId }: { table: number[][]; gateId: number }) {
  return (
    <Link href={`/gates/${gateId}`} className="block">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow cursor-pointer">
        <div className="text-center mb-3">
          <span className="text-sm font-semibold text-gray-700">Gate #{gateId}</span>
        </div>
        <div className="flex justify-center">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-xs font-semibold"></th>
                <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-xs font-semibold">0</th>
                <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-xs font-semibold">1</th>
                <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-xs font-semibold">2</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="border border-gray-300 bg-gray-100 px-3 py-2 text-xs font-semibold text-center">
                    {rowIdx}
                  </td>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="border border-gray-300 p-0">
                      <div className={`${getColorClass(cell)} px-3 py-2 text-center font-bold text-sm`}>
                        {cell}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Link>
  );
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show
    
    if (totalPages <= showPages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range to always show 5 pages
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, showPages);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - showPages + 1);
      }
      
      if (start > 2) pages.push('...');
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) pages.push('...');
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={`/gates?page=${currentPage - 1}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          ← Previous
        </Link>
      ) : (
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
        >
          ← Previous
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex gap-1">
        {getPageNumbers().map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={`/gates?page=${page}`}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
              {page}
            </Link>
          )
        ))}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={`/gates?page=${currentPage + 1}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Next →
        </Link>
      ) : (
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
        >
          Next →
        </button>
      )}
    </div>
  );
}

export default function GatesGrid({ currentPage }: { currentPage: number }) {
  const GATES_PER_PAGE = 60; // Show 60 gates per page
  const TOTAL_GATES = 3774;
  const totalPages = Math.ceil(TOTAL_GATES / GATES_PER_PAGE);
  
  // Calculate which gates to load
  const startGateId = (currentPage - 1) * GATES_PER_PAGE;
  const endGateId = Math.min(startGateId + GATES_PER_PAGE, TOTAL_GATES);
  
  // Load only the gates for this page
  const gatesDir = path.join(process.cwd(), 'gates');
  const gates: Gate[] = [];
  
  for (let i = startGateId; i < endGateId; i++) {
    const filePath = path.join(gatesDir, `gate_${i.toString().padStart(4, '0')}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      gates.push(JSON.parse(content));
    }
  }

  return (
    <>
      {/* Page Info */}
      <div className="mb-4 text-center">
        <p className="text-gray-600">
          Showing gates {startGateId + 1} - {endGateId} of {TOTAL_GATES} 
          <span className="ml-2 text-sm">
            (Page {currentPage} of {totalPages})
          </span>
        </p>
      </div>

      {/* Gates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {gates.map((gate) => (
          <TruthTable 
            key={gate.gate_id} 
            table={gate.table} 
            gateId={gate.gate_id}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}

