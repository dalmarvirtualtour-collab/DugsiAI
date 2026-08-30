'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Clock, Award, Sparkles, BookMarked, ShieldAlert, ArrowRight, MessageSquare
} from 'lucide-react';

interface SummaryStats {
  total_reading_duration_minutes: number;
  learning_streak_days: number;
  vocabulary_mastered_count: number;
  total_questions_answered: number;
  average_accuracy: number;
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

export default function ParentPortalPage() {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [alerts, setAlerts] = useState<DiagnosticAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/analytics/summary');
        const data = await res.json();
        if (data.success) {
          setStats(data.summary);
          setAlerts(data.diagnostic_alerts || []);
        }
      } catch (e) {
        console.error('Failed to load parent metrics:', e);
        // Fallback mockup profiles
        setStats({
          total_reading_duration_minutes: 85,
          learning_streak_days: 4,
          vocabulary_mastered_count: 8,
          total_questions_answered: 14,
          average_accuracy: 0.78
        });
        setAlerts([
          {
            type: "friction_alert",
            subject_id: "grade_10_biology",
            lesson_id: "photosynthesis",
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
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans">
      
      {/* Top Header Navigator */}
      <header className="border-b border-slate-900 bg-[#0b0b0f] px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-85">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-900 rounded-lg transition-colors group">
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-950 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-900/60 uppercase tracking-wider">
                Parent Portal
              </span>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                Abebe Kebede's Learning Journey
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grade 10 • Section A • DugsiAI Family Dashboard
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500 text-sm">Loading family dashboard metrics...</div>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            <div className="bg-[#0b0b11] border border-slate-900 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock className="w-24 h-24 text-slate-100" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Study Duration</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-bold text-slate-100">{stats?.total_reading_duration_minutes || 85}</span>
                <span className="text-xs text-slate-500 font-medium">minutes</span>
              </div>
              <p className="text-[11px] text-emerald-500 font-medium mt-2">Active learning online</p>
            </div>

            <div className="bg-[#0b0b11] border border-slate-900 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award className="w-24 h-24 text-slate-100" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Learning Streak</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-bold text-slate-100">{stats?.learning_streak_days || 4}</span>
                <span className="text-xs text-slate-500 font-medium">days</span>
              </div>
              <p className="text-[11px] text-emerald-500 font-medium mt-2">Consecutive study days</p>
            </div>

            <div className="bg-[#0b0b11] border border-slate-900 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BookMarked className="w-24 h-24 text-slate-100" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Vocab Count</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-bold text-slate-100">{stats?.vocabulary_mastered_count || 8}</span>
                <span className="text-xs text-slate-500 font-medium">words</span>
              </div>
              <p className="text-[11px] text-emerald-500 font-medium mt-2">Unique terms looked up</p>
            </div>

            <div className="bg-[#0b0b11] border border-slate-900 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-24 h-24 text-slate-100" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Quiz Accuracy</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-bold text-slate-100">{Math.round((stats?.average_accuracy || 0.78) * 100)}%</span>
              </div>
              <p className="text-[11px] text-indigo-500 font-medium mt-2">Average calibration score</p>
            </div>

          </div>

          {/* Interactive Graph & Advisories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Visual Growth Graphs Chart */}
            <div className="bg-[#0b0b11] border border-slate-900 rounded-xl p-6 lg:col-span-2 flex flex-col space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Daily Study Minutes Graph</h3>
                <p className="text-xs text-slate-500 mt-0.5">Abebe's daily reading progression over the current week</p>
              </div>

              {/* Pure SVG Bar/Line Chart */}
              <div className="relative flex-1 min-h-[220px] flex items-end justify-between px-2 pt-4">
                
                {/* Y-axis grid markers */}
                <div className="absolute left-0 top-0 bottom-0 right-0 flex flex-col justify-between pointer-events-none">
                  {[30, 20, 10, 0].map((val) => (
                    <div key={val} className="w-full flex items-center text-[10px] text-slate-700">
                      <span className="w-8 shrink-0">{val}m</span>
                      <div className="flex-1 border-t border-slate-900/60 border-dashed" />
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="flex-1 flex items-end justify-around pl-8 z-10">
                  {[
                    { day: 'Mon', mins: 15 },
                    { day: 'Tue', mins: 25 },
                    { day: 'Wed', mins: 10 },
                    { day: 'Thu', mins: 30 },
                    { day: 'Fri', mins: 20 },
                  ].map((d) => (
                    <div key={d.day} className="flex flex-col items-center group cursor-help">
                      <div className="text-[10px] text-indigo-400 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.mins}m
                      </div>
                      <div 
                        className="w-10 bg-gradient-to-t from-indigo-950 to-indigo-500 rounded-t border-t border-indigo-400/50 hover:to-indigo-400 transition-all duration-300"
                        style={{ height: `${(d.mins / 30) * 160}px` }}
                      />
                      <span className="text-[10px] text-slate-500 font-medium mt-2">{d.day}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Plain-Language Parent Advisories */}
            <div className="bg-[#0b0b11] border border-slate-900 rounded-xl p-6 flex flex-col space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">MacalinAI Family Advisory</h3>
                <p className="text-xs text-slate-500 mt-0.5">Plain-language diagnostic guidance for parents</p>
              </div>

              {alerts.length > 0 ? (
                alerts.map((a, i) => (
                  <div key={i} className="bg-[#0d0d15] border border-slate-900 rounded-lg p-5 flex flex-col space-y-4 flex-1 justify-between">
                    <div className="flex items-start space-x-3.5">
                      <ShieldAlert className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Concept Friction Warning</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-normal">
                          We noticed Abebe spent significantly longer than average (<strong>52.4 seconds</strong>) answering questions about <strong>Photosynthesis</strong>. 
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          He may be struggling to absorb the core concepts of chloroplasts and light reaction equations.
                        </p>
                      </div>
                    </div>

                    <Link 
                      href="/reader?grade=10&subject=biology&lesson=photosynthesis&page=8"
                      className="flex items-center justify-center space-x-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-900/60 hover:border-indigo-800 text-indigo-400 hover:text-indigo-300 text-xs font-semibold py-2.5 px-4 rounded-lg transition-all w-full cursor-pointer mt-auto"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Review Photosynthesis Lesson</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="bg-[#0d0d13] border border-slate-900 rounded-lg p-5 flex flex-col items-center justify-center text-center flex-1 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-800" />
                  <span className="text-xs font-medium text-slate-400">Abebe is studying perfectly!</span>
                  <p className="text-[11px] text-slate-600 max-w-[200px]">All lessons completed within normal response time thresholds.</p>
                </div>
              )}

            </div>

          </div>

        </main>
      )}

    </div>
  );
}
