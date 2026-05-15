# Test Case Naming Conventions

> Azure DevOps Test Plans: https://dev.azure.com/infomedics/TIM/_testPlans/define?planId=41364&suiteId=47496

---

## Overview

This document defines two complementary naming conventions for test cases:

1. **Natural Language Format** — Recommended for Azure DevOps Test Plans
2. **Technical Format** — For automation scripts and code references

Both formats can be used together: Natural Language for human-readable titles in Azure DevOps, Technical Format for automation test identifiers.

---

## Option 1: Natural Language Format *(Recommended for Azure DevOps)*

**Format:** `[Domain] - [Entity] - [Scenario] - [Action] - [Result]`

**Example:** `Accounting - Ledger Connector - Twinfield - Send Documents - Fail Authorization`

### Components

| # | Component | Description | Format | Examples |
|---|-----------|-------------|--------|----------|
| 1 | **Domain** | System area or module full name | Title Case | `Banking`, `Accounting`, `Claim Orchestration` |
| 2 | **Entity** | Main service, module or business object | Title Case, full names | `Payment Agreement`, `Ledger Connector`, `Patient Portal` |
| 3 | **Scenario** | Specific context, sub-system or variant | Title Case | `Twinfield`, `Direct Debit`, `AP304`, `iDEAL` |
| 4 | **Action** | What the test does | Start with verb, Title Case | `Send Documents`, `Pay Term`, `Create via Portal` |
| 5 | **Result** | *(Optional)* Expected outcome | Title Case | `Success`, `Fail Authorization`, `After Rejection` |

### Rules

**DO:**
- Use spaces and dashes (` - `) for readability
- Start Action with a verb (`Create`, `Pay`, `Reject`, etc.)
- Keep Scenario specific — name the sub-system, technology or variant (`Twinfield`, `AP304`, `Direct Debit`)
- Include Result when the outcome matters (`Success`, `Fail Authorization`, `After Rejection`)
- Keep entity names clear and business-friendly
- Use Title Case for all components
- Keep under 100 characters when possible

**DON'T:**
- Use underscores or camelCase
- Abbreviate entity names (use `Payment Agreement` not `PA`)
- Mix Action and Result into one component
- Use technical jargon without context
- Make it overly long or complex

### Pros & Cons

| Pros | Cons |
|------|------|
| Extremely readable — no learning curve | Longer than technical format |
| Works perfectly in Azure DevOps | Contains spaces (not ideal for code) |
| Easy to search and filter | Harder to use as variable names in scripts |
| Professional appearance | |
| Standard format used by 80% of teams | |

**Best for:** Azure DevOps test case titles, documentation, test reports

---

## Option 2: Technical Format *(For Automation & Code)*

**Format:** `[Domain]_[Entity]_[Scenario]_[Action]_[Result]`

**Example:** `Accounting_LedgerConnector_Twinfield_SendDocuments_FailAuthorization`

### Components

| # | Component | Description | Format | Examples |
|---|-----------|-------------|--------|----------|
| 1 | **Domain** | System area full name | CamelCase | `Banking`, `Accounting`, `ClaimOrchestration` |
| 2 | **Entity** | Main service or business object | CamelCase | `PaymentAgreement`, `LedgerConnector`, `PatientPortal` |
| 3 | **Scenario** | Specific context or sub-system | CamelCase | `Twinfield`, `DirectDebit`, `AP304` |
| 4 | **Action** | Operation being tested | CamelCase verb | `SendDocuments`, `Pay`, `Create` |
| 5 | **Result** | *(Optional)* Expected outcome | CamelCase | `Success`, `FailAuthorization`, `AfterRejection` |

### Rules

**DO:**
- Use underscores (`_`) to separate components
- Use CamelCase for multi-word components
- Keep Scenario as specific sub-system or variant name
- Include Result component when outcome matters
- Keep components in order: `Domain_Entity_Scenario_Action_Result`

**DON'T:**
- Use spaces or dashes
- Mix CamelCase and lowercase randomly
- Use special characters (except underscore)
- Make components too long
- Omit critical context

### Pros & Cons

| Pros | Cons |
|------|------|
| Compact and concise | Less readable for humans |
| No spaces — perfect for code/scripts | Requires familiarity with abbreviations |
| Works as function/class names in Playwright | Harder to scan visually |
| Programmatically parseable | Not as professional in reports |

**Best for:** Test automation scripts, code identifiers, CI/CD pipelines, API names

---

## Side-by-Side Comparison

