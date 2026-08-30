'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as d3 from 'd3';
import { 
  ArrowLeft, RefreshCw, ZoomIn, ZoomOut, Maximize2, BookOpen, Layers, Info, X, ExternalLink, AlertTriangle
} from 'lucide-react';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  grade: number;
  group: string;
  subject: string;
  definition: {
    en: string;
    am: string;
    so: string;
    om: string;
  };
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
}

const GRADE_COLORS: Record<number, string> = {
  7: '#10b981',  // Emerald
  8: '#14b8a6',  // Teal
  9: '#06b6d4',  // Cyan
  10: '#6366f1', // Indigo
  11: '#a855f7', // Purple
  12: '#ec4899', // Pink
};

const CONCEPT_REDIRECTS: Record<string, { grade: string, subject: string, lesson: string, page: string }> = {
  cell_division: { grade: "10", subject: "biology", lesson: "cell_division", page: "1" },
  photosynthesis: { grade: "10", subject: "biology", lesson: "photosynthesis", page: "8" },
  gravitational_force: { grade: "10", subject: "physics", lesson: "gravitational_force", page: "1" },
  atomic_structure: { grade: "10", subject: "chemistry", lesson: "atomic_structure", page: "1" },
  ethiopian_federalism: { grade: "10", subject: "citizenship", lesson: "ethiopian_federalism", page: "1" },
  newtonian_mechanics: { grade: "11", subject: "physics", lesson: "newtonian_mechanics", page: "1" },
  electromagnetism: { grade: "12", subject: "physics", lesson: "electromagnetism", page: "1" },
  integral_calculus: { grade: "12", subject: "mathematics", lesson: "integral_calculus", page: "1" },
  nile_basin_geography: { grade: "10", subject: "geography", lesson: "nile_basin_geography", page: "1" },
  ancient_aksum: { grade: "10", subject: "history", lesson: "ancient_aksum", page: "1" },
  genetic_ingestion: { grade: "11", subject: "biology", lesson: "genetic_ingestion", page: "1" },
  quadratic_equations: { grade: "9", subject: "mathematics", lesson: "quadratic_equations", page: "1" },
  chemical_bonding: { grade: "9", subject: "chemistry", lesson: "chemical_bonding", page: "1" }
};

