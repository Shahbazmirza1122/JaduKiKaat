import React, { useEffect, useMemo, useState } from 'react';
import { Star, CheckCircle, Sparkles, X, Quote, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TestimonialItem, getStoredTestimonials } from '../data/testimonialsData';

const stats = [
  {
    value: '1,500+',
    label: 'Successful Consultations',
    sublabel: 'Across 45+ Countries',
  },
  {
    value: '100+',
    label: 'Authentic Quranic Duas',
    sublabel: 'Grounded in Sunnah',
  },
  {
    value: '98%',
    label: 'Satisfied Client Reviews',
    sublabel: 'Verified Community Trust',
  },
];

interface OurHappyClientsProps {
  onOpenConsult?: (subject?: string) => void;
}

export const OurHappyClients: React.FC<OurHappyClientsProps> = ({ onOpenConsult }) => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [activeClient, setActiveClient] = useState<TestimonialItem | null>(null);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: TestimonialItem[] = data.map((t: any) => ({
            id: t.id,
            name: t.name,
            role: t.role || '',
            location: t.location || '',
            imageUrl: t.image_url || '',
            service: t.service || '',
            quote: t.quote || '',
            rating: t.rating ?? 5,
            status: t.status === 'inactive' ? 'inactive' : 'active',
            createdAt: t.created_at,
          }));
          setTestimonials(mapped);
        } else {
          setTestimonials(getStoredTestimonials());
        }
      } catch {
        setTestimonials(getStoredTestimonials());
      }
    };

    loadTestimonials();

    const handleUpdate = () => loadTestimonials();
    window.addEventListener('testimonials-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('testimonials-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const visibleClients = useMemo(
    () => testimonials.filter((t) => t.status !== 'inactive').slice(0, 10),
    [testimonials]
  );

  if (visibleClients.length === 0) return null;

  return (
    <section className="pt-14 sm:pt-16 pb-16 md:pb-20 bg-white relative overflow-hidden">

      {/* Full-width Card Container with Website's Sanctuary Color Scheme.
          Breaks out of the normal content max-width so the photo sweep below
          can travel the full browser width. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-spirit-50/95 border-y border-spirit-200/80 pt-4 sm:pt-6 md:pt-8 pb-20 sm:pb-24 md:pb-28 shadow-xl overflow-hidden">

        {/* Subtle Islamic Ambient Glows */}
        <div className="absolute -top-24 right-[8%] w-80 h-80 bg-accent-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-[8%] w-80 h-80 bg-spirit-900/5 rounded-full blur-3xl pointer-events-none" />

        {/* Client photos sweep right-to-left in a sunrise/sunset arc, rising up
            and over the heading before setting again on the left — full width.
            Each photo is a single element on an infinitely-repeating animation,
            just started at a different point in the cycle (negative delay) —
            no duplicated elements, so no two photos are ever the same client. */}
        <div className="relative z-0 mb-0 h-[240px] sm:h-[290px] md:h-[336px] mask-edges">
          {visibleClients.map((client, index) => {
            const n = visibleClients.length;
            const duration = n * 4.5;
            const delay = -(index * (duration / n));
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => setActiveClient(client)}
                style={{
                  animationName: 'sunArc',
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                }}
                className="group pause-on-hover absolute top-1/2 outline-none"
                aria-label={`View ${client.name}'s testimonial`}
              >
                <span className="relative block w-32 h-40 sm:w-40 sm:h-52 md:w-48 md:h-60 rounded-3xl overflow-hidden border-2 border-white shadow-lg ring-1 ring-spirit-200/70 group-hover:ring-accent-500 transition-shadow duration-300 bg-spirit-100">
                  <img
                    src={client.imageUrl}
                    alt={client.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute inset-0 bg-spirit-950/0 group-hover:bg-spirit-950/10 transition-colors duration-300" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Section Header (badge, heading, subtext, CTA) */}
        <div className="relative z-10 text-center max-w-2xl mx-auto px-6 sm:px-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-spirit-900/10 text-spirit-900 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent-600" />
            <span>Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight mb-3 leading-tight">
            <span className="text-spirit-900">Trusted by Souls</span>
            <br />
            <span className="text-accent-600">Across the World</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed font-sans mb-6">
            Alhamdulillah, brothers and sisters around the world have found clarity, spiritual solace, and genuine protection through our dedicated counsel and sacred Quranic prayers.
          </p>
          <button
            type="button"
            onClick={() => (onOpenConsult ? onOpenConsult('Client Consultation') : setActiveClient(visibleClients[0]))}
            className="inline-flex items-center gap-2 bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-sm py-3.5 px-7 rounded-full shadow-lg transition transform hover:scale-105"
          >
            <span>Read Their Stories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3 Overlapping Stat Boxes: Half on the div, half below the div */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 -mt-14 sm:-mt-16 md:-mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-spirit-900 hover:bg-spirit-800 border-2 border-accent-500/40 rounded-2xl py-6 px-6 sm:px-8 text-center shadow-2xl transition-all duration-300 hover:-translate-y-1 group backdrop-blur-sm"
              >
                <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1.5 tracking-tight group-hover:text-accent-300 transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-accent-200">
                  {stat.label}
                </div>
                <div className="text-[11px] sm:text-xs text-white/70 font-medium mt-1">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Direct Action Link Below the Floating Stat Boxes */}
        {onOpenConsult && (
          <div className="mt-10 text-center relative z-20">
            <button
              onClick={() => onOpenConsult('Client Consultation')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-spirit-900 hover:text-accent-700 transition-colors underline underline-offset-4"
            >
              <span>Share your experience or request consultation</span>
              <CheckCircle className="w-4 h-4 text-accent-600" />
            </button>
          </div>
        )}
      </div>

      {/* Client Testimonial Popup */}
      {activeClient && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-spirit-950/70 backdrop-blur-sm"
            onClick={() => setActiveClient(null)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl z-10 overflow-hidden animate-fade-in-up border border-spirit-100 max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setActiveClient(null)}
              className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/90 text-spirit-900 hover:bg-white shadow-md transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="relative h-56 sm:h-64 w-full shrink-0 bg-spirit-100">
              <img
                src={activeClient.imageUrl}
                alt={activeClient.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-spirit-950/80 via-spirit-950/10 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h3 className="font-serif font-bold text-xl sm:text-2xl drop-shadow-sm">{activeClient.name}</h3>
                <p className="text-xs sm:text-sm text-white/85 font-medium">
                  {activeClient.role}
                  {activeClient.location ? ` · ${activeClient.location}` : ''}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(activeClient.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <Quote className="w-7 h-7 text-accent-300 mb-2" />
              <p className="text-spirit-900 text-sm sm:text-base leading-relaxed font-sans">
                {activeClient.quote}
              </p>

              {activeClient.service && (
                <span className="inline-block mt-5 text-[11px] font-bold text-accent-700 bg-accent-500/10 px-3 py-1 rounded-full">
                  {activeClient.service}
                </span>
              )}

              {onOpenConsult && (
                <button
                  type="button"
                  onClick={() => {
                    const subject = activeClient.service || 'Client Consultation';
                    setActiveClient(null);
                    onOpenConsult(subject);
                  }}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-sm py-3 rounded-xl transition"
                >
                  <span>Request a Similar Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
