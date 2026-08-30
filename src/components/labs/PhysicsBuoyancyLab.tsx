import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface PhysicsBuoyancyLabProps {
  onUpdateState: (state: any) => void;
}

interface Material {
  name: string;
  density: number; // g/cm^3
  color: string;
}

interface Liquid {
  name: string;
  density: number; // g/cm^3
  color: string;
}

export default function PhysicsBuoyancyLab({ onUpdateState }: PhysicsBuoyancyLabProps) {
  // Liquids Registry
  const liquids: Liquid[] = [
    { name: 'Water', density: 1.0, color: 'rgba(56, 189, 248, 0.4)' },
    { name: 'Gasoline', density: 0.7, color: 'rgba(250, 204, 21, 0.3)' },
    { name: 'Honey', density: 1.4, color: 'rgba(217, 119, 6, 0.5)' },
    { name: 'Mercury', density: 13.6, color: 'rgba(156, 163, 175, 0.7)' }
  ];

  // Materials Registry
  const materials: Material[] = [
    { name: 'Wood', density: 0.6, color: '#b45309' },
    { name: 'Stone', density: 2.5, color: '#6b7280' },
    { name: 'Iron', density: 7.8, color: '#374151' },
    { name: 'Aluminum', density: 2.7, color: '#9ca3af' },
    { name: 'Gold', density: 19.3, color: '#d97706' }
  ];

  // Simulation parameters
  const [selectedLiquid, setSelectedLiquid] = useState<Liquid>(liquids[0]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(materials[0]);
  
  const [mass, setMass] = useState<number>(100); // grams
  const [volume, setVolume] = useState<number>(150); // cm^3
  const [gravity, setGravity] = useState<number>(9.81); // m/s^2
  
  // Simulation run state
  const [isDropped, setIsDropped] = useState<boolean>(false);
  const [simState, setSimState] = useState<string>('idle'); // 'idle' | 'dropping' | 'settled'
  
  // Calculated parameters
  const objectDensity = mass / volume;
  const weight = (mass / 1000) * gravity; // N (Newtons)
  
  // Calculate final state values for UI
  const isSinking = objectDensity > selectedLiquid.density;
  const isFloating = objectDensity < selectedLiquid.density;
  
  // Submerged percentage & forces
  let submergedFraction = 1.0;
  if (isFloating) {
    submergedFraction = objectDensity / selectedLiquid.density;
  }
  
  const displacedVolume = volume * submergedFraction; // cm^3
  const buoyantForce = (displacedVolume * selectedLiquid.density / 1000) * gravity; // N
  const netForce = simState === 'settled' 
    ? (isSinking ? 0.0 : 0.0) // At bottom or floating, net force becomes 0
    : buoyantForce - weight; // Negative means acceleration downwards
  
  // Animation Canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Physics engine properties inside container
  const boxY = useRef<number>(50); // percentage height of container top
  const boxVelocity = useRef<number>(0);

  // Sync state to parent for AI tutor
  useEffect(() => {
    onUpdateState({
      liquidName: selectedLiquid.name,
      liquidDensity: selectedLiquid.density,
      materialName: selectedMaterial.name,
      objectMass: mass,
      objectVolume: volume,
      objectDensity: parseFloat(objectDensity.toFixed(3)),
      gravity,
      weight: parseFloat(weight.toFixed(3)),
      buoyantForce: parseFloat(buoyantForce.toFixed(3)),
      netForce: parseFloat((buoyantForce - weight).toFixed(3)),
      displacedVolume: parseFloat(displacedVolume.toFixed(3)),
      state: simState
    });
  }, [selectedLiquid, selectedMaterial, mass, volume, gravity, simState]);

  // Adjust mass/volume when material is changed
  const handleMaterialChange = (matName: string) => {
    const mat = materials.find(m => m.name === matName);
    if (mat) {
      setSelectedMaterial(mat);
      // Recalculate volume based on target density to keep it realistic
      const newVolume = Math.round(mass / mat.density);
      setVolume(newVolume);
      resetSim();
    }
  };

  const resetSim = () => {
    setIsDropped(false);
    setSimState('idle');
    boxY.current = 30; // Above fluid level
    boxVelocity.current = 0;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    drawCanvas();
  };

  const startDrop = () => {
    setIsDropped(true);
    setSimState('dropping');
  };

  // Render loop
  useEffect(() => {
    if (simState === 'dropping') {
      const runPhysics = () => {
        const dt = 0.05; // time step
        const fluidSurfaceY = 130; // pixels from top of container
        const containerBottomY = 250; // bottom boundary of beaker
        const boxHeight = 40; // visual size of cube
        
        // Current position of bottom of box
        const boxBottom = boxY.current + boxHeight;
        
        // Calculate physics
        const d_liq = selectedLiquid.density;
        const d_obj = objectDensity;
        
        // Gravity force (downwards)
        const F_g = (mass / 1000) * gravity;
        
        // Buoyancy force (upwards, active only when entering liquid)
        let F_b = 0;
        if (boxBottom > fluidSurfaceY) {
          // Fraction of box submerged
          const submergedHeight = Math.min(boxHeight, boxBottom - fluidSurfaceY);
          const submergedRatio = submergedHeight / boxHeight;
          F_b = (volume * submergedRatio * d_liq / 1000) * gravity;
        }
        
        // Drag in fluid
        let F_drag = 0;
        if (boxBottom > fluidSurfaceY) {
          F_drag = -0.5 * boxVelocity.current * Math.abs(boxVelocity.current) * 0.15; // drag coefficient
        }

        const massKG = mass / 1000;
        const F_net = F_b - F_g + F_drag; // Positive upwards
        const acc = F_net / massKG;
        
        // Update velocity and position
        boxVelocity.current += acc * dt;
        boxY.current -= boxVelocity.current * dt * 25; // Scale pixel movement
        
        // Collision checks
        if (boxY.current + boxHeight >= containerBottomY) {
          // Hit bottom
          boxY.current = containerBottomY - boxHeight;
          boxVelocity.current = 0;
          setSimState('settled');
        } else if (boxBottom <= fluidSurfaceY && boxVelocity.current < 0 && boxY.current > 50) {
          // Re-entry or oscillation boundary
        } else if (simState === 'dropping' && boxBottom > fluidSurfaceY && Math.abs(boxVelocity.current) < 0.05 && Math.abs(acc) < 0.05) {
          // Settled on water surface (floating equilibrium)
          setSimState('settled');
        }

        drawCanvas();
        animationRef.current = requestAnimationFrame(runPhysics);
      };
      animationRef.current = requestAnimationFrame(runPhysics);
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [simState, selectedLiquid, selectedMaterial, mass, volume, gravity]);

  // Initial draw
  useEffect(() => {
    drawCanvas();
  }, [selectedLiquid, selectedMaterial, mass, volume, gravity, simState]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw beaker (fluid container)
    const beakerX = 50;
    const beakerY = 100;
    const beakerW = 200;
    const beakerH = 160;
    
    // Liquid level (changes based on displaced volume)
    const baseLiquidHeight = 110;
    let currentLiquidHeight = baseLiquidHeight;
    
    if (boxY.current + 40 > 130) {
      // Calculate submerged volume to raise water level
      const boxBottom = boxY.current + 40;
      const submergedHeight = Math.min(40, boxBottom - 130);
      const ratio = submergedHeight / 40;
      const levelRise = (volume * ratio * 0.1); // scaling factor
      currentLiquidHeight = baseLiquidHeight + levelRise;
    }

    // Fill beaker with fluid
    ctx.fillStyle = selectedLiquid.color;
    ctx.fillRect(beakerX + 5, beakerY + (beakerH - currentLiquidHeight), beakerW - 10, currentLiquidHeight);
    
    // Draw fluid surface contour line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(beakerX + 5, beakerY + (beakerH - currentLiquidHeight));
    ctx.lineTo(beakerX + beakerW - 5, beakerY + (beakerH - currentLiquidHeight));
    ctx.stroke();
    
    // Beaker walls
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY);
    ctx.lineTo(beakerX, beakerY + beakerH);
    ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
    ctx.lineTo(beakerX + beakerW, beakerY);
    ctx.stroke();
    
    // Beaker ticks
    ctx.fillStyle = '#6b7280';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    for (let i = 20; i < beakerH; i += 30) {
      ctx.fillRect(beakerX + 5, beakerY + beakerH - i, 8, 1);
      ctx.fillText(`${Math.round(i * 2.5)} ml`, beakerX - 4, beakerY + beakerH - i + 3);
    }
    
    // 2. Draw Object (Block)
    const boxSize = 40;
    const boxX = beakerX + (beakerW - boxSize) / 2;
    const boxCenterY = boxY.current + boxSize / 2;
    
    ctx.fillStyle = selectedMaterial.color;
    ctx.fillRect(boxX, boxY.current, boxSize, boxSize);
    
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY.current, boxSize, boxSize);
    
    // Label material inside block
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(selectedMaterial.name, boxX + boxSize / 2, boxY.current + boxSize / 2 + 3);

    // 3. Force vectors (Arrows starting from block center)
    if (simState !== 'idle') {
      const centerX = boxX + boxSize / 2;
      const centerY = boxCenterY;
      
      // Scale force vectors for visibility
      const forceScale = 40; // pixels per Newton
      
      // Gravity arrow (downwards)
      const gArrowLen = Math.min(80, weight * forceScale);
      ctx.strokeStyle = '#ef4444'; // Red
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, centerY + gArrowLen);
      ctx.stroke();
      drawArrowhead(ctx, centerX, centerY + gArrowLen, Math.PI / 2);
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`Fg: ${weight.toFixed(2)}N`, centerX + 30, centerY + gArrowLen / 2);
      
      // Buoyancy arrow (upwards)
      if (boxY.current + boxSize > 130) {
        const bArrowLen = Math.min(80, buoyantForce * forceScale);
        ctx.strokeStyle = '#10b981'; // Green
        ctx.fillStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - bArrowLen);
        ctx.stroke();
        drawArrowhead(ctx, centerX, centerY - bArrowLen, -Math.PI / 2);
        ctx.fillText(`Fb: ${buoyantForce.toFixed(2)}N`, centerX - 30, centerY - bArrowLen / 2);
      }
    }
  };

  const drawArrowhead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    const size = 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Simulation View Column */}
      <div className="bg-gray-950/80 border border-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[360px] shadow-2xl">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={320}
          className="bg-transparent"
        />
        
        {/* Float / Sink indicator banner */}
        {simState === 'settled' && (
          <div className={`absolute top-4 left-4 border px-3 py-1.5 rounded-xl text-xs font-bold font-mono tracking-tight ${
            isSinking 
              ? 'bg-rose-950/15 border-rose-900/40 text-rose-400' 
              : 'bg-emerald-950/15 border-emerald-900/40 text-emerald-400'
          }`}>
            {isSinking ? 'STATUS: SINKING (Density > Fluid)' : 'STATUS: FLOATING (Density < Fluid)'}
          </div>
        )}

        {/* Buttons overlay */}
        <div className="flex space-x-3 mt-4 w-full justify-center">
          <button
            onClick={startDrop}
            disabled={simState !== 'idle'}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-md shadow-purple-900/20 disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-4.5 w-4.5" />
            <span>DROP OBJECT</span>
          </button>
          
          <button
            onClick={resetSim}
            className="bg-gray-900 hover:bg-gray-800 text-slate-300 font-extrabold text-xs px-5 py-2.5 rounded-xl border border-gray-800 flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="h-4.5 w-4.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Control Panel Column */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 space-y-6">
        <h3 className="text-sm font-extrabold text-white border-b border-gray-900 pb-2 uppercase tracking-widest font-mono">
          Simulation Controls
        </h3>

        {/* Parameter Sliders */}
        <div className="space-y-4 text-xs">
          
          {/* Select Fluid */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Liquid Material</span>
              <span className="text-purple-400 font-mono font-bold">{selectedLiquid.name} ({selectedLiquid.density.toFixed(1)} g/cm³)</span>
            </div>
            <select
              value={selectedLiquid.name}
              onChange={(e) => {
                const liq = liquids.find(l => l.name === e.target.value);
                if (liq) {
                  setSelectedLiquid(liq);
                  resetSim();
                }
              }}
              className="w-full bg-gray-900 border border-gray-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-purple-600 cursor-pointer"
            >
              {liquids.map(l => (
                <option key={l.name} value={l.name}>{l.name} ({l.density} g/cm³)</option>
              ))}
            </select>
          </div>

          {/* Select Object Material */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Object Material</span>
              <span className="text-purple-400 font-mono font-bold">{selectedMaterial.name} ({selectedMaterial.density.toFixed(1)} g/cm³)</span>
            </div>
            <select
              value={selectedMaterial.name}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-purple-600 cursor-pointer"
            >
              {materials.map(m => (
                <option key={m.name} value={m.name}>{m.name} ({m.density} g/cm³)</option>
              ))}
            </select>
          </div>

          {/* Slider Mass */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400 font-bold">Object Mass (m)</span>
              <span className="text-white font-bold">{mass} grams</span>
            </div>
            <input
              type="range"
              min={20}
              max={500}
              value={mass}
              onChange={(e) => {
                setMass(parseInt(e.target.value, 10));
                resetSim();
              }}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Slider Volume */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400 font-bold">Object Volume (V)</span>
              <span className="text-white font-bold">{volume} cm³</span>
            </div>
            <input
              type="range"
              min={20}
              max={500}
              value={volume}
              onChange={(e) => {
                setVolume(parseInt(e.target.value, 10));
                resetSim();
              }}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Slider Gravity */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400 font-bold">Gravity (g)</span>
              <span className="text-white font-bold">{gravity.toFixed(2)} m/s²</span>
            </div>
            <input
              type="range"
              min={1.62} // Moon
              max={24.79} // Jupiter
              step={0.1}
              value={gravity}
              onChange={(e) => {
                setGravity(parseFloat(e.target.value));
                resetSim();
              }}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-mono pt-1">
              <span>Moon (1.62)</span>
              <span>Earth (9.81)</span>
              <span>Jupiter (24.79)</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
