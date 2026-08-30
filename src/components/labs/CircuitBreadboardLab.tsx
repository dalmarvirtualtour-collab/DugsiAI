import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface CircuitBreadboardLabProps {
  onUpdateState: (state: any) => void;
}

export default function CircuitBreadboardLab({ onUpdateState }: CircuitBreadboardLabProps) {
  // Component parameters
  const [batteryVoltage, setBatteryVoltage] = useState<number>(12); // Volts
  const [resistance, setResistance] = useState<number>(10); // Ohms
  const [bulbResistance, setBulbResistance] = useState<number>(5); // Ohms
  const [isSwitchClosed, setIsSwitchClosed] = useState<boolean>(true);

  // Calculated values
  const totalResistance = resistance + bulbResistance;
  const current = isSwitchClosed ? batteryVoltage / totalResistance : 0; // Amperes
  const bulbVoltageDrop = current * bulbResistance; // Volts
  const resistorVoltageDrop = current * resistance; // Volts

  // Animation ticks for moving current particles
  const [animationTick, setAnimationTick] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    let frameId: number;
    if (isPlaying && current > 0) {
      const tick = () => {
        setAnimationTick(prev => (prev + current * 1.5) % 100);
        frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, current]);

  // Sync state to parent for AI tutor
  useEffect(() => {
    onUpdateState({
      batteryVoltage: `${batteryVoltage} V`,
      resistorValue: `${resistance} Ω`,
      bulbResistance: `${bulbResistance} Ω`,
      switchState: isSwitchClosed ? 'CLOSED' : 'OPEN',
      totalResistance: `${totalResistance} Ω`,
      currentFlow: `${current.toFixed(3)} A`,
      bulbVoltageDrop: `${bulbVoltageDrop.toFixed(2)} V`,
      resistorVoltageDrop: `${resistorVoltageDrop.toFixed(2)} V`,
      safetyStatus: totalResistance <= 0 ? 'SHORT CIRCUIT WARNING' : 'SAFE'
    });
  }, [batteryVoltage, resistance, bulbResistance, isSwitchClosed]);

  // Draw wire paths and particles
  const getParticlePos = (progressPercent: number) => {
    // Total circuit path is a rectangle from (40, 40) to (300, 240)
    const xMin = 40;
    const xMax = 300;
    const yMin = 40;
    const yMax = 240;
    const perimeter = 2 * (xMax - xMin) + 2 * (yMax - yMin);
    const targetDist = (progressPercent / 100) * perimeter;

    let x = xMin;
    let y = yMin;

    if (targetDist < (xMax - xMin)) {
      // Top segment (left to right)
      x = xMin + targetDist;
      y = yMin;
    } else if (targetDist < (xMax - xMin) + (yMax - yMin)) {
      // Right segment (top to bottom)
      x = xMax;
      y = yMin + (targetDist - (xMax - xMin));
    } else if (targetDist < 2 * (xMax - xMin) + (yMax - yMin)) {
      // Bottom segment (right to left)
      x = xMax - (targetDist - (xMax - xMin) - (yMax - yMin));
      y = yMax;
    } else {
      // Left segment (bottom to top)
      x = xMin;
      y = yMax - (targetDist - 2 * (xMax - xMin) - (yMax - yMin));
    }

    return { x, y };
  };

  // Particles array along the wire loop
  const particlesCount = 8;
  const particleElements = [];
  if (current > 0) {
    for (let i = 0; i < particlesCount; i++) {
      const progress = (animationTick + (i * (100 / particlesCount))) % 100;
      const pos = getParticlePos(progress);
      particleElements.push(
        <circle
          key={`part-${i}`}
          cx={pos.x}
          cy={pos.y}
          r={3.5}
          fill="#fbbf24"
          className="shadow-sm shadow-yellow-500"
        />
      );
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* 2D Schematic Canvas Column */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[360px] shadow-2xl overflow-hidden">
        <h4 className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
          Circuit Schematic View
        </h4>

        {/* Schematic SVG */}
        <svg width={340} height={280} className="overflow-visible select-none">
          {/* Main wire loop path */}
          <rect
            x={40}
            y={40}
            width={260}
            height={200}
            fill="none"
            stroke="#1f2937"
            strokeWidth={4}
            strokeLinecap="round"
          />

          {/* Current Flow Particles */}
          {particleElements}

          {/* 1. DC Voltage Battery (Left wire segment) */}
          <g transform="translate(40, 140)">
            <line x1={-15} y1={-10} x2={15} y2={-10} stroke="#f87171" strokeWidth={3} />
            <line x1={-8} y1={-2} x2={8} y2={-2} stroke="#374151" strokeWidth={2} />
            <line x1={-15} y1={6} x2={15} y2={6} stroke="#f87171" strokeWidth={3} />
            <line x1={-8} y1={14} x2={8} y2={14} stroke="#374151" strokeWidth={2} />
            <text x={22} y={5} fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace">DC V</text>
          </g>

          {/* 2. Switch (Top wire segment) */}
          <g transform="translate(170, 40)">
            {/* Contact nodes */}
            <circle cx={-20} cy={0} r={4} fill="#6b7280" />
            <circle cx={20} cy={0} r={4} fill="#6b7280" />
            {isSwitchClosed ? (
              // Closed contact line
              <line x1={-20} y1={0} x2={20} y2={0} stroke="#10b981" strokeWidth={3} />
            ) : (
              // Open slanted line
              <line x1={-20} y1={0} x2={15} y2={-18} stroke="#ef4444" strokeWidth={3} />
            )}
            <text x={0} y={-22} fill="#6b7280" fontSize="9" fontWeight="bold" textAnchor="middle">SWITCH</text>
          </g>

          {/* 3. Resistor (Right wire segment) */}
          <g transform="translate(300, 140) rotate(90)">
            {/* Zig-zag path */}
            <path
              d="M -25 0 L -15 -8 L -5 8 L 5 -8 L 15 8 L 25 0"
              fill="none"
              stroke="#60a5fa"
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <text x={0} y={-18} fill="#60a5fa" fontSize="9" fontWeight="bold" textAnchor="middle" transform="rotate(-90)">RESISTOR</text>
          </g>

          {/* 4. Lightbulb (Bottom wire segment) */}
          <g transform="translate(170, 240)">
            {/* Glow circle background */}
            {current > 0 && (
              <circle
                cx={0}
                cy={0}
                r={22}
                fill="#fbbf24"
                opacity={Math.min(0.85, (current * 0.4))}
                className="transition-all"
              />
            )}
            {/* Glass outline */}
            <circle cx={0} cy={0} r={14} fill="none" stroke="#fbbf24" strokeWidth={2} />
            {/* Filament X */}
            <path d="M -8 -8 L 8 8 M -8 8 L 8 -8" stroke="#f59e0b" strokeWidth={1.5} />
            <text x={0} y={26} fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">BULB</text>
          </g>

          {/* 5. Virtual Ammeter (Inside circuit, top right corner) */}
          <g transform="translate(265, 85)">
            <circle cx={0} cy={0} r={18} fill="#111827" stroke="#3b82f6" strokeWidth={2} />
            <text x={0} y={-3} fill="#60a5fa" fontSize="8" fontWeight="bold" textAnchor="middle">A</text>
            <text x={0} y={7} fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">
              {current.toFixed(1)}A
            </text>
          </g>

          {/* 6. Virtual Voltmeter (Wired across bulb terminals) */}
          <g transform="translate(170, 190)">
            {/* Wires connecting to voltmeter */}
            <line x1={-30} y1={50} x2={-18} y2={0} stroke="#9ca3af" strokeWidth={1} strokeDasharray="2 2" />
            <line x1={30} y1={50} x2={18} y2={0} stroke="#9ca3af" strokeWidth={1} strokeDasharray="2 2" />
            <circle cx={0} cy={0} r={18} fill="#111827" stroke="#f59e0b" strokeWidth={2} />
            <text x={0} y={-3} fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle">V</text>
            <text x={0} y={7} fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">
              {bulbVoltageDrop.toFixed(1)}V
            </text>
          </g>
        </svg>

        {/* Short Circuit Warning alert banner */}
        {totalResistance <= 0 && (
          <div className="absolute top-4 right-4 bg-rose-950/20 border border-rose-900/40 text-rose-400 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest font-mono animate-pulse">
            ⚠️ SHORT CIRCUIT DETECTED!
          </div>
        )}
      </div>

      {/* Control panel for Parameters */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 space-y-6">
        <h3 className="text-sm font-extrabold text-white border-b border-gray-900 pb-2 uppercase tracking-widest font-mono">
          Circuit Dials & Controls
        </h3>

        <div className="space-y-5 text-xs">
          
          {/* Toggle Switch */}
          <div className="flex justify-between items-center bg-gray-950 border border-gray-900 rounded-xl p-3.5">
            <div className="space-y-0.5">
              <span className="text-gray-400 font-bold block">Circuit Connection</span>
              <span className="text-[10px] text-gray-500 font-mono">Open/Close the contact switch</span>
            </div>
            <button
              onClick={() => setIsSwitchClosed(!isSwitchClosed)}
              className={`px-4 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                isSwitchClosed 
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400' 
                  : 'bg-rose-950/30 border-rose-800 text-rose-400'
              }`}
            >
              {isSwitchClosed ? 'SWITCH CLOSED' : 'SWITCH OPEN'}
            </button>
          </div>

          {/* Slider Battery Voltage */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400 font-bold">DC Source Voltage (V)</span>
              <span className="text-purple-400 font-bold">{batteryVoltage} V</span>
            </div>
            <input
              type="range"
              min={1}
              max={36}
              value={batteryVoltage}
              onChange={(e) => setBatteryVoltage(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Slider Resistor Resistance */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400 font-bold">Resistor Resistance (R1)</span>
              <span className="text-purple-400 font-bold">{resistance} Ω</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={resistance}
              onChange={(e) => setResistance(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Slider Bulb Resistance */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400 font-bold">Lightbulb Resistance (R2)</span>
              <span className="text-purple-400 font-bold">{bulbResistance} Ω</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={bulbResistance}
              onChange={(e) => setBulbResistance(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

        </div>

        {/* Calculated Info details block */}
        <div className="bg-gray-950 border border-gray-900 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs font-mono text-center">
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold">Total Resistance</span>
            <p className="text-white text-sm font-black mt-0.5">{totalResistance} Ω</p>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] uppercase font-bold">Branch Current</span>
            <p className="text-white text-sm font-black mt-0.5">{current.toFixed(2)} A</p>
          </div>
        </div>
      </div>
    </div>
  );
}
