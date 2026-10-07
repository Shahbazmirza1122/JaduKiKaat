
export type ElementorWidgetType =
  | 'section_container'
  | 'columns'
  | 'inner_section'
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'star_rating'
  | 'divider'
  | 'google_maps'
  | 'icon'
  | 'image_box'
  | 'iconbox'
  | 'gallery'
  | 'carousel'
  | 'icon_list'
  | 'counter'
  | 'spacer'
  | 'testimonial'
  | 'tabs'
  | 'accordion'
  | 'toggle'
  | 'social_icons'
  | 'progress_bar'
  | 'soundcloud'
  | 'shortcode'
  | 'html'
  | 'menu_anchor'
  | 'sidebar'
  | 'alert'
  | 'hero'
  | 'cta'
  | 'stats'
  | 'form'
  | 'ayat'
  | 'islamic_services_bar'
  | 'happy_clients_showcase';

export interface ElementorBlock {
  id: string;
  type: ElementorWidgetType;
  title?: string;
  columnsCount?: number;
  columnLayout?: string;
  columnsData?: ElementorBlock[][];
  data: {
    text?: string;
    subtext?: string;
    headingTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p';
    htmlContent?: string;
    buttonText?: string;
    buttonLink?: string;
    buttonVariant?: 'primary' | 'secondary' | 'outline' | 'amber' | 'emerald';
    buttonSize?: 'sm' | 'md' | 'lg';
    openInNewTab?: boolean;
    imageUrl?: string;
    imageAlt?: string;
    imageCaption?: string;
    imageRadius?: string;
    videoUrl?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroBadge?: string;
    heroPrimaryBtnText?: string;
    heroPrimaryBtnLink?: string;
    heroSecondaryBtnText?: string;
    heroSecondaryBtnLink?: string;
    ctaTitle?: string;
    ctaDescription?: string;
    ctaBtnText?: string;
    ctaBtnLink?: string;
    accordionItems?: Array<{ id: string; title: string; content: string }>;
    testimonialQuote?: string;
    testimonialAuthor?: string;
    testimonialRole?: string;
    testimonialAvatar?: string;
    testimonialRating?: number;
    statsItems?: Array<{ id: string; number: string; label: string; icon?: string }>;
    arabicText?: string;
    translationText?: string;
    sourceRef?: string;
    iconName?: string;
    iconTitle?: string;
    iconDescription?: string;
    iconLink?: string;
    formTitle?: string;
    formSubtitle?: string;
    formButtonText?: string;
    formFields?: Array<{ name: string; label: string; type: string; placeholder: string; required: boolean }>;
    dividerStyle?: 'solid' | 'dashed' | 'dotted' | 'ornate';
    spacerHeight?: number;
    mapLocation?: string;
    mapZoom?: number;
    iconSymbol?: string;
    iconSize?: 'sm' | 'md' | 'lg' | 'xl';
    [key: string]: any;
  };
  styles: {
    align?: 'left' | 'center' | 'right' | 'justify';
    textColor?: string;
    bgColor?: string;
    bgGradient?: string;
    bgImageUrl?: string;
    bgOverlayOpacity?: number;
    fontFamily?: 'serif' | 'sans' | 'arabic' | 'mono';
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    paddingX?: 'none' | 'sm' | 'md' | 'lg';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    borderWidth?: 'none' | 'thin' | 'medium';
    borderColor?: string;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    animation?: 'none' | 'fade-in' | 'slide-up' | 'zoom-in' | 'pulse';
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    overlapBanner?: boolean;
    marginTop?: 'none' | '-sm' | '-md' | '-lg' | '-xl' | '-half' | string;
    [key: string]: any;
  };
}

export interface PageSection {
  id: string;
  title: string;
  pageTarget: string; // which page to show on, e.g. '/', '/services', or custom slug 'my-page'
  isPage?: boolean; // true if this is a standalone full custom page
  slug?: string;
  status?: 'published' | 'draft';
  created_at?: string;
  config: {
    sectionType?: 'hero' | 'cta' | 'text' | 'features';
    bgUrl?: string;
    bgColor?: string;
    overlayStyle?: string;
    textColor?: string;
    fontFamily?: string;
    animation?: string;
    padding?: string;
    content?: string;
    isElementor?: boolean;
    elements?: ElementorBlock[];
    [key: string]: any;
  };
}

export interface BlogPost {
  id: string;
  created_at?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  category: string;
  relatedIds?: string[]; // IDs of manually selected related articles
  isLatest?: boolean;
  status?: 'published' | 'draft';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: string;
}

export interface NavItem {
  label: string;
  to: string; // URL path or Hash
  isExternalRoute?: boolean; // True if it leads to a separate page like /blog
}

export interface Inquiry {
  id: string;
  date?: string; // Legacy string date
  created_at?: string; // DB timestamp
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
