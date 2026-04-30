'use client';

import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import { useEffect, useState } from 'react';

interface BackgroundProps {
  variant: 'normal' | 'malignant' | 'benign';
}

export default function Background({ variant }: BackgroundProps) {
  const [currentColors, setCurrentColors] = useState({
    c1: '#ffffff',
    c2: '#f8fafc',
    c3: '#f1f5f9'
  });

  useEffect(() => {
    switch (variant) {
      case 'malignant':
        setCurrentColors({ c1: '#fff1f2', c2: '#ffffff', c3: '#ffe4e6' });
        break;
      case 'benign':
        setCurrentColors({ c1: '#f0fdf4', c2: '#ffffff', c3: '#dcfce7' });
        break;
      default:
        setCurrentColors({ c1: '#f8fafc', c2: '#ffffff', c3: '#eff6ff' });
    }
  }, [variant]);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-white">
      <div className="absolute inset-0 opacity-25">
        <ShaderGradientCanvas
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <ShaderGradient
            control='props'
            animate='on'
            type='plane'
            uTime={0.5}
            uSpeed={0.05}
            uStrength={1.2}
            uDensity={1.0}
            color1={currentColors.c1}
            color2={currentColors.c2}
            color3={currentColors.c3}
            brightness={1.2}
            grain='off'
          />
        </ShaderGradientCanvas>
      </div>
      
      {/* Precision Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Subtle Bottom Glow */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-blue-50/50 to-transparent" />
    </div>
  );
}
