import BobotPrioritas from "@/components/BobotPrioritas";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function PrioritasPage() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Langkah 2: Tentukan Kebutuhanmu</h2>
        <p className="text-gray-500">Geser slider untuk menentukan kriteria yang paling penting.</p>
      </div>

      <BobotPrioritas />

      <div className="flex justify-between mt-8">
        <Link href="/spk/data">
          <Button variant="outline" size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <Link href="/spk/hasil">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
            Lihat Hasil Rekomendasi <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}