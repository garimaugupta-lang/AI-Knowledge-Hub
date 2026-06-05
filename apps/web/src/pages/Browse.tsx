import { useEffect, useState } from "react";
import { fetchTemplates, searchTemplates } from "@/lib/api";
import { StatsBar } from "@/components/templates/StatsBar";
import { SearchBar } from "@/components/templates/SearchBar";
import { FilterChips } from "@/components/templates/FilterChips";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDetail } from "@/components/templates/TemplateDetail";

interface TemplateData {
  id: string;
  title: string;
  phase: string;
  deliverable_type: string;
  sector: string;
  deal_structure: string;
  description: string;
  contributor_name: string;
  downloads: number;
  updated_at: string;
  verified: boolean;
  sanitised_filepath: string | null;
  metadata: {
    inputs_required: string[];
    assumptions: string[];
    confirmed_facts: string[];
  } | null;
}

export function Browse() {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [activePhase]);

  async function loadTemplates() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activePhase) params.phase = activePhase;
      const data = await fetchTemplates(params);
      setTemplates(data.templates);
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    if (!query.trim()) {
      loadTemplates();
      return;
    }
    setLoading(true);
    try {
      const data = await searchTemplates(query);
      setTemplates(data.templates);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalDownloads = templates.reduce((sum, t) => sum + t.downloads, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-2">
          Template Library
        </h1>
        <p className="text-muted-foreground">
          Search and reuse sanitised deal deliverables across the firm.
        </p>
      </div>

      <StatsBar totalTemplates={templates.length} totalDownloads={totalDownloads} />
      <SearchBar onSearch={handleSearch} />
      <FilterChips activePhase={activePhase} onPhaseChange={setActivePhase} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-muted-foreground text-sm">Loading templates...</div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No templates found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              {...template}
              onClick={() => setSelectedTemplate(template)}
            />
          ))}
        </div>
      )}

      {selectedTemplate && (
        <TemplateDetail
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
