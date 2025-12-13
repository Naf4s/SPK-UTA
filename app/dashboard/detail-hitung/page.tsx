"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator, Table as TableIcon, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSessionID } from "@/hooks/useSessionID";

export default function DetailHitungPage() {
  const sessionId = useSessionID();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [kriteria, setKriteria] = useState<any[]>([]);
  const [alternatif, setAlternatif] = useState<any[]>([]);
  const [bobotNormalisasi, setBobotNormalisasi] = useState<any[]>([]);
  const [minMaxValues, setMinMaxValues] = useState<Record<number, {min: number, max: number}>>({});
  const [hasilRanking, setHasilRanking] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const initData = async () => {
      setLoading(true);
      try {
        // 1. Ambil Data Mentah
        const [resKriteria, resAlt] = await Promise.all([
            fetch("/api/kriteria", { headers: { "x-session-id": sessionId } }),
            fetch("/api/alternatif", { headers: { "x-session-id": sessionId } })
        ]);

        const dbKriteria = await resKriteria.json();
        const dbAlternatif = await resAlt.json();

        // 2. Filter Kriteria Aktif (LocalStorage)
        const configStr = localStorage.getItem("spk_active_config");
        const config = configStr ? JSON.parse(configStr) : {};
        const activeKriteria = dbKriteria.filter((k: any) => 
            config[k.id] !== undefined ? config[k.id] : true
        );

        // 3. Hitung Bobot (LocalStorage)
        const prefStr = localStorage.getItem("spk_user_pref");
        const pref = prefStr ? JSON.parse(prefStr) : {};
        
        const rawWeights = activeKriteria.map((k: any) => ({
            ...k,
            val: pref[k.id] || 5
        }));
        
        const totalScore = rawWeights.reduce((a: number, b: any) => a + b.val, 0);
        const finalWeights = rawWeights.map((w: any) => ({
            ...w,
            normBobot: totalScore === 0 ? 0 : w.val / totalScore
        }));

        // 4. Hitung Min/Max untuk Normalisasi
        const stats: Record<number, {min: number, max: number}> = {};
        finalWeights.forEach((k: any) => {
            const values = dbAlternatif.map((a: any) => {
                const mat = a.matriks.find((m: any) => m.kriteriaId === k.id);
                return mat ? mat.nilai : 0;
            });
            stats[k.id] = {
                max: Math.max(...values),
                min: Math.min(...values)
            };
        });

        // 5. Hitung Skor Akhir (Simulasi)
        const ranking = dbAlternatif.map((alt: any) => {
            let skorTotal = 0;
            finalWeights.forEach((k: any) => {
                const mat = alt.matriks.find((m: any) => m.kriteriaId === k.id);
                const val = mat ? mat.nilai : 0;
                const { min, max } = stats[k.id];
                
                // Rumus Normalisasi
                let normVal = 0;
                if (k.tipe === 'benefit') {
                    normVal = max === 0 ? 0 : val / max;
                } else {
                    normVal = val === 0 ? 0 : min / val;
                }
                
                skorTotal += normVal * k.normBobot;
            });
            return { ...alt, skor: skorTotal };
        }).sort((a: any, b: any) => b.skor - a.skor);

        // Simpan ke State
        setKriteria(finalWeights); // Kriteria + Bobot Normalisasi
        setAlternatif(dbAlternatif);
        setMinMaxValues(stats);
        setHasilRanking(ranking);

      } catch (error) {
        console.error("Gagal hitung detail", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [sessionId]);

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat data perhitungan...</div>;

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Detail Perhitungan</h1>
            <p className="text-gray-500">Transparansi proses metode UTA dari data mentah hingga ranking.</p>
        </div>
        <Link href="/dashboard">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/> Kembali</Button>
        </Link>
      </div>

      {/* STEP 1: Matriks Keputusan (Data Mentah) */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-blue-600"/> 1. Matriks Keputusan (X)
            </CardTitle>
            <p className="text-sm text-gray-500">Data spesifikasi asli laptop dari database.</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-blue-50">
                    <TableRow>
                        <TableHead>Alternatif</TableHead>
                        {kriteria.map((k) => (
                            <TableHead key={k.id} className="text-center">
                                <div>{k.nama}</div>
                                <Badge variant="secondary" className="text-[10px] mt-1">
                                    {k.tipe === 'benefit' ? 'Max' : 'Min'} : {k.tipe === 'benefit' ? minMaxValues[k.id]?.max : minMaxValues[k.id]?.min}
                                </Badge>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {alternatif.map((a) => (
                        <TableRow key={a.id}>
                            <TableCell className="font-bold">{a.nama}</TableCell>
                            {kriteria.map((k) => {
                                const mat = a.matriks.find((m: any) => m.kriteriaId === k.id);
                                const val = mat ? mat.nilai : 0;
                                // Highlight jika ini nilai terbaik
                                const isBest = (k.tipe === 'benefit' && val === minMaxValues[k.id]?.max) ||
                                               (k.tipe === 'cost' && val === minMaxValues[k.id]?.min);
                                return (
                                    <TableCell key={k.id} className={`text-center ${isBest ? "font-bold text-green-600 bg-green-50" : ""}`}>
                                        {val}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* STEP 2: Normalisasi Bobot */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-purple-600"/> 2. Normalisasi Bobot (W)
            </CardTitle>
            <p className="text-sm text-gray-500">Mengubah nilai slider prioritas (1-10) menjadi persentase desimal.</p>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-4">
                {kriteria.map((k) => (
                    <div key={k.id} className="p-4 border rounded-lg bg-gray-50 min-w-[150px]">
                        <div className="text-xs text-gray-500 font-bold uppercase">{k.kode}</div>
                        <div className="font-semibold text-sm mb-2">{k.nama}</div>
                        <div className="flex justify-between items-center text-xs">
                            <span>Slider: <strong>{k.val}</strong></span>
                            <span className="text-purple-600">→</span>
                            <span className="font-mono bg-white px-2 py-1 rounded border">
                                {k.normBobot.toFixed(4)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-right mt-4 text-gray-400">*Total bobot normalisasi harus mendekati 1.0</p>
        </CardContent>
      </Card>

      {/* STEP 3: Matriks Normalisasi (R) */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-orange-600"/> 3. Matriks Ternormalisasi (R)
            </CardTitle>
            <p className="text-sm text-gray-500">
                Benefit: (Nilai / Max) | Cost: (Min / Nilai)
            </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-orange-50">
                    <TableRow>
                        <TableHead>Alternatif</TableHead>
                        {kriteria.map((k) => (
                            <TableHead key={k.id} className="text-center">{k.kode}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {alternatif.map((a) => (
                        <TableRow key={a.id}>
                            <TableCell className="font-bold">{a.nama}</TableCell>
                            {kriteria.map((k) => {
                                const mat = a.matriks.find((m: any) => m.kriteriaId === k.id);
                                const val = mat ? mat.nilai : 0;
                                const { min, max } = minMaxValues[k.id];
                                let normVal = 0;
                                if (k.tipe === 'benefit') normVal = max === 0 ? 0 : val / max;
                                else normVal = val === 0 ? 0 : min / val;

                                return (
                                    <TableCell key={k.id} className="text-center font-mono text-xs">
                                        {normVal.toFixed(3)}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* STEP 4: Hasil Akhir */}
      <Card className="border-l-4 border-l-green-500 shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600"/> 4. Hasil Ranking Akhir (V)
            </CardTitle>
            <p className="text-sm text-gray-500">
                Σ (Nilai Normalisasi × Bobot Normalisasi)
            </p>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader className="bg-green-50">
                    <TableRow>
                        <TableHead className="w-[50px] text-center">#</TableHead>
                        <TableHead>Nama Laptop</TableHead>
                        <TableHead className="text-center">Skor Akhir</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {hasilRanking.map((item, idx) => (
                        <TableRow key={item.id} className={idx === 0 ? "bg-green-50/50" : ""}>
                            <TableCell className="text-center font-bold">{idx + 1}</TableCell>
                            <TableCell>
                                <div className="font-medium">{item.nama}</div>
                                {idx === 0 && <span className="text-[10px] text-green-600 font-bold">REKOMENDASI UTAMA</span>}
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold text-lg text-green-700">
                                {item.skor.toFixed(4)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}