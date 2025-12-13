"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Target, Trophy, Activity } from "lucide-react";
import Link from 'next/link';
import { useSessionID } from "@/hooks/useSessionID";

export default function DashboardSummary() {
  const sessionId = useSessionID();
  const [stats, setStats] = useState({
    totalLaptop: 0,
    totalKriteria: 0,
    topLaptop: "-",
    topSkor: 0
  });

  // Fungsi untuk refresh data
  const fetchData = async () => {
    if (!sessionId) return;

    try {
      // 1. Ambil Data Kriteria DULU (untuk referensi perhitungan bobot)
      const resKriteria = await fetch("/api/kriteria", {
        headers: { "x-session-id": sessionId }
      });
      const dataKriteria = await resKriteria.json();
      const validKriteria = Array.isArray(dataKriteria) ? dataKriteria : [];

      // 2. HITUNG CUSTOM BOBOT (Sama persis logika dengan HasilRanking.tsx)
      // Ambil Config (Aktif/Non-Aktif) dari LocalStorage
      const savedConfig = localStorage.getItem("spk_active_config");
      const config = savedConfig ? JSON.parse(savedConfig) : {};

      // Filter: Ambil hanya kriteria yang AKTIF
      const activeKriteria = validKriteria.filter((k: any) => 
        config[k.id] !== undefined ? config[k.id] : true
      );

      // Ambil Bobot Slider (1-10) dari LocalStorage
      const savedPref = localStorage.getItem("spk_user_pref");
      const parsedPref = savedPref ? JSON.parse(savedPref) : {};

      // Map nilai slider ke kriteria aktif
      const rawWeights = activeKriteria.map((k: any) => ({
        id: k.id,
        val: parsedPref[k.id] || 5 // Default 5 jika user belum geser slider
      }));

      // Hitung Total Skor Slider untuk Normalisasi
      const totalScore = rawWeights.reduce((a: number, b: any) => a + b.val, 0);

      // Buat Payload Custom Bobot
      const customBobot = rawWeights.map((w: any) => ({
        id: w.id,
        bobot: totalScore === 0 ? 0 : w.val / totalScore 
      }));

      // 3. Fetch Hitung dengan CUSTOM BOBOT
      const resHitung = await fetch("/api/hitung", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-session-id": sessionId 
        },
        body: JSON.stringify({ customBobot }) // <--- INI KUNCINYA
      });

      const textHitung = await resHitung.text();
      const dataHitung = textHitung ? JSON.parse(textHitung) : [];
      const validRanking = Array.isArray(dataHitung) ? dataHitung : [];

      // 4. Update State
      setStats({
        totalLaptop: validRanking.length,
        totalKriteria: activeKriteria.length,
        topLaptop: validRanking.length > 0 ? validRanking[0].nama : "-",
        topSkor: validRanking.length > 0 ? validRanking[0].skor : 0
      });

    } catch (error) {
      console.error("Gagal load dashboard", error);
    }
  };

  // Effect 1: Fetch saat Session Ready
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Effect 2: Update otomatis jika User ubah slider/config di tab lain/komponen lain
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      
      {/* CARD 1: Total Laptop */}
      <Link href="./dashboard/alternatif" passHref className="block">
        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kandidat</CardTitle>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLaptop}</div>
            <p className="text-xs text-muted-foreground">
              Laptop terdaftar dalam sistem
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* CARD 2: Kriteria Aktif */}
      <Link href="/spk/kriteria" passHref className="block">
        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kriteria Penilaian</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKriteria}</div>
            <p className="text-xs text-muted-foreground">
              Faktor penentu keputusan
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* CARD 3: Juara Bertahan */}
      <Link href="/spk/hasil" passHref className="block">
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/20 cursor-pointer hover:bg-yellow-50/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rekomendasi #1</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold truncate text-yellow-700">
                {stats.topLaptop}
            </div>
            <p className="text-xs text-muted-foreground">
                Berdasarkan bobot saat ini
            </p>
            </CardContent>
        </Card>
      </Link>

      {/* CARD 4: Skor Tertinggi */}
      <Link href="/dashboard/detail-hitung">
        <Card className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skor Tertinggi</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.topSkor.toFixed(4)}
            </div>
            <p className="text-xs text-muted-foreground">
              Nilai utilitas (UTA) max
            </p>
          </CardContent>
        </Card>
        </Link>

    </div>
  );
}