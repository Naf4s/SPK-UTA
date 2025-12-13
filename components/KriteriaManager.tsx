"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, Library, Plus, Trash2, Lock } from "lucide-react"; 
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
import { useSessionID } from "@/hooks/useSessionID";

export default function KriteriaManager() {
  const sessionId = useSessionID();
  const [kriteria, setKriteria] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // State untuk Form Tambah Baru
  const [newNama, setNewNama] = useState("");
  const [newTipe, setNewTipe] = useState("benefit");
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch Data dari DB (Structure) + LocalStorage (Status Aktif)
  const fetchData = async () => {
    if (!sessionId) return;
    
    // Fetch daftar kriteria dari server (System + Custom punya user ini)
    const res = await fetch("/api/kriteria", {
      headers: { "x-session-id": sessionId }
    });
    const dbData = await res.json();

    // Fetch konfigurasi aktif dari LocalStorage
    const savedConfig = localStorage.getItem("spk_active_config");
    const parsedConfig = savedConfig ? JSON.parse(savedConfig) : {};

    // Gabungkan: Jika tidak ada di config lokal, default True (Aktif)
    const mergedData = dbData.map((k: any) => ({
      ...k, // PERBAIKAN: Menggunakan spread pada item (k), bukan state array (kriteria)
      aktif: parsedConfig[k.id] !== undefined ? parsedConfig[k.id] : true
    }));

    setKriteria(mergedData);
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleToggle = (id: number, currentStatus: boolean) => {
    setKriteria((prev) =>
        prev.map((k) => (k.id === id ? { ...k, aktif: !currentStatus } : k))
    );
  };

  // Logic Simpan Konfigurasi (On/Off)
  const handleSaveConfig = async () => {
    setLoading(true);
    
    // Delay simulasi proses
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Siapkan object config: { "1": true, "2": false }
      const configToSave = kriteria.reduce((acc, curr) => ({
        ...acc,
        [curr.id]: curr.aktif
      }), {});

      // Simpan ke Browser
      localStorage.setItem("spk_active_config", JSON.stringify(configToSave));
      
      // Beritahu komponen lain (BobotPrioritas) untuk update tampilan
      window.dispatchEvent(new Event("kriteria-config-updated"));

      toast.success("Konfigurasi disimpan di browser!");
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  // Logic Tambah Kriteria Baru
  const handleAddCustom = async () => {
    if (!newNama) return toast.error("Isi nama kriteria");
    setLoading(true);
    try {
      await fetch("/api/kriteria", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-id": sessionId },
        body: JSON.stringify({ nama: newNama, tipe: newTipe }),
      });
      toast.success("Kriteria berhasil dibuat");
      setOpenDialog(false);
      setNewNama("");
      fetchData(); // Refresh list
    } catch(e) { toast.error("Gagal"); } 
    finally { setLoading(false); }
  };
  
  // Fungsi Hapus Kriteria Custom
  const handleDeleteCriteria = async (id: number) => {
    try {
          await fetch("/api/kriteria", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "x-session-id": sessionId },
            body: JSON.stringify({ id }),
          });
          toast.success("Dihapus");
          fetchData();
        } catch(e) { toast.error("Gagal"); }
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-indigo-500 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5 text-indigo-600" />
              Bank Kriteria
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Kelola kriteria sistem. Anda juga bisa menambahkan kriteria sendiri.
            </p>
          </div>
          
          {/* TOMBOL TAMBAH KRITERIA CUSTOM */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                <Plus className="h-4 w-4" /> Tambah Manual
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kriteria Custom</DialogTitle>
                <DialogDescription>
                  Kriteria ini akan ditambahkan ke database. <br/>
                  <span className="text-red-500 text-xs font-bold">Peringatan: Laptop lama akan bernilai 0 untuk kriteria ini. Harap update data laptop setelah ini.</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Kriteria</Label>
                  <Input 
                    placeholder="Contoh: Kamera Webcam, Port USB..." 
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipe Penilaian</Label>
                  <Select value={newTipe} onValueChange={setNewTipe}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="benefit">Benefit (Semakin Besar Semakin Bagus)</SelectItem>
                      <SelectItem value="cost">Cost (Semakin Kecil Semakin Bagus)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleAddCustom} disabled={loading}>
                  {loading ? "Menambahkan..." : "Simpan Kriteria Baru"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {kriteria.map((k) => (
              <div 
                key={k.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  k.aktif ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-200 opacity-60"
                }`}
              >
                <div className="space-y-1">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {k.nama}
                    {/* Badge System vs Custom */}
                    {k.isSystem ? (
                       <Badge variant="secondary" className="text-[10px] gap-1 px-1 h-5"><Lock className="w-3 h-3"/> Bawaan</Badge>
                    ) : (
                       <Badge variant="outline" className="text-[10px] bg-white text-indigo-600 border-indigo-200">Custom</Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex gap-2">
                    <span className="uppercase bg-gray-100 px-1 rounded">{k.kode}</span>
                    <span>{k.tipe === 'benefit' ? 'Benefit 📈' : 'Cost 📉'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Switch On/Off Selalu Ada */}
                  <Switch 
                    checked={k.aktif}
                    onCheckedChange={() => handleToggle(k.id, k.aktif)}
                  />

                  {/* Tombol Hapus HANYA untuk Custom (bukan System) */}
                  {!k.isSystem && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Kriteria Custom?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Kriteria <strong>{k.nama}</strong> dan semua nilai matriks yang terkait pada setiap laptop akan dihapus permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCriteria(k.id)} className="bg-red-600 text-white">
                            Ya, Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSaveConfig} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
            {loading ? "Menyimpan..." : (
              <><Save className="mr-2 h-4 w-4" /> Simpan Konfigurasi</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}