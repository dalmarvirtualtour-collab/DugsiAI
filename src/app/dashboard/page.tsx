'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Clock, Award, Sparkles, AlertTriangle, ArrowLeft, RefreshCw, ChevronRight, BookMarked, Brain
} from 'lucide-react';


interface SummaryStats {
  total_reading_duration_minutes: number;
  learning_streak_days: number;
  vocabulary_mastered_count: number;
  total_questions_answered: number;
  average_accuracy: number;
}

interface SubjectMastery {
  subject_id: string;
  avg_mastery: number;
  concepts_count: number;
}

interface DiagnosticAlert {
  type: string;
  subject_id: string;
  lesson_id: string;
  concept_tag: string;
  page_number: string;
  reason: string;
  priority: string;
  suggested_action: string;
}

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [subjects, setSubjects] = useState<SubjectMastery[]>([]);
  const [alerts, setAlerts] = useState<DiagnosticAlert[]>([]);
  const [error, setError] = useState<string>('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics/summary');
      if (!res.ok) {
        throw new Error(`Failed to fetch student analytics dashboard: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.summary);
        setSubjects(data.subject_mastery);
        setAlerts(data.diagnostic_alerts);
      } else {
        throw new Error(data.error || 'Unknown error occurred while fetching dashboard summary.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load analytics.');
      // Load fallback static mockup values if API or proxy fails
      setStats({
        total_reading_duration_minutes: 120,
        learning_streak_days: 3,
        vocabulary_mastered_count: 5,
        total_questions_answered: 12,
        average_accuracy: 0.75
      });
      setSubjects([
        { subject_id: "grade_10_biology", avg_mastery: 0.65, concepts_count: 4 },
        { subject_id: "grade_10_chemistry", avg_mastery: 0.40, concepts_count: 2 }
      ]);
      setAlerts([
        {
          type: "friction_alert",
          subject_id: "grade_10_biology",
          lesson_id: "general",
          concept_tag: "photosynthesis",
          page_number: "8",
          reason: "High response time (Recorded: 52.4s). Shows potential friction with this concept.",
          priority: "high",
          suggested_action: "Review Lesson Page"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatSubjectName = (id: string) => {
    return id.replace(/grade_(\d+)_/, 'Grade $1 ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans">
      
      {/* Dashboard Top Header Navigator */}
      <header className="border-b border-gray-900 bg-gray-950/80 px-6 py-4 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-6 w-6 text-purple-500" />
          <h1 className="text-lg font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
            DugsiAI Student Analytics
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchDashboardData}
            className="text-xs bg-gray-900 border border-gray-800 text-gray-400 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/flashcards" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 shadow-md shadow-indigo-900/20 cursor-pointer">
            <Brain className="h-3.5 w-3.5" />
            <span>Review Flashcards</span>
          </Link>
          <Link href="/reader" className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 shadow-md shadow-purple-900/20 cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Reader</span>
          </Link>
        </div>
      </header>

      {/* Main Layout Workspace Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8 space-y-8 overflow-auto">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-900/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
            <Award className="h-36 w-36 text-purple-500" />
          </div>
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/30">
              Diagnostic Insights Dashboard
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">Hello, Student!</h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Track your reading time, vocabulary accumulation, and conceptual mastery calibrated across Bloom's Taxonomy. Let's optimize your weak areas!
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-amber-950/15 border border-amber-900/30 text-amber-200 text-xs p-4 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Note: {error} Displaying cached static mockup statistics.</span>
          </div>
        )}

        {/* 1. Core Metrics Grid Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Minutes Metric */}
          <div className="bg-[#0e0e13] border border-gray-900 rounded-2xl p-6 flex items-center space-x-4 shadow-xl hover:border-purple-900/20 transition-all">
            <div className="bg-purple-950/40 border border-purple-900/30 p-3.5 rounded-xl">
              <Clock className="h-6 w-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-gray-500 font-bold font-mono">Weekly Study Time</span>
              <h3 className="text-2xl font-black text-white mt-1">
                {loading ? "..." : `${stats?.total_reading_duration_minutes} min`}
              </h3>
            </div>
          </div>

          {/* Streak Metric */}
          <div className="bg-[#0e0e13] border border-gray-900 rounded-2xl p-6 flex items-center space-x-4 shadow-xl hover:border-purple-900/20 transition-all">
            <div className="bg-indigo-950/40 border border-indigo-900/30 p-3.5 rounded-xl">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-gray-500 font-bold font-mono">Study Streak</span>
              <h3 className="text-2xl font-black text-white mt-1">
                {loading ? "..." : `${stats?.learning_streak_days} days 🔥`}
              </h3>
            </div>
          </div>

          {/* Vocab Metric */}
          <Link href="/flashcards" className="bg-[#0e0e13] border border-gray-900 rounded-2xl p-6 flex items-center space-x-4 shadow-xl hover:border-purple-600/30 hover:bg-purple-950/5 hover:-translate-y-0.5 transition-all cursor-pointer group">
            <div className="bg-purple-950/40 border border-purple-900/30 p-3.5 rounded-xl group-hover:bg-purple-900/40 transition-colors">
              <BookMarked className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] uppercase text-gray-500 font-bold font-mono">Vocab Mastered</span>
              <h3 className="text-2xl font-black text-white mt-1">
                {loading ? "..." : `${stats?.vocabulary_mastered_count} terms 📖`}
              </h3>
              <span className="text-[9px] text-purple-400 font-bold tracking-tight block mt-1 hover:underline">
                Review Flashcards &rarr;
              </span>
            </div>
          </Link>


        </div>

        {/* 2. Split progress bars & Diagnostic Alerts row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Subject Progress list column */}
          <div className="md:col-span-3 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-900">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-400 font-mono flex items-center space-x-1.5">
                <span>Subject Concept Mastery</span>
              </h3>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(n => (
                  <div key={n} className="h-20 bg-[#0e0e13] rounded-xl border border-gray-900 animate-pulse" />
                ))}
              </div>
            ) : subjects.length > 0 ? (
              <div className="space-y-5">
                {subjects.map(sub => {
                  const pct = Math.round(sub.avg_mastery * 100);
                  
                  return (
                    <div key={sub.subject_id} className="bg-[#0e0e13] border border-gray-900 rounded-2xl p-5 space-y-3.5 shadow-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-white text-sm">
                            {formatSubjectName(sub.subject_id)}
                          </h4>
                          <span className="text-[9px] text-gray-500 font-mono">
                            {sub.concepts_count} active concepts tracked
                          </span>
                        </div>
                        <span className="text-xs font-bold text-purple-400 font-mono">{pct}%</span>
                      </div>
                      
                      {/* Custom progress bar */}
                      <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-900">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-md shadow-purple-500/25"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-gray-500">
                No active subjects with calibration scores recorded.
              </div>
            )}
          </div>

          {/* Diagnostic Alerts column */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-900">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-400 font-mono">
                Diagnostic Alerts
              </h3>
            </div>

            {loading ? (
              <div className="h-40 bg-[#0e0e13] rounded-xl border border-gray-900 animate-pulse" />
            ) : alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="bg-rose-950/10 border border-rose-900/35 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-start space-x-2.5">
                      <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest font-mono">
                          Conceptual Friction Detected
                        </span>
                        <h4 className="font-extrabold text-white text-xs">
                          {formatSubjectName(alert.subject_id)} • {alert.concept_tag.toUpperCase()}
                        </h4>
                        <p className="text-[11px] text-slate-350 leading-relaxed italic">
                          "{alert.reason}"
                        </p>
                      </div>
                    </div>

                    {/* Review Lesson deep link */}
                    <Link 
                      href={`/reader?grade=${alert.subject_id.split('_')[1]}&subject=${alert.subject_id.split('_')[2] || 'biology'}&chapter=general&lesson=${alert.lesson_id}&page=${alert.page_number}`}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold py-2 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center space-x-1"
                    >
                      <span>Review Lesson Page {alert.page_number}</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-gray-500 bg-[#0e0e13] border border-gray-900 rounded-2xl">
                No diagnostic friction flags triggered. Awesome job studying!
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
