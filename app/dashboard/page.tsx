import DashboardSummary from "@/components/DashboardSummary";
import HasilRanking from "@/components/HasilRanking";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
            <Link href="/">
                <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4"/> Kembali</Button>
            </Link>
        </div>
        
        <DashboardSummary />
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-4">Master Data Ranking</h3>
            <HasilRanking />
        </div>
      </div>
    </div>
  );
}