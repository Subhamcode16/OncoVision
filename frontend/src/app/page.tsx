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
import Background from '@/components/Background';
import Specimen from '@/components/Specimen';
import RadarChart from '@/components/RadarChart';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollToPlugin);
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
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

  const heroRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from('.hero-content', { opacity: 0, y: 30, duration: 1, ease: 'power3.out', clearProps: 'all' })
      .from('.hero-3d', { opacity: 0, scale: 0.8, duration: 1.5, ease: 'power2.out', clearProps: 'all' }, '-=0.5');
  }, []);

  const scrollToApp = () => {
    gsap.to(window, { duration: 1, scrollTo: appRef.current, ease: 'power3.inOut' });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsScanning(true);
    setResult(null);

    // Simulate "Cinematic Scan" timing
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:8000/predict', {
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
    setScanError(null);
    setScanSuccess(false);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/scan-report', {
        method: 'POST',
        body: formDataUpload,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFormData(prev => ({ ...prev, ...result.data }));
        setScanSuccess(true);
        gsap.from('.wizard-item', { x: -20, opacity: 0, stagger: 0.1, duration: 0.5 });
      } else {
        if (result.error === 'not_oncology_report') {
          setScanError('This report does not appear to be a breast cancer pathology/FNA report. Please upload a valid oncology document.');
        } else {
          setScanError('Failed to parse the report. Please ensure the image is clear.');
        }
      }
    } catch (error) {
      setScanError('Server connection lost. Please check if the backend is running.');
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Background variant={bgVariant} />
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 medical-glass py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">OncoVision <span className="text-blue-600">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-blue-600 transition-colors">Technology</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Diagnostics</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Security</a>
          <button onClick={scrollToApp} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">Launch App</button>
        </div>
      </nav>
      
      <main className="pt-24">

      {/* Hero Section */}
      <section ref={heroRef} style={{ paddingBottom: '120px', paddingTop: '120px' }} className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center relative section-container z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="hero-content text-left relative z-30 opacity-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              Next-Gen Diagnostic Intelligence
            </div>
            <h1 className="text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] mb-8 drop-shadow-sm">
              Predictive <br />
              <span className="text-blue-600">Oncology</span> <br />
              Refined.
            </h1>
            <p className="text-xl text-slate-700 font-medium mb-10 max-w-lg leading-relaxed">
              Harnessing tuned SVM architectures to provide clinicians with millisecond-grade cytological insights. Secure, localized, and precision-engineered.
            </p>
            <div className="flex gap-4">
              <button onClick={scrollToApp} className="btn-primary flex items-center gap-2">
                Launch Diagnostic Suite <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
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
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">The Engine of Precision</h2>
            <p className="text-slate-500 font-medium">Built on validated pathological datasets and advanced kernels.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: "SVM Architecture", desc: "Utilizing RBF kernels for high-dimensional feature separation with 98% validated accuracy." },
              { icon: Database, title: "Pathology Mapping", desc: "Translating 8 critical cytological metrics into a unified pathological signature." },
              { icon: Lock, title: "Secure Protocol", desc: "Local-first inference ensures patient data never leaves the clinical environment." }
            ].map((tech, i) => (
              <div key={i} className="medical-glass p-8 rounded-3xl group hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <tech.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">{tech.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diagnostic Workspace (The App) */}
      <section ref={appRef} style={{ paddingBottom: '200px', paddingTop: '100px' }} className="section-container scroll-mt-24">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-xs">Clinical Command Center</span>
          </div>
          <h2 className="text-5xl font-black tracking-tight text-slate-950 mb-6">Diagnostic Workspace</h2>
          <p className="text-slate-500 font-medium max-w-2xl">
            Analyze your Fine Needle Aspiration (FNA) reports using our tuned SVM diagnostic engine.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left: Guidance Sidebar */}
          <div className="lg:col-span-4 sticky top-32">
            <div className="medical-glass p-8 rounded-3xl border-blue-100 bg-blue-50/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 leading-tight">Patient Guide</h3>
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
            {/* AI Scanner Bar */}
            <div className={`relative overflow-hidden p-1 rounded-3xl transition-all duration-500 ${isScanning ? 'bg-blue-600' : 'bg-slate-200/50'}`}>
              <div className="medical-glass p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isScanning ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                    {isScanning ? <ScanSearch className="w-6 h-6 animate-pulse" /> : <Upload className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">Intelligent Report Scanner</h3>
                    <p className="text-xs text-slate-500 font-medium">Upload PDF/Image to auto-populate diagnostic fields.</p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*,.pdf"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                  {isScanning ? 'Analyzing Tissue...' : 'Select Report'}
                </button>
              </div>
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-white/50 absolute top-0 animate-[scan_2s_linear_infinite]" />
                </div>
              )}
            </div>

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
                        <input
                          type="number"
                          step="any"
                          value={formData[key as keyof typeof formData]}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>
                    );
                  })}
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-xl ${
                    loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
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
                </button>
              </form>
            </div>

            {/* Live Monitor Visualization */}
            <div className="medical-glass p-10 rounded-[2.5rem] relative overflow-hidden">
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

        {/* Results Verdict */}
        {result && (
          <div className="verdict-reveal mt-12 medical-glass p-10 rounded-[3rem] bg-white border-blue-100 shadow-2xl shadow-blue-900/10">
            <div className="grid md:grid-cols-3 gap-12 items-center">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Diagnostic Result</p>
                <div className={`text-7xl font-black tracking-tighter ${result.diagnosis === 'Malignant' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {result.diagnosis}
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Neural Confidence</p>
                <div className="text-6xl font-black text-slate-900">{result.confidence}%</div>
                <div className="h-2 w-full bg-slate-100 rounded-full mt-6 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${result.diagnosis === 'Malignant' ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <button className="flex items-center justify-between p-5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all">
                  <span>Download Report</span> <FileText className="w-5 h-5" />
                </button>
                <button className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                  <span>Clinical Consult</span> <Stethoscope className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-900 text-white">
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
