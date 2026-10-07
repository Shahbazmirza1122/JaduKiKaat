
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Star, Check, ShieldCheck, Truck, RotateCcw, Loader2, Tag, XCircle, Lock, Zap, ChevronRight } from 'lucide-react';
import { products as staticProducts, Product } from '../data/products';
import { 
  getStoreSettings, 
  StoreSettings, 
  syncStoreSettingsFromServer,
  ProductCountdown,
  ProductPageCountdownPosition,
  getNextPositionUp,
  getNextPositionDown,
  saveStoreSettings
} from '../data/storeSettings';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ProductCountdownTimer } from '../components/ProductCountdownTimer';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(getStoreSettings());
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { purchasedProductIds } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRevealModal, setShowRevealModal] = useState(false);

  useEffect(() => {
    syncStoreSettingsFromServer();
    const handleSettingsUpdate = () => {
      setStoreSettings(getStoreSettings());
    };
    window.addEventListener('store_settings_updated', handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);
    window.addEventListener('focus', handleSettingsUpdate);
    return () => {
      window.removeEventListener('store_settings_updated', handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
      window.removeEventListener('focus', handleSettingsUpdate);
    };
  }, []);

  const isPurchased = product ? purchasedProductIds.includes(String(product.id)) : false;
  const shouldBlur = product?.isBlurBeforeBuy && !isPurchased;
  const shouldWrap = product?.isWrapBeforeBuy && !isPurchased;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        // First check local products stored in localStorage
        const localProductsRaw = localStorage.getItem('sacred_store_products');
        let allProducts: Product[] = staticProducts;
        if (localProductsRaw) {
          try {
            const parsed = JSON.parse(localProductsRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              allProducts = parsed;
            }
          } catch (e) {}
        }

        const localFound = allProducts.find(p => String(p.id) === String(id));
        if (localFound) {
          setProduct(localFound);
          // Find related products in same category
          const related = allProducts
            .filter(p => p.category?.toLowerCase() === localFound.category?.toLowerCase() && String(p.id) !== String(localFound.id))
            .slice(0, 4);
          setRelatedProducts(related);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          // Fallback to static data
          const found = staticProducts.find(p => String(p.id) === String(id));
          if (found) {
            setProduct(found);
            const related = staticProducts
              .filter(p => p.category?.toLowerCase() === found.category?.toLowerCase() && String(p.id) !== String(found.id))
              .slice(0, 4);
            setRelatedProducts(related);
          } else {
            navigate('/store'); // Redirect if not found
          }
        } else {
          // Map DB columns to Product Type
          const dbProduct: Product = {
            id: data.id,
            name: data.name,
            price: data.price,
            image: data.image,
            category: data.category,
            description: data.description,
            sku: data.sku,
            salePrice: data.sale_price,
            saleStart: data.sale_start,
            saleEnd: data.sale_end,
            isOutOfStock: data.is_out_of_stock,
            isBlurBeforeBuy: data.is_blur_before_buy,
            isWrapBeforeBuy: data.is_wrap_before_buy
          };
          setProduct(dbProduct);
          const related = allProducts
            .filter(p => p.category?.toLowerCase() === dbProduct.category?.toLowerCase() && String(p.id) !== String(dbProduct.id))
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        // Fallback
        const found = staticProducts.find(p => String(p.id) === String(id));
        if (found) setProduct(found);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product && !product.isOutOfStock) {
      addToCart(product);
      console.warn(`${product.name} added to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (product && !product.isOutOfStock) {
        addToCart(product);
        // Navigate to cart with a state flag to open checkout immediately
        navigate('/cart', { state: { openCheckout: true } });
    }
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

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          {/* Back Button Skeleton */}
          <div className="h-6 w-32 bg-slate-100 rounded mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Skeleton */}
            <div className="space-y-6">
              <div className="aspect-square bg-slate-100 rounded-[2rem] border border-slate-50"></div>
            </div>

            {/* Details Skeleton */}
            <div className="flex flex-col">
              {/* Badges */}
              <div className="flex gap-2 mb-6">
                <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                <div className="h-6 w-24 bg-slate-100 rounded-full"></div>
              </div>
              
              {/* Title */}
              <div className="h-12 w-3/4 bg-slate-100 rounded-xl mb-6"></div>
              
              {/* Price & Rating */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-10 w-24 bg-slate-100 rounded-lg"></div>
                <div className="h-6 w-32 bg-slate-100 rounded-lg"></div>
              </div>

              {/* Description */}
              <div className="space-y-4 mb-8">
                <div className="h-4 w-full bg-slate-100 rounded"></div>
                <div className="h-4 w-full bg-slate-100 rounded"></div>
                <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
              </div>

              {/* Checklist */}
              <div className="space-y-4 mb-8">
                <div className="h-5 w-48 bg-slate-100 rounded"></div>
                <div className="h-5 w-48 bg-slate-100 rounded"></div>
                <div className="h-5 w-48 bg-slate-100 rounded"></div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="h-24 bg-slate-100 rounded-xl"></div>
                <div className="h-24 bg-slate-100 rounded-xl"></div>
                <div className="h-24 bg-slate-100 rounded-xl"></div>
              </div>

              {/* Buttons */}
              <div className="mt-auto flex flex-row gap-2 sm:gap-4">
                <div className="h-14 sm:h-16 flex-1 bg-slate-100 rounded-xl"></div>
                <div className="h-14 sm:h-16 flex-1 bg-slate-100 rounded-xl"></div>
                <div className="h-14 sm:h-16 w-14 sm:w-20 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const onSale = isSaleActive(product);
  const currentPrice = onSale ? product.salePrice : product.price;
  const categoryInfo = storeSettings.categories?.find(
    c => c.name.toLowerCase() === product.category?.toLowerCase()
  );

  // Check for active countdown timers for this product
  const activeCountdowns = (storeSettings.productCountdowns || []).filter(
    c => c.enabled && (String(c.productId) === String(product.id) || c.productId === 'all')
  );

  // Fallback: If no multi-product countdown matches, check legacy flashDeal
  const legacyFlashDealCountdown: ProductCountdown | null = 
    activeCountdowns.length === 0 && storeSettings.flashDeal?.enabled && 
    (String(storeSettings.flashDeal.productId) === String(product.id) || !storeSettings.flashDeal.productId)
      ? {
          id: 'legacy-flash-deal',
          productId: storeSettings.flashDeal.productId || String(product.id),
          enabled: storeSettings.flashDeal.enabled,
          title: storeSettings.flashDeal.customTitle || product.name,
          tag: storeSettings.flashDeal.tag || 'Flash Blessed Deal',
          discountPrice: storeSettings.flashDeal.customPrice || product.salePrice || product.price,
          originalPrice: storeSettings.flashDeal.customOriginalPrice || product.price,
          days: storeSettings.flashDeal.days || '02',
          hours: storeSettings.flashDeal.hours || '14',
          minutes: storeSettings.flashDeal.minutes || '38',
          seconds: storeSettings.flashDeal.seconds || '45',
          theme: 'amber',
          showOnProductPage: true,
          productPagePosition: 'above_cta',
          showOnStorePage: true,
        }
      : null;

  const displayCountdowns = activeCountdowns.length > 0 
    ? activeCountdowns 
    : (legacyFlashDealCountdown ? [legacyFlashDealCountdown] : []);

  const isAdmin = typeof window !== 'undefined' && (localStorage.getItem('sacred_admin_logged_in') === 'true' || window.location.search.includes('admin=true'));

  const handleMoveCountdown = (countdownId: string, direction: 'up' | 'down') => {
    let target = (storeSettings.productCountdowns || []).find(c => c.id === countdownId);
    let allCountdowns = [...(storeSettings.productCountdowns || [])];

    if (!target && countdownId === 'legacy-flash-deal' && legacyFlashDealCountdown) {
      target = { ...legacyFlashDealCountdown, id: `cd-${Date.now()}` };
      allCountdowns.push(target);
    }

    if (!target) return;

    const newPos = direction === 'up' 
      ? getNextPositionUp(target.productPagePosition) 
      : getNextPositionDown(target.productPagePosition);

    const updatedList = allCountdowns.map(c => 
      c.id === target?.id ? { ...c, productPagePosition: newPos } : c
    );

    const updatedSettings: StoreSettings = {
      ...storeSettings,
      productCountdowns: updatedList,
    };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
  };

  const renderCountdownAt = (pos: ProductPageCountdownPosition) => {
    const matching = displayCountdowns.filter(c => c.productPagePosition === pos && c.showOnProductPage !== false);
    if (matching.length === 0) return null;

    return (
      <div className="my-2">
        {matching.map(cd => (
          <ProductCountdownTimer
            key={cd.id}
            countdown={cd}
            product={product}
            position={pos}
            isAdmin={isAdmin}
            onMoveUp={() => handleMoveCountdown(cd.id, 'up')}
            onMoveDown={() => handleMoveCountdown(cd.id, 'down')}
            onBuyNowClick={handleBuyNow}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 1: Top of Page Full-Width Header Banner */}
        {renderCountdownAt('top_banner')}

        {/* Top Breadcrumbs & Back Navigation with Category Picture */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <Link to="/store" className="hover:text-spirit-900 transition-colors">Store</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link 
              to={`/store?category=${encodeURIComponent(product.category)}`}
              className="hover:text-spirit-900 transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
            >
              {categoryInfo?.image && (
                <img src={categoryInfo.image} alt={product.category} className="w-4 h-4 rounded-full object-cover" />
              )}
              <span className="font-semibold text-spirit-900">{product.category}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 truncate max-w-[180px] sm:max-w-[300px]">{product.name}</span>
          </div>

          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-spirit-900 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1.5" /> Back to Store
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery Side */}
          <div className="space-y-6">
            <div className="aspect-square bg-spirit-50 rounded-[2rem] overflow-hidden shadow-lg border border-spirit-100 relative group">
              <img 
                src={product.image} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-transform duration-700 
                    ${product.isOutOfStock ? 'grayscale opacity-60' : 'hover:scale-105'}
                    ${shouldBlur ? 'blur-xl scale-110' : ''}
                `}
                style={shouldWrap ? { clipPath: 'polygon(0 0, 100% 0, 100% 35%, 35% 100%, 0 100%)' } : undefined}
              />
               
               {/* Wrap Overlay (Top-Left diagonal shroud) */}
               {shouldWrap && !product.isOutOfStock && (
                    <div 
                        className="absolute inset-0 z-20 cursor-pointer group/wrap-cover pointer-events-auto"
                        onClick={() => setShowRevealModal(true)}
                    >
                        <div 
                            className="absolute inset-0 bg-amber-950/40 pointer-events-none"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 35%, 35% 100%, 0 100%)' }}
                        />
                        <div className="absolute top-6 left-6 bg-amber-500/80 backdrop-blur-sm text-spirit-950 text-xs uppercase font-bold tracking-widest px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
                            <Lock size={14} className="animate-pulse" /> Premium Shrouded Artifact
                        </div>
                    </div>
               )}

               {/* Blur Overlay */}
               {shouldBlur && !product.isOutOfStock && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
                        <div className="bg-black/30 backdrop-blur-sm p-4 rounded-2xl border border-white/20 text-white shadow-2xl">
                            <Lock size={32} className="mx-auto mb-2 opacity-80" />
                            <p className="font-bold uppercase tracking-widest text-sm">Purchase to Unlock</p>
                            <p className="text-[10px] text-slate-200 mt-1">This item contains hidden spiritual content.</p>
                        </div>
                    </div>
               )}

               {product.isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-20">
                         <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-lg shadow-2xl transform rotate-[-5deg]">
                            Out of Stock
                         </div>
                    </div>
               )}
            </div>
          </div>

          {/* Product Details Side */}
          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-2">
               {/* Category Badge with updated category image */}
               <Link
                 to={`/store?category=${encodeURIComponent(product.category)}`}
                 className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-2xs group"
               >
                 {categoryInfo?.image && (
                   <img 
                     src={categoryInfo.image} 
                     alt={product.category} 
                     className="w-4 h-4 rounded-full object-cover group-hover:scale-110 transition-transform" 
                   />
                 )}
                 <span>{product.category}</span>
               </Link>

               {product.sku && (
                   <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                     SKU: {product.sku}
                   </span>
               )}
               {onSale && !product.isOutOfStock && (
                   <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                     <Tag size={12} /> On Sale
                   </span>
               )}
            </div>

            {/* Position 2: Above Title & Badges */}
            {renderCountdownAt('above_title')}
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              {onSale ? (
                  <div className="flex items-baseline gap-3">
                      <div className="text-3xl font-bold text-red-600">{currentPrice}</div>
                      <div className="text-xl text-slate-400 line-through">{product.price}</div>
                  </div>
              ) : (
                  <div className="text-3xl font-bold text-accent-600">{product.price}</div>
              )}
              
              <div className="flex items-center text-yellow-400 border-l border-slate-200 pl-4 ml-4">
                <Star className="fill-current w-5 h-5" />
                <Star className="fill-current w-5 h-5" />
                <Star className="fill-current w-5 h-5" />
                <Star className="fill-current w-5 h-5" />
                <Star className="fill-current w-5 h-5" />
                <span className="text-slate-400 text-sm ml-2 font-bold">(5.0)</span>
              </div>
            </div>

            {/* Position 3: Below Price & Rating */}
            {renderCountdownAt('below_price')}

            <div className="prose prose-lg text-slate-600 mb-8 font-light leading-relaxed">
              <p>{product.description || "Experience spiritual tranquility with this sacred item, curated to enhance your connection and bring peace to your daily life."}</p>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex items-center text-sm text-slate-600">
                  {product.isOutOfStock ? (
                      <span className="flex items-center text-red-600 font-bold"><XCircle className="w-5 h-5 mr-3" /> Currently Out of Stock</span>
                  ) : (
                      <span className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" /> In Stock & Ready to Ship</span>
                  )}
               </div>
               <div className="flex items-center text-sm text-slate-600">
                 <Check className="w-5 h-5 text-green-500 mr-3" /> Spiritually Cleansed
               </div>
               <div className="flex items-center text-sm text-slate-600">
                 <Check className="w-5 h-5 text-green-500 mr-3" /> Includes Usage Instructions
               </div>
            </div>

            {/* Features Icons - Moved and Animated */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-lg hover:bg-white hover:border-spirit-100 transition-all duration-300 transform hover:-translate-y-1 cursor-default group">
                <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-spirit-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide group-hover:text-spirit-600 transition-colors">Authentic</span>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-lg hover:bg-white hover:border-spirit-100 transition-all duration-300 transform hover:-translate-y-1 cursor-default group">
                <Truck className="w-6 h-6 mx-auto mb-2 text-spirit-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide group-hover:text-spirit-600 transition-colors">Worldwide</span>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-lg hover:bg-white hover:border-spirit-100 transition-all duration-300 transform hover:-translate-y-1 cursor-default group">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-spirit-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide group-hover:text-spirit-600 transition-colors">Returns</span>
              </div>
            </div>

            {/* Position 6: Below Description & Checklist */}
            {renderCountdownAt('below_description')}

            <div className="mt-auto space-y-4">
              {/* Position 4: Above CTA Buttons (High Urgency) */}
              {renderCountdownAt('above_cta')}

              <div className="flex flex-row gap-2 sm:gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={!!product.isOutOfStock}
                  className={`flex-1 font-bold py-3 px-3 sm:py-4 sm:px-6 rounded-xl shadow-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg transition-all ${product.isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-white border-2 border-spirit-900 text-spirit-900 hover:bg-spirit-50'}`}
                >
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" /> 
                  <span className="sm:hidden">Add</span>
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>
                
                <button 
                  onClick={handleBuyNow}
                  disabled={!!product.isOutOfStock}
                  className={`flex-1 font-bold py-3 px-3 sm:py-4 sm:px-6 rounded-xl shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg transition-all ${product.isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-accent-500 text-white hover:bg-accent-600 hover:shadow-2xl'}`}
                >
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> 
                  <span className="sm:hidden">Buy</span>
                  <span className="hidden sm:inline">Buy Now</span>
                </button>

                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`px-3 sm:px-6 rounded-xl border-2 flex items-center justify-center transition-colors ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-slate-200 text-slate-400 hover:border-red-400 hover:text-red-400'}`}
                >
                  <Heart className={`w-6 h-6 sm:w-8 sm:h-8 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Position 5: Below Action Buttons */}
              {renderCountdownAt('below_cta')}

              <p className="text-center text-xs text-slate-400">Secure Checkout • Satisfaction Guaranteed</p>
            </div>

          </div>
        </div>

        {/* Category Showcase & Related Collection Section */}
        {categoryInfo && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            {/* Category Banner Card */}
            <div className="group relative bg-gradient-to-r from-amber-50 via-white to-amber-50/40 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden mb-12">
              <div className="flex items-center gap-5 z-10 w-full md:w-auto">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md bg-slate-100">
                  <img 
                    src={categoryInfo.image} 
                    alt={categoryInfo.name} 
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" 
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                    <span>Category Collection</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-spirit-950">
                    {categoryInfo.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-light mt-0.5 max-w-md">
                    {categoryInfo.subtitle || `Explore blessed items curated for our ${categoryInfo.name} collection.`}
                  </p>
                </div>
              </div>

              <Link
                to={`/store?category=${encodeURIComponent(categoryInfo.name)}`}
                className="shrink-0 w-full md:w-auto text-center inline-flex items-center justify-center gap-2 bg-spirit-900 hover:bg-accent-600 text-white text-xs font-bold py-3 px-6 rounded-full transition-all shadow-sm z-10"
              >
                <span>Explore All {categoryInfo.name} Items</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Related Products in Category */}
            {relatedProducts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-spirit-900">
                      More From {product.category}
                    </h3>
                    <p className="text-xs text-slate-500 font-light mt-0.5">Complementary spiritual items in this category</p>
                  </div>
                  <Link
                    to={`/store?category=${encodeURIComponent(product.category)}`}
                    className="text-xs font-bold text-accent-700 hover:text-accent-800 flex items-center gap-1"
                  >
                    <span>View Collection</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {relatedProducts.map(rel => (
                    <Link
                      key={rel.id}
                      to={`/product/${rel.id}`}
                      className="group bg-white rounded-2xl p-3 border border-slate-100 shadow-xs hover:shadow-lg hover:border-accent-200 transition-all flex flex-col"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 relative">
                        <img 
                          src={rel.image} 
                          alt={rel.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <span className="text-[10px] font-bold text-accent-700 uppercase tracking-wider">{rel.category}</span>
                      <h4 className="font-serif font-bold text-sm text-spirit-900 group-hover:text-accent-600 transition-colors line-clamp-1 mt-0.5">
                        {rel.name}
                      </h4>
                      <div className="mt-auto pt-2 flex items-baseline gap-2">
                        <span className="font-bold text-sm text-spirit-900">{rel.salePrice || rel.price}</span>
                        {rel.salePrice && <span className="text-xs text-slate-400 line-through">{rel.price}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Position 7: Bottom of Product Page */}
        {renderCountdownAt('bottom_page')}
      </div>

      {/* REVEAL WRAPPED IMAGE MODAL */}
      {showRevealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
              className="absolute inset-0 bg-spirit-950/80 backdrop-blur-md" 
              onClick={() => setShowRevealModal(false)}
          />
          <div className="relative bg-white rounded-[2rem] max-w-sm w-full overflow-hidden shadow-2xl border border-spirit-100 z-10 animate-scale-up">
            {/* Top header banner in modal with gold design */}
            <div className="bg-gradient-to-br from-spirit-900 to-amber-950 p-6 text-center text-white relative">
              <button 
                onClick={() => setShowRevealModal(false)} 
                className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition"
              >
                <XCircle size={16} />
              </button>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400">
                <Lock size={20} className="animate-pulse" />
              </div>
              <h3 className="font-serif font-bold text-lg uppercase tracking-wide text-amber-100">Premium Image Wrapped</h3>
              <p className="text-[10px] text-slate-300 mt-1 font-sans">The original high-resolution physical item remains covered</p>
            </div>
            
            {/* Product Preview Body */}
            <div className="p-6 text-center space-y-4">
              <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden shadow-lg border border-slate-100 relative bg-slate-50">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 10%, 10% 100%, 0 100%)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-spirit-950 to-amber-950/80" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 10%, 10% 100%, 0 100%)' }} />
                <div className="absolute right-2 bottom-2 bg-amber-500 text-spirit-950 p-1 rounded-full"><Lock size={12} /></div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-gray-800 uppercase tracking-wider text-xs">{product.name}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                  To preserve the sacred and pristine energetic properties of this premium article, its high-definition digital representation is diagonally shrouded.
                </p>
                <p className="text-[11px] text-spirit-800 font-bold bg-spirit-50 py-2 px-3 rounded-lg border border-spirit-100 inline-block font-mono">
                  🔒 Buy this product to view/unlock the full image.
                </p>
              </div>
            </div>
            
            {/* Buy / Close Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setShowRevealModal(false)}
                className="flex-1 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowRevealModal(false);
                  handleBuyNow();
                }}
                className="flex-1 bg-spirit-900 text-white py-2 text-xs font-bold rounded-lg text-center hover:bg-spirit-800 transition shadow-md"
              >
                Buy This Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
