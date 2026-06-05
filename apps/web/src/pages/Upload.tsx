import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { WizardStepper } from "@/components/upload/WizardStepper";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { RedactionReview } from "@/components/upload/RedactionReview";
import { MetadataForm } from "@/components/upload/MetadataForm";
import { uploadFile, sanitiseUpload, publishTemplate } from "@/lib/api";

const STEPS = [
  { label: "Upload", description: "Select your file" },
  { label: "AI Processing", description: "Redacting confidential data" },
  { label: "Review", description: "Check redactions" },
  { label: "Metadata", description: "Confirm details" },
];

interface SanitiseData {
  upload_id: string;
  original_text: string;
  redacted_text: string;
  replacements: Array<{ original: string; replacement: string; type: string }>;
  suggested_metadata: {
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
  ai_mode: string;
}

export function Upload() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [sanitiseData, setSanitiseData] = useState<SanitiseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadFile(file);
      setUploadId(result.upload_id);
      setStep(1);

      const sanitised = await sanitiseUpload(result.upload_id);
      setSanitiseData(sanitised);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setStep(0);
    } finally {
      setIsUploading(false);
    }
  }

  function handleRedactionConfirm() {
    setStep(3);
  }

  async function handlePublish(formData: any) {
    if (!uploadId || !sanitiseData) return;

    setIsPublishing(true);
    setError(null);

    try {
      await publishTemplate(uploadId, {
        ...formData,
        redacted_text: sanitiseData.redacted_text,
        replacements: sanitiseData.replacements,
      });
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Publish failed");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-2">
          Contribute a Template
        </h1>
        <p className="text-muted-foreground">
          Upload a deal deliverable. AI will strip confidential data and extract methodology metadata.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <WizardStepper steps={STEPS} currentStep={step} />

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {step === 0 && (
          <UploadDropzone
            onFileSelected={handleFileSelected}
            isUploading={isUploading}
          />
        )}

        {step === 1 && (
          <div className="text-center py-16">
            <div className="inline-block h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="font-semibold mb-1">AI is processing your document...</h3>
            <p className="text-sm text-muted-foreground">
              Identifying confidential entities and extracting metadata
            </p>
          </div>
        )}

        {step === 2 && sanitiseData && (
          <RedactionReview
            originalText={sanitiseData.original_text}
            redactedText={sanitiseData.redacted_text}
            replacements={sanitiseData.replacements}
            aiMode={sanitiseData.ai_mode}
            onConfirm={handleRedactionConfirm}
          />
        )}

        {step === 3 && sanitiseData && (
          <MetadataForm
            suggestedMetadata={sanitiseData.suggested_metadata}
            onPublish={handlePublish}
            isPublishing={isPublishing}
          />
        )}

        {step === 4 && (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">Template Published!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your sanitised template is now available in the library for the whole firm.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                Browse Library
              </button>
              <button
                onClick={() => {
                  setStep(0);
                  setUploadId(null);
                  setSanitiseData(null);
                  setError(null);
                }}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
