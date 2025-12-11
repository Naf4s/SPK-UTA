"use client";
import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function GrafikPerbandingan() {
  const [dataChart, setDataChart] = useState<any[]>([]);
  const [laptops, setLaptops] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hitung")
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          setLoading(false);
          return;
        }

        // 1. Ambil Top 3 Laptop saja biar grafik gak pusing
        const top3 = data.slice(0, 3);
        setLaptops(top3.map((l: any) => l.nama));

        // 2. Transformasi Data untuk Recharts
        // Kita butuh format: [{ subject: 'RAM', A: 100, B: 80 }, { subject: 'Harga', ... }]
        
        // Ambil daftar kriteria dari laptop pertama
        const kriteriaKeys = Object.keys(top3[0].rincian);
        
        const chartData = kriteriaKeys.map((key) => {
          const obj: any = { subject: key };
          
          top3.forEach((laptop: any, index: number) => {
            // Nilai rincian dari backend adalah 0-1 (normalized).
            // Kita kali 100 biar jadi skala 0-100 di grafik.
            const nilai = parseFloat(laptop.rincian[key]) * 100;
            
            // Simpan dengan key dinamis (laptop1, laptop2, laptop3)
            obj[`laptop${index}`] = Math.round(nilai); 
            obj[`namaLaptop${index}`] = laptop.nama;
          });
          
          return obj;
        });

        setDataChart(chartData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );

  if (dataChart.length === 0) return null; // Jangan tampilkan apa-apa kalau belum ada data

  return (
    <Card className="mt-8 shadow-lg border-t-4 border-t-orange-500">
      <CardHeader>
        <CardTitle>📊 Analisis Perbandingan (Top 3)</CardTitle>
        <p className="text-sm text-gray-500">
          Membandingkan kekuatan spesifikasi antara kandidat juara. Skala 0-100 (Normalisasi).
        </p>
      </CardHeader>
      <CardContent className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dataChart}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            
            {/* Laptop Juara 1 (Biru) */}
            {laptops[0] && (
              <Radar
                name={`#1 ${laptops[0]}`}
                dataKey="laptop0"
                stroke="#2563eb" // Blue 600
                fill="#3b82f6"   // Blue 500
                fillOpacity={0.5}
              />
            )}

            {/* Laptop Juara 2 (Hijau) */}
            {laptops[1] && (
              <Radar
                name={`#2 ${laptops[1]}`}
                dataKey="laptop1"
                stroke="#16a34a" // Green 600
                fill="#22c55e"   // Green 500
                fillOpacity={0.3}
              />
            )}

            {/* Laptop Juara 3 (Merah/Orange) */}
            {laptops[2] && (
              <Radar
                name={`#3 ${laptops[2]}`}
                dataKey="laptop2"
                stroke="#ea580c" // Orange 600
                fill="#f97316"   // Orange 500
                fillOpacity={0.2}
              />
            )}

            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}