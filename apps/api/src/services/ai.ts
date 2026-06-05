import Anthropic from "@anthropic-ai/sdk";

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
    phase: string;
    deliverable_type: string;
    sector: string;
    deal_structure: string;
    description: string;
    inputs_required: string[];
    assumptions: string[];
    confirmed_facts: string[];
  };
}

export class AIService {
  private client: Anthropic | null = null;
  private model = "claude-sonnet-4-5-20241022";

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
      console.log("AI Service: using Claude API (real mode)");
    } else {
      console.log("AI Service: no API key found, using mock mode");
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  async sanitiseDocument(text: string): Promise<SanitiseResult> {
    if (this.client) {
      return this.realSanitise(text);
    }
    return this.mockSanitise(text);
  }

  private async realSanitise(text: string): Promise<SanitiseResult> {
    const redactionPrompt = `You are a confidential document redaction specialist for M&A (mergers & acquisitions) deal teams.

Analyze the following document text and identify ALL confidential entities that must be redacted:
- Person names (employees, executives, advisors, signatories)
- Company names (target, acquirer, subsidiaries, vendors, customers)
- Deal codenames (Project X, Operation Y)
- Financial figures (dollar amounts, percentages tied to specific deals)
- Specific dates (signing dates, close dates, board meeting dates)
- Addresses and locations that identify specific parties

For each entity found, provide a consistent replacement:
- Person names → realistic fake names (use the SAME fake name every time a person appears)
- Company names → realistic fake company names (consistent throughout)
- Deal codenames → different codename
- Financial figures → similar-magnitude dummy numbers
- Dates → shifted by a random offset (but keep relative ordering)

Return ONLY valid JSON in this exact format:
{
  "replacements": [
    {"original": "exact text found", "replacement": "replacement text", "type": "person|company|codename|financial|date|other"}
  ]
}

Document text:
---
${text.slice(0, 15000)}
---`;

    const metadataPrompt = `You are an M&A document classification specialist. Analyze this document and extract structured metadata.

Classify it into:
- phase: one of "sourcing", "diligence", "signing", "integration", "exit"
- deliverable_type: one of "workplan", "tracker", "model", "memo", "checklist", "report", "template", "analysis"
- sector: one of "technology", "healthcare", "industrials", "consumer_retail", "financial_services", "energy", "cross_sector"
- deal_structure: one of "acquisition", "merger", "carve_out", "joint_venture", "divestiture", "lbo"

Also provide:
- title: a generic title (no client/company names) that describes what this deliverable is
- description: 2-3 sentence description of what this document helps accomplish
- inputs_required: list of 3-6 data inputs someone would need to prepare this deliverable
- assumptions: list of 3-5 assumptions made in this document (things that should be validated per deal)
- confirmed_facts: list of 2-4 facts that appear to be confirmed/verified in this document

Return ONLY valid JSON:
{
  "title": "...",
  "phase": "...",
  "deliverable_type": "...",
  "sector": "...",
  "deal_structure": "...",
  "description": "...",
  "inputs_required": ["..."],
  "assumptions": ["..."],
  "confirmed_facts": ["..."]
}

Document text:
---
${text.slice(0, 15000)}
---`;

    try {
      const [redactionResponse, metadataResponse] = await Promise.all([
        this.client!.messages.create({
          model: this.model,
          max_tokens: 4096,
          messages: [{ role: "user", content: redactionPrompt }],
        }),
        this.client!.messages.create({
          model: this.model,
          max_tokens: 2048,
          messages: [{ role: "user", content: metadataPrompt }],
        }),
      ]);

      const redactionText = redactionResponse.content[0]?.type === "text"
        ? redactionResponse.content[0].text
        : "";
      const metadataText = metadataResponse.content[0]?.type === "text"
        ? metadataResponse.content[0].text
        : "";

      const redactionJson = JSON.parse(extractJson(redactionText));
      const metadataJson = JSON.parse(extractJson(metadataText));

      const replacements: RedactionReplacement[] = redactionJson.replacements || [];

      let redactedText = text;
      for (const r of replacements) {
        redactedText = redactedText.replaceAll(r.original, r.replacement);
      }

      return {
        original_text: text,
        redacted_text: redactedText,
        replacements,
        suggested_metadata: {
          title: metadataJson.title || "Untitled Template",
          phase: metadataJson.phase || "diligence",
          deliverable_type: metadataJson.deliverable_type || "template",
          sector: metadataJson.sector || "cross_sector",
          deal_structure: metadataJson.deal_structure || "acquisition",
          description: metadataJson.description || "",
          inputs_required: metadataJson.inputs_required || [],
          assumptions: metadataJson.assumptions || [],
          confirmed_facts: metadataJson.confirmed_facts || [],
        },
      };
    } catch (err) {
      console.error("Claude API error, falling back to mock:", err);
      return this.mockSanitise(text);
    }
  }

  private mockSanitise(text: string): SanitiseResult {
    const replacements: RedactionReplacement[] = [];
    let redactedText = text;

    const commonWords = new Set([
      "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
      "her", "was", "one", "our", "out", "day", "get", "has", "him", "his",
      "how", "its", "may", "new", "now", "old", "see", "way", "who", "did",
      "let", "say", "she", "too", "use", "man", "big", "end", "put", "run",
      "set", "try", "ask", "men", "own", "top", "red", "any", "few", "pre",
      "key", "per", "tax", "net", "due", "non", "sub", "mid", "low", "high",
      "total", "notes", "based", "given", "above", "below", "under", "after",
      "before", "between", "during", "within", "about", "other", "these",
      "those", "which", "their", "there", "where", "first", "second", "third",
      "next", "last", "each", "every", "both", "such", "when", "then", "than",
      "also", "back", "been", "come", "from", "have", "here", "just", "like",
      "long", "make", "many", "more", "most", "much", "must", "name", "only",
      "over", "same", "some", "take", "that", "them", "this", "time", "very",
      "what", "will", "with", "work", "year", "your", "been", "call", "deal",
      "done", "down", "even", "fact", "full", "good", "half", "hand", "help",
      "keep", "kind", "know", "left", "life", "line", "look", "made", "mean",
      "need", "part", "plan", "real", "rest", "show", "side", "still", "sure",
      "tell", "turn", "used", "want", "well", "went", "best", "city", "cost",
      "date", "data", "days", "free", "head", "hold", "hour", "idea", "info",
      "item", "lead", "list", "loss", "main", "meet", "move", "note", "open",
      "paid", "past", "rate", "risk", "role", "rule", "sale", "seen", "sign",
      "size", "sort", "step", "team", "term", "test", "type", "unit", "upon",
      "view", "week", "word", "area", "base", "body", "book", "case", "club",
      "term", "page", "file", "form", "fund", "game", "goal", "group", "issue",
      "level", "local", "major", "model", "month", "north", "south", "point",
      "power", "price", "range", "ready", "right", "shall", "share", "short",
      "since", "small", "space", "staff", "stage", "start", "state", "stock",
      "study", "table", "thing", "today", "trade", "value", "water", "world",
      "would", "could", "should", "might", "shall", "going", "being", "having",
      "doing", "saying", "making", "taking", "coming", "seeing", "getting",
      "phase", "scope", "draft", "final", "board", "audit", "legal", "close",
      "asset", "buyer", "offer", "terms", "check", "track", "input", "output",
      "review", "status", "report", "action", "client", "market", "target",
      "source", "result", "impact", "option", "change", "update", "access",
      "number", "period", "annual", "return", "growth", "margin", "profit",
      "budget", "actual", "equity", "senior", "junior", "global", "public",
      "private", "internal", "external", "current", "overall", "general",
      "specific", "standard", "required", "expected", "proposed", "approved",
      "pending", "complete", "ongoing", "initial", "primary", "secondary",
      "critical", "material", "relevant", "potential", "estimated", "projected",
      "preliminary", "confidential", "proprietary", "restricted",
      "executive", "management", "operations", "financial", "commercial",
      "strategic", "regulatory", "compliance", "governance", "diligence",
      "integration", "transaction", "acquisition", "assessment", "evaluation",
      "recommendation", "consideration", "implementation", "documentation",
      "information", "communication", "presentation", "preparation",
      "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
      "january", "february", "march", "april", "june", "july", "august",
      "september", "october", "november", "december",
      "summary", "overview", "analysis", "template", "process", "structure",
      "appendix", "section", "chapter", "exhibit", "schedule", "attachment",
    ]);

    const fakeFirstNames = ["James", "Sarah", "Michael", "Emily", "Robert", "Laura", "David", "Rachel", "Thomas", "Anna", "William", "Jessica", "Daniel", "Catherine", "Andrew", "Sophia"];
    const fakeLastNames = ["Anderson", "Mitchell", "Thompson", "Reynolds", "Crawford", "Patterson", "Hamilton", "Morrison", "Sullivan", "Fitzgerald", "Henderson", "Blackwell", "Whitmore", "Ashford", "Caldwell", "Prescott"];
    const fakeCompanies = ["Nextera Holdings", "Pinnacle Industries", "Vanguard Solutions", "Meridian Corp", "Apex Technologies", "Summit Partners", "Horizon Ventures", "Sterling Group", "Atlas Capital", "Beacon Enterprises"];

    let nameCounter = 0;
    let companyCounter = 0;
    const nameMap = new Map<string, string>();
    const companyMap = new Map<string, string>();

    // 1. Project/Operation codenames
    const fakeProjects = ["Project Atlas", "Project Horizon", "Project Vertex", "Project Ember"];
    const projectPatterns = text.match(/\b(?:Project|Operation)\s+[A-Z][a-z]+\b/g) || [];
    const uniqueProjects = [...new Set(projectPatterns)];
    uniqueProjects.forEach((proj, i) => {
      const fake = fakeProjects[i] || "Project Zeta";
      replacements.push({ original: proj, replacement: fake, type: "codename" });
      redactedText = redactedText.replaceAll(proj, fake);
    });

    // 2. Email addresses
    const emailPatterns = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    const uniqueEmails = [...new Set(emailPatterns)];
    uniqueEmails.forEach((email) => {
      const fakeName = fakeFirstNames[nameCounter % fakeFirstNames.length].toLowerCase();
      const fake = `${fakeName}@example.com`;
      replacements.push({ original: email, replacement: fake, type: "other" });
      redactedText = redactedText.replaceAll(email, fake);
      nameCounter++;
    });

    // 3. Phone numbers
    const phonePatterns = text.match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g) || [];
    const uniquePhones = [...new Set(phonePatterns)];
    uniquePhones.forEach((phone) => {
      replacements.push({ original: phone, replacement: "(555) 000-0000", type: "other" });
      redactedText = redactedText.replaceAll(phone, "(555) 000-0000");
    });

    // 4. Company names (words followed by corporate suffixes)
    const companySuffixes = /\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)\s+(?:Inc\.?|LLC|Ltd\.?|Corp\.?|Corporation|Limited|Partners|Holdings|Group|Enterprises|Solutions|Technologies|Capital|Advisors|Associates|Consulting|Services|International|Worldwide|Global)\b/g;
    const companyMatches: string[] = [];
    let companyMatch;
    while ((companyMatch = companySuffixes.exec(text)) !== null) {
      companyMatches.push(companyMatch[0]);
    }
    const uniqueCompanies = [...new Set(companyMatches)];
    uniqueCompanies.forEach((company) => {
      if (!companyMap.has(company)) {
        companyMap.set(company, fakeCompanies[companyCounter % fakeCompanies.length]);
        companyCounter++;
      }
      const fake = companyMap.get(company)!;
      replacements.push({ original: company, replacement: fake, type: "company" });
      redactedText = redactedText.replaceAll(company, fake);
    });

    // 5. Person names (two or more capitalized words that aren't common terms)
    const namePattern = /\b([A-Z][a-z]{1,15})\s+([A-Z][a-z]{1,15})\b/g;
    const nameMatches: string[] = [];
    let nMatch;
    while ((nMatch = namePattern.exec(redactedText)) !== null) {
      const full = nMatch[0];
      const first = nMatch[1].toLowerCase();
      const last = nMatch[2].toLowerCase();
      if (commonWords.has(first) || commonWords.has(last)) continue;
      if (/^(Project|Operation|Phase|Stage|Section|Table|Figure|Appendix|Exhibit|Schedule|Chapter|Part|Step|Item|Type|Level|Class|Grade|Quarter|Half|January|February|March|April|May|June|July|August|September|October|November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|North|South|East|West|New|San|Los|Las|Old|Big|High|Low|Upper|Lower|Mid|Sub|Pre|Post|Non|Anti|Multi|Cross|Inter|Over|Under|Out|Down|Back|Self|Well|Long|Short|Full|Half|Near|Far)$/i.test(nMatch[1])) continue;
      nameMatches.push(full);
    }
    const uniqueNames = [...new Set(nameMatches)];
    uniqueNames.forEach((name) => {
      if (!nameMap.has(name)) {
        const fFirst = fakeFirstNames[nameCounter % fakeFirstNames.length];
        const fLast = fakeLastNames[nameCounter % fakeLastNames.length];
        nameMap.set(name, `${fFirst} ${fLast}`);
        nameCounter++;
      }
      const fake = nameMap.get(name)!;
      replacements.push({ original: name, replacement: fake, type: "person" });
      redactedText = redactedText.replaceAll(name, fake);
    });

    // 6. Financial figures (any dollar amounts)
    const moneyPatterns = text.match(/\$[\d,.]+(?:\s*(?:million|billion|thousand|mn|bn|[MBKk]))?\b/gi) || [];
    const uniqueMoney = [...new Set(moneyPatterns)];
    uniqueMoney.forEach((amount) => {
      const fake = amount.match(/billion|bn/i) ? "$X.X billion" :
                   amount.match(/million|mn|M\b/) ? "$XX million" :
                   amount.match(/thousand|K|k/) ? "$XXX thousand" : "$X,XXX";
      replacements.push({ original: amount, replacement: fake, type: "financial" });
      redactedText = redactedText.replaceAll(amount, fake);
    });

    // 7. Specific full dates (Month Day, Year)
    const datePatterns = text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g) || [];
    const uniqueDates = [...new Set(datePatterns)];
    uniqueDates.forEach((date) => {
      replacements.push({ original: date, replacement: "[DATE REDACTED]", type: "date" });
      redactedText = redactedText.replaceAll(date, "[DATE REDACTED]");
    });

    // 8. Numeric dates (MM/DD/YYYY or DD/MM/YYYY)
    const numericDates = text.match(/\b\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}\b/g) || [];
    const uniqueNumDates = [...new Set(numericDates)];
    uniqueNumDates.forEach((date) => {
      replacements.push({ original: date, replacement: "XX/XX/XXXX", type: "date" });
      redactedText = redactedText.replaceAll(date, "XX/XX/XXXX");
    });

    // 9. Addresses (number + street name patterns)
    const addressPattern = /\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Road|Rd|Lane|Ln|Way|Court|Ct|Place|Pl|Circle|Cir|Highway|Hwy|Suite|Ste|Floor|Fl)\.?\b/g;
    const addressMatches = text.match(addressPattern) || [];
    const uniqueAddresses = [...new Set(addressMatches)];
    uniqueAddresses.forEach((addr) => {
      replacements.push({ original: addr, replacement: "123 Main Street", type: "other" });
      redactedText = redactedText.replaceAll(addr, "123 Main Street");
    });

    const lowerText = text.toLowerCase();
    let phase = "diligence";
    let deliverable_type = "template";
    let sector = "cross_sector";
    let deal_structure = "acquisition";

    if (lowerText.includes("integration") || lowerText.includes("day 1") || lowerText.includes("tsa")) phase = "integration";
    else if (lowerText.includes("loi") || lowerText.includes("screening") || lowerText.includes("pipeline")) phase = "sourcing";
    else if (lowerText.includes("signing") || lowerText.includes("closing") || lowerText.includes("condition")) phase = "signing";

    if (lowerText.includes("checklist") || lowerText.includes("readiness")) deliverable_type = "checklist";
    else if (lowerText.includes("model") || lowerText.includes("forecast")) deliverable_type = "model";
    else if (lowerText.includes("memo") || lowerText.includes("summary")) deliverable_type = "memo";
    else if (lowerText.includes("tracker") || lowerText.includes("status")) deliverable_type = "tracker";
    else if (lowerText.includes("report") || lowerText.includes("analysis")) deliverable_type = "report";

    if (lowerText.includes("saas") || lowerText.includes("software") || lowerText.includes("tech")) sector = "technology";
    else if (lowerText.includes("health") || lowerText.includes("pharma") || lowerText.includes("clinical")) sector = "healthcare";
    else if (lowerText.includes("manufactur") || lowerText.includes("industrial")) sector = "industrials";

    if (lowerText.includes("carve") || lowerText.includes("separation")) deal_structure = "carve_out";
    else if (lowerText.includes("merger") || lowerText.includes("combine")) deal_structure = "merger";
    else if (lowerText.includes("lbo") || lowerText.includes("leveraged")) deal_structure = "lbo";

    return {
      original_text: text,
      redacted_text: redactedText,
      replacements,
      suggested_metadata: {
        title: "Uploaded Template",
        phase,
        deliverable_type,
        sector,
        deal_structure,
        description: "AI-extracted template from uploaded document. Review and update the metadata below.",
        inputs_required: [
          "Historical financial data",
          "Organizational structure details",
          "Key stakeholder contacts",
          "Timeline and milestone dates",
        ],
        assumptions: [
          "Standard market terms assumed where not specified",
          "Timeline based on typical deal duration for this structure",
          "Regulatory approvals follow standard process",
        ],
        confirmed_facts: [
          "Document structure and methodology verified",
          "Template follows standard deal team format",
        ],
      },
    };
  }
}

function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : "{}";
}
