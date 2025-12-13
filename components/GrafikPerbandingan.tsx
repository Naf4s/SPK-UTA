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
import { useSessionID } from "@/hooks/useSessionID";

export default function GrafikPerbandingan() {
  const sessionId = useSessionID();
  const [dataChart, setDataChart] = useState<any[]>([]);
  const [laptops, setLaptops] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!sessionId) return;
    setLoading(true);

    try {
      // 1. Ambil Data Kriteria
      const resKriteria = await fetch("/api/kriteria", {
        headers: { "x-session-id": sessionId }
      });
      const dbKriteria = await resKriteria.json();

      // 2. Cek Config Aktif/Non-Aktif di LocalStorage
      const savedConfig = localStorage.getItem("spk_active_config");
      const config = savedConfig ? JSON.parse(savedConfig) : {};
      
      // Filter Kriteria yang AKTIF saja
      const activeKriteria = dbKriteria.filter((k: any) => 
        config[k.id] !== undefined ? config[k.id] : true
      );

      // Buat daftar Nama Kriteria Aktif untuk filter grafik nanti
      const activeKriteriaNames = activeKriteria.map((k: any) => k.nama);

      // 3. Hitung Bobot Custom (Sama seperti HasilRanking)
      const savedPref = localStorage.getItem("spk_user_pref");
      const parsedPref = savedPref ? JSON.parse(savedPref) : {};

      const rawWeights = activeKriteria.map((k: any) => ({
        id: k.id,
        val: parsedPref[k.id] || 5 
      }));

      const totalScore = rawWeights.reduce((a: number, b: any) => a + b.val, 0);
      const customBobot = rawWeights.map((w: any) => ({
        id: w.id,
        bobot: totalScore === 0 ? 0 : w.val / totalScore 
      }));

      // 4. Panggil API Hitung
      const res = await fetch("/api/hitung", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "x-session-id": sessionId 
        },
        body: JSON.stringify({ customBobot }) 
      });

      const textRes = await res.text();
      const data = textRes ? JSON.parse(textRes) : [];

      if (data.length === 0) {
        setDataChart([]);
        setLoading(false);
        return;
      }

      // 5. Transformasi Data Grafik
      const top3 = data.slice(0, 3);
      setLaptops(top3.map((l: any) => l.nama));

      // Ambil semua key (nama kriteria) dari data rincian backend
      const rawKeys = top3[0]?.rincian ? Object.keys(top3[0].rincian) : [];
      
      // --- PERBAIKAN DI SINI ---
      // Filter key: Hanya ambil key yang namanya ada di daftar activeKriteriaNames
      const filteredKeys = rawKeys.filter((key) => activeKriteriaNames.includes(key));
      
      const chartData = filteredKeys.map((key) => {
        const obj: any = { subject: key };
        
        top3.forEach((laptop: any, index: number) => {
          const nilai = parseFloat(laptop.rincian[key]) * 100;
          obj[`laptop${index}`] = Math.round(nilai); 
          obj[`namaLaptop${index}`] = laptop.nama;
        });
        
        return obj;
      });

      setDataChart(chartData);
    } catch (error) {
      console.error("Gagal load grafik", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Listener Update Realtime
  useEffect(() => {
    const handleUpdate = () => fetchData();
    window.addEventListener("bobot-updated", handleUpdate);
    window.addEventListener("kriteria-config-updated", handleUpdate);
    return () => {
        window.removeEventListener("bobot-updated", handleUpdate);
        window.removeEventListener("kriteria-config-updated", handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (loading) return (
    <div className="flex justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );

  if (dataChart.length === 0) return null;

  return (
    <Card className="mt-8 shadow-lg border-t-4 border-t-orange-500">
      <CardHeader>
        <CardTitle>📊 Analisis Perbandingan (Top 3)</CardTitle>
        <p className="text-sm text-gray-500">
          Membandingkan kekuatan spesifikasi antara kandidat juara. Skala 0-100.
        </p>
      </CardHeader>
      <CardContent className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dataChart}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            
            {laptops[0] && (
              <Radar
                name={`#1 ${laptops[0]}`}
                dataKey="laptop0"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
            )}
            {laptops[1] && (
              <Radar
                name={`#2 ${laptops[1]}`}
                dataKey="laptop1"
                stroke="#16a34a"
                fill="#22c55e"
                fillOpacity={0.3}
              />
            )}
            {laptops[2] && (
              <Radar
                name={`#3 ${laptops[2]}`}
                dataKey="laptop2"
                stroke="#ea580c"
                fill="#f97316"
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