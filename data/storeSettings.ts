export interface StoreCategory {
  id: string;
  name: string;
  image: string;
  subtitle: string;
  isPopular: boolean;
}

export interface StoreSection {
  id: string;
  heading: string;
  subheading?: string;
  badge?: string;
  enabled: boolean;
  order: number;
  layout: {
    columns: 2 | 3 | 4; // grid columns
    maxProducts: number; // number of products: 2, 3, 4, 6, 8, 12, or 24
    showRating?: boolean;
    showDescription?: boolean;
  };
  productSource: {
    type: 'all' | 'specific_categories' | 'specific_products' | 'on_sale' | 'assigned_area';
    selectedCategories?: string[];
    selectedProductIds?: string[];
    assignedArea?: string; // 'catalog' | 'featured' | 'best_sellers' | 'flash_deal' | 'hero'
  };
  showViewAll?: boolean;
  viewAllCategory?: string;
}

export type ProductPageCountdownPosition =
  | 'top_banner'           // 1. Top of Page (Above Breadcrumbs)
  | 'above_title'          // 2. Above Title & Category Badges
  | 'below_price'          // 3. Below Price & Star Rating
  | 'above_cta'            // 4. Above Add to Cart & Buy Now (High Urgency)
  | 'below_cta'            // 5. Below Action Buttons & Trust Icons
  | 'below_description'    // 6. Below Description & Product Checklist
  | 'bottom_page';         // 7. Bottom of Product Page (After Related Collection)

export interface ProductCountdownPositionOption {
  id: ProductPageCountdownPosition;
  label: string;
  shortLabel: string;
  description: string;
  stepNumber: number;
}

export const PRODUCT_COUNTDOWN_POSITIONS: ProductCountdownPositionOption[] = [
  {
    id: 'top_banner',
    label: '1. Top of Page (Above Breadcrumbs)',
    shortLabel: 'Top Banner',
    description: 'Full-width urgent header alert at the very top of the product screen',
    stepNumber: 1,
  },
  {
    id: 'above_title',
    label: '2. Above Title & Category Badges',
    shortLabel: 'Above Title',
    description: 'Compact countdown ribbon immediately preceding the product title',
    stepNumber: 2,
  },
  {
    id: 'below_price',
    label: '3. Below Price & Star Rating',
    shortLabel: 'Below Price',
    description: 'Prominent deal card highlighting discounted pricing & live clock',
    stepNumber: 3,
  },
  {
    id: 'above_cta',
    label: '4. Above Add to Cart & Buy Now (High Urgency)',
    shortLabel: 'Above CTA Buttons',
    description: 'Directly above checkout buttons to maximize conversion before purchase',
    stepNumber: 4,
  },
  {
    id: 'below_cta',
    label: '5. Below Action Buttons & Trust Icons',
    shortLabel: 'Below Action Buttons',
    description: 'Reassuring countdown banner right underneath the checkout buttons',
    stepNumber: 5,
  },
  {
    id: 'below_description',
    label: '6. Below Description & Product Checklist',
    shortLabel: 'Below Description',
    description: 'Positioned after product write-up before the category collection',
    stepNumber: 6,
  },
  {
    id: 'bottom_page',
    label: '7. Bottom of Product Page (After Related Collection)',
    shortLabel: 'Bottom of Page',
    description: 'Full-width closing deal section at the footer of the product view',
    stepNumber: 7,
  },
];

export interface ProductCountdown {
  id: string;
  productId: string; // Specific product ID (e.g. '1', '2') or 'all' for all products
  enabled: boolean;
  title: string;
  tag: string;
  discountPrice?: string;
  originalPrice?: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  theme?: 'amber' | 'emerald' | 'ruby' | 'obsidian' | 'gold';
  showOnProductPage: boolean;
  productPagePosition: ProductPageCountdownPosition;
  showOnStorePage: boolean;
  urgencyText?: string;
  createdAt?: string;
}

export const getNextPositionUp = (current: ProductPageCountdownPosition): ProductPageCountdownPosition => {
  const currentIndex = PRODUCT_COUNTDOWN_POSITIONS.findIndex((p) => p.id === current);
  if (currentIndex <= 0) return PRODUCT_COUNTDOWN_POSITIONS[0].id;
  return PRODUCT_COUNTDOWN_POSITIONS[currentIndex - 1].id;
};

export const getNextPositionDown = (current: ProductPageCountdownPosition): ProductPageCountdownPosition => {
  const currentIndex = PRODUCT_COUNTDOWN_POSITIONS.findIndex((p) => p.id === current);
  if (currentIndex === -1 || currentIndex >= PRODUCT_COUNTDOWN_POSITIONS.length - 1) {
    return PRODUCT_COUNTDOWN_POSITIONS[PRODUCT_COUNTDOWN_POSITIONS.length - 1].id;
  }
  return PRODUCT_COUNTDOWN_POSITIONS[currentIndex + 1].id;
};

