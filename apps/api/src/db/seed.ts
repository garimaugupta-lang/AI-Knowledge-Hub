import { type Database } from "sql.js";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { saveDatabase } from "./schema.js";

interface SeedTemplate {
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
}

const SEED_TEMPLATES: SeedTemplate[] = [
  {
    title: "Day-1 Readiness Checklist — SaaS Carve-out",
    phase: "integration",
    deliverable_type: "checklist",
    sector: "technology",
    deal_structure: "carve_out",
    description:
      "Comprehensive day-1 readiness checklist for SaaS carve-out transactions. Covers IT separation, customer comms, HR onboarding, finance cutover, and regulatory filings. Organised by workstream with owner assignments and go/no-go gates.",
    contributor_name: "Sarah Chen",
    inputs_required: [
      "TSA schedule with end-dates per service",
      "Organisational chart of carved entity",
      "Customer contract list with assignment clauses",
      "IT systems inventory and dependency map",
      "Regulatory filing deadlines by jurisdiction",
    ],
    assumptions: [
      "TSA duration of 12 months for shared IT services",
      "80% of customers consent to assignment within 60 days",
      "New entity has standalone payroll operational by day 1",
      "Domain and email migration completed pre-close",
    ],
    confirmed_facts: [
      "Legal entity structure defined and filed",
      "Banking relationships established",
      "Key employee retention agreements signed",
      "Insurance policies bound",
    ],
  },
  {
    title: "TSA Schedule Tracker",
    phase: "integration",
    deliverable_type: "tracker",
    sector: "cross_sector",
    deal_structure: "carve_out",
    description:
      "Transition Services Agreement tracking workbook. Monitors service delivery across all TSA schedules, tracks exit milestones, cost true-ups, and extension requests. Includes RAG status dashboards and escalation workflows.",
    contributor_name: "Michael Torres",
    inputs_required: [
      "Signed TSA with all schedules",
      "Service-level agreements per schedule",
      "Monthly cost allocations",
      "Exit criteria per service",
      "Vendor contracts being transferred",
    ],
    assumptions: [
      "Monthly billing cycle with 30-day payment terms",
      "Extension requests require 60-day notice",
      "Cost escalation capped at 110% of base rate after month 6",
      "Disputes resolved within 15 business days",
    ],
    confirmed_facts: [
      "TSA effective date aligned with transaction close",
      "Governance committee meets bi-weekly",
      "All schedules have named service managers on both sides",
    ],
  },
  {
    title: "Customer Cohort & Retention Analysis",
    phase: "diligence",
    deliverable_type: "analysis",
    sector: "technology",
    deal_structure: "acquisition",
    description:
      "Deep-dive analysis template for B2B SaaS customer retention. Segments customers by cohort vintage, ARR band, and product tier. Calculates gross and net retention rates, analyses churn drivers, and models forward LTV/CAC.",
    contributor_name: "James O'Brien",
    inputs_required: [
      "Monthly MRR by customer for 36+ months",
      "Customer start dates and contract terms",
      "Churn reason codes (if available)",
      "Product tier and pricing history",
      "Sales and marketing spend by period",
    ],
    assumptions: [
      "Revenue recognition on straight-line basis over contract term",
      "Logo churn defined as zero revenue for 3 consecutive months",
      "Expansion revenue includes upsell and price increases",
      "CAC payback calculated on fully-loaded S&M cost",
    ],
    confirmed_facts: [
      "ARR as of measurement date from audited financials",
      "Customer count from CRM system of record",
      "Contract renewal dates from billing system",
    ],
  },
  {
    title: "Quality of Earnings Report Template",
    phase: "diligence",
    deliverable_type: "report",
    sector: "cross_sector",
    deal_structure: "acquisition",
    description:
      "Standard QoE report structure for buy-side financial due diligence. Covers revenue quality, EBITDA adjustments, normalising items, working capital analysis, and debt-like items. Includes management adjustment bridge and pro-forma P&L.",
    contributor_name: "Emily Richardson",
    inputs_required: [
      "3 years audited financial statements",
      "Monthly management accounts (trailing 24 months)",
      "Trial balance detail",
      "Revenue by customer/product/geography",
      "Detailed list of non-recurring items from management",
    ],
    assumptions: [
      "EBITDA excludes share-based compensation",
      "Working capital normalised on 12-month trailing average",
      "Capex/opex classification per management policy",
      "Intercompany eliminations at arm's length transfer prices",
    ],
    confirmed_facts: [
      "Audit opinion unqualified for all periods",
      "Accounting policies consistent across periods",
      "No restatements in measurement period",
    ],
  },
  {
    title: "Synergy Estimation Model — Cost Synergies",
    phase: "diligence",
    deliverable_type: "model",
    sector: "industrials",
    deal_structure: "merger",
    description:
      "Bottom-up cost synergy model for industrial mergers. Identifies and quantifies headcount, procurement, facilities, and G&A synergies. Includes phase-in timeline, one-time costs to achieve, and confidence-weighted NPV.",
    contributor_name: "David Park",
    inputs_required: [
      "Detailed org charts for both entities",
      "Vendor spend by category (top 50 vendors)",
      "Facility lease schedules",
      "IT systems and license inventory",
      "Compensation and benefits data by role level",
    ],
    assumptions: [
      "Headcount synergies realised over 18-month period",
      "Procurement savings of 5-15% on overlapping vendors",
      "Severance cost at 6 months average per eliminated role",
      "Facility consolidation complete by month 24",
    ],
    confirmed_facts: [
      "Combined revenue does not trigger regulatory thresholds",
      "No change-of-control penalties in key vendor contracts",
      "Lease break clauses available for 3 of 5 overlapping sites",
    ],
  },
  {
    title: "Open-Source License Review Template",
    phase: "diligence",
    deliverable_type: "checklist",
    sector: "technology",
    deal_structure: "acquisition",
    description:
      "IP due diligence checklist for open-source software compliance. Maps all OSS dependencies by license type (MIT, Apache, GPL, LGPL, AGPL), identifies copyleft risk, flags contribution obligations, and assesses remediation effort.",
    contributor_name: "Rachel Kim",
    inputs_required: [
      "Full dependency tree (package.json / requirements.txt / go.mod)",
      "Source code repository access",
      "Software Bill of Materials (SBOM)",
      "List of proprietary modules and their OSS interactions",
      "Prior OSS audit reports (if any)",
    ],
    assumptions: [
      "GPL-licensed code in separate process does not trigger copyleft",
      "LGPL dynamic linking compliant with current architecture",
      "MIT/Apache/BSD dependencies require attribution only",
      "Remediation timeline of 6 months for any copyleft violations",
    ],
    confirmed_facts: [
      "No AGPL dependencies in production code path",
      "Company has documented OSS policy",
      "Third-party SCA tool scan completed",
    ],
  },
  {
    title: "100-Day Integration Plan — Healthcare Acquisition",
    phase: "integration",
    deliverable_type: "workplan",
    sector: "healthcare",
    deal_structure: "acquisition",
    description:
      "First 100 days integration playbook for healthcare sector acquisitions. Covers clinical operations continuity, regulatory (FDA/CMS) change notifications, payer re-credentialing, EMR integration, and workforce harmonisation.",
    contributor_name: "Dr. Amanda Foster",
    inputs_required: [
      "Combined entity org design",
      "Regulatory filing requirements by state",
      "Payer contract list with anti-assignment clauses",
      "IT systems assessment and integration roadmap",
      "Cultural assessment survey results",
    ],
    assumptions: [
      "State license transfers completed within 90 days",
      "Payer re-credentialing takes 45-60 days on average",
      "EMR migration deferred to months 4-9 post-close",
      "No involuntary terminations in first 30 days (retention period)",
    ],
    confirmed_facts: [
      "HSR filing cleared, no second request",
      "State AG approvals received for all operating states",
      "Key physician retention agreements executed",
      "Patient notification plan approved by compliance",
    ],
  },
  {
    title: "LBO Model Template — Mid-Market",
    phase: "sourcing",
    deliverable_type: "model",
    sector: "cross_sector",
    deal_structure: "lbo",
    description:
      "Leveraged buyout model template for mid-market transactions ($50M-$500M EV). Includes sources & uses, debt schedule with multiple tranches, management equity rollover, operating case with sensitivities, and IRR/MOIC waterfall.",
    contributor_name: "Thomas Hartley",
    inputs_required: [
      "Historical financials (3 years) and management projections",
      "Debt term sheets or indicative terms",
      "Entry valuation (EV/EBITDA multiple)",
      "Management rollover percentage",
      "Cap table and option pool details",
    ],
    assumptions: [
      "Senior leverage at 4.0x entry EBITDA",
      "Total leverage at 5.5x entry EBITDA",
      "Exit multiple equal to entry multiple (no multiple expansion)",
      "Hold period of 5 years",
      "Annual capex at 3-5% of revenue",
    ],
    confirmed_facts: [
      "Minimum cash balance of $5M maintained",
      "Mandatory debt amortisation per term sheet schedule",
      "Management incentive pool of 10% fully-diluted equity",
    ],
  },
  {
    title: "Vendor Due Diligence Data Request List",
    phase: "diligence",
    deliverable_type: "checklist",
    sector: "cross_sector",
    deal_structure: "acquisition",
    description:
      "Comprehensive VDD data request list organised by workstream (financial, tax, legal, commercial, IT, HR, environmental). Includes priority flags, expected format, and typical timeline to populate.",
    contributor_name: "Laura Whitfield",
    inputs_required: [
      "Anticipated buyer profile (strategic vs. financial)",
      "Deal timeline and exclusivity period",
      "Known sensitive items requiring ring-fencing",
      "Data room platform access credentials",
      "Internal subject matter expert contacts per workstream",
    ],
    assumptions: [
      "Phase 1 data room populated within 3 weeks of engagement",
      "Management presentations scheduled week 4",
      "Q&A responses within 48 hours of submission",
      "Red flag items escalated same-day to deal team lead",
    ],
    confirmed_facts: [
      "Data room platform selected and configured",
      "NDA executed with all shortlisted bidders",
      "Clean team protocol in place for commercially sensitive data",
    ],
  },
  {
    title: "Net Revenue Retention Bridge",
    phase: "diligence",
    deliverable_type: "analysis",
    sector: "technology",
    deal_structure: "acquisition",
    description:
      "NRR waterfall analysis template that decomposes net revenue retention into gross retention, expansion, contraction, and churn components. Includes cohort-level drill-down and benchmark comparisons.",
    contributor_name: "Kevin Zhao",
    inputs_required: [
      "Monthly ARR by customer with movement flags",
      "Contract start/end dates and renewal history",
      "Upsell/cross-sell revenue tagged by motion",
      "Pricing changes and their effective dates",
      "Industry benchmark data for peer comparison",
    ],
    assumptions: [
      "NRR calculated on dollar-weighted basis (not logo-weighted)",
      "Contraction defined as >10% ARR decrease at renewal",
      "Expansion includes both upsell and organic price increases",
      "Measurement period is trailing 12 months",
    ],
    confirmed_facts: [
      "ARR figures reconciled to GAAP revenue within 5%",
      "Customer segmentation validated by sales leadership",
      "Multi-year pre-paid contracts normalised to annual basis",
    ],
  },
  {
    title: "Separation Cost Estimate — IT Workstream",
    phase: "signing",
    deliverable_type: "model",
    sector: "technology",
    deal_structure: "carve_out",
    description:
      "IT separation cost model for carve-out transactions. Estimates one-time and ongoing costs for application separation, data migration, infrastructure standup, and vendor contract novation.",
    contributor_name: "Chris Nakamura",
    inputs_required: [
      "Application portfolio inventory with shared/dedicated flags",
      "Infrastructure topology diagram",
      "Vendor contract summary with assignment/novation clauses",
      "Headcount allocated to shared IT services",
      "Current IT run-rate budget",
    ],
    assumptions: [
      "Cloud migration for separated applications (no on-prem standup)",
      "Data migration completed during TSA period",
      "Contractor augmentation at 1.5x FTE cost for 12-month surge",
      "Licence duplication cost during parallel-run period",
    ],
    confirmed_facts: [
      "Core ERP staying with parent (new instance required)",
      "Customer-facing systems transfer to carved entity",
      "Cybersecurity assessment completed — no critical findings",
    ],
  },
  {
    title: "Deal Screening Memo — Investment Committee",
    phase: "sourcing",
    deliverable_type: "memo",
    sector: "cross_sector",
    deal_structure: "acquisition",
    description:
      "IC screening memo template for new deal opportunities. One-page format covering target overview, investment thesis, key risks, indicative valuation range, strategic fit assessment, and recommended next steps.",
    contributor_name: "Natalie Greer",
    inputs_required: [
      "Target company overview (public filings or CIM)",
      "Preliminary valuation range from banker/broker",
      "Strategic rationale from business development team",
      "High-level competitive landscape",
      "Identified synergies or growth acceleration levers",
    ],
    assumptions: [
      "Valuation based on public comparable set at deal date",
      "Synergies not included in base-case valuation",
      "Financing at current market terms (no committed facility)",
      "Timeline assumes 4-6 month process from LOI to close",
    ],
    confirmed_facts: [
      "Target within stated acquisition criteria (size/sector/geography)",
      "No known antitrust or regulatory blockers",
      "Preliminary conflict check cleared",
    ],
  },
  {
    title: "Closing Conditions & CP Tracker",
    phase: "signing",
    deliverable_type: "tracker",
    sector: "cross_sector",
    deal_structure: "acquisition",
    description:
      "Conditions precedent tracker for SPA execution through close. Monitors regulatory approvals, third-party consents, financing conditions, and bring-down certificate requirements.",
    contributor_name: "Robert Okafor",
    inputs_required: [
      "Signed SPA with conditions precedent schedule",
      "Regulatory filing timeline and jurisdiction list",
      "Third-party consent list (customers, landlords, JV partners)",
      "Financing commitment letter conditions",
      "Material adverse change definition from SPA",
    ],
    assumptions: [
      "Antitrust clearance within 60 days (Phase I only)",
      "Third-party consents obtained for 90%+ by revenue",
      "No material litigation filed between sign and close",
      "Working capital within collar at estimated close date",
    ],
    confirmed_facts: [
      "SPA executed and binding on both parties",
      "Deposit funds held in escrow",
      "Outside date set per agreement",
      "Termination fee provisions confirmed",
    ],
  },
];

