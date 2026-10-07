import React, { useState } from 'react';
import { ElementorBlock } from '../../types';
import { WIDGET_CATALOG, WidgetCatalogItem } from './elementorTemplates';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Star, 
  ExternalLink, 
  Clock, 
  Users, 
  ShieldCheck, 
  Globe, 
  Heart, 
  Sparkles, 
  Moon, 
  Search, 
  Compass, 
  Shield, 
  CheckCircle, 
  CheckCircle2,
  Check,
  ArrowRight,
  Pencil,
  Copy,
  Trash2,
  MoveUp,
  MoveDown,
  Plus,
  MapPin,
  Play,
  Pause,
  Volume2,
  Headphones,
  Activity,
  Hash,
  Share2,
  Info,
  AlertTriangle,
  XCircle,
  X,
  Code,
  Anchor,
  Grid,
  Layout,
  MessageSquare,
  Quote,
  Phone,
  Mail,
  Folder,
  Layers,
  ListFilter,
  ListChecks,
  Sliders,
  Maximize2
} from 'lucide-react';
import { 
  QuranRehalIcon,
  PrayerMatIcon,
  IslamicRosetteIcon,
  HadithBookIcon
} from '../IslamicQuickActionBar';
import { OurHappyClients } from '../OurHappyClients';

interface ElementorRendererProps {
  blocks: ElementorBlock[];
  isBuilderMode?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
  onMoveBlock?: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlock?: (blockId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
  onAddBlockHere?: (index: number) => void;
  onDropBlockIntoColumn?: (columnBlockId: string, colIndex: number, widgetType: string) => void;
  onAddBlockToColumn?: (columnBlockId: string, colIndex: number, widgetType: string) => void;
}

const ICON_MAP: Record<string, React.FC<any>> = {
  Clock,
  Users,
  ShieldCheck,
  Globe,
  Heart,
  Sparkles,
  Moon,
  Search,
  Compass,
  Shield,
  CheckCircle,
  Star
};

const ElementorImageWidget: React.FC<{
  block: ElementorBlock;
  radiusClass: string;
  shadowClass: string;
  isBuilderMode?: boolean;
}> = ({ block, radiusClass, shadowClass, isBuilderMode }) => {
  const { data, styles } = block;
  const [hasError, setHasError] = useState(false);
  
  // Sizing
  const sizeClass = 
    data.imageSize === 'small' ? 'max-h-[180px]' :
    data.imageSize === 'medium' ? 'max-h-[280px]' :
    data.imageSize === 'large' ? 'max-h-[400px]' :
    'max-h-[550px]';

  const defaultFallback = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80';
  const displayUrl = (!hasError && data.imageUrl) ? data.imageUrl : defaultFallback;

  const imgElement = (
    <img 
      src={displayUrl} 
      alt={data.imageAlt || 'Banner Image'} 
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        if (data.imageUrl && data.imageUrl !== defaultFallback) {
          setHasError(true);
        }
      }}
      className={`w-full ${sizeClass} object-cover inline-block ${radiusClass || 'rounded-2xl'} ${shadowClass} transition`}
    />
  );

  return (
    <div className={styles.align === 'center' ? 'text-center' : styles.align === 'right' ? 'text-right' : 'text-left'}>
      {data.imageLink ? (
        <a 
          href={data.imageLink} 
          target={data.imageLinkTarget || '_self'} 
          rel="noopener noreferrer" 
          className="inline-block w-full"
          onClick={(e) => { if (isBuilderMode) e.preventDefault(); }}
        >
          {imgElement}
        </a>
      ) : (
        imgElement
      )}

      {hasError && isBuilderMode && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-left flex items-start gap-2">
          <span className="text-sm">⚠️</span>
          <div>
            <p className="font-bold">Image URL could not be loaded directly</p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              Some websites (e.g. PNGTree, Pinterest) block direct hotlinking. Showing fallback. You can click <strong>"Upload from Computer"</strong> in the left panel to upload this image file directly!
            </p>
          </div>
        </div>
      )}

      {data.imageCaption && (
        <p className="text-xs text-slate-500 mt-2 italic">{data.imageCaption}</p>
      )}
    </div>
  );
};

