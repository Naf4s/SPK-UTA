"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Target, Trophy, Activity } from "lucide-react"; // Ikon keren

export default function DashboardSummary() {
  const [stats, setStats] = useState({
    totalLaptop: 0,
    totalKriteria: 0,
    topLaptop: "-",
    topSkor: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kita panggil API hitung karena di sana sudah ada ranking
        const resHitung = await fetch("/api/hitung");
        const dataHitung = await resHitung.json();
        
        // Kita panggil API kriteria untuk hitung jumlah kriteria aktif
        const resKriteria = await fetch("/api/kriteria");
        const dataKriteria = await resKriteria.json();

        // Olah datanya
        setStats({
          totalLaptop: dataHitung.length,
          totalKriteria: dataKriteria.length,
          // Ambil nama juara 1 jika ada data
          topLaptop: dataHitung.length > 0 ? dataHitung[0].nama : "-",
          // Ambil skor juara 1
          topSkor: dataHitung.length > 0 ? dataHitung[0].skor : 0
        });
      } catch (error) {
        console.error("Gagal load dashboard");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      
      {/* CARD 1: Total Laptop */}
      <Card>
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

      {/* CARD 2: Kriteria Aktif */}
      <Card>
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

      {/* CARD 3: Juara Bertahan */}
      <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/20">
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

      {/* CARD 4: Skor Tertinggi */}
      <Card>
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

    </div>
  );
}