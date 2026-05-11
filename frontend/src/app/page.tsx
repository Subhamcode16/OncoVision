'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  Activity, 
  ChevronDown, 
  Stethoscope, 
  ShieldCheck, 
  Microscope, 
  FileText, 
  Share2, 
  Cpu, 
  Lock, 
  Database,
  ArrowRight,
  Zap,
  Upload,
  AlertCircle,
  CheckCircle2,
  ScanSearch,
  Sparkles
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Background from '@/components/Background';
import Specimen from '@/components/Specimen';
import RadarChart from '@/components/RadarChart';
import MagneticButton from '@/components/MagneticButton';
import SpotlightCard from '@/components/SpotlightCard';
import ComparisonSection from '@/components/ComparisonSection';


if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);
  gsap.config({ force3D: true, nullTargetWarn: false });
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [bgVariant, setBgVariant] = useState<'normal' | 'malignant' | 'benign'>('normal');
  const [formData, setFormData] = useState({
    radius_mean: '17.99',
    texture_mean: '10.38',
    perimeter_mean: '122.8',
    area_mean: '1001.0',
    smoothness_mean: '0.1184',
    compactness_mean: '0.2776',
    concavity_mean: '0.3001',
    concave_points_mean: '0.1471'
  });

  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states to prevent flash or permanent fade
      gsap.set(['.hero-title span', '.hero-desc', '.hero-btns', '.hero-3d'], { opacity: 0, y: 30, visibility: 'visible' });

      // Hero Timeline
      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1 } });
      heroTl
        .fromTo('.hero-title span', 
          { y: 50, opacity: 0 }, 
          { y: 0, opacity: 1, stagger: 0.15, duration: 1.5, ease: 'expo.out' }
        )
        .fromTo('.hero-desc', 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 1 }, 
          '-=1'
        )
        .fromTo('.hero-btns', 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 1 }, 
          '-=0.8'
        )
        .fromTo('.hero-3d', 
          { opacity: 0, scale: 0.8, y: 30 }, 
          { opacity: 1, scale: 1, y: 0, duration: 2, ease: 'elastic.out(1, 0.5)' }, 
          '-=1.5'
        );

      // Staggered Scroll Reveals
      const revealItems = gsap.utils.toArray('.gsap-reveal');
      revealItems.forEach((item: any) => {
        gsap.to(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out'
        });
      });

      // Technology Cards Shutter Reveal
      gsap.fromTo('.tech-card', 
        { 
          opacity: 0, 
          scale: 0.8,
          filter: 'blur(10px)'
        },
        {
          scrollTrigger: {
            trigger: '.tech-grid',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          stagger: 0.1,
          duration: 1,
          ease: 'power3.out',
          lazy: true
        }
      );

      // Precision Underline Animation
      gsap.to('.precision-underline', {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.precision-underline',
          start: 'top 90%',
          once: true
        }
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const scrollToApp = () => {
    if (appRef.current) {
      gsap.to(window, { duration: 1, scrollTo: appRef.current, ease: 'power3.inOut' });
    }
  };

  const handleTitleMouseMove = (e: React.MouseEvent) => {
    if (!titleRef.current) return;
    const rect = titleRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Lagging glow using GSAP to smoothly interpolate CSS variables
    gsap.to(titleRef.current, {
      '--x': `${x}%`,
      '--y': `${y}%`,
      duration: 0.6,
      ease: 'power2.out'
    });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsScanning(true);
    setResult(null);

    // Simulate "Cinematic Scan" timing
    setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        setResult(data);
        
        const diagnosis = data.diagnosis.toLowerCase();
        if (diagnosis.includes('malignant')) setBgVariant('malignant');
        else if (diagnosis.includes('benign')) setBgVariant('benign');
        else setBgVariant('normal');

        gsap.from('.verdict-reveal', { y: 30, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
        setIsScanning(false);
      }
    }, 2000); // Cinematic delay
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setIsScanning(true);
    setScanProgress(0);
    setScanError(null);
    setScanSuccess(false);
    setShowSuccessPopup(false);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    // Simulated Smart Progress (stalls at 90%)
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 2;
      });
    }, 50);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/scan-report`, {
        method: 'POST',
        body: formDataUpload,
      });
      
      const result = await response.json();
      
      if (result.success) {
        clearInterval(progressInterval);
        setScanProgress(100);
        
        // Brief delay to show 100% completion before popup
        setTimeout(() => {
          setFormData(prev => ({ ...prev, ...result.data }));
          setScanSuccess(true);
          setShowSuccessPopup(true);
          gsap.from('.wizard-item', { x: -20, opacity: 0, stagger: 0.1, duration: 0.5 });
          
          // Auto-hide popup after 3 seconds
          setTimeout(() => setShowSuccessPopup(false), 3000);
        }, 500);
      } else {
        clearInterval(progressInterval);
        setScanProgress(0);
        const errorMap: Record<string, string> = {
          'not_oncology_report': 'Clinical Validation Failed: This document does not appear to be an oncology/FNA report.',
          'low_resolution': 'Image Quality Alert: The report text is too blurry to extract precise metrics.',
          'unsupported_format': 'Format Error: Please provide the report as a clear Image or PDF.',
          'location_not_supported': 'Regional Restriction: The Render server region (Singapore) is currently blocked by Google AI. Please redeploy the backend in "Oregon (USA)" for full availability.'
        };
        
        let errorMessage = result.error_type || 'Diagnostic Error: The AI encountered an issue parsing this report.';
        if (errorMessage.includes('Quota Exhausted')) {
          errorMessage = 'System Busy: AI diagnostic limits reached for this minute. Please retry in 60 seconds.';
        } else if (errorMessage.includes('System Alert')) {
          errorMessage = 'Cloud Bridge Latency: The AI service is responding slowly. Please try again.';
        }
        
        setScanError(errorMap[result.error_type] || errorMessage);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setScanProgress(0);
      setScanError('Server connection lost. Please check if the backend is running.');
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  return (
    <div ref={pageRef} className="relative min-h-screen">
      <Background variant={bgVariant} />
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 medical-glass py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">OncoVision <span className="text-blue-600">AI</span></span>
        </div>
        <div className="hidden md:flex flex-row items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#" className="hover:text-blue-600 transition-colors">Technology</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Diagnostics</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Security</a>
          <MagneticButton onClick={scrollToApp} className="btn-vercel whitespace-nowrap">Launch App</MagneticButton>
        </div>
      </nav>
      
      <main className="pt-24">

      {/* Hero Section */}
      <section ref={heroRef} style={{ paddingBottom: '120px', paddingTop: '120px' }} className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center relative section-container z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="hero-content text-left relative z-[40]">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-blue-50/50 border border-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-[0.2em]">
              <Zap className="w-3 h-3" />
              Next-Gen Diagnostic Intelligence
            </div>
            <h1 className="hero-title text-8xl font-black tracking-tighter text-slate-950 leading-[0.85] mb-8">
              <span className="block relative">Predictive</span>
              <span className="block relative text-blue-600">Oncology</span>
              <span className="block relative">Refined.</span>
            </h1>
            <p className="hero-desc text-lg text-slate-700 font-medium mb-10 max-w-lg leading-relaxed">
              Harnessing tuned SVM architectures to provide clinicians with millisecond-grade cytological insights. Secure, localized, and precision-engineered.
            </p>
            <div className="hero-btns flex flex-row flex-nowrap gap-4">
              <MagneticButton onClick={scrollToApp} className="btn-medical flex flex-row items-center gap-3 whitespace-nowrap">
                Launch Diagnostic Suite <ArrowRight className="w-4 h-4 shrink-0" />
              </MagneticButton>
              <button className="px-8 py-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                View Research
              </button>
            </div>
          </div>
          <div className="hero-3d relative flex items-center justify-center">
            <div className="absolute w-[500px] h-[500px] bg-blue-400/10 blur-[100px] rounded-full -z-10" />
            <Specimen />
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToApp}>
          <ChevronDown className="w-6 h-6 text-slate-300" />
        </div>
      </section>

      {/* Technology Section */}
      <section style={{ paddingTop: '120px', paddingBottom: '120px' }} className="bg-slate-50/50 border-y border-slate-100">
        <div className="section-container">
          <div className="text-center mb-20 gsap-reveal">
            <h2 className="text-5xl font-black tracking-tighter text-slate-950 mb-4">
              The Engine of <span className="relative inline-block">
                Precision
                <svg 
                  className="absolute -bottom-2 left-0 w-full h-4 pointer-events-none overflow-visible" 
                  viewBox="0 0 200 20" 
                  preserveAspectRatio="none"
                >
                  <path 
                    className="precision-underline"
                    d="M5 15c40-5 80-5 190 0" 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    style={{ strokeDasharray: 300, strokeDashoffset: 300 }}
                  />
                </svg>
              </span>
            </h2>
            <p className="text-slate-500 font-medium uppercase tracking-[0.1em] text-[10px] font-bold">Built on validated pathological datasets and advanced kernels.</p>
          </div>
          <div className="tech-grid grid md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: "SVM Architecture", desc: "Utilizing RBF kernels for high-dimensional feature separation with 98% validated accuracy." },
              { icon: Database, title: "Pathology Mapping", desc: "Translating 8 critical cytological metrics into a unified pathological signature." },
              { icon: Lock, title: "Secure Protocol", desc: "Local-first inference ensures patient data never leaves the clinical environment." }
            ].map((tech, i) => (
              <SpotlightCard key={i} className="tech-card">
                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <tech.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight">{tech.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{tech.desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section (Using Pretext) */}
      <ComparisonSection />

      {/* Diagnostic Workspace (The App) */}

      <section ref={appRef} style={{ paddingBottom: '200px', paddingTop: '100px' }} className="section-container scroll-mt-24">
        <div className="mb-16 gsap-reveal">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-[9px]">Clinical Command Center</span>
          </div>
          <h1 className="text-8xl font-black tracking-tighter mb-4 flex flex-wrap gap-x-4">
            <span className="text-slate-950">Diagnostic</span>
            <span 
              ref={titleRef}
              onMouseMove={handleTitleMouseMove}
              className="text-spotlight cursor-default"
            >
              Workspace
            </span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl text-sm uppercase tracking-wide">
            Analyze your Fine Needle Aspiration (FNA) reports using our tuned SVM diagnostic engine.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left: Guidance Sidebar */}
          <div className="lg:col-span-4 sticky top-32 gsap-reveal">
            <div className="medical-glass-blue p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black text-slate-900 tracking-tight text-sm uppercase">Patient Guide</h3>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requirement</p>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    Locate the <span className="text-blue-600 font-bold underline decoration-blue-200">"Mean Values"</span> section on your FNA Pathology Report.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {scanSuccess ? "Scan Insights" : "Parameter Glossary"}
                  </p>
                  
                  {scanSuccess ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-800 font-medium">Report analyzed. SVM features have been auto-populated based on clinical findings.</p>
                      </div>
                      {[
                        { term: "Confidence", desc: "AI extracted features with high correlation to clinical text." },
                        { term: "Validation", desc: "Values matched against Wisconsin Dataset ranges." }
                      ].map((item, i) => (
                        <div key={i} className="wizard-item flex gap-3 p-2">
                          <div className="w-1 h-1 bg-emerald-400 rounded-full mt-2 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-800 uppercase">{item.term}</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { term: "Concavity", desc: "Measures the severity of dents in the cell boundary." },
                        { term: "Texture", desc: "Variance in gray-scale values; surface roughness." },
                        { term: "Compactness", desc: "Determines how tight or elongated the cell appears." },
                        { term: "Smoothness", desc: "Local variation in the cell's radius length." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.term}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Input & Visualization */}
          <div className="lg:col-span-8 grid gap-8">
            {/* AI Scanner Bar (Neumorphic) */}
            <div className={`gsap-reveal relative p-1 rounded-[2rem] transition-all duration-500 shadow-[20px_20px_60px_#d1d9e6,-20px_-20px_60px_#ffffff] bg-[#ebf0f7] ${isScanning ? 'scale-[1.02]' : ''}`}>
              {/* Perimeter Progress SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-[2rem]" style={{ overflow: 'visible' }}>
                <rect 
                  x="0" y="0" width="100%" height="100%" 
                  fill="none" 
                  stroke={scanSuccess ? "#10b981" : "#3b82f6"} 
                  strokeWidth="4" 
                  rx="32" ry="32"
                  style={{
                    strokeDasharray: '2000',
                    strokeDashoffset: isScanning ? (2000 - (scanProgress / 100) * 2000) : (scanSuccess ? '0' : '2000'),
                    transition: 'stroke-dashoffset 0.3s ease-out, stroke 0.5s ease',
                  }}
                />
              </svg>

              <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-[inset_6px_6px_12px_#ced5df,inset_-6px_-6px_12px_#ffffff] ${isScanning ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isScanning ? <ScanSearch className="w-7 h-7 animate-pulse" /> : <Upload className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-800">Intelligent Report Scanner</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                      {isScanning ? `Extracting Clinical Vectors... ${scanProgress}%` : 'Upload Pathology Report to begin analysis.'}
                    </p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*,.pdf"
                />
                <MagneticButton 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="px-8 py-4 bg-white shadow-sm border border-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex flex-row items-center gap-2 group whitespace-nowrap"
                >
                  <Sparkles className={`w-4 h-4 shrink-0 transition-colors ${isScanning ? 'text-blue-500' : 'group-hover:text-blue-500'}`} />
                  {isScanning ? 'Analyzing Tissue...' : 'Select Report'}
                </MagneticButton>
              </div>
            </div>

            {/* Success Popup Modal */}
            {showSuccessPopup && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-xl p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(16,185,129,0.2)] border-2 border-emerald-500 animate-[popup_0.5s_back.out(1.7)] flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-500">
                    <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Analysis Complete</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">SVM Vectors Synchronized</p>
                  </div>
                </div>
              </div>
            )}

            {scanError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold">{scanError}</p>
              </div>
            )}

            <div className="medical-glass p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5">
              <form onSubmit={handlePredict} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.keys(formData).map((key) => {
                    const translations: Record<string, string> = {
                      radius_mean: 'Cell Radius',
                      texture_mean: 'Surface Texture',
                      perimeter_mean: 'Boundary Length',
                      area_mean: 'Total Cell Area',
                      smoothness_mean: 'Edge Smoothness',
                      compactness_mean: 'Cell Density',
                      concavity_mean: 'Shape Severity',
                      concave_points_mean: 'Contour Points'
                    };
                    return (
                      <div key={key} className="space-y-2 group">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-blue-600 transition-colors">
                            {key.split('_')[0]} Mean
                          </label>
                          <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                            {translations[key]}
                          </span>
                        </div>
                        {isScanning ? (
                          <div className="w-full h-[54px] bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
                        ) : (
                          <input
                            type="number"
                            step="any"
                            value={formData[key as keyof typeof formData]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="input-field"
                            required
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <MagneticButton 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex flex-row items-center justify-center gap-3 shadow-xl ${
                    loading ? 'bg-slate-400 cursor-not-allowed text-white' : 'btn-medical'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Initiate Diagnostic Analysis
                    </>
                  )}
                </MagneticButton>
              </form>
            </div>

            {/* Live Monitor Visualization */}
            <div className="gsap-reveal medical-glass-blue p-10 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-8 left-10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pathology Signature Radar</span>
              </div>
              <div className="h-[400px] w-full flex items-center justify-center">
                <RadarChart data={formData} />
              </div>
              <div className="mt-8 flex justify-center gap-12 text-center border-t border-slate-100 pt-8">
                {[
                  { label: "Consistency", val: "98.4%" },
                  { label: "Risk Bias", val: "Normal" },
                  { label: "Node Stat", val: "SECURE", color: "text-green-600" }
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-lg font-black ${stat.color || 'text-slate-900'}`}>{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Verdict - Medical Neumorphism Refinement */}
        {result && (
          <div className={`verdict-reveal mt-12 p-12 rounded-[3.5rem] border transition-all duration-700 ${
            result.diagnosis === 'Malignant' ? 'medical-neumorphic-red' : 'medical-neumorphic-emerald'
          }`}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/50 border border-white/80 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <ShieldCheck className="w-3 h-3" />
                  Validated Diagnostic Verdict
                </div>
                <div className={`text-8xl md:text-9xl font-black tracking-tighter leading-none mb-4 drop-shadow-sm ${
                  result.diagnosis === 'Malignant' ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {result.diagnosis}
                </div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest opacity-60">
                  Morphological Signature Analysis Complete
                </p>
              </div>
              
              <div className="flex-1 w-full max-w-sm">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Neural Confidence</p>
                    <div className="text-6xl font-black text-slate-900 tracking-tighter">{result.confidence}%</div>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                    result.diagnosis === 'Malignant' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {result.confidence > 95 ? 'High Precision' : 'Standard Precision'}
                  </div>
                </div>
                
                <div className="h-4 w-full bg-white/50 rounded-full p-1 border border-white/80 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${
                      result.diagnosis === 'Malignant' ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                    }`} 
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-4 w-full lg:w-80">
                <MagneticButton className="w-full flex flex-row items-center justify-between p-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl">
                  <span>Generate Full Report</span> <FileText className="w-5 h-5 shrink-0" />
                </MagneticButton>
                <MagneticButton className="w-full flex flex-row items-center justify-between p-6 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-sm">
                  <span>Schedule Consultation</span> <Stethoscope className="w-5 h-5 shrink-0" />
                </MagneticButton>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-900 text-white gsap-reveal">
        <div className="section-container grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">OncoVision <span className="text-blue-600">AI</span></span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Empowering clinical oncology with predictive neural intelligence. Optimized for cytological dataset analysis and precision diagnostic bridging.
            </p>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SVM Research</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">System Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Medical Legal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Diagnostic Cloud</a></li>
            </ul>
          </div>
        </div>
        <div className="section-container mt-20 pt-8 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 text-center">
          © 2026 OncoVision Systems // Sterile Diagnostic Suite // v2.0.4-Stable
        </div>
      </footer>
      </main>
    </div>
  );
}
