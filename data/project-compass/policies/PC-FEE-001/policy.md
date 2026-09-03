# Fee Waiver Approval SOP
**Policy ID:** `PC-FEE-001` | **Version:** `2.1` | **Status:** `ACTIVE`  
**Effective Date:** 2026-07-01 | **Next Review Date:** 2027-06-30  
**Policy Owner:** Customer Care & Branch Governance (Synthetic)  
**Applicable Roles:** Branch Banker, Senior Branch Banker, Contact Center Agent, Contact Center Supervisor  
**Applicable Region:** ALL-DEMO-REGIONS  
**Supersedes:** 2.0  
**Source URI:** `demo://project-compass/PC-FEE-001/v2.1`  

---

> ⚠️ **DEMO NOTICE:** DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.

---

## 1. Purpose
Establish clear limits, mandatory reason logging, and supervisory escalation matrices for retail deposit account fee waivers, reversals, and courtesy credits.

## 2. Scope
Applies to all retail branch bankers, contact center specialists, assistant branch managers, and customer experience operations teams.

## 3. Definitions
- **DEMO_FEE_TIER_1**: Current synthetic frontline banker discretionary ceiling of $50.00 cumulative per customer per rolling 12 months.
- **DEMO_FEE_TIER_2**: Current synthetic supervisory discretionary ceiling of $150.00 cumulative per customer per rolling 12 months.
- **Bank Error Reversal**: Direct fee reversal resulting from verified system malfunction, delayed processing, or staff administrative error.

## 4. Standard Procedures & Controls
### Section 1.0: Discretionary Tiers and Authority Matrix
- **Citation ID:** `PC-FEE-001-v2.1-section-1`
- **Source Reference:** `demo://project-compass/PC-FEE-001/v2.1/section/1.0`
- **Applicable Roles:** Branch Banker, Senior Branch Banker, Contact Center Agent, Contact Center Supervisor

Frontline Branch Bankers and Contact Center Agents possess discretionary authority to waive eligible retail fees up to DEMO_FEE_TIER_1 ($50.00), capped at a maximum of two (2) occurrences per rolling 12-month period. Senior Branch Bankers and Contact Center Supervisors may authorize waivers up to DEMO_FEE_TIER_2 ($150.00). Waivers exceeding DEMO_FEE_TIER_2 require Branch Manager or Operations Director electronic sign-off.



### Section 2.0: Mandatory Reason Code Categorization
- **Citation ID:** `PC-FEE-001-v2.1-section-2`
- **Source Reference:** `demo://project-compass/PC-FEE-001/v2.1/section/2.0`
- **Applicable Roles:** Branch Banker, Contact Center Agent

Every fee waiver request submitted in the terminal must be categorized under one of the mandatory standard reason codes: (A) BANK-ERR: Verified operational/system error; (B) COURTESY-FIRST: First-time overdraft/courtesy concession; (C) MILITARY/STUDENT: Certified demographic fee exemption; (D) PRODUCT-TRANSITION: Account conversion grace period. Free-form waivers without selecting a valid reason code are blocked by the system.



### Section 3.0: Non-Waivable Fees and Prohibited Adjustments
- **Citation ID:** `PC-FEE-001-v2.1-section-3`
- **Source Reference:** `demo://project-compass/PC-FEE-001/v2.1/section/3.0`
- **Applicable Roles:** Branch Banker, Contact Center Agent, Contact Center Supervisor

The following fees cannot be waived under frontline discretionary authority: (1) Outgoing International Wire SWIFT transmission fees; (2) Legal process levy/garnishment processing fees; (3) Third-party foreign ATM surcharge pass-through charges. Such fees may only be credited if verified as a direct Bank Error with Operations Director approval.




## 5. Exceptions
- Verified Bank Error reversals do not count against the customer's annual discretionary courtesy waiver allotment.
- Natural disaster relief programs declared by executive management provide automated fee suppressions outside standard branch limits.

## 6. Approval Requirements & Thresholds
- Waivers <= $50.00: Branch Banker / Agent single entry.
- Waivers $50.01 - $150.00: Senior Branch Banker / Supervisor approval.
- Waivers > $150.00: Branch Manager / Retail Operations Director approval.

## 7. Escalation Rules
- Customers demanding excessive fee waivers (> $300 cumulative) must be referred to the Customer Relationship Retention Team.
- Repeated overdraft fee waiver requests (> 4 in 6 months) require an account review meeting to evaluate enrollment in Overdraft Protection or transition to a zero-overdraft checking product.

## 8. Compliance & Governance Notes
- Demo governance guidance: Fair Lending and synthetic regulatory guidance require consistent, non-discriminatory application of fee waiver matrices across all customer demographics.
- Audit logs must record employee ID, timestamp, customer ID, reason code, and dollar adjustment for all fee adjustments.
