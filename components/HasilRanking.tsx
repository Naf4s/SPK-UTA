"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, RefreshCw } from "lucide-react"; // Import Ikon

export default function HasilRanking() {
  const [dataRanking, setDataRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRanking = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/hitung");
      const data = await res.json();
      setDataRanking(data);
      if (!silent) toast.success("Data berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Hapus Data
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch("/api/alternatif", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Laptop berhasil dihapus!");
        fetchRanking(true); // Refresh tabel tanpa loading spinner
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Gagal menghapus data.");
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  return (
    <Card className="mt-8 border-t-4 border-t-blue-600 shadow-xl bg-white">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            🏆 Hasil Rekomendasi
            <Badge variant="secondary" className="text-xs">
              Live Update
            </Badge>
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            Data diurutkan berdasarkan skor tertinggi (Metode UTA).
          </p>
        </div>
        
        {/* Tombol Refresh dengan Ikon */}
        <Button 
          onClick={() => fetchRanking()} 
          disabled={loading} 
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Menghitung..." : "Hitung Ulang"}
        </Button>
      </CardHeader>
      
      <CardContent className="pt-6">
        {dataRanking.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
            <p className="text-gray-400 font-medium">Belum ada data laptop.</p>
            <p className="text-sm text-gray-400">Silakan input data di form atas.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[80px] text-center font-bold">Rank</TableHead>
                  <TableHead>Detail Laptop</TableHead>
                  <TableHead className="text-center">Skor Preferensi</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataRanking.map((laptop, index) => (
                  <TableRow key={laptop.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Kolom 1: Ranking Badge */}
                    <TableCell className="text-center font-bold text-lg">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      {index > 2 && <span className="text-gray-400">#{index + 1}</span>}
                    </TableCell>
                    
                    {/* Kolom 2: Nama & Detail */}
                    <TableCell>
                      <div className="font-semibold text-gray-900">{laptop.nama}</div>
                      <div className="text-xs text-gray-500 max-w-[200px] truncate">
                        {laptop.detail || "-"}
                      </div>
                      {index === 0 && (
                        <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                          Rekomendasi Utama
                        </Badge>
                      )}
                    </TableCell>
                    
                    {/* Kolom 3: Skor */}
                    <TableCell className="text-center">
                      <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-mono font-bold text-sm">
                        {laptop.skor.toFixed(4)}
                      </div>
                    </TableCell>
                    
                    {/* Kolom 4: Aksi Hapus dengan Alert Dialog */}
                    <TableCell className="text-right pr-6">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Laptop ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Data <strong>{laptop.nama}</strong> beserta nilai matriksnya akan dihapus permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(laptop.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Ya, Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}