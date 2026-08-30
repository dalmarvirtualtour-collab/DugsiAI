import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface GeographyTopographyLabProps {
  onUpdateState: (state: any) => void;
}

interface MapScale {
  label: string;
  ratio: number; // 1 unit on map = X units in real life
  scaleBarText: string;
  scaleBarPixelWidth: number; // visual width in px representing 1km
}

export default function GeographyTopographyLab({ onUpdateState }: GeographyTopographyLabProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Scales Registry
  const scales: MapScale[] = [
    { label: '1:25,000', ratio: 25000, scaleBarText: '500 m', scaleBarPixelWidth: 80 },
    { label: '1:50,000', ratio: 50000, scaleBarText: '1 km', scaleBarPixelWidth: 80 },
    { label: '1:100,000', ratio: 100000, scaleBarText: '2 km', scaleBarPixelWidth: 80 }
  ];

  // Parameters state
  const [selectedScale, setSelectedScale] = useState<MapScale>(scales[1]); // 1:50,000 default
  const [contourInterval, setContourInterval] = useState<number>(20); // 10m, 20m, 50m
  const [hillHeight, setHillHeight] = useState<number>(150); // meters elevation
  
  // Tectonic Action: 'stable' | 'tension' (normal fault) | 'compression' (reverse fault) | 'lateral' (strike-slip)
  const [tectonicStress, setTectonicStress] = useState<string>('stable');
  const [stressForce, setStressForce] = useState<number>(0); // 0 to 100%

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const faultLineMeshRef = useRef<THREE.Line | null>(null);

  // Sync state to parent for AI tutor
  useEffect(() => {
    onUpdateState({
      mapScale: selectedScale.label,
      ratio: selectedScale.ratio,
      contourInterval: `${contourInterval} meters`,
      peakElevation: `${hillHeight}m`,
      tectonicSetting: tectonicStress.toUpperCase(),
      stressLevel: `${stressForce}%`,
      geomorphicFeatures: getGeomorphicExplanation()
    });
  }, [selectedScale, contourInterval, hillHeight, tectonicStress, stressForce]);

  const getGeomorphicExplanation = () => {
    if (tectonicStress === 'tension') {
      return `Tension stretches the crust, causing dip-slip normal faulting. The hanging wall slips down relative to the footwall, forming grabens and rift valleys.`;
    }
    if (tectonicStress === 'compression') {
      return `Compression squeezes the crust, causing reverse/thrust faulting. The hanging wall is pushed upwards over the footwall, forming steep cliffs and mountain ridges.`;
    }
    if (tectonicStress === 'lateral') {
      return `Shear stress causes horizontal strike-slip faulting. Blocks slide past each other laterally, displacing contour features (like hills, roads, or rivers) horizontally.`;
    }
    return `Stable topographic dome. Uniform contour lines circle the central peak.`;
  };

  // 3D Scene Initialization
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030303');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(5, 7, 9);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(10, 10, '#1f2937', '#111827');
    gridHelper.position.y = -1.01;
    scene.add(gridHelper);

    // Assembly of dynamic mesh elements
    update3DTerrain();

    // Interaction mouse drag rotation
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

      scene.rotation.y += deltaX * 0.008;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Simple Render Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    reqId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 300;
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
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        try {
          mountRef.current?.removeChild(rendererRef.current.domElement);
        } catch (e) {}
      }
    };
  }, [hillHeight, tectonicStress, stressForce]);

  // Redraw 2D Contour map and 3D terrain whenever values update
  useEffect(() => {
    drawContourMap();
    update3DTerrain();
  }, [hillHeight, contourInterval, selectedScale, tectonicStress, stressForce]);

  const update3DTerrain = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean old mesh
    if (terrainMeshRef.current) scene.remove(terrainMeshRef.current);
    if (faultLineMeshRef.current) scene.remove(faultLineMeshRef.current);

    // Height parameters
    const maxValY = hillHeight / 100; // Normalised height scale
    
    // Create Plane geometry with segments
    const segments = 32;
    const size = 5;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2); // Orient horizontally

    const pos = geometry.attributes.position;
    
    // Apply heights procedurally based on peaks and faulting slip
    const forceFraction = stressForce / 100;
    
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i); // Note: plane oriented in Y is horizontal

      // Base Gaussian hill height
      const distFromCenter = Math.pow(vx, 2) + Math.pow(vz, 2);
      let height = maxValY * Math.exp(-distFromCenter / 1.8);

      // Fault offset logic (Fault Line runs along diagonal or Z axis x=0)
      const isRightBlock = vx > 0;
      
      if (tectonicStress === 'tension' && isRightBlock) {
        // Normal fault: right block slips downwards
        height -= 0.6 * forceFraction;
      } else if (tectonicStress === 'compression' && isRightBlock) {
        // Reverse fault: right block pushes upwards
        height += 0.6 * forceFraction;
      } else if (tectonicStress === 'lateral' && isRightBlock) {
        // Strike-slip: right block shifts along Z axis
        // Done by adding horizontal offset during coordinates lookup, or adjusting vertex
      }

      pos.setY(i, height - 1.0); // Map Z height coordinate (Three Y is vertical)
    }

    // Recalculate mesh normals
    geometry.computeVertexNormals();

    // Coloring vertices based on heights (terrain mapping)
    const count = pos.count;
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i) + 1.0; // normalised height
      let color = new THREE.Color('#10b981'); // Green valley
      
      if (y > 1.2) {
        color.set('#f3f4f6'); // Snow cap
      } else if (y > 0.6) {
        color.set('#b45309'); // Brown slope
      } else if (y > 0.2) {
        color.set('#34d399'); // High valley green
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material with vertex coloring
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      flatShading: true,
      shininess: 0,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    terrainMeshRef.current = mesh;

    // Draw fault line boundary
    if (tectonicStress !== 'stable' && stressForce > 0) {
      const linePoints = [
        new THREE.Vector3(0, -1.1, -2.5),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0, -1.1, 2.5)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({ color: '#ef4444', linewidth: 2 });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      faultLineMeshRef.current = line;
    }
  };

  const drawContourMap = () => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // 1. Draw grid backdrop
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let x = 20; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 20; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 2. Draw contour elevation lines
    ctx.lineWidth = 1.5;
    ctx.font = '8px monospace';
    
    // Draw concentric contours
    // Peak is hillHeight, bottom is 0m
    const numContours = Math.floor(hillHeight / contourInterval);
    const forceFraction = stressForce / 100;

    for (let i = 1; i <= numContours; i++) {
      const elev = i * contourInterval;
      
      // Calculate radius based on elevation
      // Gaussian reverse lookup: r = sqrt(-1.8 * ln(elev/hillHeight))
      const ratio = elev / hillHeight;
      if (ratio >= 1.0) continue;
      
      const normalRadius = Math.sqrt(-2.0 * Math.log(ratio)) * 40; // pixel scale factor
      
      // Left and Right block offset for fault simulation in 2D
      ctx.strokeStyle = i % 5 === 0 ? '#8b5cf6' : '#4b5563'; // Purple bold for index contours
      ctx.fillStyle = ctx.strokeStyle;

      // Draw two halves of the ellipse separated by fault line at X=cx
      if (tectonicStress === 'tension' || tectonicStress === 'compression') {
        const offset = (tectonicStress === 'tension' ? -15 : 15) * forceFraction;

        // Draw left side (X < cx)
        ctx.beginPath();
        ctx.arc(cx, cy, normalRadius, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.stroke();

        // Draw right side (X > cx) with offset elevation
        ctx.beginPath();
        const rightRadius = Math.max(5, normalRadius + offset);
        ctx.arc(cx, cy, rightRadius, 1.5 * Math.PI, 0.5 * Math.PI);
        ctx.stroke();
      } else if (tectonicStress === 'lateral') {
        // Strike-slip: slide right half vertically along Y axis
        const offset = 25 * forceFraction;

        // Draw left half
        ctx.beginPath();
        ctx.arc(cx, cy - offset/2, normalRadius, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.stroke();

        // Draw right half
        ctx.beginPath();
        ctx.arc(cx, cy + offset/2, normalRadius, 1.5 * Math.PI, 0.5 * Math.PI);
        ctx.stroke();
      } else {
        // Stable circles
        ctx.beginPath();
        ctx.arc(cx, cy, normalRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Label elevation value on contours
        if (i % 2 === 0) {
          ctx.fillText(`${elev}m`, cx + normalRadius - 10, cy + 3);
        }
      }
    }

    // 3. Draw fault line divider in 2D
    if (tectonicStress !== 'stable' && stressForce > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, 10);
      ctx.lineTo(cx, canvas.height - 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Peak label (triangle marker)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 4);
    ctx.lineTo(cx - 4, cy + 3);
    ctx.lineTo(cx + 4, cy + 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${hillHeight}m`, cx - 12, cy - 6);
  };

  const handleZoom = (amount: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(4, Math.min(18, cameraRef.current.position.z + amount));
      cameraRef.current.position.y = Math.max(3, Math.min(14, cameraRef.current.position.y + amount * 0.8));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* 2D Contour Map Panel */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[340px] shadow-2xl">
        <h4 className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
          2D Contour Map View
        </h4>

        <canvas 
          ref={mapCanvasRef} 
          width={280} 
          height={260} 
          className="bg-transparent"
        />

        {/* Linear Scale Bar Representation */}
        <div className="absolute bottom-4 left-4 flex flex-col space-y-1 font-mono text-[9px] text-slate-400">
          <span>Map Scale: {selectedScale.label}</span>
          <div className="flex items-center space-x-1">
            <div className="h-2 border-l border-r border-b border-slate-400" style={{ width: `${selectedScale.scaleBarPixelWidth}px` }} />
            <span>{selectedScale.scaleBarText}</span>
          </div>
        </div>
      </div>

      {/* 3D Terrain Workspace */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl overflow-hidden flex flex-col relative h-[340px] shadow-2xl">
        <h4 className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
          3D Topographic Terrain View
        </h4>
        
        <div ref={mountRef} className="w-full flex-1 cursor-grab" />
        
        {/* Floating Zoom Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={() => handleZoom(-1.5)} 
            className="bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-slate-350 p-2 rounded-xl transition-all cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleZoom(1.5)} 
            className="bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-slate-350 p-2 rounded-xl transition-all cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 bg-gray-950/90 border border-gray-900 rounded-xl p-3 flex justify-around text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#f3f4f6] rounded border border-gray-500" />
            <span>Peak / Snow (&gt;120m)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#b45309] rounded border border-gray-500" />
            <span>Slope / Rock (60-120m)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#10b981] rounded border border-gray-500" />
            <span>Valley (&lt;60m)</span>
          </div>
        </div>
      </div>

      {/* Control panel for Parameters */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 space-y-6 lg:col-span-2">
        <h3 className="text-sm font-extrabold text-white border-b border-gray-900 pb-2 uppercase tracking-widest font-mono">
          Cartography & Geodynamics Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* Contour Interval and Map Scale */}
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-gray-400 font-bold">Select Map Scale</span>
              <select
                value={selectedScale.label}
                onChange={(e) => {
                  const sc = scales.find(s => s.label === e.target.value);
                  if (sc) setSelectedScale(sc);
                }}
                className="w-full bg-gray-900 border border-gray-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-purple-600 cursor-pointer"
              >
                {scales.map(s => (
                  <option key={s.label} value={s.label}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400 font-bold">Contour Interval</span>
                <span className="text-purple-400 font-bold">{contourInterval} meters</span>
              </div>
              <div className="flex space-x-2 pt-1 font-bold">
                {[10, 20, 50].map(val => (
                  <button
                    key={val}
                    onClick={() => setContourInterval(val)}
                    className={`flex-1 py-2 rounded-xl border text-center transition-all cursor-pointer ${
                      contourInterval === val ? 'bg-purple-900/40 border-purple-800 text-purple-300' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {val}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Elevation Dome Peak Slider */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400 font-bold">Peak Elevation (Height)</span>
                <span className="text-white font-bold">{hillHeight} meters</span>
              </div>
              <input
                type="range"
                min={50}
                max={250}
                step={10}
                value={hillHeight}
                onChange={(e) => setHillHeight(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
            
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-3.5 text-center font-mono">
              <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Calculated Contours Count</span>
              <h4 className="text-sm font-black text-purple-300">
                {Math.floor(hillHeight / contourInterval)} contour layers
              </h4>
            </div>
          </div>

          {/* Tectonic Stress Simulation Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-gray-400 font-bold">Tectonic Environment</span>
              <div className="grid grid-cols-2 gap-2 font-bold">
                {[
                  { id: 'stable', label: 'Stable Dome' },
                  { id: 'tension', label: 'Tension (Normal)' },
                  { id: 'compression', label: 'Compress (Thrust)' },
                  { id: 'lateral', label: 'Shear (Lateral)' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTectonicStress(item.id);
                      if (item.id === 'stable') setStressForce(0);
                      else if (stressForce === 0) setStressForce(50);
                    }}
                    className={`py-2 px-1 text-[10px] rounded-xl border text-center transition-all cursor-pointer ${
                      tectonicStress === item.id ? 'bg-rose-900/40 border-rose-800 text-rose-300' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {tectonicStress !== 'stable' && (
              <div className="space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-gray-400 font-bold">Tectonic Stress Force</span>
                  <span className="text-rose-400 font-bold">{stressForce}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={stressForce}
                  onChange={(e) => setStressForce(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
