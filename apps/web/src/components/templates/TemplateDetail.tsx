import { X, Download, CheckCircle, AlertTriangle } from "lucide-react";

interface TemplateDetailProps {
  template: {
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
    sanitised_filepath: string | null;
    metadata: {
      inputs_required: string[];
      assumptions: string[];
      confirmed_facts: string[];
    } | null;
  };
  onClose: () => void;
}

export function TemplateDetail({ template, onClose }: TemplateDetailProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold pr-4">
            {template.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-muted">{template.phase}</span>
            <span className="px-2 py-1 rounded bg-muted">{template.deliverable_type}</span>
            <span className="px-2 py-1 rounded bg-muted">{template.sector}</span>
            <span className="px-2 py-1 rounded bg-muted">{template.deal_structure}</span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {template.description}
          </p>

          <p className="text-xs text-muted-foreground">
            Contributed by <span className="font-medium text-foreground">{template.contributor_name}</span>
          </p>

          {template.metadata && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-2">Inputs Required</h3>
                <ul className="space-y-1.5">
                  {template.metadata.inputs_required.map((input, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                      {input}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50">
                  <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Confirmed
                  </h4>
                  <ul className="space-y-1.5">
                    {template.metadata.confirmed_facts.map((fact, i) => (
                      <li key={i} className="text-xs text-emerald-900/80">
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
                  <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Assumed (validate per deal)
                  </h4>
                  <ul className="space-y-1.5">
                    {template.metadata.assumptions.map((assumption, i) => (
                      <li key={i} className="text-xs text-amber-900/80">
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            {template.sanitised_filepath ? (
              <a
                href={`/api/templates/${template.id}/download`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Template
              </a>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Metadata only — no downloadable file (sample data)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
