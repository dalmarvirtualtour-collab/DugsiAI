"use client";

import React, { useState } from 'react';
import { Volume2, Languages, HelpCircle } from 'lucide-react';

interface VocabItem {
  phonetic: string;
  definition: string;
  somali: string;
  oromo: string;
  amharic: string;
}

export const VOCAB_DATABASE: Record<string, VocabItem> = {
  "activation energy": {
    phonetic: "/ˌæktɪˈveɪʃn ˈɛnərdʒi/",
    definition: "The minimum amount of energy reacting particles must possess to start a chemical reaction.",
    somali: "Tamarta ugu yar ee loo baahan yahay si falgal kiimiko u bilaawdo.",
    oromo: "Humni annisaa xiqqaa ree'akshiniin keemikaalaa ittiin jalqabuuf barbaachisu.",
    amharic: "አንድ የኬሚካል ግብረመልስ ለመጀመር የሚያስፈልገው አነስተኛው የኃይል መጠን።"
  },
  "determinant": {
    phonetic: "/dɪˈtɜːrmɪnənt/",
    definition: "A special number calculated from a square matrix that helps find its inverse or solve systems of equations.",
    somali: "Xaddi lambar oo laga xisaabiyo matrikis laba-geesood ah si loo helo rogaalkiisa.",
    oromo: "Lakkoofsa addaa maatriksii isku-afree irraa herregamu kan rogaal-deebii arguuf gargaaru.",
    amharic: "ከስኩዌር ማትሪክስ የሚሰላ ልዩ ቁጥር፣ እሱም ግልባጩን ለማግኘት ይረዳል።"
  },
  "homeostasis": {
    phonetic: "/ˌhoʊmioʊˈsteɪsɪs/",
    definition: "The state of steady internal conditions maintained by living things to function properly (like body temperature).",
    somali: "Nidaaminta iyo isku-dheelitirka xaaladaha gudaha ee noolaha.",
    oromo: "Mijeessuu fi tasgabayinsii dandeettii qaama lubbu-qabeeyyi xaalada keessaa barbachisa ta'e eegu.",
    amharic: "ሕይወት ያላቸው ነገሮች በአግባቡ ለመሥራት የሚጠብቁት ቋሚ የውስጥ ሁኔታ።"
  },
  "collision theory": {
    phonetic: "/kəˈlɪʒn ˈθiəri/",
    definition: "A theory explaining that chemical reactions happen when reactant particles collide with enough energy and correct alignment.",
    somali: "Aragtida sheegaysa in falgalku dhaco marka walxuhu isku dhacaan iyagoo haysta tamar ku filan iyo jiho sax ah.",
    oromo: "Ti'oori ibsu kan ree'akshiniin keemikaalaa kan uumamu yoo meeshiin wal-dhahan anniisaa fi qajeelfama gahaadhan.",
    amharic: "የኬሚካል ግብረመልሶች የሚከሰቱት ቅንጣቶች በበቂ ኃይል እና በትክክለኛው አቅጣጫ ሲጋጩ መሆኑን የሚያብራራ ንድፈ ሃሳብ።"
  },
  "matrix": {
    phonetic: "/ˈmeɪtrɪks/",
    definition: "A rectangular grid of numbers arranged in rows and columns.",
    somali: "Shabaqa laydi ah ee lambarro loo habeeyay safaf iyo tiirar.",
    oromo: "Lakkoofsota dalgee fi tiyyeen gurmaa'an.",
    amharic: "በረድፎች እና በአምዶች የተደረደሩ የቁጥሮች አቀማመጥ።"
  },
  "kinematics": {
    phonetic: "/ˌkɪnɪˈmætɪks/",
    definition: "The branch of physics that describes the motion of objects without considering the forces causing it.",
    somali: "Laanta fiisigiska ee sharxda dhaqdhaqaaqa iyada oo aan loo eegin xoogga sababay.",
    oromo: "Damee fiiziksii kan sochii qamaa ibsu humna sochii uume utuu hin dhimma-sahiin.",
    amharic: "የነገሮችን እንቅስቃሴ የሚያጠና የፊዚክስ ዘርፍ (እንቅስቃሴውን የፈጠረውን ኃይል ሳያካትት)።"
  },
  "universal gravitation": {
    phonetic: "/ˌjuːnɪˈvɜːrsl ˌɡrævɪˈteɪʃn/",
    definition: "Newton's law stating that every mass attracts every other mass in the universe with a force relative to their size and distance.",
    somali: "Sharciga Newton ee sheegaya in walax kasta oo cuf leh ay soo jiidato walax kale oo cuf leh oo caalamka ku jirta.",
    oromo: "Seera Niiwtooni kan ibsu qaamni hundi wal-harkisu akka cufaa fi fageenya isaaniitti.",
    amharic: "በተፈጥሮ ውስጥ ያሉ ማናቸውም ቁሶች እርስ በርስ እንደሚሳሳቡ የሚገልጸው የኒውተን የሳበ ሕግ።"
  }
};

