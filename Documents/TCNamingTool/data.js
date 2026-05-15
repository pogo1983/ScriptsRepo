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
        "order out-payment", "order in-payment", "mutation", "bank account", "statement",
        "ami", "installment", "pre-match payment", "manual match payment",
        "return code", "payer bank", "bank return", "credit payment", "debit payment",
        "i160876"
      ],
      note: "Banking & Matching (BnM) — DD, iDEAL, BA Invoice, Credit, Patient Portal"
    },
    {
      domain: "Payment Matching",
      aliases: ["bnm", "matching"],
      keywords: [
        "payment matching", "matching", "matchable item", "bank statement",
        "camt", "pof", "categorize", "manual match", "forward", "payback",
        "receivable", "payable", "payment file",
        "matching details", "possible matches", "match forward", "match payback",
        "matchable item type", "matching overview",
        "i160876"
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
        "financial booking", "charging", "send documents",
        "feed ledger", "feed general ledger", "feed online ledger",
        "financial control", "monitor ar", "ar balance",
        "failed booking", "retry booking", "booking failure", "ledger booking",
        "boekhouding", "prepare booking", "booking holiday",
        "i153828"
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
        "ba account", "charging",
        "rate and charge", "retrocede", "retrocession", "financial operations",
        "rate charge settle", "core arp",
        "daily settlements", "settlements overview", "financial settlement overview",
        "daily finance", "todo finance", "unsettled settlements", "settled settlements"
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
        "claim validation", "claim processing", "claim action",
        "trigger rule", "rule interpreter", "rule engine", "tim rule",
        "rule validation", "postpone claim", "claim postpone"
      ],
      note: "Claim Orchestration — Workflow, Claim Routing, SSP Status, Rules"
    },
    {
      domain: "Reception",
      aliases: ["med", "val", "acq", "inp"],
      keywords: [
        "reception", "mediation", "med", "acquisition", "acq",
        "claimfile", "claim file", "validation", "val", "enrichment",
        "enrichers", "imd", "imd input", "inp", "ap301", "ap304",
        "vektis", "mz", "zh", "ha", "os", "pm", "gds", "xml", "prerating",
        "file processing", "file delivery", "claim delivery",
        "deliver claimfile", "receive claimfile", "enrich claim",
        "buy claimfile", "take over risk", "determine debtor",
        "acquisition rule", "country code", "debtor record", "claim enrichment",
        "validation claim", "validation rule", "claim acquisition",
        "i153819"
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
        "vecozo", "vsp", "edp", "rejection level", "resultcode",
        "issue insurance request", "configure ircr", "clearable claimlines",
        "receive insurance answer", "stop clearing",
        "doctype", "clearable claim", "reminder clearing", "doctype reminder",
        "i153821"
      ],
      note: "Insurers (Clearing + IRBroker) — VR/IR/IA/VA, IRCR, Vecozo"
    },
    {
      domain: "Invoicing and Dunning",
      aliases: ["ind"],
      keywords: [
        "invoicing", "dunning", "invoice", "ind", "print", "printable",
        "dunning stage", "patient portal", "rekening", "payment page",
        "printing data", "pdp", "debtor invoice", "ba report invoicing",
        "dun debtor", "invoice debtor", "transfer debt", "issue agreement term",
        "pay online", "request credit", "stop dunning",
        "digital portal", "invoice clearing", "digital invoice", "ideal invoice",
        "clearing invoice", "dunning letter", "payment agreement term",
        "i153822", "i153824"
      ],
      note: "Invoicing and Dunning (InD) — Invoice, Dunning, Payment Page (Rekening)"
    },
    {
      domain: "Bailiff",
      aliases: [],
      keywords: [
        "bailiff", "deurwaarder", "debt collection", "bad debtor collection",
        "debt", "bailiff action", "transfer to bailiff", "bailiff transfer",
        "ssp bailiff", "nota bailiff", "overdracht deurwaarder"
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
        "sms", "pdf", "print template", "rendering and notification",
        "send ba report", "send debtor report", "notification facade",
        "mail template", "email template", "sms notification", "error notification",
        "email address", "notification message", "generate report"
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
        "controldata", "controldataprovider", "control data provider",
        "provider", "clearingdata", "business account",
        "product catalog", "ic authorization", "register ba contract",
        "catalog of customers", "catalog of insurers", "catalog of products",
        "define service template", "define price template",
        "catalog api", "contract settings", "contract relationships",
        "modify contract", "new contract", "business account settings",
        "third party connector", "thirdpartyconnector", "third party", "external connector",
        "i153825", "i153826", "i153827"
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
        "claim api frontend", "tim web ui", "agent",
        "interact with customer", "handle actionable claim", "enquire claimfile",
        "i153823"
      ],
      note: "Frontend Infrastructure — TIM UI, Agent UI, InZicht, Claim API views"
    },
    {
      domain: "Auditing",
      aliases: ["uia", "msa"],
      keywords: [
        "auditing", "audit", "uia", "msa", "message audit", "ui audit",
        "log", "monitor", "audit trail", "logging", "audit log",
        "audit data", "audit log sending", "imd audit"
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
        "sha", "symmetric key", "facade", "manage identities", "identity provider",
        "create iam user", "delete iam user", "iam user", "password reset",
        "user role", "create user", "delete user", "assign role", "user permission"
      ],
      note: "Authentication & User Management (IIP/IAM) — Identity, SSO, User accounts"
    },
  ],

  // ── Component / service index (from IMF Mapping.xlsx / TIM\ project names) ─
  // Used for searching by project or service name (e.g. "Ledger Connector", "IRBroker")
  // Scoring: each word from the component name that appears in the query = +2 pts
  //          Requires ≥2 matching words for multi-word names, ≥1 for single-word
  components: [
    { name: "Core Catalog",               domain: "Customer Configuration" },
    { name: "Core WebApi",                domain: "Frontend Infrastructure" },
    { name: "ARP",                        domain: "Factoring" },
    { name: "Acquisition Mediation",      domain: "Reception" },
    { name: "Acquisition Validation",     domain: "Reception" },
    { name: "Acquisition Enrichers",      domain: "Reception" },
    { name: "Banking And Matching",       domain: "Banking" },
    { name: "Clearing",                   domain: "Insurers" },
    { name: "IRBroker",                   domain: "Insurers" },
    { name: "Invoicing And Dunning",      domain: "Invoicing and Dunning" },
    { name: "Rendering And Notification", domain: "Templating and Messaging" },
    { name: "Claim WebApi",               domain: "Frontend Infrastructure" },
    { name: "Invoice WebAPI",             domain: "Invoicing and Dunning" },
    { name: "VendorAPI",                  domain: "Vendor API" },
    { name: "Ledger Connector",           domain: "Accounting" },
    { name: "Payment Provider",           domain: "Banking" },
    { name: "Credit UI",                  domain: "Banking" },
    { name: "IIP",                        domain: "Authentication & User Management" },
    { name: "IIP IAM",                    domain: "Authentication & User Management" },
    { name: "Agent UI",                   domain: "Frontend Infrastructure" },
    { name: "Patient Portal",             domain: "Invoicing and Dunning" },
    { name: "UI Audit",                   domain: "Auditing" },
    { name: "Audit Facade API",           domain: "Auditing" },
    { name: "Notification Facade API",    domain: "Templating and Messaging" },
    { name: "WebApi DPayWS",              domain: "Banking" },
    { name: "Third Party Connector",      domain: "Customer Configuration" },
    { name: "ThirdPartyConnector",        domain: "Customer Configuration" },
  ],
};
