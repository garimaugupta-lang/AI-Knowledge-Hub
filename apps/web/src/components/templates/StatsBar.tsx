import { FileText, Download, Users } from "lucide-react";

interface StatsBarProps {
  totalTemplates: number;
  totalDownloads: number;
}

export function StatsBar({ totalTemplates, totalDownloads }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
        <div className="p-2 rounded-md bg-orange-50">
          <FileText className="h-5 w-5 text-[#FF6600]" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{totalTemplates}</p>
          <p className="text-sm text-muted-foreground">Templates</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
        <div className="p-2 rounded-md bg-orange-50">
          <Download className="h-5 w-5 text-[#FF6600]" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{totalDownloads}</p>
          <p className="text-sm text-muted-foreground">Downloads</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
        <div className="p-2 rounded-md bg-orange-50">
          <Users className="h-5 w-5 text-[#FF6600]" />
        </div>
        <div>
          <p className="text-2xl font-semibold">Q2 2026</p>
          <p className="text-sm text-muted-foreground">Current Quarter</p>
        </div>
      </div>
    </div>
  );
}
