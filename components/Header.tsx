
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Sun, ShoppingCart, User as UserIcon, LogOut, Package, 
  ChevronDown, ArrowDown, ArrowUp, Sparkles, Moon, BookOpen, 
  Compass, Shield, Flame, Heart, Lock, Key, Crosshair, Star, 
  CheckCircle, ArrowRight, Layers
} from 'lucide-react';
import DailyDuaa from './DailyDuaa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  getStoredServiceCategories, 
  getStoredServices, 
  ServiceItem, 
  ServiceCategoryItem 
} from '../data/servicesData';

const renderSpiritualIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Moon': return <Moon size={18} className="text-spirit-700" />;
    case 'BookOpen': return <BookOpen size={18} className="text-spirit-700" />;
    case 'Compass': return <Compass size={18} className="text-spirit-700" />;
    case 'Shield': return <Shield size={18} className="text-spirit-700" />;
    case 'Flame': return <Flame size={18} className="text-spirit-700" />;
    case 'Heart': return <Heart size={18} className="text-spirit-700" />;
    case 'Lock': return <Lock size={18} className="text-spirit-700" />;
    case 'Key': return <Key size={18} className="text-spirit-700" />;
    case 'Crosshair': return <Crosshair size={18} className="text-spirit-700" />;
    case 'Star': return <Star size={18} className="text-spirit-700" />;
    case 'Sun': return <Sun size={18} className="text-spirit-700" />;
    default: return <Sparkles size={18} className="text-spirit-700" />;
  }
};

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryItem[]>([]);
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [activeServicesTab, setActiveServicesTab] = useState<'services' | 'categories'>('services');
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  
  const servicesMenuRef = useRef<HTMLDivElement>(null);

  const scrollServicesMenu = (direction: 'up' | 'down') => {
    if (servicesMenuRef.current) {
        const scrollAmount = 250;
        servicesMenuRef.current.scrollBy({ top: direction === 'down' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchServicesData = async () => {
    // 1. Fetch Categories
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setServiceCategories(data.map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description || '',
            imageUrl: c.image_url || '',
            relatedProducts: c.related_products || [],
            relatedArticles: c.related_articles || [],
            createdAt: c.created_at || new Date().toISOString()
        })));
      } else {
        setServiceCategories(getStoredServiceCategories());
      }
    } catch {
      setServiceCategories(getStoredServiceCategories());
    }

    // 2. Fetch Services
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setServicesList(data.map((s: any) => ({
          id: s.id,
          title: s.title,
          slug: s.slug || '',
          description: s.description || '',
          content: s.content || '',
          category: s.category || '',
          categoryId: s.category_id || '',
          icon: s.icon || 'Sparkles',
          imageUrl: s.image_url || '',
          price: s.price || 'Free Consultation',
          duration: s.duration || '24 Hours',
          features: s.features || [],
          status: s.status || 'active',
          createdAt: s.created_at || new Date().toISOString()
        })));
      } else {
        setServicesList(getStoredServices());
      }
    } catch {
      setServicesList(getStoredServices());
    }
  };

  useEffect(() => {
    fetchServicesData();

    const handleSync = () => {
      fetchServicesData();
    };

    window.addEventListener('services-updated', handleSync);
    window.addEventListener('categories-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('services-updated', handleSync);
      window.removeEventListener('categories-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const toggleServicesMenu = () => {
    const newState = !servicesMenuOpen;
    setServicesMenuOpen(newState);
    if (newState) {
      fetchServicesData();
    }
  };

  const navLinks = [
    { label: 'About', path: '/#about' },
    { label: 'Services', path: '/#services' },
    { label: 'Products', path: '/store' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Blog', path: '/blog' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#')) {
      const hash = path.substring(1); 
      const id = hash.substring(1);   

      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (id === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
    setIsOpen(false);
    setServicesMenuOpen(false);
  };

  useEffect(() => {
    setServicesMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="fixed w-full z-50 flex flex-col transition-all duration-300">
      {/* Primary Navigation Bar */}
      <header 
        className={`relative z-[60] w-full transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/98 backdrop-blur-md shadow-lg py-1 md:py-2 border-slate-100' 
            : 'bg-spirit-900/85 backdrop-blur-md py-2 md:py-4 border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" onClick={(e) => handleNavClick(e, '/#top')} className="flex items-center group">
              <img src="https://res.cloudinary.com/dq0ccjs6y/image/upload/v1770399481/Jaadu_Ki-removebg-preview_wnzo57.png" alt="Jaadu ki kaat Logo" className={`transition-all duration-300 ${scrolled ? 'h-12 md:h-20 -my-2 md:-my-4 invert' : 'h-16 md:h-24 -my-2 md:-my-4'}`} />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <nav className="flex items-center space-x-1 lg:space-x-2">
                {navLinks.map((link) => {
                  const isHashLink = link.path.startsWith('/#');
                  const hash = isHashLink ? link.path.substring(1) : '';
                  
                  // Active state logic
                  let isActive = false;
                  if (isHashLink) {
                    if (location.pathname === '/' && location.hash === hash) {
                      isActive = true;
                    }
                  } else {
                    isActive = location.pathname.startsWith(link.path);
                  }

                  return (
                  <div key={link.label} className="relative group/nav">
                    {link.label === 'Services' ? (
                      <button
                        onClick={toggleServicesMenu}
                        className={`text-[11px] lg:text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg border ${
                          isActive || location.pathname.startsWith('/service')
                            ? (scrolled ? 'bg-spirit-50 border-spirit-200 text-accent-700 shadow-sm' : 'bg-white/15 border-white/20 text-white shadow-sm')
                            : (scrolled ? 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-accent-600' : 'border-transparent text-white/80 hover:bg-white/10 hover:text-white drop-shadow-sm')
                        }`}
                      >
                        {link.label}
                        <ChevronDown size={14} className={`ml-1 transition-transform ${servicesMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <Link
                        to={link.path}
                        onClick={(e) => handleNavClick(e, link.path)}
                        className={`text-[11px] lg:text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg border ${
                          isActive
                            ? (scrolled ? 'bg-spirit-50 border-spirit-200 text-accent-700 shadow-sm' : 'bg-white/15 border-white/20 text-white shadow-sm')
                            : (scrolled ? 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-accent-600' : 'border-transparent text-white/80 hover:bg-white/10 hover:text-white drop-shadow-sm')
                        }`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                )})}
              </nav>

              <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                  {/* Cart Icon (Desktop) */}
                  <Link to="/cart" className={`relative p-2 transition-colors ${scrolled ? 'text-spirit-900 hover:text-accent-600' : 'text-white hover:text-accent-300'}`}>
                    <ShoppingCart size={24} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Auth Menu (Desktop) */}
                  {isAuthenticated && user ? (
                    <div className="relative">
                      <button 
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className={`flex items-center gap-2 font-bold text-sm transition-transform ${userMenuOpen ? 'scale-110' : ''} ${scrolled ? 'text-spirit-900' : 'text-white'}`}
                      >
                         <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white border-2 transition-colors ${userMenuOpen ? 'border-accent-300 bg-accent-600' : 'border-transparent bg-accent-500'}`}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                         </div>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {userMenuOpen && (
                         <>
                           <div className="fixed inset-0 z-[90]" onClick={() => setUserMenuOpen(false)} />
                           <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-fade-in z-[100] origin-top-right ring-1 ring-black/5">
                              <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                                 <p className="text-sm font-bold text-spirit-900 truncate">{user.name}</p>
                                 <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                              </div>
                              <div className="p-2">
                                <Link 
                                  to="/orders" 
                                  onClick={() => setUserMenuOpen(false)}
                                  className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-spirit-900 rounded-xl flex items-center gap-3 transition-colors font-medium mb-1"
                                >
                                   <Package size={16} /> 
                                   <span>My Orders</span>
                                </Link>
                                <Link 
                                  to="/cart" 
                                  onClick={() => setUserMenuOpen(false)}
                                  className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-spirit-900 rounded-xl flex items-center gap-3 transition-colors font-medium mb-1"
                                >
                                   <ShoppingCart size={16} /> 
                                   <span>Cart</span>
                                </Link>
                                <button 
                                  onClick={handleLogout}
                                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl flex items-center gap-3 transition-colors font-medium"
                                >
                                   <LogOut size={16} /> 
                                   <span>Sign Out</span>
                                </button>
                              </div>
                           </div>
                         </>
                      )}
                    </div>
                  ) : (
                    <Link 
                        to="/login"
                        className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border transition-all ${
                            scrolled 
                                ? 'border-spirit-900 text-spirit-900 hover:bg-spirit-900 hover:text-white' 
                                : 'border-white/30 text-white hover:bg-white hover:text-spirit-900'
                        }`}
                    >
                        Login
                    </Link>
                  )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-4">
               {/* Cart Icon (Mobile) */}
               <Link to="/cart" className={`relative p-2 transition-colors ${scrolled ? 'text-spirit-900' : 'text-white'}`}>
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button 
                className={`p-2 rounded-lg transition-colors ${
                  scrolled ? 'text-spirit-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-2xl border-t border-slate-100 animate-fade-in-up">
            <div className="flex flex-col py-8 px-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className="text-xl font-serif font-bold text-spirit-900 hover:text-accent-600 flex items-center justify-between group"
                >
                  {link.label}
                  <div className="w-2 h-2 rounded-full bg-accent-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              ))}
              
              <div className="border-t border-slate-100 pt-6 space-y-4">
                  <Link 
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-serif font-bold text-spirit-900 hover:text-accent-600 flex items-center justify-between group"
                  >
                    Shopping Cart
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-sans text-slate-500">({cartCount})</span>
                      <ShoppingCart size={20} />
                    </div>
                  </Link>

                  {isAuthenticated && user ? (
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                           </div>
                           <div>
                               <p className="font-bold text-spirit-900">{user.name}</p>
                               <p className="text-xs text-slate-500">Logged In</p>
                           </div>
                        </div>
                        <Link to="/orders" onClick={() => setIsOpen(false)} className="text-spirit-600 font-bold flex items-center gap-2"><Package size={18}/> My Orders</Link>
                        <button onClick={handleLogout} className="text-red-500 font-bold text-sm text-left flex items-center gap-2"><LogOut size={18}/> Logout</button>
                     </div>
                  ) : (
                    <Link 
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-center bg-spirit-900 text-white font-bold py-3 rounded-xl"
                    >
                        Login / Sign Up
                    </Link>
                  )}
              </div>
            </div>
          </div>
        )}
        {/* Services Full Width Mega Menu */}
        {servicesMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-slate-100 z-[80] animate-fade-in origin-top">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-6 relative flex flex-col">
              <button 
                onClick={() => setServicesMenuOpen(false)}
                className="absolute top-5 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-spirit-900 transition-colors z-[90]"
                aria-label="Close services menu"
              >
                <X size={22} />
              </button>
              
              {/* Mega-menu Header with Tabs and Quick Link */}
              <div className="mb-5 border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pr-10">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-spirit-950 flex items-center gap-2">
                    <span>Our Spiritual Services</span>
                    <span className="text-xs bg-accent-100 text-accent-800 font-sans font-bold px-2.5 py-0.5 rounded-full">
                      {servicesList.length} Offerings
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Explore verified Quranic consultations, authentic Istikhara, and personalized spiritual remedies
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Tabs */}
                  <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveServicesTab('services')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeServicesTab === 'services'
                          ? 'bg-white text-spirit-950 shadow-xs'
                          : 'text-slate-600 hover:text-spirit-900'
                      }`}
                    >
                      <Sparkles size={14} className={activeServicesTab === 'services' ? 'text-accent-600' : ''} />
                      <span>Services ({servicesList.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveServicesTab('categories')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeServicesTab === 'categories'
                          ? 'bg-white text-spirit-950 shadow-xs'
                          : 'text-slate-600 hover:text-spirit-900'
                      }`}
                    >
                      <Layers size={14} className={activeServicesTab === 'categories' ? 'text-accent-600' : ''} />
                      <span>Categories ({serviceCategories.length})</span>
                    </button>
                  </div>

                  {/* Link to full Services Page */}
                  <Link
                    to="/services"
                    onClick={() => setServicesMenuOpen(false)}
                    className="text-xs font-bold text-accent-800 bg-accent-50 hover:bg-accent-100 border border-accent-200 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1"
                  >
                    <span>View All Services</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Scrollable Container */}
              <div className="relative">
                <div 
                  ref={servicesMenuRef} 
                  className="max-h-[55vh] overflow-y-auto hide-scrollbar scroll-smooth pr-14" 
                  style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                >
                  {activeServicesTab === 'services' ? (
                    servicesList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                        {servicesList.map((service) => (
                          <Link
                            key={service.id}
                            to="/services"
                            onClick={() => setServicesMenuOpen(false)}
                            className="group flex flex-col justify-between bg-slate-50 hover:bg-spirit-50/70 rounded-2xl p-4 transition-all duration-200 hover:shadow-md border border-slate-100 hover:border-spirit-200 text-left"
                          >
                            <div>
                              {service.imageUrl && (
                                <div className="w-full h-24 rounded-xl overflow-hidden mb-3 bg-slate-200">
                                  <img
                                    src={service.imageUrl}
                                    alt={service.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-2 mb-2.5">
                                <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-spirit-100 border border-slate-200/70 group-hover:border-spirit-300 flex items-center justify-center transition shadow-2xs shrink-0">
                                  {renderSpiritualIcon(service.icon)}
                                </div>
                                <span className="text-[10px] font-bold text-spirit-700 bg-spirit-100/70 group-hover:bg-spirit-200/70 px-2 py-0.5 rounded-full line-clamp-1 max-w-[140px]">
                                  {service.category || 'Spiritual Remedy'}
                                </span>
                              </div>

                              <h3 className="font-serif font-bold text-sm text-spirit-950 group-hover:text-accent-700 transition line-clamp-1">
                                {service.title}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {service.description}
                              </p>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-spirit-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/50">
                                {service.price || 'Free Consultation'}
                              </span>
                              <span className="text-accent-700 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                <span>Consult</span>
                                <ArrowRight size={12} />
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Sparkles size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold">No services loaded yet.</p>
                      </div>
                    )
                  ) : (
                    serviceCategories.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                        {serviceCategories.map((category) => (
                          <Link
                            key={category.id}
                            to={`/service-category/${category.id}`}
                            onClick={() => setServicesMenuOpen(false)}
                            className="group flex flex-col items-center bg-slate-50 rounded-2xl p-4 transition-all hover:bg-spirit-50 hover:shadow-md border border-slate-100 hover:border-spirit-200"
                          >
                            {category.imageUrl ? (
                              <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-slate-200">
                                <img 
                                  src={category.imageUrl} 
                                  alt={category.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                              </div>
                            ) : (
                              <div className="w-full h-28 rounded-xl mb-3 bg-spirit-100 flex items-center justify-center text-spirit-400">
                                <Package size={36} />
                              </div>
                            )}
                            <h3 className="font-serif font-bold text-sm text-spirit-950 group-hover:text-accent-700 transition text-center">
                              {category.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 text-center">
                              {category.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Package size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold">No service categories available at the moment.</p>
                      </div>
                    )
                  )}
                </div>
                
                {/* Internal Scroll Buttons */}
                {((activeServicesTab === 'services' && servicesList.length > 8) || 
                  (activeServicesTab === 'categories' && serviceCategories.length > 4)) && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 py-3 bg-white/95 backdrop-blur-sm px-1.5 rounded-xl shadow-lg border border-slate-100">
                    <button 
                      onClick={() => scrollServicesMenu('up')}
                      className="p-1.5 transition-all hover:scale-110 active:scale-95 text-slate-400 hover:text-spirit-900 border border-transparent hover:border-slate-200 rounded-full cursor-pointer"
                      aria-label="Scroll Up"
                    >
                      <ArrowUp size={20} />
                    </button>
                    <div className="w-full h-[1px] bg-slate-100"></div>
                    <button 
                      onClick={() => scrollServicesMenu('down')}
                      className="p-1.5 transition-all hover:scale-110 active:scale-95 text-slate-400 hover:text-spirit-900 border border-transparent hover:border-slate-200 rounded-full cursor-pointer"
                      aria-label="Scroll Down"
                    >
                      <ArrowDown size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Daily Duaa Bar */}
      <div className="w-full">
        <DailyDuaa />
      </div>
    </div>
  );
};

export default Header;
