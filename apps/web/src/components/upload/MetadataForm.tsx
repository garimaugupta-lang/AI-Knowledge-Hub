import { useState } from "react";
import { Sparkles } from "lucide-react";

interface MetadataFormProps {
  suggestedMetadata: {
    title: string;
    phase: string;
    deliverable_type: string;
    sector: string;
    deal_structure: string;
    description: string;
    inputs_required: string[];
    assumptions: string[];
    confirmed_facts: string[];
  };
  onPublish: (data: any) => void;
  isPublishing: boolean;
}

const PHASES = [
  { value: "sourcing", label: "Sourcing" },
  { value: "diligence", label: "Diligence" },
  { value: "signing", label: "Signing" },
  { value: "integration", label: "Integration" },
  { value: "exit", label: "TSA Exit" },
];

const TYPES = [
  { value: "workplan", label: "Workplan" },
  { value: "tracker", label: "Tracker" },
  { value: "model", label: "Model" },
  { value: "memo", label: "Memo" },
  { value: "checklist", label: "Checklist" },
  { value: "report", label: "Report" },
  { value: "template", label: "Template" },
  { value: "analysis", label: "Analysis" },
];

const SECTORS = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "industrials", label: "Industrials" },
  { value: "consumer_retail", label: "Consumer & Retail" },
  { value: "financial_services", label: "Financial Services" },
  { value: "energy", label: "Energy" },
  { value: "cross_sector", label: "Cross-Sector" },
];

const STRUCTURES = [
  { value: "acquisition", label: "Acquisition" },
  { value: "merger", label: "Merger" },
  { value: "carve_out", label: "Carve-out" },
  { value: "joint_venture", label: "Joint Venture" },
  { value: "divestiture", label: "Divestiture" },
  { value: "lbo", label: "LBO" },
];

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-700 ml-2">
      <Sparkles className="h-2.5 w-2.5" />
      AI
    </span>
  );
}

export function MetadataForm({ suggestedMetadata, onPublish, isPublishing }: MetadataFormProps) {
  const [form, setForm] = useState({
    title: suggestedMetadata.title,
    phase: suggestedMetadata.phase,
    deliverable_type: suggestedMetadata.deliverable_type,
    sector: suggestedMetadata.sector,
    deal_structure: suggestedMetadata.deal_structure,
    description: suggestedMetadata.description,
    contributor_name: "",
    inputs_required: suggestedMetadata.inputs_required.join("\n"),
    assumptions: suggestedMetadata.assumptions.join("\n"),
    confirmed_facts: suggestedMetadata.confirmed_facts.join("\n"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPublish({
      ...form,
      inputs_required: form.inputs_required.split("\n").filter(Boolean),
      assumptions: form.assumptions.split("\n").filter(Boolean),
      confirmed_facts: form.confirmed_facts.split("\n").filter(Boolean),
    });
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-medium">
          Title <AIBadge />
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">
            Deal Phase <AIBadge />
          </label>
          <select
            value={form.phase}
            onChange={(e) => update("phase", e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {PHASES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">
            Deliverable Type <AIBadge />
          </label>
          <select
            value={form.deliverable_type}
            onChange={(e) => update("deliverable_type", e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">
            Sector <AIBadge />
          </label>
          <select
            value={form.sector}
            onChange={(e) => update("sector", e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">
            Deal Structure <AIBadge />
          </label>
          <select
            value={form.deal_structure}
            onChange={(e) => update("deal_structure", e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {STRUCTURES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">
          Description <AIBadge />
        </label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className="mt-1 w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Your Name</label>
        <input
          type="text"
          value={form.contributor_name}
          onChange={(e) => update("contributor_name", e.target.value)}
          placeholder="e.g. Sarah Chen"
          className="mt-1 w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Inputs Required <AIBadge />
          <span className="text-xs text-muted-foreground ml-2">(one per line)</span>
        </label>
        <textarea
          value={form.inputs_required}
          onChange={(e) => update("inputs_required", e.target.value)}
          rows={4}
          className="mt-1 w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">
            Assumptions <AIBadge />
            <span className="text-xs text-muted-foreground ml-1">(one per line)</span>
          </label>
          <textarea
            value={form.assumptions}
            onChange={(e) => update("assumptions", e.target.value)}
            rows={4}
            className="mt-1 w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            Confirmed Facts <AIBadge />
            <span className="text-xs text-muted-foreground ml-1">(one per line)</span>
          </label>
          <textarea
            value={form.confirmed_facts}
            onChange={(e) => update("confirmed_facts", e.target.value)}
            rows={4}
            className="mt-1 w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPublishing || !form.title}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isPublishing ? "Publishing..." : "Publish Template"}
      </button>
    </form>
  );
}
