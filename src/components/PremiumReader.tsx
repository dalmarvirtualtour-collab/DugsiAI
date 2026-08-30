"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Sparkles, Languages, Check, ArrowLeft, ChevronLeft, ChevronRight, 
  MessageSquare, User, Send, Play, Volume2, Bookmark, X, CheckSquare, RefreshCw, AlertTriangle,
  Network
} from 'lucide-react';
import { MindMapWorkspace } from './MindMapWorkspace';

// Standard Grade & Subject indexes for selection
const GRADES = [7, 8, 9, 10, 11, 12];

const SUBJECTS = [
  { id: 'biology', name: 'Biology' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'history', name: 'History' },
  { id: 'geography', name: 'Geography' },
  { id: 'civics', name: 'Civics' },
  { id: 'english', name: 'English' }
];

const SUPPORT_LANGUAGES = [
  { code: 'so', name: 'Somali (Af-Soomaali)' },
  { code: 'om', name: 'Afaan Oromo' },
  { code: 'am', name: 'Amharic (አማርኛ)' },
  { code: 'en', name: 'English Only' }
];

interface VocabTerm {
  term: string;
  definitions: {
    en: string;
    so: string;
    om: string;
    am: string;
  };
  context: {
    example_sentences: {
      en: string;
      so: string;
      om: string;
      am: string;
    };
    image_urls: string[];
  };
}

interface PremiumReaderProps {
  userProfile?: {
    id: string;
    name?: string;
    student?: {
      grade?: string | number;
    };
  } | null;
  subscription?: string;
  isEmbedded?: boolean;
}

