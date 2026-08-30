'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ShieldAlert, Sparkles, ArrowLeft, Lock, CheckCircle2, ChevronRight, HelpCircle, Network } from 'lucide-react';

interface LabCatalogItem {
  labId: string;
  grade: number;
  subject: string;
  title: string;
  description: string;
  labType: string;
  enabled: boolean;
}

export default function VirtualLabsCatalogPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [labs, setLabs] = useState<LabCatalogItem[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>('physics'); // 'physics' | 'biology' | 'chemistry' | 'mathematics' | 'geography'
  const [error, setError] = useState<string>('');

  // 1. Fetch User details and Labs List
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (authData.success) {
          setUserProfile(authData.user);
        } else {
          throw new Error('Not logged in');
        }

        // Fetch labs list (we can call our seeded DB)
        // Since we want a robust list, we'll fetch elements
        // For fallback, we declare the standard catalog matching seed
        setLabs([
          {
            labId: 'grade7_physics_buoyancy',
            grade: 7,
            subject: 'physics',
            title: 'Archimedes\' Buoyancy Laboratory',
            description: 'Experiment with weights, fluid volumes, and density to understand buoyant forces.',
            labType: 'PHYSICS',
            enabled: true
          },
          {
            labId: 'grade10_biology_heart',
            grade: 10,
            subject: 'biology',
            title: '3D Human Heart Anatomical Simulator',
            description: 'Manipulate heart valves, control heartbeat speeds, and track blood circulation paths in 3D.',
            labType: 'BIOLOGY',
            enabled: true
          },
          {
            labId: 'grade10_chemistry_atom',
            grade: 10,
            subject: 'chemistry',
            title: 'Bohr Atomic Orbitals Workspace',
            description: 'Inspect protons, neutrons, and electron shells. Explore Bohr configurations in 3D.',
            labType: 'CHEMISTRY',
            enabled: true
          },
          {
            labId: 'grade10_mathematics_quadratic',
            grade: 10,
            subject: 'mathematics',
            title: 'Interactive Quadratic Graphs Workspace',
            description: 'Shift coefficients a, b, and c dynamically to map parabola vertex coordinates and roots.',
            labType: 'MATH',
            enabled: true
          },
          {
            labId: 'grade10_geography_topography',
            grade: 10,
            subject: 'geography',
            title: '3D Contour Elevation Sandbox',
            description: 'Plot topographic maps, adjust scales, and simulate crustal normal/reverse tectonic stresses.',
            labType: 'GEOGRAPHY',
            enabled: true
          }
        ]);
      } catch (err: any) {
        console.error(err);
        setError('Please log in to access the Virtual Lab Catalog.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-xs text-gray-400">Verifying grade credentials...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-[#07070a] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-950 border border-gray-900 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto animate-pulse" />
          <h3 className="text-lg font-black text-white">Authentication Required</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'You must be signed in with a student account to view authorized curriculum laboratory materials.'}
          </p>
          <Link href="/" className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const studentGrade = userProfile?.student?.grade || 7;

  // Filter labs by active subject
  const filteredLabs = labs.filter(l => l.subject === activeSubject);

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Header */}
      <header className="border-b border-gray-900 bg-gray-950/80 px-6 py-4 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-6 w-6 text-purple-500" />
          <h1 className="text-lg font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
            DugsiAI Virtual Laboratories
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-[10px] uppercase font-mono font-bold text-purple-400 bg-purple-950/30 border border-purple-900/40 px-2.5 py-1 rounded-xl">
            Enrolled: Grade {studentGrade} Student
          </span>
          <Link href="/reader" className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 shadow-md shadow-purple-900/20 cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Reader</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8 space-y-8 overflow-auto">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-900/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/30">
              Grade-Authorized Access Portal
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">Science & Math Sandbox Room</h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Launch interactive simulators aligned directly to your grade level textbook units. Run virtual experiments, gather computed telemetry, and query MacalinAI for Socratic tutoring.
            </p>
          </div>
        </div>

        {/* 5-subject sub-tabs */}
        <div className="border-b border-gray-900 pb-1.5 flex space-x-2 overflow-x-auto">
          {[
            { id: 'physics', label: 'Physics' },
            { id: 'biology', label: 'Biology' },
            { id: 'chemistry', label: 'Chemistry' },
            { id: 'mathematics', label: 'Mathematics' },
            { id: 'geography', label: 'Geography' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubject(tab.id)}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                activeSubject === tab.id 
                  ? 'bg-purple-900/30 border-purple-600 text-purple-300' 
                  : 'bg-transparent border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Labs Cards Grid */}
        {filteredLabs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLabs.map((lab) => {
              const isLocked = lab.grade > studentGrade;
              
              return (
                <div 
                  key={lab.labId}
                  className={`bg-[#0e0e13] border rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all shadow-xl ${
                    isLocked 
                      ? 'border-gray-950 opacity-60' 
                      : 'border-gray-900 hover:border-purple-900/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] uppercase font-mono font-bold text-gray-500">
                        Grade {lab.grade} • {lab.labType}
                      </span>
                      {isLocked && (
                        <span className="bg-rose-950/20 border border-rose-900/40 text-rose-400 text-[8px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-lg flex items-center space-x-1">
                          <Lock className="h-2.5 w-2.5" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-white">{lab.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{lab.description}</p>
                  </div>

                  {isLocked ? (
                    <div className="bg-rose-950/10 border border-rose-900/20 rounded-xl p-3 text-[10px] text-rose-350 italic">
                      Locked. You are registered in Grade {studentGrade}. Grade {lab.grade} materials require higher grade promotion.
                    </div>
                  ) : (
                    <Link
                      href={`/labs/grade${lab.grade}/${lab.subject}/${lab.labId}`}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-purple-900/20"
                    >
                      <span>Launch Experiment</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs bg-gray-950 border border-gray-900 rounded-3xl">
            No virtual labs created for this subject yet. Select another category.
          </div>
        )}

      </main>
    </div>
  );
}