interface VocabularyScaffoldProps {
  text: string;
  preferredLanguage?: string;
  onCodeSwitchToggle?: () => void;
}

export default function VocabularyScaffold({ text, preferredLanguage = 'en' }: VocabularyScaffoldProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showLanguageToggle, setShowLanguageToggle] = useState(false);
  const [nativeText, setNativeText] = useState<string | null>(null);

  // Play pronunciation TTS
  const playPronunciation = (word: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("TTS not supported in this browser.");
    }
  };

  // Check if explanation should trigger code-switching toggle
  const checkCodeSwitch = () => {
    const lower = text.toLowerCase();
    
    // Check if we have pre-defined translations for this STEM explanation block
    if (lower.includes('collision') || lower.includes('reaction')) {
      setNativeText(
        `[SOMALI] Dhammaan walxaha falgalaya waxay u baahan yihiin TAMAR kugu filan (Activation Energy) iyo JIHO sax ah. Heerkulka oo kordha wuxuu kordhiyaa tirada isku dhaca walxaha.\n\n` +
        `[OROMO] Ree'akshiinii keemikaalaaf anniisaa gahaa (Activation Energy) fi qajeelfama sirrii argachuun barbaachisaadha. Yoo ho'i dabalu sochii fi wal-dhahinsa dabala.\n\n` +
        `[AMHARIC] ለማንኛውም ኬሚካላዊ ግብረመልስ አነስተኛ ኃይል (Activation Energy) እና ትክክለኛ አቅጣጫ መጋጨት ያስፈልጋል። የሙቀት መጨመር የግጭቶችን ድግግሞሽ ይጨምራል።`
      );
      return true;
    } else if (lower.includes('matrix') || lower.includes('determinant')) {
      setNativeText(
        `[SOMALI] Haddii determinant uu eber yahay, matrix-ku ma laha inverse. Inverse-ka matrix 2x2 waxaa lagu xisaabiyaa rogaalka determinant oo lagu dhufto matrix-ka la beddelay.\n\n` +
        `[OROMO] Yoo determinant'iin ezero ta'e, maatriksiin sun rogaal-deebii hin qabu. Kun herregamuuf hiriira lakkoofsotaa irratti hundaa'a.\n\n` +
        `[AMHARIC] የዲስክሪሚናንት (Determinant) ዋጋ ዜሮ ከሆነ ማትሪክሱ ግልባጭ (Inverse) የለውም። ግልባጩ የሚሰላው በአንድ ማካፈል ዲስክሪሚናንት ተደርጎ ነው።`
      );
      return true;
    } else if (lower.includes('gravity') || lower.includes('gravitation') || lower.includes('newton')) {
      setNativeText(
        `[SOMALI] Xoogga jiidadka ee u dhexeeya laba cuf wuxuu ku xiran yahay baaxadda cufarkooda wuxuuna hoos ugu dhacaa si jibaar-labo ah marka fogaantu kororto.\n\n` +
        `[OROMO] Humni harkisa wal-qaxxaamuraa cuf qaamolee lamaanii irratti hunda'ee fageenya isaaniitiin gadi bu'aa deema.\n\n` +
        `[AMHARIC] በሁለት ነገሮች መካከል ያለው የሳቢ ኃይል እንደ ነገሮቹ ክብደት መጠን ይወሰናል። ርቀታቸው ሲጨምር ኃይሉ በአራት እጥፍ ይቀንሳል።`
      );
      return true;
    }
    return false;
  };

  const isEligibleForToggle = checkCodeSwitch();

  // Highlight vocabulary in English text
  const renderHighlightedText = () => {
    let elements: React.ReactNode[] = [];
    let currentText = text;

    // Build regex matches from keys
    const vocabTerms = Object.keys(VOCAB_DATABASE).sort((a, b) => b.length - a.length);
    const regexPattern = new RegExp(`\\b(${vocabTerms.join('|')})\\b`, 'gi');

    const parts = currentText.split(regexPattern);
    
    parts.forEach((part, index) => {
      const lowerPart = part.toLowerCase();
      if (VOCAB_DATABASE[lowerPart]) {
        elements.push(
          <button
            key={index}
            onClick={() => setSelectedWord(lowerPart)}
            className="bg-purple-950/40 hover:bg-purple-900 text-purple-300 font-bold border-b-2 border-purple-500 rounded px-1 text-xs mx-0.5 transition-colors cursor-pointer select-auto"
          >
            {part}
          </button>
        );
      } else {
        elements.push(<span key={index}>{part}</span>);
      }
    });

    return elements;
  };

  return (
    <div className="space-y-3">
      {/* Code-switching Toggle Header */}
      {isEligibleForToggle && (
        <div className="flex justify-end select-none">
          <button
            onClick={() => setShowLanguageToggle(!showLanguageToggle)}
            className="flex items-center space-x-1.5 bg-purple-900/10 hover:bg-purple-900/30 text-purple-400 border border-purple-800/30 px-3 py-1 rounded-full text-[10px] font-bold transition-all"
          >
            <Languages className="h-3 w-3" />
            <span>{showLanguageToggle ? "Show English Text" : "Translate Explanation"}</span>
          </button>
        </div>
      )}

      {/* Main explanation body */}
      <div className="text-xs leading-relaxed text-gray-300 whitespace-pre-wrap select-text">
        {showLanguageToggle && nativeText ? (
          <div className="p-3.5 bg-purple-950/10 border border-purple-900/20 rounded-xl space-y-3 text-purple-200">
            {nativeText.split('\n\n').map((para, i) => (
              <p key={i} className="border-b border-purple-950/30 pb-2 last:border-0">{para}</p>
            ))}
          </div>
        ) : (
          renderHighlightedText()
        )}
      </div>

      {/* Vocabulary Detail Popup Card */}
      {selectedWord && VOCAB_DATABASE[selectedWord] && (
        <div className="bg-gray-900 border border-purple-900/60 rounded-2xl p-4 shadow-xl text-white space-y-3 relative animate-fadeIn select-none">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Vocabulary Scaffold</span>
              <h5 className="font-extrabold text-sm text-purple-300 mt-1 capitalize">{selectedWord}</h5>
              <p className="text-[10px] text-gray-500 font-mono">{VOCAB_DATABASE[selectedWord].phonetic}</p>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => playPronunciation(selectedWord)}
                className="bg-purple-900/20 hover:bg-purple-900/40 p-2 rounded-lg text-purple-400"
                title="Listen Pronunciation"
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedWord(null)}
                className="text-gray-550 hover:text-white px-2 py-0.5 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>

          <div className="space-y-2.5 text-xs pt-1 border-t border-gray-800/40">
            <div>
              <span className="text-[10px] text-gray-500 font-bold block">ENGLISH DEFINITION</span>
              <p className="text-gray-300 leading-tight">{VOCAB_DATABASE[selectedWord].definition}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 pt-1">
              <div className="bg-black/15 p-2 rounded border border-gray-800/20">
                <span className="text-[9px] text-purple-400 font-bold block">AF-SOOMAALI TRANSLATION</span>
                <p className="text-gray-400 leading-tight">{VOCAB_DATABASE[selectedWord].somali}</p>
              </div>
              <div className="bg-black/15 p-2 rounded border border-gray-800/20">
                <span className="text-[9px] text-yellow-500/80 font-bold block">AFAAN OROMOO TRANSLATION</span>
                <p className="text-gray-400 leading-tight">{VOCAB_DATABASE[selectedWord].oromo}</p>
              </div>
              <div className="bg-black/15 p-2 rounded border border-gray-800/20">
                <span className="text-[9px] text-emerald-450 font-bold block">AMHARIC TRANSLATION</span>
                <p className="text-gray-450 leading-tight font-amharic">{VOCAB_DATABASE[selectedWord].amharic}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
