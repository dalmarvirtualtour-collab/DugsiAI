import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Activity, Layers } from 'lucide-react';

interface CalculusVisualizerLabProps {
  onUpdateState: (state: any) => void;
}

export default function CalculusVisualizerLab({ onUpdateState }: CalculusVisualizerLabProps) {
  // Mode selection
  const [calcMode, setCalcMode] = useState<'DERIVATIVE' | 'INTEGRAL'>('DERIVATIVE');

  // Function selection
  const [funcId, setFuncId] = useState<'POLYNOMIAL' | 'SINE' | 'EXPONENTIAL'>('POLYNOMIAL');

  // Derivative sliders
  const [basePointX, setBasePointX] = useState<number>(1.0); // x0
  const [intervalH, setIntervalH] = useState<number>(1.5); // h

  // Integral sliders
  const [limitA, setLimitA] = useState<number>(-2.0); // Lower limit a
  const [limitB, setLimitB] = useState<number>(3.0); // Upper limit b
  const [rectCount, setRectCount] = useState<number>(10); // Number of partition rectangles (N)
  const [riemannType, setRiemannType] = useState<'LEFT' | 'RIGHT' | 'MIDPOINT'>('MIDPOINT');

  // Helper functions
  const f = (x: number) => {
    switch (funcId) {
      case 'POLYNOMIAL':
        // f(x) = 0.2 * x^2 - 1
        return 0.15 * x * x - 1;
      case 'SINE':
        // f(x) = 1.5 * sin(x)
        return 1.5 * Math.sin(x);
      case 'EXPONENTIAL':
        // f(x) = 0.3 * e^(0.5x) - 1.5
        return 0.25 * Math.exp(0.6 * x) - 1.5;
      default:
        return x;
    }
  };

  // Analytical derivatives f'(x)
  const df = (x: number) => {
    switch (funcId) {
      case 'POLYNOMIAL':
        return 0.3 * x;
      case 'SINE':
        return 1.5 * Math.cos(x);
      case 'EXPONENTIAL':
        return 0.25 * 0.6 * Math.exp(0.6 * x);
      default:
        return 1;
    }
  };

  // True analytical integrals F(x) = \int f(x) dx
  const F = (x: number) => {
    switch (funcId) {
      case 'POLYNOMIAL':
        return 0.05 * Math.pow(x, 3) - x;
      case 'SINE':
        return -1.5 * Math.cos(x);
      case 'EXPONENTIAL':
        return (0.25 / 0.6) * Math.exp(0.6 * x) - 1.5 * x;
      default:
        return 0.5 * x * x;
    }
  };

  const getTrueIntegralValue = () => {
    return F(limitB) - F(limitA);
  };

  // Riemann Sum Solver
  const getRiemannSumValue = () => {
    const width = (limitB - limitA) / rectCount;
    let sum = 0;
    for (let i = 0; i < rectCount; i++) {
      let xEval = limitA + i * width; // LEFT
      if (riemannType === 'RIGHT') {
        xEval = limitA + (i + 1) * width;
      } else if (riemannType === 'MIDPOINT') {
        xEval = limitA + (i + 0.5) * width;
      }
      sum += f(xEval) * width;
    }
    return sum;
  };

  // Convert graph coordinates to SVG layout coordinates
  // Graph domain is X in [-5, 5], Y in [-4, 4]
  // SVG size is 360 width, 240 height
  const toSvgCoords = (x: number, y: number) => {
    const svgWidth = 360;
    const svgHeight = 240;
    
    // xMap: -5 -> 30, 5 -> 330
    const svgX = 30 + ((x + 5) / 10) * 300;
    
    // yMap: 4 -> 20, -4 -> 220
    const svgY = 20 + ((4 - y) / 8) * 200;
    
    return { x: svgX, y: svgY };
  };

  // Sync state to parent for AI tutor
  useEffect(() => {
    const secantSlope = (f(basePointX + intervalH) - f(basePointX)) / intervalH;
    const trueSlope = df(basePointX);

    onUpdateState({
      calculusMode: calcMode,
      activeFunction: funcId,
      basePointX: basePointX.toFixed(3),
      secantIntervalH: intervalH.toFixed(3),
      secantLineSlope: secantSlope.toFixed(4),
      analyticalDerivative: trueSlope.toFixed(4),
      riemannSumValue: calcMode === 'INTEGRAL' ? getRiemannSumValue().toFixed(4) : 'N/A',
      trueIntegralValue: calcMode === 'INTEGRAL' ? getTrueIntegralValue().toFixed(4) : 'N/A',
      partitionsCountN: rectCount
    });
  }, [calcMode, funcId, basePointX, intervalH, limitA, limitB, rectCount, riemannType]);

  // Generate SVG curve path
  const generateCurvePath = () => {
    let path = '';
    const step = 0.1;
    for (let x = -5.0; x <= 5.0; x += step) {
      const y = f(x);
      const pos = toSvgCoords(x, y);
      
      // Clamp boundaries inside visual field
      if (x === -5.0) {
        path += `M ${pos.x} ${pos.y}`;
      } else {
        path += ` L ${pos.x} ${pos.y}`;
      }
    }
    return path;
  };

  // Generate Riemann Rectangles
  const renderRiemannRects = () => {
    if (calcMode !== 'INTEGRAL') return null;

    const width = (limitB - limitA) / rectCount;
    const rects = [];

    for (let i = 0; i < rectCount; i++) {
      const xLeft = limitA + i * width;
      const xRight = limitA + (i + 1) * width;
      
      let xEval = xLeft; // LEFT
      if (riemannType === 'RIGHT') xEval = xRight;
      if (riemannType === 'MIDPOINT') xEval = xLeft + 0.5 * width;

      const yVal = f(xEval);
      
      const posLeft = toSvgCoords(xLeft, yVal);
      const posRight = toSvgCoords(xRight, 0); // Ground position
      const posBase = toSvgCoords(xLeft, 0);

      // Width and Height in SVG pixels
      const svgWidth = Math.abs(posRight.x - posLeft.x);
      const svgHeight = Math.abs(posLeft.y - posBase.y);

      // If function is positive, rectangle goes upwards, else downwards
      const rectY = yVal >= 0 ? posLeft.y : posBase.y;

      rects.push(
        <rect
          key={`riem-${i}`}
          x={posLeft.x}
          y={rectY}
          width={svgWidth}
          height={svgHeight}
          fill="rgba(139, 92, 246, 0.25)"
          stroke="#8b5cf6"
          strokeWidth={0.8}
        />
      );
    }

    return rects;
  };

  // Generate Secant line
  const renderSecantLine = () => {
    if (calcMode !== 'DERIVATIVE') return null;

    const x1 = basePointX;
    const y1 = f(x1);
    const x2 = basePointX + intervalH;
    const y2 = f(x2);

    const pos1 = toSvgCoords(x1, y1);
    const pos2 = toSvgCoords(x2, y2);

    // Calculate line stretching across domain limits (-5 to 5)
    const slope = (y2 - y1) / (x2 - x1);
    const intercept = y1 - slope * x1;

    const posStart = toSvgCoords(-5.0, slope * -5.0 + intercept);
    const posEnd = toSvgCoords(5.0, slope * 5.0 + intercept);

    return (
      <g>
        {/* Secant line */}
        <line
          x1={posStart.x}
          y1={posStart.y}
          x2={posEnd.x}
          y2={posEnd.y}
          stroke="#fbbf24" // Yellow secant line
          strokeWidth={2}
        />
        {/* Tangent comparison line (drawn at base point) */}
        {(() => {
          const tSlope = df(x1);
          const tIntercept = y1 - tSlope * x1;
          const posTStart = toSvgCoords(-5.0, tSlope * -5.0 + tIntercept);
          const posTEnd = toSvgCoords(5.0, tSlope * 5.0 + tIntercept);
          return (
            <line
              x1={posTStart.x}
              y1={posTStart.y}
              x2={posTEnd.x}
              y2={posTEnd.y}
              stroke="#10b981" // Green tangent
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
          );
        })()}
        
        {/* Highlighted dots */}
        <circle cx={pos1.x} cy={pos1.y} r={5} fill="#10b981" stroke="#ffffff" strokeWidth={1} />
        <circle cx={pos2.x} cy={pos2.y} r={5} fill="#fbbf24" stroke="#ffffff" strokeWidth={1} />
      </g>
    );
  };

  const trueIntegral = getTrueIntegralValue();
  const riemannSum = getRiemannSumValue();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* 2D Precision Graph Canvas */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[360px] shadow-2xl overflow-hidden">
        <h4 className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
          Calculus Function Plot
        </h4>

        {/* Math Graph SVG */}
        <svg width={360} height={240} className="overflow-visible select-none">
          {/* Y-Axis */}
          <line x1={180} y1={10} x2={180} y2={230} stroke="#475569" strokeWidth={1.5} />
          {/* X-Axis */}
          <line x1={20} y1={120} x2={340} y2={120} stroke="#475569" strokeWidth={1.5} />

          {/* Riemann Sum boxes (rendered behind curve) */}
          {renderRiemannRects()}

          {/* Plotted function curve path */}
          <path
            d={generateCurvePath()}
            fill="none"
            stroke="#7c3aed"
            strokeWidth={3}
          />

          {/* Derivative secant/tangent lines */}
          {renderSecantLine()}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 bg-gray-950/80 border border-gray-900 rounded-xl p-2 flex justify-around text-[9px] font-bold font-mono">
          <span className="text-purple-400">f(x) Function</span>
          {calcMode === 'DERIVATIVE' ? (
            <>
              <span className="text-emerald-400">--- Tangent Line</span>
              <span className="text-yellow-500">&mdash; Secant Line</span>
            </>
          ) : (
            <span className="text-purple-300">Riemann Partitions</span>
          )}
        </div>
      </div>

      {/* Calculus Control board panel */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-900 pb-2">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono">
              Calculus Dials
            </h3>
            
            <div className="flex space-x-1">
              {['DERIVATIVE', 'INTEGRAL'].map(m => (
                <button
                  key={m}
                  onClick={() => setCalcMode(m as any)}
                  className={`px-3 py-1 text-[9px] font-black rounded-lg border cursor-pointer transition-all ${
                    calcMode === m 
                      ? 'bg-purple-900/30 border-purple-800 text-purple-300' 
                      : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Function Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase font-mono block">Select Function f(x)</span>
            <div className="flex space-x-2">
              {[
                { id: 'POLYNOMIAL', label: 'Polynomial (f(x) = 0.15x² - 1)' },
                { id: 'SINE', label: 'Trigonometric (f(x) = 1.5 sin x)' },
                { id: 'EXPONENTIAL', label: 'Exponential (f(x) = 0.25e^0.6x - 1.5)' }
              ].map(fn => (
                <button
                  key={fn.id}
                  onClick={() => setFuncId(fn.id as any)}
                  className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                    funcId === fn.id 
                      ? 'bg-purple-900/20 border-purple-800 text-purple-400' 
                      : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white'
                  }`}
                >
                  {fn.id.substring(0, 4)}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Sliders based on Mode */}
          {calcMode === 'DERIVATIVE' ? (
            <div className="space-y-4 pt-2 text-xs font-mono">
              {/* Slider x0 base */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Base Point (x₀)</span>
                  <span className="text-purple-400 font-bold">{basePointX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-3.0}
                  max={3.0}
                  step={0.1}
                  value={basePointX}
                  onChange={(e) => setBasePointX(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Slider h interval */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Secant Interval (h)</span>
                  <span className="text-purple-400 font-bold">{intervalH.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min={0.01} // Approaching tangent as h -> 0
                  max={3.0}
                  step={0.01}
                  value={intervalH}
                  onChange={(e) => setIntervalH(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2 text-xs font-mono">
              {/* Riemann partition count */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rectangles Count (N)</span>
                  <span className="text-purple-400 font-bold">{rectCount}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={50}
                  value={rectCount}
                  onChange={(e) => setRectCount(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Riemann Type */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Summation Style</span>
                <div className="flex space-x-1.5">
                  {['LEFT', 'RIGHT', 'MIDPOINT'].map(type => (
                    <button
                      key={type}
                      onClick={() => setRiemannType(type as any)}
                      className={`flex-1 py-1 text-[9px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        riemannType === type 
                          ? 'bg-purple-900/20 border-purple-800 text-purple-400' 
                          : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Math readouts */}
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 text-[10px] font-mono leading-relaxed space-y-1.5">
          {calcMode === 'DERIVATIVE' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Secant Slope [f(x₀+h)-f(x₀)]/h:</span>
                <span className="text-yellow-500 font-black">{((f(basePointX+intervalH)-f(basePointX))/intervalH).toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">True Derivative f'(x₀):</span>
                <span className="text-emerald-400 font-black">{df(basePointX).toFixed(4)}</span>
              </div>
              <div className="bg-purple-950/15 border border-purple-900/25 p-2 rounded-xl text-[9px] text-purple-300 leading-normal mt-1.5 italic text-center">
                Observe: As interval h decreases toward 0.01, the yellow secant line aligns perfectly with the green tangent line, and the slopes match!
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Riemann Sum Estimate:</span>
                <span className="text-purple-300 font-black">{riemannSum.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">True Integral Area:</span>
                <span className="text-emerald-400 font-black">{trueIntegral.toFixed(4)}</span>
              </div>
              <div className="bg-purple-950/15 border border-purple-900/25 p-2 rounded-xl text-[9px] text-purple-300 leading-normal mt-1.5 italic text-center">
                Observe: As rectangle count N increases, the Riemann sum approaches the exact continuous integral area under the curve!
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
