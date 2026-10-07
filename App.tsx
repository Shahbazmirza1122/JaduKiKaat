
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPostPage from './pages/BlogPostPage';
import ServicesPage from './pages/ServicesPage';
import ServiceCategoryPage from './pages/ServiceCategoryPage';
import Admin from './pages/Admin';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import StorePage from './pages/StorePage';
import OrdersPage from './pages/OrdersPage';
import ContactPage from './pages/ContactPage';
import DynamicCustomPage from './pages/DynamicCustomPage';
import QuranPage from './pages/QuranPage';
import IslamicStoriesPage from './pages/IslamicStoriesPage';
import IslamicStoryDetailPage from './pages/IslamicStoryDetailPage';
import LearnToPrayPage from './pages/LearnToPrayPage';
import HadithPage from './pages/HadithPage';
import HadithBookPage from './pages/HadithBookPage';
import HadithSectionPage from './pages/HadithSectionPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Wrapper to conditionally hide header/footer on admin and login pages
const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  // const isLogin = location.pathname === '/login'; // Optional: if you want to hide header on login

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {!isAdmin && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/service-category/:id" element={<ServiceCategoryPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quran" element={<QuranPage />} />
          <Route path="/learn-to-pray" element={<LearnToPrayPage />} />
          <Route path="/islamic-stories" element={<IslamicStoriesPage />} />
          <Route path="/islamic-stories/:slug" element={<IslamicStoryDetailPage />} />
          <Route path="/hadith" element={<HadithPage />} />
          <Route path="/hadith/:bookSlug" element={<HadithBookPage />} />
          <Route path="/hadith/:bookSlug/:sectionNumber" element={<HadithSectionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/p/:slug" element={<DynamicCustomPage />} />
          <Route path="/page/:slug" element={<DynamicCustomPage />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
