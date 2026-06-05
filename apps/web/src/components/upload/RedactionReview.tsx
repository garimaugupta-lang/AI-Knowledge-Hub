import { Shield, ArrowRight } from "lucide-react";

interface Replacement {
  original: string;
  replacement: string;
  type: string;
}

interface RedactionReviewProps {
  originalText: string;
  redactedText: string;
  replacements: Replacement[];
  aiMode: string;
  onConfirm: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  person: "bg-blue-100 text-blue-800",
  company: "bg-purple-100 text-purple-800",
  codename: "bg-orange-100 text-orange-800",
  financial: "bg-green-100 text-green-800",
  date: "bg-rose-100 text-rose-800",
  other: "bg-gray-100 text-gray-800",
};

export function RedactionReview({
  originalText,
  redactedText,
  replacements,
  aiMode,
  onConfirm,
}: RedactionReviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-sm">
          AI redaction complete ({aiMode === "claude" ? "Claude API" : "mock mode"}).{" "}
          <span className="font-medium">{replacements.length} entities</span> identified and replaced.
        </span>
      </div>

      {replacements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Replacements Made</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">Original</th>
                  <th className="px-3 py-2 text-center w-8"></th>
                  <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">Replacement</th>
                  <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {replacements.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">
                      <span className="line-through text-red-600 font-mono text-xs">{r.original}</span>
                    </td>
                    <td className="px-1 py-2 text-center">
                      <ArrowRight className="h-3 w-3 text-muted-foreground inline" />
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-blue-600 font-mono text-xs font-medium">{r.replacement}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[r.type] || TYPE_COLORS.other}`}>
                        {r.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-3">Redacted Document Preview</h3>
        <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-muted/30">
          <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
            {redactedText.slice(0, 3000)}
            {redactedText.length > 3000 && "\n\n... [truncated for preview]"}
          </pre>
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
      >
        Confirm Redactions & Continue to Metadata
      </button>
    </div>
  );
}
