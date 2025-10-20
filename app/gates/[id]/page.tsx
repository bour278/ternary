import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import InteractiveTandTree from './InteractiveTandTree';

interface TandNode {
  op: string;
  left?: TandNode | string | number;
  right?: TandNode | string | number;
}

interface Gate {
  n: number;
  gate_id: number;
  table: number[][];
  flat: number[];
  tand_representation?: TandNode;
  tand_string?: string;
  tand_operations?: number;
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


export default async function GateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gateId = parseInt(id);
  
  if (isNaN(gateId) || gateId < 0 || gateId > 3773) {
    notFound();
  }

  // Load the specific gate file
  const gatesDir = path.join(process.cwd(), 'gates');
  const filePath = path.join(gatesDir, `gate_${gateId.toString().padStart(4, '0')}.json`);
  
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const gate: Gate = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Get adjacent gate IDs
  const prevId = gateId > 0 ? gateId - 1 : null;
  const nextId = gateId < 3773 ? gateId + 1 : null;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/gates" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white mb-4 inline-block font-medium">
            ← Back to All Gates
          </Link>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Gate #{gate.gate_id}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Universal ternary logic operator
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Truth Table Card */}
          <div className="border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Truth Table</h2>
            <div className="flex justify-center">
              <table className="border-collapse border-2 border-gray-400 dark:border-gray-600">
                <thead>
                  <tr>
                    <th className="border-2 border-gray-400 dark:border-gray-600 bg-gray-200 dark:bg-white/10 px-6 py-4 text-lg font-bold text-black dark:text-white">⊗</th>
                    <th className="border-2 border-gray-400 dark:border-gray-600 bg-gray-200 dark:bg-white/10 px-6 py-4 text-lg font-bold text-black dark:text-white">0</th>
                    <th className="border-2 border-gray-400 dark:border-gray-600 bg-gray-200 dark:bg-white/10 px-6 py-4 text-lg font-bold text-black dark:text-white">1</th>
                    <th className="border-2 border-gray-400 dark:border-gray-600 bg-gray-200 dark:bg-white/10 px-6 py-4 text-lg font-bold text-black dark:text-white">2</th>
                  </tr>
                </thead>
                <tbody>
                  {gate.table.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="border-2 border-gray-400 dark:border-gray-600 bg-gray-200 dark:bg-white/10 px-6 py-4 text-center font-bold text-lg text-black dark:text-white">
                        {rowIdx}
                      </td>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="border-2 border-gray-400 dark:border-gray-600 p-0">
                          <div className={`${getColorClass(cell)} px-6 py-4 text-center font-bold text-2xl`}>
                            {cell}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-8 flex gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 text-white px-4 py-2 rounded font-bold">0</div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Value 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-green-500 text-white px-4 py-2 rounded font-bold">1</div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Value 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-purple-500 text-white px-4 py-2 rounded font-bold">2</div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Value 2</span>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Gate ID</h3>
                <p className="text-2xl font-bold text-black dark:text-white">#{gate.gate_id}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Logic System</h3>
                <p className="text-lg text-black dark:text-white">{gate.n}-valued (Ternary)</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Flat Representation</h3>
                <div className="font-mono text-sm bg-gray-200 dark:bg-black/50 text-black dark:text-white p-4 rounded overflow-x-auto border border-gray-300 dark:border-white/20">
                  [{gate.flat.join(', ')}]
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Properties</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Universal operator
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Can express all ternary functions through composition
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">ℹ</span>
                    2 inputs, 1 output
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* TAND Representation Section */}
        {gate.tand_representation && (
          <div className="mt-8 max-w-6xl mx-auto">
            <div className="border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Interactive TAND Representation</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This gate can be constructed using <span className="font-bold text-red-600 dark:text-red-500">{gate.tand_operations} TAND operations</span>. 
                Select input values below to see how they flow through the computation tree.
              </p>

              {/* String representation */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">Expression</h3>
                <div className="bg-gray-200 dark:bg-black/50 p-4 rounded-lg overflow-x-auto border border-gray-300 dark:border-white/20">
                  <code className="text-sm font-mono text-black dark:text-white break-all">
                    {gate.tand_string}
                  </code>
                </div>
              </div>

              {/* Interactive tree */}
              <InteractiveTandTree 
                tandRepresentation={gate.tand_representation} 
                gateTable={gate.table}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between max-w-6xl mx-auto">
          {prevId !== null ? (
            <Link
              href={`/gates/${prevId}`}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors border border-black dark:border-white"
            >
              ← Gate #{prevId}
            </Link>
          ) : (
            <div></div>
          )}
          
          {nextId !== null ? (
            <Link
              href={`/gates/${nextId}`}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors border border-black dark:border-white"
            >
              Gate #{nextId} →
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate static params for all gates
export async function generateStaticParams() {
  return Array.from({ length: 3774 }, (_, i) => ({
    id: i.toString(),
  }));
}

