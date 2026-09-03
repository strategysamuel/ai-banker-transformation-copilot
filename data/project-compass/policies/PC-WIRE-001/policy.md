# International Wire Transfer SOP
**Policy ID:** `PC-WIRE-001` | **Version:** `4.2` | **Status:** `ACTIVE`  
**Effective Date:** 2026-08-01 | **Next Review Date:** 2027-07-31  
**Policy Owner:** Global Payments & Wire Operations (Synthetic)  
**Applicable Roles:** Branch Banker, Senior Branch Banker, Operations Analyst, Compliance SME  
**Applicable Region:** ALL-DEMO-REGIONS  
**Supersedes:** 4.1  
**Source URI:** `demo://project-compass/PC-WIRE-001/v4.2`  

---

> ⚠️ **DEMO NOTICE:** DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.

---

## 1. Purpose
Define operational, screening, and dual-control mandates for international wire transfers, ensuring adherence to synthetic payment sanctions, currency exchange disclosure rules, and fraud prevention controls.

## 2. Scope
Mandatory for all frontline branch bankers, premier banking advisors, call center wire desks, and back-office wire operations analysts.

## 3. Definitions
- **SWIFT BIC**: Bank Identifier Code (8 or 11 alphanumeric characters) uniquely designating financial institutions in cross-border settlements.
- **IBAN**: International Bank Account Number containing country code, check digits, and destination account identifier.
- **DEMO_LIMIT_B**: Current synthetic threshold of $10,000.00 USD equivalent requiring dual-authorization supervisor sign-off and verbal out-of-band callback verification.
- **Out-of-Band Callback**: Direct voice call placed to customer's telephone number on file for >= 30 days prior to wire release.

## 4. Standard Procedures & Controls
### Section 1.0: Beneficiary and Payment Data Collection
- **Citation ID:** `PC-WIRE-001-v4.2-section-1`
- **Source Reference:** `demo://project-compass/PC-WIRE-001/v4.2/section/1.0`
- **Applicable Roles:** Branch Banker, Senior Branch Banker

Banker must collect full legal beneficiary name, full street address (no PO boxes), beneficiary bank SWIFT BIC, destination IBAN/Account number, and specific economic purpose of payment. Generic descriptions such as 'goods', 'services', or 'family support' must be rejected; specific descriptions such as 'University Tuition Fall 2026' or 'Commercial Invoice #88412' are required.

*Demo governance guidance: Essential for synthetic FATF Travel Rule compliance.*

### Section 2.0: Sanctions Screening and FX Pre-Disclosures
- **Citation ID:** `PC-WIRE-001-v4.2-section-2`
- **Source Reference:** `demo://project-compass/PC-WIRE-001/v4.2/section/2.0`
- **Applicable Roles:** Branch Banker, Operations Analyst

Prior to order submission, the system automatically checks beneficiary, originator, and intermediary banks against synthetic Sanctions Lists. The banker must generate and provide the Remittance Transfer Pre-Payment Disclosure detailing exchange rate, transfer fees, foreign taxes, and exact estimated delivery date.



### Section 3.0: Dual Authorization & Callback Thresholds
- **Citation ID:** `PC-WIRE-001-v4.2-section-3`
- **Source Reference:** `demo://project-compass/PC-WIRE-001/v4.2/section/3.0`
- **Applicable Roles:** Branch Banker, Senior Branch Banker, Operations Analyst

Standard wires up to DEMO_LIMIT_B ($10,000 USD equivalent) initiated in-person require primary ID verification and single banker release. Any wire exceeding DEMO_LIMIT_B ($10,000 USD equivalent) or any non-in-person wire regardless of amount mandates dual authorization (Maker-Checker): (1) Banker input, (2) Branch Supervisor secondary electronic authorization following a recorded Out-of-Band Callback to the customer's established primary phone number.

*Demo governance guidance: Strict fraud mitigation standard. Never bypass callback requirements.*

### Section 4.0: Cancellation and 30-Minute Rescission Rights
- **Citation ID:** `PC-WIRE-001-v4.2-section-4`
- **Source Reference:** `demo://project-compass/PC-WIRE-001/v4.2/section/4.2`
- **Applicable Roles:** Branch Banker, Contact Center Agent, Operations Analyst

Consumer remitters retain the right to cancel an international consumer wire transfer within 30 minutes of order confirmation without penalty, provided the funds have not yet been picked up or credited by the foreign beneficiary institution. Bankers must execute immediate recall in the wire terminal upon verbal or written customer request within this window.




## 5. Exceptions
- Recurring pre-authorized corporate treasury wires with active master service agreements are exempt from manual per-transaction verbal callback.
- Wires to designated high-risk jurisdictions require mandatory Compliance SME pre-clearance regardless of transaction amount.

## 6. Approval Requirements & Thresholds
- Amounts <= DEMO_LIMIT_B ($10,000 USD): Branch Banker release.
- Amounts > DEMO_LIMIT_B ($10,000 USD): Branch Banker creation + Supervisor dual authorization + Out-of-Band Callback.
- Amounts > $100,000 USD equivalent: Branch Manager + Central Payments Desk dual sign-off.

## 7. Escalation Rules
- Any sanction screening hit with score >= 80% must be escalated immediately to Sanctions Compliance Desk.
- Any callback where phone number was modified within the preceding 30 days requires mandatory in-person branch appearance or video notarized verification.

## 8. Compliance & Governance Notes
- Demo governance guidance: Synthetic remittance transfer regulations grant a 30-minute consumer cancellation window.
- Never execute wire transfers based on unverified email requests or urgent caller instructions without strict callback validation.
