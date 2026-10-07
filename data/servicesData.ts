export interface ServiceItem {
  id: string;
  title: string;
  slug?: string;
  description: string;
  content?: string;
  category: string;
  categoryId?: string;
  icon: string;
  imageUrl?: string;
  price?: string;
  duration?: string;
  features?: string[];
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface ServiceCategoryItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  relatedProducts: string[];
  relatedArticles: string[];
  createdAt?: string;
}

export const defaultServiceCategories: ServiceCategoryItem[] = [
  {
    id: "cat-rohani-ilaj",
    name: "Spiritual Healing (Rohani Ilaj)",
    description: "Holistic spiritual remedies and sacred recitations for bodily, mental, and spiritual wellness.",
    imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop&q=80",
    relatedProducts: [],
    relatedArticles: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-jadu-kaat",
    name: "Black Magic & Evil Eye Removal",
    description: "Neutralize negative energy, evil eye (Nazar), and hostile occult blockages.",
    imageUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&auto=format&fit=crop&q=80",
    relatedProducts: [],
    relatedArticles: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-istikhara-guidance",
    name: "Divine Istikhara & Life Guidance",
    description: "Clarity on marriage, business decisions, partnerships, and spiritual pathfinding.",
    imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&auto=format&fit=crop&q=80",
    relatedProducts: [],
    relatedArticles: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-abroad-career",
    name: "Abroad Journey & Career Success",
    description: "Spiritual solutions to open doors for foreign travel, visas, jobs, and financial relief.",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80",
    relatedProducts: [],
    relatedArticles: [],
    createdAt: new Date().toISOString(),
  },
];

