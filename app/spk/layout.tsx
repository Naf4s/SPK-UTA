"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Pastikan utils shadcn ada, atau hapus cn dan pakai string biasa

export default function SPKLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const steps = [
    { name: "1. Input Data", href: "/spk/data" },
    { name: "2. Atur Prioritas", href: "/spk/prioritas" },
    { name: "3. Hasil Analisis", href: "/spk/hasil" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Sederhana */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-blue-600 flex items-center gap-2">
            ⚖️ SPK Laptop
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-black">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Stepper Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-2 rounded-full shadow-sm border inline-flex gap-2">
            {steps.map((step) => {
              const isActive = pathname === step.href;
              return (
                <Link
                  key={step.href}
                  href={step.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {step.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content Halaman */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}