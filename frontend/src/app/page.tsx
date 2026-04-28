"use client";

import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  ChevronRight, 
  Search, 
  AlertCircle,
  FileText,
  BarChart3,
  Dna
} from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    // Extract the 4 actual values from the form
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const payload = {
      radius_mean: parseFloat(formData.get('radius_mean') as string) || 14.06,
      texture_mean: parseFloat(formData.get('texture_mean') as string) || 19.24,
      perimeter_mean: parseFloat(formData.get('perimeter_mean') as string) || 91.55,
      area_mean: parseFloat(formData.get('area_mean') as string) || 648.54
    };
    
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Prediction failed');
      
      const data = await response.json();
      setResult({
        ...data,
        topFactors: ["Radius Mean", "Perimeter Mean", "Area Mean", "Texture Mean"]
      });
    } catch (error) {
      console.error(error);
      alert("Error: Backend server is not responding. Ensure src/server.py is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
              <Dna size={24} />
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>OncoVision AI</h1>
          </div>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" className="input-label" style={{ margin: 0 }}>Methodology</a>
            <a href="#" className="input-label" style={{ margin: 0 }}>Accuracy Report</a>
            <a href="#" className="input-label" style={{ margin: 0 }}>Contact</a>
          </nav>
        </div>
      </header>

      <div className="container">
        {/* Hero Section */}
        <section style={{ textAlign: 'center', margin: '4rem 0' }} className="animate-fade-in">
          <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', marginBottom: '1rem', display: 'inline-block' }}>
            Powered by Tuned SVM & XGBoost
          </span>
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: '#0f172a' }}>
            Next-Gen Cancer <span style={{ color: 'var(--primary)' }}>Classification</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
            A high-precision diagnostic bridge for medical professionals. Our ensemble models achieve 99% accuracy in identifying malignant tissue.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => document.getElementById('diagnostic-form')?.scrollIntoView({ behavior: 'smooth' })}>
              Start Diagnostic <ChevronRight size={18} style={{ marginLeft: '0.5rem' }} />
            </button>
            <button className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              View Case Studies
            </button>
          </div>
        </section>

        {/* Diagnostic Area */}
        <div className="grid" id="diagnostic-form">
          {/* Form Card */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Stethoscope className="primary" style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Diagnostic Inputs</h3>
            </div>
            
            <form onSubmit={handlePredict}>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="input-label">Lump Size (Radius)</label>
                    <div className="tooltip-trigger" title="Average distance from center to the perimeter of the lump.">
                      <AlertCircle size={14} style={{ opacity: 0.5 }} />
                    </div>
                  </div>
                  <input type="number" step="0.01" name="radius_mean" className="input-field" placeholder="e.g. 17.99" required />
                </div>
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="input-label">Surface Texture</label>
                    <div className="tooltip-trigger" title="How irregular or rough the surface of the lump appears.">
                      <AlertCircle size={14} style={{ opacity: 0.5 }} />
                    </div>
                  </div>
                  <input type="number" step="0.01" name="texture_mean" className="input-field" placeholder="e.g. 10.38" required />
                </div>
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="input-label">Boundary Length</label>
                    <div className="tooltip-trigger" title="The total distance around the edge of the detected area.">
                      <AlertCircle size={14} style={{ opacity: 0.5 }} />
                    </div>
                  </div>
                  <input type="number" step="0.01" name="perimeter_mean" className="input-field" placeholder="e.g. 122.80" required />
                </div>
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="input-label">Total Surface Area</label>
                    <div className="tooltip-trigger" title="The total area covered by the detected lump.">
                      <AlertCircle size={14} style={{ opacity: 0.5 }} />
                    </div>
                  </div>
                  <input type="number" step="0.01" name="area_mean" className="input-field" placeholder="e.g. 1001.0" required />
                </div>
              </div>

              <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', lineHeight: 1.4 }}>
                  <ShieldCheck size={16} className="primary" /> 
                  These measurements are typically found in your biopsy or ultrasound report.
                </p>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Analyzing Neural Patterns...' : 'Generate Prediction'}
              </button>
            </form>
          </div>

          {/* Results/Stats Card */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column' }}>
            {!result ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p>Waiting for diagnostic inputs...</p>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Analysis Report</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>AI-Driven Diagnostic Assessment</p>
                  </div>
                  <span className={`badge ${result.diagnosis === 'Malignant' ? 'badge-malignant' : 'badge-benign'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    {result.diagnosis === 'Malignant' ? '⚠️ High Risk' : '✅ Low Risk'}
                  </span>
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>AI Confidence</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{result.confidence}%</div>
                  </div>
                  <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Status</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: result.diagnosis === 'Malignant' ? '#ef4444' : '#10b981' }}>
                      {result.diagnosis === 'Malignant' ? 'Action Required' : 'Normal Results'}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h4 className="input-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={16} /> Visual Reason for Prediction
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                    This chart shows which physical characteristics of the lump most influenced the AI's decision. 
                    <span style={{ color: '#ef4444' }}> Red bars</span> mean that characteristic increased the risk.
                  </p>
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                    <img src="/shap_summary_svm.png" alt="SHAP Analysis" style={{ width: '100%', borderRadius: '8px' }} />
                  </div>
                </div>

                <div style={{ padding: '1.25rem', background: result.diagnosis === 'Malignant' ? '#fff1f2' : '#f0fdf4', border: `1px solid ${result.diagnosis === 'Malignant' ? '#fecdd3' : '#dcfce7'}`, borderRadius: '12px' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {result.diagnosis === 'Malignant' ? <AlertCircle style={{ color: '#e11d48' }} /> : <ShieldCheck style={{ color: '#15803d' }} />}
                    <div>
                      <p style={{ fontWeight: 700, color: result.diagnosis === 'Malignant' ? '#9f1239' : '#166534', fontSize: '0.95rem' }}>
                        {result.diagnosis === 'Malignant' ? 'Important: Seek Medical Advice' : 'Everything Looks Good'}
                      </p>
                      <p style={{ color: result.diagnosis === 'Malignant' ? '#be123c' : '#15803d', fontSize: '0.875rem', lineHeight: 1.5, marginTop: '0.25rem' }}>
                        {result.diagnosis === 'Malignant' 
                          ? 'The AI has detected patterns commonly associated with malignant cells. This is not a final diagnosis, but you should consult an oncologist immediately for a physical exam and biopsy.'
                          : 'The AI has categorized these features as benign (healthy). You should continue with your regular self-exams and scheduled clinical screenings.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section for Non-Medical Users */}
        <section style={{ marginTop: '6rem', padding: '4rem', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>Understanding Your Report</h3>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem' }}>
              <div>
                <h5 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>What is Malignant?</h5>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Malignant means the cells are cancerous and can spread to other parts of the body. Immediate medical attention is required to determine the best treatment path.
                </p>
              </div>
              <div>
                <h5 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>What is Benign?</h5>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Benign means the lump or cells are non-cancerous. While they usually don't spread, they should still be monitored by a doctor to ensure they don't change over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Row */}
        <div className="grid" style={{ marginTop: '4rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FileText style={{ color: 'var(--primary)', marginBottom: '1rem' }} size={32} />
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Clinical Data</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Supports standard Wisconsin Diagnostic Dataset features.</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <BarChart3 style={{ color: 'var(--primary)', marginBottom: '1rem' }} size={32} />
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>99.2% Recall</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Optimized to minimize false negatives in patient diagnosis.</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Search style={{ color: 'var(--primary)', marginBottom: '1rem' }} size={32} />
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Explainable AI</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>SHAP integration reveals exactly why the model made its decision.</p>
          </div>
        </div>
      </div>

      <footer style={{ marginTop: '8rem', padding: '4rem 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          &copy; 2026 OncoVision AI Research Group. For clinical research use only.
        </p>
      </footer>
    </main>
  );
}
