import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Square,
  Volume2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { getStoryBySlug, getAdjacentStories } from '../data/islamicStoriesData';
import { useSpeech } from '../hooks/useSpeech';

const IslamicStoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const story = slug ? getStoryBySlug(slug) : undefined;
  const { speak, pause, resume, stop, isSpeaking, isPaused, isSupported } = useSpeech();

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!story) {
    return (
      <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-spirit-900 mb-3">Story not found</h1>
          <p className="text-slate-500 mb-6">This story may have been moved or no longer exists.</p>
          <Link
            to="/islamic-stories"
            className="inline-flex items-center gap-2 bg-spirit-900 text-white font-bold text-sm py-3 px-6 rounded-full hover:bg-spirit-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all stories
          </Link>
        </div>
      </div>
    );
  }

  const { previous, next } = getAdjacentStories(story.order);

  const handleListenToggle = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isSpeaking && isPaused) {
      resume();
    } else {
      speak(`${story.name}. ${story.title}. ${story.content}`);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 relative overflow-hidden">
      {/* Hero */}
      <div className="relative h-64 md:h-80 w-full bg-spirit-900 overflow-hidden">
        <img
          src={story.imageUrl}
          alt={story.title}
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-spirit-950/90 via-spirit-950/40 to-spirit-950/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <Link
              to="/islamic-stories"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-bold mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to all stories
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-sm">
                {story.name}
              </h1>
              {story.arabicName && (
                <span className="text-xl md:text-2xl font-serif text-white/80">{story.arabicName}</span>
              )}
            </div>
            <p className="text-accent-300 font-semibold mt-2">{story.title}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Listen controls */}
        {isSupported && (
          <div className="flex items-center gap-3 bg-spirit-50 border border-spirit-100 rounded-2xl p-4 mt-8 mb-10">
            <button
              type="button"
              onClick={handleListenToggle}
              className="inline-flex items-center gap-2 bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-sm py-2.5 px-5 rounded-full transition shrink-0"
            >
              {isSpeaking && !isPaused ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : isSpeaking && isPaused ? (
                <>
                  <Play className="w-4 h-4" /> Resume
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" /> Listen to this story
                </>
              )}
            </button>
            {isSpeaking && (
              <button
                type="button"
                onClick={stop}
                title="Stop"
                className="p-2.5 rounded-full border border-spirit-200 text-spirit-700 hover:bg-white transition shrink-0"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
            <span className="text-xs text-slate-500 hidden sm:block">
              Read aloud using your browser's built-in voice.
            </span>
          </div>
        )}

        {/* Content */}
        <article className="prose max-w-none mb-12">
          {story.content.split('\n\n').map((para, i) => (
            <p key={i} className="text-slate-700 leading-relaxed text-base md:text-lg mb-5 font-sans">
              {para}
            </p>
          ))}
        </article>

        {/* Key Lessons */}
        <div className="bg-spirit-900 rounded-3xl p-8 md:p-10 mb-12 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            <Sparkles className="w-5 h-5 text-accent-400" />
            Key Lessons
          </h2>
          <ul className="space-y-4 relative z-10">
            {story.keyLessons.map((lesson, i) => (
              <li key={i} className="flex items-start gap-3 text-white/90 leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
                <span>{lesson}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prev / Next */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {previous ? (
            <button
              onClick={() => navigate(`/islamic-stories/${previous.slug}`)}
              className="group flex items-center gap-3 p-4 rounded-2xl border border-spirit-100 hover:border-accent-300 hover:bg-spirit-50 transition text-left"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-accent-600 transition-colors shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Previous
                </span>
                <span className="font-serif font-bold text-spirit-900 truncate block">{previous.name}</span>
              </div>
            </button>
          ) : (
            <div />
          )}
          {next ? (
            <button
              onClick={() => navigate(`/islamic-stories/${next.slug}`)}
              className="group flex items-center justify-end gap-3 p-4 rounded-2xl border border-spirit-100 hover:border-accent-300 hover:bg-spirit-50 transition text-right"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Next
                </span>
                <span className="font-serif font-bold text-spirit-900 truncate block">{next.name}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-accent-600 transition-colors shrink-0" />
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};

export default IslamicStoryDetailPage;
