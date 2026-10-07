import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Clock, 
  Tag, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Settings,
  AlertCircle
} from 'lucide-react';
import { 
  ProductCountdown, 
  ProductPageCountdownPosition, 
  PRODUCT_COUNTDOWN_POSITIONS 
} from '../data/storeSettings';
import { Product } from '../data/products';

interface ProductCountdownTimerProps {
  countdown: ProductCountdown;
  product: Product;
  position?: ProductPageCountdownPosition;
  isAdmin?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onBuyNowClick?: () => void;
}

export const ProductCountdownTimer: React.FC<ProductCountdownTimerProps> = ({
  countdown,
  product,
  position = countdown.productPagePosition,
  isAdmin = false,
  onMoveUp,
  onMoveDown,
  onBuyNowClick,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: countdown.days || '02',
    hours: countdown.hours || '14',
    minutes: countdown.minutes || '38',
    seconds: countdown.seconds || '45',
  });

  useEffect(() => {
    setTimeLeft({
      days: countdown.days || '02',
      hours: countdown.hours || '14',
      minutes: countdown.minutes || '38',
      seconds: countdown.seconds || '45',
    });
  }, [countdown.days, countdown.hours, countdown.minutes, countdown.seconds]);

  // Live ticking counter interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let sec = parseInt(prev.seconds, 10) - 1;
        let min = parseInt(prev.minutes, 10);
        let hr = parseInt(prev.hours, 10);
        let day = parseInt(prev.days, 10);

        if (sec < 0) {
          sec = 59;
          min -= 1;
          if (min < 0) {
            min = 59;
            hr -= 1;
            if (hr < 0) {
              hr = 23;
              day = Math.max(0, day - 1);
            }
          }
        }

        return {
          days: day < 10 ? `0${day}` : `${day}`,
          hours: hr < 10 ? `0${hr}` : `${hr}`,
          minutes: min < 10 ? `0${min}` : `${min}`,
          seconds: sec < 10 ? `0${sec}` : `${sec}`,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!countdown.enabled) return null;

  const currentPosMeta = PRODUCT_COUNTDOWN_POSITIONS.find(p => p.id === position) || PRODUCT_COUNTDOWN_POSITIONS[3];
  const canMoveUp = currentPosMeta.stepNumber > 1;
  const canMoveDown = currentPosMeta.stepNumber < PRODUCT_COUNTDOWN_POSITIONS.length;

  const discountPrice = countdown.discountPrice || product.salePrice || product.price;
  const originalPrice = countdown.originalPrice || product.price;
  const dealTitle = countdown.title || product.name;
  const dealTag = countdown.tag || 'Flash Blessed Deal';
  const urgencyNote = countdown.urgencyText || 'Limited consecrated units remaining at this blessed discount.';

  // Theme styles
  const theme = countdown.theme || 'amber';
  const themeConfig = {
    amber: {
      gradient: 'from-stone-900 via-amber-950 to-stone-900',
      border: 'border-amber-500/30',
      accentText: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      digitBox: 'bg-stone-900/90 text-amber-300 border-amber-500/40',
      btnBg: 'bg-amber-500 hover:bg-amber-400 text-stone-950',
      highlightBorder: 'border-amber-500/40',
    },
    emerald: {
      gradient: 'from-stone-950 via-spirit-950 to-stone-950',
      border: 'border-spirit-500/40',
      accentText: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      digitBox: 'bg-stone-900/90 text-emerald-300 border-spirit-500/40',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-stone-950',
      highlightBorder: 'border-spirit-500/40',
    },
    ruby: {
      gradient: 'from-stone-950 via-rose-950 to-stone-900',
      border: 'border-rose-500/30',
      accentText: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      digitBox: 'bg-stone-900/90 text-rose-300 border-rose-500/40',
      btnBg: 'bg-rose-600 hover:bg-rose-500 text-white',
      highlightBorder: 'border-rose-500/40',
    },
    obsidian: {
      gradient: 'from-black via-stone-900 to-black',
      border: 'border-stone-700/60',
      accentText: 'text-stone-200',
      badgeBg: 'bg-stone-800/80 text-stone-300 border-stone-600/40',
      digitBox: 'bg-black/90 text-stone-100 border-stone-700',
      btnBg: 'bg-white hover:bg-stone-200 text-black',
      highlightBorder: 'border-stone-600',
    },
    gold: {
      gradient: 'from-stone-950 via-yellow-950 to-stone-900',
      border: 'border-yellow-500/30',
      accentText: 'text-yellow-400',
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      digitBox: 'bg-stone-900/90 text-yellow-300 border-yellow-500/40',
      btnBg: 'bg-yellow-500 hover:bg-yellow-400 text-stone-950',
      highlightBorder: 'border-yellow-500/40',
    },
  }[theme];

  // Admin section reordering bar (displayed above the countdown if admin is logged in)
  const AdminControlsBar = isAdmin ? (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-spirit-900 text-white rounded-lg text-xs font-sans mb-2 shadow-xs border border-spirit-700">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-bold text-amber-300">
          <Settings size={13} /> Position:
        </span>
        <span className="bg-spirit-800 px-2 py-0.5 rounded text-[11px] font-mono text-spirit-100">
          {currentPosMeta.label}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          title="Move countdown up on Product Page"
          className="inline-flex items-center gap-1 px-2 py-1 bg-spirit-800 hover:bg-spirit-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-[11px] font-bold text-white transition"
        >
          <ArrowUp size={12} /> Move Up
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          title="Move countdown down on Product Page"
          className="inline-flex items-center gap-1 px-2 py-1 bg-spirit-800 hover:bg-spirit-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-[11px] font-bold text-white transition"
        >
          <ArrowDown size={12} /> Move Down
        </button>
        <Link
          to="/admin"
          className="text-[11px] text-amber-300 hover:underline ml-1 font-medium"
        >
          Admin Tab ↗
        </Link>
      </div>
    </div>
  ) : null;

  // RENDER 1: TOP BANNER (Full-width header notice above breadcrumbs)
  if (position === 'top_banner') {
    return (
      <div className="w-full mb-6 animate-fade-in">
        {AdminControlsBar}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${themeConfig.gradient} p-4 sm:p-5 text-white border ${themeConfig.border} shadow-lg`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Flame className={`w-5 h-5 ${themeConfig.accentText} animate-pulse`} />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${themeConfig.badgeBg}`}>
                    {dealTag}
                  </span>
                  <span className="text-xs text-slate-300 font-light hidden sm:inline">
                    {dealTitle}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-0.5 justify-center md:justify-start">
                  <span className={`text-xl font-bold ${themeConfig.accentText}`}>{discountPrice}</span>
                  {originalPrice && originalPrice !== discountPrice && (
                    <span className="text-xs text-slate-400 line-through">{originalPrice}</span>
                  )}
                  <span className="text-xs text-slate-300 ml-1 font-sans">{urgencyNote}</span>
                </div>
              </div>
            </div>

            {/* Countdown Digits */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/10 shrink-0">
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HRS', val: timeLeft.hours },
                { label: 'MINS', val: timeLeft.minutes },
                { label: 'SECS', val: timeLeft.seconds },
              ].map((unit, idx) => (
                <React.Fragment key={unit.label}>
                  {idx > 0 && <span className={`${themeConfig.accentText} font-bold text-sm`}>:</span>}
                  <div className="text-center min-w-[34px] sm:min-w-[40px]">
                    <div className={`font-mono font-bold text-sm sm:text-base px-1.5 py-1 rounded-md border ${themeConfig.digitBox}`}>
                      {unit.val}
                    </div>
                    <span className="text-[8px] text-slate-400 font-bold block mt-0.5">{unit.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER 2: ABOVE TITLE & CATEGORY BADGES
  if (position === 'above_title') {
    return (
      <div className="mb-4 animate-fade-in">
        {AdminControlsBar}
        <div className={`rounded-2xl bg-gradient-to-r ${themeConfig.gradient} p-3.5 sm:p-4 text-white border ${themeConfig.border} shadow-md`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Flame className={`w-4 h-4 ${themeConfig.accentText} animate-pulse`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${themeConfig.badgeBg}`}>
                    {dealTag}
                  </span>
                  <span className={`text-sm font-bold ${themeConfig.accentText}`}>{discountPrice}</span>
                  {originalPrice && originalPrice !== discountPrice && (
                    <span className="text-xs text-slate-400 line-through">{originalPrice}</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">{urgencyNote}</p>
              </div>
            </div>

            {/* Compact clock */}
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/10 shrink-0">
              {[
                { label: 'D', val: timeLeft.days },
                { label: 'H', val: timeLeft.hours },
                { label: 'M', val: timeLeft.minutes },
                { label: 'S', val: timeLeft.seconds },
              ].map((unit, idx) => (
                <React.Fragment key={unit.label}>
                  {idx > 0 && <span className={`${themeConfig.accentText} font-bold text-xs`}>:</span>}
                  <div className="text-center">
                    <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded border ${themeConfig.digitBox}`}>
                      {unit.val}
                    </span>
                    <span className="text-[7px] text-slate-400 block mt-0.5 font-bold">{unit.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER 3: BELOW PRICE & STAR RATING
  if (position === 'below_price') {
    return (
      <div className="mb-6 animate-fade-in">
        {AdminControlsBar}
        <div className={`rounded-2xl bg-gradient-to-br ${themeConfig.gradient} p-4 sm:p-5 text-white border ${themeConfig.border} shadow-lg`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${themeConfig.badgeBg}`}>
                  {dealTag}
                </span>
                <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <Sparkles size={12} /> Special Consecrated Offer
                </span>
              </div>
              <h4 className="font-serif font-bold text-base text-white">{dealTitle}</h4>
              <p className="text-xs text-slate-300 font-light">{urgencyNote}</p>
            </div>

            {/* Clock */}
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10 shrink-0 self-center sm:self-auto">
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HOURS', val: timeLeft.hours },
                { label: 'MINS', val: timeLeft.minutes },
                { label: 'SECS', val: timeLeft.seconds },
              ].map((unit, idx) => (
                <React.Fragment key={unit.label}>
                  {idx > 0 && <span className={`${themeConfig.accentText} font-bold text-base`}>:</span>}
                  <div className="text-center min-w-[36px]">
                    <div className={`font-mono font-bold text-base px-1.5 py-1 rounded border ${themeConfig.digitBox}`}>
                      {unit.val}
                    </div>
                    <span className="text-[8px] text-slate-400 font-bold block mt-0.5">{unit.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER 4: ABOVE ADD TO CART & BUY NOW CTA BUTTONS (High-Conversion Default!)
  if (position === 'above_cta') {
    return (
      <div className="mb-4 animate-fade-in">
        {AdminControlsBar}
        <div className={`rounded-2xl bg-gradient-to-r ${themeConfig.gradient} p-4 sm:p-5 text-white border ${themeConfig.border} shadow-xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${themeConfig.badgeBg} flex items-center gap-1`}>
                  <Flame size={11} className="animate-pulse" /> {dealTag}
                </span>
                <span className={`text-xs font-bold ${themeConfig.accentText} uppercase tracking-wider`}>
                  Live Countdown
                </span>
              </div>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className={`text-2xl font-bold ${themeConfig.accentText}`}>{discountPrice}</span>
                {originalPrice && originalPrice !== discountPrice && (
                  <span className="text-sm text-slate-400 line-through">{originalPrice}</span>
                )}
                <span className="text-xs text-slate-300 font-medium">Deal Price</span>
              </div>
              <p className="text-[11px] text-slate-300 font-light max-w-sm">
                {urgencyNote}
              </p>
            </div>

            {/* Prominent Ticking Timer Digits */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md px-3 sm:px-4 py-2.5 rounded-2xl border border-white/10 shrink-0 shadow-inner">
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HOURS', val: timeLeft.hours },
                { label: 'MINS', val: timeLeft.minutes },
                { label: 'SECS', val: timeLeft.seconds },
              ].map((unit, idx) => (
                <React.Fragment key={unit.label}>
                  {idx > 0 && <span className={`${themeConfig.accentText} font-bold text-lg sm:text-xl`}>:</span>}
                  <div className="text-center min-w-[36px] sm:min-w-[42px]">
                    <div className={`font-mono font-bold text-base sm:text-xl px-1.5 py-1 rounded-lg border ${themeConfig.digitBox}`}>
                      {unit.val}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold tracking-wider mt-1 block">
                      {unit.label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER 5: BELOW ACTION BUTTONS & TRUST ICONS
  if (position === 'below_cta') {
    return (
      <div className="mt-4 mb-6 animate-fade-in">
        {AdminControlsBar}
        <div className={`rounded-2xl bg-gradient-to-r ${themeConfig.gradient} p-4 text-white border ${themeConfig.border} shadow-md`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Clock className={`w-5 h-5 ${themeConfig.accentText}`} />
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${themeConfig.badgeBg}`}>
                  {dealTag}
                </span>
                <p className="text-xs text-slate-200 mt-1">{urgencyNote}</p>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
              {[
                { label: 'D', val: timeLeft.days },
                { label: 'H', val: timeLeft.hours },
                { label: 'M', val: timeLeft.minutes },
                { label: 'S', val: timeLeft.seconds },
              ].map((unit, idx) => (
                <React.Fragment key={unit.label}>
                  {idx > 0 && <span className={`${themeConfig.accentText} font-bold text-xs`}>:</span>}
                  <div className="text-center min-w-[28px]">
                    <span className={`font-mono font-bold text-sm px-1.5 py-0.5 rounded border block ${themeConfig.digitBox}`}>
                      {unit.val}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold block mt-0.5">{unit.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER 6: BELOW DESCRIPTION & DETAILS
  if (position === 'below_description') {
    return (
      <div className="my-8 animate-fade-in">
        {AdminControlsBar}
        <div className={`rounded-3xl bg-gradient-to-r ${themeConfig.gradient} p-6 text-white border ${themeConfig.border} shadow-xl`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${themeConfig.badgeBg}`}>
                <Flame size={14} /> {dealTag}
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">{dealTitle}</h3>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className={`text-2xl font-bold ${themeConfig.accentText}`}>{discountPrice}</span>
                {originalPrice && originalPrice !== discountPrice && (
                  <span className="text-sm text-slate-400 line-through">{originalPrice}</span>
                )}
                <span className="text-xs text-slate-300">Special Blessed Price</span>
              </div>
              <p className="text-xs text-slate-300 max-w-md">{urgencyNote}</p>
            </div>

            {/* Timer Digits */}
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10">
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HOURS', val: timeLeft.hours },
                { label: 'MINS', val: timeLeft.minutes },
                { label: 'SECS', val: timeLeft.seconds },
              ].map((unit, idx) => (
                <React.Fragment key={unit.label}>
                  {idx > 0 && <span className={`${themeConfig.accentText} font-bold text-lg`}>:</span>}
                  <div className="text-center min-w-[42px]">
                    <div className={`font-mono font-bold text-lg px-2 py-1.5 rounded-lg border ${themeConfig.digitBox}`}>
                      {unit.val}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold tracking-wider mt-1 block">
                      {unit.label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER 7: BOTTOM OF PRODUCT PAGE
  return (
    <div className="mt-14 pt-8 border-t border-slate-200 animate-fade-in">
      {AdminControlsBar}
      <div className={`rounded-3xl bg-gradient-to-r ${themeConfig.gradient} p-6 sm:p-8 text-white border ${themeConfig.border} shadow-2xl`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${themeConfig.badgeBg}`}>
              <Flame size={14} /> {dealTag}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">{dealTitle}</h3>
            <div className="flex items-baseline gap-3 justify-center lg:justify-start">
              <span className={`text-3xl font-bold ${themeConfig.accentText}`}>{discountPrice}</span>
              {originalPrice && originalPrice !== discountPrice && (
                <span className="text-base text-slate-400 line-through">{originalPrice}</span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg font-light">{urgencyNote}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HOURS', val: timeLeft.hours },
                { label: 'MINS', val: timeLeft.minutes },
                { label: 'SECS', val: timeLeft.seconds },
              ].map((unit, idx) => (
                <React.Fragment key={unit.label}>
                  {idx > 0 && <span className={`${themeConfig.accentText} font-bold text-xl`}>:</span>}
                  <div className="text-center min-w-[42px] sm:min-w-[48px]">
                    <div className={`font-mono font-bold text-lg sm:text-2xl px-2 py-1.5 rounded-xl border ${themeConfig.digitBox}`}>
                      {unit.val}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold tracking-wider mt-1 block">
                      {unit.label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {onBuyNowClick && (
              <button
                type="button"
                onClick={onBuyNowClick}
                className={`font-bold px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 text-sm shrink-0 cursor-pointer ${themeConfig.btnBg}`}
              >
                <Zap size={16} className="fill-current" /> Claim Deal Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCountdownTimer;
