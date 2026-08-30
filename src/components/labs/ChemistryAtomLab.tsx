import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ChemistryAtomLabProps {
  onUpdateState: (state: any) => void;
}

interface ChemicalElement {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  group: number;
  period: number;
  shells: number[]; // configuration e.g. [2, 8, 1]
  valency: number;
  category: string; // 'non-metal' | 'noble-gas' | 'alkali-metal' | 'alkaline-earth' | 'metalloid'
  color: string; // Periodic table background
}

export default function ChemistryAtomLab({ onUpdateState }: ChemistryAtomLabProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  
  // Element registry for initial rows
  const elements: ChemicalElement[] = [
    { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, group: 1, period: 1, shells: [1], valency: 1, category: 'non-metal', color: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' },
    { number: 2, symbol: 'He', name: 'Helium', mass: 4.003, group: 18, period: 1, shells: [2], valency: 0, category: 'noble-gas', color: 'bg-indigo-950/40 border-indigo-800/60 text-indigo-400' },
    { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, group: 1, period: 2, shells: [2, 1], valency: 1, category: 'alkali-metal', color: 'bg-rose-950/40 border-rose-800/60 text-rose-400' },
    { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.012, group: 2, period: 2, shells: [2, 2], valency: 2, category: 'alkaline-earth', color: 'bg-amber-950/40 border-amber-800/60 text-amber-400' },
    { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, group: 13, period: 2, shells: [2, 3], valency: 3, category: 'metalloid', color: 'bg-teal-950/40 border-teal-800/60 text-teal-400' },
    { number: 6, symbol: 'C', name: 'Carbon', mass: 12.011, group: 14, period: 2, shells: [2, 4], valency: 4, category: 'non-metal', color: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' },
    { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, group: 15, period: 2, shells: [2, 5], valency: 5, category: 'non-metal', color: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' },
    { number: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, group: 16, period: 2, shells: [2, 6], valency: 6, category: 'non-metal', color: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' },
    { number: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, group: 17, period: 2, shells: [2, 7], valency: 7, category: 'non-metal', color: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' },
    { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.18, group: 18, period: 2, shells: [2, 8], valency: 0, category: 'noble-gas', color: 'bg-indigo-950/40 border-indigo-800/60 text-indigo-400' },
    { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.99, group: 1, period: 3, shells: [2, 8, 1], valency: 1, category: 'alkali-metal', color: 'bg-rose-950/40 border-rose-800/60 text-rose-400' },
    { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, group: 2, period: 3, shells: [2, 8, 2], valency: 2, category: 'alkaline-earth', color: 'bg-amber-950/40 border-amber-800/60 text-amber-400' }
  ];

  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(elements[5]); // Default Carbon

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nucleusGroupRef = useRef<THREE.Group | null>(null);
  const electronsGroupRef = useRef<THREE.Group | null>(null);
  const orbitsGroupRef = useRef<THREE.Group | null>(null);

  // Sync state to parent for AI tutor
  useEffect(() => {
    onUpdateState({
      elementName: selectedElement.name,
      elementSymbol: selectedElement.symbol,
      atomicNumber: selectedElement.number,
      atomicMass: selectedElement.mass,
      electronConfiguration: selectedElement.shells.join(', '),
      valency: selectedElement.valency,
      category: selectedElement.category,
      protons: selectedElement.number,
      neutrons: Math.round(selectedElement.mass - selectedElement.number),
      electrons: selectedElement.number
    });
  }, [selectedElement]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 340;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030303');
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Dynamic groups
    const nucleusGroup = new THREE.Group();
    scene.add(nucleusGroup);
    nucleusGroupRef.current = nucleusGroup;

    const orbitsGroup = new THREE.Group();
    scene.add(orbitsGroup);
    orbitsGroupRef.current = orbitsGroup;

    const electronsGroup = new THREE.Group();
    scene.add(electronsGroup);
    electronsGroupRef.current = electronsGroup;

    // Simple Orbit Controls manually implemented
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      
      nucleusGroup.rotation.y += deltaX * 0.008;
      orbitsGroup.rotation.y += deltaX * 0.008;
      orbitsGroup.rotation.x += deltaY * 0.008;
      electronsGroup.rotation.y += deltaX * 0.008;
      electronsGroup.rotation.x += deltaY * 0.008;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Initial draw
    updateAtom(selectedElement);

    // Animation variables
    let lastTime = 0;
    let animationId: number;

    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);
      
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Slowly rotate nucleus and orbits
      if (!isDragging) {
        nucleusGroup.rotation.y += delta * 0.15;
        orbitsGroup.rotation.y += delta * 0.08;
        electronsGroup.rotation.y += delta * 0.08;
      }

      // Animate electrons moving along their circular paths
      const electronMeshes = electronsGroup.children;
      let meshIdx = 0;
      
      selectedElement.shells.forEach((shellCount, shellIdx) => {
        const radius = (shellIdx + 1) * 2.0;
        const speedMultiplier = 1.8 / (shellIdx + 1); // Inner shells move faster
        
        for (let i = 0; i < shellCount; i++) {
          const mesh = electronMeshes[meshIdx] as THREE.Mesh;
          if (mesh) {
            // Retrieve custom angles stored on meshes
            const currentAngle = (mesh.userData.angle || 0) + delta * speedMultiplier;
            mesh.userData.angle = currentAngle;
            
            // Bohr circle parametric calculation
            mesh.position.x = radius * Math.cos(currentAngle);
            mesh.position.z = radius * Math.sin(currentAngle);
            mesh.position.y = 0;
          }
          meshIdx++;
        }
      });

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 340;
      
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        try {
          mountRef.current?.removeChild(rendererRef.current.domElement);
        } catch (e) {}
      }
    };
  }, [selectedElement]);

  const updateAtom = (element: ChemicalElement) => {
    const scene = sceneRef.current;
    const nucleusGroup = nucleusGroupRef.current;
    const orbitsGroup = orbitsGroupRef.current;
    const electronsGroup = electronsGroupRef.current;
    if (!scene || !nucleusGroup || !orbitsGroup || !electronsGroup) return;
    
    // Clear old elements from groups
    const clearGroup = (group: THREE.Group) => {
      while (group.children.length > 0) {
        const obj = group.children[0];
        group.remove(obj);
      }
    };
    
    clearGroup(nucleusGroup);
    clearGroup(orbitsGroup);
    clearGroup(electronsGroup);
    
    // 1. Build Nucleus: Protons (Red) and Neutrons (Grey) packed closely
    const protonCount = element.number;
    const neutronCount = Math.round(element.mass - element.number);
    const particleRadius = 0.22;
    
    const pGeo = new THREE.SphereGeometry(particleRadius, 12, 12);
    const pMat = new THREE.MeshPhongMaterial({ color: '#ef4444', shininess: 30 }); // Red protons
    
    const nGeo = new THREE.SphereGeometry(particleRadius, 12, 12);
    const nMat = new THREE.MeshPhongMaterial({ color: '#4b5563', shininess: 10 }); // Grey neutrons
    
    const totalNucleons = protonCount + neutronCount;
    
    for (let i = 0; i < totalNucleons; i++) {
      const isProton = i < protonCount;
      const mesh = new THREE.Mesh(isProton ? pGeo : nGeo, isProton ? pMat : nMat);
      
      // Procedural packing coordinates using spherical Fibonacci distribution
      const phi = Math.acos(-1 + (2 * i) / totalNucleons);
      const theta = Math.sqrt(totalNucleons * Math.PI) * phi;
      const distance = 0.5 * Math.pow(Math.random(), 0.3); // Packed inside 0.5 units
      
      mesh.position.set(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.sin(phi) * Math.sin(theta),
        distance * Math.cos(phi)
      );
      
      nucleusGroup.add(mesh);
    }
    
    // 2. Build Energy Shell tracks (circle paths)
    const ringGeoPoints = 64;
    const lineMat = new THREE.LineBasicMaterial({ color: 'rgba(124, 58, 237, 0.4)' }); // Violet orbit line
    
    element.shells.forEach((_, idx) => {
      const radius = (idx + 1) * 2.0;
      const points = [];
      for (let i = 0; i <= ringGeoPoints; i++) {
        const theta = (i / ringGeoPoints) * Math.PI * 2;
        points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitLine = new THREE.Line(geometry, lineMat);
      orbitsGroup.add(orbitLine);
    });
    
    // 3. Build Electrons (Blue spheres) on shells
    const eGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const eMat = new THREE.MeshPhongMaterial({ color: '#60a5fa', emissive: '#1d4ed8', emissiveIntensity: 0.5 });
    
    element.shells.forEach((shellCount, shellIdx) => {
      const radius = (shellIdx + 1) * 2.0;
      for (let i = 0; i < shellCount; i++) {
        const electronMesh = new THREE.Mesh(eGeo, eMat);
        
        // Evenly space electrons initially
        const startingAngle = (i / shellCount) * Math.PI * 2;
        electronMesh.userData = { angle: startingAngle };
        
        electronMesh.position.x = radius * Math.cos(startingAngle);
        electronMesh.position.z = radius * Math.sin(startingAngle);
        electronMesh.position.y = 0;
        
        electronsGroup.add(electronMesh);
      }
    });
  };

  const handleZoom = (amount: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(5, Math.min(25, cameraRef.current.position.z + amount));
      cameraRef.current.position.y = Math.max(2, Math.min(15, cameraRef.current.position.y + amount * 0.7));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Simulation Workspace Panel */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl flex flex-col relative h-[360px] shadow-2xl">
        <div ref={mountRef} className="w-full flex-1 cursor-grab" />
        
        {/* Floating Controls */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <button 
            onClick={() => handleZoom(-1.5)} 
            className="bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-slate-350 p-2 rounded-xl transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleZoom(1.5)} 
            className="bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-slate-350 p-2 rounded-xl transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        {/* Warning label */}
        <div className="absolute bottom-4 left-4 right-4 bg-amber-950/15 border border-amber-900/30 rounded-xl p-3 text-[10px] text-amber-200 backdrop-blur-md italic font-medium leading-normal">
          ⚠️ Note: This atom is a simplified Bohr educational visualization and does not represent the exact probability distribution cloud of quantum mechanical electrons.
        </div>
      </div>

      {/* Periodic Table & Information Panel */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 flex flex-col space-y-6 justify-between">
        
        {/* Periodic Grid */}
        <div>
          <h3 className="text-sm font-extrabold text-white border-b border-gray-900 pb-2 uppercase tracking-widest font-mono">
            Interactive Element Registry
          </h3>
          
          <div className="grid grid-cols-6 gap-2 mt-4">
            {elements.map((el) => {
              const isActive = selectedElement.number === el.number;
              return (
                <button
                  key={el.number}
                  onClick={() => setSelectedElement(el)}
                  className={`p-2 border rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${el.color} ${
                    isActive ? 'ring-2 ring-purple-500 scale-105 shadow-md shadow-purple-900/30' : 'opacity-70 hover:opacity-100 hover:scale-102'
                  }`}
                >
                  <span className="text-[9px] font-mono text-gray-500 self-start">{el.number}</span>
                  <span className="text-lg font-black tracking-tighter">{el.symbol}</span>
                  <span className="text-[8px] font-medium truncate max-w-full">{el.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold">Element Name</span>
            <p className="text-white text-sm font-black mt-0.5">{selectedElement.name}</p>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold">Atomic Symbol</span>
            <p className="text-white text-sm font-black mt-0.5">{selectedElement.symbol} (Z={selectedElement.number})</p>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold">Electron Configuration</span>
            <p className="text-purple-400 text-sm font-black mt-0.5">{selectedElement.shells.join(', ')}</p>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold">Atomic Mass</span>
            <p className="text-white text-sm font-black mt-0.5">{selectedElement.mass.toFixed(3)} u</p>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold">Valency Electrons</span>
            <p className="text-white text-sm font-black mt-0.5">{selectedElement.valency}</p>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold">Neutron Count</span>
            <p className="text-white text-sm font-black mt-0.5">{Math.round(selectedElement.mass - selectedElement.number)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