export interface StoreSettings {
  categories: StoreCategory[];
  sections: StoreSection[];
  productCountdowns?: ProductCountdown[];
  announcement: {
    enabled: boolean;
    text: string;
  };
  hero: {
    badge: string;
    title: string;
    highlightWord: string;
    subtitle: string;
    image: string;
    discountTagText: string;
    discountPercent: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  trustPillars: [
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string }
  ];
  flashDeal: {
    enabled: boolean;
    productId: string;
    customTitle: string;
    customPrice: string;
    customOriginalPrice: string;
    tag: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  promoBanners: {
    banner1: {
      tag: string;
      title: string;
      desc: string;
      btnText: string;
      category: string;
      image: string;
    };
    banner2: {
      tag: string;
      title: string;
      desc: string;
      btnText: string;
      category: string;
      image: string;
    };
  };
  testimonial: {
    name: string;
    role: string;
    avatar: string;
    quote: string;
  };
  newsletter: {
    title: string;
    desc: string;
  };
}

export const defaultCategories: StoreCategory[] = [
  {
    id: 'gemstones',
    name: 'Gemstones',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    subtitle: '8+ Blessed Items',
    isPopular: true,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    subtitle: '15+ Dhikr Beads',
    isPopular: true,
  },
  {
    id: 'fragrance',
    name: 'Fragrance',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    subtitle: '12+ Pure Scents',
    isPopular: true,
  },
  {
    id: 'essentials',
    name: 'Essentials',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
    subtitle: '10+ Zamzam & Oils',
    isPopular: true,
  },
  {
    id: 'art',
    name: 'Art',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
    subtitle: 'Quranic Calligraphy',
    isPopular: false,
  },
  {
    id: 'home',
    name: 'Home',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    subtitle: 'Sacred Living & Bakhoor',
    isPopular: false,
  },
];

export const defaultSections: StoreSection[] = [
  {
    id: 'featured_products',
    heading: 'Featured Products',
    subheading: 'Hand-picked and spiritually blessed by our verified scholars',
    badge: 'Curated Selections',
    enabled: true,
    order: 1,
    layout: {
      columns: 4,
      maxProducts: 4,
      showRating: true,
      showDescription: false,
    },
    productSource: {
      type: 'specific_products',
      selectedCategories: [],
      selectedProductIds: ['1', '2', '3', '4'],
      assignedArea: 'featured',
    },
    showViewAll: true,
    viewAllCategory: 'All',
  },
  {
    id: 'best_sellers',
    heading: 'Best Sellers & Full Collection',
    subheading: 'Certified authentic spiritual items cleansed with holy Quranic recitations',
    badge: 'Certified Sunnah',
    enabled: true,
    order: 2,
    layout: {
      columns: 4,
      maxProducts: 8,
      showRating: true,
      showDescription: true,
    },
    productSource: {
      type: 'all',
      selectedCategories: [],
      selectedProductIds: [],
    },
    showViewAll: true,
    viewAllCategory: 'All',
  },
];

export const defaultProductCountdowns: ProductCountdown[] = [
  {
    id: 'cd-1',
    productId: '1',
    enabled: true,
    title: 'Natural Yemeni Aqeeq Silver Ring',
    tag: '⚡ Flash Blessed Deal',
    discountPrice: '$65.00',
    originalPrice: '$95.00',
    days: '02',
    hours: '14',
    minutes: '38',
    seconds: '45',
    theme: 'amber',
    showOnProductPage: true,
    productPagePosition: 'above_cta',
    showOnStorePage: true,
    urgencyText: 'Hurry, limited consecrated rings remaining at this blessed discount!',
  },
  {
    id: 'cd-2',
    productId: '2',
    enabled: true,
    title: 'Pure Royal Amber & Oud Musk',
    tag: '🌿 Sacred Essence Sale',
    discountPrice: '$45.00',
    originalPrice: '$60.00',
    days: '01',
    hours: '08',
    minutes: '20',
    seconds: '15',
    theme: 'emerald',
    showOnProductPage: true,
    productPagePosition: 'below_price',
    showOnStorePage: false,
    urgencyText: 'Only 5 pure distilled bottles left in stock for this blessing period.',
  },
];

export const defaultStoreSettings: StoreSettings = {
  categories: defaultCategories,
  sections: defaultSections,
  productCountdowns: defaultProductCountdowns,
  announcement: {
    enabled: true,
    text: '✨ Sacred Store Summer Blessings Sale is Live! Get Up to 50% OFF',
  },
  hero: {
    badge: 'Authentic Quality. Sacred Serenity.',
    title: 'Everything You Need,',
    highlightWord: 'All in One Place',
    subtitle: 'Discover authentic Yemeni Aqeeq, pure musk, hand-strung crystal tasbih, and spiritual protection tools cleansed with authentic Quranic recitations by verified scholars.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    discountTagText: 'UP TO',
    discountPercent: '50% OFF',
    primaryBtnText: 'Shop Now',
    secondaryBtnText: 'Explore Deals',
  },
  trustPillars: [
    { title: 'Free Shipping', desc: 'On orders over $50' },
    { title: 'Authentic Sunnah', desc: '100% Cleansed' },
    { title: 'Secure Blessed', desc: 'Discreetly packed' },
  ],
  flashDeal: {
    enabled: true,
    productId: '1',
    customTitle: 'Natural Yemeni Aqeeq Silver Ring',
    customPrice: '$65.00',
    customOriginalPrice: '$95.00',
    tag: 'Flash Blessed Deal',
    days: '02',
    hours: '14',
    minutes: '38',
    seconds: '45',
  },
  promoBanners: {
    banner1: {
      tag: 'Sacred Protection',
      title: 'Blessed Gemstones & Rings',
      desc: 'Up to 40% Off on Yemeni Aqeeq & Dur-e-Najaf',
      btnText: 'Shop Now',
      category: 'Gemstones',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop',
    },
    banner2: {
      tag: 'Spiritual Healing',
      title: 'Zamzam & Pure Musk Tahara',
      desc: 'Up to 35% Off on healing essentials & fragrances',
      btnText: 'Shop Now',
      category: 'Essentials',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
    },
  },
  testimonial: {
    name: 'Amina Rahman',
    role: 'Verified Seeker',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    quote: '"The Natural Yemeni Aqeeq and Musk arrived beautifully packaged and blessed. You can immediately feel the serenity and authenticity in every item. Jaadu ki kaat is truly my trusted spiritual sanctuary!"',
  },
  newsletter: {
    title: 'Get Exclusive Offers & Spiritual Updates',
    desc: 'Join our newsletter and receive special blessings and discounts on sacred essentials.',
  },
};

const STORAGE_KEY = 'sacred_store_settings';

let isSyncing = false;

export const syncStoreSettingsFromServer = async (): Promise<StoreSettings | null> => {
  if (typeof window === 'undefined' || isSyncing) return null;
  isSyncing = true;
  try {
    const res = await fetch('/api/store-settings');
    if (res.ok) {
      const serverSettings = await res.json();
      if (serverSettings && serverSettings.categories && Array.isArray(serverSettings.categories) && serverSettings.categories.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverSettings));
        window.dispatchEvent(new CustomEvent('store_settings_updated', { detail: serverSettings }));
        isSyncing = false;
        return serverSettings;
      }
    }
  } catch (e) {
    console.debug('Server settings fetch skipped or unavailable:', e);
  } finally {
    isSyncing = false;
  }
  return null;
};

