"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, RotateCcw } from "lucide-react"; // Ikon baru
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSessionID } from "@/hooks/useSessionID";

type Kriteria = {
  id: number;
  nama: string;
  kode: string;
  tipe: string;
  bobot: number; // Bobot default dari DB
  rawValue?: number; // Nilai slider user (1-10)
};

export default function BobotPrioritas() {
  const [kriteria, setKriteria] = useState<Kriteria[]>([]);
  const sessionId = useSessionID();
  
  // 1. Load Data
useEffect(() => {
    const initData = async () => {
      if (!sessionId) return; // Tunggu session
      
      const res = await fetch("/api/kriteria", { 
          headers: { "x-session-id": sessionId } 
      });
      const dataDB = await res.json();

      // 1. Filter mana yang AKTIF berdasarkan LocalStorage
      const configStr = localStorage.getItem("spk_active_config");
      const config = configStr ? JSON.parse(configStr) : {};
      
      // Defaultnya TRUE (Aktif) jika tidak ada di config
      const activeCriteria = dataDB.filter((k: any) => 
        config[k.id] !== undefined ? config[k.id] : true
      );

      // 2. Load Bobot Slider dari LocalStorage
      const savedBobot = localStorage.getItem("spk_user_pref");
      const parsedPref = savedBobot ? JSON.parse(savedBobot) : {};

      const finalData = activeCriteria.map((k: any) => ({
        ...k,
        rawValue: parsedPref[k.id] || 5 
      }));

      setKriteria(finalData);
    };
    
    // Listen juga event update biar sync
    const handler = () => initData();
    window.addEventListener("kriteria-config-updated", handler);

    initData();
    
    return () => window.removeEventListener("kriteria-config-updated", handler);
  }, [sessionId]);

  // 2. Handle Perubahan Slider (Auto Save ke LocalStorage)
  const handleSliderChange = (id: number, val: number[]) => {
    const newValue = val[0];
    
    const updated = kriteria.map((k) => 
      k.id === id ? { ...k, rawValue: newValue } : k
    );
    setKriteria(updated);

    // Simpan PREFERENSI MENTAH (Skala 1-10) ke LocalStorage
    // Kita simpan object sederhana: { "1": 8, "2": 3 } biar hemat
    const prefToSave = updated.reduce((acc, curr) => ({
      ...acc,
      [curr.id]: curr.rawValue
    }), {});
    
    localStorage.setItem("spk_user_pref", JSON.stringify(prefToSave));
    
    // Dispatch event agar komponen lain (Grafik/Tabel) tahu ada perubahan bobot
    window.dispatchEvent(new Event("bobot-updated"));
  };

  // 3. Reset ke Default
  const handleReset = () => {
    const resetData = kriteria.map(k => ({ ...k, rawValue: 5 }));
    setKriteria(resetData);
    localStorage.removeItem("spk_user_pref");
    window.dispatchEvent(new Event("bobot-updated"));
    toast.info("Prioritas dikembalikan ke default");
  };

  return (
    <Card className="mb-8 border-l-4 border-l-purple-500 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SlidersHorizontal className="h-5 w-5 text-purple-600" />
            Atur Prioritas Pribadi
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Geser slider. Perubahan tersimpan otomatis di browser Anda.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-400 hover:text-red-500">
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {kriteria.map((k) => (
          <div key={k.id} className="flex items-center gap-4">
            <div className="w-1/3 md:w-1/4">
              <p className="font-bold text-sm">{k.nama}</p>
              <div className="flex gap-1 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1 h-5">{k.kode}</Badge>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded h-5 flex items-center">
                  {k.tipe}
                </span>
              </div>
            </div>
            
            <Slider
              value={[k.rawValue || 5]}
              max={10}
              step={1}
              className="flex-1 cursor-pointer"
              onValueChange={(val) => handleSliderChange(k.id, val)}
            />
            
            <div className={`w-12 text-center font-bold rounded p-1 text-sm ${
              (k.rawValue || 0) >= 8 ? "text-purple-700 bg-purple-100" : 
              (k.rawValue || 0) <= 3 ? "text-gray-400 bg-gray-50" : "text-gray-700 bg-gray-100"
            }`}>
              {k.rawValue}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}