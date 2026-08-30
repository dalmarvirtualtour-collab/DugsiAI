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
  Facebook,
  Youtube,
  Share2,
  Tv,
  Mail,
  MapPin,
  Phone,
  Bookmark,
  Sparkle,
  GraduationCap,
  Building
} from 'lucide-react';

export default function App() {
  // Theme state (Dark/Light Mode) - defaults to dark to preserve original premium look
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('dugsiai_theme');
    return saved || 'dark';
  });

  // Language state: 'en' | 'so' | 'am' | 'om'
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('dugsiai_lang');
    return saved || 'en';
  });

  // Current Navigation Tab: 'home' | 'courses' | 'about' | 'tutoring' | 'teachers' | 'blog' | 'contact'
  const [currentTab, setCurrentTab] = useState('home');
  const [role, setRole] = useState('student'); // 'student' | 'parent' | 'teacher' | 'admin'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Authentication & Registration state
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // { name, phone, school, role }
  const [pendingPlanUpgrade, setPendingPlanUpgrade] = useState(null); // Temp hold plan to redirect after register

  // Subscription Plan Level: 'freemium' | 'regular' | 'premium'
  const [subscription, setSubscription] = useState('freemium');
  const [freeMessagesLeft, setFreeMessagesLeft] = useState(5);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [authRole, setAuthRole] = useState('student');

  // Input states for form submissions
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSchool, setRegSchool] = useState('Gypsum Academy');
  const [confirmationChannel, setConfirmationChannel] = useState('telegram'); // 'telegram' | 'whatsapp'
  const [googleLinked, setGoogleLinked] = useState(false);

  // Interactive FAQ States
  const [activeFaq, setActiveFaq] = useState(null);

  // Homework scanner simulation
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");

  // AI Chat States
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Welcome to DugsiAI! I am your companion for the Ethiopian Grade 7-12 curriculum. Ask me anything from your chapters, request ESSLCE exam questions, or practice speaking.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Audio simulator states
  const [isRecording, setIsRecording] = useState(false);
  const [spokenEnglishText, setSpokenEnglishText] = useState("The beautiful landscape of Jigjiga has inspired many generational poets.");
  const [feedbackAudio, setFeedbackAudio] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(100);

  // Quiz State
  const [selectedAnswer, setSelectedAnswer] = useState(null);
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

  // Save preferences
  useEffect(() => {
    localStorage.setItem('dugsiai_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('dugsiai_lang', lang);
  }, [lang]);

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

  // Multi-Language Translation Map
  const translations = {
    en: {
      tagline: "Building Conceptual Understanding of Ethiopian students that speak in three local languages",
      home: "Home",
      courses: "Courses",
      about: "About",
      tutoring: "Tutoring",
      teachers: "Teachers",
      blog: "Blog",
      contact: "Contact",
      registration: "Registration",
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
    },
    so: {
      tagline: "Dhisidda Garashada Ardayda Itoobiya ee ku hadasha saddexda luqadood ee deegaanka",
      home: "Hoyga",
      courses: "Maadooyinka",
      about: "Nagu Saabsan",
      tutoring: "Cawinaada",
      teachers: "Macalimiinta",
      blog: "Baloogga",
      contact: "Xiriirka",
      registration: "Diiwaangelinta",
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
    },
    am: {
      tagline: "በሶስት ሀገር በቀል ቋንቋዎች ለሚናገሩ የኢትዮጵያ ተማሪዎች ግንዛቤን መገንባት",
      home: "ዋና ገጽ",
      courses: "ትምህርቶች",
      about: "ስለ እኛ",
      tutoring: "አጋዥ አስተማሪ",
      teachers: "አስተማሪዎች",
      blog: "ብሎግ",
      contact: "እውቂያ",
      registration: "ምዝገባ",
      taglineSubtitle: "ከክፍል 7 እስከ ክፍል 12 አጠቃላይ የፈተና ዝግጅት",
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
    },
    om: {
      tagline: "Hubannoo barattoota Itoophiyaa afaanota sadii dubbatan ijaaruu",
      home: "Mana",
      courses: "Koorsoota",
      about: "Waa'ee Keenya",
      tutoring: "Gorsa",
      teachers: "Barsiisota",
      blog: "Biloogii",
      contact: "Quunnamtii",
      registration: "Galmeessa",
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
    }
  };

  const currentLangText = translations[lang] || translations.en;

  // Intercept subscription clicks to require registration first
  const handleUpgradeClick = (planName) => {
    if (!isRegistered) {
      setPendingPlanUpgrade(planName);
      setShowRegisterModal(true);
    } else {
      setShowUpgradeModal(planName);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    if (subscription === 'freemium' && freeMessagesLeft <= 0) {
      handleUpgradeClick('regular');
      return;
    }

    const newUserMessage = { sender: 'user', text: inputMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    
    if (subscription === 'freemium') {
      setFreeMessagesLeft(prev => prev - 1);
    }

    setIsTyping(true);
    
    setTimeout(() => {
      let aiText = "Interesting academic question! Based on the Ethiopian National Curriculum guidelines, we should examine this conceptually. Would you like me to construct an ESSLCE mock MCQ on this specific unit?";
      const lower = inputMessage.toLowerCase();
      if (lower.includes('chemistry') || lower.includes('reaction')) {
        aiText = "Under Grade 11 Chemistry Unit 3, reaction speeds depend heavily on collision properties. Reactants must collide with sufficient kinetic energy exceeding activation thresholds and perfect alignment.";
      } else if (lower.includes('matrix') || lower.includes('matrices') || lower.includes('math')) {
        aiText = "In Grade 11 Mathematics Unit 2, a determinant of a 2x2 matrix [a, b; c, d] is calculated precisely as (ad - bc). Let's solve one together.";
      } else if (lower.includes('biology') || lower.includes('cell')) {
        aiText = "Grade 9 Biology Unit 1 covers cellular structures. Remember, plant cells contain cellulose cell walls and chloroplasts for energy capture, unlike animal counterparts.";
      } else if (lower.includes('exam') || lower.includes('esslce') || lower.includes('matric')) {
        aiText = "I have indexed over 10,000 official ESSLCE questions. Let's practice a high-yield physics question about kinematics.";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
      setIsTyping(false);
    }, 1000);
  };

  // Simulate Homework scanner behavior
  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanResult("");
    setTimeout(() => {
      setIsScanning(false);
      setScanResult("Scanned Grade 11 Physics Equation: F = G*(m1*m2)/r^2. Explanation: This is Newton's Law of Universal Gravitation. The force of attraction is directly proportional to the product of their masses and inversely proportional to the square of the distance between them.");
    }, 2050);
  };

  // Handle registration & redirect to pending payment tier
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      alert("Please fill in your name and phone number.");
      return;
    }
    
    const profile = {
      name: regName,
      phone: regPhone,
      school: regSchool,
      role: authRole,
      channel: confirmationChannel
    };

    setUserProfile(profile);
    setIsRegistered(true);
    setShowRegisterModal(false);
    
    // Redirect to subscription portal if they clicked one prior
    if (pendingPlanUpgrade) {
      const targetPlan = pendingPlanUpgrade;
      setPendingPlanUpgrade(null);
      setTimeout(() => {
        setShowUpgradeModal(targetPlan);
      }, 300);
    } else {
      alert(`Welcome to DugsiAI, ${profile.name}! Your account has been registered. A confirmation text was dispatched via ${confirmationChannel === 'whatsapp' ? 'WhatsApp' : 'Telegram'}.`);
    }
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
      
      {/* HEADER NAVIGATION */}
      <header className={`sticky top-0 z-40 px-4 py-3 border-b transition-colors ${
        theme === 'dark' ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
      } backdrop-blur`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Partners */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="bg-purple-600 p-2.5 rounded-xl shadow-lg border border-purple-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-wider">
                  Dugsi<span className="text-yellow-500">AI</span>
                </span>
                <span className="text-xs bg-purple-900/80 text-purple-300 px-2 py-0.5 rounded border border-purple-700 font-mono">v3.1 Flash</span>
              </div>
              <p className="text-[10px] text-gray-400 tracking-tight">Samaale Institute x Linggax Tech</p>
            </div>
          </div>

          {/* Expanded Desktop Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button 
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'home' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.home}
            </button>
            <button 
              onClick={() => setCurrentTab('courses')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'courses' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.courses}
            </button>
            <button 
              onClick={() => setCurrentTab('about')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'about' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.about}
            </button>
            <button 
              onClick={() => setCurrentTab('tutoring')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'tutoring' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.tutoring}
            </button>
            <button 
              onClick={() => setCurrentTab('teachers')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'teachers' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.teachers}
            </button>
            <button 
              onClick={() => setCurrentTab('blog')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'blog' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.blog}
            </button>
            <button 
              onClick={() => setCurrentTab('contact')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'contact' ? 'bg-purple-600 text-white shadow' : 'hover:bg-purple-600/10 hover:text-purple-500'
              }`}
            >
              {currentLangText.contact}
            </button>
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
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:scale-105 duration-200 border border-purple-400/30 flex items-center space-x-1.5"
            >
              <User className="h-3.5 w-3.5" />
              <span>{isRegistered ? userProfile?.name : currentLangText.registration}</span>
            </button>

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
            onClick={() => { setCurrentTab('home'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.home}
          </button>
          <button 
            onClick={() => { setCurrentTab('courses'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.courses}
          </button>
          <button 
            onClick={() => { setCurrentTab('about'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.about}
          </button>
          <button 
            onClick={() => { setCurrentTab('tutoring'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.tutoring}
          </button>
          <button 
            onClick={() => { setCurrentTab('teachers'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.teachers}
          </button>
          <button 
            onClick={() => { setCurrentTab('blog'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.blog}
          </button>
          <button 
            onClick={() => { setCurrentTab('contact'); setIsMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-600/10 text-xs font-bold"
          >
            {currentLangText.contact}
          </button>
          <button 
            onClick={() => { setShowRegisterModal(true); setIsMobileMenuOpen(false); }}
            className="w-full bg-purple-600 text-white py-2 rounded-lg text-xs font-bold text-center"
          >
            {currentLangText.registration}
          </button>
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
                  onClick={() => setCurrentTab('courses')}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-lg transition-all"
                >
                  Start Learning Now
                </button>
                <button 
                  onClick={() => setCurrentTab('tutoring')}
                  className={`border font-bold px-6 py-3 rounded-xl text-xs transition-all ${
                    theme === 'dark' ? 'border-gray-800 hover:bg-gray-900 text-white' : 'border-gray-300 hover:bg-gray-100 text-gray-900'
                  }`}
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
                {/* Grade 7 */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <h3 className="font-extrabold text-lg text-purple-500 mb-2">Grade 7</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">Core subjects based on the new Ethiopian curriculum.</p>
                  <span className="text-[10px] bg-purple-900/10 text-purple-400 px-2.5 py-1 rounded-full font-bold border border-purple-800/30">New Curriculum Locked</span>
                </div>

                {/* Grade 8 */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <h3 className="font-extrabold text-lg text-purple-500 mb-2">Grade 8</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">Core subjects based on the new Ethiopian curriculum.</p>
                  <span className="text-[10px] bg-purple-900/10 text-purple-400 px-2.5 py-1 rounded-full font-bold border border-purple-800/30">Ministry Exam Ready</span>
                </div>

                {/* Grade 9 */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <h3 className="font-extrabold text-lg text-purple-500 mb-1">Grade 9</h3>
                  <span className="text-xs text-yellow-500 font-bold block mb-3">11 Subjects Covered</span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-400 font-medium">
                    <div>• Biology</div>
                    <div>• Chemistry</div>
                    <div>• Physics</div>
                    <div>• Mathematics</div>
                    <div>• English</div>
                    <div>• History</div>
                    <div>• Geography</div>
                    <div>• Economics</div>
                    <div>• Info Tech</div>
                    <div>• Citizenship</div>
                    <div className="col-span-2">• Health & Physical Ed.</div>
                  </div>
                </div>

                {/* Grade 10 */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <h3 className="font-extrabold text-lg text-purple-500 mb-1">Grade 10</h3>
                  <span className="text-xs text-yellow-500 font-bold block mb-3">11 Subjects Covered</span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-400 font-medium">
                    <div>• Biology</div>
                    <div>• Chemistry</div>
                    <div>• Physics</div>
                    <div>• Mathematics</div>
                    <div>• English</div>
                    <div>• History</div>
                    <div>• Geography</div>
                    <div>• Economics</div>
                    <div>• Info Tech</div>
                    <div>• Citizenship</div>
                    <div className="col-span-2">• Health & Physical Ed.</div>
                  </div>
                </div>

                {/* Grade 11 */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <h3 className="font-extrabold text-lg text-purple-500 mb-1">Grade 11</h3>
                  <span className="text-xs text-yellow-500 font-bold block mb-3">9 Subjects • Stream-Based</span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-400 font-medium">
                    <div>• Biology</div>
                    <div>• Chemistry</div>
                    <div>• Physics</div>
                    <div>• Mathematics</div>
                    <div>• English</div>
                    <div>• Civics</div>
                    <div>• Info Tech</div>
                    <div>• Agriculture</div>
                    <div className="col-span-2">• Technical Drawing</div>
                  </div>
                </div>

                {/* Grade 12 */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <h3 className="font-extrabold text-lg text-purple-500 mb-1">Grade 12</h3>
                  <span className="text-xs text-emerald-400 font-bold block mb-3">Complete ESSLCE Preparation</span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-400 font-medium">
                    <div>• Biology</div>
                    <div>• Chemistry</div>
                    <div>• Physics</div>
                    <div>• Mathematics</div>
                    <div>• English</div>
                    <div>• Civics</div>
                    <div>• Info Tech</div>
                    <div>• Agriculture</div>
                    <div className="col-span-2">• Technical Drawing</div>
                  </div>
                </div>
              </div>

              {/* Subject features list under Subjects and Grades */}
              <div className={`p-5 rounded-2xl text-center border max-w-4xl mx-auto ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-gray-300">
                  <span className="flex items-center space-x-1"><CheckCircle2 className="h-4 w-4 text-purple-500" /> <span>AI Tutor</span></span>
                  <span className="flex items-center space-x-1"><CheckCircle2 className="h-4 w-4 text-purple-500" /> <span>Chapter-by-Chapter Learning</span></span>
                  <span className="flex items-center space-x-1"><CheckCircle2 className="h-4 w-4 text-purple-500" /> <span>Interactive Quizzes</span></span>
                  <span className="flex items-center space-x-1"><CheckCircle2 className="h-4 w-4 text-purple-500" /> <span>Mock Examinations</span></span>
                  <span className="flex items-center space-x-1"><CheckCircle2 className="h-4 w-4 text-purple-500" /> <span>Thousands of Curriculum Practice Questions</span></span>
                  <span className="flex items-center space-x-1"><CheckCircle2 className="h-4 w-4 text-purple-500" /> <span>Detailed AI Explanations</span></span>
                </div>
              </div>
            </div>

            {/* CURRICULUM LOCKED PREMIUM FEATURES INDEX */}
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-purple-500">Premium Adaptive Learning Features</h2>
                <p className="text-xs text-gray-400 max-w-md mx-auto">High-yield tools designed by linguists and educators specifically for Ethiopian regional states.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Feature 1: AI Tutor */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <MessageSquare className="h-6 w-6 text-purple-500 mb-3" />
                  <h3 className="font-bold text-sm mb-2">🤖 AI Tutor & Guide</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Chapter-by-chapter locked tutoring with step-by-step math, physics and biology explanations. Supports instant question analysis.
                  </p>
                </div>

                {/* Feature 2: EUEE Simulator */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <Award className="h-6 w-6 text-yellow-500 mb-3" />
                  <h3 className="font-bold text-sm mb-2">🎓 ESSLCE/EUEE Simulator</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    A mock exam dashboard with 9,500+ official past matriculation questions, deep stream diagnostic checks, and weakness scoring.
                  </p>
                </div>

                {/* Feature 3: Smart Quiz Mode */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <Layers className="h-6 w-6 text-emerald-500 mb-3" />
                  <h3 className="font-bold text-sm mb-2">📝 Adaptive Quizzing</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Smarter homework and chapter-specific checks. Generates dynamic multiple-choice items with corrections after every click.
                  </p>
                </div>

                {/* Feature 4: Smart Notes */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <FileText className="h-6 w-6 text-blue-500 mb-3" />
                  <h3 className="font-bold text-sm mb-2">📚 AI Smart Notes</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Summarizes textbook chapters. Unlocks formula reference sheets, definitions, and key revision milestones for exam days.
                  </p>
                </div>

                {/* Feature 5: AI Study Companion */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <Sparkle className="h-6 w-6 text-indigo-500 mb-3 animate-pulse" />
                  <h3 className="font-bold text-sm mb-2">✨ AI Study Companion</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your personal co-pilot. Ask math, chemistry, or history questions naturally via rich text, recorded voice, or homework uploads.
                  </p>
                </div>

                {/* Feature 6: Progress Dashboard */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <TrendingUp className="h-6 w-6 text-emerald-400 mb-3" />
                  <h3 className="font-bold text-sm mb-2">📈 Progress Dashboard</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Track daily study streaks, performance graphs on curriculum chapters, strong subject zones, and EUEE test statistics.
                  </p>
                </div>

                {/* Feature 7: Voice Learning */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <Mic className="h-6 w-6 text-orange-500 mb-3" />
                  <h3 className="font-bold text-sm mb-2">🔊 Spoken English Voice</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Built upon MacalinAI Multimodal systems to coach English pronunciation using curriculum content. Real-time pitch correction.
                  </p>
                </div>

                {/* Feature 8: Homework Scanner */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <Camera className="h-6 w-6 text-rose-500 mb-3" />
                  <h3 className="font-bold text-sm mb-2">📷 Homework Scanner</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Snap math, biology, or physics textbook problems and let DugsiAI construct step-by-step conceptual explanations instantly.
                  </p>
                </div>

              </div>

              {/* Additional New Premium Features Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Feature 9: AI Revision Mode */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <Layers className="h-6 w-6 text-amber-500 mb-3" />
                  <h3 className="font-bold text-sm mb-2">💡 AI Revision Flashcards</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Ditch boring notes! Study using interactive, memory-retaining flashcards generated instantly from your Grade 7 to 12 textbook units.
                  </p>
                </div>

                {/* Feature 10: Curriculum Library */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <BookMarked className="h-6 w-6 text-purple-500 mb-3" />
                  <h3 className="font-bold text-sm mb-2">📖 Curriculum Library</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    A completely categorized digital directory where every chapter is mapped specifically into bite-sized concepts for quick navigation.
                  </p>
                </div>

                {/* Feature 11: Achievement System */}
                <div className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <Sparkles className="h-6 w-6 text-yellow-400 mb-3 animate-pulse" />
                  <h3 className="font-bold text-sm mb-2">🏆 Gamified Achievement System</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Earn XP points, unlock historic educational badges, maintain study streaks, and compete with other schools across Ethiopia!
                  </p>
                </div>
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
                {/* School Dashboard */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <div className="flex items-center space-x-2 text-purple-500 mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-bold text-sm">School Dashboard</h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    A centralized administration dashboard to manage students, monitor learning activity, and track school-wide progress.
                  </p>
                </div>

                {/* Teacher Portal */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <div className="flex items-center space-x-2 text-purple-500 mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-bold text-sm">Teacher Portal</h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Teachers can assign lessons, monitor classroom performance, and identify students who need additional support.
                  </p>
                </div>

                {/* Student Analytics */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <div className="flex items-center space-x-2 text-purple-500 mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-bold text-sm">Student Analytics</h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    View detailed insights including study time, completed lessons, quiz performance, learning trends, and overall progress.
                  </p>
                </div>

                {/* Performance Reports */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <div className="flex items-center space-x-2 text-purple-500 mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-bold text-sm">Performance Reports</h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Generate professional reports for parents, school administrators, and board meetings with one click.
                  </p>
                </div>

                {/* Bulk Student Registration */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <div className="flex items-center space-x-2 text-purple-500 mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-bold text-sm">Bulk Student Registration</h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Register hundreds of students quickly using CSV upload or batch registration.
                  </p>
                </div>

                {/* School-wide ESSLCE Preparation */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'}`}>
                  <div className="flex items-center space-x-2 text-purple-500 mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-bold text-sm">School-wide ESSLCE Prep</h3>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p className="font-semibold text-inherit mb-1">Equip every Grade 12 student with:</p>
                    <p>• Past Examination Papers & Practice Questions</p>
                    <p>• Multiple Practice Modes & AI Explanations</p>
                    <p>• School-Wide Progress Tracking</p>
                  </div>
                </div>
              </div>

              {/* Call to action for School Edition */}
              <div className="text-center space-y-3 pt-4">
                <button 
                  onClick={() => {
                    alert("Thank you for your interest! A Samaale Institute Representative will contact your school shortly to link your school systems.");
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3.5 rounded-xl text-xs shadow-lg transition-all hover:scale-105 duration-200 border border-purple-400/30"
                >
                  Register Your School
                </button>
                <p className="text-xs text-gray-500">
                  Become a member of Samaale Institute of Languages and Technology.
                </p>
              </div>
            </div>

            {/* INTERACTIVE COMPANION: HOMEWORK SCANNER */}
            <div className={`p-6 rounded-3xl border max-w-5xl mx-auto space-y-4 ${
              theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-purple-500" />
                <h3 className="font-bold text-sm">Homework Scanner Simulator</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Simulate snapping an image of an intricate textbook equation. DugsiAI immediately decodes the math, physics, or chemistry behind it.
              </p>
              
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-855 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="p-3 rounded-lg bg-purple-950/40 text-purple-400 border border-purple-900">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold block text-white">gravitation_question.png</span>
                    <span className="text-[10px] text-gray-500">Selected File • 1.4 MB</span>
                  </div>
                </div>

                <button 
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1"
                >
                  {isScanning ? (
                    <span>Analyzing Physics textbook guidelines...</span>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-1" />
                      <span>Simulate Photo Scan</span>
                    </>
                  )}
                </button>
              </div>

              {scanResult && (
                <div className="p-4 rounded-xl border border-emerald-950 bg-emerald-950/10 text-xs leading-relaxed text-gray-300 animate-fadeIn">
                  <div className="font-bold text-emerald-400 mb-1 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Physics scan analyzed
                  </div>
                  <p>{scanResult}</p>
                </div>
              )}
            </div>

            {/* INTERACTIVE COMPANION: REVISION FLASHCARDS */}
            <div className={`p-6 rounded-3xl border max-w-5xl mx-auto space-y-4 ${
              theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="flex items-center space-x-2">
                <Layers className="h-5 w-5 text-purple-500" />
                <h3 className="font-bold text-sm">Interactive AI Revision Flashcards</h3>
              </div>
              <p className="text-xs text-gray-400">
                Click to flip the flashcard and toggle between the core question and the curriculum-aligned AI conceptual explanation.
              </p>

              <div className="flex flex-col items-center justify-center space-y-4 py-6">
                <div 
                  onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                  className={`w-full max-w-md h-40 rounded-2xl border p-6 flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                    showFlashcardAnswer 
                      ? 'bg-purple-950/40 border-purple-500 text-purple-100' 
                      : 'bg-gray-950 border-gray-800 hover:border-purple-900'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-purple-400 mb-2">
                    {showFlashcardAnswer ? "Explanation (Curriculum Answer)" : "Question Block"}
                  </span>
                  <p className="text-xs md:text-sm font-semibold">
                    {showFlashcardAnswer ? flashcardsData[currentFlashcard].a : flashcardsData[currentFlashcard].q}
                  </p>
                  <span className="text-[9px] text-gray-500 mt-4 italic">Click to Flip Card</span>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setShowFlashcardAnswer(false);
                      setCurrentFlashcard(prev => (prev === 0 ? flashcardsData.length - 1 : prev - 1));
                    }}
                    className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => {
                      setShowFlashcardAnswer(false);
                      setCurrentFlashcard(prev => (prev === flashcardsData.length - 1 ? 0 : prev + 1));
                    }}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold"
                  >
                    Next Card
                  </button>
                </div>
              </div>
            </div>

            {/* INTEGRATED PRICING PLANS SECTION (Moved to Landing Page) */}
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
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2" /> 5 Interactive Chat Messages / Day</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2" /> Access to basic Grade 7-12 Textbooks</li>
                      <li className="flex items-center text-gray-500"><XCircle className="h-4 w-4 text-gray-600 mr-2" /> Live voice audio interactive sessions</li>
                      <li className="flex items-center text-gray-500"><XCircle className="h-4 w-4 text-gray-600 mr-2" /> Analytical school leaderboard score sync</li>
                    </ul>
                  </div>
                  <button 
                    disabled={subscription === 'freemium'}
                    onClick={() => setSubscription('freemium')}
                    className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold mt-6 transition-all"
                  >
                    {subscription === 'freemium' ? 'Current Active Tier' : 'Choose Freemium'}
                  </button>
                </div>

                {/* Regular Tier */}
                <div className={`p-6 rounded-3xl border-2 border-purple-600 flex flex-col justify-between relative transform md:-translate-y-2 ${
                  theme === 'dark' ? 'bg-gray-900 shadow-purple-900/10 shadow-2xl' : 'bg-white shadow-xl'
                }`}>
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Highly Popular
                  </span>
                  <div>
                    <span className="text-[10px] bg-purple-900/20 text-purple-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">Regular</span>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold">450 Birr</span>
                      <span className="text-xs text-gray-500"> / month</span>
                    </div>
                    <ul className="space-y-3.5 text-xs text-gray-400">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2" /> Unlimited textbook text communications</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2" /> Adaptive mock quizzes & tests</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2" /> Past ESSLCE Grade 12 & Grade 8 mock exams</li>
                      <li className="flex items-center text-gray-500"><XCircle className="h-4 w-4 text-gray-600 mr-2" /> Live voice audio sessions</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleUpgradeClick('regular')}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl text-xs font-bold mt-6 transition-all shadow-md"
                  >
                    Upgrade to Regular Plan
                  </button>
                </div>

                {/* Premium Tier */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <div>
                    <span className="text-[10px] bg-amber-900/20 text-amber-500 font-bold px-3 py-1 rounded-full uppercase tracking-wider">Premium</span>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold">2,900 Birr</span>
                      <span className="text-xs text-gray-500"> / month</span>
                    </div>
                    <ul className="space-y-3.5 text-xs text-gray-400">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2" /> All features on Regular unlimited level</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2" /> Voice and Text AI Coaching Tutor</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-purple-500 mr-2" /> Interactive real-time pitch feedback loops</li>
                      <li className="flex items-center text-emerald-400"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" /> 24/7 AI Tutor reduces home tutor needs</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleUpgradeClick('premium')}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 rounded-xl text-xs font-bold mt-6 transition-all shadow-md"
                  >
                    Upgrade to Premium
                  </button>
                </div>

              </div>

              {/* School Institutional Info */}
              <div className="bg-purple-950/20 border border-purple-900/60 p-6 rounded-2xl text-center space-y-4 max-w-2xl mx-auto">
                <h3 className="font-bold text-lg text-white">Are you a School Board Administrator?</h3>
                <p className="text-xs text-purple-300 leading-relaxed font-medium">
                  Connect your teachers, classrooms, and regional education board interfaces. School institutional rates are a flat <strong className="text-yellow-400">4,900 Birr / Month</strong> which includes direct system-wide student sync, customized diagnostics and competitive debate schedules.
                </p>
                <button 
                  onClick={() => {
                    alert("Thank you for your interest! A Samaale Institute Representative will contact your school shortly to link your classroom portals.");
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
                >
                  Register Your School Portfolio
                </button>
              </div>
            </div>

            {/* TESTIMONIALS SECTION */}
            <div className="space-y-8 max-w-5xl mx-auto pt-8 border-t border-gray-800/10">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-500">{currentLangText.testimonialsTitle}</h2>
                <p className="text-xs text-gray-400 mt-1">Real feedback from regional and private school students across the country.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { name: "Ahmed", school: "Gypsum Academy (Jigjiga)", text: "DugsiAI completely changed my chemistry grade! The custom mock exams let me prepare for ESSLCE with actual questions.", score: "94% on Chemistry" },
                  { name: "Hana", school: "Omar bin Al-Khattab Secondary", text: "The English pronunciation companion is amazing! I can talk to the audio tutor and it corrects my vocabulary.", score: "A on Spoken English" },
                  { name: "Liya", school: "Jigjiga International School", text: "Having explanations translated into Amharic helps me understand fast-paced classroom materials.", score: "Top 2% in Class" },
                  { name: "Abdinasir", school: "Qabridahar Memorial School", text: "I study at home on my phone. DugsiAI lets me read lessons chapter-by-chapter when data is low.", score: "Improved 18% overall" }
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

            {/* FAQ ACCORDION */}
            <div className="space-y-8 max-w-3xl mx-auto pt-8 border-t border-gray-800/10">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-500">{currentLangText.faqTitle}</h2>
                <p className="text-xs text-gray-400 mt-1">Find quick answers to common questions about our curriculum systems.</p>
              </div>

              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className={`rounded-xl border overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                  }`}>
                    <button 
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full text-left p-4 font-bold text-xs md:text-sm flex items-center justify-between transition-colors hover:bg-purple-900/10"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 text-purple-500 transition-transform duration-200 ${
                        activeFaq === i ? 'transform rotate-180' : ''
                      }`} />
                    </button>
                    {activeFaq === i && (
                      <div className="p-4 border-t border-gray-800/10 bg-black/10 text-xs leading-relaxed text-gray-400">
                        {faq.a}
                      </div>
                    )}
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
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search biology, math unit, matrices..." 
                    className={`w-full border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-purple-500 ${
                      theme === 'dark' ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>

                {/* Grade Selector Accordions */}
                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                  {[12, 11, 10, 9, 8, 7].map((grade) => (
                    <div key={grade} className={`border rounded-xl overflow-hidden ${
                      theme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-purple-900/10 transition-colors">
                        <span className="font-semibold text-sm">Grade {grade} Textbook Syllabus</span>
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="px-3 pb-3 pt-1 space-y-1 bg-black/5 border-t border-gray-800/10">
                        {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'].map((subject) => (
                          <div 
                            key={subject} 
                            onClick={() => {
                              setSelectedAnswer(null);
                              setQuizSubmitted(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-lg text-xs hover:bg-purple-955/30 text-inherit cursor-pointer"
                          >
                            <span>{subject}</span>
                            <span className="bg-purple-900/10 text-purple-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">12 Units</span>
                          </div>
                        ))}
                      </div>
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
                  <div className="space-y-3 text-xs leading-relaxed text-gray-400">
                    <p className="font-bold text-inherit text-purple-500">Chemistry Unit 3 Revision Notes:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li><strong>Activation Energy (Ea):</strong> Barrier energy reacting molecules must reach.</li>
                      <li><strong>Catalysts:</strong> Lowers the required energy paths, speeding up reaction times without being consumed.</li>
                    </ul>
                  </div>
                )}
                {selectedNotesSubject === "Physics" && (
                  <div className="space-y-3 text-xs leading-relaxed text-gray-400">
                    <p className="font-bold text-inherit text-purple-500">Physics Kinematics Revision Notes:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li><strong>Newtonian Attraction:</strong> {"$F = G \\frac{m_1 m_2}{r^2}$"}. Force decreases exponentially with distance squared.</li>
                      <li><strong>Gravitational Constant:</strong> {"$G \\approx 6.674 \\times 10^{-11} \\text{ N m}^2/\\text{kg}^2$"}.</li>
                    </ul>
                  </div>
                )}
                {selectedNotesSubject === "Mathematics" && (
                  <div className="space-y-3 text-xs leading-relaxed text-gray-400">
                    <p className="font-bold text-inherit text-purple-500">Mathematics Matrix Revision Notes:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li><strong>2x2 Inverse:</strong> {"$A^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$"}.</li>
                      <li><strong>Singular Matrix:</strong> A matrix with a determinant of exactly $0$ has no active inverse.</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className={`border rounded-2xl p-6 shadow-xl relative overflow-hidden ${
                theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <div className="absolute top-0 right-0 bg-purple-600/20 text-purple-400 text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl font-bold border-l border-b border-purple-855">
                  Concept Study View
                </div>
                
                <h3 className="text-xl font-bold mb-2">Grade 11 Chemistry: Unit 3 - Collision Theory</h3>
                <p className="text-xs text-yellow-500 font-medium mb-4">Aligned with the Somali Region Ministry Curriculum Guidelines</p>
                
                <div className="space-y-4 text-sm leading-relaxed text-gray-400">
                  <p>
                    For a chemical reaction to occur, reactant particles must collide with each other. However, not all collisions result in chemical transformations. Collisions are only effective if they meet two critical criteria:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li><strong className="text-purple-400">Sufficient Kinetic Energy:</strong> The particles must collide with energy equal to or greater than the <span className="font-mono text-purple-400">Activation Energy (Ea)</span>.</li>
                    <li><strong className="text-purple-400">Proper Molecular Orientation:</strong> The atoms must align perfectly at the moment of impact to break existing chemical bonds and forge new ones.</li>
                  </ul>
                  <div className="bg-purple-950/10 p-4 rounded-xl border border-purple-900/30 text-xs text-purple-300">
                    <span className="font-bold text-yellow-500 mr-1">Pro AI Tip:</span> In national exams, questions frequently explore why catalyst enzymes accelerate reactions. A catalyst works by offering an alternate reaction pathway with a lower activation energy barrier.
                  </div>
                </div>
              </div>

              {/* Quiz Module */}
              <div className={`border rounded-2xl p-6 shadow-xl relative ${
                theme === 'dark' ? 'bg-gray-900 border-purple-900/40' : 'bg-white border-purple-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-md flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-500 animate-pulse" />
                    <span>ESSLCE National Exam Practice Question</span>
                  </h4>
                  <span className="text-xs bg-purple-900/20 border border-purple-800 text-purple-400 px-2.5 py-1 rounded-full font-mono font-bold">QID: #7412</span>
                </div>

                <p className="text-sm font-semibold mb-6">
                  According to collision theory, why does a temperature increase dramatically accelerate the speed of chemical reactions?
                </p>

                <div className="space-y-2.5">
                  {[
                    { id: 'A', text: 'It decreases the overall activation energy required for effective molecular reactions.' },
                    { id: 'B', text: 'It decreases the molecular volume of reacting species within the solution matrix.' },
                    { id: 'C', text: 'It raises the average kinetic energy of reactant particles, boosting the frequency of effective high-energy collisions.' },
                    { id: 'D', text: 'It alters the thermodynamic molecular geometry of catalysts present in the compound.' }
                  ].map((option) => {
                    let btnStyle = "border-gray-800 text-gray-400 hover:bg-purple-900/10";
                    if (selectedAnswer === option.id) {
                      if (quizSubmitted) {
                        btnStyle = option.id === 'C' ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'border-red-500 bg-red-950/40 text-red-300';
                      } else {
                        btnStyle = 'border-purple-500 bg-purple-955/30 text-purple-200';
                      }
                    } else if (quizSubmitted && option.id === 'C') {
                      btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-300';
                    }

                    return (
                      <button 
                        key={option.id}
                        disabled={quizSubmitted}
                        onClick={() => setSelectedAnswer(option.id)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start space-x-3 ${btnStyle}`}
                      >
                        <span className="font-bold text-purple-500">{option.id}.</span>
                        <span>{option.text}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-800/40">
                  <div className="text-xs text-gray-500">
                    {!quizSubmitted ? "Select your answer and hit submit to view analytical correction." : "Concept feedback displayed."}
                  </div>
                  <div className="flex space-x-2">
                    {quizSubmitted && (
                      <button 
                        onClick={() => {
                          setSelectedAnswer(null);
                          setQuizSubmitted(false);
                        }}
                        className="bg-gray-800 hover:bg-gray-700 text-xs text-white px-4 py-2 rounded-lg font-bold transition-all"
                      >
                        Next Question
                      </button>
                    )}
                    <button 
                      disabled={!selectedAnswer || quizSubmitted}
                      onClick={() => setQuizSubmitted(true)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs px-5 py-2 rounded-lg font-bold disabled:opacity-50 transition-all shadow-md"
                    >
                      Submit Exam Answer
                    </button>
                  </div>
                </div>

                {quizSubmitted && (
                  <div className="mt-5 p-4 rounded-xl border border-emerald-950 bg-emerald-950/15 text-xs text-gray-300 animate-fadeIn">
                    <p className="font-bold text-emerald-400 mb-1 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Correct Answer: C
                    </p>
                    <p className="leading-relaxed">
                      Excellent reasoning! Temperature is directly proportional to average kinetic energy {"($KE = \\frac{3}{2}kT$)"}. Elevating temperature increases molecular speeds, leading to higher collision frequencies and a larger fraction of particles overcoming the activation barrier.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ABOUT (Why We Built DugsiAI) */}
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

            {/* Partnerships Showcase */}
            <div className={`p-6 rounded-2xl border space-y-4 text-center ${
              theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'
            }`}>
              <h3 className="font-bold text-md text-inherit">Flagship Collaborator Network</h3>
              <p className="text-xs max-w-lg mx-auto">
                DugsiAI is deployed as a sovereign educational program by the Samaale Institute of Languages and Technology in partnership with Linggax Tech.
              </p>
              <div className="flex justify-center items-center space-x-6 pt-2 font-bold font-mono text-purple-500 text-xs">
                <span>SAMAALE INSTITUTE</span>
                <span>•</span>
                <span>LINGGAX TECH</span>
                <span>•</span>
                <span>REGIONAL EDUCATION BUREAU</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TUTORING */}
        {currentTab === 'tutoring' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            <div className="space-y-6">
              
              {/* COMPANION STATUS */}
              <div className={`p-5 rounded-2xl border ${
                theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">DugsiAI Subscription</span>
                  <span className="text-xs bg-purple-900/10 text-purple-400 px-2.5 py-0.5 rounded border border-purple-800/30 uppercase font-bold">
                    {subscription}
                  </span>
                </div>

                {subscription === 'freemium' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span>Daily Messages Remaining:</span>
                      <span className="font-bold text-yellow-505 font-mono">{freeMessagesLeft} / 5</span>
                    </div>
                    <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-yellow-505 h-full transition-all duration-300" style={{ width: `${(freeMessagesLeft/5)*100}%` }}></div>
                    </div>
                    <div className="p-3 bg-orange-950/15 border border-orange-900/50 rounded-xl text-xs text-orange-400 flex items-start space-x-2">
                      <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{currentLangText.freeLimitMsg}</span>
                    </div>
                    <button 
                      onClick={() => handleUpgradeClick('regular')}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md mt-2 flex items-center justify-center space-x-1"
                    >
                      <span>Upgrade to Regular Plan (450 ETB)</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Status:</span>
                      <span className="font-bold text-emerald-400">UNLIMITED TEXT ON</span>
                    </div>
                    <p className="text-xs text-purple-400 font-medium">Your regular tier has unlocked full database queries, past exams, and immediate feedback.</p>
                  </div>
                )}
              </div>

              {/* STUDY STREAK ACHIEVEMENTS */}
              <div className={`p-5 rounded-2xl border ${
                theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-sm font-bold mb-3 flex items-center space-x-2">
                  <Award className="h-4 w-4 text-yellow-500 animate-pulse" />
                  <span>My Gamified Badges</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-black/10 rounded-xl border border-purple-900/20 text-center">
                    <span className="text-xl">🔥</span>
                    <h4 className="font-bold mt-1 text-purple-400">Streak Legend</h4>
                    <p className="text-[9px] text-gray-500">18 consecutive days</p>
                  </div>
                  <div className="p-3 bg-black/10 rounded-xl border border-purple-900/20 text-center">
                    <span className="text-xl">🧪</span>
                    <h4 className="font-bold mt-1 text-purple-400">Chem Expert</h4>
                    <p className="text-[9px] text-gray-500">Completed Unit 3 MCQ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Workspace */}
            <div className={`lg:col-span-2 border rounded-2xl flex flex-col h-[500px] shadow-xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <div className="bg-black/10 p-4 border-b border-gray-800/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-bold text-sm">MacalinAI Interactive Workspace</span>
                </div>
                <span className="text-[10px] bg-purple-900/10 text-purple-400 px-2.5 py-1 rounded border border-purple-800/30 font-bold font-mono">
                  Region: Jigjiga
                </span>
              </div>

              <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-purple-600 text-white rounded-tr-none' 
                        : 'bg-black/10 border border-gray-800/10 rounded-tl-none text-inherit'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-black/10 border border-gray-805 text-xs rounded-2xl rounded-tl-none p-3 text-gray-400">
                      DugsiAI is synthesizing textbook chapters...
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-gray-800/20 bg-black/5">
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask anything from biology, history, math, english textbooks..."
                    className={`flex-grow border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 ${
                      theme === 'dark' ? 'bg-gray-950 border-gray-855 text-white' : 'bg-white border-gray-250 text-gray-900'
                    }`}
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-all shadow-md"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: TEACHERS */}
        {currentTab === 'teachers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`p-2 rounded-xl border flex flex-wrap gap-2 ${
              theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              {[
                { id: 'teacher', label: 'Teacher Dashboard (Ustaad Farah)' },
                { id: 'admin', label: 'Education Bureau Control Panel' }
              ].map((roleOption) => (
                <button 
                  key={roleOption.id}
                  onClick={() => setRole(roleOption.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    role === roleOption.id 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-400'
                  }`}
                >
                  {roleOption.label}
                </button>
              ))}
            </div>

            {role === 'teacher' ? (
              <div className={`p-6 rounded-2xl border ${
                theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <h3 className="font-bold text-md mb-2">Ustaad Farah's Classroom Matrix (Gypsum Academy)</h3>
                <p className="text-xs text-gray-400 mb-4">View real-time diagnostic performance scoring across units.</p>
                <div className="space-y-3">
                  {[
                    { name: "Hodan Yusuf", score: 94, status: "Mastering" },
                    { name: "Abdirahman Warsame", score: 81, status: "In Progress" },
                    { name: "Fardowsa Garaad", score: 58, status: "Need Intervention" }
                  ].map((studentObj, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-black/10 rounded-xl text-xs">
                      <span className="font-bold">{studentObj.name}</span>
                      <div className="flex space-x-4 items-center">
                        <span className="text-purple-400 font-mono font-bold">{studentObj.score}%</span>
                        <span className="bg-purple-900/10 text-purple-400 border border-purple-800/30 px-2 py-0.5 rounded font-bold uppercase text-[9px]">{studentObj.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-6 rounded-2xl border ${
                theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <h3 className="font-bold text-md mb-2">Regional Bureau Analytics Panel</h3>
                <p className="text-xs text-gray-400 mb-4">Tracking active student sync matrices across collaborating high schools.</p>
                <div className="bg-black/10 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Total Regional Users:</span>
                    <span className="font-mono font-bold text-purple-400">14,240</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Curriculum Syllabus Pacing:</span>
                    <span className="font-mono font-bold text-yellow-500">82% Completed</span>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                { title: "How to practice Spoken English naturally", date: "June 14, 2026", desc: "Learn how the premium MacalinAI companion corrects phonetic accent flow in Jigjiga high schools without private teachers." },
                { title: "Samaale Co-Curricular Platform Debut", date: "May 30, 2026", desc: "Unlocking regional debates and innovations to create continuous school-to-school applied research pipelines." }
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
            
            {/* Contact details */}
            <div className="md:col-span-5 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold">Get In Touch</h2>
                <p className="text-gray-400">Have questions about school sync options, customized state curriculums, or billing renewals?</p>
              </div>

              <div className="space-y-4 text-gray-400">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-purple-600/10 text-purple-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-white">Headquarters Location</span>
                    <span>Jigjiga, Ethiopia</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-purple-600/10 text-purple-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-white">Email Address</span>
                    <span>info@samaaleinstitute.org</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-purple-600/10 text-purple-500">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-white">Phone Number</span>
                    <span>+251 930 379 676</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className={`md:col-span-7 p-6 rounded-2xl border ${
              theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <h3 className="font-bold text-sm mb-4">Send a Message</h3>
              
              <form onSubmit={(e) => { e.preventDefault(); alert("Message sent! Our support team will get back to you shortly."); }} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Name</label>
                    <input 
                      type="text" 
                      placeholder="Your name" 
                      className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-inherit"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Email</label>
                    <input 
                      type="email" 
                      placeholder="Your email" 
                      className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-inherit"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. School institutional license query" 
                    className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-inherit"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Message</label>
                  <textarea 
                    rows="4"
                    placeholder="How can we help your school or study routine today?" 
                    className="w-full bg-black/10 border border-gray-855 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-inherit"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-md"
                >
                  Submit Contact Request
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className={`border-t py-12 px-6 mt-16 transition-colors ${
        theme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 text-xs">
          
          {/* Main platform disclaimer */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-600 p-2 rounded-lg text-white">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              </div>
              <span className="font-extrabold text-lg">Dugsi<span className="text-yellow-500">AI</span></span>
            </div>
            <p className="leading-relaxed text-gray-400">
              DugsiAI is the premium flagship academic platform brought to you by the <strong className="text-purple-500">Samaale Institute of Languages and Technology</strong> in formal technical collaboration and integration partnership with <strong className="text-purple-500">Linggax Tech Partnership</strong>.
            </p>
            <div className="text-gray-500 space-y-1">
              <p><strong>Headquarters:</strong> Jigjiga, Ethiopia.</p>
              <p><strong>Email Support:</strong> info@samaaleinstitute.org</p>
              <p><strong>Phone Support:</strong> +251 930 379 676</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-inherit uppercase tracking-wider text-[10px]">Quick Links</h4>
            <ul className="space-y-2 text-gray-500">
              <li><button onClick={() => setCurrentTab('home')} className="hover:text-purple-500 transition-colors">Home Landing</button></li>
              <li><button onClick={() => setCurrentTab('courses')} className="hover:text-purple-500 transition-colors">Curriculum Textbooks</button></li>
              <li><button onClick={() => setCurrentTab('tutoring')} className="hover:text-purple-500 transition-colors">AI Cognitive Tutor</button></li>
              <li><button onClick={() => setCurrentTab('competitions')} className="hover:text-purple-500 transition-colors">Co-Curricular Events</button></li>
              <li><button onClick={() => setCurrentTab('contact')} className="hover:text-purple-500 transition-colors">Pricing & Plans</button></li>
            </ul>
          </div>

          {/* Languages Supported */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-inherit uppercase tracking-wider text-[10px]">Languages</h4>
            <ul className="space-y-2 text-gray-500">
              <li><button onClick={() => setLang('so')} className="hover:text-purple-500 transition-colors">🇸🇴 Af-Soomaali</button></li>
              <li><button onClick={() => setLang('am')} className="hover:text-purple-500 transition-colors">🇪🇹 Amharic (አማርኛ)</button></li>
              <li><button onClick={() => setLang('om')} className="hover:text-purple-500 transition-colors">🇪🇹 Afan Oromo</button></li>
              <li><button onClick={() => setLang('en')} className="hover:text-purple-500 transition-colors">🇬🇧 English</button></li>
            </ul>
          </div>

          {/* Contact & Social Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-inherit uppercase tracking-wider text-[10px]">Connect With Us</h4>
            <p className="text-gray-500">Follow regional debate competitions, innovation submission timelines and wellness guides.</p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="p-2 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all">
                <Share2 className="h-4 w-4" />
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800/20 pt-6 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-500">
          <p>© 2026 DugsiAI. All rights reserved. Supporting Federal Democratic Republic of Ethiopia Ministry of Education Guidelines.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Applied Policy Research</a>
          </div>
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

      {/* REGISTRATION / PROFILE CREATION MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gray-900 border border-purple-900/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4 text-white">
            <button 
              onClick={() => {
                setShowRegisterModal(false);
                setPendingPlanUpgrade(null); // Reset pending path on cancel
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold">Create Your DugsiAI Profile</h3>
              <p className="text-xs text-gray-400">Unlock customized textbook tracking and ESSLCE progress portfolios.</p>
            </div>

            {/* Google Sign-up (Now unified as an optional pre-fill step) */}
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
                    <span className="font-extrabold text-red-500">G</span>
                    <span className="font-extrabold text-blue-500">o</span>
                    <span className="font-extrabold text-yellow-500">o</span>
                    <span className="font-extrabold text-green-500">g</span>
                    <span className="font-extrabold text-blue-600">l</span>
                    <span className="font-extrabold text-red-500">e</span>
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

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'student', label: 'Student' },
                { id: 'parent', label: 'Parent' },
                { id: 'teacher', label: 'Teacher' }
              ].map((roleOption) => (
                <button 
                  key={roleOption.id}
                  onClick={() => setAuthRole(roleOption.id)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    authRole === roleOption.id 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'bg-gray-950 border-gray-855 text-gray-400 hover:text-white'
                  }`}
                >
                  {roleOption.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Full Name (Compulsory)</label>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Hodan Yusuf" 
                  required
                  className="w-full bg-gray-950 border border-gray-805 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Mobile Phone Number (Compulsory)</label>
                <div className="flex">
                  <span className="bg-gray-850 border border-gray-805 border-r-0 rounded-l-lg px-3 py-2 text-xs text-gray-400">+251</span>
                  <input 
                    type="tel" 
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="912345678" 
                    required
                    className="w-full bg-gray-950 border border-gray-855 rounded-r-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-white"
                  />
                </div>
              </div>

              {/* Instant messenger confirmation confirmation selectors */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Receive Confirmation Code via (Compulsory)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setConfirmationChannel('telegram')}
                    className={`py-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      confirmationChannel === 'telegram'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-gray-950 border-gray-855 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Telegram</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setConfirmationChannel('whatsapp')}
                    className={`py-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      confirmationChannel === 'whatsapp'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : 'bg-gray-950 border-gray-855 text-gray-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 italic mt-1 leading-tight">We do not dispatch via classic SMS. Secure token verification code will be instantly pushed to your preferred app workspace.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">School Name</label>
                <select 
                  value={regSchool}
                  onChange={(e) => setRegSchool(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-855 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-white"
                >
                  <option value="Gypsum Academy">Gypsum Academy</option>
                  <option value="Omar bin Al-Khattab Secondary School">Omar bin Al-Khattab Secondary School</option>
                  <option value="Jigjiga International School">Jigjiga International School</option>
                  <option value="Sayid Mohamed High School">Sayid Mohamed High School</option>
                  <option value="Qabridahar Memorial School">Qabridahar Memorial School</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 rounded-xl text-xs font-bold transition-all shadow-md mt-2"
              >
                Complete Registration & Continue
              </button>
            </form>

          </div>
        </div>
      )}

      {/* SUBSCRIPTION PAYMENTS HANDSHAKE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gray-900 border border-purple-900/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-5 text-white">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] bg-purple-900/30 border border-purple-700 text-purple-300 px-3 py-1 rounded-full uppercase font-bold">
                Automated Gateway Integration
              </span>
              <h3 className="text-xl font-bold pt-2">
                {showUpgradeModal === 'regular' ? "Upgrade to Regular Unlimited Plan (450 ETB/Month)" : "Upgrade to Premium Plan (2,900 ETB/Month)"}
              </h3>
              <p className="text-xs text-gray-400">Select your preferred payment provider to launch secure transaction handshake API:</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'telebirr', name: 'telebirr', desc: 'Ethio Telecom Mobile Money', color: 'border-purple-600 hover:bg-purple-950/20' },
                { id: 'ebirr', name: 'eBirr', desc: 'Secure Mobile Finance', color: 'border-yellow-600 hover:bg-yellow-950/20' },
                { id: 'esahal', name: 'E-Sahal', desc: 'Telesom Mobile Money', color: 'border-orange-600 hover:bg-orange-950/20' },
                { id: 'kaafi', name: 'Kaafi Mobile', desc: 'Somcable Payment Service', color: 'border-blue-600 hover:bg-blue-950/20' },
                { id: 'halalpay', name: 'Halal-Pay', desc: 'Interest-free Payment Corridor', color: 'border-emerald-600 hover:bg-emerald-950/20' },
                { id: 'cbe', name: 'CBE Birr', desc: 'Commercial Bank of Ethiopia', color: 'border-purple-800 hover:bg-purple-950/20' },
                { id: 'shabelle', name: 'Shabelle Bank', desc: 'Regional Shabelle Financial', color: 'border-rose-600 hover:bg-rose-950/20' }
              ].map((method) => (
                <button 
                  key={method.id}
                  onClick={() => handlePayment(method.id)}
                  className={`p-3 text-left border rounded-xl transition-all ${method.color} ${
                    selectedPayMethod === method.id ? 'bg-purple-900/40 border-purple-500' : 'bg-gray-950 border-gray-855'
                  }`}
                >
                  <span className="font-bold text-xs block">{method.name}</span>
                  <span className="text-[9px] text-gray-500 block leading-tight">{method.desc}</span>
                </button>
              ))}
            </div>

            {selectedPayMethod && (
              <div className="bg-black/40 p-4 rounded-xl border border-purple-900/40 flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Waiting for automated Webhook callback confirmation...</span>
                </div>
                {paymentSuccess ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-400" />
                    Verified!
                  </span>
                ) : (
                  <span className="text-[10px] text-yellow-400 font-mono">PENDING</span>
                )}
              </div>
            )}

            <div className="text-[10px] text-gray-500 text-center leading-tight">
              Once you complete the PIN confirmation on your handset, the bank's webhook communicates directly with DugsiAI's database, unlocking premium assets immediately. No screenshots required.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}