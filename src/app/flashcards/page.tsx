'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, RefreshCw, ArrowLeft, Brain, Award, 
  CheckCircle2, XCircle, ChevronRight, Wifi, WifiOff, Layers, BookMarked
} from 'lucide-react';
import { useSync } from '@/context/SyncContext';

interface Flashcard {
  word: string;
  part_of_speech: string;
  context_sentence: string;
  translations: {
    en: string;
    am: string;
    so: string;
    om: string;
  };
  box: number;
  next_review: string;
}

export default function FlashcardsPage() {
  const { isOnline, saveOffline } = useSync();
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [reviewedCount, setReviewedCount] = useState<number>(0);
  const [sessionHistory, setSessionHistory] = useState<{ word: string; isCorrect: boolean; oldBox: number; newBox: number }[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Fetch flashcard deck from backend
  const fetchDeck = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/flashcards/deck?student_id=student_demo');
      if (!res.ok) {
        throw new Error(`Failed to load flashcard deck: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setDeck(data.deck);
      } else {
        throw new Error(data.error || 'Unknown error fetching deck.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load review deck.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
  }, []);

  // Show status feedback toasts
  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Submit flashcard review
  const handleReview = async (isCorrect: boolean) => {
    if (deck.length === 0 || currentIndex >= deck.length) return;

    const card = deck[currentIndex];
    const transactionId = crypto.randomUUID();
    const body = {
      student_id: 'student_demo',
      word: card.word,
      is_correct: isCorrect,
      transaction_id: transactionId
    };

    // Calculate simulated box progression locally for UI feedback
    const oldBox = card.box;
    const newBox = isCorrect ? Math.min(5, oldBox + 1) : 1;

    // Log in local session history
    setSessionHistory(prev => [...prev, { word: card.word, isCorrect, oldBox, newBox }]);
    setReviewedCount(prev => prev + 1);

    // Reset card state after short delay (wait for transition)
    setIsFlipped(false);
    
    // Animate to next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);

    try {
      if (!isOnline) {
        // Save to IndexedDB outbox
        await saveOffline('/api/flashcards/review', 'POST', body);
        triggerToast('Review saved locally (will sync when online)', 'info');
        return;
      }

      const res = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error('Server review submission failed.');
      }
      
      triggerToast(isCorrect ? 'Correct! Spaced repetition calibrated.' : 'Failed. Resetting to Box 1.', isCorrect ? 'success' : 'error');
    } catch (err) {
      console.warn('Network request failed, queueing offline:', err);
      // Fallback: save to outbox if network cuts out mid-flight
      await saveOffline('/api/flashcards/review', 'POST', body);
      triggerToast('Network offline. Review saved locally.', 'info');
    }
  };

  const currentCard = deck[currentIndex];
  const isDeckCompleted = deck.length === 0 || currentIndex >= deck.length;
  const progressPercent = deck.length > 0 ? Math.round((reviewedCount / (deck.length + reviewedCount - currentIndex)) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Decorative Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation Top Header */}
      <header className="border-b border-gray-950 bg-gray-950/80 px-6 py-4 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-500" />
          <h1 className="text-lg font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
            DugsiAI Leitner Spaced Repetition
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Online/Offline Status Indicator */}
          {isOnline ? (
            <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-3 py-1 rounded-full">
              <Wifi className="w-3.5 h-3.5 mr-1" />
              Online
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-950/30 border border-amber-900/40 px-3 py-1 rounded-full animate-pulse">
              <WifiOff className="w-3.5 h-3.5 mr-1" />
              Offline Mode
            </span>
          )}

          <Link href="/dashboard" className="text-xs bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1">
            <ArrowLeft className="h-3 w-3" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Review Screen */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col justify-center items-center relative z-10 space-y-6">
        
        {loading ? (
          <div className="flex flex-col items-center space-y-4 my-20">
            <RefreshCw className="h-10 w-10 text-purple-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading review deck...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-6 text-center space-y-4 max-w-sm">
            <XCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h3 className="font-extrabold text-white text-base">Deck Fetch Error</h3>
            <p className="text-slate-400 text-xs">{error}</p>
            <button 
              onClick={fetchDeck}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : isDeckCompleted ? (
          /* DECK COMPLETED STATE VIEW */
          <div className="w-full bg-[#0e0e13]/80 border border-gray-900 rounded-3xl p-6 sm:p-8 space-y-6 text-center backdrop-blur-md shadow-2xl shadow-black/80 animate-fade-in">
            <div className="relative inline-block">
              <Award className="h-20 w-20 text-amber-400 mx-auto animate-bounce" />
              <Sparkles className="h-6 w-6 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white sm:text-3xl">Deck Completed!</h2>
              <p className="text-slate-400 text-sm">
                You've cleared all vocabulary flashcards scheduled for review. Great job maintaining your learning streak!
              </p>
            </div>

            {/* Session Stats Breakdown */}
            {sessionHistory.length > 0 && (
              <div className="bg-gray-950/60 border border-gray-900/60 rounded-2xl p-4 text-left space-y-3">
                <h4 className="text-xs uppercase font-mono font-bold text-purple-400">Session Review Log</h4>
                <div className="max-h-36 overflow-y-auto divide-y divide-gray-900/60 pr-1 space-y-2">
                  {sessionHistory.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1.5 text-xs">
                      <div className="flex items-center space-x-2">
                        {item.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-extrabold text-white font-mono">{item.word}</span>
                      </div>
                      <div className="flex items-center space-x-2 font-mono text-[10px] text-gray-500">
                        <span>Box {item.oldBox}</span>
                        <ChevronRight className="h-3 w-3 text-gray-700" />
                        <span className={item.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          Box {item.newBox}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Link href="/reader" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-purple-900/20 text-center cursor-pointer">
                Return to Reader
              </Link>
              <button 
                onClick={() => {
                  setReviewedCount(0);
                  setSessionHistory([]);
                  fetchDeck();
                }}
                className="bg-gray-900 border border-gray-800 text-gray-300 hover:text-white font-bold text-sm py-3 rounded-xl transition-colors cursor-pointer"
              >
                Practice Again
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE REVIEW CARD VIEW */
          <div className="w-full flex flex-col items-center space-y-6">
            
            {/* Session Progress Status Bar */}
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                <span>CARD {currentIndex + 1} OF {deck.length}</span>
                <span>{progressPercent}% COMPLETE</span>
              </div>
              <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-900/60">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-md shadow-purple-500/25"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Leitner Box Level Badge */}
            <div className="flex items-center space-x-1.5 bg-purple-950/30 border border-purple-900/30 text-purple-400 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono">
              <Layers className="h-3.5 w-3.5" />
              <span>LEITNER GROUP BOX {currentCard.box}</span>
            </div>

            {/* 3D Animated Card Box */}
            <div 
              className="w-full max-w-md h-[360px] cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ perspective: '1000px' }}
            >
              <div 
                className="relative w-full h-full text-center transition-transform duration-700 rounded-3xl"
                style={{ 
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                
                {/* FRONT OF THE CARD */}
                <div 
                  className="absolute w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center border border-gray-900 bg-gradient-to-br from-[#0e0e13] to-[#07070a] shadow-2xl backdrop-blur-md overflow-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="w-full flex justify-between items-center text-[10px] text-gray-500 font-mono tracking-widest">
                    <span>VOCABULARY TERM</span>
                    <span className="bg-purple-950/40 text-purple-400 px-2 py-0.5 rounded border border-purple-900/30 uppercase">
                      {currentCard.part_of_speech}
                    </span>
                  </div>

                  <div className="space-y-2 flex flex-col justify-center items-center">
                    <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-white select-none">
                      {currentCard.word}
                    </h3>
                    <span className="text-xs text-purple-400 animate-pulse select-none">
                      (Click card to flip and view translations)
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 font-mono uppercase tracking-wider flex items-center space-x-1.5">
                    <BookMarked className="w-3.5 h-3.5 text-gray-600" />
                    <span>DugsiAI Cognitive Deck</span>
                  </div>
                </div>

                {/* BACK OF THE CARD */}
                <div 
                  className="absolute w-full h-full rounded-3xl p-5 sm:p-6 flex flex-col justify-between items-stretch border border-purple-900/30 bg-[#0c0c12]/95 shadow-2xl backdrop-blur-md overflow-y-auto"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)' 
                  }}
                >
                  <div className="flex justify-between items-center text-[9px] text-purple-400 font-mono tracking-wider pb-2 border-b border-gray-900/60">
                    <span>TRANSLATION GLOSSARY</span>
                    <span>4 LANGUAGES</span>
                  </div>

                  {/* Multi-language Translation Grid */}
                  <div className="flex-1 my-3 flex flex-col justify-center space-y-3.5 text-left">
                    
                    {/* English */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">English</span>
                      <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                        {currentCard.translations.en}
                      </p>
                    </div>

                    {/* Amharic */}
                    <div className="space-y-0.5 border-t border-gray-900/40 pt-2">
                      <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">Amharic (አማርኛ)</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                        {currentCard.translations.am || "አልተገኘም (No Translation)"}
                      </p>
                    </div>

                    {/* Somali */}
                    <div className="space-y-0.5 border-t border-gray-900/40 pt-2">
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest font-mono">Somali (Af Soomaali)</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                        {currentCard.translations.so || "Lama heli karo"}
                      </p>
                    </div>

                    {/* Oromo */}
                    <div className="space-y-0.5 border-t border-gray-900/40 pt-2">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Oromo (Afaan Oromoo)</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                        {currentCard.translations.om || "Hin argamne"}
                      </p>
                    </div>

                  </div>

                  {/* Sentence context fallback */}
                  {currentCard.context_sentence && (
                    <div className="border-t border-gray-900/60 pt-2.5 text-left">
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest font-mono">Textbook Context</span>
                      <p className="text-[10px] text-slate-400 italic mt-0.5 leading-relaxed">
                        "{currentCard.context_sentence}"
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Answer Response Interactive Actions */}
            <div className="grid grid-cols-2 gap-5 w-full max-w-md pt-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReview(false);
                }}
                className="bg-rose-950/20 border border-rose-900/35 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-extrabold text-sm py-3.5 px-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/10 active:scale-95 animate-pulse"
              >
                <XCircle className="w-5 h-5" />
                <span>Forgot It</span>
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReview(true);
                }}
                className="bg-emerald-950/20 border border-emerald-900/35 hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 font-extrabold text-sm py-3.5 px-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/10 active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>I Knew It</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Floating Idempotency Toast Indicators */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border transition-all ${
          toastMessage.type === 'success' ? 'bg-emerald-950 border-emerald-900/50 text-emerald-300' :
          toastMessage.type === 'error' ? 'bg-rose-950 border-rose-900/50 text-rose-300' :
          'bg-gray-900 border-gray-800 text-gray-300'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toastMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

    </div>
  );
}
