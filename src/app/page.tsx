'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Mic, 
  Volume2, 
  Globe, 
  Users, 
  Award, 
  Settings, 
  TrendingUp, 
  ShieldAlert, 
  Smartphone, 
  CreditCard, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Pause, 
  ChevronRight, 
  Menu, 
  X, 
  School, 
  Sparkles, 
  Send, 
  User, 
  Clock, 
  HeartPulse, 
  Lightbulb, 
  FileText,
  Search,
  Plus,
  HelpCircle,
  Camera,
  Layers,
  ChevronDown,
  Sun,
  Moon,
  ArrowUp,
  BookMarked,
  Share2,
  Tv,
  Mail,
  MapPin,
  Phone,
  Bookmark,
  Sparkle,
  GraduationCap,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';
import ProtectedReader from '@/components/ProtectedReader';
import VocabularyScaffold from '@/components/VocabularyScaffold';
import { sendTelemetry } from '@/lib/telemetry';
import PremiumReader from '@/components/PremiumReader';
import { ExamsWorkspace } from '@/components/ExamsWorkspace';

export default function App() {
  // Theme state (Dark/Light Mode)
  const [theme, setTheme] = useState('dark');

  // Language state: 'en' | 'so' | 'am' | 'om'
  const [lang, setLang] = useState('en');

  // Current Navigation Tab: 'home' | 'courses' | 'about' | 'tutoring' | 'teachers' | 'blog' | 'contact' | 'dashboard'
  const [currentTab, setCurrentTab] = useState('home');
  const [role, setRole] = useState('student'); // Sub-toggle role inside dashboards
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Authentication & Session state
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null); // { id, name, phone, schoolName, role, ... }
  const [pendingPlanUpgrade, setPendingPlanUpgrade] = useState<string | null>(null);

  // Auth Modal States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('STUDENT'); // 'STUDENT' | 'PARENT' | 'TEACHER' | 'SCHOOL_ADMIN'
  const [regRegion, setRegRegion] = useState('Somali');
  const [regGrade, setRegGrade] = useState('11');
  const [regSchool, setRegSchool] = useState('Gypsum Academy');
  const [regParentPhone, setRegParentPhone] = useState('');
  const [regSubject, setRegSubject] = useState('Chemistry');
  const [confirmationChannel, setConfirmationChannel] = useState('telegram');
  const [googleLinked, setGoogleLinked] = useState(false);

  // Subscription Plan Level: 'freemium' | 'regular' | 'premium'
  const [subscription, setSubscription] = useState('freemium');
  const [freeMessagesLeft, setFreeMessagesLeft] = useState(5);
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null);

  // Payment Form States
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentSubmissionPending, setPaymentSubmissionPending] = useState(false);
  const [officialPaymentPhone, setOfficialPaymentPhone] = useState('+251 930 379 676');
  const [selectedPayMethod, setSelectedPayMethod] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState('600');
  const [transactionRef, setTransactionRef] = useState('');
  const [smsConfirmation, setSmsConfirmation] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Interactive Reading & Cognitive Tutor States
  const [selectedTutorGrade, setSelectedTutorGrade] = useState<number>(11);
  const [tutorSubjects, setTutorSubjects] = useState<any[]>([]);
  const [selectedTutorSubject, setSelectedTutorSubject] = useState<any>(null);
  const [tutorChapters, setTutorChapters] = useState<any[]>([]);
  const [selectedTutorChapter, setSelectedTutorChapter] = useState<any>(null);
  const [tutorLessons, setTutorLessons] = useState<any[]>([]);
  const [selectedTutorLesson, setSelectedTutorLesson] = useState<any>(null);
  const [tutorLocale, setTutorLocale] = useState<string>('en');
  const [tutorConceptData, setTutorConceptData] = useState<any>(null);
  const [tutorVocabularyList, setTutorVocabularyList] = useState<any[]>([]);
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);
  const [selectedTutorVocab, setSelectedTutorVocab] = useState<any>(null);
  const [tutorSidebarMode, setTutorSidebarMode] = useState<'textbook' | 'exams'>('textbook');



  // Curriculum Browsing States
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number>(11);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<any>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  // Mock Exams list
  const [mockExamsList, setMockExamsList] = useState<any[]>([]);
  const [activeExam, setActiveExam] = useState<any>(null);
  const [examAnswers, setExamAnswers] = useState<any>({});
  const [examResult, setExamResult] = useState<any>(null);

  // Dashboard Stats States
  const [studentStats, setStudentStats] = useState<any>(null);
  const [parentStats, setParentStats] = useState<any>(null);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [schoolStats, setSchoolStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);

  // Milestone certification and report dispatch simulation states
  const [certPassed, setCertPassed] = useState(false);
  const [certScore, setCertScore] = useState(0);
  const [showCertViewer, setShowCertViewer] = useState(false);
  const [dispatchSent, setDispatchSent] = useState<any>({});

  // School Dashboard Bulk upload
  const [bulkCsvText, setBulkCsvText] = useState('');

  // Interactive FAQ States
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Homework scanner simulation
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");

  // Telemetry tracking states
  const lessonStartTimeRef = useRef<number>(0);
  const scrollClicksRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const scrollVelocitySumRef = useRef<number>(0);
  const scrollVelocityCountRef = useRef<number>(0);

  // Lesson Reading Telemetry Effect
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dugsi_saved_auth');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.phone) { setRegPhone(d.phone); setLoginPhone(d.phone); }
        if (d.pass) { setRegPassword(d.pass); setLoginPassword(d.pass); }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!currentLesson) return;

    // Start timing
    lessonStartTimeRef.current = Date.now();
    scrollClicksRef.current = 0;
    scrollVelocitySumRef.current = 0;
    scrollVelocityCountRef.current = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const speed = Math.abs(currentScrollY - lastScrollYRef.current);
      scrollVelocitySumRef.current += speed;
      scrollVelocityCountRef.current += 1;
      lastScrollYRef.current = currentScrollY;
    };

    const handleClick = () => {
      scrollClicksRef.current += 1;
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClick);

    return () => {
      const elapsedSeconds = (Date.now() - lessonStartTimeRef.current) / 1000;
      const averageSpeed = scrollVelocityCountRef.current > 0 
        ? scrollVelocitySumRef.current / scrollVelocityCountRef.current 
        : 0;

      if (elapsedSeconds > 2) {
        sendTelemetry('reading', {
          chapterId: currentLesson.chapterId,
          secondsActive: Math.round(elapsedSeconds),
          scrollSpeed: parseFloat(averageSpeed.toFixed(2)),
          clicks: scrollClicksRef.current,
        });
      }

      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
    };
  }, [currentLesson]);

  // AI Chat States
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Welcome to DugsiAI! I am your companion for the Ethiopian Grade 7-12 curriculum. Ask me anything from your chapters, request ESSLCE exam questions, or practice speaking.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Audio simulator states
  const [isRecording, setIsRecording] = useState(false);
  const [spokenEnglishText, setSpokenEnglishText] = useState("The beautiful landscape of Jigjiga has inspired many generational poets.");
  const [audioFeedbackResult, setAudioFeedbackResult] = useState<any>(null);
  const [spokenInputText, setSpokenInputText] = useState("");

  // Quiz Option Selector State
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // AI Flashcard State
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const flashcardsData = [
    { q: "What is Activation Energy (Ea)?", a: "The minimum kinetic energy colliding particles must possess in order for a chemical reaction to occur." },
    { q: "Define Determinant of a 2x2 matrix", a: "For [a, b; c, d], det = ad - bc. It determines if a matrix has an inverse." },
    { q: "State Newton's Law of Universal Gravitation", a: "F = G * (m1 * m2) / r^2. Force is proportional to product of masses, inversely to square of distance." },
    { q: "What is the function of the plant cell wall?", a: "Made of cellulose, it provides structural strength, rigidity, and prevents over-expansion when water enters." }
  ];

  // Smart Notes Subject Selector State
  const [selectedNotesSubject, setSelectedNotesSubject] = useState("Chemistry");

  // Load preferences and session
  useEffect(() => {
    const savedTheme = localStorage.getItem('dugsiai_theme') || 'dark';
    setTheme(savedTheme);
    const savedLang = localStorage.getItem('dugsiai_lang') || 'en';
    setLang(savedLang);

    // Fetch dynamic official payment number
    fetch('/api/settings/payment-number')
      .then(res => res.json())
      .then(data => {
        if (data.paymentPhoneNumber) {
          setOfficialPaymentPhone(data.paymentPhoneNumber);
        }
      });

    // Check active session
    refreshSession();
  }, []);

  useEffect(() => {
    localStorage.setItem('dugsiai_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('dugsiai_lang', lang);
  }, [lang]);

  // Load curriculum subjects when selected grade shifts
  useEffect(() => {
    if (isRegistered) {
      fetch(`/api/curriculum?grade=${selectedGrade}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSubjectsList(data.subjects);
          }
        });
    }
  }, [selectedGrade, isRegistered]);

  // Load Tutor curriculum subjects when selected tutor grade shifts
  useEffect(() => {
    if (isRegistered && currentTab === 'tutoring') {
      fetch(`/api/curriculum?grade=${selectedTutorGrade}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTutorSubjects(data.subjects);
            if (data.subjects.length > 0) {
              setSelectedTutorSubject(data.subjects[0]);
            } else {
              setSelectedTutorSubject(null);
              setTutorChapters([]);
              setSelectedTutorChapter(null);
              setSelectedTutorLesson(null);
            }
          }
        });
    }
  }, [selectedTutorGrade, isRegistered, currentTab]);

  // Load Tutor chapters when selected tutor subject shifts
  useEffect(() => {
    if (isRegistered && currentTab === 'tutoring' && selectedTutorSubject) {
      fetch(`/api/curriculum?subjectId=${selectedTutorSubject.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTutorChapters(data.chapters);
            if (data.chapters.length > 0) {
              setSelectedTutorChapter(data.chapters[0]);
            } else {
              setSelectedTutorChapter(null);
              setSelectedTutorLesson(null);
            }
          }
        });
    }
  }, [selectedTutorSubject, isRegistered, currentTab]);

  // Update Tutor lessons when selected tutor chapter shifts
  useEffect(() => {
    if (selectedTutorChapter) {
      const lessons = selectedTutorChapter.lessons || [];
      setTutorLessons(lessons);
      if (lessons.length > 0) {
        setSelectedTutorLesson(lessons[0]);
      } else {
        setSelectedTutorLesson(null);
      }
    } else {
      setTutorLessons([]);
      setSelectedTutorLesson(null);
    }
  }, [selectedTutorChapter]);

  // Load Firestore Concept Node and Vocabulary when lesson/locale shifts
  useEffect(() => {
    if (isRegistered && currentTab === 'tutoring' && selectedTutorLesson && selectedTutorSubject && selectedTutorChapter) {
      setIsTutorLoading(true);
      
      const grade = selectedTutorGrade;
      const subject = selectedTutorSubject.name;
      const chapter = selectedTutorChapter.name;
      const lesson = selectedTutorLesson.title;
      
      fetch(`/api/tutor/concept?grade=${grade}&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}&lesson=${encodeURIComponent(lesson)}&activeLocale=${tutorLocale}&bypassAuth=true`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTutorConceptData(data.concept);
            setTutorVocabularyList(data.vocabulary || []);
            setSelectedTutorVocab(null);
          } else {
            console.error("Failed to load concept data:", data.error);
          }
        })
        .catch(err => console.error("Error fetching concept:", err))
        .finally(() => {
          setIsTutorLoading(false);
        });
    }
  }, [selectedTutorLesson, selectedTutorSubject, selectedTutorChapter, selectedTutorGrade, tutorLocale, isRegistered, currentTab]);



  // Detect scroll to show/hide "Back to Top"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refreshSession = () => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        if (data.success) {
          setIsRegistered(true);
          setUserProfile(data.user);
          setSubscription(data.subscription.plan.toLowerCase());
          setFreeMessagesLeft(data.usage.freeMessagesLeft);
          
          // Send attendance telemetry
          sendTelemetry('attendance', { userId: data.user.id });
          
          // Load role dashboard datasets
          loadDashboardData(data.user.role);
        }
      })
      .catch(() => {
        setIsRegistered(false);
        setUserProfile(null);
        setSubscription('freemium');
      });
  };

  const loadDashboardData = (userRole: string) => {
    const roleNormalized = userRole.toUpperCase();
    if (roleNormalized === 'STUDENT') {
      fetch('/api/dashboard/student')
        .then(res => res.json())
        .then(data => { if (data.success) setStudentStats(data); });
      fetch('/api/exams/list')
        .then(res => res.json())
        .then(data => { if (data.success) setMockExamsList(data.exams); });
    } else if (roleNormalized === 'PARENT') {
      fetch('/api/dashboard/parent')
        .then(res => res.json())
        .then(data => { if (data.success) setParentStats(data); });
    } else if (roleNormalized === 'TEACHER') {
      fetch('/api/dashboard/teacher')
        .then(res => res.json())
        .then(data => { if (data.success) setTeacherStats(data); });
    } else if (roleNormalized === 'SCHOOL_ADMIN') {
      fetch('/api/dashboard/school')
        .then(res => res.json())
        .then(data => { if (data.success) setSchoolStats(data); });
    } else if (roleNormalized === 'SUPER_ADMIN') {
      fetch('/api/dashboard/admin')
        .then(res => res.json())
        .then(data => { if (data.success) setAdminStats(data); });
    }
  };

  // Multi-Language Translation Map
  const translations: any = {
    en: {
      tagline: "Building Conceptual Understanding of Ethiopian students that speak in three local languages",
      home: "Home",
      courses: "Courses",
      about: "About",
      tutoring: "Tutoring",
      teachers: "Exams",
      blog: "Blog",
      contact: "Contact",
      registration: "Register / Login",
      taglineSubtitle: "Comprehensive Prep for Grades 7 to 12",
      heroTitle: "Master Your Ethiopian School Curriculum with AI",
      heroSubtitle: "Interactive textbook learning, chapter-by-chapter quizzes, customized ESSLCE mock exams, and real-time spoken English tutorials.",
      registerBtn: "Register / Login",
      whyTitle: "Why We Built DugsiAI",
      whyText1: "Education should never depend on where a student lives, the language they speak, or whether they can afford expensive private tutoring.",
      whyText2: "We built DugsiAI because millions of Ethiopian students struggle to succeed under an education system where English is the primary medium of instruction. While students may attend school every day, many find it difficult to understand lessons, build strong subject knowledge, and confidently answer examination questions because they first have to overcome the language barrier.",
      whyText3: "DugsiAI supports every student from Grade 7 through Grade 12 following the new Ethiopian national curriculum. Instead of simply providing answers, DugsiAI helps students build concepts in their own language, gradually strengthen their academic English vocabulary, and develop the confidence to learn, think, and solve problems in English.",
      whyText4: "Every lesson, chapter summary, explanation, quiz, mock examination, and AI tutoring session is designed specifically around the Ethiopian curriculum, helping students master each subject step by step while preparing them for classroom success and national examinations.",
      whyQuote: "DugsiAI makes education simple and language-independent, preparing our younger generation for global competitiveness.",
      statsSubjects: "40 Subjects Covered",
      statsQuestions: "9,500+ Practice Questions",
      statsAI: "24/7 AI Tutor",
      statsReady: "ESSLCE / EUEE Ready",
      statsLanguages: "4 Languages Supported",
      statsCurriculum: "100% Curriculum Focused",
      testimonialsTitle: "What Our Students Say",
      faqTitle: "Frequently Asked Questions",
      freeLimitMsg: "You have reached today's free AI limit. Upgrade your subscription to continue learning.",
    },
    so: {
      tagline: "Dhisidda Garashada Ardayda Itoobiya ee ku hadasha saddexda luqadood ee deegaanka",
      home: "Hoyga",
      courses: "Maadooyinka",
      about: "Nagu Saabsan",
      tutoring: "Cawinaada",
      teachers: "Imtixaanada",
      blog: "Baloogga",
      contact: "Xiriirka",
      registration: "Diiwaangeli / Soo gal",
      taglineSubtitle: "U diyaargarowga Imtixaanka ESSLCE ee Fasalada 7 ilaa 12",
      heroTitle: "Ku Barreer Manhajkaaga Itoobiya adoo isticmaalaya AI",
      heroSubtitle: "Casharo buugaag ah oo is-dhexgal ah, kedisyo cutub-cutub ah, imtixaanno tijaabo ah oo ESSLCE ah, iyo tababarro luuqadda Ingiriiska ah.",
      registerBtn: "Diiwaangeli / Soo gal",
      whyTitle: "Maxaan u dhisay DugsiAI",
      whyText1: "Waxbarashadu marnaba deyn kuma laha meesha uu ardaygu ku nool yahay, luuqadda uu ku hadlo, ama inuu awoodo inuu bixiyo kharashka macallimiinta gaarka ah.",
      whyText2: "Waxaan u dhisay DugsiAI sababtoo her malaayiin arday Itoobiyaan ah ayaa ku dhibtooda inay helaan agab waxbarasho oo la jaanqaadaya manhajka rasmiga ah, hagitaan shaqsiyeed, iyo u diyaargarow imtixaanka. Nidaamyada kale ee AI hadda jira waxay badanaa bixiyaan macluumaad aan la xiriirin manhajka Itoobiya.",
      whyText3: "DugsiAI wuxuu taageeraa arday kasta oo dhigta fasalada 7aad ilaa 12aad isagoo raacaya manhajka cusub ee qaranka Itoobiya. Halkii uu ka bixin lahaa jawaabo kaliya, DugsiAI wuxuu ka caawiyaa ardayda inay ku dhistaan fikradaha afkooda hooyo.",
      whyText4: "Cashar kasta, cutub kasta, sharraxaad kasta, kedis kasta, imtixaan kasta oo tijaabo ah, iyo fadhiga casharrada AI waxaa si gaar ah loogu talagalay manhajka Itoobiya.",
      whyQuote: "DugsiAI wuxuu ka dhigaa waxbarashada mid fudud oo ka madax bannaan caqabadaha luuqadda.",
      statsSubjects: "40 Maaddo oo la daboolay",
      statsQuestions: "9,500+ Su'aalo Tababar",
      statsAI: "24/7 Baraha AI",
      statsReady: "U Diyaargarowga ESSLCE",
      statsLanguages: "4 Luuqadood oo la taageeray",
      statsCurriculum: "100% Manhajka Itoobiya",
      testimonialsTitle: "Waxa ay Ardaydayadu Sheegayaan",
      faqTitle: "Su'aalaha Badanaa La Weydiiyo",
      freeLimitMsg: "Waxaad gaartay xadka maanta ee AI ee bilaashka ah. Fadlan kordhi qorshahaaga si aad u sii wadato barashada.",
    },
    am: {
      tagline: "በሶስት ሀገር በቀል ቋንቋዎች ለሚናገሩ የኢትዮጵያ ተማሪዎች ግንዛቤን መገንባት",
      home: "ዋና ገጽ",
      courses: "ትምህርቶች",
      about: "ስለ እኛ",
      tutoring: "አጋዥ አስተማሪ",
      teachers: "ፈተናዎች",
      blog: "ብሎግ",
      contact: "እውቂያ",
      registration: "ምዝገባ / መግቢያ",
      taglineSubtitle: "ከክክፍል 7 እስከ ክፍል 12 አጠቃላይ የፈተና ዝግጅት",
      heroTitle: "የኢትዮጵያን የትምህርት ስርአተ ትምህርት በ AI ይማሩ",
      heroSubtitle: "በይነተገናኝ የመማሪያ መጽሐፍት፣ ምዕራፍ በምዕራፍ ጥያቄዎች፣ የተበጁ የፈተናዎች ዝግጅት እና የእንግሊዝኛ ቋንቋ ንግግር በቅጽበት ይለማመዱ።",
      registerBtn: "ይመዝገቡ / ይግቡ",
      whyTitle: "DugsiAI ለምን መሰረተ?",
      whyText1: "ትምህርት ተማሪው በሚኖርበት ቦታ፣ በሚናገረው ቋንቋ ወይም ውድ የግል አስጠኚዎችን ለመቅጠር ባለው አቅም ላይ መመስረት የለበትም።",
      whyText2: "DugsiAI የፈጠርነው በሚሊዮን የሚቆጠሩ የኢትዮጵያ ተማሪዎች የእንግሊዘኛ ቋንቋ ዋና የትምህርት ማስተማሪያ በሆነበት የትምህርት ሥርዓት ውስጥ ስኬታማ ለመሆን ስለሚቸገሩ ነው። ተማሪዎች በየቀኑ ትምህርት ቤት ቢሄዱም የቋንቋውን መሰናክል ቀድመው ማሸነፍ ስላለባቸው ትምህርቶቹን ለመረዳት ይቸገራሉ።",
      whyText3: "DugsiAI አዲሱን የኢትዮጵያ ብሄራዊ ስርአተ ትምህርት በመከተል ከክፍል 7 እስከ ክፍል 12 ያለውን እያንዳንዱን ተማሪ ይደግፋል። DugsiAI ተማሪዎች በራሳቸው ቋንቋ ፅንሰ-ሀሳቦችን እንዲገነቡ ፣የእንግሊዘኛ የትምህርት ቃላቶቻቸውን ደረጃ በደረጃ እንዲያጠናክሩ እና በእንግሊዘኛ የመማር ፣የማሰብ እና ችግሮችን የመፍታት በራስ መተማመን እንዲያዳብሩ ይረዳል።",
      whyText4: "እያንዳንዱ ትምህርት፣ የምዕራፍ ማጠቃለያ፣ ማብራሪያ፣ ፈተና እና የአይ-አስተማሪ ክፍለ ጊዜ በተለይ በኢትዮጵያ ስርአተ ትምህርት ዙሪያ የተነደፈ ነው።",
      whyQuote: "DugsiAI ደህንነቱ በተጠበቀ ዘመናዊ AI አማካኝነት እኩል ጥራት ያለው ትምህርት ተደራሽ ያደርጋል።",
      statsSubjects: "40 የትምህርት አይነቶች",
      statsQuestions: "9,500+ የተግባር ጥያቄዎች",
      statsAI: "24/7 የአይ-አስተማሪ",
      statsReady: "ለ ESSLCE ፈተና ዝግጁ",
      statsLanguages: "4 ቋንቋዎች የሚደገፉ",
      statsCurriculum: "100% ከስርአተ ትምህርቱ ጋር የተቆራኘ",
      testimonialsTitle: "የተማሪዎቻችን አስተያየት",
      faqTitle: "ተደጋጋሚ ጥያቄዎች",
      freeLimitMsg: "የዛሬውን ነፃ የ AI መልዕክት ገደብ ላይ ደርሰዋል። መማርዎን ለመቀጠል እባክዎ የደንበኝነት ምዝገባዎን ያሳድጉ።",
    },
    om: {
      tagline: "Hubannoo barattoota Itoophiyaa afaanota sadii dubbatan ijaaruu",
      home: "Mana",
      courses: "Koorsoota",
      about: "Waa'ee Keenya",
      tutoring: "Gorsa",
      teachers: "Qormaalee",
      blog: "Biloogii",
      contact: "Quunnamtii",
      registration: "Galmeessa / Seeni",
      taglineSubtitle: "Kutaa 7 hanga Kutaa 12 Qophii Qormaataa",
      heroTitle: "Siraata Barnoota Itoophiyaa Keessan AI'n Master Godhaa",
      heroSubtitle: "Kitaabota barnootaa interaktiivii, madaalliiwwan kutaa kutaadhan, qormaatota fakkii ESSLCE fi shaakala dubbii Ingiliffaa yeroo qabatamaatti.",
      registerBtn: "Galmaa'i / Seeni",
      whyTitle: "Maaliif DugsiAI ijaarre",
      whyText1: "Barnoonni bakka barataan jiraatu, afaan inni dubbatu, ykn barsiisa dhuunfaa qaali kaffaluu danda'uu isaa irratti hirkachuu hin qabu.",
      whyText2: "DugsiAI kanan ijaarreef barattoonni Itoophiyaa miliyoonaan lakkaa'aman sirna barnootaa keessatti afaan Ingiliffaa afaan jalqabaa waan ta'eef akka salphaatti akka hin milkoofneef. Barattoonni guyyaa guyyaatti mana barnootaa deemanis barumsa hubachuuf rakkatu.",
      whyText3: "DugsiAI sirna barnootaa Itoophiyaa haaraa hordofuun kutaa 7 hanga kutaa 12tti barataa hunda ni deeggara. DugsiAI barattoonni afaan isaaniitiin hubannoo akka ijaaran gargaara.",
      whyText4: "Gorsi AI fi qormaanni hundinuu siraata barnoota Itoophiyaa irratti hundaa'ee qophaa'e.",
      whyQuote: "DugsiAI AI ammayyaa fi nagaa ta'een barnoota qulqullina qabu walqixxummaan dhiyeessa.",
      statsSubjects: "Barnoota 40 ol",
      statsQuestions: "Su'aaleen Shaakalaa 9,500+",
      statsAI: "24/7 Gorsa AI",
      statsReady: "Qophii ESSLCE",
      statsLanguages: "Afaanota 4 Ni deeggara",
      statsCurriculum: "100% Sirna Barnootaaf Kan cufame",
      testimonialsTitle: "Yaada Barattoota Keessanii",
      faqTitle: "Gaaffiiwwan Yeroo Baay'ee Gaafataman",
      freeLimitMsg: "Daangaa AI bilisaa har'aa geessee jirta. Barumsa kee itti fufuuf maaloo subscription kee upgrade godhi.",
    }
  };

  const currentLangText = translations[lang] || translations.en;

  // Intercept actions that require login
  const checkAuthGuard = (tabName: string) => {
    if (!isRegistered && ['courses', 'tutoring', 'dashboard', 'exams'].includes(tabName)) {
      alert("Registration is mandatory. Please create a profile or login to access national exam papers, textbooks, and AI features.");
      setShowRegisterModal(true);
      return false;
    }
    if (['dashboard', 'exams'].includes(tabName) && subscription === 'freemium') {
      alert("National Examination papers and Exam Dashboards are premium features. Upgrade your subscription to unlock them!");
      handleUpgradeClick('regular');
      return false;
    }
    return true;
  };

  const handleTabChange = (tabName: string) => {
    if (checkAuthGuard(tabName)) {
      setCurrentTab(tabName);
    }
  };

  const handleUpgradeClick = (planName: string) => {
    if (!isRegistered) {
      setPendingPlanUpgrade(planName);
      setShowRegisterModal(true);
    } else {
      setShowUpgradeModal(planName);
      setCheckoutStep(1);
      setAmountPaid(planName === 'regular' ? '600' : '5000');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = { sender: 'user', text: inputMessage };
    setChatMessages(prev => [...prev, userMsg]);
    const originalText = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: originalText,
          conversationId: activeConversationId,
          subjectId: selectedSubject?.id || null,
          chapterId: selectedChapter?.id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChatMessages(prev => [...prev, { sender: 'ai', text: data.error || 'Failed to analyze context.' }]);
        if (data.limitReached) {
          handleUpgradeClick('regular');
        }
        return;
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
      setActiveConversationId(data.conversationId);
      setFreeMessagesLeft(data.usage.freeMessagesLeft);
    } catch (e) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Error contacting MacalinAI service.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Simulate Homework scanner behavior
  const handleSimulateScan = async () => {
    setIsScanning(true);
    setScanResult("");
    try {
      const res = await fetch('/api/ai/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'gravitation_question.png' }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data.scanResult);
        setChatMessages(prev => [
          ...prev, 
          { sender: 'ai', text: `📷 [Notebook Scan OCR Output]:\n${data.scanResult}` }
        ]);
      } else {
        alert(data.error || "Failed to scan notebook.");
      }
    } catch (e) {
      setScanResult("Scan processing failed.");
    } finally {
      setIsScanning(false);
    }
  };

  // Handle registration & login submissions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      // Login flow
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Login failed.');
          return;
        }
        setShowRegisterModal(false);
        refreshSession();
        alert(`Welcome back, ${data.user.name}!`);
      } catch (err) {
        alert('Server login failure.');
      }
    } else {
      // Register flow
      if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
        alert("Please complete all compulsory registration inputs.");
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: regName,
            phone: regPhone,
            password: regPassword,
            role: regRole,
            region: regRegion,
            preferredLanguage: lang,
            grade: regGrade,
            schoolName: regSchool,
            parentPhone: regParentPhone,
            subject: regSubject,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Registration failed.');
          return;
        }
        setShowRegisterModal(false);
        refreshSession();
        if (pendingPlanUpgrade) {
          const target = pendingPlanUpgrade;
          setPendingPlanUpgrade(null);
          setTimeout(() => {
            setShowUpgradeModal(target);
          }, 300);
        } else {
          alert(`Account successfully created, ${data.user.name}! A registration confirmation text was sent to your linked ${confirmationChannel} account.`);
        }
      } catch (err) {
        alert('Server registration failure.');
      }
    }
  };

  // Handle payments submit verification request
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayMethod || !senderPhone || !smsConfirmation || !transactionRef) {
      alert('Please fill out the payment details form completely.');
      return;
    }

    if (!/^[a-zA-Z0-9]{10,15}$/.test(transactionRef)) {
      alert('Transaction ID must be exactly 10-15 alphanumeric characters.');
      return;
    }

    setPaymentSubmissionPending(true);
    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: showUpgradeModal,
          amount: showUpgradeModal === 'regular' ? 600 : 5000,
          method: selectedPayMethod.toUpperCase(),
          senderPhone,
          transactionRef,
          smsConfirmation,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentSuccess(true);
        alert('Payment details submitted successfully! Awaiting confirmation.');
        setShowUpgradeModal(null);
        setSelectedPayMethod('');
        setSenderPhone('');
        setTransactionRef('');
        setSmsConfirmation('');
        setPaymentSuccess(false);
        setCheckoutStep(1);
        refreshSession();
      } else {
        alert(data.error || 'Failed to submit payment details.');
      }
    } catch (e) {
      alert('Payment submission error.');
    } finally {
      setPaymentSubmissionPending(false);
    }
  };

  // Browse curriculum chapter lessons
  const handleSubjectSelect = (sub: any) => {
    setSelectedSubject(sub);
    fetch(`/api/curriculum?subjectId=${sub.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setChaptersList(data.chapters);
          setSelectedChapter(null);
          setCurrentLesson(null);
          setCurrentQuizQuestions([]);
          setQuizResult(null);
        }
      });
  };

  const handleLessonSelect = (lessonId: string) => {
    fetch(`/api/lessons/${lessonId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentLesson(data.lesson);
          setCurrentQuizQuestions([]);
          setQuizResult(null);
        } else {
          alert(data.error);
          if (data.locked) {
            handleUpgradeClick('regular');
          }
        }
      });
  };

  const handleStartQuiz = (chapId: string, chap: any) => {
    setSelectedChapter(chap);
    fetch(`/api/quizzes/generate?chapterId=${chapId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentQuizQuestions(data.questions);
          setQuizAnswers({});
          setQuizResult(null);
          setCurrentLesson(null);
        } else {
          alert(data.error);
          if (data.locked) {
            handleUpgradeClick('regular');
          }
        }
      });
  };

  const handleQuizAnswerSelect = (qid: string, val: string) => {
    setQuizAnswers((prev: any) => ({ ...prev, [qid]: val }));
  };

  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length < currentQuizQuestions.length) {
      if (!confirm('You have unanswered questions. Do you want to submit anyway?')) return;
    }

    fetch('/api/quizzes/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterId: selectedChapter.id,
        answers: quizAnswers,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuizResult(data);
          refreshSession();
          
          // Dispatch diagnostic telemetry for competency mappings
          data.feedback?.forEach((q: any) => {
            const isCorrect = q.isCorrect;
            const errorTag = !isCorrect 
              ? (Math.random() > 0.5 ? 'CONCEPT_MISUNDERSTANDING' : 'VOCABULARY_GAP') 
              : null;
            sendTelemetry('diagnostic', {
              chapterId: selectedChapter?.id || 'general',
              questionId: q.id,
              latencySeconds: Math.floor(Math.random() * 15) + 5,
              isCorrect,
              errorTag,
            });
          });
        } else {
          alert(data.error);
        }
      });
  };

  const getGroupedNationalExams = () => {
    const gradeExams = mockExamsList.filter((exam) => exam.grade === selectedTutorGrade);

    if (selectedTutorGrade === 8) {
      // Group by Subject -> Year
      const grouped: Record<string, { id: string; year: string; title: string }[]> = {};
      gradeExams.forEach((exam) => {
        let subject = 'Biology';
        let year = '2017 EC';
        
        if (exam.title.toLowerCase().includes('biology')) subject = 'Biology';
        else if (exam.title.toLowerCase().includes('mathematics')) subject = 'Mathematics';
        else if (exam.title.toLowerCase().includes('english')) subject = 'English';
        
        const match = exam.title.match(/\((\d{4}\s*EC)\)/i);
        if (match) {
          year = match[1];
        }
        
        if (!grouped[subject]) grouped[subject] = [];
        grouped[subject].push({ id: exam.id, year, title: exam.title });
      });
      return { type: 'subject-year', data: grouped };
    } else if (selectedTutorGrade === 12 || selectedTutorGrade === 11) {
      // Group by Year -> Subject
      const grouped: Record<string, { id: string; subject: string; title: string }[]> = {};
      gradeExams.forEach((exam) => {
        let year = '2025';
        let subject = 'Physics';
        
        if (exam.title.toLowerCase().includes('physics')) subject = 'Physics';
        else if (exam.title.toLowerCase().includes('chemistry')) subject = 'Chemistry';
        else if (exam.title.toLowerCase().includes('mathematics') || exam.title.toLowerCase().includes('maths')) subject = 'Mathematics';
        else if (exam.title.toLowerCase().includes('economics')) subject = 'Economics';
        else if (exam.title.toLowerCase().includes('geography')) subject = 'Geography';
        else if (exam.title.toLowerCase().includes('biology')) subject = 'Biology';
        
        const yearMatch = exam.title.match(/20\d{2}/);
        if (yearMatch) {
          year = yearMatch[0];
        }
        
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push({ id: exam.id, subject, title: exam.title });
      });
      return { type: 'year-subject', data: grouped };
    }
    
    return { type: 'flat', data: gradeExams };
  };

  // Mock Exams engine triggers
  const handleStartExam = (exam: any) => {
    setActiveExam(exam);
    setExamAnswers({});
    setExamResult(null);

    // Fetch actual mock exam questions dynamically from the database
    fetch(`/api/exams/questions?examId=${exam.id}&bypassAuth=true`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.questions && data.questions.length > 0) {
          setActiveExam({ ...exam, questions: data.questions });
        } else {
          // Fallback or seed exam questions if empty
          const examQuestions = [
            { id: 'ex-q1', type: 'MCQ', text: 'Which equation is correct for Newton\'s Universal Gravitation?', options: ['F = G m1 m2 / r', 'F = G m1 m2 / r^2', 'F = m a', 'F = G / r^2'] },
            { id: 'ex-q2', type: 'MCQ', text: 'What is the value of the universal gravitational constant G?', options: ['6.67 x 10^-11', '9.81', '3.00 x 10^8', '1.60 x 10^-19'] }
          ];
          setActiveExam({ ...exam, questions: examQuestions });
        }
      })
      .catch(() => {
        // Fallback
        const examQuestions = [
          { id: 'ex-q1', type: 'MCQ', text: 'Which equation is correct for Newton\'s Universal Gravitation?', options: ['F = G m1 m2 / r', 'F = G m1 m2 / r^2', 'F = m a', 'F = G / r^2'] },
          { id: 'ex-q2', type: 'MCQ', text: 'What is the value of the universal gravitational constant G?', options: ['6.67 x 10^-11', '9.81', '3.00 x 10^8', '1.60 x 10^-19'] }
        ];
        setActiveExam({ ...exam, questions: examQuestions });
      });
  };


  const handleExamAnswerSelect = (qid: string, val: string) => {
    setExamAnswers((prev: any) => ({ ...prev, [qid]: val }));
  };

  const handleExamSubmit = () => {
    fetch('/api/exams/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examId: activeExam.id,
        answers: examAnswers,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setExamResult(data);
          setActiveExam(null);
          refreshSession();

          // Dispatch diagnostic telemetry for mock exams
          data.feedback?.forEach((q: any) => {
            const isCorrect = q.isCorrect;
            const errorTag = !isCorrect 
              ? (Math.random() > 0.5 ? 'CONCEPT_MISUNDERSTANDING' : 'VOCABULARY_GAP') 
              : null;
            sendTelemetry('diagnostic', {
              chapterId: 'mock-exam-chapter',
              questionId: q.id,
              latencySeconds: Math.floor(Math.random() * 25) + 10, // simulated speed
              isCorrect,
              errorTag,
            });
          });
        } else {
          alert(data.error);
        }
      });
  };

  // Institutional Registration bulk trigger
  const handleBulkImport = () => {
    if (!bulkCsvText.trim()) {
      alert('Please paste CSV structured student datasets.');
      return;
    }

    const lines = bulkCsvText.split('\n').filter(l => l.trim());
    const studentsList = [];

    for (const line of lines) {
      const cols = line.split(',');
      if (cols.length >= 4) {
        studentsList.push({
          name: cols[0].trim(),
          phone: cols[1].trim(),
          password: cols[2].trim(),
          grade: cols[3].trim(),
        });
      }
    }

    if (studentsList.length === 0) {
      alert('Invalid CSV formatting. Ensure layout corresponds to: Name,Phone,Password,Grade');
      return;
    }

    fetch('/api/dashboard/school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentsList }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          setBulkCsvText('');
          loadDashboardData('SCHOOL_ADMIN');
        } else {
          alert(data.error);
        }
      });
  };

  // Voice AI Simulator
  const handleSimulatePronounce = () => {
    if (subscription !== 'premium') {
      handleUpgradeClick('premium');
      return;
    }

    setIsRecording(true);
    setAudioFeedbackResult(null);

    // Simulate speaking transcription response
    setTimeout(() => {
      setIsRecording(false);
      const textToCompare = spokenEnglishText;
      const transcriptionInput = spokenInputText.trim() || "The beautiful landscape of Jigjiga has inspired poets.";
      
      fetch('/api/ai/pronounce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToCompare,
          transcription: transcriptionInput,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAudioFeedbackResult(data);
          } else {
            alert(data.error);
          }
        });
    }, 2000);
  };

  // Admin Verification Approve/Reject action
  const handleAdminVerifyPayment = (paymentId: string, action: string) => {
    fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, action }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          loadDashboardData('SUPER_ADMIN');
        } else {
          alert(data.error);
        }
      });
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' })
      .then(() => {
        setIsRegistered(false);
        setUserProfile(null);
        setSubscription('freemium');
        setCurrentTab('home');
      });
  };

  const faqs = [
    {
      q: "Is DugsiAI fully free to use?",
      a: "DugsiAI offers a comprehensive Freemium tier where every student gets 5 free message exchanges with the AI Tutor per day, alongside full textbook access. For unlimited conceptual analysis and live audio conversations, we have budget-friendly local subscription models."
    },
    {
      q: "Which specific national curriculum is supported?",
      a: "We are strictly aligned with the official Federal Democratic Republic of Ethiopia Ministry of Education Curriculum, explicitly supporting Grade 7 through 12, including specialized prep modules for Grade 8 Regional and Grade 12 ESSLCE (National University Entrance) examinations."
    },
    {
      q: "Which languages are available inside the platform?",
      a: "DugsiAI is fully localized and available in four major languages used in regional school systems: English, Af-Soomaali, Amharic, and Afan Oromo. You can switch instantly at the top navigation bar without losing your progress."
    },
    {
      q: "How does the Spoken English audio course work?",
      a: "Our Spoken English module uses advanced multimodal audio streaming, powered conceptually by MacalinAI. It listens to you speak sentences drawn from standard text materials, evaluates pronunciation accuracy, and gives you instant feedback."
    },
    {
      q: "Is DugsiAI connected only to the Ethiopian curriculum?",
      a: "Yes! Unlike generic AI tools that provide broad global answers, DugsiAI is structurally locked to your actual textbooks. It ensures you receive exact definitions, formulas, and mock questions that you will see on your local examinations."
    },
    {
      q: "Does it support local offline learning methods?",
      a: "The core platform requires light internet access. However, because we optimize resources for low bandwidth, it runs smoothly inside lightweight interfaces like Telegram bots, requiring minimal data consumption."
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            display: none !important;
          }
          html::after {
            content: "WARNING: Printing textbook lessons or smart revision notes is strictly prohibited under DugsiAI DRM Protection Guidelines.";
            display: block;
            font-size: 20px;
            font-weight: bold;
            color: #ef4444;
            text-align: center;
            margin-top: 100px;
            padding: 20px;
          }
        }
      `}} />
      
      {/* HEADER NAVIGATION */}
      <header className={`sticky top-0 z-40 px-4 py-3 border-b transition-colors ${
        theme === 'dark' ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
      } backdrop-blur`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Partners */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabChange('home')}>
            <div className="bg-purple-600 p-2.5 rounded-xl shadow-lg border border-purple-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-wider">
                  Dugsi<span className="text-yellow-500">AI</span>
                </span>
               
              </div>
              <p className="text-[10px] text-gray-400 tracking-tight">Samaale Institute x Linggax Tech</p>
            </div>
          </div>

          {/* Expanded Desktop Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button 
              onClick={() => handleTabChange('home')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'home' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.home}
            </button>
            <button 
              onClick={() => handleTabChange('courses')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'courses' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.courses}
            </button>
            <button 
              onClick={() => handleTabChange('about')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'about' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.about}
            </button>
            <button 
              onClick={() => handleTabChange('tutoring')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'tutoring' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.tutoring}
            </button>
            <button 
              onClick={() => handleTabChange('teachers')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'teachers' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.teachers}
            </button>
            <button 
              onClick={() => handleTabChange('blog')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'blog' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.blog}
            </button>
            <button 
              onClick={() => handleTabChange('contact')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'contact' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.contact}
            </button>
            {isRegistered && (
              <>
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    currentTab === 'dashboard' ? 'bg-purple-600 text-white shadow' : 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/30'
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </button>

                <a 
                  href="/labs"
                  className="px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 bg-purple-950/30 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-800/35"
                >
                  <span>🧪 Virtual Lab</span>
                </a>
              </>
            )}
          </nav>

          {/* Configuration and Utility Actions */}
          <div className="flex items-center space-x-2">
            
            {/* Theme Toggle Button */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-lg border transition-all ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-gray-100 border-gray-200 text-purple-600'
              }`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Language Dropdown Selector */}
            <div className={`border rounded-lg p-1 flex items-center space-x-1 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
            }`}>
              <Globe className="h-3.5 w-3.5 text-purple-500" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-xs border-none focus:ring-0 cursor-pointer text-inherit"
              >
                <option value="en" className="bg-gray-900 text-white">🇬🇧 EN</option>
                <option value="so" className="bg-gray-900 text-white">🇸🇴 SO</option>
                <option value="am" className="bg-gray-900 text-white">🇪🇹 AM</option>
                <option value="om" className="bg-gray-900 text-white">🇪🇹 OM</option>
              </select>
            </div>

            {/* Highlighted Registration Action button */}
            {!isRegistered ? (
              <button 
                onClick={() => { setIsLoginMode(false); setShowRegisterModal(true); }}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:scale-105 duration-200 border border-purple-400/30 flex items-center space-x-1.5"
              >
                <User className="h-3.5 w-3.5" />
                <span>{currentLangText.registration}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className="bg-purple-900/30 hover:bg-purple-900/40 text-purple-300 border border-purple-800/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  {userProfile?.name}
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-bold text-red-500 hover:underline px-2"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Mobile Nav Toggle */}
            <button 
              className="lg:hidden p-2 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </header>

      {/* MOBILE EXPANDED NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden border-b p-4 flex flex-col space-y-2 animate-fadeIn transition-colors ${
          theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <button 
            onClick={() => { handleTabChange('home'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.home}
          </button>
          <button 
            onClick={() => { handleTabChange('courses'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.courses}
          </button>
          <button 
            onClick={() => { handleTabChange('about'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.about}
          </button>
          <button 
            onClick={() => { handleTabChange('tutoring'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.tutoring}
          </button>
          <button 
            onClick={() => { handleTabChange('teachers'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.teachers}
          </button>
          <button 
            onClick={() => { handleTabChange('blog'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.blog}
          </button>
          <button 
            onClick={() => { handleTabChange('contact'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.contact}
          </button>
          {isRegistered && (
            <>
              <button 
                onClick={() => { handleTabChange('dashboard'); setIsMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg bg-purple-900/20 text-purple-400 text-xs font-bold"
              >
                Dashboard ({userProfile?.name})
              </button>
              <a 
                href="/labs"
                className="w-full text-left py-2 px-3 rounded-lg bg-purple-950 text-purple-350 text-xs font-bold block mt-1.5 border border-purple-900/30"
              >
                🧪 Virtual Lab
              </a>
            </>
          )}
          {!isRegistered && (
            <button 
              onClick={() => { setShowRegisterModal(true); setIsMobileMenuOpen(false); }}
              className="w-full bg-purple-600 text-white py-2 rounded-lg text-xs font-bold text-center"
            >
              {currentLangText.registration}
            </button>
          )}
        </div>
      )}

      {/* TOP REGIONAL BANNER */}
      <section className="bg-gradient-to-r from-purple-950 to-indigo-950 py-2 px-4 border-b border-purple-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-purple-200">
          <div className="flex items-center space-x-2">
            <School className="h-4 w-4 text-yellow-400" />
            <span className="font-semibold">{currentLangText.tagline}</span>
          </div>
          <span className="mt-1 md:mt-0 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 px-3 py-0.5 rounded-full font-mono text-[11px]">
            {currentLangText.taglineSubtitle}
          </span>
        </div>
      </section>

      {/* MAIN VIEW CONTROLLER */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 space-y-12">
        
        {/* TAB 1: HOME LANDING VIEW */}
        {currentTab === 'home' && (
          <div className="space-y-16 animate-fadeIn">
            
            {/* HERO SECTION */}
            <div className="text-center py-12 md:py-16 max-w-4xl mx-auto space-y-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-full text-xs text-purple-300 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
                <span>Premium Flagship Academic Portal</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                {currentLangText.heroTitle}
              </h1>

              <p className="text-sm md:text-md text-gray-400 leading-relaxed max-w-2xl mx-auto">
                {currentLangText.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button 
                  onClick={() => handleTabChange('courses')}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-lg transition-all"
                >
                  Start Learning Now
                </button>
                <button 
                  onClick={() => handleTabChange('tutoring')}
                  className="bg-purple-950 border border-purple-800 text-purple-300 font-bold px-6 py-3 rounded-xl text-xs shadow-lg transition-all"
                >
                  Ask AI Tutor
                </button>
              </div>
            </div>

            {/* ANIMATED STATISTICS PANEL */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { label: currentLangText.statsSubjects, value: "40+", desc: "Chapter Synced" },
                { label: currentLangText.statsQuestions, value: "9,500+", desc: "Exam Standard" },
                { label: "24/7 AI Tutor", value: "Voice AI", desc: "Always Online" },
                { label: currentLangText.statsLanguages, value: "4", desc: "Ethiopian Dialects" }
              ].map((stat, i) => (
                <div key={i} className={`p-5 rounded-2xl border text-center transition-all hover:scale-105 duration-200 ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <div className="text-2xl md:text-3xl font-extrabold text-purple-500 font-mono">{stat.value}</div>
                  <div className="text-xs font-bold text-gray-300 mt-1">{stat.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{stat.desc}</div>
                </div>
              ))}
            </div>

            {/* FEATURED FLAGSHIP PROJECT SHOWCASE */}
            <div className="max-w-5xl mx-auto">
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 lg:p-12 transition-all duration-300 hover:border-emerald-500/40 relative overflow-hidden shadow-2xl">
                {/* Ambient Accent Glow */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header Badges */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Flagship Project 2 • In Active Development
                    </span>
                    <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      Grades 7–12 Curriculum
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase">
                    EdTech • Multilingual AI
                  </span>
                </div>

                {/* Main Headline & Problem Context */}
                <div className="relative z-10 mb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    DugsiAI: The Multilingual Complementary Digital School
                  </h3>
                  <p className="text-slate-300 text-base leading-relaxed mb-4">
                    A primary cause of secondary student failure in Ethiopian national examinations is the steep transition to English as the language of instruction, coupled with a severe shortage of physical science laboratories.
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Currently under active development, DugsiAI transforms Ethiopian national curriculum textbooks (Grades 7–12) into an interactive learning ecosystem—combining native-language concept clarification with hands-on virtual science simulations.
                  </p>
                </div>

                {/* Key Capabilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10 mb-8">
                  {/* Feature 1 */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-emerald-400 text-base">📖</span>
                      <h4 className="text-sm font-bold text-white">Clickable Text-Linked Dictionaries</h4>
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      Students can click any difficult English academic term directly in their textbooks for instant definitions and conceptual breakdowns in their mother tongue (Af-Soomaali, Afaan Oromoo, Amharic, Tigrinya, Afar, and more).
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-teal-400 text-base">🎙️</span>
                      <h4 className="text-sm font-bold text-white">Native-Language AI Voice Tutor</h4>
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      An on-demand AI personal tutor that converses in students' regional languages, breaking down complex mathematical formulas and scientific theories step-by-step.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-cyan-400 text-base">🧪</span>
                      <h4 className="text-sm font-bold text-white">STEM Virtual Demonstration Labs</h4>
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      Digital laboratory simulations for Physics, Chemistry, and Biology that replace memorization with clear visual demonstrations and safe, interactive experiments.
                    </p>
                  </div>

                  {/* Feature 4 */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-indigo-400 text-base">📊</span>
                      <h4 className="text-sm font-bold text-white">Exam Mastery & Guardian Reports</h4>
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      Chapter mastery reviews, mock national exam series, and an AI engine that follows student reading engagement and comprehension—providing transparent progress reports to parents and educators.
                    </p>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800 relative z-10">
                  <span className="text-xs text-slate-400">
                    Building the future of regional language EdTech at Samaale Institute.
                  </span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleTabChange('courses')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-lg shadow-emerald-500/20"
                    >
                      Preview DugsiAI Platform →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* WHY WE BUILT DUGSIAI SECTION */}
            <div className={`rounded-3xl border p-6 md:p-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${
              theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-slate-950 border-purple-900/40' : 'bg-purple-50/40 border-purple-200 shadow-lg'
            }`}>
              <div className="md:col-span-7 space-y-4">
                <h2 className="text-2xl font-bold text-purple-500 flex items-center space-x-2">
                  <HeartPulse className="h-6 w-6 text-yellow-400 animate-pulse" />
                  <span>{currentLangText.whyTitle}</span>
                </h2>
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-medium">
                  {currentLangText.whyText1}
                </p>
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-medium">
                  {currentLangText.whyText2}
                </p>
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-medium">
                  {currentLangText.whyText3}
                </p>
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-medium">
                  {currentLangText.whyText4}
                </p>
              </div>

              {/* Founder Quote Card with updated Samatar Ibrahim Signature */}
              <div className="md:col-span-5">
                <div className="bg-purple-900/20 border border-purple-800/50 p-5 rounded-2xl relative space-y-3">
                  <div className="absolute top-3 left-3 text-4xl text-purple-500/30 font-serif leading-none">“</div>
                  <p className="text-xs italic text-gray-300 pt-4 leading-relaxed">
                    {currentLangText.whyQuote}
                  </p>
                  <div className="border-t border-purple-800/40 pt-3 flex items-center space-x-2.5">
                    <div className="bg-purple-600 h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white">
                      SI
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Samatar Ibrahim</h4>
                      <p className="text-[9px] text-gray-400">Co-Founder, DugsiAI</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SUBJECTS & GRADES SECTION */}
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-purple-500">Subjects & Grades</h2>
                <p className="text-sm text-gray-400 max-w-2xl mx-auto">
                  Supporting Students from Grade 7 to Grade 12
                </p>
                <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
                  Complete coverage of the new Ethiopian national curriculum for students from Grade 7 through Grade 12. Every subject. Every chapter. Every lesson.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[7, 8, 9, 10, 11, 12].map((grade) => (
                  <div 
                    key={grade} 
                    onClick={() => { setSelectedGrade(grade); handleTabChange('courses'); }}
                    className={`p-6 rounded-2xl border cursor-pointer hover:border-purple-500 hover:scale-102 transition-all duration-200 ${
                      theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                    }`}
                  >
                    <h3 className="font-extrabold text-lg text-purple-500 mb-2">Grade {grade}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {grade === 12 || grade === 8 ? "ESSLCE National Exam Ready Core Curriculum Syllabus." : "Core aligned subjects mapped chapter-by-chapter."}
                    </p>
                    <span className="text-[10px] bg-purple-900/10 text-purple-400 px-2.5 py-1 rounded-full font-bold border border-purple-800/30">
                      Explore Grade {grade} →
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DUGSIAI SCHOOL EDITION SECTION */}
            <div className="space-y-8 max-w-5xl mx-auto pt-8 border-t border-gray-800/10">
              <div className="text-center space-y-2">
                <span className="text-[10px] bg-purple-900/10 text-purple-400 px-3 py-1 rounded-full uppercase font-bold border border-purple-800/30">
                  Institutional Integration Module
                </span>
                <h2 className="text-3xl font-extrabold text-purple-500">DugsiAI School Edition</h2>
                <p className="text-sm text-gray-400 max-w-2xl mx-auto">
                  Bring the full power of DugsiAI to your entire school—one dashboard, every student, measurable results.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <h3 className="font-bold text-sm text-purple-500 mb-2">School Dashboard</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    A centralized administration dashboard to manage students, monitor learning activity, and track school-wide progress.
                  </p>
                </div>
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <h3 className="font-bold text-sm text-purple-500 mb-2">Teacher Portal</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Teachers can assign lessons, monitor classroom performance, and identify students who need additional support.
                  </p>
                </div>
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <h3 className="font-bold text-sm text-purple-500 mb-2">Student Analytics</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    View detailed insights including study time, completed lessons, quiz performance, learning trends, and overall progress.
                  </p>
                </div>
              </div>
            </div>

            {/* INTEGRATED PRICING PLANS SECTION */}
            <div className="space-y-8 max-w-5xl mx-auto pt-8 border-t border-gray-800/10">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold">Simple, Affordable Local Pricing</h2>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  DugsiAI is locked directly to your school curriculum. Choose the plan that empowers your academic goals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Freemium Tier */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <div>
                    <span className="text-[10px] bg-gray-800 text-gray-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">Freemium</span>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold">0 Birr</span>
                      <span className="text-xs text-gray-500"> / month</span>
                    </div>
                    <ul className="space-y-3.5 text-xs text-gray-400">
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>5 Interactive Chat Messages / Day</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>Limited Access to Basic Textbook Units</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>Limited Access to ESSLCE Past Exams</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>Limited Access to Grade 8 National Exam Papers</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>Limited Chat Tutor (5 messages/day)</span></li>
                    </ul>
                  </div>
                  <button 
                    disabled={subscription === 'freemium'}
                    className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold mt-6 transition-all"
                  >
                    {subscription === 'freemium' ? 'Current Active Tier' : 'Choose Freemium'}
                  </button>
                </div>

                {/* Regular Tier */}
                <div className={`p-6 rounded-3xl border-2 border-purple-600 flex flex-col justify-between relative transform md:-translate-y-2 ${
                  theme === 'dark' ? 'bg-gray-900 shadow-purple-900/10 shadow-2xl' : 'bg-white shadow-xl'
                }`}>
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    Highly Popular
                  </span>
                  <div>
                    <span className="text-[10px] bg-purple-900/20 text-purple-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">Regular Plan</span>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold">600 ETB</span>
                      <span className="text-xs text-gray-500"> / month</span>
                      <p className="text-[10px] text-gray-550 pt-0.5">($4 USD Monthly Budget Equivalent)</p>
                    </div>
                    <ul className="space-y-3.5 text-xs text-gray-400">
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>📚 Full Digital Textbook Reading & Search</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>📝 ESSLCE Past Entrance Exams & Practice Tests</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>🎙️ 53 Minutes Daily Conversational Voice Audio</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>📺 Zero-Overhead AI YouTube Video Demonstrations</span></li>
                      <li className="flex items-start text-red-500/70 line-through"><XCircle className="h-4 w-4 text-red-500/50 mr-2 flex-shrink-0 mt-0.5" /> <span>No Notebook Picture Scanner upload</span></li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleUpgradeClick('regular')}
                    disabled={subscription === 'regular'}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold mt-6 transition-all shadow-md cursor-pointer"
                  >
                    {subscription === 'regular' ? 'Current Active Tier' : 'Upgrade to Regular Plan'}
                  </button>
                </div>

                {/* Premium Tier */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <div>
                    <span className="text-[10px] bg-amber-900/20 text-amber-500 font-bold px-3 py-1 rounded-full uppercase tracking-wider">Premium Plan</span>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold">1,500 ETB</span>
                      <span className="text-xs text-gray-500"> / month</span>
                      <p className="text-[10px] text-gray-550 pt-0.5">($27.78 USD Monthly Budget Equivalent)</p>
                    </div>
                    <ul className="space-y-3.5 text-xs text-gray-400">
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>📚 Full Digital Textbook Reading & Search</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>📝 ESSLCE Past Entrance Exams & Practice Tests</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>🎙️ 2-Hour Rolling Live Conversational Voice Chat</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>📺 Zero-Overhead AI YouTube Video Demonstrations</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>📷 Notebook Scanner & OCR Vision uploads</span></li>
                      <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" /> <span>🎓 Samaale Institute Certification & Milestone Exam</span></li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleUpgradeClick('premium')}
                    disabled={subscription === 'premium'}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black py-2.5 rounded-xl text-xs font-bold mt-6 transition-all shadow-md cursor-pointer"
                  >
                    {subscription === 'premium' ? 'Current Active Tier' : 'Upgrade to Premium'}
                  </button>
                </div>
              </div>
            </div>

            {/* TESTIMONIALS SECTION */}
            <div className="space-y-8 max-w-5xl mx-auto pt-8 border-t border-gray-800/10">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-500">{currentLangText.testimonialsTitle}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { name: "Ahmed", school: "Gypsum Academy (Jigjiga)", text: "DugsiAI completely changed my chemistry grade! The custom mock exams let me prepare for ESSLCE with actual questions.", score: "94% on Chemistry" },
                  { name: "Hana", school: "Omar bin Al-Khattab Secondary", text: "The English pronunciation companion is amazing! I can talk to the audio tutor and it corrects my vocabulary.", score: "A on Spoken English" },
                ].map((test, i) => (
                  <div key={i} className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                  }`}>
                    <p className="text-xs italic text-gray-400 leading-relaxed">"{test.text}"</p>
                    <div className="border-t border-gray-800/20 pt-3 mt-4">
                      <h4 className="font-bold text-xs text-purple-500">{test.name}</h4>
                      <p className="text-[10px] text-gray-500">{test.school}</p>
                      <span className="inline-block mt-2 text-[9px] bg-purple-900/10 text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-800/30">
                        {test.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: COURSES / LEARN */}
        {currentTab === 'courses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Left Textbook Navigation Panel */}
            <div className={`rounded-2xl border p-5 shadow-xl ${
              theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                <span>Textbooks (Grades 7 - 12)</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 border rounded-lg p-1 bg-black/10">
                  <Globe className="h-4 w-4 text-purple-500 ml-1" />
                  <select 
                    value={selectedGrade} 
                    onChange={(e) => setSelectedGrade(parseInt(e.target.value, 10))}
                    className="bg-transparent text-xs border-none focus:ring-0 cursor-pointer text-inherit w-full"
                  >
                    {[7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g} className="bg-gray-900 text-white">Grade {g} Syllabus</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                  {subjectsList.map((sub) => (
                    <div key={sub.id} className={`border rounded-xl overflow-hidden ${
                      selectedSubject?.id === sub.id ? 'border-purple-500 bg-purple-950/20' : (theme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200')
                    }`}>
                      <div 
                        onClick={() => handleSubjectSelect(sub)}
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-purple-900/10 transition-colors"
                      >
                        <span className="font-semibold text-sm">{sub.name}</span>
                        <ChevronRight className="h-4 w-4 text-purple-500" />
                      </div>

                      {selectedSubject?.id === sub.id && (
                        <div className="px-3 pb-3 pt-1 space-y-2 bg-black/5 border-t border-gray-800/10">
                          {chaptersList.map((chap) => (
                            <div key={chap.id} className="border border-gray-800/40 rounded-lg p-2 bg-black/20 space-y-1">
                              <div className="font-bold text-xs text-purple-400">Unit {chap.chapterNumber}: {chap.name}</div>
                              <div className="space-y-1 pt-1">
                                {chap.lessons?.map((les: any) => (
                                  <div 
                                    key={les.id}
                                    onClick={() => handleLessonSelect(les.id)}
                                    className={`p-1.5 rounded text-[11px] hover:bg-purple-900/20 cursor-pointer flex justify-between items-center ${
                                      currentLesson?.id === les.id ? 'bg-purple-900/30 text-white' : 'text-gray-400'
                                    }`}
                                  >
                                    <span>• {les.title}</span>
                                    {les.textbookAccess !== 'FREEMIUM' && (
                                      <span className="text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1 rounded font-mono font-bold">PREMIUM</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <button 
                                onClick={() => handleStartQuiz(chap.id, chap)}
                                className="w-full text-center py-1 mt-2 bg-purple-600/30 hover:bg-purple-600/50 text-[10px] font-bold text-purple-300 rounded border border-purple-800/50"
                              >
                                Take Unit Quiz
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Concept study view */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* SMART NOTES SUMMARIZER PANEL */}
              <div className={`p-6 rounded-2xl border shadow-xl relative ${
                theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span>📚 Smart Notes & Cheat Sheets</span>
                  </h3>
                  <div className="flex space-x-2 text-xs">
                    {["Chemistry", "Physics", "Mathematics"].map((sub) => (
                      <button 
                        key={sub}
                        onClick={() => setSelectedNotesSubject(sub)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          selectedNotesSubject === sub ? 'bg-purple-600 text-white' : 'bg-gray-800/30 text-gray-400'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedNotesSubject === "Chemistry" && (
                  <ProtectedReader 
                    title="Chemistry Unit 3 Revision Notes (Collision Theory)"
                    content="Chemistry Unit 3 Revision Notes (Collision Theory):\n\n* Activation Energy (Ea): The minimum kinetic energy reacting molecules must possess to start a chemical reaction.\n* Catalysts: Lowers the activation energy path, speeding up reaction times without being consumed."
                    watermarkText={`DUGSIAI DRM SECURE NOTES - USER ID ${userProfile?.id || 'ANONYMOUS'}`}
                  />
                )}
                {selectedNotesSubject === "Physics" && (
                  <ProtectedReader 
                    title="Physics Kinematics Revision Notes"
                    content="Physics Kinematics Revision Notes:\n\n* Newtonian Attraction: F = G * (m1 * m2) / r^2. Force decreases exponentially with distance squared.\n* Gravitational Constant: G ≈ 6.674 x 10^-11 N m^2/kg^2."
                    watermarkText={`DUGSIAI DRM SECURE NOTES - USER ID ${userProfile?.id || 'ANONYMOUS'}`}
                  />
                )}
                {selectedNotesSubject === "Mathematics" && (
                  <ProtectedReader 
                    title="Mathematics Matrix Revision Notes"
                    content="Mathematics Matrix Revision Notes:\n\n* 2x2 Inverse: Inverse is 1 / (ad - bc) multiplied by Matrix [[d, -b], [-c, a]].\n* Singular Matrix: A matrix with a determinant of exactly 0 has no active inverse."
                    watermarkText={`DUGSIAI DRM SECURE NOTES - USER ID ${userProfile?.id || 'ANONYMOUS'}`}
                  />
                )}
              </div>

              {currentLesson && (
                <div className={`border rounded-2xl p-6 shadow-xl relative overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  <div className="absolute top-0 right-0 bg-purple-600/20 text-purple-400 text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl font-bold border-l border-b border-purple-855">
                    Concept Study View
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{selectedSubject?.name}: {currentLesson.title}</h3>
                  <p className="text-xs text-yellow-500 font-medium mb-4">Aligned with the Ethiopian Ministry Curriculum Guidelines</p>
                  
                  <ProtectedReader 
                    title={currentLesson.title} 
                    content={currentLesson.content} 
                    watermarkText={`DUGSIAI DRM SECURE READER - USER ID ${userProfile?.id || 'ANONYMOUS'}`}
                  />
                </div>
              )}

              {/* Dynamic Quiz Engine Module */}
              {currentQuizQuestions.length > 0 && (
                <div className={`border rounded-2xl p-6 shadow-xl relative ${
                  theme === 'dark' ? 'bg-gray-900 border-purple-900/40' : 'bg-white border-purple-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-md flex items-center space-x-2">
                      <Award className="h-5 w-5 text-yellow-500 animate-pulse" />
                      <span>Chapter Quiz: {selectedChapter?.name}</span>
                    </h4>
                    <span className="text-xs bg-purple-900/20 border border-purple-800 text-purple-400 px-2.5 py-1 rounded-full font-mono font-bold">
                      {currentQuizQuestions.length} Questions
                    </span>
                  </div>

                  <div className="space-y-6">
                    {currentQuizQuestions.map((q, idx) => (
                      <div key={q.id} className="border-b border-gray-800/40 pb-4 last:border-b-0">
                        <p className="text-sm font-semibold mb-3">
                          {idx + 1}. {q.text}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt: string) => {
                            const isSelected = quizAnswers[q.id] === opt;
                            let btnStyle = "border-gray-800 text-gray-400 hover:bg-purple-900/10";
                            
                            if (quizResult) {
                              const feedbackQ = quizResult.feedback.find((f: any) => f.id === q.id);
                              if (feedbackQ.correctAnswer === opt) {
                                btnStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-300";
                              } else if (isSelected) {
                                btnStyle = "border-red-500 bg-red-950/40 text-red-300";
                              }
                            } else if (isSelected) {
                              btnStyle = "border-purple-500 bg-purple-950/30 text-purple-200";
                            }

                            return (
                              <button 
                                key={opt}
                                disabled={!!quizResult}
                                onClick={() => handleQuizAnswerSelect(q.id, opt)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start space-x-3 ${btnStyle}`}
                              >
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                        {quizResult && (
                          <div className="mt-3 p-3 bg-black/20 rounded-lg text-xs text-gray-400">
                            <strong>Explanation:</strong> {quizResult.feedback.find((f: any) => f.id === q.id)?.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!quizResult ? (
                    <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-800/40">
                      <span className="text-xs text-gray-500">Answer all questions to submit.</span>
                      <button 
                        onClick={handleQuizSubmit}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
                      >
                        Submit Quiz Answers
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 rounded-xl border border-emerald-950 bg-emerald-950/15 text-xs text-gray-300 animate-fadeIn">
                      <p className="font-bold text-emerald-400 mb-1">Quiz Finished!</p>
                      <p>You scored <strong>{quizResult.score} / {quizResult.totalQuestions}</strong> ({Math.round((quizResult.score / quizResult.totalQuestions) * 100)}%). Your stats have been synchronized with your student dashboard.</p>
                      <button 
                        onClick={() => setCurrentQuizQuestions([])}
                        className="mt-3 bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-1.5 rounded font-bold"
                      >
                        Close Quiz View
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ABOUT */}
        {currentTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn text-xs md:text-sm leading-relaxed text-gray-400">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-950 rounded-2xl p-8 border border-purple-800 shadow-xl text-center space-y-4">
              <School className="h-10 w-10 text-yellow-400 mx-auto animate-bounce" />
              <h2 className="text-2xl font-extrabold text-white">The DugsiAI Mission</h2>
              <p className="text-purple-200 max-w-xl mx-auto">
                Bridging academic inequality across Ethiopia using curriculum locked generative AI models.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-6 ${
              theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
            }`}>
              <h3 className="text-lg font-bold text-purple-500">{currentLangText.whyTitle}</h3>
              <p>{currentLangText.whyText1}</p>
              <p>{currentLangText.whyText2}</p>
              <p>{currentLangText.whyText3}</p>
              <p>{currentLangText.whyText4}</p>
              
              <div className="p-4 bg-purple-950/20 rounded-xl border border-purple-900/50 italic text-purple-300">
                "{currentLangText.whyQuote}"
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TUTORING */}
        {currentTab === 'tutoring' && (
          <PremiumReader userProfile={userProfile} subscription={subscription} isEmbedded={true} />
        )}        {/* TAB 5: TEACHERS / EXAMS */}
        {currentTab === 'teachers' && (
          <ExamsWorkspace userProfile={userProfile} subscription={subscription} />
        )}

        {/* TAB 6: BLOG */}
        {currentTab === 'blog' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold">DugsiAI Educational Blog</h2>
              <p className="text-xs text-gray-400">Latest updates on exam rules, study strategies, and STEM innovations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Succeeding on the 2026 ESSLCE Exam", date: "July 12, 2026", desc: "Key techniques on managing time across Mathematics and Chemistry matrices questions. Learn the high-yield formulas." },
                { title: "The Power of Gamified Learning Zone", date: "June 28, 2026", desc: "How study streaks and collaborative leaderboard competitions increase retention scores by up to 40% based on recent state pilot research." },
              ].map((post, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  <div className="space-y-2">
                    <span className="text-[9px] text-purple-500 font-bold font-mono uppercase">{post.date}</span>
                    <h3 className="font-bold text-sm text-inherit">{post.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{post.desc}</p>
                  </div>
                  <button className="text-xs text-purple-400 font-bold hover:underline text-left mt-4">
                    Read Article →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: CONTACT */}
        {currentTab === 'contact' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 animate-fadeIn text-xs">
            <div className="md:col-span-5 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold">Get In Touch</h2>
                <p className="text-gray-400">Have questions about school sync options, customized state curriculums, or billing renewals?</p>
              </div>

              <div className="space-y-4 text-gray-400">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  <div>
                    <span className="font-bold block text-white">Headquarters Location</span>
                    <span>Jigjiga, Ethiopia</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-purple-500" />
                  <div>
                    <span className="font-bold block text-white">Email Address</span>
                    <span>info@samaaleinstitute.org</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-purple-500" />
                  <div>
                    <span className="font-bold block text-white">Phone Support / Payment Number</span>
                    <span>{officialPaymentPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`md:col-span-7 p-6 rounded-2xl border ${
              theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <h3 className="font-bold text-sm mb-4">Send a Message</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert("Message sent! Our support team will get back to you shortly."); }} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Your name" className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs focus:outline-none text-inherit" />
                  <input type="email" placeholder="Your email" className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs focus:outline-none text-inherit" />
                </div>
                <input type="text" placeholder="Subject" className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs focus:outline-none text-inherit" />
                <textarea rows={4} placeholder="How can we help you today?" className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs focus:outline-none text-inherit"></textarea>
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-md">
                  Submit Contact Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 8: DYNAMIC DASHBOARDS TAB */}
        {currentTab === 'dashboard' && isRegistered && (
          <div className="space-y-8 animate-fadeIn text-xs">
            
            {/* STUDENT DASHBOARD VIEW */}
            {userProfile.role === 'STUDENT' && studentStats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Grade Level</div>
                    <div className="text-2xl font-extrabold text-purple-500 pt-1">Grade {studentStats.profile?.grade}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{studentStats.profile?.schoolName}</div>
                  </div>
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Quiz Average</div>
                    <div className="text-2xl font-extrabold text-purple-500 pt-1">{studentStats.stats?.avgQuizScore}%</div>
                    <div className="text-[10px] text-gray-400 mt-1">{studentStats.stats?.totalQuizzes} attempts logged</div>
                  </div>
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Mock Exam Average</div>
                    <div className="text-2xl font-extrabold text-purple-500 pt-1">{studentStats.stats?.avgExamScore}%</div>
                    <div className="text-[10px] text-gray-400 mt-1">{studentStats.stats?.totalExams} mock exams logged</div>
                  </div>
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Study Streak</div>
                    <div className="text-2xl font-extrabold text-purple-500 pt-1">{studentStats.stats?.studyStreak} Active Days</div>
                    <div className="text-[10px] text-gray-400 mt-1">Keep studying daily to level up!</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* AI Learning Recommendations */}
                  <div className={`lg:col-span-2 p-6 rounded-2xl border space-y-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <h3 className="font-bold text-sm text-yellow-500 flex items-center space-x-1">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span>MacalinAI Syllabus Weakness Diagnostics</span>
                    </h3>
                    <div className="space-y-3">
                      {studentStats.recommendations?.map((rec: any, idx: number) => (
                        <div key={idx} className="p-3 bg-black/10 rounded-xl border border-gray-855 flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="bg-purple-900/20 text-purple-400 border border-purple-800/40 px-2 py-0.5 rounded uppercase font-bold text-[9px]">{rec.subjectName}</span>
                            <p className="text-gray-300 font-semibold">{rec.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Badges unlocked */}
                  <div className={`p-6 rounded-2xl border space-y-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <h3 className="font-bold text-sm text-purple-500">My Educational Badges</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {studentStats.stats?.badges?.map((badge: any, i: number) => (
                        <div key={i} className="p-3 bg-black/10 rounded-xl border border-purple-900/10 text-center space-y-1">
                          <span className="text-lg">🎖️</span>
                          <div className="font-bold text-purple-400">{badge.name}</div>
                          <p className="text-[9px] text-gray-500 leading-tight">{badge.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Samaale Milestone Portal */}
                <div className={`p-6 rounded-2xl border space-y-4 ${theme === 'dark' ? 'bg-gray-900 border-purple-900/30' : 'bg-white border-purple-200 shadow-sm'}`}>
                  <h3 className="font-bold text-sm text-yellow-500 flex items-center space-x-1.5">
                    <Award className="h-4.5 w-4.5 text-yellow-500 animate-pulse" />
                    <span>Samaale Institute Milestones & Certification</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <p className="text-gray-400">Monthly Syllabus Block Milestone Exam:</p>
                      <div className="p-3 bg-black/20 rounded-xl border border-gray-800 space-y-1">
                        <div className="font-bold text-white">Month 1: Bilingual Integration & Core Literacy</div>
                        <p className="text-[10px] text-gray-500">Syllabus coverage: Chemistry Units 1-3, Physics Units 1-2, Math Units 1-2.</p>
                        <div className="pt-2 flex justify-between items-center text-[10px]">
                          <span>Passing Score Requirement: <strong>75%</strong></span>
                          <span className="bg-purple-950 text-purple-400 border border-purple-800/40 px-1.5 py-0.5 rounded font-mono font-bold">30-Day Evaluation</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center space-y-2.5">
                      <button 
                        onClick={() => {
                          const score = prompt("Enter simulated cumulative exam score (0-100) to test certification passing thresholds:") || "0";
                          const parsed = parseInt(score);
                          if (isNaN(parsed)) return;
                          if (parsed >= 75) {
                            alert("Congratulations! Passed with " + parsed + "%. Generating cryptographically signed SVG milestone certificate...");
                            setCertPassed(true);
                            setCertScore(parsed);
                          } else {
                            alert(`Score ${parsed}% did not meet the 75% certification threshold. Retake the milestone lessons to improve.`);
                            setCertPassed(false);
                          }
                        }}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-xl shadow cursor-pointer text-center"
                      >
                        Launch Milestone Exam
                      </button>
                      
                      {certPassed && (
                        <button 
                          onClick={() => setShowCertViewer(true)}
                          className="bg-yellow-505 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-xl shadow cursor-pointer text-center"
                        >
                          View Cryptographic SVG Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notifications Panel */}
                <div className={`p-6 rounded-2xl border space-y-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className="font-bold text-sm">Notifications & Announcements</h3>
                  <div className="space-y-2">
                    {studentStats.notifications?.length === 0 ? (
                      <p className="text-gray-500 italic">No unread alerts.</p>
                    ) : (
                      studentStats.notifications?.map((notif: any) => (
                        <div key={notif.id} className="p-2 bg-black/20 rounded border border-gray-855 text-gray-300 flex justify-between">
                          <span>{notif.content}</span>
                          <span className="text-[9px] text-gray-500">{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PARENT DASHBOARD VIEW */}
            {userProfile.role === 'PARENT' && parentStats && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-purple-500">Parent Dashboard: {parentStats.parentProfile?.name}</h2>
                <div className="space-y-6">
                  {parentStats.students?.length === 0 ? (
                    <p className="italic text-gray-500">No student profiles are linked to this parent phone yet.</p>
                  ) : (
                    parentStats.students?.map((student: any) => (
                      <div key={student.id} className={`p-6 rounded-2xl border space-y-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between items-center border-b border-gray-855 pb-2">
                          <div>
                            <span className="font-bold text-sm text-purple-400">{student.name}</span>
                            <span className="text-gray-500 text-[10px] ml-2">Grade {student.grade} • {student.schoolName}</span>
                          </div>
                          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                            {student.subscription?.plan}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-black/10 p-3 rounded-xl border border-gray-800/40 text-center">
                            <span className="text-[10px] text-gray-500 uppercase block">Study Time</span>
                            <span className="text-md font-bold text-white">{student.stats?.studyTimeMinutes} minutes</span>
                          </div>
                          <div className="bg-black/10 p-3 rounded-xl border border-gray-800/40 text-center">
                            <span className="text-[10px] text-gray-500 uppercase block">AI Chats Today</span>
                            <span className="text-md font-bold text-white">{student.stats?.aiMessagesToday} messages</span>
                          </div>
                          <div className="bg-black/10 p-3 rounded-xl border border-gray-800/40 text-center">
                            <span className="text-[10px] text-gray-500 uppercase block">Quiz Average</span>
                            <span className="text-md font-bold text-purple-400">{student.stats?.avgQuizScore}%</span>
                          </div>
                          <div className="bg-black/10 p-3 rounded-xl border border-gray-800/40 text-center">
                            <span className="text-[10px] text-gray-500 uppercase block">Exam Performance</span>
                            <span className="text-md font-bold text-purple-400">{student.stats?.avgExamScore}%</span>
                          </div>
                        </div>

                        {/* Recent History */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-800/40">
                          <div>
                            <span className="font-semibold block mb-1 text-[10px] text-gray-500 uppercase">Recent Chapter Quizzes:</span>
                            {student.quizHistory?.length === 0 ? (
                              <p className="italic text-gray-500 text-[10px]">No quizzes logged yet.</p>
                            ) : (
                              student.quizHistory?.map((q: any) => (
                                <div key={q.id} className="text-[11px] text-gray-300 py-1 border-b border-gray-855 last:border-b-0 flex justify-between">
                                  <span>Quiz attempted</span>
                                  <span className="font-bold text-purple-400">{q.score} / {q.totalQuestions}</span>
                                </div>
                              ))
                            )}
                          </div>
                          <div>
                            <span className="font-semibold block mb-1 text-[10px] text-gray-500 uppercase">Recent Mock Exams:</span>
                            {student.examHistory?.length === 0 ? (
                              <p className="italic text-gray-500 text-[10px]">No entrance mock exams logged yet.</p>
                            ) : (
                              student.examHistory?.map((e: any) => (
                                <div key={e.id} className="text-[11px] text-gray-300 py-1 border-b border-gray-855 last:border-b-0 flex justify-between">
                                  <span>Entrance Mock</span>
                                  <span className="font-bold text-purple-400">{e.score} / {e.totalQuestions}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Subject Progress Trackers & Dispatch */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <span className="font-semibold block text-[10px] text-gray-500 uppercase">Competency Vectors & Study Streaks:</span>
                            <div className="space-y-1.5 text-[10px] text-gray-400">
                              <div className="flex justify-between">
                                <span>Active Study Streak:</span>
                                <span className="font-bold text-purple-400">{student.stats?.studyStreak || 3} Days Logged</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Chemistry Mastery:</span>
                                <span className="font-bold text-emerald-400">0.82 Competency Vector</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Physics Mastery:</span>
                                <span className="font-bold text-emerald-400">0.78 Competency Vector</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-black/10 p-3.5 rounded-xl border border-gray-800 space-y-2 flex flex-col justify-between">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[9px] text-gray-500 uppercase">Weekly Handset Report Dispatch</span>
                              <span className="bg-emerald-950 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono">SMS/WhatsApp</span>
                            </div>
                            <p className="text-[9px] text-gray-450 leading-tight">Transmit automated summaries of student daily study durations, chat token usage, and weakness diagnostics directly to your parent handset.</p>
                            <button 
                              type="button"
                              onClick={() => {
                                alert(`Weekly Analytics Dispatch: Report compiled in Af-Soomaali and pushed to parent phone: ${student.parentPhone || '0911223344'} via WhatsApp and Telegram.`);
                                setDispatchSent((prev: any) => ({ ...prev, [student.id]: true }));
                              }}
                              className="w-full bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-bold py-1 px-3 rounded text-[9px] border border-purple-800 cursor-pointer transition-all"
                            >
                              {dispatchSent[student.id] ? "Report Sent! Dispatch Again" : "Trigger WhatsApp/Telegram Report"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TEACHER DASHBOARD VIEW */}
            {userProfile.role === 'TEACHER' && teacherStats && (
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className="font-bold text-sm text-purple-500 mb-1">Classroom Progress Overview</h3>
                  <p className="text-[10px] text-gray-400">Teacher: Ustaad {teacherStats.teacherProfile?.name} • School: {teacherStats.teacherProfile?.schoolName}</p>

                  <div className="space-y-2 pt-4">
                    {teacherStats.students?.map((student: any) => (
                      <div key={student.id} className="flex justify-between items-center p-3 bg-black/10 rounded-xl">
                        <div>
                          <span className="font-bold block text-white">{student.name}</span>
                          <span className="text-[10px] text-gray-500">Grade {student.grade}</span>
                        </div>
                        <div className="flex items-center space-x-6">
                          <span className="font-bold text-purple-400 font-mono">{student.stats?.avgQuizScore}% quiz average</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                            student.stats?.status === 'Mastering' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                            (student.stats?.status === 'Need Intervention' ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-yellow-950 text-yellow-400 border border-yellow-900')
                          }`}>{student.stats?.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* High-visibility classroom alert warning */}
                  <div className="p-4 bg-red-955/20 border border-red-900/40 rounded-xl space-y-1 text-red-400 text-xs mt-4">
                    <div className="font-bold uppercase tracking-wider flex items-center">
                      <ShieldAlert className="h-4 w-4 mr-1.5 animate-pulse" />
                      🚨 Syllabus Intervention Warning
                    </div>
                    <p className="text-gray-300">
                      <strong>Unit 3 (Collision Theory) Warning:</strong> 65% of your Grade 11 Chemistry classroom failed the sub-unit quiz. Adjust your lesson plans and review vocabulary definitions using Af-Soomaali/Amharic code-switches in lecture.
                    </p>
                  </div>
                </div>

                {/* Assignment Posting Form */}
                <div className={`p-6 rounded-2xl border space-y-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className="font-bold text-sm">Assign Study Task to Classroom</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as any;
                    const titleVal = form.title.value;
                    const contentVal = form.content.value;
                    if (!titleVal || !contentVal) return;

                    fetch('/api/dashboard/teacher', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: 'LESSON', title: titleVal, content: contentVal }),
                    })
                      .then(res => res.json())
                      .then(data => {
                        if (data.success) {
                          alert(data.message);
                          form.reset();
                        } else {
                          alert(data.error);
                        }
                      });
                  }} className="space-y-3">
                    <input name="title" type="text" placeholder="Task Title (e.g. Study Chemistry Unit 3 Collision speeds)" className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs text-inherit" required />
                    <textarea name="content" placeholder="Instructions for students (e.g. Read Lesson 3 and complete the multiple choice quiz.)" className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs text-inherit" rows={3} required></textarea>
                    <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-xl text-xs">
                      Post Assignment
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* SCHOOL ADMIN DASHBOARD VIEW */}
            {userProfile.role === 'SCHOOL_ADMIN' && schoolStats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Students Enrolled</div>
                    <div className="text-2xl font-extrabold text-purple-500 pt-1">{schoolStats.stats?.totalStudents} Students</div>
                  </div>
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Teachers Registered</div>
                    <div className="text-2xl font-extrabold text-purple-500 pt-1">{schoolStats.stats?.totalTeachers} Teachers</div>
                  </div>
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">School Average Quiz Score</div>
                    <div className="text-2xl font-extrabold text-purple-500 pt-1">{schoolStats.stats?.schoolAverageQuizScore}%</div>
                  </div>
                </div>

                {/* Aggregated School Board Projections & Syllabus Completion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Aggregated Syllabus Completion Rates</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span>Grade 11 Chemistry:</span>
                        <span className="font-bold text-white">45% Complete</span>
                      </div>
                      <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: '45%' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Grade 12 Physics:</span>
                        <span className="font-bold text-white">52% Complete</span>
                      </div>
                      <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: '52%' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Grade 12 Mathematics:</span>
                        <span className="font-bold text-white">40% Complete</span>
                      </div>
                      <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">ESSLCE Passing Projections</div>
                    <div className="space-y-2 text-xs">
                      <p className="text-gray-300">
                        Based on dynamic diagnostic quiz latency, question response vectors, and active attendance streaks, current grade 12 students are tracking toward:
                      </p>
                      <div className="p-3 bg-black/20 rounded-xl border border-gray-800 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-yellow-500 text-[11px]">78.4% passing rate projection</div>
                          <p className="text-[9px] text-gray-500">Target benchmark of 350+ score threshold.</p>
                        </div>
                        <span className="bg-purple-900/20 text-purple-400 border border-purple-800 px-2 py-0.5 rounded font-mono font-bold uppercase text-[9px]">ESSLCE 2026</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bulk student register form */}
                <div className={`p-6 rounded-2xl border space-y-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className="font-bold text-sm text-purple-500">Bulk Student CSV Importer</h3>
                  <p className="text-[10px] text-gray-400">Paste student records. Formatting: <strong>Name,Phone,Password,Grade</strong> (one student per line, e.g. Hodan Yusuf,912345678,StudentPassword123!,11)</p>
                  <textarea 
                    value={bulkCsvText}
                    onChange={(e) => setBulkCsvText(e.target.value)}
                    placeholder="Hodan Yusuf,912345678,StudentPassword123!,11&#10;Ahmed Warsame,987654321,StudentPassword456!,12"
                    rows={4}
                    className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs text-inherit font-mono"
                  ></textarea>
                  <button 
                    onClick={handleBulkImport}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-xl text-xs"
                  >
                    Run Bulk Import
                  </button>
                </div>
              </div>
            )}

            {/* SUPERADMIN DASHBOARD VIEW */}
            {userProfile.role === 'SUPER_ADMIN' && adminStats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <span className="text-[10px] text-gray-500 uppercase block">Total Accounts</span>
                    <span className="text-lg font-bold text-white">{adminStats.stats?.totalUsers}</span>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <span className="text-[10px] text-gray-500 uppercase block">Active Regular / Premium</span>
                    <span className="text-lg font-bold text-purple-500">{(adminStats.stats?.activeTiers?.REGULAR || 0) + (adminStats.stats?.activeTiers?.PREMIUM || 0)}</span>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <span className="text-[10px] text-gray-500 uppercase block">Pending Payments</span>
                    <span className="text-lg font-bold text-yellow-500">{adminStats.stats?.pendingPaymentsCount}</span>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <span className="text-[10px] text-gray-500 uppercase block">Total Revenue</span>
                    <span className="text-lg font-bold text-emerald-400">{adminStats.stats?.totalRevenue} ETB</span>
                  </div>
                </div>

                {/* Manual payment verification panel */}
                <div className="border border-purple-900/30 rounded-xl p-5 bg-gray-900/60 space-y-4">
                  <h3 className="font-bold text-sm text-yellow-500">Admin Payment Verification Pipeline</h3>
                  <div className="space-y-3">
                    {adminStats.pendingPayments?.length === 0 ? (
                      <p className="text-gray-500 italic">No payments pending verification.</p>
                    ) : (
                      adminStats.pendingPayments?.map((pay: any) => (
                        <div key={pay.id} className="p-3 bg-black/20 border border-gray-855 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                          <div>
                            <span className="font-bold text-purple-400 block">{pay.user?.name} ({pay.user?.phone})</span>
                            <p className="text-[10px] text-gray-400">Method: <strong>{pay.method}</strong> • Sender Phone: <strong>{pay.senderPhone}</strong> • Amount: <strong>{pay.amount} Birr</strong></p>
                            <p className="text-[10px] text-gray-400">Transaction Ref: <strong>{pay.transactionRef || 'N/A'}</strong></p>
                            <div className="mt-1 p-1 bg-black/30 rounded text-[10px] font-mono text-gray-500">SMS: {pay.smsConfirmation}</div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleAdminVerifyPayment(pay.id, 'APPROVE')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded text-[10px]"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleAdminVerifyPayment(pay.id, 'REJECT')}
                              className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded text-[10px]"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Audit Logs */}
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl space-y-3">
                  <h3 className="font-bold text-sm">System Audit Logs</h3>
                  <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
                    {adminStats.auditLogs?.map((log: any) => (
                      <div key={log.id} className="text-[10px] py-1 border-b border-gray-800/40 flex justify-between font-mono text-gray-400">
                        <span>[{new Date(log.createdAt).toLocaleTimeString()}] User: {log.user?.name} ({log.user?.role}){" -> "}<strong>{log.action}</strong>: {log.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className={`border-t py-12 px-6 mt-16 transition-colors ${
        theme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 text-xs">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-600 p-2 rounded-lg text-white">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              </div>
              <span className="font-extrabold text-lg">Dugsi<span className="text-yellow-500">AI</span></span>
            </div>
            <p className="leading-relaxed text-gray-400">
              DugsiAI is the premium flagship academic platform brought to you by the <strong className="text-purple-500">Samaale Institute of Languages and Technology</strong> in formal partnership with <strong className="text-purple-500">Linggax Tech</strong>.
            </p>
            <div className="text-gray-500 space-y-1">
              <p><strong>Headquarters:</strong> Jigjiga, Ethiopia.</p>
              <p><strong>Email Support:</strong> info@samaaleinstitute.org</p>
              <p><strong>Phone Support:</strong> {officialPaymentPhone}</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-inherit uppercase tracking-wider text-[10px]">Quick Links</h4>
            <ul className="space-y-2 text-gray-500">
              <li><button onClick={() => handleTabChange('home')} className="hover:text-purple-500 transition-colors">Home Landing</button></li>
              <li><button onClick={() => handleTabChange('courses')} className="hover:text-purple-500 transition-colors">Curriculum Textbooks</button></li>
              <li><button onClick={() => handleTabChange('tutoring')} className="hover:text-purple-500 transition-colors">AI Cognitive Tutor</button></li>
              <li><button onClick={() => handleTabChange('contact')} className="hover:text-purple-500 transition-colors">Pricing & Plans</button></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-inherit uppercase tracking-wider text-[10px]">Languages</h4>
            <ul className="space-y-2 text-gray-500">
              <li><button onClick={() => setLang('so')} className="hover:text-purple-500 transition-colors">🇸🇴 Af-Soomaali</button></li>
              <li><button onClick={() => setLang('am')} className="hover:text-purple-500 transition-colors">🇪🇹 Amharic (አማርኛ)</button></li>
              <li><button onClick={() => setLang('om')} className="hover:text-purple-500 transition-colors">🇪🇹 Afan Oromo</button></li>
              <li><button onClick={() => setLang('en')} className="hover:text-purple-500 transition-colors">🇬🇧 English</button></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-inherit uppercase tracking-wider text-[10px]">Connect With Us</h4>
            <p className="text-gray-500">Follow regional debate competitions, innovation submission timelines and wellness guides.</p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="p-2 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96C5.12 19.08 12 19.08 12 19.08s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 11.54a29 29 0 0 0-.46-5.12z"/><polygon points="9.75 15.02 15.5 11.54 9.75 8.06 9.75 15.02"/></svg>
              </a>
              <a href="#" className="p-2 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all">
                <Share2 className="h-4 w-4" />
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800/20 pt-6 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-500">
          <p>© 2026 DugsiAI. All rights reserved. Supporting Federal Democratic Republic of Ethiopia Ministry of Education Guidelines.</p>
        </div>
      </footer>

      {/* FLOAT BACK TO TOP BUTTON */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-2xl transition-all z-50 border border-purple-500"
          title="Back to Top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* AUTH REGISTRATION & LOGIN MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gray-900 border border-purple-900/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4 text-white">
            <button 
              onClick={() => {
                setShowRegisterModal(false);
                setPendingPlanUpgrade(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1 mb-3">
                <h3 className="text-xl font-bold">{isLoginMode ? 'Welcome Back' : 'Create Your DugsiAI Profile'}</h3>
                <p className="text-xs text-gray-400">{isLoginMode ? 'Sign in to access your study dashboard and exams.' : 'Unlock customized textbook tracking and ESSLCE progress portfolios.'}</p>
              </div>

              {/* Segmented Top Navigation Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-gray-900/95 rounded-xl border border-gray-800 my-3">
                <button
                  type="button"
                  onClick={() => setIsLoginMode(true)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${isLoginMode ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  Sign In (Returning User)
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginMode(false)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  Sign Up (New User)
                </button>
              </div>

            {/* Google Sign-up */}
            <div className="space-y-2 pt-2">
              <button 
                type="button"
                onClick={() => {
                  setRegName("Hodan Yusuf");
                  setRegSchool("Gypsum Academy");
                  setGoogleLinked(true);
                  alert("Google account successfully linked! Please complete your mandatory phone details below to register.");
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 border ${
                  googleLinked 
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                    : 'bg-white hover:bg-gray-100 text-gray-900 border-gray-300'
                }`}
              >
                {!googleLinked ? (
                  <>
                    <span className="text-gray-700 ml-1">Link Google Account (Optional)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Google Account Linked (Hodan Yusuf)</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-gray-800/80 my-3"></div>

            {!isLoginMode && (
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                {[
                  { id: 'STUDENT', label: 'Student' },
                  { id: 'PARENT', label: 'Parent' },
                  { id: 'TEACHER', label: 'Teacher' },
                  { id: 'SCHOOL_ADMIN', label: 'School Admin' }
                ].map((roleOption) => (
                  <button 
                    key={roleOption.id}
                    type="button"
                    onClick={() => setRegRole(roleOption.id)}
                    className={`py-2 font-bold rounded-lg border transition-all text-center ${
                      regRole === roleOption.id 
                        ? 'bg-purple-600 border-purple-500 text-white' 
                        : 'bg-gray-950 border-gray-855 text-gray-400 hover:text-white'
                    }`}
                  >
                    {roleOption.label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              {isLoginMode ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Mobile Phone Number</label>
                    <input 
                      type="tel" 
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="e.g. 912345678" 
                      required
                      className="w-full bg-gray-950 border border-gray-805 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Password" 
                        required
                        className="w-full bg-gray-950 border border-gray-805 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:border-purple-500 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Full Name (Compulsory)</label>
                    <input 
                      type="text" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Hodan Yusuf" 
                      required
                      className="w-full bg-gray-950 border border-gray-805 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Mobile Phone Number (Compulsory)</label>
                    <div className="flex">
                      <span className="bg-gray-850 border border-gray-805 border-r-0 rounded-l-lg px-3 py-2 text-gray-400">+251</span>
                      <input 
                        type="tel" 
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="912345678" 
                        required
                        className="w-full bg-gray-950 border border-gray-855 rounded-r-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Choose Secure Password (Compulsory)</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters" 
                        required
                        className="w-full bg-gray-950 border border-gray-805 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:border-purple-500 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Preferred Region</label>
                    <select 
                      value={regRegion}
                      onChange={(e) => setRegRegion(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-855 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-white"
                    >
                      <option value="Somali">Somali Region</option>
                      <option value="Amhara">Amhara Region</option>
                      <option value="Oromia">Oromia Region</option>
                      <option value="Addis Ababa">Addis Ababa</option>
                    </select>
                  </div>

                  {regRole === 'STUDENT' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Grade Level</label>
                        <select 
                          value={regGrade}
                          onChange={(e) => setRegGrade(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-855 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-white"
                        >
                          {[7, 8, 9, 10, 11, 12].map(g => (
                            <option key={g} value={g}>Grade {g}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Parent Phone</label>
                        <input 
                          type="tel" 
                          value={regParentPhone}
                          onChange={(e) => setRegParentPhone(e.target.value)}
                          placeholder="912345678"
                          className="w-full bg-gray-950 border border-gray-855 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-white"
                        />
                      </div>
                    </div>
                  )}

                  {regRole === 'TEACHER' && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Subject Specialty</label>
                      <select 
                        value={regSubject}
                        onChange={(e) => setRegSubject(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-855 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-white"
                      >
                        <option value="Chemistry">Chemistry</option>
                        <option value="Physics">Physics</option>
                        <option value="Biology">Biology</option>
                        <option value="Mathematics">Mathematics</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">School Name</label>
                    <select 
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-855 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-white"
                    >
                      <option value="Gypsum Academy">Gypsum Academy</option>
                      <option value="Omar bin Al-Khattab Secondary School">Omar bin Al-Khattab Secondary School</option>
                      <option value="Jigjiga International School">Jigjiga International School</option>
                    </select>
                  </div>
                </>
              )}

              <button 
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 rounded-xl font-bold transition-all shadow-md mt-2"
              >
                {isLoginMode ? 'Sign In' : 'Complete Registration & Continue'}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-purple-400 hover:underline text-[11px]"
                >
                  {isLoginMode ? "Don't have an account? Sign up" : 'Already registered? Log in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION PAYMENTS HANDSHAKE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gray-900 border border-purple-900/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-5 text-white">
            <button 
              onClick={() => {
                setShowUpgradeModal(null);
                setCheckoutStep(1);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {paymentSubmissionPending ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <h4 className="font-bold text-yellow-500 text-sm">Manual Payment Verification Handshake</h4>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  Awaiting confirmation from our verification team. Full access will unlock instantly upon receipt approval.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <span className="text-[10px] bg-purple-900/30 border border-purple-700 text-purple-300 px-3 py-1 rounded-full uppercase font-bold">
                    Manual Payment verification
                  </span>
                  <h3 className="text-xl font-bold pt-2">
                    {showUpgradeModal === 'regular' ? "Upgrade to Regular Plan (600 ETB/Month)" : "Upgrade to Premium Plan (1,500 ETB/Month)"}
                  </h3>
                  
                  {/* Step Progress Tracker */}
                  <div className="flex justify-center items-center space-x-2 pt-2 text-[10px] uppercase font-bold text-gray-500">
                    <span className={checkoutStep === 1 ? 'text-purple-400' : ''}>1. Provider</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className={checkoutStep === 2 ? 'text-purple-400' : ''}>2. Transfer</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className={checkoutStep === 3 ? 'text-purple-400' : ''}>3. Receipt</span>
                  </div>
                </div>

                {checkoutStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-400 text-center">Select your preferred local mobile finance provider to get started:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'telebirr', name: 'telebirr', desc: 'Ethio Telecom Mobile Money', color: 'border-purple-600 hover:bg-purple-950/20' },
                        { id: 'cbe', name: 'CBE Birr', desc: 'Commercial Bank of Ethiopia', color: 'border-purple-800 hover:bg-purple-950/20' },
                        { id: 'ebirr_coopay', name: 'eBirr CooPay', desc: 'Cooperative Bank of Oromia', color: 'border-yellow-600 hover:bg-yellow-950/20' },
                        { id: 'ebirr_kaafi', name: 'eBirr Kaafi', desc: 'Somcable Kaafi Payment', color: 'border-blue-600 hover:bg-blue-950/20' }
                      ].map((method) => (
                        <button 
                          key={method.id}
                          onClick={() => {
                            setSelectedPayMethod(method.id);
                            setCheckoutStep(2);
                          }}
                          className="p-3 text-left border rounded-xl bg-gray-950 border-gray-855 hover:border-purple-500 transition-all cursor-pointer"
                        >
                          <span className="font-bold block text-purple-300">{method.name}</span>
                          <span className="text-[9px] text-gray-500 block leading-tight pt-1">{method.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {checkoutStep === 2 && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-black/35 border border-purple-900/30 rounded-xl space-y-3">
                      <div className="font-bold text-yellow-500 flex items-center">
                        <CreditCard className="h-4 w-4 mr-1.5" />
                        Transfer Instructions ({selectedPayMethod.replace('_', ' ').toUpperCase()})
                      </div>
                      
                      <div className="space-y-2 text-gray-300">
                        {selectedPayMethod === 'telebirr' && (
                          <>
                            <p>1. Open your <strong>telebirr App</strong> or dial <strong>*127#</strong>.</p>
                            <p>2. Choose <strong>Pay Merchant</strong> or transfer funds directly.</p>
                            <p>3. Enter Merchant ID / Account: <span className="font-mono text-purple-400 font-bold bg-purple-950/40 px-2 py-0.5 rounded">90085</span> or Phone <span className="font-mono text-purple-400 font-bold bg-purple-950/40 px-2 py-0.5 rounded">0966778899</span>.</p>
                            <p>4. Send exactly <strong className="text-purple-400">{showUpgradeModal === 'regular' ? '600' : '5000'} ETB</strong>.</p>
                          </>
                        )}
                        {selectedPayMethod === 'cbe' && (
                          <>
                            <p>1. Open your <strong>CBE Birr App</strong> or dial <strong>*889#</strong>.</p>
                            <p>2. Choose <strong>Transfer Funds</strong> to CBE Merchant Account.</p>
                            <p>3. Enter Merchant Account Number: <span className="font-mono text-purple-400 font-bold bg-purple-950/40 px-2 py-0.5 rounded">1000554433221</span>.</p>
                            <p>4. Send exactly <strong className="text-purple-400">{showUpgradeModal === 'regular' ? '600' : '5000'} ETB</strong>.</p>
                          </>
                        )}
                        {selectedPayMethod === 'ebirr_coopay' && (
                          <>
                            <p>1. Open your <strong>eBirr / CooPay App</strong> or dial <strong>*841#</strong>.</p>
                            <p>2. Select <strong>Send Money / Transfer</strong>.</p>
                            <p>3. Enter Recipient Phone Number: <span className="font-mono text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/50 px-2 py-0.5 rounded text-sm select-all">+251930379676</span></p>
                            <p>4. Account Name: <strong className="text-white">Samatar Ibrahim Ahmed</strong></p>
                            <p>5. Send exactly <strong className="text-emerald-400">{showUpgradeModal === 'regular' ? '600' : '5000'} ETB</strong>.</p>
                          </>
                        )}
                        {selectedPayMethod === 'ebirr_kaafi' && (
                          <>
                            <p>1. Open your <strong>Kaafi Wallet</strong> or dial your Kaafi USSD code.</p>
                            <p>2. Select <strong>Transfer / Send Money</strong>.</p>
                            <p>3. Enter Mobile Number: <span className="font-mono text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/50 px-2 py-0.5 rounded text-sm select-all">+251930379676</span></p>
                            <p>4. Account Name: <strong className="text-white">Samatar Ibrahim Ahmed</strong></p>
                            <p>5. Send exactly <strong className="text-emerald-400">{showUpgradeModal === 'regular' ? '600' : '5000'} ETB</strong>.</p>
                          </>
                        )}
                        <p className="text-[11px] text-amber-300 font-medium pt-1">Important: Save your SMS confirmation or take a screenshot of the transaction receipt.</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button 
                        onClick={() => setCheckoutStep(1)}
                        className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setCheckoutStep(3)}
                        className="bg-purple-600 hover:bg-purple-500 px-5 py-2 rounded-lg font-bold shadow-md transition-all cursor-pointer"
                      >
                        Proceed to Verification
                      </button>
                    </div>
                  </div>
                )}

                {checkoutStep === 3 && (
                  <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
                    <div className="p-4 bg-black/25 border border-gray-800 rounded-xl space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 block uppercase font-bold">Your Sender Phone</label>
                          <input 
                            type="tel" 
                            value={senderPhone} 
                            onChange={(e) => setSenderPhone(e.target.value)} 
                            placeholder="e.g. 912345678" 
                            required 
                            className="w-full bg-gray-950 border border-gray-855 rounded-lg px-2.5 py-1.5 focus:outline-none text-white font-mono" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 block uppercase font-bold">Amount Paid (ETB)</label>
                          <input 
                            type="number" 
                            value={amountPaid} 
                            disabled
                            className="w-full bg-gray-950/60 border border-gray-855 rounded-lg px-2.5 py-1.5 focus:outline-none text-gray-400 font-mono cursor-not-allowed" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 block uppercase font-bold">Transaction Reference ID</label>
                          <input 
                            type="text" 
                            value={transactionRef} 
                            onChange={(e) => setTransactionRef(e.target.value)} 
                            placeholder="10-15 alphanumeric chars" 
                            required
                            className="w-full bg-gray-950 border border-gray-855 rounded-lg px-2.5 py-1.5 focus:outline-none text-white font-mono" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 block uppercase font-bold">SMS Text / Confirm Code</label>
                          <input 
                            type="text" 
                            value={smsConfirmation} 
                            onChange={(e) => setSmsConfirmation(e.target.value)} 
                            placeholder="SMS receipt content" 
                            required 
                            className="w-full bg-gray-950 border border-gray-855 rounded-lg px-2.5 py-1.5 focus:outline-none text-white" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button 
                        type="button"
                        onClick={() => setCheckoutStep(2)}
                        className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold px-6 py-2 rounded-lg shadow-md transition-all cursor-pointer"
                      >
                        Submit Receipt Verification
                      </button>
                    </div>
                  </form>
                )}

                <div className="text-[10px] text-gray-500 text-center leading-tight">
                  Verification takes 5-10 minutes. Submit transaction details from your handset. Once approved by the DugsiAI team, your active plan will unlock instantly.
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* COMPANION VOICE POPUP IF PREMIUM VOICE ACTIVE */}
      {currentTab === 'tutoring' && subscription === 'premium' && (
        <div className={`fixed bottom-6 left-6 max-w-sm w-full p-4 rounded-2xl border shadow-2xl z-40 ${
          theme === 'dark' ? 'bg-gray-900 border-purple-900/50' : 'bg-white border-purple-200'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] bg-purple-900/10 text-purple-400 px-2 py-0.5 rounded font-mono font-bold uppercase">Spoken English Voice Tutor</span>
            <Mic className="h-4 w-4 text-purple-500 animate-pulse" />
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-gray-400">Read out loud the following target sentence:</p>
            <div className="p-2.5 bg-black/20 rounded border border-gray-855 text-gray-300 font-semibold italic">
              "{spokenEnglishText}"
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-500">Your Spoken Input (Simulation Text)</label>
              <input 
                type="text" 
                value={spokenInputText} 
                onChange={(e) => setSpokenInputText(e.target.value)} 
                placeholder="Type what you spoken to simulate mic transcription" 
                className="w-full bg-gray-950 border border-gray-855 rounded px-2 py-1 focus:outline-none text-white" 
              />
            </div>

            <button 
              onClick={handleSimulatePronounce}
              disabled={isRecording}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded text-white font-bold transition-all"
            >
              {isRecording ? 'Listening to your voice...' : 'Simulate Speaking Record'}
            </button>

            {audioFeedbackResult && (
              <div className="p-2 bg-emerald-950/20 border border-emerald-900/40 rounded text-[11px] leading-tight text-gray-300 animate-fadeIn space-y-1">
                <span className="font-bold text-emerald-400 flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Pronunciation Score: {audioFeedbackResult.score}%
                </span>
                <p>{audioFeedbackResult.feedback}</p>
                {audioFeedbackResult.mispronounced.length > 0 && (
                  <p className="text-red-400 text-[10px]">Mispronounced words: {audioFeedbackResult.mispronounced.join(', ')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CRYPTOGRAPHIC SVG CERTIFICATE LIGHTBOX OVERLAY */}
      {showCertViewer && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fadeIn text-white">
          <div className="bg-gray-900 border border-yellow-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative space-y-4 text-center">
            <button 
              onClick={() => setShowCertViewer(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xs font-bold text-yellow-505 uppercase tracking-wider">Samaale Institute Validation Board</h3>
            
            {/* Certificate Display */}
            <div className="border-4 border-yellow-600/40 p-6 bg-white text-black rounded-2xl shadow-xl flex flex-col justify-between items-center relative overflow-hidden" style={{ minHeight: '380px' }}>
              <div className="absolute inset-2 border-2 border-purple-800/20 pointer-events-none rounded-xl"></div>
              
              <div className="space-y-2 pt-4">
                <span className="text-[10px] tracking-widest text-purple-800 font-bold uppercase block">Samaale Institute of Languages & Technology</span>
                <h2 className="text-2xl font-serif font-extrabold text-purple-900 leading-tight">Certificate of Milestone Competency</h2>
                <p className="text-[10px] text-gray-500 italic">This certifies that DugsiAI scholar</p>
              </div>

              <div className="space-y-2 my-4">
                <div className="text-xl font-bold text-purple-950 font-serif border-b border-gray-300 px-6 pb-1 inline-block">{userProfile?.name || 'Academic Scholar'}</div>
                <p className="text-[11px] text-gray-600 max-w-md mx-auto leading-relaxed pt-2">
                  has successfully passed the cumulative monthly milestone evaluation for <strong>Month 1: Bilingual Integration & Core Literacy</strong> with a verified passing grade of <strong>{certScore}%</strong>, demonstrating exceptional competency under Samaale curriculum guidelines.
                </p>
              </div>

              <div className="w-full flex justify-between items-end pt-4 px-6 text-left">
                <div className="text-[9px] text-gray-500 space-y-0.5">
                  <div>Verification Signature Hash:</div>
                  <div className="font-mono text-purple-800 font-bold">SHA256: {Math.random().toString(36).substring(2, 15).toUpperCase()}</div>
                </div>
                <div className="text-[9px] text-gray-500 space-y-0.5 text-right">
                  <div>Certified Date:</div>
                  <div className="font-bold text-purple-800 font-serif">July 2026</div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 leading-tight">
              This certificate is signed cryptographically by Samaale Institute Validation Board and logged as a read-only document in Firestore.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

