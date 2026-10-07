import { ElementorBlock, ElementorWidgetType } from '../../types';

export const generateBlockId = () => 'blk_' + Math.random().toString(36).substr(2, 9);

export interface WidgetCatalogItem {
  type: ElementorWidgetType;
  label: string;
  category: 'basic' | 'layout' | 'general' | 'interactive' | 'spiritual';
  icon: string;
  description: string;
  defaultData: Partial<ElementorBlock['data']>;
  defaultStyles: Partial<ElementorBlock['styles']>;
}

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  // ==========================================
  // BASIC ELEMENTS (Exact Match to Elementor)
  // ==========================================
  {
    type: 'inner_section',
    label: 'Inner Section',
    category: 'basic',
    icon: 'Columns2',
    description: 'Nested 2-column inner section for intricate layouts',
    defaultData: {},
    defaultStyles: { paddingY: 'sm' }
  },
  {
    type: 'heading',
    label: 'Heading',
    category: 'basic',
    icon: 'Heading',
    description: 'Add prominent eye-catching headings and subheadings',
    defaultData: {
      text: 'Sacred Rohani Ilaj & Istikhara Guidance',
      subtext: 'BLESSED QURANIC HEALING',
      headingTag: 'h2'
    },
    defaultStyles: {
      align: 'center',
      fontFamily: 'serif',
      fontSize: '3xl',
      textColor: '#0f172a',
      paddingY: 'sm'
    }
  },
  {
    type: 'image',
    label: 'Image',
    category: 'basic',
    icon: 'ImageIcon',
    description: 'High quality responsive image with link & caption',
    defaultData: {
      imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Sacred Architecture',
      imageCaption: '',
      imageRadius: 'rounded-xl',
      imageSize: 'auto'
    },
    defaultStyles: {
      align: 'center',
      paddingY: 'md',
      shadow: 'md',
      borderRadius: 'lg'
    }
  },
  {
    type: 'text',
    label: 'Text Editor',
    category: 'basic',
    icon: 'FileText',
    description: 'Rich paragraph and formatted WYSIWYG text block',
    defaultData: {
      htmlContent: '<p>Every trial in life holds a hidden opportunity for spiritual elevation. Through authentic Quranic supplications, istikhara, and traditional Islamic healing methods, our mission is to illuminate your pathway toward shifa and inner tranquility.</p>'
    },
    defaultStyles: {
      align: 'left',
      fontSize: 'base',
      textColor: '#475569',
      paddingY: 'sm'
    }
  },
  {
    type: 'video',
    label: 'Video',
    category: 'basic',
    icon: 'Video',
    description: 'Embed YouTube, Vimeo, or MP4 video stream',
    defaultData: {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    defaultStyles: {
      align: 'center',
      paddingY: 'md',
      borderRadius: 'xl',
      shadow: 'md'
    }
  },
  {
    type: 'button',
    label: 'Button',
    category: 'basic',
    icon: 'MousePointerClick',
    description: 'Interactive button with custom styles and actions',
    defaultData: {
      buttonText: 'Book Free Consultation',
      buttonLink: '#contact',
      buttonVariant: 'primary',
      buttonSize: 'md',
      openInNewTab: false
    },
    defaultStyles: {
      align: 'center',
      paddingY: 'sm',
      borderRadius: 'full'
    }
  },
  {
    type: 'star_rating',
    label: 'Star Rating',
    category: 'basic',
    icon: 'Star',
    description: 'Display 5-star customer ratings and review scores',
    defaultData: {
      ratingValue: 5,
      ratingScale: 5,
      ratingTitle: 'Client Trust & Satisfaction',
      ratingCount: '4.9/5 (1,240+ Verified Reviews)'
    },
    defaultStyles: {
      align: 'center',
      paddingY: 'sm',
      textColor: '#f59e0b'
    }
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'basic',
    icon: 'Minus',
    description: 'Separating line, dotted rule, or Islamic ornate flourish',
    defaultData: {
      dividerStyle: 'ornate',
      dividerWidth: '80'
    },
    defaultStyles: {
      paddingY: 'md',
      align: 'center'
    }
  },
  {
    type: 'google_maps',
    label: 'Google Maps',
    category: 'basic',
    icon: 'MapPin',
    description: 'Interactive embed of your office or sanctuary address',
    defaultData: {
      mapLocation: 'Lahore, Pakistan',
      mapZoom: 14,
      mapHeight: 320
    },
    defaultStyles: {
      paddingY: 'md',
      borderRadius: 'xl',
      shadow: 'sm'
    }
  },
  {
    type: 'icon',
    label: 'Icon',
    category: 'basic',
    icon: 'Sparkles',
    description: 'Vector icon with customizable color, shape, and link',
    defaultData: {
      iconSymbol: 'Sparkles',
      iconSize: 'lg',
      iconShape: 'circle',
      iconLink: ''
    },
    defaultStyles: {
      align: 'center',
      paddingY: 'sm',
      textColor: '#e01e5a',
      bgColor: '#fff1f5'
    }
  },
  {
    type: 'image_box',
    label: 'Image Box',
    category: 'basic',
    icon: 'Layout',
    description: 'Image accompanied by title, description, and link',
    defaultData: {
      imageBoxUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80',
      imageBoxTitle: 'Holy Madina Sanctuary',
      imageBoxDescription: 'Experience spiritual peace and sacred guidance rooted in authentic prophetic tradition.',
      imageBoxLink: '#services',
      imageBoxPosition: 'top'
    },
    defaultStyles: {
      align: 'center',
      bgColor: '#ffffff',
      borderColor: '#f1f5f9',
      borderWidth: 'thin',
      borderRadius: 'xl',
      paddingY: 'md',
      paddingX: 'md',
      shadow: 'sm'
    }
  },
  {
    type: 'iconbox',
    label: 'Icon Box',
    category: 'basic',
    icon: 'Award',
    description: 'Icon with title, descriptive text, and link',
    defaultData: {
      iconName: 'Moon',
      iconTitle: 'Spiritual Istikhara',
      iconDescription: 'Authentic guidance grounded in the Sunnah to help you make life decisions with certainty and divine peace.',
      iconLink: '#services',
      iconPosition: 'top'
    },
    defaultStyles: {
      align: 'center',
      bgColor: '#ffffff',
      borderColor: '#f1f5f9',
      borderWidth: 'thin',
      borderRadius: 'xl',
      paddingY: 'md',
      paddingX: 'md',
      shadow: 'sm'
    }
  },
  {
    type: 'gallery',
    label: 'Basic Gallery',
    category: 'basic',
    icon: 'Grid',
    description: 'Multi-column image gallery with light preview',
    defaultData: {
      galleryColumns: 3,
      galleryImages: [
        { id: '1', url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&q=80', title: 'Sacred Mosque' },
        { id: '2', url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80', title: 'Makkah Al-Mukarramah' },
        { id: '3', url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80', title: 'Madina Al-Munawwarah' },
        { id: '4', url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80', title: 'Holy Quran Kareem' },
        { id: '5', url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=600&q=80', title: 'Spiritual Lantern' },
        { id: '6', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80', title: 'Islamic Community' }
      ]
    },
    defaultStyles: {
      paddingY: 'md',
      borderRadius: 'xl'
    }
  },
  {
    type: 'carousel',
    label: 'Image Carousel',
    category: 'basic',
    icon: 'GalleryHorizontal',
    description: 'Interactive sliding carousel with navigation arrows & dots',
    defaultData: {
      carouselAutoplay: true,
      carouselSlides: [
        {
          id: '1',
          imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80',
          title: 'Spiritual Consultation',
          caption: 'Find relief and peace through genuine Quranic Istikhara.'
        },
        {
          id: '2',
          imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80',
          title: 'Sacred Rohani Healing',
          caption: 'Authentic remedies grounded in the Sunnah and Hadith.'
        },
        {
          id: '3',
          imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
          title: 'Divine Protection & Dua',
          caption: 'Prescribed daily prayers for marriage, peace, and prosperity.'
        }
      ]
    },
    defaultStyles: {
      paddingY: 'md',
      borderRadius: '2xl',
      shadow: 'lg'
    }
  },
  {
    type: 'icon_list',
    label: 'Icon List',
    category: 'basic',
    icon: 'ListChecks',
    description: 'Bullet list with custom icon symbols and links',
    defaultData: {
      iconListLayout: 'vertical',
      iconListItems: [
        { id: '1', text: '100% Halal Quranic Istikhara according to Sunnah', icon: 'CheckCircle2' },
        { id: '2', text: 'Confidential 1-on-1 Spiritual Guidance Session', icon: 'CheckCircle2' },
        { id: '3', text: 'Protection against Evil Eye (Nazar) & Black Magic (Sihr)', icon: 'CheckCircle2' },
        { id: '4', text: 'Daily Morning & Evening Masnoon Duas provided', icon: 'CheckCircle2' }
      ]
    },
    defaultStyles: {
      align: 'left',
      paddingY: 'sm',
      textColor: '#334155'
    }
  },
  {
    type: 'counter',
    label: 'Counter',
    category: 'basic',
    icon: 'Hash',
    description: 'Milestone numbers with prefix, suffix, and title',
    defaultData: {
      counterNumber: '15,000',
      counterPrefix: '',
      counterSuffix: '+',
      counterTitle: 'Spiritual Consultations Completed'
    },
    defaultStyles: {
      align: 'center',
      paddingY: 'sm',
      textColor: '#0f172a'
    }
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'basic',
    icon: 'MoveVertical',
    description: 'Add adjustable whitespace between blocks',
    defaultData: {
      spacerHeight: 48
    },
    defaultStyles: {}
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    category: 'basic',
    icon: 'Quote',
    description: 'Customer review quote with avatar, author, and stars',
    defaultData: {
      testimonialQuote: 'SubhanAllah, the clarity and tranquility I received after our Istikhara consultation was profound. All the heavy burdens I felt for months were dissolved.',
      testimonialAuthor: 'Haji Muhammad Rizwan',
      testimonialRole: 'Verified Client • Lahore',
      testimonialAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      testimonialRating: 5
    },
    defaultStyles: {
      bgColor: '#ffffff',
      borderRadius: 'xl',
      borderColor: '#e2e8f0',
      borderWidth: 'thin',
      paddingY: 'md',
      paddingX: 'md',
      shadow: 'md'
    }
  },
  {
    type: 'tabs',
    label: 'Tabs',
    category: 'basic',
    icon: 'Folder',
    description: 'Interactive tabbed content panels for multi-topic views',
    defaultData: {
      tabActiveIndex: 0,
      tabItems: [
        {
          id: '1',
          title: 'Rohani Istikhara',
          content: 'Sunnah-compliant spiritual Istikhara to gain divine clarity in marriage proposals, career directions, and major life crossroads.'
        },
        {
          id: '2',
          title: 'Spiritual Shifa',
          content: 'Authentic Quranic healing supplications and Ruqyah ash-Shar\'iyyah for chronic spiritual disturbances, fear, and anxieties.'
        },
        {
          id: '3',
          title: 'Evil Eye & Nazar',
          content: 'Potent prophetic remedies and protective shields to safeguard your family and business from jealousy and harmful gazes.'
        }
      ]
    },
    defaultStyles: {
      paddingY: 'md',
      borderRadius: 'xl'
    }
  },
  {
    type: 'accordion',
    label: 'Accordion',
    category: 'basic',
    icon: 'Layers',
    description: 'Expandable FAQ questions (one open at a time)',
    defaultData: {
      accordionItems: [
        {
          id: '1',
          title: 'What is the procedure for Rohani Istikhara?',
          content: 'Our scholars perform Sunnah-compliant Istikhara with specific Quranic supplications, discerning divine guidance regarding marriages, business, and major decisions.'
        },
        {
          id: '2',
          title: 'Are all your spiritual remedies 100% halal and Quranic?',
          content: 'Yes, absolutely. We strictly adhere to the Quran and authentic Sunnah. No un-Islamic rituals, amulets, or unlawful methods are ever practiced.'
        },
        {
          id: '3',
          title: 'How quickly can I expect results and relief?',
          content: 'By the will of Allah (InshaAllah), many individuals experience immediate spiritual solace within days of beginning the prescribed daily wird and ruqyah.'
        }
      ]
    },
    defaultStyles: {
      paddingY: 'md',
      bgColor: '#ffffff',
      borderRadius: 'xl',
      shadow: 'sm'
    }
  },
  {
    type: 'toggle',
    label: 'Toggle',
    category: 'basic',
    icon: 'ListFilter',
    description: 'Collapsible items where multiple sections can stay open',
    defaultData: {
      toggleItems: [
        {
          id: '1',
          title: 'Online Video & Voice Consultations',
          content: 'Connect directly with our senior spiritual counselor from anywhere in the world via confidential WhatsApp or Google Meet.'
        },
        {
          id: '2',
          title: 'Prescribed Quranic Wazifas',
          content: 'Receive a personalized schedule of sacred Quranic verses and remembrance tailored to your spiritual situation.'
        },
        {
          id: '3',
          title: 'Follow-up Check-ins',
          content: 'We remain available for subsequent spiritual progress check-ins until peace and stability are fully established.'
        }
      ]
    },
    defaultStyles: {
      paddingY: 'md',
      borderRadius: 'xl'
    }
  },
  {
    type: 'social_icons',
    label: 'Social Icons',
    category: 'basic',
    icon: 'Share2',
    description: 'Social media profile links with official brand colors',
    defaultData: {
      socialShape: 'circle',
      socialLinks: [
        { id: '1', platform: 'whatsapp', url: 'https://wa.me/923000000000', label: 'WhatsApp' },
        { id: '2', platform: 'youtube', url: 'https://youtube.com', label: 'YouTube' },
        { id: '3', platform: 'facebook', url: 'https://facebook.com', label: 'Facebook' },
        { id: '4', platform: 'instagram', url: 'https://instagram.com', label: 'Instagram' }
      ]
    },
    defaultStyles: {
      align: 'center',
      paddingY: 'sm'
    }
  },
  {
    type: 'progress_bar',
    label: 'Progress Bar',
    category: 'basic',
    icon: 'Activity',
    description: 'Visual progress percentage bar with custom label',
    defaultData: {
      progressTitle: 'Consultation Satisfaction Rate',
      progressPercentage: 98,
      progressInnerColor: '#39b54a',
      progressShowPercentage: true
    },
    defaultStyles: {
      paddingY: 'sm'
    }
  },
  {
    type: 'soundcloud',
    label: 'Sound Cloud',
    category: 'basic',
    icon: 'Headphones',
    description: 'SoundCloud audio player or sacred Quran recitation stream',
    defaultData: {
      soundcloudUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23ff5500&auto_play=false',
      soundcloudTitle: 'Surah Ar-Rahman (Heart Tranquility Recitation)',
      audioReciter: 'Qari Abdul Basit'
    },
    defaultStyles: {
      paddingY: 'md',
      borderRadius: 'xl',
      shadow: 'sm'
    }
  },
  {
    type: 'shortcode',
    label: 'Shortcode',
    category: 'basic',
    icon: 'Code',
    description: 'Embed WordPress-style shortcodes with live execution',
    defaultData: {
      shortcodeString: '[rohani_prayer_times location="Lahore"]'
    },
    defaultStyles: {
      paddingY: 'sm',
      align: 'center'
    }
  },
  {
    type: 'html',
    label: 'HTML',
    category: 'basic',
    icon: 'Code2',
    description: 'Custom raw HTML, iframe, script, or embed markup',
    defaultData: {
      customHtml: '<div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center font-serif text-sm">\n  ✨ <strong>Special Rohani Wazifa</strong>: Recite <em>Hasbunallahu wa ni\'mal wakeel</em> 313 times daily after Maghrib.\n</div>'
    },
    defaultStyles: {
      paddingY: 'sm'
    }
  },
  {
    type: 'menu_anchor',
    label: 'Menu Anchor',
    category: 'basic',
    icon: 'Anchor',
    description: 'Smooth scroll target anchor for one-page menu navigation',
    defaultData: {
      anchorName: 'spiritual-services'
    },
    defaultStyles: {
      paddingY: 'none'
    }
  },
  {
    type: 'sidebar',
    label: 'Sidebar',
    category: 'basic',
    icon: 'PanelLeftClose',
    description: 'Widgetized sidebar with search, categories & quick contact',
    defaultData: {
      sidebarTitle: 'Rohani Quick Portal'
    },
    defaultStyles: {
      paddingY: 'md'
    }
  },
  {
    type: 'alert',
    label: 'Alert',
    category: 'basic',
    icon: 'AlertCircle',
    description: 'Dismissible notification banner (info, success, warning, danger)',
    defaultData: {
      alertType: 'info',
      alertTitle: 'Important Spiritual Notice',
      alertDescription: 'All our Istikhara consultations are conducted strictly by authenticated scholars using Quranic methodology.',
      alertDismissible: true
    },
    defaultStyles: {
      paddingY: 'sm'
    }
  },

  // ==========================================
  // STRUCTURE & LAYOUT PRESETS
  // ==========================================
  {
    type: 'columns',
    label: '2 Columns (50/50)',
    category: 'layout',
    icon: 'Columns2',
    description: 'Two equal split responsive columns',
    defaultData: {},
    defaultStyles: { paddingY: 'md' }
  },
  {
    type: 'columns',
    label: '3 Columns (33/33/33)',
    category: 'layout',
    icon: 'Columns3',
    description: 'Three equal responsive columns',
    defaultData: {},
    defaultStyles: { paddingY: 'md' }
  },
  {
    type: 'columns',
    label: 'Split (66/33)',
    category: 'layout',
    icon: 'Split',
    description: 'Wide main column with sidebar',
    defaultData: {},
    defaultStyles: { paddingY: 'md' }
  },

  // ==========================================
  // SPIRITUAL & INTERACTIVE PRESETS
  // ==========================================
  {
    type: 'happy_clients_showcase',
    label: 'Our Happy Clients Showcase',
    category: 'spiritual',
    icon: 'Users',
    description: '4 Client avatars cards with ratings & 3 rounded stat pillars with sanctuary emerald color theme',
    defaultData: {
      title: 'Our Happy Clients',
      subtitle: 'Alhamdulillah, brothers and sisters around the world have found clarity, spiritual solace, and genuine protection.',
    },
    defaultStyles: {
      bgColor: '#f0fdf9',
      borderRadius: '2xl',
      shadow: 'xl',
      paddingY: 'lg'
    }
  },
  {
    type: 'islamic_services_bar',
    label: 'Banner Overlap Services Bar',
    category: 'spiritual',
    icon: 'Sparkles',
    description: 'Floating quick-action bar with 50% banner overlap (Read Quran, Learn to Pray, Islamic Story, Q & A)',
    defaultData: {
      item1Text: 'Read Quran',
      item2Text: 'Learn to Pray',
      item3Text: 'Islamic Story',
      item4Text: 'Q & A With Syekh',
    },
    defaultStyles: {
      overlapBanner: true,
      marginTop: '-half',
      bgColor: '#073630',
      borderRadius: 'xl',
      shadow: 'xl'
    }
  },
  {
    type: 'ayat',
    label: 'Sacred Ayat / Quote Box',
    category: 'spiritual',
    icon: 'BookOpen',
    description: 'Arabic calligraphy quote with translation',
    defaultData: {
      arabicText: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      translationText: '"Unquestionably, by the remembrance of Allah hearts are assured."',
      sourceRef: 'Surah Ar-Ra\'d (13:28)'
    },
    defaultStyles: {
      align: 'center',
      bgColor: '#f8fafc',
      borderColor: '#e2e8f0',
      borderWidth: 'thin',
      borderRadius: 'xl',
      paddingY: 'lg',
      paddingX: 'lg',
      shadow: 'sm'
    }
  },
  {
    type: 'stats',
    label: 'Stats & Counters',
    category: 'general',
    icon: 'BarChart2',
    description: 'Display milestones and impact numbers',
    defaultData: {
      statsItems: [
        { id: '1', number: '12+', label: 'Years of Rohani Khidmat', icon: 'Clock' },
        { id: '2', number: '15,000+', label: 'Consultations Completed', icon: 'Users' },
        { id: '3', number: '100%', label: 'Confidential & Quranic', icon: 'ShieldCheck' },
        { id: '4', number: '40+', label: 'Countries Reached', icon: 'Globe' }
      ]
    },
    defaultStyles: {
      paddingY: 'lg',
      bgColor: '#0f172a',
      textColor: '#ffffff',
      borderRadius: '2xl'
    }
  },
  {
    type: 'hero',
    label: 'Hero Header Banner',
    category: 'interactive',
    icon: 'Maximize2',
    description: 'Full width hero banner with action buttons',
    defaultData: {
      heroBadge: '✨ TRUSTED SPIRITUAL SANCTUARY',
      heroTitle: 'Sacred Rohani Ilaj & Islamic Guidance',
      heroSubtitle: 'Find divine remedies for spiritual ailments, evil eye, black magic (Sihr), and relationship harmony through the pure light of the Quran.',
      heroPrimaryBtnText: 'Get Consultation',
      heroPrimaryBtnLink: '#contact',
      heroSecondaryBtnText: 'Explore Remedies',
      heroSecondaryBtnLink: '/services'
    },
    defaultStyles: {
      align: 'center',
      bgColor: '#0b1329',
      textColor: '#ffffff',
      bgOverlayOpacity: 0.6,
      bgImageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1600&q=80',
      paddingY: 'xl'
    }
  },
  {
    type: 'cta',
    label: 'Call To Action Box',
    category: 'interactive',
    icon: 'Megaphone',
    description: 'High-converting urgent spiritual CTA banner',
    defaultData: {
      ctaTitle: 'Facing Spiritual Hardship or Distress?',
      ctaDescription: 'Do not despair of Allah\'s mercy. Reach out to our experienced scholars directly for personalized istikhara and spiritual diagnosis.',
      ctaBtnText: 'Contact Us on WhatsApp',
      ctaBtnLink: 'https://wa.me/923000000000'
    },
    defaultStyles: {
      align: 'center',
      bgColor: '#1e293b',
      textColor: '#ffffff',
      borderRadius: '2xl',
      paddingY: 'lg',
      paddingX: 'lg',
      shadow: 'xl'
    }
  },
  {
    type: 'form',
    label: 'Spiritual Inquiry Form',
    category: 'interactive',
    icon: 'CheckSquare',
    description: 'Lead capture form for consultations and prayer requests',
    defaultData: {
      formTitle: 'Request Confidential Consultation',
      formSubtitle: 'Submit your details below. Our spiritual counselor will contact you privately within 24 hours.',
      formButtonText: 'Submit Inquiry',
      formFields: [
        { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Your Name', required: true },
        { name: 'phone', label: 'WhatsApp / Phone Number', type: 'tel', placeholder: '+92 300 1234567', required: true },
        { name: 'concern', label: 'Spiritual Concern / Purpose', type: 'select', placeholder: 'Select topic', required: true },
        { name: 'message', label: 'Brief Description of Situation', type: 'textarea', placeholder: 'Describe what you are experiencing...', required: false }
      ]
    },
    defaultStyles: {
      bgColor: '#ffffff',
      borderRadius: '2xl',
      borderColor: '#e2e8f0',
      borderWidth: 'thin',
      paddingY: 'lg',
      paddingX: 'lg',
      shadow: 'lg'
    }
  }
];

export function createBlockFromWidget(widget: WidgetCatalogItem, customTitle?: string): ElementorBlock {
  const id = generateBlockId();

  if (widget.type === 'columns' || widget.type === 'inner_section') {
    let colsCount = 2;
    let layout = '50-50';
    if (widget.label.includes('3 Columns')) {
      colsCount = 3;
      layout = '33-33-33';
    } else if (widget.label.includes('66/33')) {
      colsCount = 2;
      layout = '66-33';
    }

    const columnsData: ElementorBlock[][] = [];
    for (let i = 0; i < colsCount; i++) {
      columnsData.push([]);
    }

    return {
      id,
      type: widget.type,
      title: customTitle || widget.label,
      columnsCount: colsCount,
      columnLayout: layout,
      columnsData,
      data: { ...widget.defaultData },
      styles: {
        paddingY: widget.type === 'inner_section' ? 'sm' : 'md',
        maxWidth: 'xl',
        ...widget.defaultStyles
      }
    };
  }

  return {
    id,
    type: widget.type,
    title: customTitle || widget.label,
    data: { ...widget.defaultData },
    styles: { ...widget.defaultStyles }
  };
}

// Pre-built Elementor Full Section Templates
export interface ElementorTemplatePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  blocks: ElementorBlock[];
}

export const ELEMENTOR_PRESET_TEMPLATES: ElementorTemplatePreset[] = [
  {
    id: 'hero-spiritual',
    name: 'Sacred Sanctuary Hero',
    category: 'Hero',
    description: 'Majestic dark-sky Islamic sanctuary banner with illuminated typography and dual action buttons.',
    thumbnail: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=400&q=80',
    blocks: [
      {
        id: generateBlockId(),
        type: 'hero',
        title: 'Sacred Hero Banner',
        data: {
          heroBadge: '✦ BISMILLAH AR-RAHMAN AR-RAHEEM ✦',
          heroTitle: 'Light & Healing for Troubled Souls',
          heroSubtitle: 'Rooted in authentic Quranic wisdom, our verified scholars provide spiritual diagnostics, istikhara guidance, and protective rohani remedies.',
          heroPrimaryBtnText: 'Request Healing Consultation',
          heroPrimaryBtnLink: '#contact',
          heroSecondaryBtnText: 'View Our Services',
          heroSecondaryBtnLink: '/services'
        },
        styles: {
          align: 'center',
          bgColor: '#0b1329',
          textColor: '#ffffff',
          bgOverlayOpacity: 0.65,
          bgImageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1600&q=80',
          paddingY: 'xl'
        }
      }
    ]
  },
  {
    id: 'features-three-pillars',
    name: '3 Sacred Pillars of Guidance',
    category: 'Features',
    description: 'Elegant 3-column layout highlighting Spiritual Diagnosis, Istikhara, and Continuous Duaa.',
    thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=400&q=80',
    blocks: [
      {
        id: generateBlockId(),
        type: 'heading',
        data: {
          subtext: 'SACRED METHODOLOGY',
          text: 'How We Walk With You Towards Shifa',
          headingTag: 'h2'
        },
        styles: {
          align: 'center',
          fontFamily: 'serif',
          fontSize: '3xl',
          textColor: '#0f172a',
          paddingY: 'sm'
        }
      },
      {
        id: generateBlockId(),
        type: 'columns',
        columnsCount: 3,
        columnLayout: '33-33-33',
        columnsData: [
          [
            {
              id: generateBlockId(),
              type: 'iconbox',
              data: {
                iconName: 'Search',
                iconTitle: '1. Spiritual Diagnosis',
                iconDescription: 'Identifying the spiritual root cause of distress, Nazar (evil eye), or Sihr through Sunnah methods.',
                iconLink: '#services'
              },
              styles: {
                align: 'center',
                bgColor: '#f8fafc',
                borderRadius: 'xl',
                paddingY: 'md',
                paddingX: 'md',
                shadow: 'sm'
              }
            }
          ],
          [
            {
              id: generateBlockId(),
              type: 'iconbox',
              data: {
                iconName: 'Compass',
                iconTitle: '2. Sacred Istikhara',
                iconDescription: 'Seeking divine affirmation and clarity before entering marriage, new partnerships, or major life shifts.',
                iconLink: '#services'
              },
              styles: {
                align: 'center',
                bgColor: '#f8fafc',
                borderRadius: 'xl',
                paddingY: 'md',
                paddingX: 'md',
                shadow: 'sm'
              }
            }
          ],
          [
            {
              id: generateBlockId(),
              type: 'iconbox',
              data: {
                iconName: 'Shield',
                iconTitle: '3. Protective Ruqyah',
                iconDescription: 'Custom daily wird, verified azkaar, and authentic protective Quranic recitations tailored for your heart.',
                iconLink: '#services'
              },
              styles: {
                align: 'center',
                bgColor: '#f8fafc',
                borderRadius: 'xl',
                paddingY: 'md',
                paddingX: 'md',
                shadow: 'sm'
              }
            }
          ]
        ],
        data: {},
        styles: { paddingY: 'md' }
      }
    ]
  },
  {
    id: 'ayat-callout',
    name: 'Quranic Ayat & Reflection',
    category: 'Content',
    description: 'A deeply serene spiritual callout box featuring Arabic calligraphy and English translation.',
    thumbnail: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=400&q=80',
    blocks: [
      {
        id: generateBlockId(),
        type: 'ayat',
        data: {
          arabicText: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
          translationText: '"And when I am ill, it is He who cures me."',
          sourceRef: 'Surah Ash-Shu\'ara (26:80)'
        },
        styles: {
          align: 'center',
          bgColor: '#0f172a',
          textColor: '#f8fafc',
          borderRadius: '2xl',
          paddingY: 'lg',
          paddingX: 'lg',
          shadow: 'lg'
        }
      }
    ]
  },
  {
    id: 'faq-section',
    name: 'Comprehensive FAQ Accordion',
    category: 'Interactive',
    description: 'Header plus expandable questions regarding consultation privacy, procedure, and authenticity.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80',
    blocks: [
      {
        id: generateBlockId(),
        type: 'heading',
        data: {
          subtext: 'COMMON QUESTIONS',
          text: 'Frequently Asked Questions',
          headingTag: 'h2'
        },
        styles: {
          align: 'center',
          fontFamily: 'serif',
          fontSize: '3xl',
          textColor: '#0f172a',
          paddingY: 'sm'
        }
      },
      {
        id: generateBlockId(),
        type: 'accordion',
        data: {
          accordionItems: [
            {
              id: '1',
              title: 'How confidential is my consultation?',
              content: 'Your privacy is an absolute sacred trust (Amanah). All conversations, names, and details are strictly confidential between you and the scholar.'
            },
            {
              id: '2',
              title: 'Can overseas clients request guidance?',
              content: 'Yes! We serve clients across the UK, USA, Canada, UAE, Saudi Arabia, Europe, and Pakistan via private WhatsApp and voice consultations.'
            },
            {
              id: '3',
              title: 'How do I know if I need Rohani Ilaj or medical care?',
              content: 'We always advise seeking standard medical treatment alongside spiritual prayer. True Islamic healing works in perfect harmony with medical science.'
            }
          ]
        },
        styles: {
          paddingY: 'md',
          bgColor: '#ffffff',
          borderRadius: 'xl',
          shadow: 'sm'
        }
      }
    ]
  },
  {
    id: 'stats-impact',
    name: 'Impact & Trust Counter',
    category: 'Stats',
    description: 'High-contrast trust metrics highlighting years of service, consultations, and global reach.',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    blocks: [
      {
        id: generateBlockId(),
        type: 'stats',
        data: {
          statsItems: [
            { id: '1', number: '12+', label: 'Years Of Khidmat', icon: 'Clock' },
            { id: '2', number: '18,500+', label: 'Duaas & Istikhara Done', icon: 'Heart' },
            { id: '3', number: '100%', label: 'Strict Sunnah Compliance', icon: 'ShieldCheck' },
            { id: '4', number: '50+', label: 'Global Communities', icon: 'Globe' }
          ]
        },
        styles: {
          bgColor: '#0f172a',
          textColor: '#ffffff',
          borderRadius: '2xl',
          paddingY: 'lg',
          shadow: 'xl'
        }
      }
    ]
  }
];
