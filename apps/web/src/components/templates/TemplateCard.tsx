import { Download, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  id: string;
  title: string;
  phase: string;
  deliverable_type: string;
  sector: string;
  deal_structure: string;
  description: string;
  downloads: number;
  updated_at: string;
  verified: boolean;
  onClick: (id: string) => void;
}

const PHASE_COLORS: Record<string, string> = {
  sourcing: "bg-orange-50 text-orange-700 border-orange-200",
  diligence: "bg-amber-50 text-amber-800 border-amber-200",
  signing: "bg-emerald-50 text-emerald-700 border-emerald-200",
  integration: "bg-rose-50 text-rose-700 border-rose-200",
  exit: "bg-stone-100 text-stone-700 border-stone-300",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
}

export function TemplateCard({
  id,
  title,
  phase,
  deliverable_type,
  sector,
  deal_structure,
  description,
  downloads,
  updated_at,
  verified,
  onClick,
}: TemplateCardProps) {
  return (
    <div
      onClick={() => onClick(id)}
      className="group p-5 rounded-lg border bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            "px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide border",
            PHASE_COLORS[phase] || "bg-gray-50 text-gray-700 border-gray-200"
          )}
        >
          {phase}
        </span>
        {verified && (
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        )}
      </div>

      <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
        {description}
      </p>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
        <span className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {downloads}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(updated_at)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t">
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
          {formatType(deliverable_type)}
        </span>
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
          {formatType(sector)}
        </span>
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
          {formatType(deal_structure)}
        </span>
      </div>
    </div>
  );
}
