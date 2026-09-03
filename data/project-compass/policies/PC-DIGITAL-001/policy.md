# Digital Banking Enrollment SOP
**Policy ID:** `PC-DIGITAL-001` | **Version:** `1.4` | **Status:** `ACTIVE`  
**Effective Date:** 2026-06-01 | **Next Review Date:** 2027-05-31  
**Policy Owner:** Digital Channels & Security Architecture (Synthetic)  
**Applicable Roles:** Branch Banker, Contact Center Agent, Contact Center Supervisor, Operations Analyst  
**Applicable Region:** ALL-DEMO-REGIONS  
**Supersedes:** 1.3  
**Source URI:** `demo://project-compass/PC-DIGITAL-001/v1.4`  

---

> ⚠️ **DEMO NOTICE:** DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.

---

## 1. Purpose
Establish secure enrollment, credential management, cryptographic device binding, biometric authentication, and lock-out recovery workflows for online and mobile banking platforms.

## 2. Scope
Mandatory for all frontline retail bankers, virtual customer service agents, digital fraud analysts, and helpdesk specialists.

## 3. Definitions
- **Trusted Device Binding**: Cryptographic pairing of the customer's mobile device hardware key with their digital banking profile.
- **Step-Up Authentication**: Secondary MFA challenge required when initiating high-risk actions (e.g. adding new payees, wire requests, profile changes).
- **Cooling Window**: 24-hour settlement hold on new external transfer payees added immediately following a credential reset.

## 4. Standard Procedures & Controls
### Section 1.0: Self-Service Digital Onboarding and Identity Proofing
- **Citation ID:** `PC-DIGITAL-001-v1.4-section-1`
- **Source Reference:** `demo://project-compass/PC-DIGITAL-001/v1.4/section/1.0`
- **Applicable Roles:** Branch Banker, Contact Center Agent

Customers enrolling in digital banking must complete digital identity proofing by supplying their SSN/Tax ID, debit card PIN verification, and receiving a secure push or voice token to their registered phone number (which must be established on file >= 30 days). The customer creates an 8+ character complex passphrase and binds their primary mobile device via biometric Passkey / Secure Enclave.



### Section 2.0: In-Branch Assisted Registration Protocol
- **Citation ID:** `PC-DIGITAL-001-v1.4-section-2`
- **Source Reference:** `demo://project-compass/PC-DIGITAL-001/v1.4/section/2.0`
- **Applicable Roles:** Branch Banker, Senior Branch Banker

When assisting a customer with digital banking in a branch, the banker must verify an unexpired primary photo ID before generating a single-use temporary Activation QR Code. Bankers must NEVER request, observe, or type the customer's chosen permanent password or biometric setup. The customer must scan the QR code directly using the official Bank Mobile App.



### Section 3.0: Account Lockout, Credential Reset, and Fraud Controls
- **Citation ID:** `PC-DIGITAL-001-v1.4-section-3`
- **Source Reference:** `demo://project-compass/PC-DIGITAL-001/v1.4/section/3.0`
- **Applicable Roles:** Contact Center Agent, Contact Center Supervisor, Operations Analyst

Accounts are automatically locked after five (5) consecutive invalid login attempts. To reset credentials remotely, the customer must pass high-assurance MFA. Following any remote password or phone number change, an automated 24-hour Cooling Window is placed on new payee additions and Zelle/P2P transaction limits to prevent account takeover fund draining.




## 5. Exceptions
- Commercial entity digital banking requires dual-administrator authorization and physical hardware token provisioning.
- Customers with accessibility impairments may request guided phone voice biometrics enrollment.

## 6. Approval Requirements & Thresholds
- Self-service onboarding: Automated risk engine approval.
- In-branch assisted activation: Single Branch Banker after primary ID verification.
- High-risk manual account unlock override: Contact Center Supervisor sign-off.

## 7. Escalation Rules
- Escalate to Digital Fraud Unit if a customer reports sudden SIM-swap or unexpected lock-out while abroad.
- Escalate to Security Operations Center (SOC) if bulk credential stuffing attacks are detected against customer login endpoints.

## 8. Compliance & Governance Notes
- Demo governance guidance: Synthetic FFIEC digital banking guidance mandates risk-based multi-factor authentication and layered fraud defenses.
- Employees must never ask for customer passwords, OTP codes, or PIN numbers over the phone or in person.
