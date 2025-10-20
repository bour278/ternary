import Link from 'next/link';
import { Suspense } from 'react';
import GatesGrid from './GatesGrid';
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export default async function GatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  
  return (
    <div className="relative min-h-screen bg-white dark:bg-black">
      {/* Flickering Grid - Full viewport background */}
      {/* <FlickeringGrid
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        squareSize={4}
        gridGap={6}
        flickerChance={0.3}
        maxOpacity={0.25}
      /> */}
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-4 tracking-tight">
            All Universal Ternary Logic Gates
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
            Browsing 3,774 universal operators with color-coded truth tables
          </p>
          
          {/* Legend */}
          <div className="mt-6 flex gap-4 items-center flex-wrap border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Legend:</span>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 text-white px-3 py-1 text-sm font-bold rounded">0</div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Value 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-green-500 text-white px-3 py-1 text-sm font-bold rounded">1</div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Value 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-purple-500 text-white px-3 py-1 text-sm font-bold rounded">2</div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Value 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gates Grid with Suspense */}
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading gates...</p>
          </div>
        }>
          <GatesGrid currentPage={currentPage} />
        </Suspense>

        {/* Footer Stats */}
        <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Total: 3,774 universal gates out of 19,683 possible ternary operators
          </p>
        </div>
      </div>
    </div>
  );
}

