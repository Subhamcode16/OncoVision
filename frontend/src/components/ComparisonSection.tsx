'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, AlertCircle, ArrowRight, Microscope, Target, Activity } from 'lucide-react';
import { prepareWithSegments, layoutWithLines } from '@/lib/pretext/layout';
import SpotlightCard from './SpotlightCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const MALIGNANT_DESC = "Malignant tumors are cancerous and characterized by rapid, uncontrolled cell division. They often exhibit irregular borders, varying cell sizes (pleomorphism), and the ability to invade adjacent tissues or metastasize to distant organs through the lymphatic system or bloodstream.";
const BENIGN_DESC = "Benign tumors are non-cancerous growths that typically remain localized. They are generally encapsulated, show slow growth rates, and consist of well-differentiated cells that resemble the tissue of origin. They do not invade surrounding tissues or spread to other parts of the body.";

export default function ComparisonSection() {
  const [malignantLines, setMalignantLines] = useState<{text: string}[]>([]);
  const [benignLines, setBenignLines] = useState<{text: string}[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const benignCardRef = useRef<HTMLDivElement>(null);
  const malignantCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: gsap.Context;
    const init = async () => {
      // 1. Layout Calculation
      try {
        const font = '500 14px Inter, sans-serif';
        const prepB = prepareWithSegments(BENIGN_DESC, font);
        const prepM = prepareWithSegments(MALIGNANT_DESC, font);
        const resB = layoutWithLines(prepB, 340, 20);
        const resM = layoutWithLines(prepM, 340, 20);
        
        setBenignLines(resB.lines.length > 0 ? resB.lines : BENIGN_DESC.split('. ').map(t => ({ text: t + '.' })));
        setMalignantLines(resM.lines.length > 0 ? resM.lines : MALIGNANT_DESC.split('. ').map(t => ({ text: t + '.' })));
      } catch (e) {
        console.error("Layout engine failure, using fallback:", e);
        setBenignLines(BENIGN_DESC.split('. ').map(t => ({ text: t + '.' })));
        setMalignantLines(MALIGNANT_DESC.split('. ').map(t => ({ text: t + '.' })));
      }

      // 2. GSAP Entrance Animation
      setTimeout(() => {
        if (!sectionRef.current) return;
        ctx = gsap.context(() => {
          const reveals = sectionRef.current!.querySelectorAll('.gsap-reveal, .comparison-card');
          gsap.fromTo(reveals, 
            { y: 40, opacity: 0 },
            {
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none'
              },
              y: 0,
              opacity: 1,
              stagger: 0.15,
              duration: 1,
              ease: 'power3.out',
              clearProps: 'all'
            }
          );
        }, sectionRef);
      }, 200);
    };

    init();
    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  const handleParallax = (e: React.MouseEvent, cardRef: React.RefObject<HTMLDivElement>, selector: string) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;

    gsap.to(cardRef.current.querySelectorAll(selector), {
      x: x,
      y: y,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.02
    });
  };

  const resetParallax = (cardRef: React.RefObject<HTMLDivElement>, selector: string) => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current.querySelectorAll(selector), {
      x: 0,
      y: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  return (
    <section ref={sectionRef} className="py-24 section-container overflow-hidden bg-slate-50/50 rounded-[3rem] border border-slate-100 my-20 relative z-10">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6 gsap-reveal">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Microscope className="w-6 h-6 text-blue-600" />
            <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-[9px]">Pathology Reference</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-slate-950 mb-4">
            Understanding <span className="text-blue-600">Cellular Taxonomy</span>
          </h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed uppercase tracking-wide">
            The fundamental distinction between Benign and Malignant pathologies lies in their kinetic behavior and morphological signatures.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Localized</div>
          <div className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">Invasive</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Benign Card */}
        <SpotlightCard 
          ref={benignCardRef}
          onMouseMove={(e) => handleParallax(e, benignCardRef, '.benign-line')}
          onMouseLeave={() => resetParallax(benignCardRef, '.benign-line')}
          className="comparison-card medical-glass group"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">Benign Architecture</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Non-Cancerous • Self-Contained</p>
            </div>
          </div>

          <div className="space-y-1 mb-8 min-h-[140px]">
            {benignLines.length > 0 ? (
              benignLines.map((line, i) => (
                <div key={i} className="benign-line text-sm font-medium text-slate-600 leading-[20px] animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                  {line.text}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">Calculating pathological layout...</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Borders", val: "Smooth/Defined" },
              { label: "Growth", val: "Controlled" },
              { label: "Symmetry", val: "High" },
              { label: "Vascularity", val: "Normal" }
            ].map((stat, i) => (
              <div key={i} className="p-3 bg-white/50 rounded-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xs font-bold text-slate-800">{stat.val}</p>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* Malignant Card */}
        <SpotlightCard 
          ref={malignantCardRef}
          onMouseMove={(e) => handleParallax(e, malignantCardRef, '.malignant-line')}
          onMouseLeave={() => resetParallax(malignantCardRef, '.malignant-line')}
          className="comparison-card medical-glass-blue group border-blue-200"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">Malignant Signature</h3>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Cancerous • Metastasizing</p>
            </div>
          </div>

          <div className="space-y-1 mb-8 min-h-[140px]">
            {malignantLines.length > 0 ? (
              malignantLines.map((line, i) => (
                <div key={i} className="malignant-line text-sm font-medium text-slate-700 leading-[20px] animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                  {line.text}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">Calculating pathological layout...</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Borders", val: "Irregular/Jagged" },
              { label: "Growth", val: "Uncontrolled" },
              { label: "Symmetry", val: "Asymmetric" },
              { label: "Vascularity", val: "Angiogenesis" }
            ].map((stat, i) => (
              <div key={i} className="p-3 bg-white/50 rounded-xl border border-blue-100">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xs font-bold text-slate-800">{stat.val}</p>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>

      {/* Kinetic Diagnostic Footer */}
      <div className="mt-16 flex items-center justify-center gap-8 gsap-reveal">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Validated Accuracy: 98.2%</span>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Real-time Vector Analysis</span>
        </div>
      </div>
    </section>
  );
}
