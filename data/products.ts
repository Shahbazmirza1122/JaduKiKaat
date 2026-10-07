
export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  description?: string;
  // Merchandising & Placement Fields
  displayArea?: string; // 'catalog' | 'featured' | 'best_sellers' | 'flash_deal' | 'hero'
  assignedSections?: string[]; // IDs of specific custom sections where this product appears
  sku?: string;
  salePrice?: string;
  saleStart?: string;
  saleEnd?: string;
  isOutOfStock?: boolean;
  isBlurBeforeBuy?: boolean;
  isWrapBeforeBuy?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Natural Yemeni Aqeeq',
    price: '$85.00',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    category: 'Gemstones',
    description: 'A rare, authentic Yemeni Aqeeq stone known for its grounding properties and ability to ward off negative energy. Polished to perfection, this gemstone is perfect for rings or pendants.',
    sku: 'GEM-001',
    isOutOfStock: false,
    displayArea: 'featured',
    assignedSections: ['featured_products']
  },
  {
    id: '2',
    name: 'Crystal Tasbih (33 Beads)',
    price: '$25.00',
    image: 'https://images.unsplash.com/photo-1548925081-d5087ef8f683?q=80&w=800&auto=format&fit=crop',
    category: 'Accessories',
    description: 'Hand-strung crystal Tasbih designed for dhikr and meditation. The cool touch of the beads aids in focus and tranquility during your spiritual recitations.',
    sku: 'ACC-002',
    displayArea: 'featured',
    assignedSections: ['featured_products']
  },
  {
    id: '3',
    name: 'Pure Musk Al-Tahara',
    price: '$40.00',
    image: 'https://images.unsplash.com/photo-1702475139208-f2ddabb4fc80?q=80&w=800&auto=format&fit=crop',
    category: 'Fragrance',
    description: 'A thick, creamy, and long-lasting musk with a clean, powdery scent. Traditionally used for purification, its aroma brings a sense of absolute cleanliness and serenity.',
    sku: 'FRG-003',
    displayArea: 'featured',
    assignedSections: ['featured_products']
  },
  {
    id: '4',
    name: 'Hand-Engraved Loh-e-Qurani',
    price: '$150.00',
    image: 'https://images.unsplash.com/photo-1676928117296-66bc2882ec6a?q=80&w=800&auto=format&fit=crop',
    category: 'Art',
    description: 'Exquisite brass plate featuring hand-engraved Loh-e-Qurani script. A powerful symbol of protection and blessings for your home or office.',
    displayArea: 'featured',
    assignedSections: ['featured_products']
  },
  {
    id: '5',
    name: 'Healing Zamzam Set',
    price: '$55.00',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
    category: 'Essentials',
    description: 'A curated set containing authentic Zamzam water and Ajwa dates. A spiritual remedy for physical ailments and a source of immense blessings.',
    displayArea: 'best_sellers',
    assignedSections: ['best_sellers']
  },
  {
    id: '6',
    name: 'Brass Bakhoor Burner',
    price: '$70.00',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    category: 'Home',
    description: 'An elegant brass burner for Bakhoor and Oud. Its intricate latticework allows the fragrant smoke to diffuse gently, creating a calming atmosphere.',
    displayArea: 'best_sellers',
    assignedSections: ['best_sellers']
  },
  {
    id: '7',
    name: 'Dur-e-Najaf Natural Ring',
    price: '$95.00',
    salePrice: '$79.00',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    category: 'Gemstones',
    description: 'Pure clear quartz from holy Najaf, traditionally regarded for inner serenity, spiritual insight, and protection.',
    sku: 'GEM-007',
    displayArea: 'best_sellers',
    assignedSections: ['best_sellers']
  },
  {
    id: '8',
    name: 'Cold-Pressed Black Seed Oil',
    price: '$35.00',
    salePrice: '$28.00',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop',
    category: 'Essentials',
    description: '100% virgin Ethiopian black seed oil (Habbat al-Barakah), revered in prophetic medicine for complete physical and spiritual vitality.',
    sku: 'ESS-008',
    displayArea: 'best_sellers',
    assignedSections: ['best_sellers']
  }
];
