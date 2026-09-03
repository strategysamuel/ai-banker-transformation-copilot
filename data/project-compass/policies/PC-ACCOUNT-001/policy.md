# Deposit Account Opening SOP
**Policy ID:** `PC-ACCOUNT-001` | **Version:** `1.0` | **Status:** `ACTIVE`  
**Effective Date:** 2026-01-15 | **Next Review Date:** 2027-01-14  
**Policy Owner:** Retail Banking Operations Committee (Synthetic)  
**Applicable Roles:** Branch Banker, Senior Branch Banker, Contact Center Agent  
**Applicable Region:** ALL-DEMO-REGIONS  
**Supersedes:** None (Initial Release)  
**Source URI:** `demo://project-compass/PC-ACCOUNT-001/v1.0`  

---

> ⚠️ **DEMO NOTICE:** DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.

---

## 1. Purpose
Establish clear, standardized steps for frontline retail bankers to verify customer identities, fulfill synthetic Customer Due Diligence (CDD) requirements, and open retail deposit accounts.

## 2. Scope
Applies to all retail branch personnel, virtual relationship bankers, and central deposit operations specialists opening personal checking, savings, or money market accounts.

## 3. Definitions
- **Primary ID**: Unexpired government-issued photo identification including passport, state driver's license, or national identity card.
- **Secondary ID**: Valid secondary proof such as major credit card, employee photo ID, or utility bill issued within the last 90 days.
- **DEMO_MIN_OPENING_DEPOSIT**: Synthetic minimum opening deposit benchmark of $25.00 for basic consumer checking accounts.

## 4. Standard Procedures & Controls
### Section 1.0: Customer Identification and Due Diligence
- **Citation ID:** `PC-ACCOUNT-001-v1.0-section-1`
- **Source Reference:** `demo://project-compass/PC-ACCOUNT-001/v1.0/section/1.0`
- **Applicable Roles:** Branch Banker, Senior Branch Banker

Bankers must obtain and physically inspect one (1) unexpired Primary ID and one (1) Secondary ID. The customer's legal name, date of birth, residential address, and taxpayer identification number must be recorded into the core deposit workstation. If the customer is a non-resident alien, an unexpired foreign passport with valid consular visa documentation is mandatory.

*Demo governance guidance: Meets synthetic KYC/CDD baseline requirements.*

### Section 2.0: Initial Deposit and Funding Verification
- **Citation ID:** `PC-ACCOUNT-001-v1.0-section-2`
- **Source Reference:** `demo://project-compass/PC-ACCOUNT-001/v1.0/section/2.0`
- **Applicable Roles:** Branch Banker, Senior Branch Banker

The customer must tender the minimum initial deposit equal to or exceeding DEMO_MIN_OPENING_DEPOSIT. Initial funding may be executed via cash, internal ledger transfer from an existing verified account, or teller cashier's check. Personal third-party checks deposited at account opening are subject to a mandatory 5-business-day new account settlement hold.



### Section 3.0: Document Archival and Customer Welcome Disclosure
- **Citation ID:** `PC-ACCOUNT-001-v1.0-section-3`
- **Source Reference:** `demo://project-compass/PC-ACCOUNT-001/v1.0/section/3.0`
- **Applicable Roles:** Branch Banker, Contact Center Agent

All scanned identity records, the signed electronic Deposit Account Agreement, and Fee Schedules must be archived in the Document Archival Vault within 24 hours of account creation. The banker must provide the customer with a physical or secure electronic welcome packet containing account routing details and the synthetic Truth in Savings disclosure.




## 5. Exceptions
- Customers lacking a primary photo ID due to age (minors under 16) may open a custodial UTMA/UGMA account utilizing a certified birth certificate accompanied by the parent/guardian's primary photo identification.
- Temporary residential addresses (hotels, PO Boxes) are strictly prohibited as primary addresses; accounts may only list a PO Box as an optional secondary mailing address.

## 6. Approval Requirements & Thresholds
- Standard account openings require single-operator banker submission.
- Accounts opened for non-resident clients or entities with foreign beneficial ownership require Senior Branch Banker or Compliance SME review prior to debit card provisioning.

## 7. Escalation Rules
- Escalate to Fraud Prevention Operations if automated OFAC/Sanction screening returns a potential match score >= 85%.
- Escalate to Branch Operations Manager if customer refuses to provide residential physical address proof.

## 8. Compliance & Governance Notes
- Demo governance guidance: Customer identity records must be retained in accordance with synthetic 7-year record retention mandates.
- Do not advise customers on tax withholding implications; provide standard synthetic IRS Form W-9 / W-8BEN guidance only.
