"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Save, AlertTriangle } from "lucide-react"; // Ikon
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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

type Kriteria = {
  id: number;
  nama: string;
  kode: string;
  bobot: number;
  rawValue?: number;
};

export default function BobotPrioritas() {
  const [kriteria, setKriteria] = useState<Kriteria[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/kriteria")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((k: Kriteria) => ({
          ...k,
          rawValue: 5 // Default visual slider (tengah)
        }));
        setKriteria(formatted);
      });
  }, []);

  const handleSliderChange = (id: number, val: number[]) => {
    setKriteria((prev) =>
      prev.map((k) => (k.id === id ? { ...k, rawValue: val[0] } : k))
    );
  };

  const handleSave = async () => {
    const totalSkor = kriteria.reduce((sum, k) => sum + (k.rawValue || 0), 0);
    
    // Normalisasi Bobot (Total jadi 1.0)
    const payload = kriteria.map((k) => ({
      id: k.id,
      bobot: (k.rawValue || 0) / totalSkor
    }));

    try {
      await fetch("/api/kriteria", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      toast.success("Prioritas disimpan!", {
        description: "Ranking laptop akan dihitung ulang otomatis."
      });
      router.refresh(); 
      // Kita bisa reload halaman agar komponen HasilRanking merespons perubahan
      window.location.reload(); 
    } catch (error) {
      toast.error("Gagal menyimpan prioritas.");
    }
  };

  return (
    <Card className="mb-8 border-l-4 border-l-purple-500 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎚️ Atur Prioritas Kebutuhan
        </CardTitle>
        <p className="text-sm text-gray-500">
          Geser ke kanan (max 10) untuk kriteria yang paling penting bagimu.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {kriteria.map((k) => (
          <div key={k.id} className="flex items-center gap-4">
            <div className="w-1/4">
              <p className="font-bold text-sm md:text-base">{k.nama}</p>
              <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                {k.kode} • {k.tipe}
              </span>
            </div>
            
            <Slider
              defaultValue={[k.rawValue || 5]}
              max={10}
              step={1}
              className="flex-1 cursor-pointer"
              onValueChange={(val) => handleSliderChange(k.id, val)}
            />
            
            <div className="w-10 text-center font-bold text-purple-600 bg-purple-50 rounded p-1">
              {k.rawValue}
            </div>
          </div>
        ))}
        
        {/* ALERT DIALOG WRAPPER */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
              <Save className="mr-2 h-4 w-4" /> Simpan Perubahan Prioritas
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Konfirmasi Perubahan
              </AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin dengan pengaturan prioritas ini? 
                <br/><br/>
                Sistem akan <strong>menghitung ulang seluruh skor</strong> rekomendasi laptop berdasarkan preferensi baru Anda.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleSave} className="bg-purple-600 text-white">
                Ya, Terapkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
}