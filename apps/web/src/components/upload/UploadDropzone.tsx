import { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
}

export function UploadDropzone({ onFileSelected, isUploading }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedExtensions = [".docx", ".xlsx", ".pptx", ".pdf"];

  const validateFile = (file: File): boolean => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const supported = [".docx", ".pptx"];
    if (!supported.includes(ext)) {
      setError(`File type ${ext} not supported. Supported: .docx, .pptx`);
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File too large. Maximum size is 50MB.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelected(file);
    }
  };

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "block border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          isUploading && "opacity-60 pointer-events-none"
        )}
      >
        <input
          type="file"
          accept=".docx,.pptx"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-muted">
            {isUploading ? (
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        </div>
        <h3 className="font-semibold mb-1">
          {isUploading ? "Uploading..." : "Drop your .docx or .pptx file here"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isUploading ? "Please wait" : "or click to browse"}
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            .docx
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            .pptx
          </span>
        </div>
      </label>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
