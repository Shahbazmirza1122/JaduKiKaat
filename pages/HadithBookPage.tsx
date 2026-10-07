import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, BookOpen } from 'lucide-react';
import { hadithBooks } from '../data/hadithBooksData';

const HadithBookPage: React.FC = () => {
  const { bookSlug } = useParams<{ bookSlug: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [bookSlug]);

  const book = useMemo(() => hadithBooks.find((b) => b.slug === bookSlug), [bookSlug]);

  if (!book) {
    return (
      <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-spirit-900 mb-3">Book Not Found</h1>
          <p className="text-slate-500 mb-6">We couldn't find that hadith collection.</p>
          <Link to="/hadith" className="text-accent-600 font-bold hover:underline">
            &larr; Back to all books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/hadith"
          className="inline-flex items-center gap-2 text-xs font-bold text-spirit-700 hover:text-accent-700 mb-8 mt-8"
        >
          <ArrowLeft size={14} /> Back to all books
        </Link>

        <div className="text-center mb-14">
          <div className="w-16 h-16 rounded-2xl bg-spirit-900 text-white flex items-center justify-center mx-auto mb-5 shadow-md">
            <BookOpen size={28} strokeWidth={1.75} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-3">{book.name}</h1>
          <p className="text-slate-500 text-sm">
            {book.sections.length} chapters &middot; {book.totalHadiths.toLocaleString()} hadiths
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {book.sections.map((section) => (
            <Link
              key={section.number}
              to={`/hadith/${book.slug}/${section.number}`}
              className="group flex items-center justify-between gap-3 bg-white hover:bg-spirit-50 border border-spirit-200/70 hover:border-accent-400 rounded-2xl px-5 py-4 transition-all duration-200 hover:shadow-md"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-accent-700 bg-accent-500/10 px-2 py-0.5 rounded-full mb-1 inline-block">
                  Chapter {section.number}
                </span>
                <h3 className="font-semibold text-sm text-spirit-900 group-hover:text-accent-700 transition-colors truncate">
                  {section.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hadith {section.hadithFirst}&ndash;{section.hadithLast}
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-accent-600 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HadithBookPage;
