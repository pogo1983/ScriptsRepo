# TC Naming

> Azure DevOps Test Plans: https://dev.azure.com/infomedics/TIM/_testPlans/define?planId=41364&suiteId=47496

---

## Format

**`[Domain] - [Entity] - [Scenario] - [Action] - [Result]`**

**Examples:**
```
Accounting - Ledger Connector - Twinfield - Send Documents - Fail Authorization
Accounting - Ledger Connector - Twinfield - Send Documents - Success
Accounting - Ledger Connector - Twinfield - Send Documents
Banking - Payment Agreement - Direct Debit - Pay Term - Success
Reception - Mediation - AP301 - Process File - Success
```

---

## Components

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

---

## Vocabulary

### Domains

| Domain | Cluster | Team |
|--------|---------|------|
| Banking | Finance | Yellow 1 |
| Payment Matching | Finance | Yellow 1 |
| Accounting | Finance | Yellow 1 |
| Frontend Infrastructure | Finance | Yellow 2 |
| Auditing | Finance | Yellow 2 |
| Authentication & User Management | Finance | Yellow 2 |
| Reception | Customer | Green 2 |
| Claim Orchestration | Customer | Green 3 |
| Factoring | Customer | Green 1 |
| Costs and Tariffs | Customer | Green 1 |
| Customer Configuration | Customer | Green 1 |
| Vendor API | Customer | Green 2 |
| Insurers | Care Consumer | Blue 1 |
| Templating and Messaging | Care Consumer | Blue 1 |
| Invoicing and Dunning | Care Consumer | Blue 2 |
| Bailiff | Care Consumer | Blue 2 |

### Entity Terms

Payment Agreement · Acquisition · BA Invoice · Patient · Patient Portal · Credit · Claim · Insurance Receivable · Direct Debit · Installment · Term · Settlement · Mediation · Validation · Risk Assessment · Workflow · Ledger Connector · DPAYWS

### Action Verbs

`Create` · `Pay` · `Reject` · `Process` · `Validate` · `Match` · `Update` · `Delete` · `Search` · `Filter` · `Export` · `Import` · `Send` · `Receive` · `Confirm` · `Cancel` · `Retry` · `Break` · `Link` · `Route` · `Calculate` · `Generate` · `Approve` · `Assign`

### Scenario / Context Terms

Twinfield · AFAS · Exact · Direct Debit · Installment Direct Debit · AP304 Direct Debit · AP301 · Standard Payment · Monthly Subscription · iDEAL · Payment Page · Patient Portal · Account · Claim Routing · SSP Status · Multi BA Login

### Result / Outcome Terms

Success · Failed · After Rejection · Fail Authorization · Before Batch DD · Without Invoice · With Invoice · Wrong Amount

---

## Real-World Examples — Banking Domain (24 Test Cases)

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

## Discussion Questions for Team

1. Are the domain names (`Banking`, `Claim Orchestration`, etc.) clear enough? Should any be renamed?
2. Do the entity names make sense from a business perspective? Any suggestions?
3. Are there any action verbs or scenario terms we should add to the vocabulary?
4. Should we enforce a character limit? (e.g., max 100 characters)
5. How should we handle edge cases or complex scenarios that don't fit the format?
6. Who will be responsible for maintaining the naming convention standards?
7. How do we ensure consistency across all domains and test suites?

---

## Next Steps

- [ ] Get team approval
- [ ] Update existing test cases to match convention
- [ ] Create examples for remaining domains
- [ ] Train team members
- [ ] Document in team wiki/Confluence
