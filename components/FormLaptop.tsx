"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner"; 
import { PlusCircle, CheckCircle } from "lucide-react"; 
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

export default function FormLaptop() {
  const [kriteria, setKriteria] = useState<any[]>([]);
  const [nama, setNama] = useState("");
  const [detail, setDetail] = useState("");
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // PERUBAHAN 1: Tambahkan state untuk mengontrol Dialog secara manual
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/kriteria").then((res) => res.json()).then(setKriteria);
  }, []);

  useEffect(() => {
    const isNamaFilled = nama.trim().length > 0;
    const isSpecsFilled = kriteria.every(k => specs[k.id] && specs[k.id].toString().length > 0);
    setIsFormValid(isNamaFilled && isSpecsFilled);
  }, [nama, specs, kriteria]);

  const getPlaceholder = (nama: string) => {
    const n = nama.toLowerCase();
    if (n.includes("harga")) return "Contoh: 15000000 (Tanpa titik)";
    if (n.includes("berat")) return "Contoh: 1.5 (Satuan Kg)";
    if (n.includes("baterai")) return "Contoh: 8 (Jam)";
    if (n.includes("skor")) return "Contoh: 15000 (Cinebench/Antutu)";
    return `Masukkan nilai ${nama}...`;
  };

  const getOptions = (nama: string) => {
    const n = nama.toLowerCase();
    if (n.includes("ram")) return ["4", "8", "12", "16", "32", "64"];
    if (n.includes("ssd")) return ["128", "256", "512", "1024", "2048"];
    return null;
  };

  // PERUBAHAN 2: Hapus parameter 'e: React.FormEvent' karena dipanggil dari onClick biasa
  const handleSubmit = async (e: React.MouseEvent) => {
    // Mencegah dialog tertutup otomatis sebelum proses selesai
    e.preventDefault(); 
    
    setLoading(true);

    try {
      const res = await fetch("/api/alternatif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, detail, specs }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      toast.success("Laptop berhasil ditambahkan!");
      setNama(""); 
      setDetail(""); 
      setSpecs({});
      
      // PERUBAHAN 3: Tutup dialog HANYA jika sukses
      setOpen(false); 
      
      // Opsional: Reload halaman jika diperlukan
      window.location.reload(); 

    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Data Laptop</CardTitle>
        <p className="text-sm text-gray-500">
          Masukkan spesifikasi laptop. Untuk RAM & SSD, pilih dari opsi yang tersedia.
        </p>
      </CardHeader>
      <CardContent>
        {/* Hapus onSubmit di form karena kita handle di tombol dialog */}
        <form className="space-y-6"> 
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama / Seri Laptop</Label>
              <Input 
                placeholder="Contoh: Asus TUF F15 FX506" 
                value={nama} 
                onChange={(e) => setNama(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Link / Catatan (Opsional)</Label>
              <Input 
                placeholder="Contoh: Link Tokopedia..." 
                value={detail} 
                onChange={(e) => setDetail(e.target.value)} 
              />
            </div>
          </div>

          <div className="border-t border-dashed my-2" />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900">Spesifikasi Teknis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kriteria.map((k) => {
                const options = getOptions(k.nama);

                return (
                  <div key={k.id} className="space-y-2">
                    <Label className="flex justify-between">
                      <span>{k.nama}</span>
                      <span className="text-xs text-gray-400 italic">
                        {k.tipe === 'cost' ? '(Makin kecil makin bagus)' : '(Makin besar makin bagus)'}
                      </span>
                    </Label>

                    {options ? (
                      <Select 
                        onValueChange={(val) => setSpecs({ ...specs, [k.id]: val })}
                        value={specs[k.id] || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Pilih ${k.nama}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt} {k.nama.toLowerCase().includes("ssd") ? "GB" : "GB"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="number"
                        placeholder={getPlaceholder(k.nama)}
                        value={specs[k.id] || ""}
                        onChange={(e) => setSpecs({ ...specs, [k.id]: e.target.value })}
                        required
                        className="bg-gray-50/50"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* PERUBAHAN 4: Tambahkan props 'open' dan 'onOpenChange' */}
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                type="button" 
                className="w-full h-10 font-bold text-lg" 
                disabled={loading || !isFormValid}
              >
                {loading ? "Menyimpan..." : (
                  <>
                    <PlusCircle className="mr-2" /> Simpan Data Laptop
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cek Data Kembali</AlertDialogTitle>
                <AlertDialogDescription>
                  Kamu akan menambahkan <strong>{nama}</strong> ke dalam sistem.
                  Pastikan semua spesifikasi (Harga, RAM, dll) sudah sesuai dengan data toko.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Periksa Lagi</AlertDialogCancel>
                {/* PERUBAHAN 5: Panggil handleSubmit disini & tambahkan loading state */}
                <AlertDialogAction onClick={handleSubmit} className="bg-blue-600 text-white" disabled={loading}>
                  {loading ? (
                     "Menyimpan..." 
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Ya, Simpan Data
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </CardContent>
    </Card>
  );
}