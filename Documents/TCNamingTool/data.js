const DATA = {

  clusters: [
    { name: "Customer",      color: "#388E3C", textColor: "#fff" },
    { name: "Care Consumer", color: "#1565C0", textColor: "#fff" },
    { name: "Finance",       color: "#f5f925", textColor: "#1a1a2e" },
  ],

  domains: [
    // Customer – Green
    { name: "Reception",                       camel: "Reception",                    cluster: "Customer",      team: "Green 2" },
    { name: "Claim Orchestration",             camel: "ClaimOrchestration",           cluster: "Customer",      team: "Green 3" },
    { name: "Factoring",                       camel: "Factoring",                    cluster: "Customer",      team: "Green 1" },
    { name: "Costs and Tariffs",               camel: "CostsAndTariffs",              cluster: "Customer",      team: "Green 1" },
    { name: "Customer Configuration",          camel: "CustomerConfiguration",        cluster: "Customer",      team: "Green 1" },
    { name: "Vendor API",                      camel: "VendorAPI",                    cluster: "Customer",      team: "Green 2" },
    // Care Consumer – Blue
    { name: "Insurers",                        camel: "Insurers",                     cluster: "Care Consumer", team: "Blue 1"  },
    { name: "Templating and Messaging",        camel: "TemplatingAndMessaging",       cluster: "Care Consumer", team: "Blue 1"  },
    { name: "Invoicing and Dunning",           camel: "InvoicingAndDunning",          cluster: "Care Consumer", team: "Blue 2"  },
    { name: "Bailiff",                         camel: "Bailiff",                      cluster: "Care Consumer", team: "Blue 2"  },
    // Finance – Orange
    { name: "Banking",                         camel: "Banking",                      cluster: "Finance",       team: "Yellow 1" },
    { name: "Payment Matching",                camel: "PaymentMatching",              cluster: "Finance",       team: "Yellow 1" },
    { name: "Accounting",                      camel: "Accounting",                   cluster: "Finance",       team: "Yellow 1" },
    { name: "Frontend Infrastructure",         camel: "FrontendInfrastructure",       cluster: "Finance",       team: "Yellow 2" },
    { name: "Auditing",                        camel: "Auditing",                     cluster: "Finance",       team: "Yellow 2" },
    { name: "Authentication & User Management",camel: "AuthAndUserMgmt",              cluster: "Finance",       team: "Yellow 2" },
  ],

  entities: {
    "Reception": [
      { name: "Mediation",      camel: "Mediation"     },
      { name: "Validation",     camel: "Validation"    },
      { name: "Enrichers",      camel: "Enrichers"     },
      { name: "Claim File",     camel: "ClaimFile"     },
      { name: "IMD Input",      camel: "IMDInput"      },
    ],
    "Claim Orchestration": [
      { name: "Workflow",       camel: "Workflow"      },
      { name: "Claim",          camel: "Claim"         },
      { name: "Claim Status",   camel: "ClaimStatus"   },
      { name: "ARP",            camel: "ARP"           },
    ],
    "Factoring": [
      { name: "ARP",            camel: "ARP"           },
      { name: "Risk Assessment",camel: "RiskAssessment"},
      { name: "CHA",            camel: "CHA"           },
      { name: "BA Account",     camel: "BAAccount"     },
    ],
    "Costs and Tariffs": [
      { name: "Tariff",         camel: "Tariff"        },
      { name: "Pricing Plan",   camel: "PricingPlan"   },
      { name: "Rating",         camel: "Rating"        },
    ],
    "Customer Configuration": [
      { name: "Contract",       camel: "Contract"      },
      { name: "Product",        camel: "Product"       },
      { name: "Business Account",camel: "BusinessAccount"},
      { name: "Insurer Config", camel: "InsurerConfig" },
    ],
    "Vendor API": [
      { name: "Claim Receipt",  camel: "ClaimReceipt"  },
      { name: "Retrocession",   camel: "Retrocession"  },
      { name: "DPAYWS",         camel: "DPAYWS"        },
    ],
    "Insurers": [
      { name: "Clearing",             camel: "Clearing"           },
      { name: "Insurance Request",    camel: "InsuranceRequest"   },
      { name: "Insurance Answer",     camel: "InsuranceAnswer"    },
      { name: "IR Broker",            camel: "IRBroker"           },
      { name: "Insurance Receivable", camel: "InsuranceReceivable"},
    ],
    "Templating and Messaging": [
      { name: "Template",       camel: "Template"      },
      { name: "Notification",   camel: "Notification"  },
      { name: "BA Report",      camel: "BAReport"      },
      { name: "Debtor Report",  camel: "DebtorReport"  },
      { name: "Email",          camel: "Email"         },
      { name: "SMS",            camel: "SMS"           },
    ],
    "Invoicing and Dunning": [
      { name: "Invoice",        camel: "Invoice"       },
      { name: "Dunning",        camel: "Dunning"       },
      { name: "Claim",          camel: "Claim"         },
      { name: "Payment Page",   camel: "PaymentPage"   },
      { name: "Patient Portal", camel: "PatientPortal" },
    ],
    "Bailiff": [
      { name: "Bailiff Action", camel: "BailiffAction" },
      { name: "Debt Collection",camel: "DebtCollection"},
    ],
    "Banking": [
      { name: "Payment Agreement",     camel: "PaymentAgreement"     },
      { name: "Acquisition",           camel: "Acquisition"          },
      { name: "BA Invoice",            camel: "BAInvoice"            },
      { name: "Patient",               camel: "Patient"              },
      { name: "Credit",                camel: "Credit"               },
      { name: "Claim",                 camel: "Claim"                },
      { name: "Insurance Receivable",  camel: "InsuranceReceivable"  },
      { name: "Patient Portal",        camel: "PatientPortal"        },
      { name: "DPAYWS",                camel: "DPAYWS"               },
    ],
    "Payment Matching": [
      { name: "Matchable Item", camel: "MatchableItem" },
      { name: "Payment File",   camel: "PaymentFile"   },
      { name: "POF",            camel: "POF"           },
      { name: "CAMT",           camel: "CAMT"          },
      { name: "Matching",       camel: "Matching"      },
    ],
    "Accounting": [
      { name: "Ledger Connector",camel: "LedgerConnector"},
      { name: "Settlement",     camel: "Settlement"    },
      { name: "Booking",        camel: "Booking"       },
      { name: "GL Document",    camel: "GLDocument"    },
    ],
    "Frontend Infrastructure": [
      { name: "Claim API",      camel: "ClaimAPI"      },
      { name: "TIM UI",         camel: "TIMUI"         },
      { name: "InZicht",        camel: "InZicht"       },
    ],
    "Auditing": [
      { name: "Audit Log",      camel: "AuditLog"      },
      { name: "UI Audit",       camel: "UIAudit"       },
      { name: "Message Audit",  camel: "MessageAudit"  },
    ],
    "Authentication & User Management": [
      { name: "IAM",            camel: "IAM"           },
      { name: "IIP",            camel: "IIP"           },
      { name: "User Account",   camel: "UserAccount"   },
      { name: "Identity",       camel: "Identity"      },
    ],
  },

  // Suggested scenarios per "Domain|Entity" key (shown as datalist suggestions)
  scenarios: {
    "Banking|Payment Agreement":     ["Direct Debit", "iDEAL", "Standard Payment"],
    "Banking|Acquisition":           ["AP304 Direct Debit", "AP301 Direct Debit"],
    "Banking|BA Invoice":            ["Direct Debit", "Standard Payment", "Monthly Subscription"],
    "Banking|Patient":               ["Direct Debit"],
    "Banking|Credit":                ["Installment Direct Debit"],
    "Banking|Claim":                 ["Standard Payment"],
    "Banking|Insurance Receivable":  ["Standard Payment"],
    "Banking|Patient Portal":        ["Account", "Claim"],
    "Banking|DPAYWS":                ["File Status", "SSP Status", "Multi BA Login"],
    "Accounting|Ledger Connector":   ["Twinfield", "AFAS", "Exact"],
    "Insurers|Clearing":             ["VR Request", "IR Request", "IRC Request", "VA Answer", "IA Answer"],
    "Reception|Mediation":           ["AP301", "AP304", "DPAY PM304"],
    "Authentication & User Management|IAM": ["Symmetric Key", "SHA-1 Password"],
    "Authentication & User Management|User Account": ["DPAYWS User", "Portal User"],
    "Invoicing and Dunning|Invoice":  ["Monthly Subscription", "BA Invoice"],
    "Payment Matching|CAMT":         ["Batch DD", "Single Payment", "Reject DD"],
  },

  actions: [
    "Create", "Pay", "Reject", "Process", "Validate", "Match", "Update", "Delete",
    "Search", "Filter", "Export", "Import", "Send", "Receive", "Confirm", "Cancel",
    "Retry", "Break", "Link", "Route", "Calculate", "Generate", "Approve", "Assign",
    "Login", "Submit", "Request", "Get Status",
  ],

  results: [
    "Success", "Failed", "After Rejection", "Fail Authorization",
    "Before Batch DD", "Without Invoice", "With Invoice", "Wrong Amount",
    "After Rejection",
  ],

  // ── Smart Lookup index ────────────────────────────────────────────────────
  // keywords: all terms a user might type to reach this domain
  // aliases:  short codes / abbreviations from the Excel (bnm, lgc, clr…)
  // note:     brief label shown in search results
  lookup: [
    {
      domain: "Banking",
      aliases: ["bnm", "bm"],
      keywords: [
        "banking", "bank", "banking and matching", "payment agreement",
        "direct debit", "dd", "dpayws", "ideal", "idéal", "credit",
        "ba invoice", "patient", "patient portal", "insurance receivable",
        "order out-payment", "mutation", "bank account", "statement",
        "payment provider", "pp", "ami", "installment"
      ],
      note: "Banking & Matching (BnM) — DD, iDEAL, BA Invoice, Credit, Patient Portal"
    },
    {
      domain: "Payment Matching",
      aliases: ["bnm", "matching"],
      keywords: [
        "payment matching", "matching", "matchable item", "bank statement",
        "camt", "pof", "categorize", "manual match", "forward", "payback",
        "receivable", "payable", "payment file"
      ],
      note: "Payment Matching (BnM) — CAMT, POF, Matchable Items, bank mutations"
    },
    {
      domain: "Accounting",
      aliases: ["lgc", "lc"],
      keywords: [
        "accounting", "ledger", "ledger connector", "twinfield", "afas",
        "exact online", "exact", "financial statement", "booking",
        "payment specification", "online ledger", "gl document",
        "financial booking", "charging", "send documents"
      ],
      note: "Accounting with Ledger Connector (LgC) — Twinfield, AFAS, Exact Online"
    },
    {
      domain: "Factoring",
      aliases: ["arp", "cha", "mdma"],
      keywords: [
        "factoring", "arp", "cha", "mdma", "risk", "risk assessment",
        "risk management", "bad debtor", "ap", "accounts payable",
        "ba accounts payable", "financial settlement", "settlement",
        "ba account", "charging"
      ],
      note: "Factoring with Risk & CHA (MDMA) — ARP Accounts Payable, Risk, BA Account"
    },
    {
      domain: "Claim Orchestration",
      aliases: ["capi", "claimapi"],
      keywords: [
        "claim orchestration", "workflow", "claim routing", "routing",
        "claim api", "capi", "accounts receivable", "ar", "claim status",
        "ssp", "ssp status", "claim handling", "orchestration",
        "claim validation", "claim processing"
      ],
      note: "Claim Orchestration — Workflow, Claim Routing, SSP Status"
    },
    {
      domain: "Reception",
      aliases: ["med", "val", "acq", "inp"],
      keywords: [
        "reception", "mediation", "med", "acquisition", "acq",
        "claimfile", "claim file", "validation", "val", "enrichment",
        "enrichers", "imd", "imd input", "inp", "ap301", "ap304",
        "vektis", "mz", "zh", "ha", "os", "pm", "gds", "xml", "prerating",
        "file processing", "file delivery", "claim delivery"
      ],
      note: "Reception (Acquisition: Mediation, Validation, IMD) — ClaimFile, AP301/AP304"
    },
    {
      domain: "Insurers",
      aliases: ["clr", "irb"],
      keywords: [
        "insurers", "clearing", "clr", "irb", "irbroker", "insurance request",
        "vr", "ir", "ia", "va", "ircr", "retrocession", "clearable",
        "insurer", "insurance answer", "uzovi", "annotation",
        "vecozo", "vsp", "edp", "rejection level", "resultcode"
      ],
      note: "Insurers (Clearing + IRBroker) — VR/IR/IA/VA, IRCR, Vecozo"
    },
    {
      domain: "Invoicing and Dunning",
      aliases: ["ind"],
      keywords: [
        "invoicing", "dunning", "invoice", "ind", "print", "printable",
        "dunning stage", "patient portal", "rekening", "payment page",
        "printing data", "pdp", "debtor invoice", "ba report invoicing"
      ],
      note: "Invoicing and Dunning (InD) — Invoice, Dunning, Payment Page (Rekening)"
    },
    {
      domain: "Bailiff",
      aliases: [],
      keywords: [
        "bailiff", "deurwaarder", "debt collection", "bad debtor collection",
        "debt", "bailiff action"
      ],
      note: "Bailiff — debt collection process"
    },
    {
      domain: "Templating and Messaging",
      aliases: ["rnn"],
      keywords: [
        "templating", "messaging", "rnn", "rendering", "notification",
        "template", "report", "message", "email", "letter", "notify",
        "ba report", "debtor report", "communication items",
        "sms", "pdf", "print template", "rendering and notification"
      ],
      note: "Templating and Messaging (RnN) — Rendering, Notification, Reports"
    },
    {
      domain: "Costs and Tariffs",
      aliases: [],
      keywords: [
        "costs", "tariffs", "tariff", "pricing", "price", "rating",
        "rates", "cost", "catalog price", "tariff plan", "arp rating",
        "product pricing"
      ],
      note: "Costs and Tariffs — Pricing plans, Tariffs, ARP Rating"
    },
    {
      domain: "Customer Configuration",
      aliases: ["cat", "catalog"],
      keywords: [
        "customer configuration", "catalog", "configuration", "cat",
        "contract", "ba contract", "product", "platform", "catcfg",
        "customer config", "insurer config", "authorization",
        "controldata", "clearingdata", "business account",
        "product catalog"
      ],
      note: "Customer Configuration (Catalog) — Products, Tariffs, BA Contracts"
    },
    {
      domain: "Vendor API",
      aliases: ["vendorapi"],
      keywords: [
        "vendor", "vendor api", "vendorapi", "retrocession", "claim receipt",
        "external vendor", "ba software", "vendor software",
        "inzicht vendor"
      ],
      note: "Vendor API — ClaimReceipt endpoint, Retrocession"
    },
    {
      domain: "Frontend Infrastructure",
      aliases: ["timui", "capi"],
      keywords: [
        "frontend", "frontend infra", "frontend infrastructure", "tim ui",
        "ui", "inzicht", "agent ui", "web ui", "spa", "views", "screens",
        "claim api frontend", "tim web ui", "agent"
      ],
      note: "Frontend Infrastructure — TIM UI, Agent UI, InZicht, Claim API views"
    },
    {
      domain: "Auditing",
      aliases: ["uia", "msa"],
      keywords: [
        "auditing", "audit", "uia", "msa", "message audit", "ui audit",
        "log", "monitor", "audit trail", "logging", "audit log"
      ],
      note: "Auditing — UI Audit (UIA) + Message Audit (MSA)"
    },
    {
      domain: "Authentication & User Management",
      aliases: ["iip", "iam"],
      keywords: [
        "authentication", "auth", "user management", "iip", "iam",
        "identity", "user", "login", "sso", "oauth", "clp", "user account",
        "identities", "auth management", "dpayws user", "portal user",
        "sha", "symmetric key", "facade"
      ],
      note: "Authentication & User Management (IIP/IAM) — Identity, SSO, User accounts"
    },
  ],
};
