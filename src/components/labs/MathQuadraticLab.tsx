import React, { useState, useEffect } from 'react';

interface MathQuadraticLabProps {
  onUpdateState: (state: any) => void;
}

export default function MathQuadraticLab({ onUpdateState }: MathQuadraticLabProps) {
  // Coefficients state
  const [a, setA] = useState<number>(1.0);
  const [b, setB] = useState<number>(-4.0);
  const [c, setC] = useState<number>(3.0);

  // Math Calculations
  const vertexX = -b / (2 * a);
  const vertexY = a * Math.pow(vertexX, 2) + b * vertexX + c;

  const discriminant = Math.pow(b, 2) - 4 * a * c;

  let roots: number[] = [];
  if (discriminant > 0) {
    const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    roots = [r1, r2].sort((x, y) => x - y);
  } else if (discriminant === 0) {
    roots = [-b / (2 * a)];
  }

  // Sync state to parent for AI tutor
  useEffect(() => {
    onUpdateState({
      coefficientA: a,
      coefficientB: b,
      coefficientC: c,
      vertex: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`,
      discriminant: parseFloat(discriminant.toFixed(3)),
      roots: roots.length > 0 ? roots.map(r => r.toFixed(2)).join(', ') : 'No real roots',
      yIntercept: `(0, ${c.toFixed(2)})`
    });
  }, [a, b, c]);

  // Graph coordinate mapping properties
  const graphWidth = 340;
  const graphHeight = 340;
  const minX = -10;
  const maxX = 10;
  const minY = -10;
  const maxY = 10;

  // Convert math coordinate to SVG coordinate
  const mapX = (x: number) => {
    return ((x - minX) / (maxX - minX)) * graphWidth;
  };

  const mapY = (y: number) => {
    return graphHeight - ((y - minY) / (maxY - minY)) * graphHeight;
  };

  // Generate SVG path for the quadratic parabola
  const generateParabolaPath = () => {
    const points: string[] = [];
    const step = 0.1;
    for (let x = minX; x <= maxX; x += step) {
      const y = a * Math.pow(x, 2) + b * x + c;
      // Clamp values to prevent path stretching glitches
      if (y >= minY - 5 && y <= maxY + 5) {
        const svgX = mapX(x);
        const svgY = mapY(y);
        if (points.length === 0) {
          points.push(`M ${svgX} ${svgY}`);
        } else {
          points.push(`L ${svgX} ${svgY}`);
        }
      }
    }
    return points.join(' ');
  };

  // Grid background markings
  const gridLines = [];
  for (let i = minX + 1; i < maxX; i++) {
    gridLines.push(
      <line
        key={`x-${i}`}
        x1={mapX(i)}
        y1={0}
        x2={mapX(i)}
        y2={graphHeight}
        stroke="#111827"
        strokeWidth={i === 0 ? 2 : 0.5}
        strokeDasharray={i === 0 ? undefined : "2 2"}
      />
    );
  }
  for (let i = minY + 1; i < maxY; i++) {
    gridLines.push(
      <line
        key={`y-${i}`}
        x1={0}
        y1={mapY(i)}
        x2={graphWidth}
        y2={mapY(i)}
        stroke="#111827"
        strokeWidth={i === 0 ? 2 : 0.5}
        strokeDasharray={i === 0 ? undefined : "2 2"}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* 2D Plotter Column */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[360px] shadow-2xl overflow-hidden">
        
        {/* SVG Drawing Canvas */}
        <svg width={graphWidth} height={graphHeight} className="overflow-visible select-none">
          {/* Grid lines */}
          {gridLines}

          {/* Coordinate axis labels */}
          <text x={graphWidth - 10} y={mapY(0.4)} fill="#4b5563" fontSize="9" fontWeight="bold">X</text>
          <text x={mapX(0.4)} y={15} fill="#4b5563" fontSize="9" fontWeight="bold">Y</text>

          {/* Axis numbers */}
          <text x={mapX(5)} y={mapY(-0.6)} fill="#4b5563" fontSize="8" textAnchor="middle">5</text>
          <text x={mapX(-5)} y={mapY(-0.6)} fill="#4b5563" fontSize="8" textAnchor="middle">-5</text>
          <text x={mapX(0.4)} y={mapY(5) + 3} fill="#4b5563" fontSize="8">5</text>
          <text x={mapX(0.4)} y={mapY(-5) + 3} fill="#4b5563" fontSize="8">-5</text>

          {/* Axis of Symmetry (Dashed Vertical) */}
          {vertexX >= minX && vertexX <= maxX && (
            <line
              x1={mapX(vertexX)}
              y1={0}
              x2={mapX(vertexX)}
              y2={graphHeight}
              stroke="#a78bfa"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}

          {/* Parabolic Curve */}
          <path
            d={generateParabolaPath()}
            fill="none"
            stroke="#a78bfa"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Vertex point */}
          {vertexX >= minX && vertexX <= maxX && vertexY >= minY && vertexY <= maxY && (
            <>
              <circle cx={mapX(vertexX)} cy={mapY(vertexY)} r={6} fill="#7c3aed" stroke="#ffffff" strokeWidth={1.5} />
              <text x={mapX(vertexX) + 8} y={mapY(vertexY) - 5} fill="#a78bfa" fontSize="9" fontWeight="bold">
                Vertex ({vertexX.toFixed(1)}, {vertexY.toFixed(1)})
              </text>
            </>
          )}

          {/* Roots points (X-intercepts) */}
          {roots.map((root, idx) => {
            if (root >= minX && root <= maxX) {
              return (
                <g key={`root-${idx}`}>
                  <circle cx={mapX(root)} cy={mapY(0)} r={5} fill="#10b981" stroke="#ffffff" strokeWidth={1} />
                  <text x={mapX(root)} y={mapY(0) + 16} fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="middle">
                    x={root.toFixed(1)}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* y-intercept point */}
          {c >= minY && c <= maxY && (
            <>
              <circle cx={mapX(0)} cy={mapY(c)} r={5} fill="#f59e0b" stroke="#ffffff" strokeWidth={1} />
              <text x={mapX(0) - 8} y={mapY(c) + 4} fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="end">
                y={c}
              </text>
            </>
          )}
        </svg>

        {/* Labels Overlay */}
        <div className="absolute top-4 left-4 bg-gray-900 border border-gray-800 rounded-xl p-2.5 space-y-1 text-[10px] font-bold font-mono text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Vertex Position</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Roots / X-intercepts</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Y-intercept</span>
          </div>
        </div>
      </div>

      {/* Control sliders Column */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 space-y-6">
        <h3 className="text-sm font-extrabold text-white border-b border-gray-900 pb-2 uppercase tracking-widest font-mono">
          Quadratic Coefficients
        </h3>

        {/* Sliders */}
        <div className="space-y-5 text-xs">
          
          {/* Coefficient a */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400 font-bold">Coefficient a (Scale & Open)</span>
              <span className="text-purple-400 font-bold">{a.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={-3.0}
              max={3.0}
              step={0.1}
              value={a}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                // Prevent exact zero to avoid division by zero crashes
                setA(val === 0 ? 0.1 : val);
              }}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <span className="text-[9px] text-gray-500 font-mono italic block pt-0.5">
              {a > 0 ? "Parabola opens UPWARDS (a > 0)" : "Parabola opens DOWNWARDS (a < 0)"}
            </span>
          </div>

          {/* Coefficient b */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400 font-bold">Coefficient b (Vertex Shift)</span>
              <span className="text-purple-400 font-bold">{b.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={-8.0}
              max={8.0}
              step={0.2}
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Coefficient c */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400 font-bold">Coefficient c (Y-intercept)</span>
              <span className="text-purple-400 font-bold">{c.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={-8.0}
              max={8.0}
              step={0.5}
              value={c}
              onChange={(e) => setC(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

        </div>

        {/* Computed Equation Block */}
        <div className="bg-gray-950 border border-gray-900 rounded-xl p-4 text-center font-mono">
          <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Active Mathematical Function</span>
          <h4 className="text-sm font-black text-purple-300">
            y = {a.toFixed(1)}x² {b >= 0 ? `+ ${b.toFixed(1)}` : `- ${Math.abs(b).toFixed(1)}`}x {c >= 0 ? `+ ${c.toFixed(1)}` : `- ${Math.abs(c).toFixed(1)}`}
          </h4>
        </div>
      </div>
    </div>
  );
}
