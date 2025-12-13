import KriteriaManager from "@/components/KriteriaManager";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function KriteriaPage() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Pengaturan Kriteria</h2>
        <p className="text-gray-500">
          Aktifkan atau nonaktifkan kriteria sesuai kebutuhan analisis projectmu.
        </p>
      </div>

      <KriteriaManager />

      <div className="flex justify-between mt-8">
        <Link href="/dashboard">
          <Button variant="outline" size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Ke Dashboard
          </Button>
        </Link>
        <Link href="/spk/data">
          <Button size="lg" className="gap-2">
            Lanjut Input Data <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}