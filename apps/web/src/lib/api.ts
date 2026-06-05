const API_BASE = "/api";

export async function fetchTemplates(params?: {
  phase?: string;
  type?: string;
  sector?: string;
  q?: string;
}) {
  const url = new URL(`${API_BASE}/templates`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
}

export async function fetchTemplate(id: string) {
  const res = await fetch(`${API_BASE}/templates/${id}`);
  if (!res.ok) throw new Error("Failed to fetch template");
  return res.json();
}

export async function searchTemplates(query: string) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed");
  }

  return res.json();
}

export async function sanitiseUpload(uploadId: string) {
  const res = await fetch(`${API_BASE}/upload/sanitise/${uploadId}`, {
    method: "POST",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Sanitisation failed");
  }

  return res.json();
}

export async function publishTemplate(uploadId: string, data: {
  title: string;
  phase: string;
  deliverable_type: string;
  sector: string;
  deal_structure: string;
  description: string;
  contributor_name: string;
  inputs_required: string[];
  assumptions: string[];
  confirmed_facts: string[];
  redacted_text: string;
  replacements?: Array<{ original: string; replacement: string; type: string }>;
}) {
  const res = await fetch(`${API_BASE}/upload/publish/${uploadId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Publish failed");
  }

  return res.json();
}
