import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { submitToGoogleSheet } from '../services/sheetService';

export const ContactPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    agreePrivacy: true,
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, agreePrivacy: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in all required fields.');
      setStatus('error');
      return;
    }

    if (!formData.agreePrivacy) {
      setErrorMessage('Please agree to the privacy policy to continue.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await submitToGoogleSheet('Contact', {
        'Full Name': formData.name.trim(),
        'Email Address': formData.email.trim(),
        'Subject': formData.subject.trim() || 'General Inquiry',
        'Message': formData.message.trim(),
        'Requesting Service': 'Contact Page Form',
      });

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        agreePrivacy: true,
      });
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again or reach us directly via WhatsApp.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
      
      {/* Top Announcement Bar */}
      <div className="bg-spirit-950 text-emerald-300 py-2.5 px-4 text-center text-xs sm:text-sm font-medium border-b border-emerald-900/40 flex items-center justify-center gap-2">
        <Globe className="w-3.5 h-3.5 text-accent-400 shrink-0" />
        <span>
          Spiritual consultations, Rohani Ilaj & Istikhara guidance available worldwide.{' '}
          <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-accent-300 font-bold ml-1">
            Connect via WhatsApp
          </a>
        </span>
      </div>

      {/* Hero Section with Diagonal Angled Divider in Deep Sanctuary Green */}
      <div 
        className="relative bg-spirit-900 text-white pt-16 sm:pt-20 pb-32 sm:pb-40 lg:pb-44 overflow-hidden"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 100%)',
        }}
      >
        {/* Subtle Islamic Ambient Glows */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-accent-500/15 rounded-full blur-[130px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            <span>Confidential & Compassionate Guidance</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white mb-6 max-w-3xl mx-auto">
            Feel free to get in touch
          </h1>
          
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            With years of authentic spiritual experience, we deliver sincere counsel, Istikhara analysis, and healing without hidden obligations or compromises.
          </p>
        </div>
      </div>

      {/* Main Content: Overlapping Form Card (Left) + Contact Info & Socials (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Overlapping Floating Card with Form (pulls up into dark hero) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100/80 -mt-24 sm:-mt-32 lg:-mt-44 relative z-20">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-spirit-900 tracking-tight">
                Leave your message
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Fill out the form below and our spiritual mentors will respond promptly.
              </p>
            </div>

            {status === 'success' && (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Message Received (JazakAllah Khair)</h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Your inquiry has been submitted securely. One of our counselors will review your message with absolute privacy.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMessage || 'Something went wrong. Please check your details and try again.'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Email in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-spirit-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-spirit-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject (e.g. Istikhara, Rohani Consultation, General)"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-spirit-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition-all text-sm"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share details of your situation or question..."
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-spirit-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition-all text-sm resize-none"
                />
              </div>

              {/* Privacy Policy Checkbox + Send Message Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreePrivacy}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    I agree to the <a href="/#/privacy" className="text-accent-700 underline hover:text-accent-800">privacy policy</a>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-accent-600 hover:bg-accent-500 text-white font-bold text-sm shadow-lg shadow-accent-600/30 hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Contact Details + 4 Info Cards + Social Media */}
          <div className="lg:col-span-6 pt-4 sm:pt-6 lg:pt-10 flex flex-col justify-center">
            
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-spirit-900 tracking-tight mb-4">
                Don't hesitate to contact us
              </h2>
              <p className="text-slate-600 text-base leading-relaxed font-light">
                Our spiritual sanctuary provides a safe, welcoming space. Whether you are dealing with unexplained spiritual distress, family difficulties, or seeking Istikhara for life decisions, we are here with sincere advice.
              </p>
            </div>

            {/* 4 Cards Grid (2x2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
              
              {/* 1. Office */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-accent-500/40 transition-all flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-accent-500/15 text-accent-600 flex items-center justify-center shrink-0 group-hover:bg-accent-600 group-hover:text-white transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-spirit-900">Office</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Main Spiritual Sanctuary, Lahore, Pakistan
                  </p>
                </div>
              </div>

              {/* 2. Phone */}
              <a 
                href="tel:+923001234567"
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-accent-500/40 transition-all flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-spirit-900">Phone</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium group-hover:text-accent-600 transition-colors">
                    +92 300 1234567
                  </p>
                </div>
              </a>

              {/* 3. Work Hours */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-accent-500/40 transition-all flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-spirit-900">Work Hours</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Everyday 09:00 AM – 10:00 PM (PKT)
                  </p>
                </div>
              </div>

              {/* 4. Email */}
              <a 
                href="mailto:Info@jaadukikaat.com"
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-accent-500/40 transition-all flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-spirit-900">Email</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium truncate max-w-[160px] group-hover:text-accent-600 transition-colors">
                    Info@jaadukikaat.com
                  </p>
                </div>
              </a>

            </div>

            {/* Social Media Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="font-bold text-spirit-900 text-sm mr-2">
                Social Media :
              </span>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-accent-500/10 hover:bg-accent-600 text-spirit-900 hover:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full bg-accent-500/10 hover:bg-accent-600 text-spirit-900 hover:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-accent-500/10 hover:bg-accent-600 text-spirit-900 hover:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full bg-accent-500/10 hover:bg-accent-600 text-spirit-900 hover:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-emerald-500/15 hover:bg-emerald-600 text-emerald-800 hover:text-white transition-all flex items-center justify-center shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Dark CTA Section with Opposite Diagonal Angle (Higher on left, sloping down to right) */}
      <div 
        className="bg-spirit-900 text-white pt-24 sm:pt-28 pb-20 sm:pb-24 relative overflow-hidden"
        style={{
          clipPath: 'polygon(0 0, 100% 80px, 100% 100%, 0 100%)',
        }}
      >
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-accent-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-4 h-4 text-accent-400" />
            <span>We Are Ready 24 Hours</span>
          </div>

          <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 tracking-tight">
            Have a spiritual concern? Let's Talk
          </h3>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-10 font-light">
            Speak directly with our dedicated scholars and experienced healers for confidential, authentic Quranic solutions.
          </p>

          <a
            href="tel:+923001234567"
            className="inline-flex items-center gap-4 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-accent-600 hover:bg-accent-500 text-white font-bold text-lg sm:text-xl shadow-[0_10px_35px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_45px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105 active:scale-95 group"
          >
            <span>+92 300 1234567</span>
            <div className="w-10 h-10 rounded-full bg-white text-spirit-900 flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
              <Phone className="w-5 h-5 fill-current text-spirit-900" />
            </div>
          </a>

        </div>
      </div>

    </div>
  );
};

export default ContactPage;
