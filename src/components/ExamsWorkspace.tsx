'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import { 
  Award, FileText, Timer, CheckCircle, XCircle, ArrowRight, RotateCcw, 
  HelpCircle, Send, Volume2, Play, ChevronRight, Network, ZoomIn, ZoomOut, Maximize2 
} from 'lucide-react';
import 'reactflow/dist/style.css';

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[];
  explanation?: string;
  correctAnswer?: string; // added to sync client-side evaluation
}

interface MockExam {
  id: string;
  title: string;
  grade: number;
  subjectId: string;
  durationMinutes: number;
  questionCount: number;
}

interface ExamsWorkspaceProps {
  userProfile?: {
    id: string;
    name?: string;
  } | null;
  subscription?: string;
}

export function ExamsWorkspace({
  userProfile,
  subscription
}: ExamsWorkspaceProps) {
  // Navigation & onboarding state
  const [allExams, setAllExams] = useState<MockExam[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ESSLCE');
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [isLoadingExams, setIsLoadingExams] = useState<boolean>(true);

  // Active Exam state
  const [activeExam, setActiveExam] = useState<MockExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: selectedOption }
  const [lockedAnswers, setLockedAnswers] = useState<Record<string, boolean>>({}); // { questionId: isLocked }
  const [examCompleted, setExamCompleted] = useState<boolean>(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);

  // Gamified Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // AI Companion Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: "Hello! I am MacalinAI, your cognitive tutor companion. Start an exam or select a question to see step-by-step master demonstrations and ask follow-up questions." }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // ReactFlow States
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Fetch SQLite exams list on mount
  useEffect(() => {
    fetch('/api/exams/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllExams(data.exams);
        }
      })
      .catch(err => console.error("Error loading exams:", err))
      .finally(() => setIsLoadingExams(false));
  }, []);

  // Filter exams based on onboarding selections
  const filteredExams = useMemo(() => {
    return allExams.filter(exam => {
      const titleLower = exam.title.toLowerCase();
      
      // Match category
      if (selectedCategory === 'ESSLCE' && !titleLower.includes('esslce') && !titleLower.includes('eueee')) return false;
      if (selectedCategory === 'Regional' && !titleLower.includes('exam') && exam.grade !== 8) return false;
      if (selectedCategory === 'Prep' && (exam.grade !== 9 && exam.grade !== 10 && exam.grade !== 11)) return false;

      // Match subject
      const subjectWord = selectedSubject.toLowerCase();
      if (!titleLower.includes(subjectWord) && exam.subjectId.toLowerCase() !== `${exam.grade}-${subjectWord}`) return false;

      // Match year
      if (selectedYear !== 'All') {
        if (selectedYear === 'Prep Mock' && !titleLower.includes('prep') && !titleLower.includes('mock')) return false;
        if (selectedYear !== 'Prep Mock' && !titleLower.includes(selectedYear)) return false;
      }

      return true;
    });
  }, [allExams, selectedCategory, selectedSubject, selectedYear]);

  // Countdown timer effect
  useEffect(() => {
    if (activeExam && !examCompleted && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeExam, examCompleted, timerSeconds]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleStartExam = async (examId: string) => {
    setIsLoadingQuestions(true);
    try {
      const res = await fetch(`/api/exams/questions?examId=${examId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        // Find correct answers in DB schema for client-side feedback validation
        const examDetails = allExams.find(e => e.id === examId);
        
        // Fetch full evaluation details by fetching correctAnswers
        const formattedQuestions = data.questions.map((q: any) => ({
          ...q,
          correctAnswer: q.options[0] // fallback or dynamically fetched
        }));

        // Retrieve correct answers by querying endpoint or simulating
        const subRes = await fetch(`/api/exams/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examId, answers: {} })
        });
        const subData = await subRes.json();
        
        if (subRes.ok && subData.feedback) {
          const feedbackMap = new Map(subData.feedback.map((f: any) => [f.id, f.correctAnswer]));
          data.questions.forEach((q: any) => {
            q.correctAnswer = feedbackMap.get(q.id) || q.options[0];
          });
        }

        setQuestions(data.questions);
        setActiveExam(examDetails || null);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setLockedAnswers({});
        setExamCompleted(false);
        setTimerSeconds((examDetails?.durationMinutes || 90) * 60);

        setChatMessages([
          { role: 'model', text: `Welcome to the mock exam preparation for "${examDetails?.title || 'Exam'}". I am MacalinAI, your cognitive tutor. Select options and lock in your answers in the left column. I will display a step-by-step master explanation of each question here in the center column as soon as you submit.` }
        ]);
      }
    } catch (err) {
      console.error("Error loading questions:", err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleLockInAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const selectedOption = answers[currentQuestion.id];
    if (!selectedOption) return;

    setLockedAnswers(prev => ({ ...prev, [currentQuestion.id]: true }));

    // Send context to MacalinAI Companion automatically for instant explanation
    setIsChatLoading(true);
    
    const explanationPrompt = `Please give me a step-by-step master demonstration and explanation of this question.
Question: "${currentQuestion.text}"
Options: ${currentQuestion.options.map((o, idx) => `[${String.fromCharCode(65 + idx)}] ${o}`).join(', ')}
My selected answer: "${selectedOption}"
Correct answer: "${currentQuestion.correctAnswer}"
Explanation: "${currentQuestion.explanation || 'Refer to curriculum details'}"`;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: explanationPrompt }
          ],
          systemInstruction: "You are MacalinAI, an expert cognitive tutor for the Ethiopian curriculum. Analyze the exam question, explain why the correct answer is correct, why other options are incorrect, and demonstrate any formulas or derivations step-by-step."
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChatMessages(prev => [
          ...prev,
          { role: 'model', text: `### Question ${currentQuestionIndex + 1} Demonstration\n\n` + data.text }
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          { role: 'model', text: `**Master Explanation**: The correct answer is **${currentQuestion.correctAnswer}**. \n\n*Explanation*: ${currentQuestion.explanation || 'Review the core subject units.'}` }
        ]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        { role: 'model', text: `**Correct Answer**: **${currentQuestion.correctAnswer}**. \n\n*Explanation*: ${currentQuestion.explanation || 'Refer to curriculum handbook.'}` }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFinishExam = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setExamCompleted(true);

    // Save attempt to backend
    if (activeExam) {
      try {
        await fetch('/api/exams/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examId: activeExam.id,
            answers
          })
        });
      } catch (err) {
        console.error("Error saving exam attempt:", err);
      }
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsChatLoading(true);

    const activeQuestion = questions[currentQuestionIndex];
    const contextPrompt = activeQuestion 
      ? `[Exam Context: ${activeExam?.title || 'Exam'}. Current Question: "${activeQuestion.text}". Correct Answer: "${activeQuestion.correctAnswer}". Student's Choice: "${answers[activeQuestion.id] || 'None'}"].\n\nStudent Question: ${userText}`
      : userText;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...chatMessages.map(m => ({ role: m.role, content: m.text })),
            { role: 'user', content: contextPrompt }
          ],
          systemInstruction: "You are MacalinAI. Provide helpful follow-up tutoring explanations. Keep explanations clear, step-by-step, and targeted."
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChatMessages(prev => [...prev, { role: 'model', text: data.text }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleResetExam = () => {
    setActiveExam(null);
    setQuestions([]);
    setAnswers({});
    setLockedAnswers({});
    setExamCompleted(false);
    setTimerSeconds(0);
    setChatMessages([
      { role: 'model', text: "Hello! I am MacalinAI, your cognitive tutor companion. Start an exam or select a question to see step-by-step master demonstrations and ask follow-up questions." }
    ]);
  };

  const scorePercentage = useMemo(() => {
    if (questions.length === 0) return 0;
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    return Math.round((correctCount / questions.length) * 100);
  }, [questions, answers]);

  // ReactFlow node layout logic: NotebookLM style horizontal outward branches
  const { flowNodes, flowEdges } = useMemo(() => {
    const generatedNodes: any[] = [];
    const generatedEdges: any[] = [];

    if (!activeExam) {
      // Centered onboarding layout
      const rootId = 'root-exam-onboard';
      generatedNodes.push({
        id: rootId,
        type: 'input',
        data: { label: 'Exams Ecosystem' },
        position: { x: 30, y: 180 },
        style: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          color: '#ffffff',
          border: '2px solid #a78bfa',
          borderRadius: '12px',
          padding: '12px 18px',
          fontWeight: 'bold',
          fontSize: '13px',
          width: 180,
          textAlign: 'center'
        } as React.CSSProperties
      });

      const options = [
        'National ESSLCE Prep',
        'Interactive AI Explanations',
        'Gamified Exam Timers',
        'NotebookLM Split Synthesis'
      ];

      options.forEach((opt, idx) => {
        const nodeId = `onboard-opt-${idx}`;
        generatedNodes.push({
          id: nodeId,
          type: 'output',
          data: { label: opt },
          position: { x: 260, y: 40 + idx * 80 },
          style: {
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#cbd5e1',
            border: '1px solid #6366f1',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '11px',
            width: 190,
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)'
          } as React.CSSProperties
        });

        generatedEdges.push({
          id: `edge-${rootId}-${nodeId}`,
          source: rootId,
          target: nodeId,
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
        });
      });

      return { flowNodes: generatedNodes, flowEdges: generatedEdges };
    }

    const currentQuestion = questions[currentQuestionIndex];
    const questionText = currentQuestion ? currentQuestion.text : 'Exam Question';
    
    // Central Node: active chapter/exam title
    const centralId = 'central-node';
    const centralLabel = activeExam.title.length > 30 ? activeExam.title.slice(0, 30) + '...' : activeExam.title;
    
    generatedNodes.push({
      id: centralId,
      type: 'input',
      data: { label: `Exam: ${centralLabel}` },
      position: { x: 30, y: 180 },
      style: {
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        color: '#ffffff',
        border: '2px solid #a78bfa',
        borderRadius: '12px',
        padding: '12px 18px',
        fontWeight: 'bold',
        fontSize: '12px',
        width: 180,
        textAlign: 'center',
        boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)'
      } as React.CSSProperties
    });

    const secondaryNodesData: Array<{ label: string; border: string; textColor: string; edgeColor: string }> = [];

    // 1. Question Node
    const cleanQText = questionText.replace(/[#*`_]/g, '');
    const briefQText = cleanQText.length > 45 ? cleanQText.slice(0, 45) + '...' : cleanQText;
    secondaryNodesData.push({
      label: `Q${currentQuestionIndex + 1}: ${briefQText}`,
      border: '1px solid #818cf8',
      textColor: '#e2e8f0',
      edgeColor: '#818cf8'
    });

    // 2. Extracted Formula/Concept
    const formulaMatch = questionText.match(/(\$\$[^$]+\$\$|\$[^\$]+\$)/);
    const formulaLabel = formulaMatch ? formulaMatch[1].replace(/\$/g, '').trim() : `${selectedSubject} Concept`;
    secondaryNodesData.push({
      label: `Formula/Concept: ${formulaLabel}`,
      border: '1px solid #06b6d4',
      textColor: '#22d3ee',
      edgeColor: '#06b6d4'
    });

    // 3. User Selected Answer Status
    const isLocked = lockedAnswers[currentQuestion?.id] !== undefined;
    const selectedAns = answers[currentQuestion?.id] || 'Not Answered';
    let ansStatusLabel = `My Answer: ${selectedAns}`;
    let border = '1px solid #f59e0b';
    let textColor = '#fbbf24';
    let edgeColor = '#f59e0b';

    if (isLocked) {
      const isCorrect = selectedAns === currentQuestion?.correctAnswer;
      ansStatusLabel = isCorrect ? `Correct: ${selectedAns}` : `Incorrect: ${selectedAns}`;
      border = isCorrect ? '1px solid #10b981' : '1px solid #ef4444';
      textColor = isCorrect ? '#34d399' : '#f87171';
      edgeColor = isCorrect ? '#10b981' : '#ef4444';
    }

    secondaryNodesData.push({
      label: ansStatusLabel,
      border,
      textColor,
      edgeColor
    });

    // 4. Explanation summary if locked
    if (isLocked && currentQuestion?.explanation) {
      const cleanExpl = currentQuestion.explanation.replace(/[#*`_]/g, '');
      const briefExpl = cleanExpl.length > 50 ? cleanExpl.slice(0, 50) + '...' : cleanExpl;
      secondaryNodesData.push({
        label: `Tutor Note: ${briefExpl}`,
        border: '1px solid #10b981',
        textColor: '#34d399',
        edgeColor: '#10b981'
      });
    }

    // Generate positions & nodes
    secondaryNodesData.forEach((item, idx) => {
      const nodeId = `sec-node-${idx}`;
      generatedNodes.push({
        id: nodeId,
        type: 'output',
        data: { label: item.label },
        position: { x: 260, y: 40 + idx * 85 },
        style: {
          background: 'rgba(15, 23, 42, 0.85)',
          color: item.textColor,
          border: item.border,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          width: 200,
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)'
        } as React.CSSProperties
      });

      generatedEdges.push({
        id: `edge-central-to-${nodeId}`,
        source: centralId,
        target: nodeId,
        animated: true,
        style: { stroke: item.edgeColor, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: item.edgeColor }
      });
    });

    return { flowNodes: generatedNodes, flowEdges: generatedEdges };
  }, [activeExam, questions, currentQuestionIndex, answers, lockedAnswers, selectedSubject]);

  // Sync ReactFlow state
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  // Render timer helpers
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="w-full h-[85vh] bg-[#07070a] text-slate-100 flex flex-col font-sans border border-purple-900/20 rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">
      
      {/* Workspace Header Dashboard controls */}
      <header className="border-b border-gray-900 bg-gray-950/80 px-6 py-4 flex justify-between items-center z-10 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-950/50 border border-purple-800/40 rounded-lg">
            <Award className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white">
              Exams Ecosystem
            </h1>
            <p className="text-[10px] text-gray-400">
              Interactive past papers, scoring engines, and live cognitive tutorials.
            </p>
          </div>
        </div>

        {activeExam && (
          <div className="flex items-center space-x-4 bg-slate-900/60 border border-slate-800/80 px-4 py-1.5 rounded-lg shadow-inner">
            <div className="flex items-center space-x-2">
              <Timer className={`h-4 w-4 ${timerSeconds < 300 ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
              <span className={`text-xs font-mono font-bold ${timerSeconds < 300 ? 'text-red-400 font-extrabold' : 'text-purple-300'}`}>
                {formatTime(timerSeconds)}
              </span>
            </div>
            <button 
              onClick={handleResetExam}
              className="text-[10px] font-bold text-gray-400 hover:text-white flex items-center space-x-1 hover:bg-slate-800 px-2 py-1 rounded transition-all cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Quit</span>
            </button>
          </div>
        )}
      </header>

      {/* NotebookLM Split Three-Column View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Sources & Onboarding / Exam Console (40%) */}
        <div className="w-[40%] border-r border-gray-900 bg-gray-950/20 flex flex-col overflow-y-auto p-6">
          {!activeExam ? (
            // Onboarding Wizard
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
                  Select National Examination
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Choose a national paper configuration to initiate the gamified test stream.
                </p>
              </div>

              <div className="space-y-4">
                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Exam Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['ESSLCE', 'Prep', 'Regional'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs py-2 px-3 rounded-lg border transition-all cursor-pointer font-medium ${
                          selectedCategory === cat
                            ? 'bg-purple-950/60 border-purple-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.2)]'
                            : 'bg-slate-900/40 border-slate-800 text-gray-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {cat === 'ESSLCE' ? 'ESSLCE (G12)' : cat === 'Prep' ? 'Mock Prep' : 'Regional (G8)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-xs text-purple-300 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-600 transition-colors"
                  >
                    {['Biology', 'Physics', 'Chemistry', 'Mathematics', 'English', 'History', 'Geography', 'Civics', 'Economics'].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Year Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Exam Year</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['2025', '2024', '2018', 'All'].map(yr => (
                      <button
                        key={yr}
                        onClick={() => setSelectedYear(yr)}
                        className={`text-xs py-2 rounded-lg border transition-all cursor-pointer font-medium ${
                          selectedYear === yr
                            ? 'bg-purple-950/60 border-purple-500 text-white shadow-[0_0_10px_rgba(124,58,237,0.15)]'
                            : 'bg-slate-900/40 border-slate-800 text-gray-400 hover:border-slate-700'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matched Exams Stream */}
              <div className="border-t border-purple-900/20 pt-5 space-y-3">
                <h3 className="text-[10px] uppercase font-bold text-gray-400">Available Examination Papers</h3>
                
                {isLoadingExams ? (
                  <div className="flex items-center space-x-2 py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                    <span className="text-xs text-gray-400">Loading catalog...</span>
                  </div>
                ) : filteredExams.length > 0 ? (
                  <div className="space-y-2">
                    {filteredExams.map(ex => (
                      <div 
                        key={ex.id}
                        className="bg-slate-900/50 border border-slate-850/80 hover:border-purple-800/60 p-4 rounded-xl flex items-center justify-between transition-all group"
                      >
                        <div className="space-y-1 pr-3">
                          <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{ex.title}</h4>
                          <div className="flex items-center space-x-3 text-[10px] text-gray-400">
                            <span>Grade {ex.grade}</span>
                            <span>•</span>
                            <span>{ex.questionCount} Questions</span>
                            <span>•</span>
                            <span>{ex.durationMinutes} Min</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartExam(ex.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-all flex items-center space-x-1 cursor-pointer shadow-md shadow-purple-900/20"
                        >
                          <span>Start</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/30 border border-slate-900 text-center py-8 rounded-xl">
                    <HelpCircle className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No matching national exams found.</p>
                    <button 
                      onClick={() => { setSelectedCategory('ESSLCE'); setSelectedSubject('Physics'); setSelectedYear('All'); }}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-bold mt-2"
                    >
                      Reset filters to default
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : examCompleted ? (
            // Results Dashboard Screen
            <div className="space-y-6 text-center py-10 animate-scaleIn">
              <div className="h-20 w-20 bg-purple-950/50 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/20">
                <Award className="h-10 w-10 text-yellow-400" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-lg font-extrabold text-white">Exam Attempt Completed!</h2>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Your answers have been calculated and synchronized. Check out your metrics below.
                </p>
              </div>

              {/* Gamified Scoring metrics */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-slate-900/40 border border-slate-850 p-5 rounded-2xl shadow-inner">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Score Percentage</span>
                  <div className={`text-2xl font-black ${scorePercentage >= 70 ? 'text-emerald-400' : 'text-yellow-500'}`}>
                    {scorePercentage}%
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Status</span>
                  <div className={`text-sm font-extrabold py-1.5 ${scorePercentage >= 70 ? 'text-emerald-400' : 'text-yellow-500'}`}>
                    {scorePercentage >= 70 ? 'Mastery Passed' : 'Needs Review'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <button
                  onClick={handleResetExam}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-900/30"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            // Active Exam Console
            <div className="space-y-6 animate-fadeIn flex flex-col h-full">
              
              {/* Question Header Status */}
              <div className="flex justify-between items-center border-b border-purple-900/10 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] bg-purple-950 border border-purple-800/40 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <h3 className="text-xs text-gray-400 font-semibold truncate max-w-[200px]">
                    {activeExam.title}
                  </h3>
                </div>
              </div>

              {/* Question Body */}
              {questions[currentQuestionIndex] ? (
                <div className="space-y-6 flex-1">
                  <div className="bg-slate-900/30 border border-slate-850/80 p-5 rounded-2xl shadow-inner text-xs leading-relaxed text-slate-100 whitespace-pre-wrap">
                    {questions[currentQuestionIndex].text}
                  </div>

                  {/* Multiple Choice list */}
                  <div className="space-y-2">
                    {questions[currentQuestionIndex].options.map((opt, index) => {
                      const optCode = String.fromCharCode(65 + index);
                      const isSelected = answers[questions[currentQuestionIndex].id] === opt;
                      const isLocked = lockedAnswers[questions[currentQuestionIndex].id] === true;
                      
                      let optionBgBorder = 'bg-slate-900/40 border-slate-850 hover:border-slate-700 text-slate-300';
                      if (isSelected) {
                        optionBgBorder = 'bg-purple-950/40 border-purple-600 text-purple-200';
                      }

                      if (isLocked) {
                        const isCorrect = opt === questions[currentQuestionIndex].correctAnswer;
                        const wasStudentSelection = answers[questions[currentQuestionIndex].id] === opt;
                        if (isCorrect) {
                          optionBgBorder = 'bg-emerald-950/45 border-emerald-500 text-emerald-300';
                        } else if (wasStudentSelection) {
                          optionBgBorder = 'bg-red-950/45 border-red-500 text-red-300';
                        } else {
                          optionBgBorder = 'bg-slate-900/20 border-slate-900 text-slate-500 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          disabled={isLocked}
                          onClick={() => setAnswers(prev => ({ ...prev, [questions[currentQuestionIndex].id]: opt }))}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center space-x-3 transition-all text-xs cursor-pointer ${optionBgBorder}`}
                        >
                          <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold border ${
                            isLocked
                              ? opt === questions[currentQuestionIndex].correctAnswer
                                ? 'bg-emerald-500 border-emerald-400 text-white'
                                : isSelected
                                  ? 'bg-red-500 border-red-400 text-white'
                                  : 'bg-slate-900 border-slate-800 text-gray-600 opacity-60'
                              : isSelected
                                ? 'bg-purple-600 border-purple-400 text-white'
                                : 'bg-slate-900 border-slate-800 text-gray-400'
                          }`}>
                            {optCode}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          
                          {isLocked && opt === questions[currentQuestionIndex].correctAnswer && (
                            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                          )}
                          {isLocked && isSelected && opt !== questions[currentQuestionIndex].correctAnswer && (
                            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
                  Question details loading...
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="border-t border-purple-900/10 pt-4 flex items-center space-x-3">
                {questions[currentQuestionIndex] && !lockedAnswers[questions[currentQuestionIndex].id] ? (
                  <button
                    onClick={handleLockInAnswer}
                    disabled={!answers[questions[currentQuestionIndex].id]}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20 text-center"
                  >
                    Lock in & Submit Answer
                  </button>
                ) : (
                  <>
                    {currentQuestionIndex < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="w-full bg-purple-900/40 hover:bg-purple-700/80 text-white border border-purple-800/40 text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishExam}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer text-center shadow-lg shadow-emerald-900/20"
                      >
                        Finish & View Results
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          )}
        </div>

        {/* CENTER COLUMN: MacalinAI Chat Panel (30%) */}
        <div className="w-[30%] border-r border-gray-900 bg-gray-950/40 flex flex-col overflow-hidden">
          
          {/* Chat Header */}
          <div className="px-5 py-3 border-b border-gray-905 bg-slate-900/20 flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-gray-500">Tutor Companion</span>
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping"></span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {chatMessages.map((msg, index) => (
              <div 
                key={index}
                className={`flex flex-col space-y-1 max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <span className="text-[9px] text-gray-500 font-bold">
                  {msg.role === 'user' ? 'Me' : 'MacalinAI'}
                </span>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-purple-650 text-white rounded-tr-none'
                    : 'bg-slate-900/80 border border-slate-850 text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex items-center space-x-2 mr-auto bg-slate-900/50 border border-slate-850 p-3 rounded-2xl rounded-tl-none text-[11px] text-gray-400">
                <div className="flex space-x-1">
                  <span className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                  <span className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span>Analyzing answer context...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-900 bg-gray-950/60 flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              disabled={isChatLoading}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              placeholder="Ask MacalinAI about the question..."
              className="flex-1 bg-slate-900 border border-slate-850 text-xs text-slate-200 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-600 transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSendChatMessage}
              disabled={isChatLoading || !chatInput.trim()}
              className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Mind Map / Visual Studio Canvas (30%) */}
        <div className="w-[30%] bg-gray-950/60 flex flex-col relative overflow-hidden">
          
          {/* Canvas Header */}
          <div className="px-5 py-3 border-b border-gray-905 bg-slate-900/20 flex justify-between items-center absolute top-0 left-0 right-0 z-10 backdrop-blur-md">
            <h2 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-purple-400" />
              Mind Map
            </h2>
            <span className="text-[8px] bg-purple-950 text-purple-400 px-2 py-0.5 border border-purple-800/40 rounded-full font-bold">
              Visual Studio
            </span>
          </div>

          {/* ReactFlow Viewport */}
          <div className="w-full h-full pt-10">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-right"
              className="bg-[#04060f]"
            >
              <Background color="#1d153a" gap={18} size={1} />
              <Controls className="bg-slate-900 border border-slate-850 text-white rounded shadow-lg [&_button]:border-slate-850 [&_button]:bg-slate-900 [&_svg]:fill-white [&_button:hover]:bg-slate-800" />
              <MiniMap 
                nodeStrokeColor={(n) => {
                  if (n.id === 'central-node' || n.id === 'root-exam-onboard') return '#7c3aed';
                  return '#6366f1';
                }}
                nodeColor={(n) => {
                  if (n.id === 'central-node' || n.id === 'root-exam-onboard') return '#7c3aed';
                  return '#0f172a';
                }}
                className="bg-slate-900 border border-slate-850 rounded shadow-lg overflow-hidden"
              />
            </ReactFlow>
          </div>

        </div>

      </div>

    </div>
  );
}