| # | Natural Language Format | Technical Format |
|---|------------------------|-----------------|
| 1 | `Accounting - Ledger Connector - Twinfield - Send Documents - Fail Authorization` | `Accounting_LedgerConnector_Twinfield_SendDocuments_FailAuthorization` |
| 2 | `Accounting - Ledger Connector - Twinfield - Send Documents - Success` | `Accounting_LedgerConnector_Twinfield_SendDocuments_Success` |
| 3 | `Banking - Payment Agreement - Direct Debit - Pay Term - Success` | `Banking_PaymentAgreement_DirectDebit_Pay_Success` |
| 4 | `Banking - Patient Portal - Account - Create without Invoice` | `Banking_PatientPortal_Account_Create_WithoutInvoice` |
| 5 | `Reception - Mediation - AP301 - Process File - Success` | `Reception_Mediation_AP301_ProcessFile_Success` |
| 6 | `Claim Orchestration - Workflow - Claim Routing - Route to Correct Handler` | `ClaimOrchestration_Workflow_ClaimRouting_Route_AutoAssign` |

---

## Recommended Usage

| Context | Format | Example |
|---------|--------|---------|
| **Azure DevOps test case title** (user-facing) | Natural Language | `Accounting - Ledger Connector - Twinfield - Send Documents - Fail Authorization` |
| **Automation test identifier** (code-facing) | Technical | `Accounting_LedgerConnector_Twinfield_SendDocuments_FailAuthorization` |

---

## Component Vocabulary

### Domains

| Natural Language (Azure DevOps) | Technical Format (CamelCase) |
|---------------------------------|------------------------------|
| Banking | `Banking` |
| Reception | `Reception` |
| Claim Orchestration | `ClaimOrchestration` |
| Factoring | `Factoring` |
| Costs and Tariffs | `CostsAndTariffs` |
| Insurers | `Insurers` |
| Invoicing and Dunning | `InvoicingAndDunning` |
| Bailiff | `Bailiff` |
| Payment Matching | `PaymentMatching` |
| Customer Configuration | `CustomerConfiguration` |
| Auditing | `Auditing` |
| Accounting | `Accounting` |
| Templating and Messaging | `TemplatingAndMessaging` |
| Frontend Infrastructure | `FrontendInfrastructure` |
| Vendor API | `VendorAPI` |
| Authentication & User Management | `AuthAndUserMgmt` |
| BI Data Collector | `BIDataCollector` |
| End-to-End Testing | `EndToEndTesting` |
| Performance Testing | `PerformanceTesting` |
| Security Testing | `SecurityTesting` |

### Entity Terms

| Natural Language | Technical Format |
|-----------------|-----------------|
| Payment Agreement | `PaymentAgreement` |
| Acquisition | `Acquisition` |
| BA Invoice | `BAInvoice` |
| Patient | `Patient` |
| Patient Portal | `PatientPortal` |
| Credit | `Credit` |
| Claim | `Claim` |
| Insurance Receivable | `InsuranceReceivable` / `IR` |
| Direct Debit | `DirectDebit` |
| Installment | `Installment` |
| Term | `Term` |
| Settlement | `Settlement` |
| Mediation | `Mediation` |
| Validation | `Validation` |
| Risk Assessment | `RiskAssessment` |
| Workflow | `Workflow` |

### Action Verbs

`Create` · `Pay` · `Reject` · `Process` · `Validate` · `Match` · `Update` · `Delete` · `Search` · `Filter` · `Export` · `Import` · `Send` · `Receive` · `Confirm` · `Cancel` · `Retry` · `Break` · `Link` · `Route` · `Calculate` · `Generate` · `Approve` · `Assign`

### Scenario / Context Terms

| Natural Language | Technical Format |
|-----------------|-----------------|
| via Portal | `Portal` / `ViaPortal` |
| on Payment Page | `PaymentPage` |
| for AP304 | `AP304` / `ForAP304` |
| Before Batch DD | `BeforeBatchDD` |
| After Rejection | `AfterRejection` |
| with Standard Payment | `StandardPayment` / `WithStandard` |
| to Account | `ToAccount` |
| Manually | `Manual` |
| Automatically | `Auto` / `Automatic` |

### Result / Outcome Terms

| Natural Language | Technical Format |
|-----------------|-----------------|
| Successfully | `Success` |
| Failed | `Failed` |
| Rejected | `Rejected` |
| After Rejection | `AfterRejection` |
| with Error | `WithError` |

---

## Real-World Examples — Banking Domain (24 Test Cases)

### Natural Language Format

**Payment Agreement (4)**
1. `Banking - Payment Agreement - Direct Debit - Create via Payment Page`
2. `Banking - Payment Agreement - Direct Debit - Pay Term - Success`
3. `Banking - Payment Agreement - Direct Debit - Reject Term - Failed`
4. `Banking - Payment Agreement - Direct Debit - Break Agreement - After Rejection`