export function seedDatabase(db: Database, storagePath: string): void {
  const result = db.exec("SELECT COUNT(*) as count FROM templates");
  const count = result[0]?.values[0]?.[0] as number;

  if (count > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  console.log("Seeding database with sample templates...");
  const metadataDir = path.join(storagePath, "metadata");

  for (const template of SEED_TEMPLATES) {
    const templateId = uuid();
    const metadataId = uuid();
    const daysAgo = Math.floor(Math.random() * 90);
    const downloads = Math.floor(Math.random() * 45) + 3;

    db.run(
      `INSERT INTO templates (id, title, phase, deliverable_type, sector, deal_structure, description, contributor_name, downloads, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now', ?), datetime('now'))`,
      [
        templateId,
        template.title,
        template.phase,
        template.deliverable_type,
        template.sector,
        template.deal_structure,
        template.description,
        template.contributor_name,
        downloads,
        `-${daysAgo} days`,
      ]
    );

    db.run(
      `INSERT INTO template_metadata (id, template_id, inputs_required, assumptions, confirmed_facts)
       VALUES (?, ?, ?, ?, ?)`,
      [
        metadataId,
        templateId,
        JSON.stringify(template.inputs_required),
        JSON.stringify(template.assumptions),
        JSON.stringify(template.confirmed_facts),
      ]
    );

    const sidecar = {
      id: templateId,
      title: template.title,
      phase: template.phase,
      deliverable_type: template.deliverable_type,
      sector: template.sector,
      deal_structure: template.deal_structure,
      description: template.description,
      contributor_name: template.contributor_name,
      inputs_required: template.inputs_required,
      assumptions: template.assumptions,
      confirmed_facts: template.confirmed_facts,
      seeded: true,
    };

    fs.writeFileSync(
      path.join(metadataDir, `${templateId}.json`),
      JSON.stringify(sidecar, null, 2)
    );
  }

  console.log(`Seeded ${SEED_TEMPLATES.length} templates.`);
}
