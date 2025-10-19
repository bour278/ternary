import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            Universal Ternary Logic Gates
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Explore all 3,774 universal operators for ternary (3-valued) logic
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/gates" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              View All Gates
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-4xl font-bold text-blue-400 mb-2">3,774</div>
            <div className="text-lg">Universal Gates</div>
            <p className="text-sm text-gray-400 mt-2">
              Out of 19,683 total possible ternary operators
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-4xl font-bold text-purple-400 mb-2">3</div>
            <div className="text-lg">Logic Values</div>
            <p className="text-sm text-gray-400 mt-2">
              0, 1, and 2 representing three distinct states
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-4xl font-bold text-pink-400 mb-2">9</div>
            <div className="text-lg">Truth Table Cells</div>
            <p className="text-sm text-gray-400 mt-2">
              3×3 grid defining operator behavior
            </p>
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">About Ternary Logic</h2>
          <p className="text-gray-300 mb-4">
            Ternary logic extends binary logic by introducing a third value, allowing for more nuanced 
            logical operations. A universal gate is one that can be used to implement any other logical 
            function through composition.
          </p>
          <p className="text-gray-300">
            This collection contains all 3,774 universal binary operators (gates with 2 inputs and 1 output) 
            for ternary logic systems. Each gate is represented by its complete truth table showing all 
            possible input combinations and their corresponding outputs.
          </p>
        </div>
      </div>
    </div>
  );
}
