# Debit Card Replacement SOP
**Policy ID:** `PC-CARD-001` | **Version:** `3.0` | **Status:** `ACTIVE`  
**Effective Date:** 2026-05-15 | **Next Review Date:** 2027-05-14  
**Policy Owner:** Card Services & Branch Operations (Synthetic)  
**Applicable Roles:** Branch Banker, Senior Branch Banker, Contact Center Agent  
**Applicable Region:** ALL-DEMO-REGIONS  
**Supersedes:** 2.5  
**Source URI:** `demo://project-compass/PC-CARD-001/v3.0`  

---

> ⚠️ **DEMO NOTICE:** DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.

---

## 1. Purpose
Provide standard operational steps to block compromised debit cards, protect customer account funds, and re-issue debit cards via instant branch embossing or standard secure postal fulfillment.

## 2. Scope
All retail branch staff, phone support representatives, and card services fulfillment personnel.

## 3. Definitions
- **Instant Issuance**: On-demand encoding and thermal embossing of a personalized debit card inside a physical branch facility.
- **Warm Card Status**: Temporary card freeze allowing customer to self-unfreeze within 14 days if card is temporarily misplaced.
- **Hot Card Status**: Permanent non-reversible card block and cancellation due to verified fraud, loss, or theft.

## 4. Standard Procedures & Controls
### Section 1.0: Card Compromise Reporting and Immediate Blocking
- **Citation ID:** `PC-CARD-001-v3.0-section-1`
- **Source Reference:** `demo://project-compass/PC-CARD-001/v3.0/section/1.0`
- **Applicable Roles:** Branch Banker, Contact Center Agent

When a customer reports a lost, stolen, or compromised card, the banker must immediately apply 'Hot Card - Stolen/Lost' status in the card portal. This action instantly revokes tokenized digital wallet credentials (Apple Pay/Google Wallet) and declines pending card-present and e-commerce authorizations. If the customer merely misplaced the card at home, a temporary 'Warm Card - Customer Freeze' status may be selected.



### Section 2.0: Instant In-Branch Issuance Protocol
- **Citation ID:** `PC-CARD-001-v3.0-section-2`
- **Source Reference:** `demo://project-compass/PC-CARD-001/v3.0/section/2.0`
- **Applicable Roles:** Branch Banker, Senior Branch Banker

For in-person card replacement, the customer must present one (1) unexpired primary photo ID. The banker retrieves a blank EMV chip stock card from the dual-custody vault safe, encodes the card via the branch instant issuance machine, and instructs the customer to input their private 4-digit PIN directly into the secure PIN pad terminal. Bankers are strictly prohibited from viewing or keying PIN numbers on behalf of customers.



### Section 3.0: Mail Dispatch and Expedited Courier Delivery
- **Citation ID:** `PC-CARD-001-v3.0-section-3`
- **Source Reference:** `demo://project-compass/PC-CARD-001/v3.0/section/3.0`
- **Applicable Roles:** Branch Banker, Contact Center Agent

Standard card replacement orders are dispatched via first-class postal mail within 3 to 5 business days in tamper-evident non-marked security envelopes. Expedited courier delivery (1-2 business days) is available upon customer request; a standard synthetic expedited delivery fee of $15.00 applies unless waived for premium tier clients or active fraud victims.




## 5. Exceptions
- Cards cannot be mailed to an address that was modified within the preceding 30 days without secondary branch supervisor authorization.
- Emergency international card replacement requires Mastercard/Visa Global Emergency Services coordination.

## 6. Approval Requirements & Thresholds
- Standard block & re-issue: Frontline Banker / Agent.
- Instant issuance machine blank card safe retrieval: Dual custody log sign-out by two branch staff members.
- Expedited fee waiver: Senior Branch Banker or Supervisor sign-off.

## 7. Escalation Rules
- If card theft involves fraudulent transactions >= $500, initiate a formal Regulation E synthetic fraud dispute case immediately.
- Escalate to Physical Security and Branch Operations if the instant issuance printer suffers inventory mismatch between physical card count and electronic audit logs.

## 8. Compliance & Governance Notes
- Demo governance guidance: Synthetic Regulation E limits consumer liability for unauthorized card transactions when reported promptly.
- Never write down, request, or store customer PIN codes in notes or system logs.
