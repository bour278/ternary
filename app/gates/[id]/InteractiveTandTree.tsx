'use client';

import { useState } from 'react';

interface TandNode {
  op: string;
  left?: TandNode | string | number;
  right?: TandNode | string | number;
}

// Evaluate TAND operation based on the ternary TAND truth table
// TAND(0, 0) = 1
// TAND(2, 2) = 0
// Everything else = 2
function evaluateTand(left: number, right: number): number {
  if (left === 0 && right === 0) return 1;
  if (left === 2 && right === 2) return 0;
  return 2;
}

// Recursively evaluate the tree with given variable values
function evaluateNode(node: TandNode | string | number, vars: { x: number; y: number }): number {
  if (typeof node === 'number') {
    return node;
  }
  if (typeof node === 'string') {
    // Check if it's a numeric constant (as string)
    const numVal = parseInt(node);
    if (!isNaN(numVal)) {
      return numVal;
    }
    // Otherwise it's a variable
    return vars[node as 'x' | 'y'];
  }
  
  // It's a TAND operation
  const leftVal = node.left ? evaluateNode(node.left, vars) : 0;
  const rightVal = node.right ? evaluateNode(node.right, vars) : 0;
  return evaluateTand(leftVal, rightVal);
}

function TandTreeNode({ 
  node, 
  vars, 
  depth = 0 
}: { 
  node: TandNode | string | number; 
  vars: { x: number; y: number }; 
  depth?: number;
}) {
  const value = evaluateNode(node, vars);
  
  if (typeof node === 'string' || typeof node === 'number') {
    // Leaf node (variable or constant)
    const numVal = typeof node === 'string' ? parseInt(node) : NaN;
    const isConstant = typeof node === 'number' || !isNaN(numVal);
    const isVariable = typeof node === 'string' && isNaN(numVal);
    const displayValue = isVariable ? vars[node as 'x' | 'y'] : (typeof node === 'number' ? node : numVal);
    
    return (
      <div className="flex flex-col items-center">
        <div className={`
          relative px-4 py-2 rounded-lg font-mono font-bold text-lg
          ${isVariable ? 'bg-amber-500 text-white' : ''}
          ${isConstant ? 'bg-indigo-500 text-white' : ''}
          shadow-lg border-2 border-opacity-30
          ${isVariable ? 'border-amber-700' : ''}
          ${isConstant ? 'border-indigo-700' : ''}
          transition-all duration-300
        `}>
          {isVariable && (
            <div className="absolute -top-2 -right-2 bg-white text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-gray-300 shadow">
              {displayValue}
            </div>
          )}
          {typeof node === 'string' && !isNaN(parseInt(node)) ? parseInt(node) : node}
        </div>
      </div>
    );
  }

  // Operator node
  const leftVal = node.left ? evaluateNode(node.left, vars) : 0;
  const rightVal = node.right ? evaluateNode(node.right, vars) : 0;
  
  // Color based on output value
  const getValueColor = (val: number) => {
    switch(val) {
      case 0: return 'bg-blue-500 border-blue-700';
      case 1: return 'bg-green-500 border-green-700';
      case 2: return 'bg-purple-500 border-purple-700';
      default: return 'bg-red-500 border-red-700';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* TAND operator node with computed value */}
      <div className="relative">
        <div className={`
          ${getValueColor(value)} text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg border-2 border-opacity-30
          transition-all duration-300
        `}>
          TAND
        </div>
        {/* Show computed value */}
        <div className="absolute -top-3 -right-3 bg-white text-gray-900 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-gray-400 shadow-lg">
          {value}
        </div>
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
            <div className={`w-px h-8 transition-all duration-300 ${getValueColor(leftVal).split(' ')[0].replace('bg-', 'bg-')}`}></div>
            <div className={`text-xs font-semibold px-3 py-1 rounded transition-all duration-300 ${getValueColor(leftVal)} text-white mb-3`}>
              L:{leftVal}
            </div>
            {node.left && <TandTreeNode node={node.left} vars={vars} depth={depth + 1} />}
          </div>
          
          {/* Right branch */}
          <div className="flex-1 flex flex-col items-center">
            <div className={`w-px h-8 transition-all duration-300 ${getValueColor(rightVal).split(' ')[0].replace('bg-', 'bg-')}`}></div>
            <div className={`text-xs font-semibold px-3 py-1 rounded transition-all duration-300 ${getValueColor(rightVal)} text-white mb-3`}>
              R:{rightVal}
            </div>
            {node.right && <TandTreeNode node={node.right} vars={vars} depth={depth + 1} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InteractiveTandTree({ 
  tandRepresentation,
  gateTable 
}: { 
  tandRepresentation: TandNode;
  gateTable: number[][];
}) {
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);

  const finalOutput = evaluateNode(tandRepresentation, { x, y });
  const expectedOutput = gateTable[x][y];
  const isCorrect = finalOutput === expectedOutput;

  return (
    <div>
      {/* Input Controls */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Input Values</h3>
        <div className="flex gap-8 items-center justify-center flex-wrap">
          {/* X input selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Variable <span className="font-mono bg-amber-500 text-white px-2 py-1 rounded">x</span>
            </label>
            <div className="flex gap-2">
              {[0, 1, 2].map((val) => (
                <button
                  key={val}
                  onClick={() => setX(val)}
                  className={`
                    w-12 h-12 rounded-lg font-bold text-lg transition-all duration-200
                    ${x === val 
                      ? 'bg-amber-500 text-white shadow-lg scale-110 border-2 border-amber-700' 
                      : 'bg-white text-gray-700 hover:bg-amber-100 border-2 border-gray-300'
                    }
                  `}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Y input selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Variable <span className="font-mono bg-amber-500 text-white px-2 py-1 rounded">y</span>
            </label>
            <div className="flex gap-2">
              {[0, 1, 2].map((val) => (
                <button
                  key={val}
                  onClick={() => setY(val)}
                  className={`
                    w-12 h-12 rounded-lg font-bold text-lg transition-all duration-200
                    ${y === val 
                      ? 'bg-amber-500 text-white shadow-lg scale-110 border-2 border-amber-700' 
                      : 'bg-white text-gray-700 hover:bg-amber-100 border-2 border-gray-300'
                    }
                  `}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Output display */}
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-gray-400">=</div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Output</label>
              <div className={`
                w-16 h-16 rounded-lg font-bold text-2xl flex items-center justify-center shadow-lg border-2 transition-all duration-300
                ${finalOutput === 0 ? 'bg-blue-500 border-blue-700' : ''}
                ${finalOutput === 1 ? 'bg-green-500 border-green-700' : ''}
                ${finalOutput === 2 ? 'bg-purple-500 border-purple-700' : ''}
                text-white
              `}>
                {finalOutput}
              </div>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className={`
          mt-4 p-3 rounded-lg text-center font-semibold transition-all duration-300
          ${isCorrect ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}
        `}>
          {isCorrect ? (
            <span>✓ Correct! TAND tree output matches gate truth table</span>
          ) : (
            <span>✗ Mismatch: Expected {expectedOutput} from truth table, got {finalOutput} from TAND tree</span>
          )}
        </div>
      </div>

      {/* Tree visualization */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Live Computation Tree</h3>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 overflow-x-auto">
          <div className="inline-block min-w-full flex justify-center">
            <div className="inline-block">
              <TandTreeNode node={tandRepresentation} vars={{ x, y }} />
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>How to read:</strong> Each node shows its computed value in a badge. 
            The colored branches show the values flowing from children to parents.
          </p>
          <p className="text-sm text-gray-700">
            <strong>TAND truth table:</strong> TAND(0,0)=1, TAND(2,2)=0, all other combinations=2
          </p>
        </div>
      </div>
    </div>
  );
}

