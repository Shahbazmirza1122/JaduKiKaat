import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { islamicStories } from '../data/islamicStoriesData';

const IslamicStoriesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sorted = [...islamicStories].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 relative overflow-hidden">
      <div className="absolute left-0 top-1/3 w-48 h-96 bg-accent-100/50 rounded-r-full z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in pt-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-spirit-900/10 text-spirit-900 text-xs sm:text-sm font-semibold mb-4">
            <BookOpen className="w-3.5 h-3.5 text-accent-600" />
            <span>Qisas-ul-Anbiya</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-spirit-900 mb-6">
            Stories of the Prophets
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-light">
            Journey through the lives of the Prophets — their trials, their patience, and the
            timeless lessons Allah preserved for every generation that follows.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sorted.map((story) => (
            <Link
              key={story.id}
              to={`/islamic-stories/${story.slug}`}
              className="group bg-white rounded-3xl border border-spirit-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden bg-spirit-100">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-spirit-950/70 via-spirit-950/0 to-transparent" />
                {story.era && (
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white/90 bg-spirit-900/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {story.era}
                  </span>
                )}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h2 className="font-serif font-bold text-xl drop-shadow-sm">{story.name}</h2>
                  {story.arabicName && (
                    <span className="text-sm text-white/80 font-serif">{story.arabicName}</span>
                  )}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-sm font-bold text-accent-700 mb-2">{story.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-grow">
                  {story.summary}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-spirit-900 group-hover:text-accent-600 transition-colors">
                  Read the story
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IslamicStoriesPage;
