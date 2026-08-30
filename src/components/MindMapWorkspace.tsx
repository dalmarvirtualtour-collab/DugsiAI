'use client';

import React, { useEffect, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import { X, Network, HelpCircle, Activity } from 'lucide-react';
import 'reactflow/dist/style.css';

interface Lesson {
  id: string;
  title: string;
  lessonNumber?: number;
}

interface Chapter {
  id: string;
  name: string;
  chapterNumber?: number;
  lessons?: Lesson[];
}

interface MindMapWorkspaceProps {
  activeChapter: Chapter | null;
  pageContent: string;
  onClose: () => void;
  onSelectLesson?: (lessonId: string) => void;
}

interface SemanticConcept {
  type: 'topic' | 'concept' | 'definition' | 'formula';
  label: string;
  details?: string;
}

// Client-side parser for extracting concepts, definitions, and formulas from page markdown
function parseSemanticConcepts(text: string, defaultTopic: string): SemanticConcept[] {
  const concepts: SemanticConcept[] = [];

  if (!text || text.trim().length === 0) {
    concepts.push({ type: 'topic', label: defaultTopic });
    return concepts;
  }

  // 1. Extract main topic/title
  const mainTopicMatch = text.match(/^#+\s+(.+)$/m);
  const mainTopic = mainTopicMatch ? mainTopicMatch[1].trim().replace(/[#*`_]/g, '') : defaultTopic;
  concepts.push({ type: 'topic', label: mainTopic });

  const lines = text.split('\n');
  const seenLabels = new Set<string>([mainTopic.toLowerCase()]);

  const boldRegex = /\*\*([^\*]+)\*\*/g;
  const formulaRegex = /(\$\$[^$]+\$\$|\$[^\$]+\$)/g;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check for Subheadings (### Sub-chapter/Concept)
    if (trimmed.startsWith('###')) {
      const heading = trimmed.replace(/^###+\s*/, '').trim().replace(/[#*`_]/g, '');
      if (heading && !seenLabels.has(heading.toLowerCase()) && heading.length < 50) {
        seenLabels.add(heading.toLowerCase());
        concepts.push({ type: 'concept', label: heading });
      }
      return;
    }

    // Check for formulas ($E=mc^2$)
    let formulaMatch;
    while ((formulaMatch = formulaRegex.exec(trimmed)) !== null) {
      const formula = formulaMatch[1].replace(/\$/g, '').trim();
      if (formula && formula.length > 2 && formula.length < 60 && !seenLabels.has(formula.toLowerCase())) {
        seenLabels.add(formula.toLowerCase());
        concepts.push({ type: 'formula', label: formula });
      }
    }

    // Check for bold terms (like definitions)
    let boldMatch;
    while ((boldMatch = boldRegex.exec(trimmed)) !== null) {
      const term = boldMatch[1].trim().replace(/[#*`_]/g, '');
      if (term && term.length > 2 && term.length < 30 && !seenLabels.has(term.toLowerCase())) {
        // Form a simple context snippet
        const snippet = trimmed.length > 90 ? trimmed.slice(0, 90) + '...' : trimmed;
        seenLabels.add(term.toLowerCase());
        concepts.push({ 
          type: 'definition', 
          label: term,
          details: snippet.replace(/\*\*+/g, '')
        });
      }
    }
  });

  // Return the main topic and a balanced list of secondary nodes (max 8 secondary nodes)
  return [
    concepts[0],
    ...concepts.slice(1).slice(0, 8)
  ];
}

export function MindMapWorkspace({
  activeChapter,
  pageContent,
  onClose,
  onSelectLesson
}: MindMapWorkspaceProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const defaultTopicName = activeChapter 
    ? `Unit ${activeChapter.chapterNumber || ''}: ${activeChapter.name}`
    : 'Curriculum Unit';

  // Compute nodes and edges dynamically based on the pageContent and activeChapter
  const { initialNodes, initialEdges } = useMemo(() => {
    const semanticItems = parseSemanticConcepts(pageContent, defaultTopicName);
    
    if (semanticItems.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }

    const generatedNodes: any[] = [];
    const generatedEdges: any[] = [];

    // The central topic node
    const centralItem = semanticItems[0];
    const centralNodeId = 'node-central-topic';

    generatedNodes.push({
      id: centralNodeId,
      type: 'input',
      data: { label: centralItem.label },
      position: { x: 300, y: 220 },
      style: {
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        color: '#ffffff',
        border: '2px solid #a78bfa',
        borderRadius: '12px',
        padding: '12px 18px',
        fontWeight: 'bold',
        fontSize: '13px',
        boxShadow: '0 0 20px rgba(124, 58, 237, 0.45)',
        width: 220,
        textAlign: 'center' as const
      } as React.CSSProperties
    });

    const secondaryItems = semanticItems.slice(1);
    const numSecondary = secondaryItems.length;
    const radiusX = 260;
    const radiusY = 190;

    secondaryItems.forEach((item, index) => {
      const angle = (index * 2 * Math.PI) / numSecondary;
      const xOffset = radiusX * Math.cos(angle);
      const yOffset = radiusY * Math.sin(angle);
      const nodeId = `node-secondary-${index}`;

      // Customize node style and color based on semantic type
      let background = 'rgba(15, 23, 42, 0.85)';
      let border = '1px solid #4f46e5';
      let textColor = '#e2e8f0';
      let edgeColor = '#818cf8';
      let fontStyle = 'normal';
      let displayLabel = item.label;

      if (item.type === 'concept') {
        border = '1px solid #6366f1';
        background = 'rgba(17, 24, 39, 0.9)';
      } else if (item.type === 'definition') {
        border = '1px solid #10b981';
        textColor = '#34d399';
        edgeColor = '#10b981';
        displayLabel = `Def: ${item.label}`;
      } else if (item.type === 'formula') {
        border = '1px solid #06b6d4';
        textColor = '#22d3ee';
        edgeColor = '#06b6d4';
        fontStyle = 'italic';
      }

      generatedNodes.push({
        id: nodeId,
        type: 'output',
        data: { 
          label: displayLabel,
          tooltip: item.details
        },
        position: { x: 300 + xOffset, y: 220 + yOffset },
        style: {
          background,
          color: textColor,
          border,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          width: 170,
          fontStyle,
          textAlign: 'center' as const,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.2s ease-in-out'
        } as React.CSSProperties
      });

      // Animated connector edge showing semantic relationships
      generatedEdges.push({
        id: `edge-central-to-${nodeId}`,
        source: centralNodeId,
        target: nodeId,
        animated: true,
        style: { stroke: edgeColor, strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor
        }
      });
    });

    return { initialNodes: generatedNodes, initialEdges: generatedEdges };
  }, [pageContent, defaultTopicName]);

  // Reset and position fresh nodes/edges cleanly when pageContent or topic changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[80vh] bg-slate-950/95 border border-purple-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-purple-900/40 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-950/60 rounded-lg border border-purple-800/40">
              <Network className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-md font-bold text-white tracking-tight flex items-center gap-2">
                Mind Map
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-medium">
                  Semantic
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                AI-extracted key concepts, formulas, and definitions from the active page.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-all"
            title="Close Mind Map"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 bg-slate-950 relative h-full">
          {pageContent ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-right"
              className="bg-[#030712]"
            >
              <Background color="#1e1b4b" gap={16} size={1} />
              <Controls className="bg-slate-900 border border-slate-800 text-white rounded shadow-lg [&_button]:border-slate-800 [&_button]:bg-slate-900 [&_svg]:fill-white [&_button:hover]:bg-slate-800" />
              <MiniMap 
                nodeStrokeColor={(n) => {
                  if (n.id === 'node-central-topic') return '#7c3aed';
                  return '#4f46e5';
                }}
                nodeColor={(n) => {
                  if (n.id === 'node-central-topic') return '#7c3aed';
                  return '#0f172a';
                }}
                className="bg-slate-900 border border-slate-800 rounded shadow-lg overflow-hidden"
              />
            </ReactFlow>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Activity className="h-8 w-8 text-purple-500 animate-spin" />
              <p className="text-xs">No active textbook content to parse.</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-slate-900/60 border-t border-purple-900/20 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
          <div className="flex items-center space-x-4 flex-wrap gap-y-1">
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_#7c3aed]"></span>
              <span>Central Theme</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-800 border border-indigo-500"></span>
              <span>Key Concept</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-800 border border-emerald-500"></span>
              <span>Definition</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-800 border border-cyan-500"></span>
              <span>Formula</span>
            </span>
          </div>
          <div className="flex items-center space-x-1 mt-1 sm:mt-0">
            <HelpCircle className="h-3 w-3 text-purple-400" />
            <span>Mouse wheel zooms. Nodes reset and re-summarize when page content updates.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
