import FormLaptop from "@/components/FormLaptop";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DataPage() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Langkah 1: Masukkan Kandidat Laptop</h2>
        <p className="text-gray-500">Tambahkan minimal 2 laptop untuk dibandingkan.</p>
      </div>

      <FormLaptop />

      <div className="flex justify-end mt-8">
        <Link href="/spk/prioritas">
          <Button size="lg" className="gap-2">
            Lanjut ke Prioritas <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}