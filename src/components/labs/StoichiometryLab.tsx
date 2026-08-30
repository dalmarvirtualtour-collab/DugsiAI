import React, { useState, useEffect } from 'react';
import { Sparkles, Scale, RefreshCw } from 'lucide-react';

interface StoichiometryLabProps {
  onUpdateState: (state: any) => void;
}

interface Reaction {
  id: string;
  name: string;
  type: string;
  reactants: { name: string; mw: number; symbol: string; formula: string }[];
  products: { name: string; mw: number; symbol: string; formula: string }[];
  correctCoefficients: number[]; // [r1, r2, p1, p2]
}

export default function StoichiometryLab({ onUpdateState }: StoichiometryLabProps) {
  // Reaction Registry
  const reactions: Reaction[] = [
    {
      id: 'synthesis',
      name: 'Water Synthesis',
      type: 'Synthesis',
      reactants: [
        { name: 'Hydrogen Gas', mw: 2.016, symbol: 'H', formula: 'H₂' },
        { name: 'Oxygen Gas', mw: 32.00, symbol: 'O', formula: 'O₂' }
      ],
      products: [
        { name: 'Water Vapor', mw: 18.015, symbol: 'H₂O', formula: 'H₂O' }
      ],
      correctCoefficients: [2, 1, 2] // 2 H2 + O2 -> 2 H2O
    },
    {
      id: 'combustion',
      name: 'Methane Combustion',
      type: 'Combustion',
      reactants: [
        { name: 'Methane', mw: 16.04, symbol: 'C', formula: 'CH₄' },
        { name: 'Oxygen Gas', mw: 32.00, symbol: 'O', formula: 'O₂' }
      ],
      products: [
        { name: 'Carbon Dioxide', mw: 44.01, symbol: 'CO₂', formula: 'CO₂' },
        { name: 'Water Vapor', mw: 18.015, symbol: 'H₂O', formula: 'H₂O' }
      ],
      correctCoefficients: [1, 2, 1, 2] // CH4 + 2 O2 -> CO2 + 2 H2O
    },
    {
      id: 'decomposition',
      name: 'Water Decomposition',
      type: 'Decomposition',
      reactants: [
        { name: 'Water', mw: 18.015, symbol: 'H₂O', formula: 'H₂O' }
      ],
      products: [
        { name: 'Hydrogen Gas', mw: 2.016, symbol: 'H', formula: 'H₂' },
        { name: 'Oxygen Gas', mw: 32.00, symbol: 'O', formula: 'O₂' }
      ],
      correctCoefficients: [2, 2, 1] // 2 H2O -> 2 H2 + O2
    }
  ];

  const [activeReaction, setActiveReaction] = useState<Reaction>(reactions[0]);
  
  // Coefficients entered by user
  const [coeffs, setCoeffs] = useState<number[]>([1, 1, 1]); // matches reactants + products count
  
  // Stoichiometry Masses
  const [massR1, setMassR1] = useState<number>(10.0); // grams
  const [massR2, setMassR2] = useState<number>(30.0); // grams

  // Sync coefficients length to active reaction
  useEffect(() => {
    setCoeffs(activeReaction.correctCoefficients.map(() => 1));
    setMassR1(10.0);
    setMassR2(30.0);
  }, [activeReaction]);

  // Calculations
  const isBalanced = coeffs.every((val, idx) => val === activeReaction.correctCoefficients[idx]);

  // Balanced calculation logic
  const mwR1 = activeReaction.reactants[0].mw;
  const mwR2 = activeReaction.reactants[1]?.mw || 1.0;
  const cR1 = activeReaction.correctCoefficients[0];
  const cR2 = activeReaction.correctCoefficients[1] || 1.0;
  
  const molesR1 = massR1 / mwR1;
  const molesR2 = activeReaction.reactants.length > 1 ? massR2 / mwR2 : 0;

  // Limiting reactant solver
  let limitingReactant = '';
  let excessReactant = '';
  let theoreticalYield = 0; // grams of first product
  let excessRemaining = 0; // grams of remaining second reactant

  if (activeReaction.reactants.length > 1) {
    const ratioR1 = molesR1 / cR1;
    const ratioR2 = molesR2 / cR2;

    if (ratioR1 < ratioR2) {
      limitingReactant = activeReaction.reactants[0].name;
      excessReactant = activeReaction.reactants[1].name;
      
      // Calculate yield of first product
      const productCoeff = activeReaction.correctCoefficients[2];
      const mwProduct = activeReaction.products[0].mw;
      const productMoles = molesR1 * (productCoeff / cR1);
      theoreticalYield = productMoles * mwProduct;

      // Excess remaining calculations
      const excessConsumedMoles = molesR1 * (cR2 / cR1);
      excessRemaining = Math.max(0, (molesR2 - excessConsumedMoles) * mwR2);
    } else {
      limitingReactant = activeReaction.reactants[1].name;
      excessReactant = activeReaction.reactants[0].name;

      const productCoeff = activeReaction.correctCoefficients[2];
      const mwProduct = activeReaction.products[0].mw;
      const productMoles = molesR2 * (productCoeff / cR2);
      theoreticalYield = productMoles * mwProduct;

      const excessConsumedMoles = molesR2 * (cR1 / cR2);
      excessRemaining = Math.max(0, (molesR1 - excessConsumedMoles) * mwR1);
    }
  }

  // Sync state to parent for AI tutor
  useEffect(() => {
    onUpdateState({
      reactionName: activeReaction.name,
      reactionType: activeReaction.type,
      equationStatus: isBalanced ? 'BALANCED' : 'UNBALANCED',
      limitingReactant: activeReaction.reactants.length > 1 ? limitingReactant : 'None (Single Reactant)',
      reactant1Mass: `${massR1} g`,
      reactant2Mass: activeReaction.reactants.length > 1 ? `${massR2} g` : 'N/A',
      theoreticalYield: `${theoreticalYield.toFixed(3)} g`,
      excessRemaining: activeReaction.reactants.length > 1 ? `${excessRemaining.toFixed(3)} g` : 'N/A'
    });
  }, [activeReaction, coeffs, massR1, massR2, limitingReactant, theoreticalYield]);

  // Scale tilt calculation: compare coefficients totals
  // Left side sum (reactants), Right side sum (products)
  const leftAtomsCount = coeffs.slice(0, activeReaction.reactants.length).reduce((sum, val, idx) => {
    // Basic approximate atom count for visual weight
    return sum + val * (activeReaction.id === 'synthesis' ? (idx === 0 ? 2 : 2) : (idx === 0 ? 5 : 2));
  }, 0);

  const rightAtomsCount = coeffs.slice(activeReaction.reactants.length).reduce((sum, val, idx) => {
    return sum + val * (activeReaction.id === 'synthesis' ? 3 : (idx === 0 ? 3 : 3));
  }, 0);

  // Calculate tilt angle in degrees: negative tilt left, positive tilt right
  const tilt = Math.max(-25, Math.min(25, (rightAtomsCount - leftAtomsCount) * 4));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      
      {/* SVG Balance Scale Column */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[360px] shadow-2xl overflow-hidden">
        <h4 className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
          Atom Balance Scale View
        </h4>

        {/* Balance Scale SVG */}
        <svg width={320} height={240} className="overflow-visible select-none">
          {/* Main pillar */}
          <rect x={155} y={80} width={10} height={130} fill="#374151" />
          <path d="M 130 210 L 190 210 L 160 170 Z" fill="#1f2937" />

          {/* Rotating Beam group (rotates around center (160, 80)) */}
          <g transform={`rotate(${tilt}, 160, 80)`}>
            {/* Beam bar */}
            <line x1={50} y1={80} x2={270} y2={80} stroke="#4b5563" strokeWidth={4} />
            <circle cx={160} cy={80} r={6} fill="#6b7280" />

            {/* Left pan strings and pan (around x=50, y=80) */}
            <g transform="translate(50, 80)">
              <line x1={0} y1={0} x2={-25} y2={60} stroke="#9ca3af" strokeWidth={1} />
              <line x1={0} y1={0} x2={25} y2={60} stroke="#9ca3af" strokeWidth={1} />
              <path d="M -35 60 L 35 60 C 35 75, -35 75, -35 60 Z" fill="#1f2937" stroke="#374151" strokeWidth={1.5} />
              
              {/* Reactant atoms count visualization */}
              <text x={0} y={45} fill="#4b5563" fontSize="8" fontWeight="bold" textAnchor="middle">Reactants</text>
              <circle cx={-10} cy={60} r={4} fill="#60a5fa" />
              <circle cx={10} cy={60} r={4} fill="#f87171" />
            </g>

            {/* Right pan strings and pan (around x=270, y=80) */}
            <g transform="translate(270, 80)">
              <line x1={0} y1={0} x2={-25} y2={60} stroke="#9ca3af" strokeWidth={1} />
              <line x1={0} y1={0} x2={25} y2={60} stroke="#9ca3af" strokeWidth={1} />
              <path d="M -35 60 L 35 60 C 35 75, -35 75, -35 60 Z" fill="#1f2937" stroke="#374151" strokeWidth={1.5} />
              
              {/* Product atoms count visualization */}
              <text x={0} y={45} fill="#4b5563" fontSize="8" fontWeight="bold" textAnchor="middle">Products</text>
              <circle cx={-5} cy={60} r={4} fill="#fbbf24" />
              <circle cx={5} cy={55} r={4} fill="#60a5fa" />
            </g>
          </g>
        </svg>

        {/* Balanced Sparkle banner */}
        {isBalanced && (
          <div className="absolute top-4 right-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest font-mono flex items-center space-x-1.5 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>REACTION BALANCED!</span>
          </div>
        )}
      </div>

      {/* Balancing Controls Panel */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 space-y-6">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold text-purple-400">Balancing Mode</span>
          <div className="flex space-x-2 mt-1.5">
            {reactions.map(r => (
              <button
                key={r.id}
                onClick={() => setActiveReaction(r)}
                className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wide rounded-xl border text-center transition-all cursor-pointer ${
                  activeReaction.id === r.id 
                    ? 'bg-purple-900/30 border-purple-800 text-purple-300' 
                    : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Coefficient controllers */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block border-b border-gray-900 pb-1">
            Tap Coefficients to Balance Equation
          </span>
          
          <div className="flex flex-wrap items-center justify-center gap-3 bg-gray-950 border border-gray-900 p-4 rounded-2xl font-mono text-xs">
            {/* Reactants side */}
            {activeReaction.reactants.map((r, idx) => (
              <div key={`reac-${idx}`} className="flex items-center space-x-1">
                {idx > 0 && <span className="text-gray-500 font-bold px-1">+</span>}
                <select
                  value={coeffs[idx] || 1}
                  onChange={(e) => {
                    const next = [...coeffs];
                    next[idx] = parseInt(e.target.value, 10);
                    setCoeffs(next);
                  }}
                  className="bg-gray-900 border border-gray-800 text-purple-300 px-2 py-1 rounded focus:outline-none focus:border-purple-600 font-bold cursor-pointer"
                >
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-white font-bold">{r.formula}</span>
              </div>
            ))}

            <span className="text-purple-400 font-bold px-2">&rarr;</span>

            {/* Products side */}
            {activeReaction.products.map((p, idx) => {
              const arrayOffset = activeReaction.reactants.length + idx;
              return (
                <div key={`prod-${idx}`} className="flex items-center space-x-1">
                  {idx > 0 && <span className="text-gray-500 font-bold px-1">+</span>}
                  <select
                    value={coeffs[arrayOffset] || 1}
                    onChange={(e) => {
                      const next = [...coeffs];
                      next[arrayOffset] = parseInt(e.target.value, 10);
                      setCoeffs(next);
                    }}
                    className="bg-gray-900 border border-gray-800 text-purple-300 px-2 py-1 rounded focus:outline-none focus:border-purple-600 font-bold cursor-pointer"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <span className="text-white font-bold">{p.formula}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mass ratios and Stoichiometry calculations */}
        {isBalanced ? (
          <div className="space-y-4 border-t border-gray-900 pt-4">
            <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block">
              Stoichiometric Mass Controllers
            </span>

            {/* Slider Mass R1 */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400 font-bold">Mass of {activeReaction.reactants[0].name} ({activeReaction.reactants[0].formula})</span>
                <span className="text-purple-400 font-bold">{massR1} g</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={50.0}
                step={0.5}
                value={massR1}
                onChange={(e) => setMassR1(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Slider Mass R2 */}
            {activeReaction.reactants.length > 1 && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-gray-400 font-bold">Mass of {activeReaction.reactants[1].name} ({activeReaction.reactants[1].formula})</span>
                  <span className="text-purple-400 font-bold">{massR2} g</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={50.0}
                  step={0.5}
                  value={massR2}
                  onChange={(e) => setMassR2(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            )}

            {/* Limiting and Yield readout details block */}
            <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold block">Limiting Reactant</span>
                <p className="text-rose-400 font-black mt-0.5">{limitingReactant || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold block">Excess Remaining</span>
                <p className="text-white font-black mt-0.5">{excessRemaining.toFixed(2)} g</p>
              </div>
              <div className="col-span-2 border-t border-gray-900 pt-2 text-center">
                <span className="text-gray-500 text-[10px] uppercase font-bold block">Theoretical Product Yield ({activeReaction.products[0].formula})</span>
                <p className="text-emerald-400 font-black text-sm mt-0.5">{theoreticalYield.toFixed(2)} g</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-950/10 border border-amber-900/20 rounded-xl p-4 text-center text-xs text-amber-200">
            ⚠️ Equation is currently unbalanced. Please select the correct coefficients to unlock limiting reactant and stoichiometry mass calculations.
          </div>
        )}

      </div>
    </div>
  );
}
