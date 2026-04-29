'use client';

import { Radar, RadarChart as ReRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RadarChartProps {
  data: {
    radius_mean: string;
    texture_mean: string;
    perimeter_mean: string;
    area_mean: string;
    smoothness_mean: string;
    compactness_mean: string;
    concavity_mean: string;
    concave_points_mean: string;
  };
}

export default function RadarChart({ data }: RadarChartProps) {
  // Normalize data for the radar chart (rough normalization for visualization)
  const chartData = [
    { subject: 'Radius', value: parseFloat(data.radius_mean) * 5, benchmark: 70 },
    { subject: 'Texture', value: parseFloat(data.texture_mean) * 4, benchmark: 80 },
    { subject: 'Perimeter', value: parseFloat(data.perimeter_mean) * 0.8, benchmark: 75 },
    { subject: 'Area', value: parseFloat(data.area_mean) * 0.08, benchmark: 60 },
    { subject: 'Smoothness', value: parseFloat(data.smoothness_mean) * 800, benchmark: 70 },
    { subject: 'Compactness', value: parseFloat(data.compactness_mean) * 600, benchmark: 65 },
    { subject: 'Concavity', value: parseFloat(data.concavity_mean) * 500, benchmark: 50 },
    { subject: 'Concave Pts', value: parseFloat(data.concave_points_mean) * 1000, benchmark: 55 },
  ];

  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <ReRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
          
          {/* Benchmark Range (Benign Baseline) */}
          <Radar
            name="Benchmark"
            dataKey="benchmark"
            stroke="#94a3b8"
            fill="#f1f5f9"
            fillOpacity={0.3}
          />
          
          {/* Current Patient Signature */}
          <Radar
            name="Patient"
            dataKey="value"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.4}
            animationBegin={0}
            animationDuration={1500}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
