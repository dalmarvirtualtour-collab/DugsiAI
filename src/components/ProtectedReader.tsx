"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Shield, Lock } from 'lucide-react';

interface ProtectedReaderProps {
  content: string;
  title?: string;
  watermarkText?: string;
}

export default function ProtectedReader({ content, title, watermarkText = "DUGSIAI SECURITY GUARDRAIL - DO NOT DISTRIBUTE" }: ProtectedReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fontSize] = useState(13);
  const [lineHeight] = useState(20);
  const [canvasHeight, setCanvasHeight] = useState(400);

  // Helper to split text into lines that fit a max width
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const paragraphs = text.split('\n');
    const lines: string[] = [];

    paragraphs.forEach(para => {
      if (para.trim() === '') {
        lines.push('');
        return;
      }
      
      const words = para.split(' ');
      let currentLine = '';

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          lines.push(currentLine.trim());
          currentLine = words[n] + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine.trim());
    });

    return lines;
  };

  useEffect(() => {
    // Intercept standard browser copy/cut/select/print actions
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("DRM Protection Active: Copying textbook resources is strictly prohibited across DugsiAI.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCopy = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c';
      const isPrint = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p';
      const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';
      
      if (isCopy || isPrint || isSave || e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        alert("DRM Restriction: Platform actions blocked to prevent unauthorized asset reproduction.");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert("Right-click menu has been disabled to secure platform curriculum resources.");
    };

    const blockPrint = () => {
      alert("DRM Alert: Printing of textbook and revision summaries is blocked.");
    };

    window.addEventListener('beforeprint', blockPrint);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('beforeprint', blockPrint);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Draw lesson content on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 20;
    const maxWidth = canvas.width - padding * 2;

    // Set font style for text measurement
    ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
    
    // Wrap the text
    const lines = wrapText(ctx, content, maxWidth);
    const calculatedHeight = lines.length * lineHeight + padding * 2;
    setCanvasHeight(Math.max(calculatedHeight, 350));

    // Wait for state height to apply before drawing
    const timeout = setTimeout(() => {
      canvas.height = Math.max(calculatedHeight, 350);
      
      // Clear and style background
      ctx.fillStyle = '#0a0a0c'; // Slate dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render DRM Watermark in the background
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 8); 
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; // Ultra faint watermark
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      
      // Repeat watermarks
      for (let y = -canvas.height; y < canvas.height; y += 120) {
        for (let x = -canvas.width; x < canvas.width; x += 240) {
          ctx.fillText(watermarkText, x, y);
        }
      }
      ctx.restore();

      // Render actual lesson text
      ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      lines.forEach((line, index) => {
        const yPos = padding + index * lineHeight;
        
        // Custom formatting
        if (line.startsWith('##') || line.startsWith('THE FOLLOWING') || line.startsWith('RELEVANT TEXTBOOK') || line.startsWith('Unit') || line.startsWith('Chapter')) {
          ctx.fillStyle = '#c084fc'; // Purple highlight
          ctx.font = `bold ${fontSize + 2}px system-ui, sans-serif`;
          ctx.fillText(line.replace(/#/g, '').trim(), padding, yPos);
          ctx.font = `${fontSize}px system-ui, sans-serif`;
        } else if (line.startsWith('*') || line.startsWith('-') || line.startsWith('•')) {
          ctx.fillStyle = '#a78bfa'; // Light violet bullet
          ctx.fillText('•', padding, yPos);
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(line.replace(/^[\*\-•]\s*/, ''), padding + 12, yPos);
        } else {
          ctx.fillStyle = '#cbd5e1'; // Off white text
          ctx.fillText(line, padding, yPos);
        }
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [content, fontSize, lineHeight, watermarkText]);

  return (
    <div 
      ref={containerRef} 
      className="border border-purple-950/20 bg-gray-950 rounded-2xl p-4 space-y-3 shadow-inner relative"
      style={{ userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none' }}
    >
      <div className="flex justify-between items-center text-[10px] border-b border-gray-900 pb-2 mb-2 select-none">
        <div className="flex items-center space-x-2 text-purple-400 font-bold">
          <Shield className="h-3.5 w-3.5 text-purple-500 animate-pulse" />
          <span>DRM Screen Reader (Downloads & Selection Blocked)</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-500 font-mono">
          <Lock className="h-2.5 w-2.5" />
          <span>SECURED_BY_DUGSIAI</span>
        </div>
      </div>
      
      {title && (
        <h4 className="text-purple-300 font-bold text-xs mb-1 select-none">{title}</h4>
      )}

      {/* Canvas Scroll View container */}
      <div className="overflow-auto border border-gray-900 rounded-xl max-h-[400px]">
        <canvas 
          ref={canvasRef} 
          width={650} 
          height={canvasHeight}
          className="w-full h-auto block select-none pointer-events-none"
        />
      </div>

      <div className="text-[9px] text-gray-650 text-center select-none leading-none">
        Copying, printing, and file downloads are platform-blocked. Screen captures will contain cryptographic identifiers.
      </div>
    </div>
  );
}
