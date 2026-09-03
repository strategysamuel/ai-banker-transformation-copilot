# Customer Address Change SOP
**Policy ID:** `PC-ADDRESS-001` | **Version:** `1.2` | **Status:** `ACTIVE`  
**Effective Date:** 2026-04-10 | **Next Review Date:** 2027-04-09  
**Policy Owner:** Client Data Governance & Fraud Prevention (Synthetic)  
**Applicable Roles:** Branch Banker, Contact Center Agent, Contact Center Supervisor, Operations Analyst  
**Applicable Region:** ALL-DEMO-REGIONS  
**Supersedes:** 1.1  
**Source URI:** `demo://project-compass/PC-ADDRESS-001/v1.2`  

---

> ⚠️ **DEMO NOTICE:** DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.

---

## 1. Purpose
Ensure all customer physical residential and mailing address updates are thoroughly verified against acceptable documentation and safeguarded against identity theft and account takeover vectors.

## 2. Scope
Mandatory for all customer-facing staff executing address changes across branch, call center, and back-office maintenance queues.

## 3. Definitions
- **Acceptable Proof of Address**: Unexpired state driver's license with new address, utility bill (water/gas/electric/cable), bank statement, or signed lease agreement dated within the last 90 calendar days.
- **Cooling Period**: Mandatory 30-day security hold on high-risk outbound card dispatch and digital limit increases following an address change.

## 4. Standard Procedures & Controls
### Section 1.0: In-Person Branch Address Modification
- **Citation ID:** `PC-ADDRESS-001-v1.2-section-1`
- **Source Reference:** `demo://project-compass/PC-ADDRESS-001/v1.2/section/1.0`
- **Applicable Roles:** Branch Banker

When a customer requests an address change in person at a branch, the banker must verify one (1) unexpired Primary Photo ID and inspect one (1) valid Acceptable Proof of Address document. The document must be scanned and attached to the customer master CIF within the core banking application.



### Section 2.0: Phone Channel and Remote Request Verification
- **Citation ID:** `PC-ADDRESS-001-v1.2-section-2`
- **Source Reference:** `demo://project-compass/PC-ADDRESS-001/v1.2/section/2.0`
- **Applicable Roles:** Contact Center Agent, Contact Center Supervisor

Address changes requested via phone must pass High-Assurance MFA authentication (push notification to registered mobile banking device or out-of-band one-time passcode). If MFA is unavailable, the caller must be directed to an in-person branch or secure digital banking portal. Third-party address changes requested on behalf of an individual are strictly prohibited unless presented by a registered, legally approved Attorney-in-Fact.



### Section 3.0: Post-Change Security Cooling Period & Notifications
- **Citation ID:** `PC-ADDRESS-001-v1.2-section-3`
- **Source Reference:** `demo://project-compass/PC-ADDRESS-001/v1.2/section/3.0`
- **Applicable Roles:** Branch Banker, Contact Center Agent, Operations Analyst

Upon completion of any address change, the core banking system automatically dispatches an instant alert notice to both the OLD email/SMS address and the NEW physical address. An automated 30-day Cooling Period is placed on expedited debit card re-issuance and wire limit upgrades unless overridden via in-branch biometric verification.




## 5. Exceptions
- Active-duty military personnel deployed overseas may provide official military deployment orders (APO/FPO/DPO address) without local utility bills.
- Corporate/Commercial business address changes require corporate resolution or Articles of Amendment signed by authorized company officers.

## 6. Approval Requirements & Thresholds
- In-person standard updates: Single Branch Banker entry.
- Remote phone updates with MFA: Contact Center Agent entry.
- Cooling period expedited override: Branch Manager or Fraud Risk Supervisor sign-off.

## 7. Escalation Rules
- If a customer reports receiving an unauthorized address change notification, the agent must immediately apply an administrative lock on all debit cards and digital banking channels and route the case to Fraud Investigations within 15 minutes.
- Multiple address changes within a 60-day window trigger an automated High-Risk Fraud Queue review.

## 8. Compliance & Governance Notes
- Demo governance guidance: Synthetic Red Flags Rule compliance requires prompt notification to prior address upon records update.
- PO Boxes are unacceptable as primary physical residential addresses; a physical street address is mandatory for all accounts.
