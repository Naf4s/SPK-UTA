"use client";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import FormLaptop from "@/components/FormLaptop"; // Reuse FormLaptop
import { useSessionID } from "@/hooks/useSessionID"; // 1. Import Hook Session

export default function AlternatifManager() {
  const sessionId = useSessionID(); // 2. Ambil Session ID
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null); // Data yang sedang diedit

  const fetchData = async () => {
    if (!sessionId) return; // Tunggu session siap
    setLoading(true);
    try {
      const res = await fetch("/api/alternatif", {
        headers: { "x-session-id": sessionId } // 3. Kirim Header Session saat GET
      }); 
      const json = await res.json();
      setData(json);
    } catch (e) {
      toast.error("Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]); // Jalankan ulang jika session berubah

  const handleDelete = async (id: number) => {
    if(!confirm("Yakin hapus?")) return;
    try {
      await fetch("/api/alternatif", { 
          method: "DELETE", 
          headers: { 
            "Content-Type": "application/json",
            "x-session-id": sessionId // 4. Kirim Header Session saat DELETE
          },
          body: JSON.stringify({ id }) 
      });
      toast.success("Dihapus");
      fetchData();
    } catch(e) { toast.error("Gagal hapus"); }
  };

  const openAdd = () => {
    setEditData(null); // Mode Create
    setIsDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditData(item); // Mode Edit
    setIsDialogOpen(true);
  };

  // Callback saat form sukses simpan/update
  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchData(); // Refresh tabel
  };

  return (
    <Card className="shadow-lg border-t-4 border-t-blue-600">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600"/> Master Data Alternatif
            </CardTitle>
            <p className="text-sm text-gray-500">Kelola data mentah (spesifikasi asli) laptop.</p>
        </div>
        {/* Tombol Tambah yang Membuka Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={openAdd} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4"/> Tambah Data
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editData ? "Edit Data Laptop" : "Tambah Laptop Baru"}</DialogTitle>
                </DialogHeader>
                {/* Reuse FormLaptop dengan Props */}
                <FormLaptop dataToEdit={editData} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>

      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center py-8 text-gray-400">
                <Loader2 className="animate-spin mr-2" /> Memuat data...
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nama Laptop</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Spesifikasi (Preview)</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                            Belum ada data. Silakan tambah laptop.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-bold">{item.nama}</TableCell>
                        <TableCell className="text-gray-500 text-xs truncate max-w-[150px]">{item.detail || "-"}</TableCell>
                        <TableCell className="text-xs text-gray-400">
                            {/* Tampilkan 3 spek pertama sebagai preview */}
                            {item.matriks.slice(0, 3).map((m: any) => (
                                <span key={m.id} className="mr-2 bg-gray-100 px-1 rounded">
                                    {m.nilai}
                                </span>
                            ))}
                            {item.matriks.length > 3 && "..."}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4 text-amber-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}