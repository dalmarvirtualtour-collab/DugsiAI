'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, RefreshCw, Sparkles, Lock, GraduationCap } from 'lucide-react';
import VirtualLabEngine from '@/components/labs/VirtualLabEngine';

interface PageProps {
  params: Promise<{
    grade: string;
    subject: string;
    labId: string;
  }>;
}

export default function LabWorkspacePage(props: PageProps) {
  const [params, setParams] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [labData, setLabData] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);

  // Unwrap params Promise and fetch details
  useEffect(() => {
    props.params.then(unwrapped => {
      setParams(unwrapped);
      fetchLabWorkspace(unwrapped);
    });
  }, []);

  const fetchLabWorkspace = async (unwrappedParams: any) => {
    setLoading(true);
    setErrorDetails(null);
    try {
      // 1. Fetch User details for validation
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (authData.success) {
        setUserProfile(authData.user);
      } else {
        throw new Error('Not logged in');
      }

      // 2. Fetch specific Lab Config
      const url = `/api/labs/${unwrappedParams.grade}/${unwrappedParams.subject}/${unwrappedParams.labId}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        setLabData(data.lab);
        setProgress(data.progress);
      } else {
        // Capture specific grade locking failures (403)
        setErrorDetails({
          status: res.status,
          message: data.error || 'Failed to load laboratory configuration.',
          studentGrade: data.studentGrade,
          targetGrade: data.targetGrade,
          locked: data.locked || false
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorDetails({
        status: 500,
        message: err.message || 'Check database seed connections.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-xs text-gray-400">Loading dynamic laboratory engines...</p>
        </div>
      </div>
    );
  }

  // Render Grade Locked error banner (403)
  if (errorDetails && errorDetails.status === 403 && errorDetails.locked) {
    return (
      <div className="min-h-screen bg-[#07070a] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-950 border border-rose-900/40 rounded-3xl p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
          {/* Decorative warning glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 to-amber-500" />
          
          <Lock className="h-12 w-12 text-rose-500 mx-auto animate-bounce mt-2" />
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-white">403: Grade-Locked Resource</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              DugsiAI enforces strict curriculum mapping. Access to Grade {errorDetails.targetGrade} labs is locked because you are currently registered in Grade {errorDetails.studentGrade}.
            </p>
          </div>

          <div className="bg-rose-950/15 border border-rose-900/25 p-3 rounded-xl text-[10px] text-rose-350 italic font-mono">
            Requires grade promotion or permission settings change.
          </div>

          <div className="flex space-x-3 pt-2">
            <Link 
              href="/labs" 
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-slate-350 text-xs font-bold py-2.5 rounded-xl border border-gray-800 transition-all text-center"
            >
              Back to Catalog
            </Link>
            <Link 
              href="/" 
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all text-center"
            >
              Change Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Generic connection error
  if (errorDetails) {
    return (
      <div className="min-h-screen bg-[#07070a] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-950 border border-gray-900 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto animate-pulse" />
          <h3 className="text-lg font-black text-white">Load Failure</h3>
          <p className="text-xs text-slate-400">
            {errorDetails.message || 'Unable to establish secure laboratory seed session.'}
          </p>
          <div className="flex space-x-3 pt-2">
            <Link href="/labs" className="flex-1 bg-gray-900 border border-gray-800 text-slate-350 text-xs font-bold py-2 rounded-xl transition-all">
              Labs Directory
            </Link>
            <button 
              onClick={() => fetchLabWorkspace(params)} 
              className="flex-1 bg-purple-600 text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans">
      
      {/* Top Header Navigation */}
      <header className="border-b border-gray-900 bg-gray-950/80 px-6 py-4 flex justify-between items-center z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <GraduationCap className="h-6 w-6 text-purple-500" />
          <h1 className="text-sm font-black tracking-tight text-white uppercase font-mono">
            DugsiAI Virtual Lab Workspace
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link href="/labs" className="text-xs bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Close Workspace</span>
          </Link>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        <VirtualLabEngine 
          labData={labData} 
          userProfile={userProfile} 
          initialProgress={progress} 
        />
      </div>

    </div>
  );
}
