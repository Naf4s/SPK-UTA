// import BobotPrioritas from "@/components/BobotPrioritas";
// import FormLaptop from "@/components/FormLaptop";
// import HasilRanking from "@/components/HasilRanking";
// import GrafikPerbandingan from "@/components/GrafikPerbandingan";
// import DashboardSummary from "@/components/DashboardSummary";

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-6xl mx-auto space-y-8">
        
//         <header className="mb-8 text-center pt-8">
//           <div className="inline-block p-3 rounded-full bg-blue-100 mb-4">
//             <span className="text-4xl">⚖️</span>
//           </div>
//           <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
//             SPK Pemilihan Laptop
//           </h1>
//           <p className="text-gray-500 text-lg">
//             Sistem Pendukung Keputusan Cerdas dengan Metode UTA
//           </p>
//         </header>

// <DashboardSummary />

//         {/* Layout Grid: Kiri (Input & Bobot) - Kanan (Hasil & Grafik) */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
//           {/* KOLOM KIRI: Area Kerja User (Input) */}
//           <div className="lg:col-span-5 space-y-6">
//             <BobotPrioritas />
//             <FormLaptop />
//           </div>

//           {/* KOLOM KANAN: Area Visualisasi (Output) */}
//           <div className="lg:col-span-7 space-y-6">
//             <GrafikPerbandingan />
//             <HasilRanking />
//           </div>

//         </div>

//         {/* 1. Modul Pengaturan Prioritas */}
//         <section>
//           <BobotPrioritas />
//         </section>

//         {/* 2. Modul Input Data */}
//         <section>
//           <FormLaptop />
//         </section>

//         {/* 3. Grafik Analisis (Baru) */}
//         <section>
//           <GrafikPerbandingan />
//         </section>

//         {/* 4. Hasil Perhitungan (Baru) */}
//         <section>
//           <HasilRanking />
//         </section>

//       </div>
//     </main>
//   );
// }

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Laptop, Settings } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-1000">
        <div className="inline-block p-4 rounded-full bg-blue-100 mb-4 shadow-sm">
          <span className="text-4xl">⚖️</span>
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Sistem Pendukung Keputusan <br/>
          <span className="text-blue-600">Pemilihan Laptop Terbaik</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Bingung memilih laptop untuk kuliah atau kerja? Gunakan metode UTA (Utility Additive) untuk menemukan rekomendasi paling akurat sesuai prioritasmu.
        </p>

        <div className="flex gap-4 justify-center pt-8">
          <Link href="/spk/data">
            <Button size="lg" className="text-lg h-14 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
              Mulai Analisis Sekarang <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="text-lg h-14 px-8">
              Lihat Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full">
        <FeatureCard 
          icon={<Laptop className="h-8 w-8 text-blue-500" />}
          title="Input Fleksibel"
          desc="Masukkan spesifikasi laptop kandidat dengan mudah dan cepat."
        />
        <FeatureCard 
          icon={<Settings className="h-8 w-8 text-purple-500" />}
          title="Atur Prioritas"
          desc="Tentukan kriteria mana yang paling penting bagimu (Harga vs Performa)."
        />
        <FeatureCard 
          icon={<BarChart3 className="h-8 w-8 text-orange-500" />}
          title="Analisis Visual"
          desc="Lihat perbandingan grafik dan ranking skor yang transparan."
        />
      </div>

      <footer className="mt-20 text-gray-400 text-sm">
        © 2025 SPK UTA. Created with ❤️ Next.js & Shadcn/ui.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md border hover:shadow-lg transition-all">
      <div className="mb-4 bg-gray-50 w-fit p-3 rounded-lg">{icon}</div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </div>
  );
}