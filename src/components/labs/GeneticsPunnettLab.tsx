import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RefreshCw, LayoutGrid, Dna } from 'lucide-react';

interface GeneticsPunnettLabProps {
  onUpdateState: (state: any) => void;
}

export default function GeneticsPunnettLab({ onUpdateState }: GeneticsPunnettLabProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Cross Mode
  const [crossMode, setCrossMode] = useState<'MONOHYBRID' | 'DIHYBRID'>('MONOHYBRID');

  // Parental Genotypes
  const [parent1Mono, setParent1Mono] = useState<string>('Tt');
  const [parent2Mono, setParent2Mono] = useState<string>('Tt');

  const [parent1Di, setParent1Di] = useState<string>('YyRr');
  const [parent2Di, setParent2Di] = useState<string>('YyRr');

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dnaGroupRef = useRef<THREE.Group | null>(null);

  // Sync state to parent for AI tutor
  useEffect(() => {
    const monoOutcome = solveMonohybrid(parent1Mono, parent2Mono);
    const diOutcome = solveDihybrid(parent1Di, parent2Di);

    onUpdateState({
      activeGeneticsMode: crossMode,
      parent1Genotype: crossMode === 'MONOHYBRID' ? parent1Mono : parent1Di,
      parent2Genotype: crossMode === 'MONOHYBRID' ? parent2Mono : parent2Di,
      calculatedRatios: crossMode === 'MONOHYBRID' ? monoOutcome.ratios : diOutcome.ratios,
      monohybridRatios: monoOutcome.ratios,
      dihybridRatios: diOutcome.ratios,
      complementaryRule: 'A-T (Adenine-Thymine), C-G (Cytosine-Guanine)'
    });
  }, [crossMode, parent1Mono, parent2Mono, parent1Di, parent2Di]);

  // Three.js 3D DNA Helix Render
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030303');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 0.5);
    purpleLight.position.set(-5, -5, -5);
    scene.add(purpleLight);

    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);
    dnaGroupRef.current = dnaGroup;

    // Procedural double helix construction
    // We draw backbones and colored base pairing rungs
    const pointsCount = 36;
    const helixRadius = 1.6;
    const coilCount = 2.5;

    // Base materials
    const backboneMat = new THREE.MeshStandardMaterial({ color: '#4b5563', roughness: 0.3 }); // Grey backbone
    const aMat = new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.4 }); // Adenine: Green
    const tMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 }); // Thymine: Red
    const cMat = new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.4 }); // Cytosine: Blue
    const gMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.4 }); // Guanine: Yellow

    const spheresGroup = new THREE.Group();
    dnaGroup.add(spheresGroup);

    const sphereGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const rungGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);

    for (let i = 0; i < pointsCount; i++) {
      const angle = (i / pointsCount) * Math.PI * 2 * coilCount;
      const y = (i / pointsCount) * 6 - 3; // From y=-3 to y=3

      // Strand 1 position
      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;

      // Strand 2 position (180 degrees offset)
      const x2 = Math.cos(angle + Math.PI) * helixRadius;
      const z2 = Math.sin(angle + Math.PI) * helixRadius;

      // Backbone spheres
      const s1 = new THREE.Mesh(sphereGeo, backboneMat);
      s1.position.set(x1, y, z1);
      spheresGroup.add(s1);

      const s2 = new THREE.Mesh(sphereGeo, backboneMat);
      s2.position.set(x2, y, z2);
      spheresGroup.add(s2);

      // Colored base rungs (ladder connections)
      if (i % 2 === 0) {
        // Base pair matching (A-T or C-G)
        const isAT = i % 4 === 0;
        const colorMat1 = isAT ? aMat : cMat;
        const colorMat2 = isAT ? tMat : gMat;

        // Draw left rung half
        const leftRung = new THREE.Mesh(rungGeo, colorMat1);
        leftRung.position.set((x1 + 0) / 2, y, (z1 + 0) / 2);
        leftRung.scale.set(1, helixRadius, 1);
        leftRung.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(x1, 0, z1).normalize()
        );
        spheresGroup.add(leftRung);

        // Draw right rung half
        const rightRung = new THREE.Mesh(rungGeo, colorMat2);
        rightRung.position.set((x2 + 0) / 2, y, (z2 + 0) / 2);
        rightRung.scale.set(1, helixRadius, 1);
        rightRung.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(x2, 0, z2).normalize()
        );
        spheresGroup.add(rightRung);
      }
    }

    // Animation loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      dnaGroup.rotation.y += 0.01;
      dnaGroup.rotation.x = Math.sin(Date.now() * 0.0005) * 0.2;
      renderer.render(scene, camera);
    };
    reqId = requestAnimationFrame(animate);

    // Resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 280;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        try {
          mountRef.current?.removeChild(rendererRef.current.domElement);
        } catch (e) {}
      }
    };
  }, []);

  // Monohybrid cross solver (e.g. Tt x Tt)
  const solveMonohybrid = (p1: string, p2: string) => {
    const a1 = p1.split('');
    const a2 = p2.split('');
    
    // Fallbacks if input formats are wrong
    const g1 = [a1[0] || 'T', a1[1] || 't'];
    const g2 = [a2[0] || 'T', a2[1] || 't'];

    // Generate grid combinations
    const grid = [
      [g1[0] + g2[0], g1[0] + g2[1]],
      [g1[1] + g2[0], g1[1] + g2[1]]
    ].map(row => 
      row.map(allele => {
        // Standard sort: capital letter first (e.g. tT -> Tt)
        const parts = allele.split('');
        if (parts[0] !== parts[0].toUpperCase() && parts[1] === parts[1].toUpperCase()) {
          return parts[1] + parts[0];
        }
        return allele;
      })
    );

    // Counts
    const counts: { [key: string]: number } = {};
    grid.flat().forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    // Ratios breakdown text
    const total = 4;
    const breakdown = Object.entries(counts).map(([geno, count]) => {
      const pct = (count / total) * 100;
      return `${geno}: ${count}/${total} (${pct}%)`;
    });

    return { grid, g1, g2, ratios: breakdown.join(' | ') };
  };

  // Dihybrid cross solver (e.g. YyRr x YyRr)
  const solveDihybrid = (p1: string, p2: string) => {
    // Parent gametes (e.g. YyRr -> YR, Yr, yR, yr)
    const getGametes = (genotype: string) => {
      const g = genotype.split('');
      const g1 = [g[0] || 'Y', g[1] || 'y'];
      const g2 = [g[2] || 'R', g[3] || 'r'];
      
      return [
        g1[0] + g2[0],
        g1[0] + g2[1],
        g1[1] + g2[0],
        g1[1] + g2[1]
      ];
    };

    const gametes1 = getGametes(p1);
    const gametes2 = getGametes(p2);

    // Grid combinations
    const grid: string[][] = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        // Merge e.g. YR + YR -> YYRR
        const sub1 = gametes1[i];
        const sub2 = gametes2[j];
        
        // Sort alleles: Ys first, Rs second, capital first
        const yAlleles = [sub1[0], sub2[0]].sort().join('');
        const rAlleles = [sub1[1], sub2[1]].sort().join('');
        
        // Check capital sort
        const cleanY = (yAlleles[0] !== yAlleles[0].toUpperCase() && yAlleles[1] === yAlleles[1].toUpperCase()) ? yAlleles[1] + yAlleles[0] : yAlleles;
        const cleanR = (rAlleles[0] !== rAlleles[0].toUpperCase() && rAlleles[1] === rAlleles[1].toUpperCase()) ? rAlleles[1] + rAlleles[0] : rAlleles;

        row.push(cleanY + cleanR);
      }
      grid.push(row);
    }

    // Phenotype calculation (assuming Y = Yellow, y = green, R = Round, r = wrinkled)
    const phenotypes: { [key: string]: number } = {
      'Yellow Round (Y_R_)': 0,
      'Yellow Wrinkled (Y_rr)': 0,
      'Green Round (yyR_)': 0,
      'Green Wrinkled (yyrr)': 0
    };

    grid.flat().forEach(g => {
      const hasDomY = g.includes('Y');
      const hasDomR = g.includes('R');
      if (hasDomY && hasDomR) phenotypes['Yellow Round (Y_R_)']++;
      else if (hasDomY && !hasDomR) phenotypes['Yellow Wrinkled (Y_rr)']++;
      else if (!hasDomY && hasDomR) phenotypes['Green Round (yyR_)']++;
      else phenotypes['Green Wrinkled (yyrr)']++;
    });

    const total = 16;
    const breakdown = Object.entries(phenotypes).filter(([_, count]) => count > 0).map(([ph, count]) => {
      const pct = Math.round((count / total) * 100);
      return `${ph}: ${count}/${total} (${pct}%)`;
    });

    return { grid, gametes1, gametes2, ratios: breakdown.join(' | ') };
  };

  const monoOutcome = solveMonohybrid(parent1Mono, parent2Mono);
  const diOutcome = solveDihybrid(parent1Di, parent2Di);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* 3D DNA Double Helix Column */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl flex flex-col relative h-[340px] shadow-2xl">
        <h4 className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest font-mono flex items-center space-x-1.5 z-10">
          <Dna className="h-4 w-4 text-purple-500" />
          <span>DNA Structural Helix View</span>
        </h4>
        <div ref={mountRef} className="w-full flex-1" />

        {/* Legend color map */}
        <div className="absolute bottom-4 left-4 right-4 bg-gray-950/80 border border-gray-900 rounded-xl p-2.5 flex justify-around text-[9px] font-bold font-mono">
          <span className="text-emerald-400">A (Adenine)</span>
          <span className="text-red-400">T (Thymine)</span>
          <span className="text-blue-400">C (Cytosine)</span>
          <span className="text-amber-500">G (Guanine)</span>
        </div>
      </div>

      {/* Punnett grid panel */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 flex flex-col justify-between">
        
        <div>
          {/* Header & Modes */}
          <div className="flex justify-between items-center border-b border-gray-900 pb-2.5">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono flex items-center space-x-1.5">
              <LayoutGrid className="h-4 w-4 text-purple-500" />
              <span>Genotype Punnett Cross</span>
            </h3>
            <div className="flex space-x-1">
              {['MONOHYBRID', 'DIHYBRID'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setCrossMode(mode as any)}
                  className={`px-3 py-1 text-[9px] font-black rounded-lg border cursor-pointer transition-all ${
                    crossMode === mode 
                      ? 'bg-purple-900/30 border-purple-800 text-purple-300' 
                      : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Parental inputs */}
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono">
            {crossMode === 'MONOHYBRID' ? (
              <>
                <div className="space-y-1">
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Parent 1 (Alleles)</span>
                  <select
                    value={parent1Mono}
                    onChange={(e) => setParent1Mono(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    {['TT', 'Tt', 'tt'].map(g => <option key={g} value={g}>{g} (Tall/Short)</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Parent 2 (Alleles)</span>
                  <select
                    value={parent2Mono}
                    onChange={(e) => setParent2Mono(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    {['TT', 'Tt', 'tt'].map(g => <option key={g} value={g}>{g} (Tall/Short)</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Parent 1 (Traits)</span>
                  <select
                    value={parent1Di}
                    onChange={(e) => setParent1Di(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-600 cursor-pointer animate-in fade-in"
                  >
                    {['YYRR', 'YYRr', 'YyRR', 'YyRr', 'yyrr'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Parent 2 (Traits)</span>
                  <select
                    value={parent2Di}
                    onChange={(e) => setParent2Di(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-600 cursor-pointer animate-in fade-in"
                  >
                    {['YYRR', 'YYRr', 'YyRR', 'YyRr', 'yyrr'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Punnett grid layout */}
          <div className="mt-5 flex justify-center">
            {crossMode === 'MONOHYBRID' ? (
              <div className="grid grid-cols-3 gap-1.5 font-mono text-center text-xs w-[220px]">
                {/* Empty cell */}
                <div className="bg-transparent" />
                <div className="bg-gray-950 border border-gray-900 p-2 text-purple-400 font-bold rounded-lg">{monoOutcome.g2[0]}</div>
                <div className="bg-gray-950 border border-gray-900 p-2 text-purple-400 font-bold rounded-lg">{monoOutcome.g2[1]}</div>

                {/* Row 1 */}
                <div className="bg-gray-950 border border-gray-900 p-2 text-purple-400 font-bold flex items-center justify-center rounded-lg">{monoOutcome.g1[0]}</div>
                <div className="bg-purple-950/20 border border-purple-900/35 p-3 text-white font-black rounded-lg">{monoOutcome.grid[0][0]}</div>
                <div className="bg-purple-950/20 border border-purple-900/35 p-3 text-white font-black rounded-lg">{monoOutcome.grid[0][1]}</div>

                {/* Row 2 */}
                <div className="bg-gray-950 border border-gray-900 p-2 text-purple-400 font-bold flex items-center justify-center rounded-lg">{monoOutcome.g1[1]}</div>
                <div className="bg-purple-950/20 border border-purple-900/35 p-3 text-white font-black rounded-lg">{monoOutcome.grid[1][0]}</div>
                <div className="bg-purple-950/20 border border-purple-900/35 p-3 text-white font-black rounded-lg">{monoOutcome.grid[1][1]}</div>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1.5 font-mono text-center text-[10px] w-full max-w-[340px]">
                {/* Empty corner */}
                <div className="bg-transparent" />
                {diOutcome.gametes2.map((gm, idx) => (
                  <div key={`g2-${idx}`} className="bg-gray-950 border border-gray-900 p-1.5 text-purple-400 font-bold rounded-lg">{gm}</div>
                ))}

                {/* Rows */}
                {diOutcome.gametes1.map((gm1, rIdx) => (
                  <React.Fragment key={`row-${rIdx}`}>
                    <div className="bg-gray-950 border border-gray-900 p-1.5 text-purple-400 font-bold flex items-center justify-center rounded-lg">{gm1}</div>
                    {diOutcome.grid[rIdx].map((combo, cIdx) => (
                      <div key={`c-${rIdx}-${cIdx}`} className="bg-purple-950/15 border border-purple-900/25 p-2 text-white font-bold rounded-lg truncate">
                        {combo}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Calculation output ratios box */}
        <div className="bg-gray-950 border border-gray-900 rounded-xl p-3.5 mt-4 text-[10px] font-mono">
          <span className="text-gray-500 font-bold uppercase block border-b border-gray-900 pb-1">
            Phenotype / Genotype Probability
          </span>
          <div className="text-purple-300 leading-relaxed mt-1.5 font-bold">
            {crossMode === 'MONOHYBRID' ? monoOutcome.ratios : diOutcome.ratios}
          </div>
        </div>

      </div>
    </div>
  );
}
