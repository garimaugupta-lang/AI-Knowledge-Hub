export enum DealPhase {
  Sourcing = "sourcing",
  Diligence = "diligence",
  Signing = "signing",
  Integration = "integration",
  Exit = "exit",
}

export enum DeliverableType {
  Workplan = "workplan",
  Tracker = "tracker",
  Model = "model",
  Memo = "memo",
  Checklist = "checklist",
  Report = "report",
  Template = "template",
  Analysis = "analysis",
}

export enum Sector {
  Technology = "technology",
  Healthcare = "healthcare",
  Industrials = "industrials",
  ConsumerRetail = "consumer_retail",
  FinancialServices = "financial_services",
  Energy = "energy",
  CrossSector = "cross_sector",
}

export enum DealStructure {
  Acquisition = "acquisition",
  Merger = "merger",
  CarveOut = "carve_out",
  JointVenture = "joint_venture",
  Divestiture = "divestiture",
  LBO = "lbo",
}

export interface Template {
  id: string;
  title: string;
  phase: DealPhase;
  deliverable_type: DeliverableType;
  sector: Sector;
  deal_structure: DealStructure;
  description: string;
  original_filename: string | null;
  sanitised_filepath: string | null;
  contributor_name: string;
  downloads: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateMetadata {
  id: string;
  template_id: string;
  inputs_required: string[];
  assumptions: string[];
  confirmed_facts: string[];
}

export interface TemplateWithMetadata extends Template {
  metadata: TemplateMetadata | null;
}

export interface RedactionReplacement {
  original: string;
  replacement: string;
  type: "person" | "company" | "codename" | "financial" | "date" | "other";
}

export interface SanitiseResult {
  original_text: string;
  redacted_text: string;
  replacements: RedactionReplacement[];
  suggested_metadata: {
    title: string;
    phase: DealPhase;
    deliverable_type: DeliverableType;
    sector: Sector;
    deal_structure: DealStructure;
    description: string;
    inputs_required: string[];
    assumptions: string[];
    confirmed_facts: string[];
  };
}

export interface UploadResponse {
  upload_id: string;
  filename: string;
}

export interface PublishRequest {
  title: string;
  phase: DealPhase;
  deliverable_type: DeliverableType;
  sector: Sector;
  deal_structure: DealStructure;
  description: string;
  contributor_name: string;
  inputs_required: string[];
  assumptions: string[];
  confirmed_facts: string[];
}

export interface SearchResult {
  templates: Template[];
  total: number;
}
