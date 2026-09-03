# Dormant Account Reactivation SOP
**Policy ID:** `PC-DORMANT-001` | **Version:** `1.5` | **Status:** `ACTIVE`  
**Effective Date:** 2026-02-20 | **Next Review Date:** 2027-02-19  
**Policy Owner:** Deposit Operations & Unclaimed Property Desk (Synthetic)  
**Applicable Roles:** Branch Banker, Senior Branch Banker, Operations Analyst, Compliance SME  
**Applicable Region:** ALL-DEMO-REGIONS  
**Supersedes:** 1.4  
**Source URI:** `demo://project-compass/PC-DORMANT-001/v1.5`  

---

> ⚠️ **DEMO NOTICE:** DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.

---

## 1. Purpose
Establish procedures to monitor inactive consumer and commercial deposit accounts, prevent unauthorized account takeovers of stagnant balances, ensure compliance with synthetic escheatment timelines, and execute safe account reactivations.

## 2. Scope
Applicable to all retail branch bankers, operations specialists, and unclaimed property administrators.

## 3. Definitions
- **DEMO_DORMANCY_PERIOD**: Synthetic dormancy timeline of 24 consecutive months (730 calendar days) without customer-initiated financial activity or written communication.
- **Customer-Initiated Activity**: Direct deposit, withdrawal, debit card swipe, online banking authenticated transfer, or written letter signed by account owner.
- **DEMO_DORMANT_HIGH_BAL**: Synthetic high-balance dormancy threshold of $25,000.00 requiring dual-level management reactivation approval.

## 4. Standard Procedures & Controls
### Section 1.0: Dormancy Classification and System Restrictions
- **Citation ID:** `PC-DORMANT-001-v1.5-section-1`
- **Source Reference:** `demo://project-compass/PC-DORMANT-001/v1.5/section/1.0`
- **Applicable Roles:** Operations Analyst, Branch Banker

When an account reaches DEMO_DORMANCY_PERIOD (24 months) without customer-initiated activity, the core system automatically assigns 'DORMANT' status. Automated service fees and interest postings are NOT considered customer-initiated activity. Dormant accounts reject incoming debits, automated clearing house (ACH) withdrawals, and ATM transactions, routing them to the exceptions queue.



### Section 2.0: Reactivation Verification and Workflows
- **Citation ID:** `PC-DORMANT-001-v1.5-section-2`
- **Source Reference:** `demo://project-compass/PC-DORMANT-001/v1.5/section/2.0`
- **Applicable Roles:** Branch Banker, Senior Branch Banker

To reactivate a dormant account, the account holder must appear in person at a branch with two (2) forms of valid identification (at least one unexpired primary government photo ID) and complete the synthetic Account Reactivation Request Form. Alternatively, remote reactivation is permitted only if the customer completes notarized verification or high-assurance video KYC.



### Section 3.0: Approval Thresholds and Escheatment Prevention
- **Citation ID:** `PC-DORMANT-001-v1.5-section-3`
- **Source Reference:** `demo://project-compass/PC-DORMANT-001/v1.5/section/3.0`
- **Applicable Roles:** Senior Branch Banker, Operations Analyst, Compliance SME

Dormant accounts with balances under DEMO_DORMANT_HIGH_BAL ($25,000) may be reactivated with Senior Branch Banker sign-off. Accounts with balances equal to or exceeding DEMO_DORMANT_HIGH_BAL require joint approval from the Branch Manager and Central Deposit Operations. If an account remains dormant for 36 months without reactivation, synthetic pre-escheatment statutory notices must be mailed to the last known address.




## 5. Exceptions
- Accounts linked to an active primary checking relationship held by the same primary CIF (tax ID) are exempt from automated dormancy restrictions under the synthetic householding rule.
- Certificates of Deposit (CDs) that automatically roll over are governed under specific CD maturity renewal schedules.

## 6. Approval Requirements & Thresholds
- Reactivations < $25,000: Branch Banker submission + Senior Branch Banker verification.
- Reactivations >= $25,000: Branch Manager + Deposit Operations Specialist dual approval.

## 7. Escalation Rules
- Escalate to Fraud Operations if an immediate outbound wire transfer or cashier check request is initiated within 48 hours of a dormant account reactivation.
- Escalate to Unclaimed Property Desk if customer is confirmed deceased or mail is returned as undeliverable.

## 8. Compliance & Governance Notes
- Demo governance guidance: Synthetic unclaimed property statutes require state escheatment after 3 to 5 years of verified abandoned dormancy.
- Never execute manual deposits or small balance adjustments to artificially reset dormancy clocks without explicit written customer instruction.
