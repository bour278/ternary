import Link from 'next/link';
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export default function Home() {
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
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold text-black dark:text-white mb-6 tracking-tight">
            Universal Ternary Logic Gates
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-10 font-light max-w-3xl mx-auto">
            Explore all 3,774 universal operators for ternary (3-valued) logic
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/gates" 
              className="bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-lg text-lg font-semibold transition-all hover:bg-gray-800 dark:hover:bg-gray-200 border border-black dark:border-white"
            >
              View All Gates
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 p-8 hover:bg-gray-100 dark:hover:bg-white/10 transition-all rounded-lg">
            <div>
              <div className="text-5xl font-bold text-black dark:text-white mb-3">3,774</div>
              <div className="text-xl font-semibold mb-2 text-black dark:text-white">Universal Gates</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Out of 19,683 total possible ternary operators
              </p>
            </div>
          </div>

          <div className="border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 p-8 hover:bg-gray-100 dark:hover:bg-white/10 transition-all rounded-lg">
            <div>
              <div className="text-5xl font-bold text-black dark:text-white mb-3">3</div>
              <div className="text-xl font-semibold mb-2 text-black dark:text-white">Logic Values</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                0, 1, and 2 representing three distinct states
              </p>
            </div>
          </div>

          <div className="border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 p-8 hover:bg-gray-100 dark:hover:bg-white/10 transition-all rounded-lg">
            <div>
              <div className="text-5xl font-bold text-black dark:text-white mb-3">9</div>
              <div className="text-xl font-semibold mb-2 text-black dark:text-white">Truth Table Cells</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                3×3 grid defining operator behavior
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 p-10 hover:bg-gray-100 dark:hover:bg-white/10 transition-all rounded-lg">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">
                About Ternary Logic
              </h2>
              <p className="text-gray-700 dark:text-gray-400 mb-4 leading-relaxed">
                Ternary logic extends binary logic by introducing a third value, allowing for more nuanced 
                logical operations. A universal gate is one that can be used to implement any other logical 
                function through composition.
              </p>
              <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                This collection contains all 3,774 universal binary operators (gates with 2 inputs and 1 output) 
                for ternary logic systems. Each gate is represented by its complete truth table showing all 
                possible input combinations and their corresponding outputs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
