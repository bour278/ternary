'use client';

import { useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Position,
  useNodesState,
  useEdgesState,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

interface TandNode {
  op: string;
  left?: TandNode | string | number;
  right?: TandNode | string | number;
}

function evaluateTand(left: number, right: number): number {
  if (left === 0 && right === 0) return 1;
  if (left === 2 && right === 2) return 0;
  return 2;
}

function evaluateNode(node: TandNode | string | number, vars: { x: number; y: number }): number {
  if (typeof node === 'number') return node;
  if (typeof node === 'string') {
    const numVal = parseInt(node);
    if (!isNaN(numVal)) return numVal;
    return vars[node as 'x' | 'y'];
  }
  const leftVal = node.left ? evaluateNode(node.left, vars) : 0;
  const rightVal = node.right ? evaluateNode(node.right, vars) : 0;
  return evaluateTand(leftVal, rightVal);
}

const nodeWidth = 150;
const nodeHeight = 60;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

function tandTreeToFlow(
  node: TandNode | string | number,
  vars: { x: number; y: number }
): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let idCounter = 0;

  function traverse(subNode: TandNode | string | number, parentId?: string): string {
    const id = (idCounter++).toString();
    const value = evaluateNode(subNode, vars);

    if (typeof subNode === 'string' || typeof subNode === 'number') {
      const isConstant = typeof subNode === 'number' || !isNaN(parseInt(subNode as string));
      const isVariable = typeof subNode === 'string' && isNaN(parseInt(subNode as string));
      const displayValue = isVariable ? vars[subNode as 'x' | 'y'] : subNode;

      nodes.push({
        id,
        position: { x: 0, y: 0 },
        data: {
          label: (
            <div className={`
              relative px-4 py-2 rounded-lg font-mono font-bold text-lg text-white
              ${isVariable ? 'bg-amber-500 border-amber-700' : ''}
              ${isConstant ? 'bg-indigo-500 border-indigo-700' : ''}
              shadow-lg border-2 border-opacity-30
            `}>
              {subNode}
              {isVariable && (
                <div className="absolute -top-2 -right-2 bg-white text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-gray-300 shadow">
                  {displayValue}
                </div>
              )}
            </div>
          )
        },
        style: { width: 'auto', padding: 0, border: 'none', background: 'transparent' }
      });
    } else {
      const getValueColor = (val: number) => {
        switch (val) {
          case 0: return 'bg-blue-500 border-blue-700';
          case 1: return 'bg-green-500 border-green-700';
          case 2: return 'bg-purple-500 border-purple-700';
          default: return 'bg-gray-500 border-gray-700';
        }
      };

      nodes.push({
        id,
        position: { x: 0, y: 0 },
        data: {
          label: (
            <div className="relative">
              <div className={`
                ${getValueColor(value)} text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg border-2 border-opacity-30
              `}>
                TAND
              </div>
              <div className="absolute -top-3 -right-3 bg-white text-gray-900 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-gray-400 shadow-lg">
                {value}
              </div>
            </div>
          )
        },
        style: { width: 'auto', padding: 0, border: 'none', background: 'transparent' }
      });

      if (subNode.left) {
        const leftId = traverse(subNode.left, id);
        edges.push({
          id: `${id}-L`, source: id, target: leftId, type: 'smoothstep',
          label: `L: ${evaluateNode(subNode.left, vars)}`,
          labelStyle: { fill: '#3B82F6', fontWeight: 'bold' },
          labelBgStyle: { fill: 'white' },
          style: { stroke: '#3B82F6', strokeWidth: 2 }
        });
      }
      if (subNode.right) {
        const rightId = traverse(subNode.right, id);
        edges.push({
          id: `${id}-R`, source: id, target: rightId, type: 'smoothstep',
          label: `R: ${evaluateNode(subNode.right, vars)}`,
          labelStyle: { fill: '#A855F7', fontWeight: 'bold' },
          labelBgStyle: { fill: 'white' },
          style: { stroke: '#A855F7', strokeWidth: 2 }
        });
      }
    }
    return id;
  }

  traverse(node);
  return { nodes, edges };
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
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const { nodes: initialNodes, edges: initialEdges } = tandTreeToFlow(tandRepresentation, { x, y });
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [tandRepresentation, x, y, setNodes, setEdges]);

  const finalOutput = evaluateNode(tandRepresentation, { x, y });
  const expectedOutput = gateTable[x][y];
  const isCorrect = finalOutput === expectedOutput;

  return (
    <div>
      {/* Input Controls */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Select Input Values</h3>
        <div className="flex gap-8 items-center justify-center flex-wrap">
          {/* X input selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-amber-900 border-2 border-gray-300 dark:border-gray-600'
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-amber-900 border-2 border-gray-300 dark:border-gray-600'
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
            <div className="text-3xl font-bold text-gray-400 dark:text-gray-600">=</div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Output</label>
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
          ${isCorrect ? 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700' : 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700'}
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
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-4">Live Computation Tree</h3>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg p-8 overflow-x-auto" style={{ height: 800 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <strong>How to read:</strong> Each node shows its computed value in a badge.
            The colored branches show the values flowing from children to parents.
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>TAND truth table:</strong> TAND(0,0)=1, TAND(2,2)=0, all other combinations=2
          </p>
        </div>
      </div>
    </div>
  );
}

