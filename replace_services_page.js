const fs = require('fs');

const content = fs.readFileSync('pages/ServicesPage.tsx', 'utf8');

// Extract the services array
const servicesMatch = content.match(/const services = \[([\s\S]*?)\];/);
const servicesString = servicesMatch ? servicesMatch[0] : '';

// Generate new file content
const newContent = `import React, { useState, useEffect } from 'react';
import { 
  Brain, ShieldAlert, Activity, Zap, HeartCrack, Wind, Mountain, 
  Cloud, Heart, Lock, CircleX, FileSignature, Image, TriangleAlert, Frown, Sparkles, ArrowRight,
  Moon, BookOpen, Compass, ShieldCheck, Briefcase, FileText, X, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { submitToGoogleSheet } from "../services/sheetService";

const ServicesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [consultService, setConsultService] = useState("");

  const [consultName, setConsultName] = useState("");
  const [consultMotherName, setConsultMotherName] = useState("");
  const [consultDob, setConsultDob] = useState("");
  const [consultPhone, setConsultPhone] = useState("");
  const [consultEmail, setConsultEmail] = useState("");
  const [consultCity, setConsultCity] = useState("");
  const [consultCountry, setConsultCountry] = useState("");
  const [consultPurpose, setConsultPurpose] = useState("");
  const [consultMessage, setConsultMessage] = useState("");
  const [isConsultSubmitting, setIsConsultSubmitting] = useState(false);

  const openConsultModal = (serviceName: string) => {
    setConsultService(serviceName);
    setIsConsultModalOpen(true);
  };

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);

    const payload = {
      "Full Name": consultName,
      "Mother's Name": consultMotherName,
      "Date of Birth": consultDob,
      "Phone Number": consultPhone,
      "Email Address": consultEmail,
      City: consultCity,
      Country: consultCountry,
      Purpose: consultPurpose,
      "Requesting Service": consultService,
      Message: consultMessage,
    };

    const targetSheet = consultService || "Consultations";
    await submitToGoogleSheet(targetSheet, payload);

    setIsConsultSubmitting(false);
    setIsConsultModalOpen(false);
    setIsSuccessModalOpen(true);

    setConsultName("");
    setConsultMotherName("");
    setConsultDob("");
    setConsultPhone("");
    setConsultEmail("");
    setConsultCity("");
    setConsultCountry("");
    setConsultPurpose("");
    setConsultMessage("");
  };

  ${servicesString}

  return (
    <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 relative overflow-hidden">
      {/* Decorative circle on left */}
      <div className="absolute left-0 top-1/3 w-48 h-96 bg-accent-100/50 rounded-r-full z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24 animate-fade-in pt-12">
          <span className="text-accent-600 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Our Services</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-spirit-900 mb-8 relative inline-block">
            Spiritual Solutions
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-accent-500 rounded-full shadow-lg"></div>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mt-10 font-light">
            We provide specialized spiritual remedies (Rohani Ilaj) for a wide spectrum of afflictions. 
            Whatever burden your soul carries, we have a guided path to restoration.
          </p>
        </div>

        {/* Services Grid (Matches Home design) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 gap-y-16 mb-24">
          {services.map((service, index) => (
            <div
              key={index}
              onClick={() => openConsultModal(service.title)}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                {/* Outer Rotating Solid Border */}
                <div className="absolute -inset-2 rounded-full border-[3px] border-transparent group-hover:border-accent-500 group-hover:border-t-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-[spin_2s_linear_infinite] pointer-events-none"></div>

                {/* Scalable Inner Section */}
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-90 flex items-center justify-center">
                  {/* Middle Static Circle */}
                  <div className="absolute inset-0 rounded-full border-[3px] border-accent-200 pointer-events-none transition-colors duration-500 group-hover:border-transparent"></div>

                  {/* Inner Circle (Fills on hover) */}
                  <div className="absolute inset-[3px] rounded-full flex items-center justify-center bg-transparent group-hover:bg-accent-500 transition-colors duration-500">
                    <service.icon className="w-10 h-10 text-spirit-900 group-hover:text-white transition-colors duration-500 relative z-10" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-spirit-900 mb-3 group-hover:text-accent-600 transition-colors">
                {service.title}
              </h3>
              
              {/* Description */}
              <p className="text-slate-500 text-sm leading-relaxed max-w-[220px] mb-6 flex-grow">
                {service.desc}
              </p>

              {/* Request Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openConsultModal(service.title);
                }}
                className="mt-auto px-6 py-2.5 rounded-full border border-accent-200 text-spirit-900 font-semibold text-sm transition-all duration-300 hover:bg-accent-500 hover:text-white hover:border-accent-500 group-hover:border-accent-500"
              >
                Request For {service.title}
              </button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-spirit-900 rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl mx-auto max-w-6xl border border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">Unsure which path to choose?</h2>
            <p className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Spiritual matters are nuanced and personal. Contact us for a free analysis, and we will listen to your situation with absolute compassion.
            </p>
            <button onClick={() => openConsultModal("General Inquiry")} className="inline-flex items-center bg-accent-500 text-white font-bold py-5 px-12 rounded-full hover:bg-accent-600 transition transform hover:scale-105 shadow-[0_20px_50px_rgba(99,102,241,0.4)] text-lg group">
              <Sparkles className="w-6 h-6 mr-3 text-white group-hover:rotate-12 transition-transform" />
              Book Free Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      {isConsultModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in overflow-hidden">
          <div
            className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm"
            onClick={() => setIsConsultModalOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-fade-in-up border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-spirit-900 px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-serif font-bold text-white flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-accent-500" />{" "}
                  Consultation Request
                </h3>
                {consultService && (
                  <p className="text-xs text-slate-300 mt-1">
                    Service: {consultService}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsConsultModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={consultName}
                  onChange={(e) => setConsultName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Mother's Name"
                  value={consultMotherName}
                  onChange={(e) => setConsultMotherName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="date"
                  required
                  placeholder="Date of Birth"
                  value={consultDob}
                  onChange={(e) => setConsultDob(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-600"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={consultPhone}
                  onChange={(e) => setConsultPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={consultEmail}
                  onChange={(e) => setConsultEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={consultCity}
                    onChange={(e) => setConsultCity(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Country"
                    value={consultCountry}
                    onChange={(e) => setConsultCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="Purpose of Consultation"
                  value={consultPurpose}
                  onChange={(e) => setConsultPurpose(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />

                <textarea
                  required
                  rows={4}
                  placeholder="Briefly describe your situation..."
                  value={consultMessage}
                  onChange={(e) => setConsultMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                ></textarea>

                <button
                  type="submit"
                  disabled={isConsultSubmitting}
                  className="w-full bg-spirit-900 text-white font-bold py-4 rounded-xl hover:bg-accent-600 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg"
                >
                  {isConsultSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Submit Request <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-spirit-900/60 backdrop-blur-sm"
            onClick={() => setIsSuccessModalOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl text-center animate-scale-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-spirit-900 mb-2">
              Request Received
            </h3>
            <p className="text-slate-600 mb-8">
              We have received your request. A spiritual advisor will contact you soon.
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full bg-spirit-900 text-white font-bold py-4 rounded-xl hover:bg-accent-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
`;

fs.writeFileSync('pages/ServicesPage.tsx', newContent);
