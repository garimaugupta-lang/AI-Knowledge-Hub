import { cn } from "@/lib/utils";

const PHASES = [
  { value: "", label: "All Phases" },
  { value: "sourcing", label: "Sourcing" },
  { value: "diligence", label: "Diligence" },
  { value: "signing", label: "Signing" },
  { value: "integration", label: "Integration" },
  { value: "exit", label: "TSA Exit" },
];

interface FilterChipsProps {
  activePhase: string;
  onPhaseChange: (phase: string) => void;
}

export function FilterChips({ activePhase, onPhaseChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {PHASES.map((phase) => (
        <button
          key={phase.value}
          onClick={() => onPhaseChange(phase.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
            activePhase === phase.value
              ? "bg-[#FF6600] text-white border-[#FF6600]"
              : "bg-card text-muted-foreground border-border hover:border-[#FF6600]/50 hover:text-foreground"
          )}
        >
          {phase.label}
        </button>
      ))}
    </div>
  );
}