export function PremiumReader({
  userProfile,
  subscription,
  isEmbedded = false
}: PremiumReaderProps) {
  // Use state dynamically driven by your profile context
  const [selectedGrade, setSelectedGrade] = useState<string | number>(
    userProfile?.student?.grade || "Grade 10"
  );

  // Sync state if userProfile finishes loading asynchronously
  useEffect(() => {
    if (userProfile?.student?.grade) {
      setSelectedGrade(userProfile.student.grade);
    }
  }, [userProfile]);

  const grade_digits = selectedGrade.toString().replace(/\D/g, '') || "10";
  const [selectedSubject, setSelectedSubject] = useState<string>('biology');
  const [supportLang, setSupportLang] = useState<string>('so');
  const [chapterId, setChapterId] = useState<string>('general');
  const [lessonId, setLessonId] = useState<string>('general');
  const [pageNumber, setPageNumber] = useState<number>(10);
  const [chapterList, setChapterList] = useState<any[]>([]);
  const [isMindMapOpen, setIsMindMapOpen] = useState<boolean>(false);

  const resetContextualState = () => {
    setChatMessages([
      { role: 'model', text: "Hello! I am your DugsiAI cognitive tutor. I've analyzed this textbook page. How can I help you master these concepts today?" }
    ]);
    setFloatingMenu({ visible: false, x: 0, y: 0, text: '' });
    setActiveVocab(null);
    setIsQuizModalOpen(false);
    setQuizQuestion(null);
    setQuizAnswer('');
    setQuizSubmitted(false);
    setQuizResult(null);
    setTimerSeconds(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  // Load chapters dynamically based on selected grade and subject
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const subRes = await fetch(`/api/curriculum?grade=${grade_digits}`);
        const subData = await subRes.json();
        
        if (subRes.ok && subData.success && subData.subjects) {
          const matchedSub = subData.subjects.find(
            (s: any) => s.name.toLowerCase() === selectedSubject.toLowerCase()
          );
          
          if (matchedSub) {
            const chapRes = await fetch(`/api/curriculum?subjectId=${matchedSub.id}`);
            const chapData = await chapRes.json();
            
            if (chapRes.ok && chapData.success && chapData.chapters) {
              setChapterList(chapData.chapters);
              
              if (chapData.chapters.length > 0) {
                const hasCurrentChapter = chapData.chapters.some((c: any) => c.id === chapterId);
                if (!hasCurrentChapter) {
                  setChapterId(chapData.chapters[0].id);
                  const firstLesson = chapData.chapters[0].lessons?.[0];
                  if (firstLesson) {
                    setLessonId(firstLesson.id);
                  } else {
                    setLessonId('general');
                  }
                }
              } else {
                setChapterList([]);
                setChapterId('general');
                setLessonId('general');
              }
              return;
            }
          }
        }
        setChapterList([]);
        setChapterId('general');
        setLessonId('general');
      } catch (err) {
        console.error("Error loading curriculum chapters:", err);
        setChapterList([]);
        setChapterId('general');
        setLessonId('general');
      }
    };
    
    fetchChapters();
  }, [grade_digits, selectedSubject]);

  // Content fetching state
  const [pageContent, setPageContent] = useState<string>('');
  const [vocabAnchors, setVocabAnchors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Floating micro-menu state
  const [floatingMenu, setFloatingMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({ visible: false, x: 0, y: 0, text: '' });
  const textColumnRef = useRef<HTMLDivElement | null>(null);

  // Vocabulary overlay state
  const [activeVocab, setActiveVocab] = useState<VocabTerm | null>(null);
  const [isVocabLoading, setIsVocabLoading] = useState<boolean>(false);

  // Chat companion state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: "Hello! I am your DugsiAI cognitive tutor. I've analyzed this textbook page. How can I help you master these concepts today?" }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Adaptive Assessment/Quiz state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [quizQuestion, setQuizQuestion] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerIntervalRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  // User notes state
  const [notes, setNotes] = useState<Array<{ id: string; text: string; page: number; timestamp: string }>>([]);
  const [newNoteInput, setNewNoteInput] = useState<string>('');
  const [showNotePanel, setShowNotePanel] = useState<boolean>(false);

  // Fetch page content directly from Firestore API (Fast-path)
  const fetchPageContent = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    // Construct IDs
    const grade_subject_id = `grade_${grade_digits}_${selectedSubject}`;
    
    try {
      const url = `/api/reader?grade_subject_id=${grade_subject_id}&chapter_id=${chapterId}&lesson_id=${lessonId}&page_number=${pageNumber}`;
      const res = await fetch(url);
      const resData = await res.json();
      
      if (res.ok && resData.success) {
        setPageContent(resData.data.content || '');
        setVocabAnchors(resData.data.vocab_anchors || []);
      } else {
        // Fallback simulated layout if page is not yet uploaded
        setPageContent(`## Lesson Section ${lessonId.toUpperCase().replace('_', ' ')} (Page ${pageNumber})

No Firestore page uploaded yet for path:
\`curriculum/${grade_subject_id}/chapters/${chapterId}/lessons/${lessonId}/pages/${pageNumber}\`

### 🧪 Activity: Cell Structure Experiment
Observe plant cells under a microscope. Identify the cell wall and the chloroplasts. Photosynthesis occurs in the chloroplasts.

> 📖 **Definition:** Photosynthesis is the chemical process by which green plants build sugars using sunlight, water, and carbon dioxide.

💡 **Example:** During photosynthesis, plants convert carbon dioxide into sugars. The formula is:
$$6CO_2 + 6H_2O \\xrightarrow{\\text{sunlight}} C_6H_{12}O_6 + 6O_2$$

📝 **Exercise / Review:**
1. What organelle is responsible for photosynthesis?
2. Write down the chemical equation representing photosynthesis.`);
        setVocabAnchors(['photosynthesis', 'cell', 'chloroplast', 'reproduction', 'organism']);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to fetch textbook page.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageContent();
    // Reset page-level interactive items
    setFloatingMenu({ visible: false, x: 0, y: 0, text: '' });
    setActiveVocab(null);
    setIsQuizModalOpen(false);
    setQuizQuestion(null);
    setQuizAnswer('');
    setQuizSubmitted(false);
    setQuizResult(null);
    setTimerSeconds(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, [selectedGrade, selectedSubject, chapterId, lessonId, pageNumber]);

  // Load from URL search parameters on initial mount to enable dashboard deep-linking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const g = params.get('grade');
      const s = params.get('subject');
      const c = params.get('chapter');
      const l = params.get('lesson');
      const p = params.get('page');
      if (g) setSelectedGrade(Number(g));
      if (s) setSelectedSubject(s);
      if (c) setChapterId(c);
      if (l) setLessonId(l);
      if (p) setPageNumber(Number(p));
    }
  }, []);

  // Load local storage notes
  useEffect(() => {
    const savedNotes = localStorage.getItem(`dugsiai_notes_${grade_digits}_${selectedSubject}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      setNotes([]);
    }
  }, [grade_digits, selectedSubject]);

  const saveNotes = (updatedNotes: any[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(`dugsiai_notes_${grade_digits}_${selectedSubject}`, JSON.stringify(updatedNotes));
  };

  // Text selection handler for floating micro-menu
  const handleTextSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection) return;
    
    const text = selection.toString().trim();
    if (text.length > 2 && text.length < 100) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Calculate coordinates relative to text container viewport
      if (textColumnRef.current) {
        const colRect = textColumnRef.current.getBoundingClientRect();
        setFloatingMenu({
          visible: true,
          x: rect.left - colRect.left + (rect.width / 2),
          y: rect.top - colRect.top - 45 + textColumnRef.current.scrollTop,
          text: text
        });
      }
    } else {
      setFloatingMenu(prev => ({ ...prev, visible: false }));
    }
  };

  // Click handler for anchor terms
  const handleAnchorClick = async (term: string) => {
    setIsVocabLoading(true);
    setActiveVocab(null);
    
    const cleanTerm = term.toLowerCase().replace(/[^a-z]+/g, '');
    try {
      const url = `/api/vocab?term_id=${cleanTerm}`;
      const res = await fetch(url);
      const resData = await res.json();
      
      if (res.ok && resData.success) {
        setActiveVocab(resData.data);
      } else {
        // Mock fallback definitions
        setActiveVocab({
          term: cleanTerm,
          definitions: {
            en: `Detailed academic definition of ${cleanTerm} for Grade ${selectedGrade} standard.`,
            so: `Qeexitaan kooban oo ku saabsan ${cleanTerm} oo ku habboon ardayda.`,
            om: `Hiika gabaaba kan waa'ee ${cleanTerm} ibsu kan ardaydaaf ta'u.`,
            am: `ለተማሪዎች በሚሆን መልኩ የተዘጋጀ የ${cleanTerm} ቀላል ትርጉም።`
          },
          context: {
            example_sentences: {
              en: `This sentence demonstrates the usage of the term ${cleanTerm} in textbook context.`,
              so: `Tusaale muujinaya isticmaalka ereyga ${cleanTerm} ee casharka.`,
              om: `Tusaalaa fayyadama jecha ${cleanTerm} keessoo barumsaatti.`,
              am: `የ${cleanTerm} አጠቃቀም በምሳሌ የሚያሳይ አረፍተ ነገር።`
            },
            image_urls: []
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVocabLoading(false);
    }
  };

  // Selection Floating Actions
  const handleExplainSelection = async () => {
    const text = floatingMenu.text;
    setFloatingMenu(prev => ({ ...prev, visible: false }));
    
    // Add prompt user message
    const newMsg = { role: 'user' as const, text: `Explain this term: "${text}"` };
    setChatMessages(prev => [...prev, newMsg]);
    setIsChatOpen(true);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/tutor/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userProfile?.id || "student_demo",
          current_context: {
            grade: grade_digits,
            subject: selectedSubject,
            chapter_id: chapterId,
            lesson_id: lessonId,
            page_number: pageNumber.toString(),
            selected_text: text
          },
          action: "EXPLAIN_AGAIN"
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'model', text: data.result || "I couldn't generate an explanation. Please try again." }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI Tutor. Check backend server." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleTranslateSelection = async () => {
    const text = floatingMenu.text;
    setFloatingMenu(prev => ({ ...prev, visible: false }));
    
    const langNames: Record<string, string> = { so: 'Somali', om: 'Afaan Oromo', am: 'Amharic' };
    const targetLangName = langNames[supportLang] || 'Somali';
    
    const newMsg = { role: 'user' as const, text: `Translate "${text}" into ${targetLangName}` };
    setChatMessages(prev => [...prev, newMsg]);
    setIsChatOpen(true);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/tutor/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userProfile?.id || "student_demo",
          current_context: {
            grade: grade_digits,
            subject: selectedSubject,
            chapter_id: chapterId,
            lesson_id: lessonId,
            page_number: pageNumber.toString(),
            selected_text: text
          },
          action: "ASK_AI",
          user_message: `Translate the term "${text}" into ${targetLangName}. Keep it short and provide simple terminology.`
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'model', text: data.result || "I could not translate this selection." }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAddNoteSelection = () => {
    const text = floatingMenu.text;
    setFloatingMenu(prev => ({ ...prev, visible: false }));
    
    const noteText = prompt(`Add a study note for: "${text}"`);
    if (noteText) {
      const newNote = {
        id: Math.random().toString(36).substr(2, 9),
        text: `"${text}": ${noteText}`,
        page: pageNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveNotes([...notes, newNote]);
    }
  };

  // Submit chat question
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/tutor/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userProfile?.id || "student_demo",
          current_context: {
            grade: grade_digits,
            subject: selectedSubject,
            chapter_id: chapterId,
            lesson_id: lessonId,
            page_number: pageNumber.toString()
          },
          action: "ASK_AI",
          user_message: userText
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'model', text: data.result || "Sorry, I am having trouble answering right now." }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI Tutor. Check backend server." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Request interactive assessment (next adaptive question)
  const handleRequestQuiz = async () => {
    setIsQuizModalOpen(true);
    setQuizQuestion(null);
    setQuizAnswer('');
    setQuizSubmitted(false);
    setQuizResult(null);
    setTimerSeconds(0);
    setQuizLoading(true);
    
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    try {
      const res = await fetch('/api/assessment/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userProfile?.id || "student_demo",
          session_id: userProfile?.id || "session_demo",
          current_context: {
            grade: grade_digits,
            subject: selectedSubject,
            chapter_id: chapterId,
            lesson_id: lessonId,
            page_number: pageNumber.toString()
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQuizQuestion(data.question);
        startTimeRef.current = Date.now();
        // Start live timer interval (tenths of a second)
        timerIntervalRef.current = setInterval(() => {
          setTimerSeconds(prev => prev + 0.1);
        }, 100);
      } else {
        alert("Could not load adaptive question. Check uvicorn backend log.");
        setIsQuizModalOpen(false);
      }
    } catch (err) {
      console.error("Adaptive fetch error:", err);
      setIsQuizModalOpen(false);
    } finally {
      setQuizLoading(false);
    }
  };

  // Submit quiz answer with response time metric
  const handleQuizSubmit = async () => {
    if (!quizAnswer || !quizQuestion) return;

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const finalTime = (Date.now() - startTimeRef.current) / 1000;
    
    setQuizLoading(true);

    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userProfile?.id || "student_demo",
          session_id: userProfile?.id || "session_demo",
          response: quizAnswer,
          response_time_seconds: finalTime,
          current_context: {
            grade: grade_digits,
            subject: selectedSubject,
            chapter_id: chapterId,
            lesson_id: lessonId,
            page_number: pageNumber.toString()
          },
          question_text: quizQuestion.text,
          correct_answer: quizQuestion.correct_answer,
          taxonomy_tier: quizQuestion.taxonomy_tier,
          question_type: quizQuestion.type,
          concept_tag: quizQuestion.concept_tag || "general"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQuizSubmitted(true);
        setQuizResult(data);
      } else {
        alert("Quiz submission failed.");
      }
    } catch (err) {
      console.error("Quiz submission error:", err);
    } finally {
      setQuizLoading(false);
    }
  };

  // Rendering formatted textbook page
  const renderReadableContent = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">No page text content parsed.</p>;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const cleanLine = line.trim();
      if (cleanLine === '') return <div key={idx} className="h-4" />;

      let element: React.ReactNode = cleanLine;

      // Handle Headers
      if (cleanLine.startsWith('##')) {
        element = <h2 className="text-2xl font-extrabold text-white mt-6 mb-3">{cleanLine.replace(/#/g, '').trim()}</h2>;
      } else if (cleanLine.startsWith('###')) {
        element = <h3 className="text-xl font-bold text-purple-300 mt-5 mb-2">{cleanLine.replace(/#/g, '').trim()}</h3>;
      } else if (cleanLine.startsWith('####')) {
        element = <h4 className="text-lg font-bold text-purple-400 mt-4 mb-2">{cleanLine.replace(/#/g, '').trim()}</h4>;
      }
      // Handle Blockquotes (definitions)
      else if (cleanLine.startsWith('>')) {
        element = (
          <blockquote className="border-l-4 border-purple-500 bg-purple-950/20 pl-4 py-2 my-4 rounded-r-lg text-gray-300 italic">
            {highlightAnchors(cleanLine.replace(/^>\s*/, ''))}
          </blockquote>
        );
      }
      // Handle Bullets
      else if (cleanLine.startsWith('*') || cleanLine.startsWith('-')) {
        element = (
          <li className="list-disc ml-6 my-1.5 text-gray-300">
            {highlightAnchors(cleanLine.replace(/^[\*\-]\s*/, ''))}
          </li>
        );
      }
      // Standard Paragraph
      else {
        element = <p className="my-3 text-gray-300 leading-relaxed font-sans">{highlightAnchors(cleanLine)}</p>;
      }

      return <div key={idx}>{element}</div>;
    });
  };

  // Helper to highlight terms from vocabAnchors list
  const highlightAnchors = (text: string) => {
    if (vocabAnchors.length === 0) return text;
    
    // Sort anchors by length descending to match longer keywords first (e.g. 'photosynthetic' before 'photosynthesis')
    const sortedAnchors = [...vocabAnchors].sort((a, b) => b.length - a.length);
    const regexPattern = `\\b(${sortedAnchors.map(a => escapeRegExp(a)).join('|')})s?\\b`;
    const regex = new RegExp(regexPattern, 'gi');
    
    const parts = text.split(regex);
    if (parts.length <= 1) return text;

    return parts.map((part, index) => {
      const isMatch = sortedAnchors.some(anchor => 
        part.toLowerCase() === anchor.toLowerCase() || 
        part.toLowerCase() === (anchor + 's').toLowerCase()
      );
      
      if (isMatch) {
        return (
          <span 
            key={index} 
            onClick={(e) => {
              e.stopPropagation();
              handleAnchorClick(part);
            }}
            className="underline decoration-purple-500 decoration-2 underline-offset-2 cursor-pointer text-purple-300 font-semibold hover:bg-purple-500/20 px-0.5 rounded transition-colors"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  return (
    <div className={`text-slate-100 flex flex-col font-sans ${isEmbedded ? 'w-full' : 'min-h-screen bg-[#07070a]'}`}>
      
      {/* Header Navigator */}
      <header className="border-b border-gray-900 bg-gray-950/80 px-6 py-4 flex flex-wrap justify-between items-center sticky top-0 z-40 backdrop-blur-md">
        {!isEmbedded && (
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-purple-500" />
            <h1 className="text-lg font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
              DugsiAI Premium Reader
            </h1>
          </div>
        )}

        {/* Dashboard selectors */}
        <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-0">
          
          {/* Grade Select */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase text-gray-550 font-bold">Grade</span>
            <select 
              value={typeof selectedGrade === 'string' && selectedGrade.includes("Grade") ? Number(selectedGrade.replace(/\D/g, '')) || 10 : selectedGrade} 
              onChange={(e) => {
                setSelectedGrade(Number(e.target.value));
                resetContextualState();
              }}
              className="bg-gray-900 border border-gray-800 text-xs text-purple-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-purple-600 transition-colors"
            >
              {GRADES.map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>

          {/* Subject Select */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase text-gray-550 font-bold">Subject</span>
            <select 
              value={selectedSubject} 
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                resetContextualState();
              }}
              className="bg-gray-900 border border-gray-800 text-xs text-purple-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-purple-600 transition-colors"
            >
              {SUBJECTS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Language Select */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase text-gray-550 font-bold">Support Language</span>
            <select 
              value={supportLang} 
              onChange={(e) => setSupportLang(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-purple-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-purple-600 transition-colors"
            >
              {SUPPORT_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Chapter Select */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase text-gray-550 font-bold">Chapter</span>
            <select 
              value={chapterId} 
              onChange={(e) => {
                setChapterId(e.target.value);
                resetContextualState();
                const matchedChap = chapterList.find(c => c.id === e.target.value);
                if (matchedChap && matchedChap.lessons?.length > 0) {
                  setLessonId(matchedChap.lessons[0].id);
                } else {
                  setLessonId('general');
                }
              }}
              className="bg-gray-905 border border-gray-800 text-xs text-purple-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-purple-600 transition-colors max-w-[150px] truncate"
            >
              {chapterList.map((chap, idx) => (
                <option key={chap.id} value={chap.id}>Unit {chap.chapterNumber || (idx + 1)}: {chap.name}</option>
              ))}
              {chapterList.length === 0 && (
                <option value="general">General Unit</option>
              )}
            </select>

            {/* Mind Map toggle button */}
            <button
              onClick={() => setIsMindMapOpen(true)}
              className="bg-purple-950/50 hover:bg-purple-600 border border-purple-800/60 hover:border-purple-500 text-purple-300 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer font-medium"
              title="Toggle Mind Map Workspace"
            >
              <Network className="h-3.5 w-3.5" />
              <span>Mind Map</span>
            </button>
          </div>

          {/* Lesson Select */}
          {(() => {
            const currentChapterObj = chapterList.find(c => c.id === chapterId);
            const lessons = currentChapterObj?.lessons || [];
            if (lessons.length > 0) {
              return (
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase text-gray-550 font-bold">Lesson</span>
                  <select 
                    value={lessonId} 
                    onChange={(e) => {
                      setLessonId(e.target.value);
                      resetContextualState();
                    }}
                    className="bg-gray-900 border border-gray-800 text-xs text-purple-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-purple-600 transition-colors max-w-[150px] truncate"
                  >
                    {lessons.map((les: any) => (
                      <option key={les.id} value={les.id}>
                        {les.title}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
            return null;
          })()}

          {/* Dashboard Shortcut link */}
          <Link href="/dashboard" className="text-[11px] font-bold bg-purple-950/45 text-purple-300 border border-purple-800/40 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 cursor-pointer">
            <span>Dashboard</span>
          </Link>

        </div>
      </header>

      {/* Main layout container */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* Center column - Spacious Reading layout (Kindle/Notion feel) */}
        <div className="flex-1 overflow-auto flex justify-center py-10 px-6 sm:px-12 relative">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-3 h-64">
              <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
              <p className="text-xs text-gray-400">Loading customized textbook content...</p>
            </div>
          ) : (
            <div className="max-w-2xl w-full relative">
              
              {/* Floating micro-menu */}
              {floatingMenu.visible && (
                <div 
                  className="absolute bg-gray-900 border border-purple-800/40 rounded-lg p-1.5 shadow-2xl flex space-x-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150"
                  style={{ 
                    left: `${floatingMenu.x}px`, 
                    top: `${floatingMenu.y}px`, 
                    transform: 'translateX(-50%)' 
                  }}
                >
                  <button 
                    onClick={handleExplainSelection}
                    className="text-[10px] font-bold bg-purple-900/30 text-purple-300 hover:bg-purple-600 hover:text-white px-2 py-1 rounded transition-all flex items-center space-x-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Explain</span>
                  </button>
                  <button 
                    onClick={handleTranslateSelection}
                    className="text-[10px] font-bold bg-indigo-900/30 text-indigo-300 hover:bg-indigo-600 hover:text-white px-2 py-1 rounded transition-all flex items-center space-x-1"
                  >
                    <Languages className="h-3 w-3" />
                    <span>Translate</span>
                  </button>
                  <button 
                    onClick={handleAddNoteSelection}
                    className="text-[10px] font-bold bg-zinc-900 text-zinc-300 hover:bg-zinc-800 px-2 py-1 rounded transition-all"
                  >
                    + Note
                  </button>
                </div>
              )}

              {/* Title & Page Header */}
              <div className="flex justify-between items-center text-[11px] font-mono text-purple-400/80 mb-6 pb-2 border-b border-gray-900/60">
                <span className="uppercase tracking-widest">{selectedSubject} • Chapter {chapterId.toUpperCase().replace('_', ' ')}</span>
                <span>Page {pageNumber}</span>
              </div>

              {/* Connected Virtual Lab Banner Integration */}
              {(() => {
                const labMapping: { [key: string]: { path: string; title: string } } = {
                  '7-physics-les-buoyancy': { path: '/labs/grade7/physics/grade7_physics_buoyancy', title: 'Archimedes\' Buoyancy Lab' },
                  '9-physics-les-circuit': { path: '/labs/grade9/physics/grade9_physics_circuit', title: 'Kirchhoff\'s Electric Circuit Breadboard' },
                  '12-physics-les-projectile': { path: '/labs/grade12/physics/grade12_physics_projectile', title: 'Two-Dimensional Projectile Trajectory Lab' },
                  '9-biology-les-mitosis': { path: '/labs/grade9/biology/grade9_biology_mitosis', title: '3D Mitosis & Cell Division Simulator' },
                  '11-biology-les-genetics': { path: '/labs/grade11/biology/grade11_biology_genetics', title: 'Genetics & DNA Replication Lab' },
                  '10-biology-les-heart': { path: '/labs/grade10/biology/grade10_biology_heart', title: '3D Human Heart Anatomical Simulator' },
                  '10-chemistry-les-atom': { path: '/labs/grade10/chemistry/grade10_chemistry_atom', title: 'Bohr Atomic Orbitals Workspace' },
                  '10-chemistry-les-stoichiometry': { path: '/labs/grade10/chemistry/grade10_chemistry_stoichiometry', title: 'Chemical Reactions & Stoichiometry Lab' },
                  '12-chemistry-les-electrochemistry': { path: '/labs/grade12/chemistry/grade12_chemistry_galvanic', title: 'Galvanic Cells & Electrochemistry' },
                  '10-mathematics-les-quadratic': { path: '/labs/grade10/mathematics/grade10_mathematics_quadratic', title: 'Interactive Quadratic Graphs' },
                  '12-mathematics-les-calculus': { path: '/labs/grade12/mathematics/grade12_mathematics_calculus', title: 'Calculus Limit Tangents & Riemann Sums' },
                  '10-geography-les-topography': { path: '/labs/grade10/geography/grade10_geography_topography', title: '3D Contour Elevation Sandbox' }
                };
                const activeLab = labMapping[lessonId];
                if (!activeLab) return null;
                return (
                  <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-900/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/30">
                        🧪 Interactive Science Sandbox
                      </span>
                      <h4 className="text-sm font-black text-white">{activeLab.title}</h4>
                      <p className="text-gray-400 text-[10px]">Launch this Virtual Lab to run experiments and verify the equations in this lesson.</p>
                    </div>
                    <Link 
                      href={activeLab.path} 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all text-center flex items-center justify-center space-x-1 cursor-pointer shrink-0"
                    >
                      <span>Launch Lab</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })()}

              {/* Text Column Column */}
              <div 
                ref={textColumnRef} 
                onMouseUp={handleTextSelection}
                className="prose prose-invert max-w-none text-slate-200 select-text relative"
              >
                {renderReadableContent(pageContent)}
              </div>

              {/* Paging navigation footer */}
              <div className="flex justify-between items-center mt-12 pt-4 border-t border-gray-900">
                <button 
                  onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                  disabled={pageNumber <= 1}
                  className="flex items-center space-x-1.5 text-xs text-purple-400 disabled:text-gray-600 hover:text-purple-300 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous Page</span>
                </button>
                <span className="text-xs text-gray-500 font-mono">Page {pageNumber}</span>
                <button 
                  onClick={() => setPageNumber(prev => prev + 1)}
                  className="flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 cursor-pointer transition-colors"
                >
                  <span>Next Page</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Slide-over Overlay for vocabulary translations */}
        {isVocabLoading && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-950 border-l border-gray-900 shadow-2xl z-30 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 text-purple-500 animate-spin" />
          </div>
        )}

        {activeVocab && (
          <div className="absolute right-0 top-0 bottom-0 w-85 bg-[#0e0e13] border-l border-purple-900/20 shadow-2xl z-30 flex flex-col p-6 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-gray-900 pb-3 mb-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold font-mono">Curriculum Word ID</span>
                <h4 className="text-xl font-extrabold text-white capitalize mt-0.5">{activeVocab.term}</h4>
              </div>
              <button 
                onClick={() => setActiveVocab(null)}
                className="text-gray-500 hover:text-white bg-gray-900 p-1.5 rounded-lg border border-gray-800 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Definitions map */}
            <div className="flex-1 overflow-auto space-y-5 pr-1">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">English Definition</span>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">{activeVocab.definitions.en}</p>
              </div>

              {supportLang !== 'en' && (
                <div className="bg-purple-950/10 border border-purple-950/20 p-3.5 rounded-xl">
                  <span className="text-[10px] text-purple-400 uppercase tracking-widest font-extrabold font-mono">
                    {SUPPORT_LANGUAGES.find(l => l.code === supportLang)?.name} Translation
                  </span>
                  <p className="text-sm text-purple-100 font-medium mt-1 leading-relaxed">
                    {activeVocab.definitions[supportLang as keyof typeof activeVocab.definitions]}
                  </p>
                </div>
              )}

              {/* Context sentences */}
              <div className="border-t border-gray-900 pt-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono block mb-2">Usage Context</span>
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] text-gray-500 italic block">English sentence:</span>
                    <p className="text-xs text-gray-300 italic">"{activeVocab.context.example_sentences.en}"</p>
                  </div>
                  {supportLang !== 'en' && (
                    <div>
                      <span className="text-[9px] text-purple-500/80 italic block">Regional Translation:</span>
                      <p className="text-xs text-purple-300 italic">
                        "{activeVocab.context.example_sentences[supportLang as keyof typeof activeVocab.context.example_sentences]}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-900 text-center text-[10px] text-gray-600">
              National exam questions testing this term are indexed in the ESSLCE ledger database.
            </div>
          </div>
        )}

        {/* Side Panel: Sliding Canvas companion AI chatbot */}
        {isChatOpen ? (
          <div className="w-96 border-l border-gray-900 bg-[#0b0b0e] flex flex-col relative z-20 shadow-2xl">
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-900 flex justify-between items-center bg-gray-950/50">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-extrabold text-white">MacalinAI Tutor</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleRequestQuiz}
                  className="text-[10px] font-extrabold bg-purple-900/30 text-purple-300 hover:bg-purple-600 hover:text-white px-2.5 py-1 rounded-lg border border-purple-800/30 transition-all flex items-center space-x-1"
                  title="Generate Page Assessment"
                >
                  <CheckSquare className="h-3 w-3" />
                  <span>Test Me</span>
                </button>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-500 hover:text-white bg-gray-900 p-1.5 rounded-lg border border-gray-800 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-auto space-y-4">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-tr-none' 
                      : 'bg-gray-900 text-gray-300 border border-gray-850 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-900 text-gray-400 border border-gray-850 p-3 rounded-xl rounded-tl-none text-xs flex items-center space-x-2">
                    <RefreshCw className="h-3 w-3 animate-spin text-purple-500" />
                    <span>Analyzing active page content...</span>
                  </div>
                </div>
              )}

              {/* Adaptive Assessment loading state inside companion panel */}
              {quizLoading && !isQuizModalOpen && (
                <div className="border border-purple-950/20 bg-purple-950/5 p-4 rounded-xl space-y-2 text-center">
                  <RefreshCw className="h-5 w-5 text-purple-500 animate-spin mx-auto" />
                  <p className="text-[10px] text-purple-300 font-mono">Initializing adaptive test session...</p>
                </div>
              )}

            </div>

            {/* Chat Input form */}
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-gray-900 bg-gray-950/40 flex items-center space-x-2">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask your cognitive tutor..."
                disabled={isChatLoading}
                className="flex-1 bg-gray-900 border border-gray-850 rounded-xl text-xs px-3.5 py-2 text-slate-200 placeholder-gray-500 focus:outline-none focus:border-purple-600 transition-colors disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl disabled:opacity-50 disabled:hover:bg-purple-600 cursor-pointer transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="absolute right-6 bottom-6 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-2xl z-20 cursor-pointer transition-transform hover:scale-105"
            title="Open AI Companion"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        )}

      {/* Fullscreen Adaptive Assessment Modal Overlay */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-[#07070a]/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#0e0e13] border border-purple-900/30 rounded-2xl p-6 sm:p-8 flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-900 pb-4 mb-5">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold font-mono">
                  {selectedSubject.toUpperCase()} • ADAPTIVE ASSESSMENT
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Real-time Concept Calibration</h3>
              </div>
              <button 
                onClick={() => {
                  setIsQuizModalOpen(false);
                  if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                }}
                className="text-gray-500 hover:text-white bg-gray-900 p-1.5 rounded-lg border border-gray-800 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {quizLoading && !quizQuestion ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
                <p className="text-xs text-gray-400 font-mono">Formulating calibrated question via LLM...</p>
              </div>
            ) : quizQuestion ? (
              <div className="flex-1 flex flex-col">
                
                {/* Calibration Metrics Dashboard */}
                <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 bg-purple-950/20 border border-purple-900/20 px-3.5 py-2.5 rounded-xl mb-5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-gray-500">Tier:</span>
                    <span className="font-extrabold text-white bg-purple-900/40 px-1.5 py-0.5 rounded">
                      {quizQuestion.taxonomy_tier}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-gray-500">Difficulty:</span>
                    <span className="font-bold text-purple-200">
                      {quizResult ? quizResult.calibration.current_difficulty_level.toFixed(2) : quizQuestion.difficulty?.toFixed(2) || "1.00"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Timer:</span>
                    <span className="text-purple-400 font-bold">{timerSeconds.toFixed(1)}s</span>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <p className="text-slate-100 text-sm font-medium leading-relaxed">
                    {quizQuestion.text}
                  </p>
                </div>

                {/* Input Fields / Option Cards */}
                <div className="flex-1 overflow-auto pr-1 mb-6">
                  
                  {/* Multiple Choice */}
                  {quizQuestion.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 gap-2.5">
                      {quizQuestion.options?.map((opt: string) => {
                        const letter = opt.trim().charAt(0);
                        const isSelected = quizAnswer === letter;
                        const isCorrectAnswer = quizQuestion.correct_answer === letter;
                        
                        let cardClass = "border-gray-900 bg-gray-950 hover:bg-gray-900 text-slate-300";
                        if (isSelected) {
                          cardClass = "border-purple-600 bg-purple-900/10 text-purple-200 font-semibold";
                        }
                        if (quizSubmitted) {
                          if (isCorrectAnswer) {
                            cardClass = "border-emerald-600 bg-emerald-950/20 text-emerald-200 font-semibold";
                          } else if (isSelected) {
                            cardClass = "border-rose-600 bg-rose-950/20 text-rose-200";
                          }
                        }

                        return (
                          <button
                            key={opt}
                            disabled={quizSubmitted || quizLoading}
                            onClick={() => setQuizAnswer(letter)}
                            className={`text-left text-xs px-4 py-3 rounded-xl border transition-all flex items-center space-x-3 cursor-pointer ${cardClass}`}
                          >
                            <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-gray-900 text-[10px] font-bold border border-gray-800 shrink-0">
                              {letter}
                            </span>
                            <span>{opt.substring(2).trim()}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* True / False */}
                  {quizQuestion.type === 'true_false' && (
                    <div className="flex gap-4">
                      {['True', 'False'].map(val => {
                        const isSelected = quizAnswer === val;
                        const isCorrectAnswer = quizQuestion.correct_answer === val;
                        
                        let cardClass = "border-gray-900 bg-gray-950 hover:bg-gray-900 text-slate-300";
                        if (isSelected) {
                          cardClass = "border-purple-600 bg-purple-900/10 text-purple-200 font-semibold";
                        }
                        if (quizSubmitted) {
                          if (isCorrectAnswer) {
                            cardClass = "border-emerald-600 bg-emerald-950/20 text-emerald-200 font-semibold";
                          } else if (isSelected) {
                            cardClass = "border-rose-600 bg-rose-950/20 text-rose-200";
                          }
                        }

                        return (
                          <button
                            key={val}
                            disabled={quizSubmitted || quizLoading}
                            onClick={() => setQuizAnswer(val)}
                            className={`flex-1 text-center py-4 rounded-xl border text-xs cursor-pointer transition-all ${cardClass}`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Short Answer */}
                  {quizQuestion.type === 'short_answer' && (
                    <div className="space-y-3">
                      <input 
                        type="text"
                        placeholder="Type your response..."
                        disabled={quizSubmitted || quizLoading}
                        value={quizAnswer}
                        onChange={(e) => setQuizAnswer(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-900 rounded-xl text-xs px-4 py-3 text-slate-200 placeholder-gray-600 focus:outline-none focus:border-purple-800 transition-colors"
                      />
                      {quizSubmitted && (
                        <div className="p-3 bg-emerald-950/15 border border-emerald-900/20 rounded-xl text-xs text-emerald-300 flex items-start space-x-2">
                          <Check className="h-4 w-4 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold">Correct keyword target:</span> "{quizQuestion.correct_answer}"
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Visual Reinforcement Feedback Box */}
                  {quizSubmitted && quizResult && (
                    <div className="mt-5 animate-in slide-in-from-bottom-2 duration-200">
                      <div className={`p-4 rounded-xl border ${
                        quizResult.is_correct 
                          ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-100' 
                          : 'bg-rose-950/10 border-rose-900/30 text-rose-100'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {quizResult.is_correct ? (
                            <>
                              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                                Correct! ({quizResult.calibration.performance_streak} Streak 🔥)
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-rose-400" />
                              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest font-mono">
                                Incorrect (Streak Reset)
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          "{quizQuestion.explanation}"
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Buttons */}
                <div className="border-t border-gray-900 pt-4 flex space-x-3">
                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={quizLoading || !quizAnswer.trim()}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center shadow-lg shadow-purple-900/20"
                    >
                      {quizLoading ? "Evaluating..." : "Submit Answer"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleRequestQuiz}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center shadow-lg shadow-purple-900/20"
                      >
                        Next Question
                      </button>
                      <button
                        onClick={() => {
                          setIsQuizModalOpen(false);
                          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                        }}
                        className="px-4 bg-gray-900 hover:bg-gray-800 text-slate-300 text-xs font-bold py-3 rounded-xl border border-gray-800 transition-all cursor-pointer text-center"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-xs text-gray-500">
                Quiz could not be initialized. Please try again.
              </div>
            )}

          </div>
        </div>
      )}

      {/* Mind Map Modal Overlay */}
      {isMindMapOpen && (
        <MindMapWorkspace
          activeChapter={chapterList.find(c => c.id === chapterId) || (chapterId === 'general' ? { id: 'general', name: 'General Unit', chapterNumber: 1, lessons: [] } : { id: chapterId, name: 'Active Chapter', lessons: [] })}
          pageContent={pageContent}
          onClose={() => setIsMindMapOpen(false)}
          onSelectLesson={(lesId) => {
            setLessonId(lesId);
            resetContextualState();
          }}
        />
      )}

      </main>
    </div>
  );
}

export default PremiumReader;
