import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Pause, Play, Square, AlertCircle } from 'lucide-react';
import { hadithBooks } from '../data/hadithBooksData';
import { fetchHadithSection, HadithEntry } from '../services/hadithApi';
import { useSpeech } from '../hooks/useSpeech';

const HadithSectionPage: React.FC = () => {
  const { bookSlug, sectionNumber } = useParams<{ bookSlug: string; sectionNumber: string }>();
  const navigate = useNavigate();
  const { speak, stop, pause, resume, isSpeaking, isPaused, isSupported } = useSpeech();

  const book = useMemo(() => hadithBooks.find((b) => b.slug === bookSlug), [bookSlug]);
  const sectionNum = parseInt(sectionNumber || '0', 10);
  const section = useMemo(
    () => book?.sections.find((s) => s.number === sectionNum),
    [book, sectionNum]
  );

  const [hadiths, setHadiths] = useState<HadithEntry[]>([]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    stop();
    setSpeakingId(null);

    if (!book || !section) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(false);
    fetchHadithSection(book.editionEnglish, sectionNum)
      .then((res) => {
        if (!res) {
          setError(true);
        } else {
          setHadiths(res.hadiths);
          setTitle(res.title);
        }
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookSlug, sectionNumber]);

  const handleListen = (hadith: HadithEntry) => {
    if (speakingId === hadith.number && isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
      return;
    }
    setSpeakingId(hadith.number);
    speak(hadith.text);
  };

  if (!book || !section) {
    return (
      <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-spirit-900 mb-3">Chapter Not Found</h1>
          <Link to="/hadith" className="text-accent-600 font-bold hover:underline">
            &larr; Back to all books
          </Link>
        </div>
      </div>
    );
  }

  const sectionIndex = book.sections.findIndex((s) => s.number === sectionNum);
  const prevSection = sectionIndex > 0 ? book.sections[sectionIndex - 1] : null;
  const nextSection = sectionIndex < book.sections.length - 1 ? book.sections[sectionIndex + 1] : null;

  const goTo = (num: number) => {
    navigate(`/hadith/${book.slug}/${num}`);
  };

  return (
    <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs font-bold text-spirit-500 mt-8 mb-6">
          <Link to="/hadith" className="hover:text-accent-700 transition-colors">All Books</Link>
          <span>/</span>
          <Link to={`/hadith/${book.slug}`} className="hover:text-accent-700 transition-colors">{book.name}</Link>
          <span>/</span>
          <span className="text-spirit-900">Chapter {section.number}</span>
        </div>

        <div className="mb-10">
          <span className="text-[11px] font-bold text-accent-700 bg-accent-500/10 px-2.5 py-1 rounded-full inline-block mb-3">
            {book.name} &middot; Chapter {section.number}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-spirit-900 leading-tight">
            {title || section.title}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Hadith {section.hadithFirst}&ndash;{section.hadithLast}
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-spirit-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Loading hadiths&hellip;</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-slate-600 font-semibold mb-1">Couldn't load this chapter.</p>
            <p className="text-slate-400 text-sm">Please check your connection and try again.</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-5 mb-14">
            {hadiths.map((hadith) => {
              const activeHere = speakingId === hadith.number && isSpeaking;
              return (
                <div
                  key={hadith.number}
                  className={`bg-white border rounded-2xl p-6 shadow-sm transition-colors ${
                    activeHere ? 'border-accent-400 bg-accent-50/30' : 'border-spirit-200/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="text-xs font-bold text-spirit-700 bg-spirit-50 px-2.5 py-1 rounded-full">
                      Hadith {hadith.number}
                    </span>
                    {isSupported && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleListen(hadith)}
                          title={activeHere && !isPaused ? 'Pause' : 'Listen'}
                          className="p-2 rounded-full text-spirit-600 hover:text-white hover:bg-accent-600 bg-spirit-50 transition-colors"
                        >
                          {activeHere && !isPaused ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        {activeHere && (
                          <button
                            type="button"
                            onClick={() => {
                              stop();
                              setSpeakingId(null);
                            }}
                            title="Stop"
                            className="p-2 rounded-full text-spirit-600 hover:text-white hover:bg-red-500 bg-spirit-50 transition-colors"
                          >
                            <Square size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[15px]">{hadith.text}</p>
                  {hadith.reference && (
                    <p className="text-[11px] text-slate-400 mt-3 font-medium">{hadith.reference}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-spirit-200/70 pt-6 pb-10">
          <button
            type="button"
            disabled={!prevSection}
            onClick={() => prevSection && goTo(prevSection.number)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-spirit-700 hover:text-accent-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={16} /> Previous Chapter
          </button>
          <Link
            to={`/hadith/${book.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-spirit-500 hover:text-accent-700 transition-colors"
          >
            <ArrowLeft size={14} /> All Chapters
          </Link>
          <button
            type="button"
            disabled={!nextSection}
            onClick={() => nextSection && goTo(nextSection.number)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-spirit-700 hover:text-accent-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Next Chapter <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HadithSectionPage;