export const ElementorRenderer: React.FC<ElementorRendererProps> = ({
  blocks,
  isBuilderMode = false,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onAddBlockHere,
  onDropBlockIntoColumn,
  onAddBlockToColumn
}) => {
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({ '0': true });
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});
  const [openToggles, setOpenToggles] = useState<Record<string, boolean>>({});
  const [carouselSlide, setCarouselSlide] = useState<Record<string, number>>({});
  const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, boolean>>({});
  const [audioPlaying, setAudioPlaying] = useState<Record<string, boolean>>({});
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<Record<string, boolean>>({});
  const [formSuccess, setFormSuccess] = useState<Record<string, boolean>>({});
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [columnPickerTarget, setColumnPickerTarget] = useState<{ blockId: string; colIndex: number; colName: string } | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<string>('all');

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFormSubmit = (e: React.FormEvent, blockId: string) => {
    e.preventDefault();
    if (isBuilderMode) return;
    setFormSubmitting(prev => ({ ...prev, [blockId]: true }));
    setTimeout(() => {
      setFormSubmitting(prev => ({ ...prev, [blockId]: false }));
      setFormSuccess(prev => ({ ...prev, [blockId]: true }));
    }, 800);
  };

  const renderSingleBlock = (block: ElementorBlock, index: number, isNested = false) => {
    const isSelected = isBuilderMode && selectedBlockId === block.id;
    const { data, styles } = block;

    // Outer Styles
    const containerStyle: React.CSSProperties = {
      backgroundColor: styles.bgColor || 'transparent',
      backgroundImage: styles.bgImageUrl ? `url(${styles.bgImageUrl})` : (styles.bgGradient || 'none'),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: styles.textColor || 'inherit',
      borderColor: styles.borderColor || 'transparent',
      textAlign: styles.align || 'left'
    };

    // Padding mappings
    const pyClass = {
      none: 'py-0',
      sm: 'py-4',
      md: 'py-8 md:py-12',
      lg: 'py-12 md:py-16',
      xl: 'py-16 md:py-24'
    }[styles.paddingY || 'md'];

    const pxClass = {
      none: 'px-0',
      sm: 'px-4',
      md: 'px-6 md:px-8',
      lg: 'px-8 md:px-12'
    }[styles.paddingX || 'none'];

    const radiusClass = {
      none: 'rounded-none',
      sm: 'rounded-lg',
      md: 'rounded-xl',
      lg: 'rounded-2xl',
      xl: 'rounded-3xl',
      full: 'rounded-full'
    }[styles.borderRadius || 'none'];

    const shadowClass = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-2xl'
    }[styles.shadow || 'none'];

    const maxWidthClass = {
      sm: 'max-w-xl',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      '2xl': 'max-w-7xl',
      full: 'w-full'
    }[styles.maxWidth || 'xl'];

    // Margin top / banner overlap mapping
    let marginClass = '';
    if (styles.overlapBanner || styles.marginTop === '-half') {
      marginClass = 'relative z-30 -translate-y-1/2 -mb-8 sm:-mb-10 md:-mb-12';
    } else if (styles.marginTop === '-sm') {
      marginClass = '-mt-4';
    } else if (styles.marginTop === '-md') {
      marginClass = '-mt-8';
    } else if (styles.marginTop === '-lg') {
      marginClass = '-mt-12';
    } else if (styles.marginTop === '-xl') {
      marginClass = '-mt-16';
    }

    return (
      <div 
        key={block.id}
        onClick={(e) => {
          if (isBuilderMode && onSelectBlock) {
            e.stopPropagation();
            onSelectBlock(block.id);
          }
        }}
        className={`relative transition-all group/block ${marginClass} ${
          isBuilderMode ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-sky-400' : ''
        } ${
          isSelected ? 'outline outline-2 outline-sky-600 ring-4 ring-sky-500/20' : ''
        } ${pyClass} ${pxClass} ${radiusClass} ${shadowClass}`}
        style={containerStyle}
      >
        {/* Background Overlay if image present */}
        {styles.bgImageUrl && styles.bgOverlayOpacity ? (
          <div 
            className="absolute inset-0 bg-black pointer-events-none" 
            style={{ opacity: styles.bgOverlayOpacity, borderRadius: 'inherit' }}
          />
        ) : null}

        {/* Builder Controls Toolbar */}
        {isBuilderMode && (
          <div className={`absolute top-2 right-2 z-30 flex items-center bg-spirit-900/90 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-sans shadow-lg transition-opacity duration-200 ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
          }`}>
            <span className="font-bold text-sky-300 mr-2 text-[10px] uppercase tracking-wider">
              {block.type.replace('_', ' ')}
            </span>
            <div className="flex items-center space-x-1 border-l border-white/20 pl-1.5">
              {onMoveBlock && (
                <>
                  <button 
                    type="button"
                    title="Move Up"
                    onClick={(e) => { e.stopPropagation(); onMoveBlock(block.id, 'up'); }}
                    className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    title="Move Down"
                    onClick={(e) => { e.stopPropagation(); onMoveBlock(block.id, 'down'); }}
                    className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              {onDuplicateBlock && (
                <button 
                  type="button"
                  title="Duplicate"
                  onClick={(e) => { e.stopPropagation(); onDuplicateBlock(block.id); }}
                  className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
              {onDeleteBlock && (
                <button 
                  type="button"
                  title="Delete"
                  onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                  className="p-1 hover:bg-red-500/80 rounded text-red-300 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className={`relative z-10 mx-auto ${maxWidthClass}`}>
          {/* 1. Heading */}
          {block.type === 'heading' && (
            <div>
              {data.subtext && (
                <span className="text-accent-500 font-bold tracking-[0.25em] uppercase text-xs sm:text-sm mb-2 block font-sans">
                  {data.subtext}
                </span>
              )}
              <h2 className={`font-serif font-bold leading-tight ${
                styles.fontSize === '5xl' ? 'text-4xl md:text-6xl' :
                styles.fontSize === '4xl' ? 'text-3xl md:text-5xl' :
                styles.fontSize === '3xl' ? 'text-2xl md:text-4xl' :
                styles.fontSize === '2xl' ? 'text-xl md:text-3xl' : 'text-xl md:text-2xl'
              }`}>
                {data.text || 'Heading Title'}
              </h2>
            </div>
          )}

          {/* 2. Text / Paragraph */}
          {block.type === 'text' && (
            <div 
              className="prose prose-slate max-w-none text-current leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.htmlContent || '<p>Enter your text here...</p>' }}
            />
          )}

          {/* 3. Button */}
          {block.type === 'button' && (
            <div className={styles.align === 'center' ? 'text-center' : styles.align === 'right' ? 'text-right' : 'text-left'}>
              <a
                href={data.buttonLink || '#'}
                target={data.openInNewTab ? '_blank' : '_self'}
                rel="noreferrer"
                onClick={(e) => { if (isBuilderMode) e.preventDefault(); }}
                className={`inline-flex items-center justify-center font-bold tracking-wide transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 ${
                  data.buttonSize === 'lg' ? 'px-8 py-4 text-base' :
                  data.buttonSize === 'sm' ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm'
                } ${
                  data.buttonVariant === 'secondary' ? 'bg-spirit-900 text-white hover:bg-spirit-800' :
                  data.buttonVariant === 'outline' ? 'border-2 border-current hover:bg-current hover:text-white' :
                  data.buttonVariant === 'emerald' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                  'bg-accent-600 text-white hover:bg-accent-500'
                } ${radiusClass || 'rounded-full'}`}
              >
                {data.buttonText || 'Click Here'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </div>
          )}

          {/* 4. Image */}
          {block.type === 'image' && (
            <ElementorImageWidget
              block={block}
              radiusClass={radiusClass}
              shadowClass={shadowClass}
              isBuilderMode={isBuilderMode}
            />
          )}

          {/* 5. Video */}
          {block.type === 'video' && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black">
              {data.videoUrl && data.videoUrl.includes('embed') ? (
                <iframe 
                  src={data.videoUrl} 
                  title="Video Player"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6">
                  <p className="text-sm font-semibold">Video Preview URL: {data.videoUrl}</p>
                </div>
              )}
            </div>
          )}

          {/* 6. Divider */}
          {block.type === 'divider' && (
            <div className="flex items-center justify-center my-4">
              {data.dividerStyle === 'ornate' ? (
                <div className="flex items-center space-x-4 w-full max-w-md">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-accent-500/60" />
                  <div className="text-accent-600 text-sm font-serif">✦ ﷽ ✦</div>
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-accent-500/60" />
                </div>
              ) : (
                <div className={`w-full border-t ${
                  data.dividerStyle === 'dashed' ? 'border-dashed border-slate-300' :
                  data.dividerStyle === 'dotted' ? 'border-dotted border-slate-300' : 'border-slate-200'
                }`} />
              )}
            </div>
          )}

          {/* 7. Spacer */}
          {block.type === 'spacer' && (
            <div style={{ height: `${data.spacerHeight || 40}px` }} className="w-full" />
          )}

          {/* 7b. Google Maps */}
          {block.type === 'google_maps' && (
            <div className="w-full my-4 rounded-xl overflow-hidden shadow-md border border-slate-200">
              <iframe
                title="Location Map"
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(data.mapLocation || 'Lahore, Pakistan')}&t=&z=${data.mapZoom || 14}&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          )}

          {/* 7c. Icon */}
          {block.type === 'icon' && (
            <div className={`flex items-center justify-${styles.align === 'left' ? 'start' : styles.align === 'right' ? 'end' : 'center'} my-3`}>
              <div 
                className={`p-4 rounded-2xl flex items-center justify-center transition shadow-sm ${
                  styles.bgColor ? '' : 'bg-pink-50'
                }`}
                style={{
                  color: styles.textColor || '#e01e5a',
                  backgroundColor: styles.bgColor
                }}
              >
                <Star className={`${
                  data.iconSize === 'sm' ? 'w-6 h-6' :
                  data.iconSize === 'md' ? 'w-8 h-8' :
                  data.iconSize === 'xl' ? 'w-14 h-14' : 'w-10 h-10'
                }`} />
              </div>
            </div>
          )}

          {/* 8. Ayat / Sacred Quote */}
          {block.type === 'ayat' && (
            <div className="text-center p-8 md:p-12 rounded-2xl border border-accent-500/30 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm relative overflow-hidden shadow-sm">
              <div className="text-accent-500 text-2xl mb-4 font-serif">﷽</div>
              <p className="text-2xl sm:text-4xl font-serif leading-relaxed mb-6 tracking-wide text-accent-400 font-bold" dir="rtl">
                {data.arabicText || 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ'}
              </p>
              <p className="text-base sm:text-xl italic font-serif opacity-90 max-w-3xl mx-auto leading-relaxed mb-4">
                {data.translationText || '"Unquestionably, by the remembrance of Allah hearts are assured."'}
              </p>
              {data.sourceRef && (
                <span className="inline-block text-xs font-bold tracking-widest uppercase text-accent-500 bg-accent-500/10 px-3 py-1 rounded-full">
                  {data.sourceRef}
                </span>
              )}
            </div>
          )}

          {/* Islamic Services Overlapping Quick Bar */}
          {block.type === 'islamic_services_bar' && (
            <div className="w-full bg-[#073630]/95 backdrop-blur-md border border-emerald-400/30 rounded-2xl shadow-2xl p-2.5 sm:p-3 md:py-3.5 md:px-6 text-white transition-all">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-0 lg:divide-x lg:divide-emerald-500/25">
                <div className="flex items-center justify-center lg:justify-start gap-3 py-2 px-3 md:px-4 rounded-xl hover:bg-white/10 hover:text-emerald-300 transition-all cursor-pointer">
                  <div className="text-white shrink-0">
                    <QuranRehalIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className="font-bold text-sm sm:text-base tracking-wide text-white truncate">
                    {data.item1Text || 'Read Quran'}
                  </span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3 py-2 px-3 md:px-4 rounded-xl hover:bg-white/10 hover:text-emerald-300 transition-all cursor-pointer">
                  <div className="text-white shrink-0">
                    <PrayerMatIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className="font-bold text-sm sm:text-base tracking-wide text-white truncate">
                    {data.item2Text || 'Learn to Pray'}
                  </span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3 py-2 px-3 md:px-4 rounded-xl hover:bg-white/10 hover:text-emerald-300 transition-all cursor-pointer">
                  <div className="text-white shrink-0">
                    <IslamicRosetteIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className="font-bold text-sm sm:text-base tracking-wide text-white truncate">
                    {data.item3Text || 'Islamic Story'}
                  </span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3 py-2 px-3 md:px-4 rounded-xl hover:bg-white/10 hover:text-emerald-300 transition-all cursor-pointer">
                  <div className="text-white shrink-0">
                    <HadithBookIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className="font-bold text-sm sm:text-base tracking-wide text-white truncate">
                    {data.item4Text || 'Learn Ahadis'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Our Happy Clients Showcase */}
          {block.type === 'happy_clients_showcase' && (
            <div className="w-full">
              <OurHappyClients />
            </div>
          )}

          {/* 9. Iconbox */}
          {block.type === 'iconbox' && (
            <div className="p-6 md:p-8 rounded-2xl border border-slate-100 hover:border-accent-400/50 bg-white transition-all duration-300 hover:shadow-xl text-center group">
              <div className="w-16 h-16 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-accent-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-spirit-900 mb-3 group-hover:text-accent-600 transition-colors">
                {data.iconTitle || 'Sacred Guidance'}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {data.iconDescription || 'Detailed spiritual explanation grounded in Quranic teachings.'}
              </p>
              {data.iconLink && (
                <a 
                  href={data.iconLink}
                  onClick={(e) => { if (isBuilderMode) e.preventDefault(); }}
                  className="inline-flex items-center text-xs font-bold tracking-wider uppercase text-accent-600 hover:text-accent-700"
                >
                  Learn More <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
            </div>
          )}

          {/* 10. Hero */}
          {block.type === 'hero' && (
            <div className="py-12 md:py-20 text-center max-w-4xl mx-auto">
              {data.heroBadge && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-400 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
                  {data.heroBadge}
                </div>
              )}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold leading-tight tracking-tight mb-6">
                {data.heroTitle || 'Divine Rohani Guidance'}
              </h1>
              <p className="text-base sm:text-xl opacity-85 leading-relaxed max-w-2xl mx-auto mb-10">
                {data.heroSubtitle || 'Discover genuine spiritual remedies and Quranic istikhara consultations.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {data.heroPrimaryBtnText && (
                  <a
                    href={data.heroPrimaryBtnLink || '#contact'}
                    onClick={(e) => { if (isBuilderMode) e.preventDefault(); }}
                    className="px-8 py-4 rounded-full bg-accent-600 text-white font-bold text-sm tracking-wide shadow-xl hover:bg-accent-500 hover:scale-105 transition-all"
                  >
                    {data.heroPrimaryBtnText}
                  </a>
                )}
                {data.heroSecondaryBtnText && (
                  <a
                    href={data.heroSecondaryBtnLink || '/services'}
                    onClick={(e) => { if (isBuilderMode) e.preventDefault(); }}
                    className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm tracking-wide hover:bg-white/20 transition-all"
                  >
                    {data.heroSecondaryBtnText}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 11. CTA Banner */}
          {block.type === 'cta' && (
            <div className="p-8 md:p-14 rounded-3xl bg-gradient-to-br from-spirit-900 via-spirit-800 to-slate-900 text-white shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
              <div className="max-w-2xl">
                <h3 className="text-2xl sm:text-4xl font-serif font-bold mb-4 leading-snug">
                  {data.ctaTitle || 'Take the First Step Toward Relief'}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {data.ctaDescription || 'Contact our scholar today for a confidential assessment and authentic Quranic istikhara.'}
                </p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href={data.ctaBtnLink || '#contact'}
                  onClick={(e) => { if (isBuilderMode) e.preventDefault(); }}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-accent-600 hover:bg-accent-500 text-white font-bold text-sm shadow-xl transition-all hover:scale-105"
                >
                  {data.ctaBtnText || 'Contact Us Now'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          )}

          {/* 12. Accordion / FAQ */}
          {block.type === 'accordion' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {(data.accordionItems || []).map((item, idx) => {
                const isOpen = openAccordions[item.id || String(idx)];
                return (
                  <div 
                    key={item.id || idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.id || String(idx))}
                      className="w-full p-5 sm:p-6 text-left font-serif font-bold text-base sm:text-lg text-spirit-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                    >
                      <span>{item.title}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-accent-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-4">
                        {item.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 13. Stats Counters */}
          {block.type === 'stats' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {(data.statsItems || []).map((stat) => (
                <div key={stat.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-3xl sm:text-5xl font-serif font-bold text-accent-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold opacity-80 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 14. Testimonial */}
          {block.type === 'testimonial' && (
            <div className="max-w-2xl mx-auto p-8 rounded-2xl border border-slate-100 shadow-md bg-white text-center">
              <div className="flex justify-center gap-1 text-amber-400 mb-4">
                {[...Array(data.testimonialRating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 italic text-base sm:text-lg leading-relaxed mb-6 font-serif">
                "{data.testimonialQuote || 'An extraordinary spiritual experience that brought clarity and serenity into our household.'}"
              </p>
              <div className="flex items-center justify-center gap-3">
                {data.testimonialAvatar && (
                  <img 
                    src={data.testimonialAvatar} 
                    alt={data.testimonialAuthor || 'Client'} 
                    className="w-12 h-12 rounded-full object-cover border border-accent-300"
                  />
                )}
                <div className="text-left">
                  <h4 className="font-bold text-spirit-900 text-sm">{data.testimonialAuthor || 'Verified Client'}</h4>
                  <p className="text-xs text-slate-400">{data.testimonialRole || 'Istikhara Consultation'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 15. Spiritual Inquiry Form */}
          {block.type === 'form' && (
            <div className="max-w-xl mx-auto p-8 md:p-10 rounded-3xl bg-white border border-slate-100 shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-spirit-900 mb-2">
                  {data.formTitle || 'Request Consultation'}
                </h3>
                {data.formSubtitle && (
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{data.formSubtitle}</p>
                )}
              </div>

              {formSuccess[block.id] ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <h4 className="font-bold text-emerald-900 text-lg mb-1">Inquiry Received (JazakAllah)</h4>
                  <p className="text-emerald-700 text-xs leading-relaxed">
                    Our spiritual counselor has received your confidential inquiry and will reach out to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => handleFormSubmit(e, block.id)} className="space-y-4">
                  {(data.formFields || []).map((field, fIdx) => (
                    <div key={fIdx}>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none transition"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          required={field.required}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none transition bg-white"
                        >
                          <option value="">Choose concern type...</option>
                          <option value="Istikhara">Sacred Istikhara Guidance</option>
                          <option value="Rohani Ilaj">Rohani Ilaj (Spiritual Healing)</option>
                          <option value="Evil Eye">Nazar / Evil Eye Protection</option>
                          <option value="Marriage">Marriage & Family Reconciliation</option>
                          <option value="Other">Other Spiritual Inquiry</option>
                        </select>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none transition"
                        />
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={formSubmitting[block.id]}
                    className="w-full py-3.5 px-6 rounded-xl bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    {formSubmitting[block.id] ? 'Submitting...' : (data.formButtonText || 'Send Confidential Request')}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Star Rating Widget */}
          {block.type === 'star_rating' && (
            <div className={`py-2 text-${styles.align || 'center'}`}>
              {data.ratingTitle && (
                <div className="font-bold text-slate-800 text-sm mb-1.5 font-serif">
                  {data.ratingTitle}
                </div>
              )}
              <div className={`flex items-center gap-1.5 justify-${styles.align === 'left' ? 'start' : styles.align === 'right' ? 'end' : 'center'}`}>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(Number(data.ratingScale || 5))].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < (Number(data.ratingValue || 5)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`} 
                    />
                  ))}
                </div>
                {data.ratingCount && (
                  <span className="text-xs font-semibold text-slate-500 ml-1.5">
                    {data.ratingCount}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Image Box Widget */}
          {block.type === 'image_box' && (
            <div className={`p-6 bg-white rounded-2xl border border-slate-100 hover:border-accent-200 transition-all shadow-xs hover:shadow-md ${
              data.imageBoxPosition === 'left' ? 'flex items-start gap-5 text-left' :
              data.imageBoxPosition === 'right' ? 'flex flex-row-reverse items-start gap-5 text-right' :
              'flex flex-col items-center text-center'
            }`}>
              <div className="flex-shrink-0 mb-4 overflow-hidden rounded-xl shadow-xs">
                <img
                  src={data.imageBoxUrl || 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80'}
                  alt={data.imageBoxTitle || 'Image Box'}
                  className="w-28 h-28 md:w-32 md:h-32 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-serif font-bold text-spirit-900 mb-2">
                  {data.imageBoxTitle || 'Spiritual Title'}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  {data.imageBoxDescription || 'Brief description of this spiritual service or holy place.'}
                </p>
                {data.imageBoxLink && (
                  <a
                    href={data.imageBoxLink}
                    onClick={(e) => { if (isBuilderMode) e.preventDefault(); }}
                    className="inline-flex items-center text-xs font-bold text-accent-600 hover:text-accent-700"
                  >
                    Read Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Basic Gallery Widget */}
          {block.type === 'gallery' && (
            <div className="py-2">
              <div className={`grid gap-4 ${
                data.galleryColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                data.galleryColumns === 4 ? 'grid-cols-2 md:grid-cols-4' :
                'grid-cols-2 md:grid-cols-3'
              }`}>
                {(data.galleryImages || []).map((imgItem: any, imgIdx: number) => (
                  <div
                    key={imgItem.id || imgIdx}
                    onClick={() => setLightboxImg(imgItem.url)}
                    className="group relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg transition-all border border-slate-100"
                  >
                    <img
                      src={imgItem.url}
                      alt={imgItem.title || `Gallery Image ${imgIdx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-white text-xs font-bold font-serif">{imgItem.title || 'View Image'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Carousel Widget */}
          {block.type === 'carousel' && (() => {
            const slides = data.carouselSlides || [];
            const currentSlide = carouselSlide[block.id] || 0;
            const activeItem = slides[currentSlide] || slides[0];

            return (
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 text-white">
                {activeItem && (
                  <div className="relative aspect-16/9 md:aspect-21/9 w-full overflow-hidden">
                    <img
                      src={activeItem.imageUrl}
                      alt={activeItem.title || 'Carousel Slide'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10">
                      {activeItem.title && (
                        <h3 className="text-xl md:text-3xl font-serif font-bold text-white mb-2">
                          {activeItem.title}
                        </h3>
                      )}
                      {activeItem.caption && (
                        <p className="text-slate-200 text-xs md:text-sm max-w-2xl leading-relaxed">
                          {activeItem.caption}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselSlide(prev => ({
                          ...prev,
                          [block.id]: (currentSlide - 1 + slides.length) % slides.length
                        }));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                      title="Previous Slide"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselSlide(prev => ({
                          ...prev,
                          [block.id]: (currentSlide + 1) % slides.length
                        }));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                      title="Next Slide"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                      {slides.map((_: any, sIdx: number) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCarouselSlide(prev => ({ ...prev, [block.id]: sIdx }));
                          }}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            sIdx === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* Icon List Widget */}
          {block.type === 'icon_list' && (
            <div className={`py-2 ${data.iconListLayout === 'inline' ? 'flex flex-wrap gap-4 items-center' : 'space-y-3'}`}>
              {(data.iconListItems || []).map((item: any, itemIdx: number) => (
                <div key={item.id || itemIdx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {item.link ? (
                    <a
                      href={item.link}
                      onClick={(e) => { if (isBuilderMode) e.preventDefault(); }}
                      className="text-sm font-medium text-slate-700 hover:text-accent-600 transition"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-slate-700">{item.text}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Counter Widget */}
          {block.type === 'counter' && (
            <div className={`p-6 rounded-2xl bg-white border border-slate-100 shadow-xs text-${styles.align || 'center'}`}>
              <div className="text-4xl md:text-5xl font-serif font-extrabold text-accent-600 tracking-tight mb-2">
                <span>{data.counterPrefix || ''}</span>
                <span>{data.counterNumber || '15,000'}</span>
                <span>{data.counterSuffix || '+'}</span>
              </div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                {data.counterTitle || 'Consultations Completed'}
              </p>
            </div>
          )}

          {/* Tabs Widget */}
          {block.type === 'tabs' && (() => {
            const tabs = data.tabItems || [];
            const activeIdx = activeTabs[block.id] ?? (data.tabActiveIndex || 0);
            const activeTab = tabs[activeIdx] || tabs[0];

            return (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
                  {tabs.map((tab: any, tIdx: number) => (
                    <button
                      key={tab.id || tIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTabs(prev => ({ ...prev, [block.id]: tIdx }));
                      }}
                      className={`px-6 py-3.5 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                        tIdx === activeIdx
                          ? 'border-[#e01e5a] text-[#e01e5a] bg-white'
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
                {activeTab && (
                  <div className="p-6 text-slate-700 text-sm leading-relaxed">
                    {activeTab.content}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Toggle Widget */}
          {block.type === 'toggle' && (
            <div className="space-y-3">
              {(data.toggleItems || []).map((item: any, tIdx: number) => {
                const toggleKey = `${block.id}_${item.id || tIdx}`;
                const isOpen = openToggles[toggleKey] ?? (tIdx === 0);

                return (
                  <div key={item.id || tIdx} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenToggles(prev => ({ ...prev, [toggleKey]: !isOpen }));
                      }}
                      className="w-full p-4 text-left font-serif font-bold text-sm sm:text-base text-slate-800 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                    >
                      <span>{item.title}</span>
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3">
                        {item.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Social Icons Widget */}
          {block.type === 'social_icons' && (
            <div className={`flex flex-wrap gap-2.5 items-center justify-${styles.align === 'left' ? 'start' : styles.align === 'right' ? 'end' : 'center'} py-2`}>
              {(data.socialLinks || []).map((social: any, sIdx: number) => {
                const platformColors: Record<string, string> = {
                  whatsapp: 'bg-[#25D366] text-white hover:bg-[#20ba59]',
                  youtube: 'bg-[#FF0000] text-white hover:bg-[#d90000]',
                  facebook: 'bg-[#1877F2] text-white hover:bg-[#1464cc]',
                  instagram: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
                  twitter: 'bg-[#000000] text-white hover:bg-slate-800'
                };
                const colorClass = platformColors[social.platform] || 'bg-slate-800 text-white';
                const shapeClass = data.socialShape === 'square' ? 'rounded-none' : data.socialShape === 'circle' ? 'rounded-full' : 'rounded-xl';

                return (
                  <a
                    key={social.id || sIdx}
                    href={social.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => { if (isBuilderMode) e.preventDefault(); }}
                    className={`w-10 h-10 flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all ${colorClass} ${shapeClass}`}
                    title={social.label || social.platform}
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Progress Bar Widget */}
          {block.type === 'progress_bar' && (
            <div className="py-2 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700">
                <span>{data.progressTitle || 'Consultation Satisfaction'}</span>
                {data.progressShowPercentage !== false && (
                  <span>{data.progressPercentage || 95}%</span>
                )}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, data.progressPercentage || 95))}%`,
                    backgroundColor: data.progressInnerColor || '#39b54a'
                  }}
                />
              </div>
            </div>
          )}

          {/* SoundCloud / Audio Player Widget */}
          {block.type === 'soundcloud' && (
            <div className="my-3 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg border border-slate-700 max-w-xl mx-auto flex items-center gap-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAudioPlaying(prev => ({ ...prev, [block.id]: !prev[block.id] }));
                }}
                className="w-12 h-12 rounded-full bg-[#ff5500] hover:bg-[#e04b00] text-white flex items-center justify-center shadow-md flex-shrink-0 transition active:scale-95 cursor-pointer"
                title="Play / Pause Audio"
              >
                {audioPlaying[block.id] ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Headphones className="w-3.5 h-3.5 text-[#ff5500]" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {data.audioReciter || 'Quranic Audio Stream'}
                  </span>
                </div>
                <h4 className="text-sm font-bold truncate text-white">
                  {data.soundcloudTitle || 'Surah Ar-Rahman (Heart Tranquility Recitation)'}
                </h4>
                <div className="flex items-center gap-1 mt-2 h-4">
                  {[40, 70, 90, 60, 80, 100, 50, 85, 65, 45, 95, 75, 55, 90, 60, 40, 80, 60, 90, 50].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all ${
                        audioPlaying[block.id] ? 'bg-[#ff5500] animate-pulse' : 'bg-slate-600'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Shortcode Widget */}
          {block.type === 'shortcode' && (
            <div className="p-4 rounded-xl border border-dashed border-sky-300 bg-sky-50/70 text-slate-800 my-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-100 text-sky-800 font-mono text-xs font-bold mb-2">
                <Code className="w-3.5 h-3.5" />
                <span>{data.shortcodeString || '[rohani_prayer_times]'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-xs border border-sky-100 mt-2 text-left">
                <div className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>✨ Islamic Prayer Times (Lahore)</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Live Output</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px] mt-2">
                  <div className="bg-slate-50 p-1.5 rounded"><strong>Fajr</strong><br/>4:42 AM</div>
                  <div className="bg-slate-50 p-1.5 rounded"><strong>Dhuhr</strong><br/>12:08 PM</div>
                  <div className="bg-slate-50 p-1.5 rounded"><strong>Asr</strong><br/>4:38 PM</div>
                  <div className="bg-slate-50 p-1.5 rounded"><strong>Maghrib</strong><br/>6:15 PM</div>
                  <div className="bg-slate-50 p-1.5 rounded"><strong>Isha</strong><br/>7:34 PM</div>
                </div>
              </div>
            </div>
          )}

          {/* HTML Widget */}
          {block.type === 'html' && (
            <div 
              className="my-2"
              dangerouslySetInnerHTML={{ __html: data.customHtml || '<div class="p-3 bg-slate-100 rounded text-xs">Custom HTML Block</div>' }}
            />
          )}

          {/* Menu Anchor Widget */}
          {block.type === 'menu_anchor' && (
            <div id={data.anchorName || 'anchor'} className="scroll-mt-24 w-full">
              {isBuilderMode && (
                <div className="border border-dashed border-amber-400 bg-amber-50/80 text-amber-800 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 my-1">
                  <Anchor className="w-3.5 h-3.5" />
                  <span className="font-mono font-bold">Menu Anchor: #{data.anchorName || 'anchor'}</span>
                  <span className="text-[10px] text-amber-600">(Invisible on live site)</span>
                </div>
              )}
            </div>
          )}

          {/* Sidebar Widget */}
          {block.type === 'sidebar' && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 max-w-sm">
              <h4 className="font-serif font-bold text-spirit-900 text-base border-b border-slate-100 pb-2 flex items-center gap-2">
                <Layout className="w-4 h-4 text-accent-600" />
                {data.sidebarTitle || 'Spiritual Quick Portal'}
              </h4>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Search Portal</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search remedies..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-accent-500"
                  />
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Popular Remedies</span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="hover:text-accent-600 cursor-pointer flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-accent-500" /> Rohani Istikhara Online
                  </li>
                  <li className="hover:text-accent-600 cursor-pointer flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-accent-500" /> Protection from Evil Eye (Nazar)
                  </li>
                  <li className="hover:text-accent-600 cursor-pointer flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-accent-500" /> Shifa via Ruqyah Shar'iyyah
                  </li>
                  <li className="hover:text-accent-600 cursor-pointer flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-accent-500" /> Family Harmony Supplications
                  </li>
                </ul>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <span className="font-bold block mb-1">Direct WhatsApp Help:</span>
                <span>Reach our authenticated scholar 24/7 for emergency spiritual concerns.</span>
              </div>
            </div>
          )}

          {/* Alert Widget */}
          {block.type === 'alert' && !dismissedAlerts[block.id] && (() => {
            const alertStyles: Record<string, { bg: string; border: string; text: string; icon: React.FC<any> }> = {
              info: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-900', icon: Info },
              success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: CheckCircle2 },
              warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: AlertTriangle },
              danger: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', icon: XCircle }
            };
            const current = alertStyles[data.alertType || 'info'] || alertStyles.info;
            const IconComp = current.icon;

            return (
              <div className={`p-4 rounded-xl border ${current.bg} ${current.border} ${current.text} flex items-start justify-between gap-3 shadow-2xs my-2`}>
                <div className="flex items-start gap-3">
                  <IconComp className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    {data.alertTitle && <h4 className="font-bold text-sm mb-0.5">{data.alertTitle}</h4>}
                    <p className="text-xs opacity-90 leading-relaxed">{data.alertDescription || 'Alert message content'}</p>
                  </div>
                </div>
                {data.alertDismissible !== false && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDismissedAlerts(prev => ({ ...prev, [block.id]: true }));
                    }}
                    className="p-1 rounded hover:bg-black/5 transition text-current opacity-60 hover:opacity-100 cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })()}

          {/* Multi-Column Container or Inner Section */}
          {(block.type === 'columns' || block.type === 'inner_section') && (
            <div className={`grid gap-6 md:gap-8 ${
              block.columnsCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
              block.columnsCount === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
              block.columnLayout === '66-33' ? 'grid-cols-1 md:grid-cols-3 [&>*:first-child]:md:col-span-2' :
              block.columnLayout === '33-66' ? 'grid-cols-1 md:grid-cols-3 [&>*:last-child]:md:col-span-2' :
              'grid-cols-1 md:grid-cols-2'
            }`}>
              {(block.columnsData || []).map((colBlocks, colIdx) => {
                const colKey = `${block.id}-${colIdx}`;
                const isOverThisCol = dragOverCol === colKey;

                return (
                  <div 
                    key={colIdx} 
                    onDragOver={(e) => {
                      if (isBuilderMode) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = 'copy';
                        if (dragOverCol !== colKey) {
                          setDragOverCol(colKey);
                        }
                      }
                    }}
                    onDragEnter={(e) => {
                      if (isBuilderMode) {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverCol(colKey);
                      }
                    }}
                    onDragLeave={(e) => {
                      if (isBuilderMode) {
                        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                        setDragOverCol(null);
                      }
                    }}
                    onDrop={(e) => {
                      if (!isBuilderMode) return;
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverCol(null);
                      try {
                        const dataStr = e.dataTransfer.getData('text/plain');
                        if (!dataStr) return;
                        const parsed = JSON.parse(dataStr);
                        if (parsed.type === 'NEW_WIDGET') {
                          if (onDropBlockIntoColumn) {
                            onDropBlockIntoColumn(block.id, colIdx, parsed.widgetType);
                          } else if (onAddBlockToColumn) {
                            onAddBlockToColumn(block.id, colIdx, parsed.widgetType);
                          }
                        }
                      } catch (err) {
                        console.warn(err);
                      }
                    }}
                    className={`min-h-[120px] flex flex-col justify-start rounded-xl transition-all relative ${
                      isBuilderMode 
                        ? isOverThisCol
                          ? 'border-2 border-dashed border-[#e01e5a] bg-rose-50/70 ring-4 ring-[#e01e5a]/20 p-3.5'
                          : 'border-2 border-dashed border-slate-300 hover:border-sky-400 p-3.5 bg-slate-50/40' 
                        : ''
                    }`}
                  >
                    {/* Column Header in Builder Mode */}
                    {isBuilderMode && (
                      <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-slate-200 text-xs select-none">
                        <span className="flex items-center gap-1.5 font-bold text-slate-600 text-[11px] uppercase tracking-wider">
                          <Layout className="w-3.5 h-3.5 text-sky-500" />
                          Column {colIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setColumnPickerTarget({
                              blockId: block.id,
                              colIndex: colIdx,
                              colName: `Column ${colIdx + 1}`
                            });
                          }}
                          className="bg-[#e01e5a]/10 hover:bg-[#e01e5a] text-[#e01e5a] hover:text-white px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                          title="Click to pick a widget to add to this column"
                        >
                          <Plus className="w-3 h-3" /> Add Widget
                        </button>
                      </div>
                    )}

                    {/* Column Drop Notice When Dragging Over */}
                    {isOverThisCol && isBuilderMode && (
                      <div className="absolute inset-0 bg-rose-50/90 backdrop-blur-2xs rounded-xl flex items-center justify-center pointer-events-none z-30 border-2 border-[#e01e5a]">
                        <div className="bg-[#e01e5a] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
                          <Plus className="w-4 h-4 stroke-[3]" /> Drop Widget into Column {colIdx + 1}
                        </div>
                      </div>
                    )}

                    {colBlocks.length === 0 && isBuilderMode ? (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setColumnPickerTarget({
                            blockId: block.id,
                            colIndex: colIdx,
                            colName: `Column ${colIdx + 1}`
                          });
                        }}
                        className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-[#e01e5a] rounded-lg bg-white/70 hover:bg-rose-50/30 transition-all cursor-pointer group text-center my-1"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#e01e5a] text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 group-hover:bg-[#c9154e] transition-all">
                          <Plus className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#e01e5a] transition">
                          Add Widget to Column {colIdx + 1}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Click '+' or drag any widget from left sidebar
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3 flex-1 flex flex-col">
                        {colBlocks.map((childBlock, childIdx) => renderSingleBlock(childBlock, childIdx, true))}
                        
                        {/* Append Widget at the bottom of column */}
                        {isBuilderMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setColumnPickerTarget({
                                blockId: block.id,
                                colIndex: colIdx,
                                colName: `Column ${colIdx + 1}`
                              });
                            }}
                            className="mt-2 w-full py-2 border border-dashed border-slate-300 hover:border-[#e01e5a] hover:bg-rose-50/50 rounded-lg text-slate-500 hover:text-[#e01e5a] text-xs font-bold flex items-center justify-center gap-1.5 transition select-none cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Another Widget to Column {colIdx + 1}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add block here button in builder mode */}
        {isBuilderMode && onAddBlockHere && !isNested && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/block:opacity-100 transition-opacity z-20">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAddBlockHere(index + 1); }}
              className="px-3 py-1 rounded-full bg-sky-600 text-white text-[11px] font-bold shadow-md hover:bg-sky-700 flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" /> Add Section Here
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full elementor-canvas-wrapper relative">
      {blocks.map((block, idx) => renderSingleBlock(block, idx))}

      {/* Gallery Lightbox Modal */}
      {lightboxImg && (
        <div 
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              className="absolute -top-12 right-0 text-white hover:text-accent-400 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              title="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={lightboxImg} 
              alt="Enlarged gallery view" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Quick Widget Picker Modal for Columns */}
      {columnPickerTarget && (
        <div 
          onClick={() => setColumnPickerTarget(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1f2937] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#e01e5a] flex items-center justify-center text-white font-bold shadow-md">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Add Widget into {columnPickerTarget.colName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Click any widget below to insert it directly into this column
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setColumnPickerTarget(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/40 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search widgets (heading, text, image, video, button, gallery, icon box)..."
                  className="w-full bg-slate-800/90 border border-slate-700 pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-[#e01e5a]"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(['all', 'basic', 'general', 'wordpress', 'custom'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPickerCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition shrink-0 cursor-pointer ${
                      pickerCategory === cat
                        ? 'bg-[#e01e5a] text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Widgets Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1">
              {WIDGET_CATALOG
                .filter(w => {
                  if (w.type === 'columns') return false; // Prevent root column inside column
                  const matchesSearch = !pickerSearch || 
                    w.label.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                    w.description.toLowerCase().includes(pickerSearch.toLowerCase());
                  const matchesCat = pickerCategory === 'all' || w.category === pickerCategory;
                  return matchesSearch && matchesCat;
                })
                .map((widget) => {
                  return (
                    <button
                      key={widget.type}
                      type="button"
                      onClick={() => {
                        if (onAddBlockToColumn) {
                          onAddBlockToColumn(columnPickerTarget.blockId, columnPickerTarget.colIndex, widget.type);
                        } else if (onDropBlockIntoColumn) {
                          onDropBlockIntoColumn(columnPickerTarget.blockId, columnPickerTarget.colIndex, widget.type);
                        }
                        setColumnPickerTarget(null);
                      }}
                      className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-[#e01e5a] transition-all text-left flex flex-col group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-700 group-hover:bg-[#e01e5a] text-slate-300 group-hover:text-white flex items-center justify-center transition shadow-2xs">
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                        <span className="font-bold text-xs text-white group-hover:text-[#e01e5a] transition line-clamp-1">
                          {widget.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {widget.description}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
