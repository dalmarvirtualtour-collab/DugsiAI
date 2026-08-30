import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface GalvanicCellLabProps {
  onUpdateState: (state: any) => void;
}

interface MetalHalfCell {
  id: string;
  name: string;
  symbol: string;
  ionSymbol: string;
  standardPotential: number; // Volts vs SHE
  valency: number; // e- transferred
  color: string; // Hex color for drawing
  ionColor: string; // Solution color
}

export default function GalvanicCellLab({ onUpdateState }: GalvanicCellLabProps) {
  // Half-cell data registry
  const halfCells: MetalHalfCell[] = [
    { id: 'zinc', name: 'Zinc', symbol: 'Zn', ionSymbol: 'Zn²⁺', standardPotential: -0.763, valency: 2, color: '#9ca3af', ionColor: 'rgba(209, 213, 219, 0.15)' },
    { id: 'copper', name: 'Copper', symbol: 'Cu', ionSymbol: 'Cu²⁺', standardPotential: 0.337, valency: 2, color: '#b45309', ionColor: 'rgba(59, 130, 246, 0.25)' }, // Blue solution
    { id: 'silver', name: 'Silver', symbol: 'Ag', ionSymbol: 'Ag⁺', standardPotential: 0.7996, valency: 1, color: '#e5e7eb', ionColor: 'rgba(229, 231, 235, 0.1)' },
    { id: 'lead', name: 'Lead', symbol: 'Pb', ionSymbol: 'Pb²⁺', standardPotential: -0.126, valency: 2, color: '#4b5563', ionColor: 'rgba(75, 85, 99, 0.15)' }
  ];

  const [leftCellId, setLeftCellId] = useState<string>('zinc');
  const [rightCellId, setRightCellId] = useState<string>('copper');

  // Concentrations (Molar)
  const [concLeft, setConcLeft] = useState<number>(1.0);
  const [concRight, setConcRight] = useState<number>(1.0);
  
  // Temperature (Kelvin)
  const [temp, setTemp] = useState<number>(298.15); // 25 C

  const leftCell = halfCells.find(c => c.id === leftCellId) || halfCells[0];
  const rightCell = halfCells.find(c => c.id === rightCellId) || halfCells[1];

  // Solve Potentials
  // Electrode with LOWER reduction potential is oxidized (Anode)
  // Electrode with HIGHER reduction potential is reduced (Cathode)
  const isLeftAnode = leftCell.standardPotential < rightCell.standardPotential;
  const anode = isLeftAnode ? leftCell : rightCell;
  const cathode = isLeftAnode ? rightCell : leftCell;

  const concAnode = isLeftAnode ? concLeft : concRight;
  const concCathode = isLeftAnode ? concRight : concLeft;

  const eStandard = cathode.standardPotential - anode.standardPotential;

  // Nernst Equation: E = E0 - (RT/nF) * ln(Q)
  // R = 8.314 J/molK, F = 96485 C/mol
  const R = 8.314;
  const F = 96485;
  const n = anode.valency; // Moles of electrons transferred
  
  // Q = [Anode Ion] / [Cathode Ion] (accounting for valence stoichiometry if needed, simplified)
  const Q = concAnode / (concCathode || 0.0001);
  const nernstFactor = (R * temp) / (n * F);
  const cellVoltage = Math.max(0, eStandard - nernstFactor * Math.log(Q));

  // Visual Animation Particle positions
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    let frameId: number;
    if (isPlaying && cellVoltage > 0) {
      const tick = () => {
        setAnimProgress(prev => (prev + 1) % 100);
        frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, cellVoltage]);

  // Sync state to parent for AI tutor
  useEffect(() => {
    onUpdateState({
      leftElectrode: leftCell.name,
      rightElectrode: rightCell.name,
      cellAnode: anode.name,
      cellCathode: cathode.name,
      leftConcentration: `${concLeft} M`,
      rightConcentration: `${concRight} M`,
      temperatureKelvin: `${temp} K`,
      standardPotential: `${eStandard.toFixed(4)} V`,
      measuredCellVoltage: `${cellVoltage.toFixed(4)} V`,
      reactionQuotientQ: Q.toFixed(4),
      cellType: leftCellId === rightCellId ? 'CONCENTRATION CELL' : 'GALVANIC CELL'
    });
  }, [leftCellId, rightCellId, concLeft, concRight, temp, cellVoltage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* 2D Schematic Cell Column */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[360px] shadow-2xl overflow-hidden">
        <h4 className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
          Galvanic Cell Diagram
        </h4>

        {/* Voltmeter readout tag */}
        <div className="absolute top-4 right-4 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-center font-mono">
          <span className="text-[8px] uppercase tracking-wider text-purple-400 font-bold block">Voltmeter Readout</span>
          <span className="text-white text-base font-black">{cellVoltage.toFixed(3)} V</span>
        </div>

        {/* Galvanic Cell Schematic SVG */}
        <svg width={360} height={240} className="overflow-visible select-none mt-6">
          {/* 1. Left Beaker (Liquid solution) */}
          <rect x={30} y={110} width={90} height={90} rx={4} fill={leftCell.ionColor} stroke="#374151" strokeWidth={2} />
          {/* Solution label */}
          <text x={75} y={190} fill="#6b7280" fontSize="8" fontWeight="bold" textAnchor="middle">{leftCell.symbol}SO₄ (aq)</text>

          {/* 2. Right Beaker */}
          <rect x={240} y={110} width={90} height={90} rx={4} fill={rightCell.ionColor} stroke="#374151" strokeWidth={2} />
          <text x={285} y={190} fill="#6b7280" fontSize="8" fontWeight="bold" textAnchor="middle">{rightCell.symbol}SO₄ (aq)</text>

          {/* 3. Salt Bridge (inverted U-tube) */}
          <path d="M 100 130 L 100 80 A 10 10 0 0 1 120 70 L 240 70 A 10 10 0 0 1 260 80 L 260 130" fill="none" stroke="#e5e7eb" strokeWidth={12} strokeLinecap="round" />
          <path d="M 100 130 L 100 80 A 10 10 0 0 1 120 70 L 240 70 A 10 10 0 0 1 260 80 L 260 130" fill="none" stroke="#374151" strokeWidth={8} strokeLinecap="round" opacity={0.1} />
          <text x={180} y={65} fill="#9ca3af" fontSize="8" fontWeight="bold" textAnchor="middle">KNO₃ Salt Bridge</text>

          {/* 4. Left Electrode Solid Rod */}
          <rect
            x={65}
            y={80}
            width={20}
            height={80}
            fill={leftCell.color}
            stroke="#111827"
            strokeWidth={1}
            // Anode dissolves (gets thin), Cathode plates (gets thick)
            transform={isLeftAnode ? "scale(0.85, 1) translate(10, 0)" : "scale(1.15, 1) translate(-10, 0)"}
          />
          <text x={75} y={115} fill="#111827" fontSize="8" fontWeight="black" textAnchor="middle">{leftCell.symbol}</text>

          {/* 5. Right Electrode */}
          <rect
            x={275}
            y={80}
            width={20}
            height={80}
            fill={rightCell.color}
            stroke="#111827"
            strokeWidth={1}
            transform={!isLeftAnode ? "scale(0.85, 1) translate(48, 0)" : "scale(1.15, 1) translate(-32, 0)"}
          />
          <text x={285} y={115} fill="#111827" fontSize="8" fontWeight="black" textAnchor="middle">{rightCell.symbol}</text>

          {/* 6. External Wire Circuit */}
          <path d="M 75 80 L 75 40 L 285 40 L 285 80" fill="none" stroke="#4b5563" strokeWidth={3} />
          
          {/* Voltmeter meter box on wire */}
          <circle cx={180} cy={40} r={14} fill="#111827" stroke="#8b5cf6" strokeWidth={2} />
          <text x={180} y={43} fill="#8b5cf6" fontSize="9" fontWeight="bold" textAnchor="middle">V</text>

          {/* 7. Animated Electron travel particles along wire */}
          {cellVoltage > 0 && (() => {
            // Electron flow direction: Anode -> Cathode
            const anodeX = isLeftAnode ? 75 : 285;
            const cathodeX = isLeftAnode ? 285 : 75;
            
            // Calculate coordinate based on progress
            const t = animProgress / 100;
            let pX = 0;
            let pY = 0;

            if (isLeftAnode) {
              // Left (75, 80) -> (75, 40) -> (285, 40) -> (285, 80)
              if (t < 0.2) {
                pX = 75;
                pY = 80 - (t / 0.2) * 40;
              } else if (t < 0.8) {
                pX = 75 + ((t - 0.2) / 0.6) * 210;
                pY = 40;
              } else {
                pX = 285;
                pY = 40 + ((t - 0.8) / 0.2) * 40;
              }
            } else {
              // Right (285, 80) -> (285, 40) -> (75, 40) -> (75, 80)
              if (t < 0.2) {
                pX = 285;
                pY = 80 - (t / 0.2) * 40;
              } else if (t < 0.8) {
                pX = 285 - ((t - 0.2) / 0.6) * 210;
                pY = 40;
              } else {
                pX = 75;
                pY = 40 + ((t - 0.8) / 0.2) * 40;
              }
            }

            return (
              <circle cx={pX} cy={pY} r={3.5} fill="#fbbf24" />
            );
          })()}

          {/* Label indicators */}
          <text x={75} y={225} fill="#9ca3af" fontSize="9" fontWeight="bold" textAnchor="middle">
            {isLeftAnode ? 'Anode (Oxidation)' : 'Cathode (Reduction)'}
          </text>
          <text x={285} y={225} fill="#9ca3af" fontSize="9" fontWeight="bold" textAnchor="middle">
            {!isLeftAnode ? 'Anode (Oxidation)' : 'Cathode (Reduction)'}
          </text>
        </svg>
      </div>

      {/* Half-cell sliders and settings */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 space-y-6">
        <h3 className="text-sm font-extrabold text-white border-b border-gray-900 pb-2 uppercase tracking-widest font-mono">
          Electrochemistry Settings
        </h3>

        <div className="space-y-4 text-xs font-mono">
          
          {/* Half Cell Selection Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-gray-500 text-[10px] uppercase font-bold">Left Half-Cell</span>
              <select
                value={leftCellId}
                onChange={(e) => setLeftCellId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-600 cursor-pointer"
              >
                {halfCells.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <span className="text-gray-500 text-[10px] uppercase font-bold">Right Half-Cell</span>
              <select
                value={rightCellId}
                onChange={(e) => setRightCellId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-600 cursor-pointer"
              >
                {halfCells.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>)}
              </select>
            </div>
          </div>

          {/* Concentration slider Left */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between">
              <span className="text-gray-400">[{leftCell.symbol}²⁺] Ion Concentration</span>
              <span className="text-purple-400 font-bold">{concLeft.toFixed(3)} M</span>
            </div>
            <input
              type="range"
              min={0.001}
              max={2.0}
              step={0.01}
              value={concLeft}
              onChange={(e) => setConcLeft(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Concentration slider Right */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">[{rightCell.symbol}²⁺] Ion Concentration</span>
              <span className="text-purple-400 font-bold">{concRight.toFixed(3)} M</span>
            </div>
            <input
              type="range"
              min={0.001}
              max={2.0}
              step={0.01}
              value={concRight}
              onChange={(e) => setConcRight(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Temperature Kelvin */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Temperature (T)</span>
              <span className="text-purple-400 font-bold">{temp.toFixed(1)} K ({Math.round(temp - 273.15)}°C)</span>
            </div>
            <input
              type="range"
              min={273.15} // 0 C
              max={373.15} // 100 C
              step={5}
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

        </div>

        {/* Electrochemistry summary equation values */}
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 text-[10px] font-mono leading-relaxed space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500 font-bold">Left Standard E°:</span>
            <span className="text-white">{leftCell.standardPotential.toFixed(3)} V</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-bold">Right Standard E°:</span>
            <span className="text-white">{rightCell.standardPotential.toFixed(3)} V</span>
          </div>
          <div className="flex justify-between border-t border-gray-900 pt-1.5 mt-1 font-bold">
            <span className="text-purple-400">Cell Standard E°cell:</span>
            <span className="text-purple-300">{eStandard.toFixed(4)} V</span>
          </div>
        </div>

      </div>
    </div>
  );
}