export const getStoreSettings = (): StoreSettings => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    let parsed: any = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to parse localStorage settings');
      }
    }

    // Trigger async background sync with server if on client
    if (typeof window !== 'undefined' && !isSyncing) {
      syncStoreSettingsFromServer();
    }

    if (!parsed) return defaultStoreSettings;

    return {
      ...defaultStoreSettings,
      ...parsed,
      categories:
        parsed.categories && Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : defaultCategories,
      sections:
        parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0
          ? parsed.sections
          : defaultSections,
      productCountdowns:
        parsed.productCountdowns && Array.isArray(parsed.productCountdowns) && parsed.productCountdowns.length > 0
          ? parsed.productCountdowns
          : defaultProductCountdowns,
      announcement: { ...defaultStoreSettings.announcement, ...parsed.announcement },
      hero: { ...defaultStoreSettings.hero, ...parsed.hero },
      trustPillars: parsed.trustPillars || defaultStoreSettings.trustPillars,
      flashDeal: { ...defaultStoreSettings.flashDeal, ...parsed.flashDeal },
      promoBanners: {
        banner1: { ...defaultStoreSettings.promoBanners.banner1, ...parsed.promoBanners?.banner1 },
        banner2: { ...defaultStoreSettings.promoBanners.banner2, ...parsed.promoBanners?.banner2 },
      },
      testimonial: { ...defaultStoreSettings.testimonial, ...parsed.testimonial },
      newsletter: { ...defaultStoreSettings.newsletter, ...parsed.newsletter },
    };
  } catch (err) {
    console.warn('Failed to load store settings from localStorage', err);
    return defaultStoreSettings;
  }
};

export const saveStoreSettings = (settings: StoreSettings): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('store_settings_updated', { detail: settings }));
    }

    // Persist to backend server so all tabs, preview sessions, and users stay synchronized
    fetch('/api/store-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    }).catch((err) => {
      console.warn('Failed to persist store settings to server API:', err);
    });
  } catch (err) {
    console.warn('Failed to save store settings to localStorage', err);
  }
};
