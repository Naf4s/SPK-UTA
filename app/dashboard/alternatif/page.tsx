import AlternatifManager from "@/components/AlternatifManager";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export default function AlternatifPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div >
          <h2 className="text-2xl font-bold">Manajemen Data Alternatif</h2>
          <p className="text-gray-500">
            Tambah, Edit, atau Hapus data laptop kandidat di sini.
          </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/> Kembali</Button>
          </Link>
        </div>
      

      <AlternatifManager />
      
    </div>
  );
}