**Acquisition (4)**
5. `Banking - Acquisition - AP304 Direct Debit - Create`
6. `Banking - Acquisition - AP304 Direct Debit - Pay - Success`
7. `Banking - Acquisition - AP304 Direct Debit - Reject - Failed`
8. `Banking - Acquisition - AP304 Direct Debit - Retry - After Rejection`

**BA Invoice (5)**
9. `Banking - BA Invoice - Direct Debit - Create - Success`
10. `Banking - BA Invoice - Direct Debit - Pay - Success`
11. `Banking - BA Invoice - Direct Debit - Reject - Failed`
12. `Banking - BA Invoice - Direct Debit - Pay Manually - Before Batch DD`
13. `Banking - BA Invoice - Standard Payment - Pay - Before Batch DD`

**Patient (3)**
14. `Banking - Patient - Direct Debit - Create via Patient Portal`
15. `Banking - Patient - Direct Debit - Pay - Success`
16. `Banking - Patient - Direct Debit - Reject - Failed`

**Credit (3)**
17. `Banking - Credit - Installment Direct Debit - Create`
18. `Banking - Credit - Installment Direct Debit - Pay - Success`
19. `Banking - Credit - Installment Direct Debit - Reject - Failed`

**Standard Payments (2)**
20. `Banking - Claim - Standard Payment - Pay`
21. `Banking - Insurance Receivable - Standard Payment - Pay`

**Patient Portal (3)**
22. `Banking - Patient Portal - Account - Create without Invoice`
23. `Banking - Patient Portal - Account - Create with Invoice`
24. `Banking - Patient Portal - Claim - Link to Account`

---

### Technical Format

**Payment Agreement (4)**
1. `Banking_PaymentAgreement_DirectDebit_Create_PaymentPage`
2. `Banking_PaymentAgreement_DirectDebit_Pay_Success`
3. `Banking_PaymentAgreement_DirectDebit_Reject_Failed`
4. `Banking_PaymentAgreement_DirectDebit_Break_AfterRejection`

**Acquisition (4)**
5. `Banking_Acquisition_AP304DirectDebit_Create`
6. `Banking_Acquisition_AP304DirectDebit_Pay_Success`
7. `Banking_Acquisition_AP304DirectDebit_Reject_Failed`
8. `Banking_Acquisition_AP304DirectDebit_Retry_AfterRejection`

**BA Invoice (5)**
9. `Banking_BAInvoice_DirectDebit_Create_Success`
10. `Banking_BAInvoice_DirectDebit_Pay_Success`
11. `Banking_BAInvoice_DirectDebit_Reject_Failed`
12. `Banking_BAInvoice_DirectDebit_PayManually_BeforeBatchDD`
13. `Banking_BAInvoice_StandardPayment_Pay_BeforeBatchDD`

**Patient (3)**
14. `Banking_Patient_DirectDebit_Create_PatientPortal`
15. `Banking_Patient_DirectDebit_Pay_Success`
16. `Banking_Patient_DirectDebit_Reject_Failed`

**Credit (3)**
17. `Banking_Credit_InstallmentDirectDebit_Create`
18. `Banking_Credit_InstallmentDirectDebit_Pay_Success`
19. `Banking_Credit_InstallmentDirectDebit_Reject_Failed`

**Standard Payments (2)**
20. `Banking_Claim_StandardPayment_Pay`
21. `Banking_InsuranceReceivable_StandardPayment_Pay`

**Patient Portal (3)**
22. `Banking_PatientPortal_Account_Create_WithoutInvoice`
23. `Banking_PatientPortal_Account_Create_WithInvoice`
24. `Banking_PatientPortal_Claim_Link_ToAccount`

---

## Discussion Questions for Team

1. Which format do you find more readable and easier to understand?
2. Should we use Natural Language for Azure and Technical for automation, or standardize on one format?
3. Are the domain names (`Banking`, `Claim Orchestration`, etc.) clear enough? Should any be shortened or aliased?
4. Do the entity names make sense from a business perspective? Any suggestions?
5. Are there any action verbs or scenario terms we should add to the vocabulary?
6. Should we enforce character limits? (e.g., max 80 characters)
7. How should we handle edge cases or complex scenarios that don't fit the format?
8. Should we create a tool/template to help generate names automatically?
9. Who will be responsible for maintaining the naming convention standards?
10. How do we ensure consistency across all domains and test suites?

---

## Next Steps

- [ ] Review both formats with team
- [ ] Decide on primary format (or hybrid approach)
- [ ] Get approval from stakeholders
- [ ] Update existing test cases to match convention
- [ ] Create templates and examples for other domains
- [ ] Train team members on the conventions
- [ ] Set up validation/linting for new test cases
- [ ] Document in team wiki/Confluence
