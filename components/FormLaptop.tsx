"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, CheckCircle, Pencil } from "lucide-react"; 
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
import { useSessionID } from "@/hooks/useSessionID"; // 1. Import Hook Session

// Definisikan Props agar bisa menerima data edit (jika dipanggil dari Manager)
interface FormLaptopProps {
  dataToEdit?: any;       
  onSuccess?: () => void; 
}

export default function FormLaptop({ dataToEdit, onSuccess }: FormLaptopProps) {
  const sessionId = useSessionID(); // 2. Ambil Session ID
  const [kriteria, setKriteria] = useState<any[]>([]);
  const [nama, setNama] = useState("");
  const [detail, setDetail] = useState("");
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [open, setOpen] = useState(false);

  const isEditMode = !!dataToEdit;

  // 3. Load Kriteria (System + Custom Session + Filter Aktif LocalStorage)
  useEffect(() => {
    const initKriteria = async () => {
      if (!sessionId) return;

      // Ambil semua kriteria (System + Custom milik user ini)
      const res = await fetch("/api/kriteria", {
        headers: { "x-session-id": sessionId }
      });
      const dbData = await res.json();

      // Ambil Config Aktif/Non-Aktif dari LocalStorage
      const savedConfig = localStorage.getItem("spk_active_config");
      const config = savedConfig ? JSON.parse(savedConfig) : {};

      // Filter: Hanya tampilkan yang AKTIF
      const activeItems = dbData.filter((k: any) => 
        config[k.id] !== undefined ? config[k.id] : true
      );

      setKriteria(activeItems);
    };

    initKriteria();

    // Listener jika user mengubah config di tab lain/komponen lain
    const handler = () => initKriteria();
    window.addEventListener("kriteria-config-updated", handler);
    return () => window.removeEventListener("kriteria-config-updated", handler);
  }, [sessionId]);

  // Load Data Edit (Jika ada)
  useEffect(() => {
    if (dataToEdit) {
      setNama(dataToEdit.nama);
      setDetail(dataToEdit.detail || "");
      
      const existingSpecs: Record<string, string> = {};
      dataToEdit.matriks.forEach((m: any) => {
        existingSpecs[m.kriteriaId] = m.nilai.toString();
      });
      setSpecs(existingSpecs);
    }
  }, [dataToEdit]);

  // Validasi Form
  useEffect(() => {
    const isNamaFilled = nama.trim().length > 0;
    // Cek spek wajib diisi (Hanya untuk kriteria yang sedang tampil/aktif)
    const isSpecsFilled = kriteria.every(k => specs[k.id] && specs[k.id].toString().length > 0);
        
    setIsFormValid(isNamaFilled && isSpecsFilled);
  }, [nama, specs, kriteria]);

  const getOptions = (nama: string) => { 
     const n = nama.toLowerCase();
     if (n.includes("ram")) return ["4", "8", "12", "16", "32", "64"];
     if (n.includes("ssd") || n.includes("penyimpanan")) return ["128", "256", "512", "1024", "2048"];
     return null;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    
    setLoading(true);

    try {
      const url = isEditMode ? "/api/alternatif" : "/api/alternatif";
      const method = isEditMode ? "PUT" : "POST";
      
      const payload = { 
        id: dataToEdit?.id,
        nama, 
        detail, 
        specs 
      };

      const res = await fetch(url, {
        method: method,
        headers: { 
            "Content-Type": "application/json",
            "x-session-id": sessionId // 4. Kirim ID Sesi saat simpan
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      toast.success(isEditMode ? "Data berhasil diperbarui!" : "Laptop berhasil ditambahkan!");
      
      if (!isEditMode) {
        setNama(""); 
        setDetail(""); 
        setSpecs({});
      }
      setOpen(false);
      
      if (onSuccess) onSuccess();
      // Jika mode input biasa (bukan modal edit), reload biar tabel update
      if (!onSuccess && !isEditMode) window.location.reload();

    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  // Wrapper Logic agar fleksibel (bisa jadi Card mandiri atau div dalam Modal)
  const Wrapper = onSuccess ? "div" : Card;
  const WrapperContent = onSuccess ? "div" : CardContent;
  const WrapperHeader = onSuccess ? "div" : CardHeader;

  return (
    <Wrapper className={!onSuccess ? "border-l-4 border-l-blue-500 shadow-md" : ""}>
      {!onSuccess && (
        <WrapperHeader>
            <CardTitle className="flex items-center gap-2">
               💻 Input Data Laptop
            </CardTitle>
             <p className="text-sm text-gray-500">
                Hanya kriteria aktif yang akan ditampilkan di sini.
            </p>
        </WrapperHeader>
      )}
      
      <WrapperContent className={onSuccess ? "pt-4" : ""}>
        <form className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama / Seri Laptop <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="Contoh: Asus TUF F15" 
                value={nama} 
                onChange={(e) => setNama(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Link / Catatan</Label>
              <Input 
                placeholder="Opsional..." 
                value={detail} 
                onChange={(e) => setDetail(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="border-t border-dashed my-2" />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kriteria.length === 0 && (
                  <div className="col-span-2 text-center text-gray-400 py-4 italic">
                      Sedang memuat kriteria aktif...
                  </div>
              )}

              {kriteria.map((k) => {
                const options = getOptions(k.nama);
                return (
                  <div key={k.id} className="space-y-2">
                    <Label className="flex justify-between text-sm font-semibold">
                      {k.nama} <span className="text-red-500">*</span>
                    </Label>
                    {options ? (
                      <Select 
                        onValueChange={(val) => setSpecs({ ...specs, [k.id]: val })} 
                        value={specs[k.id] || ""}
                      >
                         <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                         <SelectContent>
                           {options.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                         </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        type="number" 
                        placeholder={`Nilai ${k.nama}...`}
                        value={specs[k.id] || ""} 
                        onChange={(e) => setSpecs({ ...specs, [k.id]: e.target.value })} 
                        className="bg-gray-50/50"
                      />
                    )}
                  </div>
                );
              })}
            </div>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                type="button" 
                className={`w-full h-10 font-bold ${isEditMode ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"}`}
                disabled={loading || !isFormValid}
              >
                {loading ? "Memproses..." : (
                  <>
                    {isEditMode ? <Pencil className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />} 
                    {isEditMode ? "Update Data" : "Simpan Data"}
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                    {isEditMode ? "Konfirmasi Perubahan" : "Simpan Data Baru"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Pastikan spesifikasi laptop <strong>{nama}</strong> sudah sesuai.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cek Lagi</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit} className={isEditMode ? "bg-amber-600" : "bg-blue-600"}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Ya, {isEditMode ? "Update" : "Simpan"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </WrapperContent>
    </Wrapper>
  );
}