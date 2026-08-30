import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface MitosisDivisionLabProps {
  onUpdateState: (state: any) => void;
}

interface OrganelleInfo {
  name: string;
  role: string;
  description: string;
}

export default function MitosisDivisionLab({ onUpdateState }: MitosisDivisionLabProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Mitosis Stages
  const stages = [
    { name: 'Interphase', index: 0, description: 'The cell prepares for division. Chromosomes are duplicated but exist as loose, uncoiled chromatin fibers.' },
    { name: 'Prophase', index: 1, description: 'Chromatin condenses into distinct chromosomes. The nuclear envelope breaks down and centrioles move to opposite poles.' },
    { name: 'Metaphase', index: 2, description: 'Spindle fibers attach to centromeres, aligning the chromosomes along the central equatorial plate.' },
    { name: 'Anaphase', index: 3, description: 'Sister chromatids are pulled apart by spindle fiber contraction and migrate to opposite poles.' },
    { name: 'Telophase', index: 4, description: 'Chromatids reach the poles. New nuclear envelopes form, and the cell membrane begins to pinch (cleavage furrow).' },
    { name: 'Cytokinesis', index: 5, description: 'The cytoplasm divides completely, resulting in two identical daughter cells, each returning to interphase.' }
  ];

  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [selectedOrganelle, setSelectedOrganelle] = useState<OrganelleInfo | null>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cellGroupRef = useRef<THREE.Group | null>(null);

  const organelles: { [key: string]: OrganelleInfo } = {
    'Centriole': {
      name: 'Centriole',
      role: 'Organizes spindle fibers.',
      description: 'Cylindrical structures located at the poles of the cell during division. They anchor the mitotic spindle fibers.'
    },
    'Chromatid': {
      name: 'Sister Chromatid',
      role: 'Carries genetic information.',
      description: 'One of the two identical halves of a replicated chromosome. They condense during prophase and split during anaphase.'
    },
    'Centromere': {
      name: 'Centromere',
      role: 'Holds sister chromatids together.',
      description: 'The region of a chromosome where sister chromatids join and spindle fibers attach via the kinetochore.'
    },
    'Spindle Fiber': {
      name: 'Spindle Fiber',
      role: 'Pulls chromatids apart.',
      description: 'Microtubules that radiate from centrioles and attach to centromeres, generating mechanical force to pull chromatids.'
    }
  };

  // Sync state to parent for AI tutor
  useEffect(() => {
    onUpdateState({
      mitosisStageName: stages[activeStageIdx].name,
      stageNumber: `${activeStageIdx + 1}/6`,
      selectedOrganelle: selectedOrganelle ? selectedOrganelle.name : 'None',
      chromosomeSeparation: activeStageIdx >= 3 ? 'Separated / Polarized' : 'Joined at Equator',
      cellStatus: activeStageIdx === 5 ? 'Two Daughter Cells Formed' : 'Dividing Mother Cell'
    });
  }, [activeStageIdx, selectedOrganelle]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030303');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);
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
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const purpleLight = new THREE.DirectionalLight(0x7c3aed, 0.3);
    purpleLight.position.set(-5, -5, -5);
    scene.add(purpleLight);

    const cellGroup = new THREE.Group();
    scene.add(cellGroup);
    cellGroupRef.current = cellGroup;

    // Manual orbit drag rotation
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
      cellGroup.rotation.y += deltaX * 0.008;
      cellGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Click raycasting selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cellGroup.children, true);

      // Reset old highlights
      cellGroup.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissive.setHex(0x000000);
        }
      });

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        if (clickedMesh.name && organelles[clickedMesh.name]) {
          setSelectedOrganelle(organelles[clickedMesh.name]);
          if (clickedMesh.material instanceof THREE.MeshStandardMaterial) {
            clickedMesh.material.emissive.setHex(0x3b0764); // glow purple
          }
        }
      }
    };
    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Initial Assembly
    renderStage(activeStageIdx);

    // Simple continuous rotation render loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (!isDragging) {
        cellGroup.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
    };
    reqId = requestAnimationFrame(animate);

    // Resize
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
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener('mousedown', handleMouseDown);
        rendererRef.current.domElement.removeEventListener('click', handleCanvasClick);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        try {
          mountRef.current?.removeChild(rendererRef.current.domElement);
        } catch (e) {}
      }
    };
  }, [activeStageIdx]);

  // Procedural cell rendering depending on Stage Index (0-5)
  const renderStage = (stageIdx: number) => {
    const scene = sceneRef.current;
    if (!scene || !cellGroupRef.current) return;

    // Clear old cell items
    while (cellGroupRef.current.children.length > 0) {
      const child = cellGroupRef.current.children[0];
      cellGroupRef.current.remove(child);
    }

    // Material templates
    const membraneMat = new THREE.MeshStandardMaterial({
      color: '#ec4899', // Pink
      transparent: true,
      opacity: 0.15,
      roughness: 0.2,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const centrioleMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.4 }); // Yellow centrioles
    const chromRedMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.5 }); // Red chromosomes
    const chromBlueMat = new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.5 }); // Blue chromosomes
    const centromereMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 }); // White centromeres
    const fiberMat = new THREE.LineBasicMaterial({ color: 'rgba(156, 163, 175, 0.4)' }); // Spindle fiber lines

    // 1. Draw Cell Membrane (based on stage deforms)
    if (stageIdx <= 3) {
      // Round Sphere cell membrane (Interphase, Prophase, Metaphase, Anaphase)
      const membraneGeo = new THREE.SphereGeometry(3.0, 32, 16);
      const cellMembrane = new THREE.Mesh(membraneGeo, membraneMat);
      cellGroupRef.current.add(cellMembrane);
    } else if (stageIdx === 4) {
      // Telophase pinched cleavage furrow (draw two overlapping squeezed spheres)
      const sphA = new THREE.Mesh(new THREE.SphereGeometry(2.0, 32, 16), membraneMat);
      sphA.position.x = -1.3;
      cellGroupRef.current.add(sphA);

      const sphB = new THREE.Mesh(new THREE.SphereGeometry(2.0, 32, 16), membraneMat);
      sphB.position.x = 1.3;
      cellGroupRef.current.add(sphB);
    } else {
      // Cytokinesis: Two completely separate spheres (cells)
      const sphA = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 16), membraneMat);
      sphA.position.x = -1.9;
      cellGroupRef.current.add(sphA);

      const sphB = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 16), membraneMat);
      sphB.position.x = 1.9;
      cellGroupRef.current.add(sphB);
    }

    // 2. Draw Centrioles (Poles)
    if (stageIdx >= 1) {
      // Left Pole centriole
      const cenA = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8), centrioleMat);
      cenA.position.x = -2.6;
      cenA.rotation.z = Math.PI / 2;
      cenA.name = 'Centriole';
      cellGroupRef.current.add(cenA);

      // Right Pole centriole
      const cenB = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8), centrioleMat);
      cenB.position.x = 2.6;
      cenB.rotation.z = Math.PI / 2;
      cenB.name = 'Centriole';
      cellGroupRef.current.add(cenB);
    }

    // Helper to build a Sister Chromatid pair
    const buildChromosome = (colorMat: THREE.MeshStandardMaterial, scaleY = 1.0) => {
      const group = new THREE.Group();
      
      // Upper arm
      const armA = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8), colorMat);
      armA.position.set(-0.15, 0.35, 0);
      armA.rotation.z = 0.3;
      armA.name = 'Chromatid';
      group.add(armA);

      const armB = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8), colorMat);
      armB.position.set(0.15, 0.35, 0);
      armB.rotation.z = -0.3;
      armB.name = 'Chromatid';
      group.add(armB);

      // Lower arm
      const armC = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8), colorMat);
      armC.position.set(-0.15, -0.35, 0);
      armC.rotation.z = -0.3;
      armC.name = 'Chromatid';
      group.add(armC);

      const armD = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8), colorMat);
      armD.position.set(0.15, -0.35, 0);
      armD.rotation.z = 0.3;
      armD.name = 'Chromatid';
      group.add(armD);

      // Centromere connection core
      const cent = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), centromereMat);
      cent.name = 'Centromere';
      group.add(cent);

      group.scale.set(0.8, scaleY, 0.8);
      return group;
    };

    // 3. Draw Chromosomes based on stage positions
    if (stageIdx === 0) {
      // Loose disorganized wool chromatin fibers in nucleus (Spherical fiber group)
      const points = [];
      for (let i = 0; i < 80; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = Math.random() * 0.9 + 0.1;
        points.push(new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ));
      }
      const woolGeo = new THREE.BufferGeometry().setFromPoints(points);
      const woolLine = new THREE.Line(woolGeo, fiberMat);
      cellGroupRef.current.add(woolLine);

      // Nuclear envelope circle bounds
      const envGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const envMat = new THREE.MeshBasicMaterial({ color: '#7c3aed', transparent: true, opacity: 0.1, wireframe: true });
      const envMesh = new THREE.Mesh(envGeo, envMat);
      cellGroupRef.current.add(envMesh);
    } 
    else if (stageIdx === 1) {
      // Prophase: condenses but scattered around center
      const ch1 = buildChromosome(chromRedMat);
      ch1.position.set(-0.5, 0.6, 0.2);
      ch1.rotation.set(0.5, 0.3, 0.9);
      cellGroupRef.current.add(ch1);

      const ch2 = buildChromosome(chromBlueMat);
      ch2.position.set(0.5, -0.6, -0.2);
      ch2.rotation.set(-0.2, 0.8, -0.4);
      cellGroupRef.current.add(ch2);
    }
    else if (stageIdx === 2) {
      // Metaphase: Aligned perfectly at vertical equatorial plate x=0
      const ch1 = buildChromosome(chromRedMat);
      ch1.position.set(0, 0.8, 0);
      ch1.rotation.set(0, 0, Math.PI/2); // Align parallel to plate
      cellGroupRef.current.add(ch1);

      const ch2 = buildChromosome(chromBlueMat);
      ch2.position.set(0, -0.8, 0);
      ch2.rotation.set(0, 0, Math.PI/2);
      cellGroupRef.current.add(ch2);

      // Draw Spindle lines from poles to centromeres
      const lineLeft1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.6, 0, 0), new THREE.Vector3(0, 0.8, 0)]);
      cellGroupRef.current.add(new THREE.Line(lineLeft1, fiberMat));

      const lineLeft2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.6, 0, 0), new THREE.Vector3(0, -0.8, 0)]);
      cellGroupRef.current.add(new THREE.Line(lineLeft2, fiberMat));

      const lineRight1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(2.6, 0, 0), new THREE.Vector3(0, 0.8, 0)]);
      cellGroupRef.current.add(new THREE.Line(lineRight1, fiberMat));

      const lineRight2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(2.6, 0, 0), new THREE.Vector3(0, -0.8, 0)]);
      cellGroupRef.current.add(new THREE.Line(lineRight2, fiberMat));
    }
    else if (stageIdx === 3) {
      // Anaphase: Chromatids split and migrate to opposite poles
      const dist = 1.3; // distance from center

      // Left moving chromatids
      const c1_left = buildChromosome(chromRedMat, 0.5);
      c1_left.position.set(-dist, 0.7, 0);
      c1_left.rotation.z = Math.PI/3;
      cellGroupRef.current.add(c1_left);

      const c2_left = buildChromosome(chromBlueMat, 0.5);
      c2_left.position.set(-dist, -0.7, 0);
      c2_left.rotation.z = Math.PI/3;
      cellGroupRef.current.add(c2_left);

      // Right moving chromatids
      const c1_right = buildChromosome(chromRedMat, 0.5);
      c1_right.position.set(dist, 0.7, 0);
      c1_right.rotation.z = -Math.PI/3;
      cellGroupRef.current.add(c1_right);

      const c2_right = buildChromosome(chromBlueMat, 0.5);
      c2_right.position.set(dist, -0.7, 0);
      c2_right.rotation.z = -Math.PI/3;
      cellGroupRef.current.add(c2_right);

      // Spindle fibers pulling
      cellGroupRef.current.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.6, 0, 0), new THREE.Vector3(-dist, 0.7, 0)]), fiberMat));
      cellGroupRef.current.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.6, 0, 0), new THREE.Vector3(-dist, -0.7, 0)]), fiberMat));
      cellGroupRef.current.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(2.6, 0, 0), new THREE.Vector3(dist, 0.7, 0)]), fiberMat));
      cellGroupRef.current.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(2.6, 0, 0), new THREE.Vector3(dist, -0.7, 0)]), fiberMat));
    }
    else if (stageIdx === 4) {
      // Telophase: chromatids clustered at opposite poles
      const dist = 1.9;

      const cl_left1 = buildChromosome(chromRedMat, 0.3);
      cl_left1.position.set(-dist - 0.2, 0.3, 0);
      cellGroupRef.current.add(cl_left1);

      const cl_left2 = buildChromosome(chromBlueMat, 0.3);
      cl_left2.position.set(-dist + 0.2, -0.3, 0);
      cellGroupRef.current.add(cl_left2);

      const cl_right1 = buildChromosome(chromRedMat, 0.3);
      cl_right1.position.set(dist - 0.2, 0.3, 0);
      cellGroupRef.current.add(cl_right1);

      const cl_right2 = buildChromosome(chromBlueMat, 0.3);
      cl_right2.position.set(dist + 0.2, -0.3, 0);
      cellGroupRef.current.add(cl_right2);
    }
    else {
      // Cytokinesis: two separate nucleus chromatin coils inside separate spheres
      const coilLeft = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: '#7c3aed', transparent: true, opacity: 0.2, wireframe: true }));
      coilLeft.position.x = -1.9;
      cellGroupRef.current.add(coilLeft);

      const coilRight = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: '#7c3aed', transparent: true, opacity: 0.2, wireframe: true }));
      coilRight.position.x = 1.9;
      cellGroupRef.current.add(coilRight);
    }
  };

  const handleZoom = (amount: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(4, Math.min(18, cameraRef.current.position.z + amount));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* 3D Cell Stage Canvas */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl flex flex-col relative h-[360px] shadow-2xl">
        <div ref={mountRef} className="w-full flex-1 cursor-grab" />
        
        {/* Floating Zoom controls */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <button 
            onClick={() => handleZoom(-1)} 
            className="bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-slate-350 p-2 rounded-xl transition-all cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleZoom(1)} 
            className="bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-slate-350 p-2 rounded-xl transition-all cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        {/* Scrubber bar overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-gray-950/90 border border-gray-900 rounded-xl p-3.5 backdrop-blur-md flex flex-col space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">
            <span>Cell Phase: {stages[activeStageIdx].name}</span>
            <span>Step {activeStageIdx + 1}/6</span>
          </div>
          
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={activeStageIdx}
            onChange={(e) => {
              setActiveStageIdx(parseInt(e.target.value, 10));
              setSelectedOrganelle(null); // Clear selected
            }}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
      </div>

      {/* Scrutiny organelle description panel */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white border-b border-gray-900 pb-2 uppercase tracking-widest font-mono">
            Organelle & Phase Scrutiny
          </h3>

          {/* Display Phase Explanation */}
          <div className="bg-purple-950/10 border border-purple-900/20 p-3.5 rounded-xl space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold block">Stage Description</span>
            <p className="text-xs text-purple-200 leading-normal">{stages[activeStageIdx].description}</p>
          </div>

          {/* Click selection outcome */}
          {selectedOrganelle ? (
            <div className="space-y-2 pt-2 animate-in fade-in duration-150">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-500">Selected Segment</span>
              <h4 className="text-base font-black text-white">{selectedOrganelle.name}</h4>
              <div>
                <span className="text-[9px] uppercase text-gray-500 font-bold font-mono block">Mitotic Role</span>
                <p className="text-xs text-slate-350 leading-relaxed font-sans mt-0.5">{selectedOrganelle.description}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 border border-dashed border-gray-900 rounded-xl">
              <p className="text-xs font-medium p-3">Click on chromatids (arms), centromeres (cores), centrioles (yellow cylinders), or spindle fibers in 3D during Prophase/Metaphase to view details.</p>
            </div>
          )}
        </div>

        {/* Phase progress list bar */}
        <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider font-mono border-t border-gray-900 pt-4">
          {stages.map((st, idx) => (
            <button
              key={st.name}
              onClick={() => setActiveStageIdx(idx)}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeStageIdx === idx ? 'text-purple-400 font-black' : ''
              }`}
            >
              {st.name.substring(0, 5)}..
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
