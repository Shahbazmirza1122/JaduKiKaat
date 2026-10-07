import React from 'react';
import { useNavigate } from 'react-router-dom';

export const QuranRehalIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Open Quran pages */}
    <path d="M5 8C8.5 6.5 12 7 16 9.5C20 7 23.5 6.5 27 8V20C23.5 18.5 20 19 16 21.5C12 19 8.5 18.5 5 20V8Z" />
    <path d="M16 9.5V21.5" />
    {/* Page text lines */}
    <path d="M8 11.5H13M8 14.5H13M8 17.5H12" strokeWidth="1.5" opacity="0.8" />
    <path d="M19 11.5H24M19 14.5H24M20 17.5H24" strokeWidth="1.5" opacity="0.8" />
    {/* Crossed wooden Rehal legs */}
    <path d="M8 21.5L24 28" />
    <path d="M24 21.5L8 28" />
    <path d="M5.5 28.5H10.5" />
    <path d="M21.5 28.5H26.5" />
  </svg>
);

export const PrayerMatIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Outer rectangular mat */}
    <rect x="7" y="4.5" width="18" height="23" rx="2" />
    {/* Top fringes */}
    <path d="M7 2.5V4.5M10.5 2.5V4.5M14 2.5V4.5M18 2.5V4.5M21.5 2.5V4.5M25 2.5V4.5" strokeWidth="1.6" />
    {/* Bottom fringes */}
    <path d="M7 27.5V29.5M10.5 27.5V29.5M14 27.5V29.5M18 27.5V29.5M21.5 27.5V29.5M25 27.5V29.5" strokeWidth="1.6" />
    {/* Inner decorative border */}
    <rect x="9.5" y="7" width="13" height="18" rx="1" strokeWidth="1.2" opacity="0.7" />
    {/* Arched Mihrab niche */}
    <path d="M11.5 21V14.5C11.5 11.5 16 9 16 9C16 9 20.5 11.5 20.5 14.5V21H11.5Z" />
    {/* Hanging mosque lamp inside arch */}
    <path d="M16 9V11.5M15 12.5H17M15.5 11.5L15 13.5H17L16.5 11.5" strokeWidth="1.2" />
  </svg>
);

export const IslamicRosetteIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Central 8-pointed rosette ring */}
    <circle cx="16" cy="16" r="3.2" />
    {/* 4 Cardinal loops */}
    <path d="M16 4C18.8 4 21 6.2 21 9C21 11.8 16 16 16 16C16 16 11 11.8 11 9C11 6.2 13.2 4 16 4Z" />
    <path d="M16 28C13.2 28 11 25.8 11 23C11 20.2 16 16 16 16C16 16 21 20.2 21 23C21 25.8 18.8 28 16 28Z" />
    <path d="M4 16C4 13.2 6.2 11 9 11C11.8 11 16 16 16 16C16 16 11.8 21 9 21C6.2 21 4 18.8 4 16Z" />
    <path d="M28 16C28 18.8 25.8 21 23 21C20.2 21 16 16 16 16C16 16 20.2 11 23 11C25.8 11 28 13.2 28 16Z" />
    {/* 4 Diagonal loops */}
    <path d="M7.5 7.5C9.5 5.5 12.7 6.3 14.1 8.5C15.5 10.7 16 16 16 16C16 16 10.7 15.5 8.5 14.1C6.3 12.7 5.5 9.5 7.5 7.5Z" />
    <path d="M24.5 24.5C22.5 26.5 19.3 25.7 17.9 23.5C16.5 21.3 16 16 16 16C16 16 21.3 16.5 23.5 17.9C25.7 19.3 26.5 22.5 24.5 24.5Z" />
    <path d="M24.5 7.5C26.5 9.5 25.7 12.7 23.5 14.1C21.3 15.5 16 16 16 16C16 16 16.5 10.7 17.9 8.5C19.3 6.3 22.5 5.5 24.5 7.5Z" />
    <path d="M7.5 24.5C5.5 22.5 6.3 19.3 8.5 17.9C10.7 16.5 16 16 16 16C16 16 15.5 21.3 14.1 23.5C12.7 25.7 9.5 26.5 7.5 24.5Z" />
  </svg>
);

export const HadithBookIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Closed book with a bookmark ribbon, distinct from the open-Quran icon */}
    <path d="M7 6.5C7 5.4 7.9 4.5 9 4.5H23C24.1 4.5 25 5.4 25 6.5V25.5C25 26.6 24.1 27.5 23 27.5H9C7.9 27.5 7 26.6 7 25.5V6.5Z" />
    <path d="M7 6.5C7 5.4 7.9 4.5 9 4.5H10V27.5H9C7.9 27.5 7 26.6 7 25.5V6.5Z" strokeWidth="1.5" opacity="0.7" />
    <path d="M13.5 9H21M13.5 13H21M13.5 17H19" strokeWidth="1.4" opacity="0.85" />
    <path d="M19 4.5V11L21 9.3L23 11V4.5" strokeWidth="1.4" />
  </svg>
);

const quickActions = [
  { label: 'Read Quran', icon: QuranRehalIcon, path: '/quran' },
  { label: 'Learn to Pray', icon: PrayerMatIcon, path: '/learn-to-pray' },
  { label: 'Islamic Story', icon: IslamicRosetteIcon, path: '/islamic-stories' },
  { label: 'Learn Ahadis', icon: HadithBookIcon, path: '/hadith' },
];

export const IslamicQuickActionBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      id="quick-services-bar"
      className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 -translate-y-1/2 -mb-8 sm:-mb-10 md:-mb-12 pointer-events-none select-none"
    >
      <div className="pointer-events-auto bg-[#073630]/95 sm:bg-[#073630]/90 backdrop-blur-md border border-emerald-400/30 rounded-2xl shadow-[0_20px_50px_rgba(4,32,28,0.4)] p-2 sm:p-3 md:py-3.5 md:px-6 text-white transition-all hover:border-emerald-400/50 hover:shadow-emerald-950/50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-0 lg:divide-x lg:divide-emerald-500/25">
          {quickActions.map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="flex items-center justify-center lg:justify-start gap-3 py-2.5 px-3 md:px-4 rounded-xl hover:bg-white/10 hover:text-emerald-300 transition-all group cursor-pointer text-left active:scale-95"
            >
              <div className="text-white group-hover:text-emerald-300 transition-colors shrink-0 flex items-center justify-center">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="font-bold text-sm sm:text-base tracking-wide text-white group-hover:text-emerald-200 transition-colors truncate">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