export const defaultServices: ServiceItem[] = [
  {
    id: "srv-1",
    title: "Dua",
    slug: "dua",
    description: "Personalized supplications to connect with the Divine and seek fulfillment of your deepest needs.",
    content: "Specialized personalized Duas recited during blessed third of the night and tahajjud hours for urgent relief and divine assistance.",
    category: "Spiritual Healing (Rohani Ilaj)",
    categoryId: "cat-rohani-ilaj",
    icon: "Moon",
    price: "Free Consultation",
    duration: "Instant / 24 Hours",
    features: [
      "Customized personalized supplication",
      "Quranic verses and Asma ul Husna",
      "Confidential prayer request",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "srv-2",
    title: "Wazaif",
    slug: "wazaif",
    description: "Powerful spiritual recitations and litanies aimed at resolving specific life challenges.",
    content: "Structured daily wazaif and count-specific Quranic recitations tailored to your astrological and spiritual needs.",
    category: "Spiritual Healing (Rohani Ilaj)",
    categoryId: "cat-rohani-ilaj",
    icon: "BookOpen",
    price: "Free Consultation",
    duration: "7 - 21 Days",
    features: [
      "Precise numerical count guidance",
      "Strict Sunnah adherence",
      "Daily progress monitoring",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "srv-3",
    title: "Istikhara",
    slug: "istikhara",
    description: "Divine guidance for crucial life decisions, providing clarity on marriage, business, and future paths.",
    content: "Authentic Sunnah-based Istikhara conducted on your behalf by verified scholars for definitive peace of heart.",
    category: "Divine Istikhara & Life Guidance",
    categoryId: "cat-istikhara-guidance",
    icon: "Compass",
    price: "Free Consultation",
    duration: "24 - 48 Hours",
    features: [
      "Direct scholar spiritual reading",
      "Interpretation and dream analysis",
      "Actionable recommendations",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "srv-4",
    title: "Rohani Ilaaj",
    slug: "rohani-ilaaj",
    description: "Holistic spiritual healing for ailments of the heart, mind, and soul using ancient Quranic wisdom.",
    content: "Comprehensive spiritual treatment addressing deep-seated emotional trauma, grief, anxiety, and unexplainable distress.",
    category: "Spiritual Healing (Rohani Ilaj)",
    categoryId: "cat-rohani-ilaj",
    icon: "Sparkles",
    price: "Contact for Assessment",
    duration: "Ongoing Guidance",
    features: [
      "Spiritual aura diagnosis",
      "Sacred blessed water and oil recommendations",
      "Continuous scholar support",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "srv-5",
    title: "Jadu Ki Kaat",
    slug: "jadu-ki-kaat",
    description: "Complete removal of black magic, evil eye, and spiritual blockages affecting your progress and peace.",
    content: "Definitive neutralization of dark occult spells, buried charms, photograph magic, and ancestral curses through sacred ruqyah.",
    category: "Black Magic & Evil Eye Removal",
    categoryId: "cat-jadu-kaat",
    icon: "ShieldCheck",
    price: "Consultation Required",
    duration: "1 - 3 Days",
    features: [
      "Total spell breaking & neutralization",
      "Protective spiritual shield installation",
      "Household negative energy cleansing",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "srv-6",
    title: "Job & Financial Success",
    slug: "job-success",
    description: "Spiritual remedies to open doors of opportunity, career growth, and financial stability.",
    content: "Divine remedies (Bandish ka tod) for unblocking career hindrances, interview barriers, and workplace hostility.",
    category: "Abroad Journey & Career Success",
    categoryId: "cat-abroad-career",
    icon: "Briefcase",
    price: "Free Consultation",
    duration: "3 - 7 Days",
    features: [
      "Rizq abundance recitations",
      "Interview confidence wazifa",
      "Removal of professional jealousy",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "srv-7",
    title: "Abroad Journey & Visa Guidance",
    slug: "abroad-journey",
    description: "Spiritual solutions to resolve immigration obstacles, visa rejections, and travel delays.",
    content: "Specialized spiritual supplications and Istikhara to ease international migration, foreign permits, and overseas settlement.",
    category: "Abroad Journey & Career Success",
    categoryId: "cat-abroad-career",
    icon: "Plane",
    price: "Free Consultation",
    duration: "24 Hours",
    features: [
      "Visa interview barakah prayers",
      "Removal of foreign travel hurdles",
      "Safe journey protection amulet guidance",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "srv-8",
    title: "Relief from Whispers (Waswas)",
    slug: "relief-from-whispers",
    description: "Removing intrusive whispers and doubts from the mind to restore mental peace.",
    content: "Targeted ruqyah against satanic whispers, existential doubts, and obsessive thoughts.",
    category: "Spiritual Healing (Rohani Ilaj)",
    categoryId: "cat-rohani-ilaj",
    icon: "Brain",
    price: "Free Consultation",
    duration: "Immediate",
    features: [
      "Mind calming Ayat",
      "Shielding against obsessive doubt",
      "Daily protection routine",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "srv-9",
    title: "Protection from Fear & Nightmares",
    slug: "protection-from-fear",
    description: "Spiritual protection against irrational fear, nightmares, and sleep phobias.",
    content: "Ancient Quranic litanies recited before sleep to banish terrifying nightmares, paralysis, and nighttime dread.",
    category: "Black Magic & Evil Eye Removal",
    categoryId: "cat-jadu-kaat",
    icon: "ShieldAlert",
    price: "Free Consultation",
    duration: "Immediate",
    features: [
      "Peaceful sleep litanies",
      "Children and adult protection",
      "Bedroom spiritual shielding",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "srv-10",
    title: "Restoring Love & Harmony",
    slug: "restoring-love",
    description: "Restoring lost love and fixing marital bonds broken by negative energy or misunderstandings.",
    content: "Sunnah-permissible supplications to soften hearts, heal marital disputes, and eliminate third-party negative interference.",
    category: "Divine Istikhara & Life Guidance",
    categoryId: "cat-istikhara-guidance",
    icon: "Heart",
    price: "Consultation Required",
    duration: "3 - 7 Days",
    features: [
      "Heart-softening Dua",
      "Reconciliation counseling",
      "Protection from envy",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "srv-11",
    title: "Removing Bandish (Blockages)",
    slug: "removing-blockages",
    description: "Opening blocked paths (Bandish) in career, marriage, or financial life.",
    content: "Breaking occult ties that halt proposals, business transactions, or personal milestones.",
    category: "Black Magic & Evil Eye Removal",
    categoryId: "cat-jadu-kaat",
    icon: "Lock",
    price: "Consultation Required",
    duration: "3 Days",
    features: [
      "Marriage bandish removal",
      "Financial barrier breakdown",
      "Complete life unblocking",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

// LocalStorage helpers for reliable persistence
export const getStoredServices = (): ServiceItem[] => {
  if (typeof window === "undefined") return defaultServices;
  try {
    const raw = localStorage.getItem("sacred_services");
    if (!raw) {
      localStorage.setItem("sacred_services", JSON.stringify(defaultServices));
      return defaultServices;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed reading services from localStorage", e);
    return defaultServices;
  }
};

export const saveStoredServices = (services: ServiceItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sacred_services", JSON.stringify(services));
  } catch (e) {
    console.warn("Failed saving services to localStorage", e);
  }
};

export const getStoredServiceCategories = (): ServiceCategoryItem[] => {
  if (typeof window === "undefined") return defaultServiceCategories;
  try {
    const raw = localStorage.getItem("sacred_service_categories");
    if (!raw) {
      localStorage.setItem("sacred_service_categories", JSON.stringify(defaultServiceCategories));
      return defaultServiceCategories;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed reading categories from localStorage", e);
    return defaultServiceCategories;
  }
};

export const saveStoredServiceCategories = (categories: ServiceCategoryItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sacred_service_categories", JSON.stringify(categories));
  } catch (e) {
    console.warn("Failed saving categories to localStorage", e);
  }
};
