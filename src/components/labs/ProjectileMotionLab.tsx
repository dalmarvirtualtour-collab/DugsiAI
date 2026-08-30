import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Target } from 'lucide-react';

interface ProjectileMotionLabProps {
  onUpdateState: (state: any) => void;
}

export default function ProjectileMotionLab({ onUpdateState }: ProjectileMotionLabProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation Parameters
  const [angle, setAngle] = useState<number>(45); // Degrees
  const [velocity, setVelocity] = useState<number>(20); // m/s
  const [initialHeight, setInitialHeight] = useState<number>(0); // m
  const [gravity, setGravity] = useState<number>(9.81); // m/s^2
  const [drag, setDrag] = useState<number>(0.05); // Air resistance coeff (k)
  const [wind, setWind] = useState<number>(0); // Wind acceleration (m/s^2)

  // Target Game Mode
  const [targetDist, setTargetDist] = useState<number>(30); // Target position in meters
  const [targetWidth, setTargetWidth] = useState<number>(4); // Width in meters
  const [isHit, setIsHit] = useState<boolean>(false);

  // Animation Play state
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animTime, setAnimTime] = useState<number>(0);
  const [trajectoryPoints, setTrajectoryPoints] = useState<Array<{ x: number; y: number; vx: number; vy: number }>>([]);

  // Physics trajectory solver (Euler numerical integration)
  const solveTrajectory = () => {
    const points = [];
    let x = 0;
    let y = initialHeight;
    
    // Initial velocity components
    const rad = (angle * Math.PI) / 180;
    let vx = velocity * Math.cos(rad);
    let vy = velocity * Math.sin(rad);
    
    const dt = 0.02; // Time step
    let time = 0;

    points.push({ x, y, vx, vy });

    // Loop until ball hits the ground (y <= 0)
    while (y >= 0 && time < 15) {
      // Net accelerations: a = F/m (assuming m = 1.0kg)
      // drag forces F = -k*v
      const ax = -drag * vx + wind;
      const ay = -gravity - drag * vy;

      // Update positions
      x += vx * dt;
      y += vy * dt;

      // Update velocities
      vx += ax * dt;
      vy += ay * dt;

      points.push({ x, y, vx, vy });
      time += dt;
    }

    return points;
  };

  // Recalculate trajectory on slider shifts
  useEffect(() => {
    const points = solveTrajectory();
    setTrajectoryPoints(points);

    // Analyze final range and peak height
    const finalPoint = points[points.length - 1] || { x: 0 };
    const maxH = Math.max(...points.map(p => p.y));
    const range = finalPoint.x;

    // Check target hit
    const hit = Math.abs(range - targetDist) <= targetWidth / 2;
    setIsHit(hit);

    // Telemetry updates to parent
    onUpdateState({
      launchAngle: `${angle}°`,
      initialVelocity: `${velocity} m/s`,
      initialHeight: `${initialHeight} m`,
      gravityConstant: `${gravity} m/s²`,
      dragCoefficient: drag,
      windSpeed: `${wind} m/s²`,
      maxHeightReached: `${maxH.toFixed(2)} m`,
      horizontalRange: `${range.toFixed(2)} m`,
      targetStatus: hit ? '🎯 TARGET HIT!' : 'MISS'
    });

    if (!isAnimating) {
      setAnimTime(0);
    }
  }, [angle, velocity, initialHeight, gravity, drag, wind, targetDist]);

  // Animation ticks
  useEffect(() => {
    let intervalId: any;
    if (isAnimating) {
      intervalId = setInterval(() => {
        setAnimTime(prev => {
          if (prev >= trajectoryPoints.length - 1) {
            setIsAnimating(false);
            return trajectoryPoints.length - 1;
          }
          return prev + 1;
        });
      }, 20); // 50 FPS
    }
    return () => clearInterval(intervalId);
  }, [isAnimating, trajectoryPoints]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pixel scales: 1 meter = 8 pixels
    const scale = 8;
    const startX = 40;
    const startY = canvas.height - 40; // Ground position

    // Draw grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += scale * 5) {
      ctx.beginPath();
      ctx.moveTo(startX + i, 0);
      ctx.lineTo(startX + i, startY);
      ctx.stroke();
    }
    for (let i = 0; i < startY; i += scale * 5) {
      ctx.beginPath();
      ctx.moveTo(startX, startY - i);
      ctx.lineTo(canvas.width, startY - i);
      ctx.stroke();
    }

    // Draw Ground
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.lineTo(canvas.width, startY);
    ctx.stroke();

    // Draw Target platform
    const targetPxX = startX + targetDist * scale;
    const targetPxWidth = targetWidth * scale;
    ctx.fillStyle = isHit ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(targetPxX - targetPxWidth / 2, startY, targetPxWidth, 12);
    ctx.strokeStyle = isHit ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(targetPxX - targetPxWidth / 2, startY, targetPxWidth, 12);

    // Draw Target Flag pole
    ctx.beginPath();
    ctx.moveTo(targetPxX, startY);
    ctx.lineTo(targetPxX, startY - 30);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Flag banner
    ctx.fillStyle = isHit ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(targetPxX, startY - 30);
    ctx.lineTo(targetPxX + 15, startY - 22);
    ctx.lineTo(targetPxX, startY - 15);
    ctx.fill();

    // Draw Trajectory Trace line
    ctx.beginPath();
    ctx.strokeStyle = '#7c3aed'; // Violet path
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 2]);
    trajectoryPoints.forEach((p, idx) => {
      const pxX = startX + p.x * scale;
      const pxY = startY - p.y * scale;
      if (idx === 0) ctx.moveTo(pxX, pxY);
      else ctx.lineTo(pxX, pxY);
    });
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // Draw Launch Height Tower (if initialHeight > 0)
    if (initialHeight > 0) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(startX - 8, startY - initialHeight * scale, 16, initialHeight * scale);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(startX - 8, startY - initialHeight * scale, 16, initialHeight * scale);
    }

    // Draw flying ball and velocity vectors
    const activePoint = trajectoryPoints[animTime] || trajectoryPoints[0] || { x: 0, y: initialHeight, vx: 0, vy: 0 };
    const ballPxX = startX + activePoint.x * scale;
    const ballPxY = startY - activePoint.y * scale;

    ctx.fillStyle = '#fbbf24'; // Yellow ball
    ctx.beginPath();
    ctx.arc(ballPxX, ballPxY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Draw Instantaneous Velocity Vector Arrows (if animating or paused on step)
    if (activePoint.vx !== 0 || activePoint.vy !== 0) {
      const arrowScale = 2.5; // Scale velocity meters/sec to pixels
      
      // Horizontal Velocity Vector (Vx - Green)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ballPxX, ballPxY);
      ctx.lineTo(ballPxX + activePoint.vx * arrowScale, ballPxY);
      ctx.stroke();

      // Vertical Velocity Vector (Vy - Orange)
      ctx.strokeStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(ballPxX, ballPxY);
      ctx.lineTo(ballPxX, ballPxY - activePoint.vy * arrowScale); // Y up in physics is Y down in canvas
      ctx.stroke();

      // Net velocity Vector (Yellow)
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ballPxX, ballPxY);
      ctx.lineTo(ballPxX + activePoint.vx * arrowScale, ballPxY - activePoint.vy * arrowScale);
      ctx.stroke();
    }

  }, [trajectoryPoints, animTime, targetDist, isHit]);

  const handleLaunch = () => {
    setAnimTime(0);
    setIsAnimating(true);
  };

  const handleReset = () => {
    setIsAnimating(false);
    setAnimTime(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* 2D Canvas Renderer */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 flex flex-col items-center relative shadow-2xl">
        <h4 className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
          2D Vector Trajectory Graph
        </h4>

        {/* Trajectory Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="border border-gray-900 rounded-xl bg-gray-950 mt-8 w-full max-h-[300px]"
        />

        {/* Controls footer inside graph */}
        <div className="flex space-x-3 w-full mt-4 justify-center">
          <button
            onClick={handleLaunch}
            disabled={isAnimating}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Launch Projectile</span>
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-800 text-slate-350 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Path</span>
          </button>
        </div>
      </div>

      {/* Trajectory Slider settings */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white border-b border-gray-900 pb-2 uppercase tracking-widest font-mono flex justify-between items-center">
            <span>Simulation Parameters</span>
            {isHit && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/35 px-2 py-0.5 rounded font-black tracking-widest">
                🎯 HIIIT!
              </span>
            )}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Launch Angle */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Launch Angle (θ)</span>
                <span className="text-purple-400 font-bold">{angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={90}
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Launch Velocity */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Velocity (v0)</span>
                <span className="text-purple-400 font-bold">{velocity} m/s</span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                value={velocity}
                onChange={(e) => setVelocity(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Initial Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Launch Height (h0)</span>
                <span className="text-purple-400 font-bold">{initialHeight} m</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                value={initialHeight}
                onChange={(e) => setInitialHeight(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Air Resistance Drag */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Air Friction (k)</span>
                <span className="text-purple-400 font-bold">{drag.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={0.25}
                step={0.01}
                value={drag}
                onChange={(e) => setDrag(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Horizontal Wind */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Horizontal Wind</span>
                <span className={`font-bold ${wind !== 0 ? 'text-amber-500' : 'text-purple-400'}`}>
                  {wind > 0 ? `+${wind}` : wind} m/s²
                </span>
              </div>
              <input
                type="range"
                min={-5}
                max={5}
                step={0.5}
                value={wind}
                onChange={(e) => setWind(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Gravity */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">Gravity (g)</span>
                <span className="text-purple-400 font-bold">{gravity} m/s²</span>
              </div>
              <input
                type="range"
                min={1.62} // Moon
                max={20.0}
                step={0.1}
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

          </div>
        </div>

        {/* Target Practice Sandbox Control */}
        <div className="border-t border-gray-900 pt-4 space-y-3">
          <div className="flex justify-between items-center font-mono text-xs">
            <div className="flex items-center space-x-1.5">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-gray-400 font-bold">Target Distance</span>
            </div>
            <span className="text-purple-400 font-bold">{targetDist} m</span>
          </div>
          <input
            type="range"
            min={10}
            max={45}
            value={targetDist}
            onChange={(e) => setTargetDist(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />

          <div className="bg-gray-950 border border-gray-900 rounded-xl p-3 text-[10px] text-gray-500 leading-relaxed italic">
            💡 Green vector arrow represents horizontal velocity ($v_x$). Orange arrow represents vertical velocity ($v_y$). Notice how $v_x$ decays under air friction, whereas $v_y$ accelerates under gravity!
          </div>
        </div>

      </div>
    </div>
  );
}
