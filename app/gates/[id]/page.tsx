import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

function TandTreeNode({ node, depth = 0 }: { node: TandNode | string | number; depth?: number }) {
  if (typeof node === 'string' || typeof node === 'number') {
    // Leaf node (variable or constant)
    const isVariable = typeof node === 'string';
    const isConstant = typeof node === 'number';
    
    return (
      <div className="flex flex-col items-center">
        <div className={`
          px-4 py-2 rounded-lg font-mono font-bold text-lg
          ${isVariable ? 'bg-amber-500 text-white' : ''}
          ${isConstant ? 'bg-indigo-500 text-white' : ''}
          shadow-lg border-2 border-opacity-30
          ${isVariable ? 'border-amber-700' : ''}
          ${isConstant ? 'border-indigo-700' : ''}
        `}>
          {node}
        </div>
      </div>
    );
  }

  // Operator node
  return (
    <div className="flex flex-col items-center gap-3">
      {/* TAND operator node */}
      <div className="bg-red-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg border-2 border-red-700 border-opacity-30">
        TAND
      </div>
      
      {/* Connection lines container */}
      <div className="relative flex gap-2">
        {/* Horizontal connecting line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-6 flex items-start justify-center">
          <div className="w-full h-px bg-gray-400 absolute top-0" style={{ width: 'calc(100% - 4rem)' }}></div>
        </div>
        
        {/* Vertical lines */}
        <div className="flex gap-2 pt-6" style={{ width: '100%' }}>
          {/* Left branch */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-8 bg-gray-400"></div>
            <div className="text-xs font-semibold text-gray-600 mb-3 bg-gray-100 px-2 py-0.5 rounded">L</div>
            {node.left && <TandTreeNode node={node.left} depth={depth + 1} />}
          </div>
          
          {/* Right branch */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-8 bg-gray-400"></div>
            <div className="text-xs font-semibold text-gray-600 mb-3 bg-gray-100 px-2 py-0.5 rounded">R</div>
            {node.right && <TandTreeNode node={node.right} depth={depth + 1} />}
          </div>
        </div>
      </div>
    </div>
  );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/gates" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to All Gates
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gate #{gate.gate_id}
          </h1>
          <p className="text-gray-600">
            Universal ternary logic operator
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Truth Table Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Truth Table</h2>
            <div className="flex justify-center">
              <table className="border-collapse border-2 border-gray-400">
                <thead>
                  <tr>
                    <th className="border-2 border-gray-400 bg-gray-200 px-6 py-4 text-lg font-bold">⊗</th>
                    <th className="border-2 border-gray-400 bg-gray-200 px-6 py-4 text-lg font-bold">0</th>
                    <th className="border-2 border-gray-400 bg-gray-200 px-6 py-4 text-lg font-bold">1</th>
                    <th className="border-2 border-gray-400 bg-gray-200 px-6 py-4 text-lg font-bold">2</th>
                  </tr>
                </thead>
                <tbody>
                  {gate.table.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="border-2 border-gray-400 bg-gray-200 px-6 py-4 text-center font-bold text-lg">
                        {rowIdx}
                      </td>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="border-2 border-gray-400 p-0">
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
            <div className="mt-8 flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 text-white px-4 py-2 rounded font-bold">0</div>
                <span className="text-sm text-gray-600">Value 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-green-500 text-white px-4 py-2 rounded font-bold">1</div>
                <span className="text-sm text-gray-600">Value 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-purple-500 text-white px-4 py-2 rounded font-bold">2</div>
                <span className="text-sm text-gray-600">Value 2</span>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Gate ID</h3>
                <p className="text-2xl font-bold text-gray-900">#{gate.gate_id}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Logic System</h3>
                <p className="text-lg text-gray-900">{gate.n}-valued (Ternary)</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Flat Representation</h3>
                <div className="font-mono text-sm bg-gray-100 p-4 rounded overflow-x-auto">
                  [{gate.flat.join(', ')}]
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Properties</h3>
                <ul className="space-y-2 text-gray-700">
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
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">TAND Representation</h2>
              <p className="text-gray-600 mb-6">
                This gate can be constructed using <span className="font-bold text-red-600">{gate.tand_operations} TAND operations</span>
              </p>

              {/* String representation */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Expression</h3>
                <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono text-gray-900 break-all">
                    {gate.tand_string}
                  </code>
                </div>
              </div>

              {/* Tree visualization */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Tree Structure</h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 overflow-x-auto">
                  <div className="inline-block min-w-full flex justify-center">
                    <div className="inline-block">
                      <TandTreeNode node={gate.tand_representation} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Read from top to bottom: each TAND node takes inputs from its left (L) and right (R) branches
                </p>
              </div>

              {/* Legend */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Legend</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md">
                      TAND
                    </div>
                    <span className="text-sm text-gray-600">TAND operator node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-500 text-white px-4 py-2 rounded-lg font-mono font-bold text-lg shadow-md">
                      x
                    </div>
                    <span className="text-sm text-gray-600">Variable (input)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-mono font-bold text-lg shadow-md">
                      0-2
                    </div>
                    <span className="text-sm text-gray-600">Constant value</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between max-w-6xl mx-auto">
          {prevId !== null ? (
            <Link
              href={`/gates/${prevId}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              ← Gate #{prevId}
            </Link>
          ) : (
            <div></div>
          )}
          
          {nextId !== null ? (
            <Link
              href={`/gates/${nextId}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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

