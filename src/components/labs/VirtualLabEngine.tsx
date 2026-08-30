import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, RefreshCw, X, ChevronRight, CheckCircle2, XCircle, Award, BookOpen, HelpCircle } from 'lucide-react';
import PhysicsBuoyancyLab from './PhysicsBuoyancyLab';
import BiologyHeartLab from './BiologyHeartLab';
import ChemistryAtomLab from './ChemistryAtomLab';
import MathQuadraticLab from './MathQuadraticLab';
import GeographyTopographyLab from './GeographyTopographyLab';
import CircuitBreadboardLab from './CircuitBreadboardLab';
import MitosisDivisionLab from './MitosisDivisionLab';
import StoichiometryLab from './StoichiometryLab';
import ProjectileMotionLab from './ProjectileMotionLab';
import GeneticsPunnettLab from './GeneticsPunnettLab';
import GalvanicCellLab from './GalvanicCellLab';
import CalculusVisualizerLab from './CalculusVisualizerLab';

interface VirtualLabEngineProps {
  labData: any;
  userProfile: any;
  initialProgress: any;
}

export default function VirtualLabEngine({ labData, userProfile, initialProgress }: VirtualLabEngineProps) {
  // Simulator state tracking
  const [liveParams, setLiveParams] = useState<any>({});
  
  // Collapsible Tutor Sidebar
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(true);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: `Hello ${userProfile?.name || 'Student'}! I am MacalinAI, your study companion. I see you are investigating the "${labData.title}" experiment. How can I help you understand this concept today?` }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Lab Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  
  // Progress State
  const [savingProgress, setSavingProgress] = useState<boolean>(false);
  const [progressLogged, setProgressLogged] = useState<any>(initialProgress || null);
  const startTime = useRef<number>(Date.now());

  // Function to switch canvas components
  const renderSimulationCanvas = () => {
    switch (labData.labId) {
      case 'grade7_physics_buoyancy':
        return <PhysicsBuoyancyLab onUpdateState={setLiveParams} />;
      case 'grade9_physics_circuit':
        return <CircuitBreadboardLab onUpdateState={setLiveParams} />;
      case 'grade12_physics_projectile':
        return <ProjectileMotionLab onUpdateState={setLiveParams} />;
      case 'grade10_biology_heart':
        return <BiologyHeartLab onUpdateState={setLiveParams} />;
      case 'grade9_biology_mitosis':
        return <MitosisDivisionLab onUpdateState={setLiveParams} />;
      case 'grade11_biology_genetics':
        return <GeneticsPunnettLab onUpdateState={setLiveParams} />;
      case 'grade10_chemistry_atom':
        return <ChemistryAtomLab onUpdateState={setLiveParams} />;
      case 'grade10_chemistry_stoichiometry':
        return <StoichiometryLab onUpdateState={setLiveParams} />;
      case 'grade12_chemistry_galvanic':
        return <GalvanicCellLab onUpdateState={setLiveParams} />;
      case 'grade10_mathematics_quadratic':
        return <MathQuadraticLab onUpdateState={setLiveParams} />;
      case 'grade12_mathematics_calculus':
        return <CalculusVisualizerLab onUpdateState={setLiveParams} />;
      case 'grade10_geography_topography':
        return <GeographyTopographyLab onUpdateState={setLiveParams} />;
      default:
        // Fallback switches by type
        if (labData.labType === 'PHYSICS') return <PhysicsBuoyancyLab onUpdateState={setLiveParams} />;
        if (labData.labType === 'BIOLOGY') return <BiologyHeartLab onUpdateState={setLiveParams} />;
        if (labData.labType === 'CHEMISTRY') return <ChemistryAtomLab onUpdateState={setLiveParams} />;
        if (labData.labType === 'MATH') return <MathQuadraticLab onUpdateState={setLiveParams} />;
        if (labData.labType === 'GEOGRAPHY') return <GeographyTopographyLab onUpdateState={setLiveParams} />;
        return <div className="text-center py-10 text-xs text-gray-550">Canvas not supported</div>;
    }
  };

  // Submit AI Tutor Socratic Question
  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/labs/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labId: labData.labId,
          title: labData.title,
          subject: labData.subject,
          grade: labData.grade,
          liveParameters: liveParams,
          message: userMessage,
          history: chatMessages.slice(-8) // Send recent message history
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setChatMessages(prev => [...prev, { role: 'model', text: data.response }]);
      } else {
        throw new Error(data.error || 'Failed to connect to MacalinAI');
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: `Sorry, I encountered an issue: ${err.message || 'Offline mode limit reached'}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Submit Quiz Answers & Save Progress to DB
  const handleQuizSubmit = async () => {
    if (quizSubmitted) return;
    
    let correctCount = 0;
    const questions = labData.questions;
    
    questions.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    setQuizScore(scorePercentage);
    setQuizSubmitted(true);

    // Save student lab progress
    setSavingProgress(true);
    const duration = Math.round((Date.now() - startTime.current) / 1000);

    try {
      const res = await fetch('/api/labs/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labId: labData.labId,
          completed: true,
          score: scorePercentage,
          timeSpent: duration,
          experimentResults: liveParams
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProgressLogged(data.progress);
      }
    } catch (err) {
      console.error('Failed to log lab progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Clear Quiz state to re-attempt
  const resetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      
      {/* Left Workspace: Canvas, Equations, Results, Quiz */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        
        {/* Lab Header banner */}
        <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-900/10 rounded-2xl p-5 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-[9px] uppercase font-mono font-bold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/30">
                  Grade {labData.grade} • {labData.subject.toUpperCase()} LAB
                </span>
                {progressLogged?.completedAt && (
                  <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30 flex items-center space-x-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Completed</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{labData.title}</h2>
              <p className="text-slate-400 text-xs max-w-xl">{labData.description}</p>
            </div>

            {/* Learning Objectives box */}
            <div className="bg-gray-950/60 border border-gray-900 rounded-xl p-3 max-w-sm space-y-1 text-slate-350 text-[11px]">
              <span className="text-[8px] uppercase tracking-wider text-purple-400 font-bold block">Learning Objectives</span>
              <ul className="list-disc list-inside space-y-0.5">
                {labData.learningObjectives.map((obj: string, idx: number) => (
                  <li key={idx} className="truncate">{obj}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Dynamic Simulation canvas */}
        <div className="bg-[#0e0e13] border border-gray-900 rounded-3xl overflow-hidden p-2">
          {renderSimulationCanvas()}
        </div>

        {/* Bottom split: Results/Equations & Quiz */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Scientific Equations & Measurements Panel */}
          <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 space-y-5">
            <div className="flex items-center space-x-2 border-b border-gray-900 pb-2">
              <BookOpen className="h-4.5 w-4.5 text-purple-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white font-mono">
                Measurements & Formulations
              </h3>
            </div>

            {/* Equations list */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-widest text-purple-400 font-bold font-mono">Active Formulations</span>
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-3 text-xs space-y-1 font-mono text-slate-300">
                {Object.entries(labData.equations || {}).map(([key, val]: any) => (
                  <div key={key} className="flex justify-between border-b border-gray-900/50 py-1 last:border-b-0">
                    <span className="text-gray-500 font-bold">{key}</span>
                    <span className="text-purple-300 font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time values list */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-widest text-purple-400 font-bold font-mono">Telemetry Values</span>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(liveParams).map(([key, val]: any) => (
                  <div key={key} className="bg-gray-950 border border-gray-900 rounded-xl p-3 text-xs font-mono">
                    <span className="text-gray-500 font-bold text-[9px] uppercase block">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white font-extrabold text-sm mt-1 block truncate">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assessment Quiz Panel */}
          <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-4.5 w-4.5 text-purple-500" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white font-mono">
                    Conceptual Assessment
                  </h3>
                </div>
                {quizSubmitted && (
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border ${
                    quizScore >= 70 
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
                      : 'bg-rose-950/20 border-rose-900/40 text-rose-400'
                  }`}>
                    SCORE: {quizScore}%
                  </span>
                )}
              </div>

              {/* Questions Loop */}
              <div className="space-y-5 pt-3 overflow-auto max-h-[220px] pr-1.5">
                {labData.questions.map((q: any, qIdx: number) => {
                  const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
                  return (
                    <div key={q.id} className="space-y-2">
                      <h4 className="text-xs font-extrabold text-white">
                        {qIdx + 1}. {q.question}
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-1.5">
                        {q.options.map((opt: string) => {
                          const isSelected = selectedAnswers[q.id] === opt;
                          const showCorrect = quizSubmitted && opt === q.correctAnswer;
                          const showIncorrect = quizSubmitted && isSelected && !isCorrect;
                          
                          let btnStyle = 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white';
                          if (isSelected) btnStyle = 'bg-purple-900/20 border-purple-600 text-purple-300';
                          if (showCorrect) btnStyle = 'bg-emerald-950/30 border-emerald-600 text-emerald-400';
                          if (showIncorrect) btnStyle = 'bg-rose-950/30 border-rose-600 text-rose-400';

                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                if (quizSubmitted) return;
                                setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }));
                              }}
                              disabled={quizSubmitted}
                              className={`text-[11px] font-medium border text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box after submission */}
                      {quizSubmitted && (
                        <div className={`p-3 rounded-xl border text-[10px] leading-relaxed italic ${
                          isCorrect ? 'bg-emerald-950/5 border-emerald-900/20 text-slate-400' : 'bg-rose-950/5 border-rose-900/20 text-slate-400'
                        }`}>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quiz submit controls */}
            <div className="border-t border-gray-900 pt-4 flex space-x-3">
              {!quizSubmitted ? (
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(selectedAnswers).length < labData.questions.length || savingProgress}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                >
                  {savingProgress ? 'Saving Progress...' : 'Submit Answers'}
                </button>
              ) : (
                <button
                  onClick={resetQuiz}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-slate-350 text-xs font-bold py-3 rounded-xl border border-gray-800 transition-all cursor-pointer text-center"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Socratic AI Tutor Collapsible Sidebar */}
      <div className={`border-l border-gray-900 bg-[#07070a]/90 backdrop-blur-md flex flex-col relative transition-all duration-300 ${
        isTutorOpen ? 'w-85' : 'w-0 overflow-hidden border-l-0'
      }`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-900 flex justify-between items-center bg-gray-950/40">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
            <span className="text-xs font-extrabold text-white">MacalinAI Lab Companion</span>
          </div>
          <button 
            onClick={() => setIsTutorOpen(false)}
            className="text-gray-500 hover:text-white bg-gray-900 p-1.5 rounded-lg border border-gray-800 transition-all cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Chat log list */}
        <div className="flex-1 p-4 overflow-auto space-y-4">
          {chatMessages.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-tr-none' 
                  : 'bg-gray-900 text-gray-300 border border-gray-850 rounded-tl-none font-sans'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-900 text-gray-400 border border-gray-850 p-3 rounded-xl rounded-tl-none text-xs flex items-center space-x-2">
                <RefreshCw className="h-3 w-3 animate-spin text-purple-500" />
                <span>MacalinAI is analyzing live simulator values...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat input box */}
        <form onSubmit={handleTutorSubmit} className="p-3 border-t border-gray-900 bg-gray-950/40 flex items-center space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask your cognitive tutor..."
            disabled={chatLoading}
            className="flex-1 bg-gray-900 border border-gray-850 rounded-xl text-xs px-3.5 py-2.5 text-slate-200 placeholder-gray-500 focus:outline-none focus:border-purple-600 transition-colors disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Floating Toggle button to expand tutor if closed */}
      {!isTutorOpen && (
        <button
          onClick={() => setIsTutorOpen(true)}
          className="absolute right-6 bottom-6 bg-purple-600 hover:bg-purple-700 text-white p-4.5 rounded-full shadow-2xl z-40 animate-bounce cursor-pointer flex items-center space-x-1.5"
          title="Open AI Companion"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-extrabold pr-1">Ask MacalinAI</span>
        </button>
      )}

    </div>
  );
}
