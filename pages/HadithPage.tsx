import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Layers } from 'lucide-react';
import { hadithBooks } from '../data/hadithBooksData';

const bookBlurbs: Record<string, string> = {
  bukhari: 'Compiled by Imam Muhammad al-Bukhari, widely regarded as the most authentic collection of hadith (Sahih).',
  muslim: 'Compiled by Imam Muslim ibn al-Hajjaj, the second of the two most rigorously authenticated collections (Sahih).',
  abudawud: 'Compiled by Imam Abu Dawud, a Sunan collection focused heavily on legal and devotional rulings.',
  tirmidhi: 'Compiled by Imam al-Tirmidhi, known for grading each hadith’s authenticity alongside the text.',
  nasai: 'Compiled by Imam al-Nasai, a Sunan collection noted for its careful chain-of-narration criticism.',
  ibnmajah: 'Compiled by Imam Ibn Majah, traditionally counted as the sixth of the six canonical Sunni collections.',
};

const HadithPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in pt-12">
          <span className="text-accent-600 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">
            Learn Ahadis
          </span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-spirit-900 mb-6">
            The Six Books of Hadith
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Read and listen to the six canonical hadith collections (Kutub al-Sittah) — the
            recorded sayings, actions, and approvals of the Prophet Muhammad (peace be upon him),
            organized by book and chapter for easy study.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hadithBooks.map((book) => (
            <Link
              key={book.slug}
              to={`/hadith/${book.slug}`}
              className="group bg-spirit-50/60 hover:bg-spirit-50 border border-spirit-200/70 hover:border-accent-400 rounded-3xl p-7 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-spirit-900 text-white flex items-center justify-center mb-5 shadow-md group-hover:bg-accent-600 transition-colors">
                <BookOpen size={24} strokeWidth={1.75} />
              </div>
              <h2 className="font-serif font-bold text-xl text-spirit-900 mb-2 group-hover:text-accent-700 transition-colors">
                {book.name}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-5 flex-grow">
                {bookBlurbs[book.slug]}
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-spirit-700 pt-4 border-t border-spirit-200/70">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} />
                  {book.sections.length} Chapters
                </span>
                <span className="flex items-center gap-1 group-hover:gap-2 transition-all">
                  {book.totalHadiths.toLocaleString()} Hadiths
                  <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HadithPage;
