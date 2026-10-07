import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageSections } from '../hooks/usePageSections';
import DynamicSection from '../components/DynamicSection';
import { Loader2, ArrowLeft, Home } from 'lucide-react';

export const DynamicCustomPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const pageTarget = slug ? `/p/${slug}` : '/';
  
  // Also check without /p/ prefix in case user targeted '/slug'
  const { sections, loading } = usePageSections(pageTarget);
  const { sections: altSections } = usePageSections(`/${slug || ''}`);

  const activeSections = sections.length > 0 ? sections : altSections;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-spirit-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading custom page...</p>
      </div>
    );
  }

  if (activeSections.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <Home className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-spirit-900 mb-2">Page Under Construction</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          This page hasn't been designed or published yet. Please check back soon or return to the homepage.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-spirit-900 text-white text-sm font-bold shadow-md hover:bg-spirit-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-[70vh]">
      {activeSections.map((section) => (
        <DynamicSection key={section.id} section={section} />
      ))}
    </div>
  );
};

export default DynamicCustomPage;
