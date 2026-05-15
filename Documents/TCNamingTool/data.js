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
};
