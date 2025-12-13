"use client";
import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Printer, RefreshCw, Trophy } from "lucide-react";
import { useSessionID } from "@/hooks/useSessionID";

export default function HasilRanking() {
  const sessionId = useSessionID();
  const [dataRanking, setDataRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Ref untuk fitur Print PDF
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Syntax baru react-to-print, jika error gunakan content: () => componentRef.current
    documentTitle: "Rekomendasi-Laptop-SPK",
  });

  const fetchRanking = async () => {
    if (!sessionId) return;
    setLoading(true);
    
    try {
      // 1. Ambil Data Kriteria Mentah dari Server (System + Custom Session)
      const resKriteria = await fetch("/api/kriteria", {
        headers: { "x-session-id": sessionId }
      });
      const dbKriteria = await resKriteria.json();

      // 2. Ambil Config (Aktif/Non-Aktif) dari LocalStorage
      const savedConfig = localStorage.getItem("spk_active_config");
      const config = savedConfig ? JSON.parse(savedConfig) : {};

      // Filter: Ambil hanya kriteria yang AKTIF
      const activeKriteria = dbKriteria.filter((k: any) => 
        config[k.id] !== undefined ? config[k.id] : true
      );

      // 3. Ambil Bobot Slider (1-10) dari LocalStorage
      const savedPref = localStorage.getItem("spk_user_pref");
      const parsedPref = savedPref ? JSON.parse(savedPref) : {};

      // Map nilai slider ke kriteria aktif
      const rawWeights = activeKriteria.map((k: any) => ({
        id: k.id,
        val: parsedPref[k.id] || 5 // Default 5 jika user belum geser slider
      }));

      // Hitung Total Skor Slider untuk Normalisasi
      const totalScore = rawWeights.reduce((a: number, b: any) => a + b.val, 0);

      // Buat Payload Custom Bobot (Normalisasi: nilai / total)
      // Jika totalScore 0 (misal cuma 1 kriteria non-aktif), hindari division by zero
      const customBobot = rawWeights.map((w: any) => ({
        id: w.id,
        bobot: totalScore === 0 ? 0 : w.val / totalScore 
      }));

      // 4. Kirim ke API Hitung
      const res = await fetch("/api/hitung", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-session-id": sessionId // PENTING: Identitas Data Laptop
        },
        body: JSON.stringify({ customBobot }) // Kirim bobot yang sudah dinormalisasi
      });

      const data = await res.json();
      setDataRanking(data);
      
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghitung ranking.");
    } finally {
      setLoading(false);
    }
  };

  // Event Listener: Update otomatis jika User ubah slider atau switch kriteria
  useEffect(() => {
    const handleUpdate = () => fetchRanking();
    
    window.addEventListener("bobot-updated", handleUpdate);
    window.addEventListener("kriteria-config-updated", handleUpdate);
    
    return () => {
      window.removeEventListener("bobot-updated", handleUpdate);
      window.removeEventListener("kriteria-config-updated", handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Fetch pertama kali saat session siap
  useEffect(() => {
    fetchRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <Card className="mt-8 shadow-xl border-t-4 border-t-blue-600">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            🏆 Hasil Rekomendasi Personal
          </CardTitle>
          <p className="text-sm text-gray-500">
            Dihitung berdasarkan data sesi Anda & prioritas slider di atas.
          </p>
        </div>
        
        <div className="flex gap-2">
           <Button onClick={() => handlePrint && handlePrint()} variant="outline" size="sm" className="gap-2 hidden md:flex">
            <Printer className="h-4 w-4" /> PDF
          </Button>
          <Button onClick={fetchRanking} disabled={loading} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Menghitung..." : "Hitung Ulang"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div ref={componentRef} className="p-2 bg-white rounded">
            {/* Judul Khusus Print (Hanya muncul di PDF) */}
            <div className="hidden print:block mb-8 text-center border-b pb-4">
                <h1 className="text-2xl font-bold">Laporan Rekomendasi Laptop</h1>
                <p className="text-gray-500">SPK Metode UTA - {new Date().toLocaleDateString()}</p>
            </div>

            {dataRanking.length === 0 ? (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-lg bg-gray-50">
                <p className="mb-2">Belum ada data hasil perhitungan.</p>
                <p className="text-xs">Pastikan Anda sudah menginput data laptop dan mengaktifkan minimal 1 kriteria.</p>
            </div>
            ) : (
            <Table>
                <TableHeader className="bg-gray-50">
                <TableRow>
                    <TableHead className="w-[60px] text-center font-bold">#</TableHead>
                    <TableHead>Laptop</TableHead>
                    <TableHead className="text-center">Skor Akhir</TableHead>
                    <TableHead className="text-right print:hidden">Keterangan</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {dataRanking.map((laptop, index) => (
                    <TableRow key={laptop.id} className={index === 0 ? "bg-blue-50/50" : ""}>
                    <TableCell className="text-center font-bold text-lg">
                        {index + 1}
                    </TableCell>
                    <TableCell>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                            {laptop.nama}
                            {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500"/>}
                        </div>
                        <div className="text-xs text-gray-500">{laptop.detail || "-"}</div>
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-base bg-white border-blue-200 text-blue-700">
                            {laptop.skor.toFixed(4)}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                        {index === 0 ? (
                        <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded-full border border-green-200">
                            Pilihan Terbaik
                        </span>
                        ) : (
                        <span className="text-gray-400 text-xs">Alternatif</span>
                        )}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            )}
            
             <div className="hidden print:block mt-8 text-xs text-gray-400 text-center">
                Dicetak secara otomatis dari Sistem SPK Laptop. ID Sesi: {sessionId?.slice(0,8)}...
            </div>
        </div>
      </CardContent>
    </Card>
  );
}