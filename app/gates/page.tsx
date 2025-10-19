import Link from 'next/link';
import { Suspense } from 'react';
import GatesGrid from './GatesGrid';

export default async function GatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            All Universal Ternary Logic Gates
          </h1>
          <p className="text-gray-600">
            Browsing 3,774 universal operators with color-coded truth tables
          </p>
          
          {/* Legend */}
          <div className="mt-4 flex gap-4 items-center flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Legend:</span>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold">0</div>
                <span className="text-xs text-gray-600">Value 0</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">1</div>
                <span className="text-xs text-gray-600">Value 1</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">2</div>
                <span className="text-xs text-gray-600">Value 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gates Grid with Suspense */}
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading gates...</p>
          </div>
        }>
          <GatesGrid currentPage={currentPage} />
        </Suspense>

        {/* Footer Stats */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            Total: 3,774 universal gates out of 19,683 possible ternary operators
          </p>
        </div>
      </div>
    </div>
  );
}