export default function CognitiveGraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrades, setSelectedGrades] = useState<Record<number, boolean>>({
    7: true, 8: true, 9: true, 10: true, 11: true, 12: true
  });
  
  // Selected Node drawer state
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [definitionLang, setDefinitionLang] = useState<'en' | 'am' | 'so' | 'om'>('en');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<any>(null);

  const fetchGraphData = async () => {
    setLoading(true);
    setError('');
    try {
      const subjectQuery = selectedSubject !== 'all' ? `?subject=${selectedSubject}` : '';
      const res = await fetch(`/api/graph/nodes${subjectQuery}`);
      if (!res.ok) {
        throw new Error(`Failed to load graph nodes: ${res.statusText}`);
      }
      const data = await res.json();
      setNodes(data.nodes || []);
      setLinks(data.links || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to API proxy.');
      // Load offline high-fidelity mockup fallback
      const mockNodes: GraphNode[] = [
        { id: "cell_division", label: "Cell Division", grade: 10, group: "Biology", subject: "biology", definition: { en: "Cell division is the process by which a parent cell divides into two or more daughter cells.", am: "ሴል ክፍፍል የአንድ ወላጅ ሴል ወደ ሁለት ወይም ከዚያ በላይ የሚከፈልበት ሂደት ነው።", so: "Qaybinta unugyadu waa habka uu unugga waalidku ugu qaybsamo laba ama wax ka badan.", om: "Qooddamiinsi seelii adeemsa seeliin dhalootaa seelota ijoollee itti qoodamudha." } },
        { id: "photosynthesis", label: "Photosynthesis", grade: 10, group: "Biology", subject: "biology", definition: { en: "Photosynthesis converts light energy into chemical energy in plants.", am: "ፎቶሲንተሲስ እፅዋት የብርሃን ኃይልን ወደ ኬሚካላዊ ኃይል ለመለወጥ የሚጠቀሙበት ሂደት ነው።", so: "Photosynthesis waa habka ay dhirtu u isticmaasho si ay tamarta iftiinka ugu beddesho tamar kiimiko.", om: "Fotoosintasis adeemsa biqiltoonni anniisaa ifaa gara anniisaa keemikaalaatti geeddaruuf itti fayyadaman." } },
        { id: "gravitational_force", label: "Gravitational Force", grade: 10, group: "Physics", subject: "physics", definition: { en: "Gravitational force is the universal force of attraction between masses.", am: "የስበት ኃይል በሁሉም ቁስ አካላት መካከል የሚሠራ የመሳሳብ ኃይል ነው።", so: "Awoodda cufis-jiidadku waa awoodda soo-jiidashada ee ka dhex jirta dhammaan walxaha.", om: "Humna Hursiisaa (Gravitational force) humna wal-hursiisa uumamaa waantota hunda gidduutti dalagudha." } },
        { id: "atomic_structure", label: "Atomic Structure", grade: 10, group: "Chemistry", subject: "chemistry", definition: { en: "Atomic structure refers to the nucleus and surrounding electrons.", am: "የአቶም መዋቅር የሚያመለክተው አቶም በፕሮቶኖች እና ኒውትሮኖች ኒውክሊየስ የተገነባ መሆኑን ነው።", so: "Qaab-dhismeedka atomku wuxuu ka kooban yahay bu'da borotoonnada iyo niyutroonnada.", om: "Caasaan Atomii ijaarsa atoomii niwkleesii marsame argisiisa." } },
        { id: "ethiopian_federalism", label: "Ethiopian Federalism", grade: 10, group: "Civics", subject: "citizenship", definition: { en: "System of governance based on ethnic regional states sharing power.", am: "የኢትዮጵያ ፌዴራሊዝም በብሔረሰቦች ክልላዊ መንግሥታት ላይ የተመሠረተ የሥልጣን ሥርዓት ነው።", so: "Federaalka Itoobiya waa nidaam maamul oo ku salaysan ismaamullada qowmiyadaha.", om: "Federaalizmiin Itoophiyaa sirna bulchiinsaa naannolee sabummaa irratti hundaa'eedha." } },
        { id: "newtonian_mechanics", label: "Newtonian Mechanics", grade: 11, group: "Physics", subject: "physics", definition: { en: "Newtonian mechanics describes object motions under forces.", am: "ኒውቶኒያን መካኒክስ በኒውተን ሕጎች መሠረት የቁሶችን እንቅስቃሴ ያብራራል።", so: "Mekanikada Newtonian waxay sharraxaysaa dhaqdhaqaaqa walxaha.", om: "Mekaanksiin Niwtoniyaanii sochii wantoota gugurdoo dhiibbaa humnootaa jala jiran ibsa." } },
        { id: "electromagnetism", label: "Electromagnetism", grade: 12, group: "Physics", subject: "physics", definition: { en: "Branch of physics studying electromagnetic fields and forces.", am: "ኤሌክትሮማግኔቲዝም የኤሌክትሮማግኔቲክ ኃይልን የሚያጠና የፊዚክስ ዘርፍ ነው።", so: "Laan ka mid ah fiisigiska oo ku saabsan barashada xoogga korantada iyo magnet-ka.", om: "Elektromaagneetizmiin damee fiiziksii kan humna elektromaagneetikaa qo'atudha." } },
        { id: "integral_calculus", label: "Integral Calculus", grade: 12, group: "Mathematics", subject: "mathematics", definition: { en: "Integral calculus concerns areas under curves and accumulation.", am: "ኢንተግራል ካልኩለስ ከከርቭ በታች ያሉ ቦታዎችን ለማስላት የሚያገለግል የሂሳብ ዘርፍ ነው።", so: "Integral calculus waa laan xisaabeed oo khuseysa bedka ka hooseeya xariijimaha qalloocan.", om: "Kuusa shallagaa damee herregaa kan kuufama shallaguuf gargaarudha." } }
      ];
      const mockLinks: GraphLink[] = [
        { source: "atomic_structure", target: "chemical_bonding", type: "prerequisite_of" },
        { source: "newtonian_mechanics", "target": "gravitational_force", type: "prerequisite_of" },
        { source: "newtonian_mechanics", "target": "electromagnetism", type: "prerequisite_of" },
        { source: "cell_division", "target": "photosynthesis", type: "prerequisite_of" }
      ];
      setNodes(mockNodes);
      setLinks(mockLinks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [selectedSubject]);

  const handleGradeToggle = (grade: number) => {
    setSelectedGrades(prev => ({
      ...prev,
      [grade]: !prev[grade]
    }));
  };

  const filteredNodes = nodes.filter(node => selectedGrades[node.grade] === true);
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = links.filter(link => {
    const srcId = typeof link.source === 'object' ? link.source.id : link.source;
    const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
    return filteredNodeIds.has(srcId) && filteredNodeIds.has(tgtId);
  });

  useEffect(() => {
    if (!svgRef.current || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 500;

    const gContainer = svg.append('g').attr('class', 'graph-container');

    // Zoom setup
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        gContainer.attr('transform', event.transform);
      });

    zoomRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    // Marker arrow
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#334155');

    // Make deep copies of filtered data for D3 to mutate coordinates safely
    const d3Nodes: GraphNode[] = filteredNodes.map(n => ({ ...n }));
    const d3Links: GraphLink[] = filteredLinks.map(l => {
      const srcId = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
      return {
        source: srcId,
        target: tgtId,
        type: l.type
      };
    });

    const simulation = d3.forceSimulation<GraphNode>(d3Nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(d3Links)
        .id(d => d.id)
        .distance(160)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(45));

    // Render links
    const link = gContainer.append('g')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .selectAll('line')
      .data(d3Links)
      .join('line')
      .attr('marker-end', 'url(#arrow)');

    // Render nodes
    const node = gContainer.append('g')
      .selectAll('g')
      .data(d3Nodes)
      .join('g')
      .attr('class', 'node-group cursor-pointer')
      .call(d3.drag<any, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event, d) => {
        // Resolve original node ref to get complete definition structure
        const origNode = nodes.find(n => n.id === d.id);
        if (origNode) {
          setSelectedNode(origNode);
        }
      });

    // Node circles with glowing ring
    node.append('circle')
      .attr('r', 18)
      .attr('fill', d => GRADE_COLORS[d.grade] || '#6366f1')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))');

    // Node text labels
    node.append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', 28)
      .attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 2px 4px #000');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0);

      node.attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, selectedGrades, loading]);

  const zoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const zoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 0.7);
    }
  };

  const resetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(
        zoomRef.current.transform, 
        d3.zoomIdentity
      );
    }
  };

  const activeRedirect = selectedNode ? CONCEPT_REDIRECTS[selectedNode.id] : null;

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans">
      
      {/* Top Header Navigator */}
      <header className="border-b border-slate-900 bg-[#0b0b0f] px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-85">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-900 rounded-lg transition-colors group">
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-950 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-indigo-900/60 uppercase tracking-wider">
                Sprint 10
              </span>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                Cognitive Knowledge Graph
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualize cross-grade prerequisites, subjects linkages, and curriculum milestones
            </p>
          </div>
        </div>
        
        <button 
          onClick={fetchGraphData}
          className="flex items-center space-x-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 px-3.5 py-2 rounded-lg transition-colors border border-slate-800/80"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Network</span>
        </button>
      </header>

      {/* Main Graph Workspace Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Control Panel / Filters */}
        <aside className="w-80 border-r border-slate-950 bg-[#09090d]/90 p-6 flex flex-col space-y-6 shrink-0 overflow-y-auto">
          
          {/* Subject Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Core Subject Domain
            </label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-[#0d0d12] border border-slate-900 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
              >
                <option value="all">All Subjects</option>
                <option value="biology">Biology</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="mathematics">Mathematics</option>
                <option value="geography">Geography</option>
                <option value="history">History</option>
                <option value="citizenship">Civics & Citizenship</option>
              </select>
            </div>
          </div>

          {/* Grade Level Selection Checkboxes */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Grade Filter Toggles
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[7, 8, 9, 10, 11, 12].map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeToggle(grade)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all font-medium ${
                    selectedGrades[grade] 
                      ? 'bg-slate-950 border-slate-800 text-slate-200' 
                      : 'bg-transparent border-slate-950/40 text-slate-600 hover:text-slate-400'
                  }`}
                >
                  <span>Grade {grade}</span>
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: GRADE_COLORS[grade] }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Color Legend Info panel */}
          <div className="border-t border-slate-900 pt-5 space-y-3 flex-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Node Grade Legend
            </span>
            <div className="space-y-2">
              {[7, 8, 9, 10, 11, 12].map((g) => (
                <div key={g} className="flex items-center space-x-3 text-xs text-slate-400">
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-slate-950 shrink-0" 
                    style={{ backgroundColor: GRADE_COLORS[g] }} 
                  />
                  <span>Grade {g} Concepts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips block */}
          <div className="bg-[#0b0c15] border border-indigo-950/50 rounded-lg p-4 flex items-start space-x-3 text-xs text-indigo-400/90 leading-relaxed mt-auto">
            <Info className="w-4 h-4 shrink-0 text-indigo-500" />
            <div>
              <p className="font-semibold text-indigo-300">Graph Interactivity</p>
              <p className="mt-1">Drag concepts around to test physics, use mouse scroll to zoom or pan, and click any node to read definitions.</p>
            </div>
          </div>

        </aside>

        {/* Center SVG Force Directed Network Canvas */}
        <main className="flex-1 relative flex flex-col bg-[#040407]">
          
          {/* Zoom Controls Overlay */}
          <div className="absolute bottom-6 right-6 flex items-center space-x-1.5 z-10 bg-[#0d0d12]/95 border border-slate-900 p-1.5 rounded-lg shadow-xl shadow-black/80">
            <button 
              onClick={zoomIn} 
              className="p-2 hover:bg-slate-950 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={zoomOut} 
              className="p-2 hover:bg-slate-950 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={resetZoom} 
              className="p-2 hover:bg-slate-950 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
              <span className="text-sm font-medium">Extracting cognitive network nodes...</span>
            </div>
          ) : filteredNodes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 px-6 text-center">
              <Layers className="w-10 h-10 text-slate-700 mb-3" />
              <span className="text-sm font-medium">No concepts matched your grade filter selections.</span>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">Toggle on grade checkboxes in the filter panel to display cognitive paths.</p>
            </div>
          ) : (
            <svg 
              ref={svgRef} 
              className="w-full h-full block focus:outline-none"
            />
          )}

        </main>

        {/* Right Collapsible Detail Side Drawer */}
        {selectedNode && (
          <aside className="w-96 border-l border-slate-950 bg-[#09090d]/95 p-6 flex flex-col space-y-6 shrink-0 overflow-y-auto absolute right-0 top-0 bottom-0 z-30 shadow-2xl shadow-black/90 animate-in slide-in-from-right duration-250">
            
            {/* Drawer Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded font-medium inline-block">
                  {selectedNode.group} (Grade {selectedNode.grade})
                </span>
                <h2 className="text-lg font-bold text-slate-100 tracking-tight mt-1.5">
                  {selectedNode.label}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Definition Card with Language Selector Tabs */}
            <div className="bg-[#0b0c13] border border-slate-900 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900/80 pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Concept Definition
                </span>
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-md border border-slate-900/60">
                  {(['en', 'am', 'so', 'om'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setDefinitionLang(lang)}
                      className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors ${
                        definitionLang === lang 
                          ? 'bg-indigo-900/40 text-indigo-400' 
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-normal min-h-[80px]">
                {selectedNode.definition[definitionLang]}
              </p>
            </div>

            {/* Jump to Reader redirect Link */}
            {activeRedirect ? (
              <Link
                href={`/reader?grade=${activeRedirect.grade}&subject=${activeRedirect.subject}&lesson=${activeRedirect.lesson}&page=${activeRedirect.page}`}
                className="flex items-center justify-center space-x-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-sm font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer w-full mt-auto"
              >
                <BookOpen className="w-4 h-4" />
                <span>Jump to Lesson Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="bg-[#180f11] border border-rose-950/30 rounded-lg p-4 flex items-start space-x-3 text-xs text-rose-400 mt-auto">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <div>
                  <p className="font-semibold text-rose-300">Navigation Unavailable</p>
                  <p className="mt-1">No matching reading document has been mapped to this concept tag yet.</p>
                </div>
              </div>
            )}

          </aside>
        )}

      </div>
    </div>
  );
}
