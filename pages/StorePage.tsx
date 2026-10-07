import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  ArrowRight, 
  Loader2, 
  Tag, 
  Lock, 
  X, 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  Disc, 
  Package, 
  Mail, 
  Check, 
  User, 
  ChevronRight,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { products as staticProducts, Product } from '../data/products';
import { 
  getStoreSettings, 
  StoreSettings, 
  StoreCategory, 
  defaultCategories,
  syncStoreSettingsFromServer,
  StoreSection,
  defaultSections
} from '../data/storeSettings';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { usePageSections } from '../hooks/usePageSections';
import DynamicSection from '../components/DynamicSection';

const StorePage: React.FC = () => {
  const { sections: pageSections } = usePageSections('/store');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(getStoreSettings());
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState(() => searchParams.get('category') || 'All');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setFilter(cat);
    }
  }, [searchParams]);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, totalItems } = useCart();
  const { purchasedProductIds } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRevealProduct, setSelectedRevealProduct] = useState<Product | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Live Flash Deal Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    days: storeSettings.flashDeal?.days || '02',
    hours: storeSettings.flashDeal?.hours || '14',
    minutes: storeSettings.flashDeal?.minutes || '38',
    seconds: storeSettings.flashDeal?.seconds || '45',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
    syncStoreSettingsFromServer();

    const handleSettingsUpdate = () => {
      const s = getStoreSettings();
      setStoreSettings(s);
      if (s.flashDeal) {
        setTimeLeft({
          days: s.flashDeal.days || '02',
          hours: s.flashDeal.hours || '14',
          minutes: s.flashDeal.minutes || '38',
          seconds: s.flashDeal.seconds || '45',
        });
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'sacred_store_settings' || !e.key) {
        handleSettingsUpdate();
      }
      if (e.key === 'sacred_store_products' || !e.key) {
        fetchProducts();
      }
    };

    const handleFocus = () => {
      handleSettingsUpdate();
      fetchProducts();
      syncStoreSettingsFromServer();
    };

    const handleProductsUpdate = () => {
      fetchProducts();
    };

    window.addEventListener('store_settings_updated', handleSettingsUpdate);
    window.addEventListener('store_products_updated', handleProductsUpdate);
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('focus', handleFocus);

    // Countdown interval
    const timer = setInterval(() => {
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

    return () => {
      clearInterval(timer);
      window.removeEventListener('store_settings_updated', handleSettingsUpdate);
      window.removeEventListener('store_products_updated', handleProductsUpdate);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const localProducts = localStorage.getItem('sacred_store_products');
      let localParsed: Product[] | null = null;
      if (localProducts) {
        try {
          localParsed = JSON.parse(localProducts);
        } catch (e) {}
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setProductsList(localParsed && localParsed.length > 0 ? localParsed : staticProducts);
      } else {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          category: p.category,
          description: p.description,
          sku: p.sku,
          salePrice: p.sale_price,
          saleStart: p.sale_start,
          saleEnd: p.sale_end,
          isOutOfStock: p.is_out_of_stock,
          isBlurBeforeBuy: p.is_blur_before_buy,
          isWrapBeforeBuy: p.is_wrap_before_buy
        }));
        setProductsList(mapped);
      }
    } catch (err) {
      console.warn('Unexpected error fetching products:', err);
      const localProducts = localStorage.getItem('sacred_store_products');
      if (localProducts) {
        try { setProductsList(JSON.parse(localProducts)); return; } catch(e) {}
      }
      setProductsList(staticProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isOutOfStock) return;
    addToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  const isSaleActive = (product: Product) => {
    if (!product.salePrice) return false;
    const now = new Date();
    const start = product.saleStart ? new Date(product.saleStart) : null;
    const end = product.saleEnd ? new Date(product.saleEnd) : null;
    
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterSubscribed(false);
        setNewsletterEmail('');
      }, 3500);
    }
  };

  const scrollToCatalog = (cat?: string) => {
    if (cat) setFilter(cat);
    const element = document.getElementById('product-catalog');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const storeCategories: StoreCategory[] = storeSettings.categories && storeSettings.categories.length > 0 
    ? storeSettings.categories 
    : defaultCategories;

  const categories = ['All', ...storeCategories.map(c => c.name)];

  const categoryChips = [
    { name: 'All', icon: Sparkles, image: storeCategories[0]?.image || 'https://images.unsplash.com/photo-1615486511262-c7b5c7f4297e?q=80&w=200&auto=format&fit=crop' },
    ...storeCategories.map(c => ({
      name: c.name,
      icon: Sparkles,
      image: c.image
    }))
  ];

  const filteredProducts = productsList.filter(product => {
    const matchesCategory = filter === 'All' || product.category === filter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Dynamic Store Sections Configuration
  const storeSections: StoreSection[] = (storeSettings.sections && storeSettings.sections.length > 0 
    ? storeSettings.sections 
    : defaultSections
  )
    .filter(s => s.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const prePromoSections = storeSections.filter(s => (s.order || 0) <= 1);
  const postPromoSections = storeSections.filter(s => (s.order || 0) > 1);

  const getSectionProducts = (section: StoreSection): Product[] => {
    let list: Product[] = [];
    const source = section.productSource || { type: 'all' };

    if (source.type === 'specific_products') {
      const ids = source.selectedProductIds || [];
      list = ids
        .map(id => productsList.find(p => String(p.id) === String(id)))
        .filter((p): p is Product => Boolean(p));
    } else if (source.type === 'specific_categories') {
      const cats = (source.selectedCategories || []).map(c => c.toLowerCase());
      list = productsList.filter(p => cats.includes(p.category?.toLowerCase()));
    } else if (source.type === 'assigned_area') {
      const area = source.assignedArea || 'featured';
      list = productsList.filter(p => p.displayArea === area);
    } else if (source.type === 'on_sale') {
      list = productsList.filter(p => isSaleActive(p));
    } else {
      list = [...productsList];
    }

    // Include products explicitly assigned to this section
    const explicitlyAssigned = productsList.filter(
      p => p.assignedSections?.includes(section.id) && !list.some(item => item.id === p.id)
    );
    if (explicitlyAssigned.length > 0) {
      list = [...list, ...explicitlyAssigned];
    }

    // If category filter or search query is set and this is the main catalog/all section
    if (section.id === 'best_sellers' || source.type === 'all') {
      if (filter !== 'All') {
        list = list.filter(p => p.category?.toLowerCase() === filter.toLowerCase());
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(p => 
          p.name.toLowerCase().includes(q) || 
          (p.description && p.description.toLowerCase().includes(q)) || 
          (p.category && p.category.toLowerCase().includes(q))
        );
      }
    }

    const max = section.layout?.maxProducts || 8;
    return list.slice(0, max);
  };

  const renderProductCard = (product: Product, showRating = true, showDescription = false) => {
    const onSale = isSaleActive(product);
    const currentPrice = onSale ? product.salePrice : product.price;
    const isPurchased = purchasedProductIds.includes(String(product.id));
    const shouldBlur = product.isBlurBeforeBuy && !isPurchased;
    const shouldWrap = product.isWrapBeforeBuy && !isPurchased;
    const isWish = wishlist.includes(product.id);
    const isAdded = addedProductId === product.id;

    return (
      <div
        key={product.id}
        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-xl hover:border-accent-300 transition-all duration-300 flex flex-col group relative"
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between w-full mb-2 z-10">
          {onSale && !product.isOutOfStock ? (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Sale
            </span>
          ) : (
            <span className="bg-spirit-100 text-spirit-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Blessed
            </span>
          )}

          <button
            onClick={(e) => toggleWishlist(product.id, e)}
            className={`p-1.5 rounded-full hover:bg-slate-50 transition-colors ${
              isWish ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product Image Area */}
        <Link 
          to={`/product/${product.id}`} 
          className="block w-full h-44 sm:h-48 overflow-hidden rounded-xl bg-slate-50 mb-3 relative"
        >
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 
              ${product.isOutOfStock ? 'grayscale opacity-70' : ''}
              ${shouldBlur ? 'blur-md scale-110' : ''}
            `}
          />

          {/* Wrap Overlay */}
          {shouldWrap && !product.isOutOfStock && (
            <div 
              className="absolute inset-0 z-20 cursor-pointer pointer-events-auto"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedRevealProduct(product);
              }}
            >
              <div className="absolute inset-0 bg-amber-950/30" />
              <div className="absolute top-2 left-2 bg-amber-500 text-spirit-950 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded shadow">
                <Lock size={10} className="inline mr-1" /> Wrapped
              </div>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {product.isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider shadow">
                Sold Out
              </span>
            </div>
          )}
        </Link>

        {/* Details */}
        <div className="flex-grow flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-accent-700 tracking-wider block mb-1">
              {product.category}
            </span>
            <Link 
              to={`/product/${product.id}`} 
              className="font-serif font-bold text-spirit-900 hover:text-accent-600 transition-colors text-sm sm:text-base line-clamp-1 block mb-1"
            >
              {product.name}
            </Link>
            
            {showDescription && product.description && (
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2 font-light">
                {product.description}
              </p>
            )}

            {showRating && (
              <div className="flex items-center gap-1 text-amber-400 text-xs mb-3">
                <div className="flex text-xs">★★★★★</div>
                <span className="text-[10px] text-slate-400 font-light ml-1">(5.0)</span>
              </div>
            )}
          </div>

          {/* Price & Action Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="text-base font-bold text-spirit-900 block leading-tight">
                {currentPrice}
              </span>
              {onSale && product.salePrice && (
                <span className="text-xs text-slate-400 line-through">
                  {product.price}
                </span>
              )}
            </div>

            <button
              onClick={(e) => handleAddToCart(e, product)}
              disabled={!!product.isOutOfStock}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-xs ${
                product.isOutOfStock 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isAdded 
                    ? 'bg-accent-600 text-white' 
                    : 'bg-spirit-50 hover:bg-spirit-900 text-spirit-900 hover:text-white'
              }`}
              title={product.isOutOfStock ? 'Out of stock' : 'Add to Cart'}
            >
              {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStoreSection = (section: StoreSection) => {
    const products = getSectionProducts(section);
    const cols = section.layout?.columns || 4;
    const gridColsClass = 
      cols === 2 
        ? 'grid-cols-1 sm:grid-cols-2' 
        : cols === 3 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

    const isCatalogSection = section.id === 'best_sellers' || section.productSource?.type === 'all';

    return (
      <div 
        key={section.id} 
        id={isCatalogSection ? "product-catalog" : `section-${section.id}`} 
        className="pt-2 scroll-mt-36"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {section.badge && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {section.badge}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-spirit-900">
              {section.heading}
            </h2>
            {section.subheading && (
              <p className="text-xs text-slate-500 font-light mt-0.5">
                {section.subheading}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter Pills for catalog/all section */}
            {isCatalogSection && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                      filter === cat
                        ? 'bg-spirit-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {section.showViewAll && (
              <button
                onClick={() => scrollToCatalog(section.viewAllCategory || 'All')}
                className="text-xs sm:text-sm font-bold text-spirit-900 hover:text-accent-600 flex items-center gap-1 transition-colors whitespace-nowrap ml-2"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin text-spirit-500 w-8 h-8 mb-2" />
            <p className="text-xs">Loading items...</p>
          </div>
        ) : products.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-5`}>
            {products.map((product) => 
              renderProductCard(
                product, 
                section.layout?.showRating ?? true, 
                section.layout?.showDescription ?? (isCatalogSection)
              )
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No items available in this section</h4>
            <p className="text-xs text-slate-400 mt-1">Check back soon or explore our other collections.</p>
          </div>
        )}
      </div>
    );
  };

  // Flash deal product
  const flashProduct = (storeSettings.flashDeal?.productId 
    ? productsList.find(p => String(p.id) === String(storeSettings.flashDeal.productId))
    : null) || productsList[0] || staticProducts[0];

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-[70px] md:pt-[128px] pb-24 text-slate-800">
      
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      {storeSettings.announcement.enabled && storeSettings.announcement.text && (
        <div className="bg-spirit-900 text-white text-xs py-2.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <span>{storeSettings.announcement.text}</span>
          <ArrowRight className="w-3.5 h-3.5 inline animate-pulse text-accent-400" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">

        {/* 2. SEARCH & QUICK HEADER CONTROLS (Marketly Style) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-spirit-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-spirit-900 text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              JK
            </div>
            <div>
              <span className="font-serif font-bold text-spirit-900 text-base sm:text-lg block leading-tight">
                Sacred Store
              </span>
              <span className="text-[11px] text-slate-500 font-light block">
                Authentic Spiritual Remedies & Goods
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xl flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for gemstones, attar, tasbih, wazaif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-accent-500 rounded-full outline-none text-sm transition-all shadow-inner"
              />
              <button
                onClick={() => scrollToCatalog()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-spirit-900 hover:bg-accent-600 text-white text-xs font-bold px-5 py-2 rounded-full transition-all shadow-sm"
              >
                Search
              </button>
            </div>
          </div>

          {/* User Quick Icons */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button 
              onClick={() => scrollToCatalog()} 
              className="p-2.5 rounded-full hover:bg-slate-100 text-spirit-900 transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            <Link 
              to="/cart" 
              className="p-2.5 rounded-full hover:bg-slate-100 text-spirit-900 transition-colors relative"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* 3. CIRCULAR / ROUNDED CATEGORY ROW (Full Width with Generous Spacing) */}
        <div className="w-full overflow-x-auto no-scrollbar py-3">
          <div className="w-full flex items-center justify-between gap-3 sm:gap-6 md:gap-8 min-w-[700px] md:min-w-0 px-2 sm:px-4">
            {categoryChips.map((cat) => {
              const isActive = filter === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setFilter(cat.name);
                    scrollToCatalog(cat.name);
                  }}
                  className="flex-1 flex flex-col items-center gap-2.5 group transition-all duration-300 hover:-translate-y-1.5 focus:outline-none"
                >
                  <div className={`w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden p-1.5 border-2 transition-all duration-300 shadow-sm ${
                    isActive 
                      ? 'border-accent-500 ring-4 ring-accent-100 shadow-md scale-105 bg-accent-50/20' 
                      : 'border-slate-200 group-hover:border-accent-400 bg-white group-hover:shadow-md'
                  }`}>
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop';
                      }}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <span className={`text-xs sm:text-sm tracking-tight text-center whitespace-nowrap transition-colors ${
                    isActive ? 'text-spirit-900 font-bold' : 'text-slate-600 font-medium group-hover:text-spirit-900'
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. HERO BANNER (Marketly Composite Layout with Light Sanctuary Theme) */}
        <div className="bg-gradient-to-br from-spirit-50 via-white to-accent-50/30 rounded-3xl border border-spirit-100 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Copy & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-accent-100/70 text-spirit-900 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-accent-600" />
                <span>{storeSettings.hero.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-spirit-900 leading-[1.15]">
                {storeSettings.hero.title} <br className="hidden sm:inline" />
                <span className="text-accent-600">{storeSettings.hero.highlightWord}</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light max-w-xl">
                {storeSettings.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => scrollToCatalog('All')}
                  className="inline-flex items-center justify-center bg-spirit-900 text-white font-bold py-3.5 px-8 rounded-full shadow-md hover:bg-accent-600 transition-all text-sm group"
                >
                  <span>{storeSettings.hero.primaryBtnText || 'Shop Now'}</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToCatalog('Gemstones')}
                  className="inline-flex items-center justify-center bg-white text-spirit-900 font-semibold py-3.5 px-7 rounded-full border border-slate-200 hover:border-spirit-900 hover:bg-slate-50 transition-all text-sm"
                >
                  {storeSettings.hero.secondaryBtnText || 'Explore Deals'}
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-spirit-900 leading-tight">
                      {storeSettings.trustPillars[0]?.title || 'Free Shipping'}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-light">
                      {storeSettings.trustPillars[0]?.desc || 'On orders over $50'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-spirit-900 leading-tight">
                      {storeSettings.trustPillars[1]?.title || 'Authentic Sunnah'}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-light">
                      {storeSettings.trustPillars[1]?.desc || '100% Cleansed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-700">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-spirit-900 leading-tight">
                      {storeSettings.trustPillars[2]?.title || 'Secure Blessed'}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-light">
                      {storeSettings.trustPillars[2]?.desc || 'Discreetly packed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Product Showcase & Discount Badge */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Floating Discount Tag */}
                <div className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 z-20 bg-accent-500 text-white rounded-full w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center shadow-xl border-4 border-white animate-bounce-slow">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                    {storeSettings.hero.discountTagText || 'UP TO'}
                  </span>
                  <span className="text-lg sm:text-2xl font-bold font-serif leading-none">
                    {storeSettings.hero.discountPercent || '50% OFF'}
                  </span>
                </div>

                {/* Hero Showcase Image */}
                <div className="relative bg-white rounded-3xl p-4 shadow-xl border border-spirit-100 overflow-hidden group">
                  <img
                    src={storeSettings.hero.image || "https://images.unsplash.com/photo-1615486511262-c7b5c7f4297e?q=80&w=800&auto=format&fit=crop"}
                    alt="Spiritual Gemstone Collection"
                    className="w-full h-72 sm:h-80 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-spirit-950/70 via-transparent to-transparent rounded-2xl flex items-end p-6">
                    <div>
                      <span className="text-accent-300 text-xs font-bold uppercase tracking-wider">Blessed Sanctuary</span>
                      <h4 className="text-white font-serif font-bold text-lg">{storeSettings.hero.highlightWord}</h4>
                      <p className="text-slate-200 text-xs font-light">Known for authentic spiritual protection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 5. FLASH DEAL SECTION WITH LIVE COUNTDOWN TIMER */}
        {storeSettings.flashDeal?.enabled !== false && (
          <div className="bg-gradient-to-r from-spirit-950 via-spirit-900 to-spirit-800 rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
              {/* Flash Product Thumbnail & Left Side Box */}
              <div className="flex items-center gap-3.5 w-full md:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl p-1 shrink-0 overflow-hidden shadow-sm">
                  <img 
                    src={flashProduct.image} 
                    alt={flashProduct.name} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-accent-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">
                    <Flame className="w-3.5 h-3.5 fill-accent-400" />
                    <span>{storeSettings.flashDeal?.tag || 'Flash Blessed Deal'}</span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white leading-snug">
                    {storeSettings.flashDeal?.customTitle || flashProduct.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-accent-400 font-bold text-base">
                      {storeSettings.flashDeal?.customPrice || flashProduct.salePrice || '$65.00'}
                    </span>
                    <span className="text-slate-400 text-xs line-through">
                      {storeSettings.flashDeal?.customOriginalPrice || flashProduct.price}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(e, flashProduct)}
                    className="mt-2 inline-flex items-center gap-1.5 bg-accent-500 hover:bg-accent-600 text-spirit-950 text-xs font-bold py-1 px-3.5 rounded-md shadow-xs transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Shop Deal</span>
                  </button>
                </div>
              </div>

              {/* Reduced Height Live Countdown Timer Boxes */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="bg-white/10 backdrop-blur-md rounded-lg py-1.5 px-2.5 text-center min-w-[50px] sm:min-w-[56px] border border-white/10 shadow-xs">
                  <span className="font-mono font-bold text-lg sm:text-xl block text-accent-300 leading-tight">{timeLeft.days}</span>
                  <span className="text-[9px] text-slate-300 uppercase tracking-wider font-semibold">Days</span>
                </div>
                <span className="text-lg font-bold text-white/40">:</span>
                <div className="bg-white/10 backdrop-blur-md rounded-lg py-1.5 px-2.5 text-center min-w-[50px] sm:min-w-[56px] border border-white/10 shadow-xs">
                  <span className="font-mono font-bold text-lg sm:text-xl block text-accent-300 leading-tight">{timeLeft.hours}</span>
                  <span className="text-[9px] text-slate-300 uppercase tracking-wider font-semibold">Hours</span>
                </div>
                <span className="text-lg font-bold text-white/40">:</span>
                <div className="bg-white/10 backdrop-blur-md rounded-lg py-1.5 px-2.5 text-center min-w-[50px] sm:min-w-[56px] border border-white/10 shadow-xs">
                  <span className="font-mono font-bold text-lg sm:text-xl block text-accent-300 leading-tight">{timeLeft.minutes}</span>
                  <span className="text-[9px] text-slate-300 uppercase tracking-wider font-semibold">Mins</span>
                </div>
                <span className="text-lg font-bold text-white/40">:</span>
                <div className="bg-white/10 backdrop-blur-md rounded-lg py-1.5 px-2.5 text-center min-w-[50px] sm:min-w-[56px] border border-white/10 shadow-xs">
                  <span className="font-mono font-bold text-lg sm:text-xl block text-accent-300 leading-tight">{timeLeft.seconds}</span>
                  <span className="text-[9px] text-slate-300 uppercase tracking-wider font-semibold">Secs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. POPULAR CATEGORIES (Rich Visual Grid with bottom-right to top-left hover transition) */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-spirit-900">
                Popular Categories
              </h2>
              <p className="text-xs text-slate-500 font-light mt-0.5">Explore curated blessed collections</p>
            </div>
            <button
              onClick={() => scrollToCatalog('All')}
              className="text-xs sm:text-sm font-bold text-spirit-900 hover:text-accent-600 flex items-center gap-1 transition-colors"
            >
              <span>View All ({storeCategories.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {storeCategories.map((cat) => {
              const count = productsList.filter(
                (p) => p.category?.toLowerCase() === cat.name?.toLowerCase()
              ).length;
              const itemsLabel = cat.subtitle || `${count} ${count === 1 ? 'Product' : 'Products'}`;

              return (
                <div
                  key={cat.id || cat.name}
                  onClick={() => {
                    setFilter(cat.name);
                    scrollToCatalog(cat.name);
                  }}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-accent-400 transition-all duration-500 cursor-pointer flex flex-col"
                >
                  {/* Hover Color Transition Effect: Bottom Right to Top Left */}
                  <div className="absolute inset-0 bg-gradient-to-tl from-amber-500/25 via-amber-200/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-10" />

                  {/* Category Image Header */}
                  <div className="h-32 sm:h-36 relative bg-slate-100 overflow-hidden">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-spirit-950/85 via-spirit-950/30 to-transparent" />
                    
                    {cat.isPopular && (
                      <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-20">
                        Popular
                      </span>
                    )}

                    <div className="absolute bottom-2.5 left-3 right-3 text-white z-20">
                      <h4 className="font-serif font-bold text-sm sm:text-base leading-tight drop-shadow-xs group-hover:text-amber-300 transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-amber-200/90 font-medium truncate mt-0.5">
                        {itemsLabel}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="p-2.5 bg-white flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 z-20">
                    <span className="text-[11px] font-medium text-slate-500">
                      {count > 0 ? `${count} ${count === 1 ? 'Product' : 'Products'}` : 'Curated'}
                    </span>
                    <span className="text-accent-600 group-hover:translate-x-1 transition-transform inline-flex items-center text-[11px] font-bold">
                      Explore →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DYNAMIC STORE SECTIONS (PRE-PROMO BANNERS, e.g. Featured Products) */}
        {prePromoSections.map(section => renderStoreSection(section))}

        {/* 8. DUAL PROMO BANNERS (Marketly Dual Cards Layout with Reduced Height & Hover Transition) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Banner */}
          <div className="group relative bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100/50 rounded-2xl p-5 sm:p-6 border border-amber-200/80 flex items-center justify-between gap-4 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-500">
            {/* Bottom-right to top-left color transition effect */}
            <div className="absolute inset-0 bg-gradient-to-tl from-amber-400/25 via-amber-200/15 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

            <div className="space-y-2.5 z-10 max-w-[62%]">
              <span className="text-amber-800 text-[11px] font-bold uppercase tracking-wider block">
                {storeSettings.promoBanners.banner1.tag}
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-spirit-950 leading-tight group-hover:text-amber-900 transition-colors">
                {storeSettings.promoBanners.banner1.title}
              </h3>
              <p className="text-xs text-slate-600 font-light line-clamp-2">
                {storeSettings.promoBanners.banner1.subtitle}
              </p>
              <button
                onClick={() => scrollToCatalog('Gemstones')}
                className="inline-flex items-center gap-1.5 bg-spirit-900 hover:bg-accent-600 text-white text-xs font-bold py-2 px-4 rounded-full transition-all shadow-xs"
              >
                <span>{storeSettings.promoBanners.banner1.btnText || 'Shop Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden shrink-0 shadow-sm border-2 border-white/80 z-10">
              <img
                src={storeSettings.promoBanners.banner1.image}
                alt={storeSettings.promoBanners.banner1.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Right Banner (Target of bottom-right to top-left hover transition effect) */}
          <div className="group relative bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100/50 rounded-2xl p-5 sm:p-6 border border-emerald-200/80 flex items-center justify-between gap-4 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-500">
            {/* Color transition effect from bottom right to top left */}
            <div className="absolute inset-0 bg-gradient-to-tl from-emerald-500/30 via-teal-300/15 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

            <div className="space-y-2.5 z-10 max-w-[62%]">
              <span className="text-emerald-800 text-[11px] font-bold uppercase tracking-wider block">
                {storeSettings.promoBanners.banner2.tag}
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-spirit-950 leading-tight group-hover:text-emerald-950 transition-colors">
                {storeSettings.promoBanners.banner2.title}
              </h3>
              <p className="text-xs text-slate-600 font-light line-clamp-2">
                {storeSettings.promoBanners.banner2.subtitle}
              </p>
              <button
                onClick={() => scrollToCatalog('Essentials')}
                className="inline-flex items-center gap-1.5 bg-spirit-900 hover:bg-accent-600 text-white text-xs font-bold py-2 px-4 rounded-full transition-all shadow-xs"
              >
                <span>{storeSettings.promoBanners.banner2.btnText || 'Shop Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden shrink-0 shadow-sm border-2 border-white/80 z-10">
              <img
                src={storeSettings.promoBanners.banner2.image}
                alt={storeSettings.promoBanners.banner2.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        {/* DYNAMIC STORE SECTIONS (POST-PROMO BANNERS, e.g. Best Sellers, Custom Catalog Sections) */}
        {postPromoSections.map(section => renderStoreSection(section))}

        {/* 10. CUSTOMER SOCIAL PROOF / TESTIMONIAL PILL (Marketly Style) */}
        {storeSettings.testimonial && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-spirit-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-accent-400 shadow-sm">
                <img
                  src={storeSettings.testimonial.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"}
                  alt={storeSettings.testimonial.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-serif font-bold text-spirit-900 text-sm">
                  {storeSettings.testimonial.author}
                </h4>
                <span className="text-[11px] text-accent-700 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3 text-accent-600" /> {storeSettings.testimonial.role || 'Verified Seeker'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 italic font-light text-center md:text-left flex-grow max-w-2xl">
              "{storeSettings.testimonial.quote}"
            </p>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-spirit-900" />
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="w-2 h-2 rounded-full bg-slate-300" />
            </div>
          </div>
        )}

        {/* 11. NEWSLETTER / EXCLUSIVE OFFERS (Marketly Style) */}
        <div className="bg-spirit-50 rounded-3xl p-6 sm:p-10 border border-spirit-200/80 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-spirit-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-spirit-900 text-lg sm:text-xl">
                {storeSettings.newsletter?.title || 'Get Exclusive Offers & Spiritual Updates'}
              </h3>
              <p className="text-xs text-slate-600 font-light mt-0.5">
                {storeSettings.newsletter?.subtitle || 'Join our newsletter and receive special blessings and discounts on sacred essentials.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              placeholder={storeSettings.newsletter?.placeholder || "Enter your email address..."}
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="px-5 py-3 rounded-full bg-white border border-slate-200 focus:border-accent-500 outline-none text-xs sm:text-sm w-full sm:w-72 shadow-inner"
            />
            <button
              type="submit"
              className="bg-spirit-900 hover:bg-accent-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shadow-md shrink-0"
            >
              {newsletterSubscribed ? 'Subscribed ✨' : (storeSettings.newsletter?.btnText || 'Subscribe')}
            </button>
          </form>
        </div>

      </div>

      {/* Dynamic Sections from Elementor Builder */}
      {pageSections.map((sec) => (
        <DynamicSection key={sec.id} section={sec} />
      ))}

      {/* REVEAL WRAPPED IMAGE MODAL */}
      {selectedRevealProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-spirit-950/80 backdrop-blur-md" 
            onClick={() => setSelectedRevealProduct(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-spirit-100 z-10 animate-scale-up">
            <div className="bg-gradient-to-br from-spirit-900 to-accent-950 p-6 text-center text-white relative">
              <button 
                onClick={() => setSelectedRevealProduct(null)} 
                className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition"
              >
                <X size={16} />
              </button>
              <div className="w-12 h-12 rounded-full bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mx-auto mb-3 text-accent-400">
                <Lock size={20} className="animate-pulse" />
              </div>
              <h3 className="font-serif font-bold text-base uppercase tracking-wide text-white">
                Premium Image Wrapped
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 font-sans">
                The original high-resolution scan remains protected
              </p>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden shadow-md border border-slate-100 relative bg-slate-50">
                <img 
                  src={selectedRevealProduct.image} 
                  alt={selectedRevealProduct.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-spirit-900 text-sm">{selectedRevealProduct.name}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  To protect the authentic spiritual properties, this image is partially covered.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setSelectedRevealProduct(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
              >
                Close
              </button>
              <Link
                to={`/product/${selectedRevealProduct.id}`}
                onClick={() => setSelectedRevealProduct(null)}
                className="flex-1 bg-spirit-900 text-white py-2 text-xs font-bold rounded-xl text-center hover:bg-accent-600 transition shadow-sm"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;
