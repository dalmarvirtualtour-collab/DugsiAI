'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, RefreshCw, AlertTriangle, Users, BookOpen, Clock, Activity, ArrowRight, X, ChevronUp, ChevronDown
} from 'lucide-react';

interface StudentConceptScore {
  subject_id: string;
  concept_tag: string;
  mastery_score: number;
}

interface StudentSummary {
  uid: string;
  name: string;
  average_mastery: number;
  total_reading_minutes: number;
  alerts_count: number;
  accuracy: number;
  concept_scores: StudentConceptScore[];
}

interface ClassBottleneck {
  concept_tag: string;
  subject: string;
  grade: string;
  chapter: string;
  struggling_students_count: number;
  struggling_percentage: number;
  reason: string;
}

export default function TeacherPortalPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [className, setClassName] = useState<string>('Grade 10 - Section A');
  const [rosterCount, setRosterCount] = useState<number>(3);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [bottlenecks, setBottlenecks] = useState<ClassBottleneck[]>([]);
  const [error, setError] = useState<string>('');
  
  // Sorting states
  const [sortField, setSortField] = useState<'name' | 'average_mastery' | 'total_reading_minutes' | 'alerts_count'>('average_mastery');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  
  // Overlay Student modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);

  const fetchClassData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics/class/grade_10_section_a');
      if (!res.ok) {
        throw new Error(`Failed to fetch class portal data: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setClassName(data.class_name);
        setRosterCount(data.roster_count);
        setStudents(data.students || []);
        setBottlenecks(data.bottlenecks || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load class analytics.');
      // Offline fallback mock data
      setClassName("Grade 10 - Section A");
      setRosterCount(3);
      setStudents([
        {
          uid: "student_demo",
          name: "Abebe Kebede",
          average_mastery: 0.68,
          total_reading_minutes: 20,
          alerts_count: 1,
          accuracy: 0.82,
          concept_scores: [
            { subject_id: "grade_10_biology", concept_tag: "cell_division", mastery_score: 0.2 },
            { subject_id: "grade_10_biology", concept_tag: "photosynthesis", mastery_score: 0.4 },
            { subject_id: "grade_10_physics", concept_tag: "gravitational_force", mastery_score: 0.8 }
          ]
        },
        {
          uid: "student_user_1",
          name: "Fatuma Mohammed",
          average_mastery: 0.45,
          total_reading_minutes: 25,
          alerts_count: 2,
          accuracy: 0.64,
          concept_scores: [
            { subject_id: "grade_10_biology", concept_tag: "cell_division", mastery_score: 0.1 },
            { subject_id: "grade_10_biology", concept_tag: "photosynthesis", mastery_score: 0.3 },
            { subject_id: "grade_10_physics", concept_tag: "gravitational_force", mastery_score: 0.2 }
          ]
        },
        {
          uid: "student_user_2",
          name: "Yonas Selamu",
          average_mastery: 0.76,
          total_reading_minutes: 18,
          alerts_count: 0,
          accuracy: 0.85,
          concept_scores: [
            { subject_id: "grade_10_biology", concept_tag: "cell_division", mastery_score: 0.8 },
            { subject_id: "grade_10_biology", concept_tag: "photosynthesis", mastery_score: 0.9 },
            { subject_id: "grade_10_physics", concept_tag: "gravitational_force", mastery_score: 0.5 }
          ]
        }
      ]);
      setBottlenecks([
        {
          concept_tag: "cell_division",
          subject: "biology",
          grade: "Grade 10",
          chapter: "Chapter 1.1",
          struggling_students_count: 2,
          struggling_percentage: 66,
          reason: "Class-wide cell division scores are below 0.5 threshold."
        },
        {
          concept_tag: "gravitational_force",
          subject: "physics",
          grade: "Grade 9",
          chapter: "Chapter 2.1",
          struggling_students_count: 1,
          struggling_percentage: 33,
          reason: "Class average response time exceeds 45s threshold."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, []);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
    }
    return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp className="w-3.5 h-3.5 ml-1 inline" /> : <ChevronDown className="w-3.5 h-3.5 ml-1 inline" />;
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-[#0b0b0f] px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-85">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-900 rounded-lg transition-colors group">
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-950 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-indigo-900/60 uppercase tracking-wider">
                Teacher Console
              </span>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                {className} Dashboard
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Classroom Cockpit • Realtime Bottleneck Calibration
            </p>
          </div>
        </div>
        <button 
          onClick={fetchClassData}
          className="flex items-center space-x-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 px-3.5 py-2 rounded-lg transition-colors border border-slate-800/80"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Classroom</span>
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500 text-sm">Aggregating classroom ledger stats...</div>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            <div className="bg-[#0b0b11] border border-slate-900 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-24 h-24 text-slate-100" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Class Size</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-bold text-slate-100">{rosterCount}</span>
                <span className="text-xs text-slate-500 font-medium">students</span>
              </div>
              <p className="text-[11px] text-emerald-500 font-medium mt-2">Active roster profiles</p>
            </div>

            <div className="bg-[#0b0b11] border border-slate-900 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-24 h-24 text-slate-100" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Average Mastery</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-bold text-slate-100">
                  {Math.round((students.reduce((acc, s) => acc + s.average_mastery, 0) / students.length) * 100)}%
                </span>
              </div>
              <p className="text-[11px] text-emerald-500 font-medium mt-2">Class curriculum average</p>
            </div>

            <div className="bg-[#0b0b11] border border-slate-900 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock className="w-24 h-24 text-slate-100" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Study Duration</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-bold text-slate-100">
                  {students.reduce((acc, s) => acc + s.total_reading_minutes, 0)}
                </span>
                <span className="text-xs text-slate-500 font-medium">minutes</span>
              </div>
              <p className="text-[11px] text-indigo-500 font-medium mt-2">Class cumulative study time</p>
            </div>

            <div className="bg-[#0b0b11] border border-slate-900 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <AlertTriangle className="w-24 h-24 text-slate-100" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Cognitive Alerts</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-bold text-rose-500">
                  {students.reduce((acc, s) => acc + s.alerts_count, 0)}
                </span>
                <span className="text-xs text-slate-500 font-medium">anomalies</span>
              </div>
              <p className="text-[11px] text-rose-500 font-medium mt-2">Active friction alarms</p>
            </div>

          </div>

          {/* Concept Bottleneck area */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Classroom Bottlenecks (Focus Required)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bottlenecks.map((b, i) => (
                <div key={i} className="bg-[#120c0e] border border-rose-950/20 rounded-xl p-5 space-y-3 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded font-bold uppercase">
                        {b.subject} • {b.grade}
                      </span>
                      <h4 className="text-base font-bold text-slate-200 mt-1.5">
                        Concept Bottleneck: {b.concept_tag.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-rose-500">{b.struggling_percentage}%</span>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Struggling</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {b.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Roster Interactive Table */}
          <div className="bg-[#0b0b11] border border-slate-900 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-900">
              <h3 className="text-sm font-semibold text-slate-200">Classroom Roster Analytics</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sort by key parameters and click rows to trace individual concept graphs</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-950/50 text-xs font-semibold text-slate-400">
                    <th 
                      onClick={() => handleSort('name')}
                      className="p-4 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      Student Name {getSortIcon('name')}
                    </th>
                    <th 
                      onClick={() => handleSort('average_mastery')}
                      className="p-4 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      Average Mastery {getSortIcon('average_mastery')}
                    </th>
                    <th 
                      onClick={() => handleSort('total_reading_minutes')}
                      className="p-4 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      Time Spent {getSortIcon('total_reading_minutes')}
                    </th>
                    <th 
                      onClick={() => handleSort('alerts_count')}
                      className="p-4 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      Alerts Status {getSortIcon('alerts_count')}
                    </th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((s) => (
                    <tr 
                      key={s.uid}
                      onClick={() => setSelectedStudent(s)}
                      className="border-b border-slate-900 hover:bg-slate-900/40 cursor-pointer transition-colors text-sm"
                    >
                      <td className="p-4 font-semibold text-slate-200">{s.name}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className={`h-full rounded-full ${s.average_mastery < 0.5 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${s.average_mastery * 100}%` }}
                            />
                          </div>
                          <span className="font-medium text-slate-300">{Math.round(s.average_mastery * 100)}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-medium">{s.total_reading_minutes} mins</td>
                      <td className="p-4">
                        {s.alerts_count > 0 ? (
                          <span className="bg-rose-950/60 border border-rose-900/40 text-rose-400 px-2 py-0.5 rounded text-xs font-semibold">
                            {s.alerts_count} active alerts
                          </span>
                        ) : (
                          <span className="bg-emerald-950/60 border border-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded text-xs font-semibold">
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-bold text-xs bg-indigo-950/30 hover:bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-900/30 transition-all">
                          <span>Graph Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </main>
      )}

      {/* Roster student detail modal overlay */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#0b0b11] border border-slate-900 rounded-xl w-full max-w-lg overflow-hidden relative shadow-2xl shadow-black">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-900 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-100">{selectedStudent.name}'s Concept Anomalies</h4>
                <p className="text-xs text-slate-500 mt-0.5">Trace permanent concept mastery scores</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[400px] overflow-y-auto">
              {selectedStudent.concept_scores.length > 0 ? (
                selectedStudent.concept_scores.map((cs, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>{cs.concept_tag.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                      <span className={cs.mastery_score < 0.5 ? 'text-rose-400' : 'text-emerald-400'}>
                        {Math.round(cs.mastery_score * 100)}% Mastery
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full ${cs.mastery_score < 0.5 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${cs.mastery_score * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No concept scores recorded in SQLite mastery ledger yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-900 bg-slate-950/20 flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-4.5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
