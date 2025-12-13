"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah pernah setuju?
    const consent = localStorage.getItem("spk_consent");
    
    // Jika belum ada record 'spk_consent', tampilkan banner setelah delay 1 detik
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Simpan persetujuan di LocalStorage
    localStorage.setItem("spk_consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-500">
      <Card className="shadow-2xl border-indigo-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 p-2 rounded-full hidden sm:block">
              <Cookie className="h-6 w-6 text-indigo-600" />
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-sm text-gray-900">
                Penyimpanan Data Lokal
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Website ini menggunakan <strong>LocalStorage/Cookies</strong> untuk menyimpan sesi dan preferensi hitungan Anda secara anonim. Data Anda tersimpan aman di browser Anda sendiri.
              </p>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleAccept} 
                  size="sm" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs font-bold"
                >
                  Saya Mengerti & Setuju
                </Button>
              </div>
            </div>

            {/* Tombol Close Kecil (Opsional) */}
            <button 
              onClick={() => setShow(false)} 
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}