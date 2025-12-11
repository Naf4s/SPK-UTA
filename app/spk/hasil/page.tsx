import HasilRanking from "@/components/HasilRanking";
import GrafikPerbandingan from "@/components/GrafikPerbandingan";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

export default function HasilPage() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Langkah 3: Analisis Keputusan</h2>
        <p className="text-gray-500">Berikut adalah rekomendasi terbaik berdasarkan data dan prioritasmu.</p>
      </div>

      <GrafikPerbandingan />
      <HasilRanking />

      <div className="flex justify-center mt-12 pb-10">
        <Link href="/">
          <Button variant="outline" size="lg" className="gap-2">
            <Home className="h-4 w-4" /> Kembali ke Halaman Utama
          </Button>
        </Link>
      </div>
    </div>
  );
}