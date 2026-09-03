# Power of Attorney Handling SOP
**Policy ID:** `PC-POA-001` | **Version:** `2.0` | **Status:** `ACTIVE`  
**Effective Date:** 2026-03-01 | **Next Review Date:** 2027-02-28  
**Policy Owner:** Legal & Fiduciary Advisory Desk (Synthetic)  
**Applicable Roles:** Branch Banker, Senior Branch Banker, Operations Analyst, Compliance SME  
**Applicable Region:** ALL-DEMO-REGIONS  
**Supersedes:** 1.0  
**Source URI:** `demo://project-compass/PC-POA-001/v2.0`  

---

> ⚠️ **DEMO NOTICE:** DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.

---

## 1. Purpose
Ensure all Power of Attorney (POA), conservatorship, and guardianship documents presented by agents or attorneys-in-fact are legally verified, authenticated, and accurately configured in core banking records.

## 2. Scope
Applies to all retail branches, private wealth offices, and operations teams handling fiduciary document submissions.

## 3. Definitions
- **Principal**: The account owner granting legal authority to another person.
- **Agent / Attorney-in-Fact**: The designated individual authorized to act on behalf of the Principal.
- **Durable POA**: A power of attorney that remains in full legal effect even if the Principal becomes incapacitated.
- **DEMO_SLA_48H**: Synthetic 48-business-hour service level agreement for Central Legal Operations review.

## 4. Standard Procedures & Controls
### Section 1.0: Intake and Document Collection
- **Citation ID:** `PC-POA-001-v2.0-section-1`
- **Source Reference:** `demo://project-compass/PC-POA-001/v2.0/section/1.0`
- **Applicable Roles:** Branch Banker, Senior Branch Banker

Banker must obtain the original or certified true copy of the Power of Attorney document bearing valid notary seal and signatures. Banker must obtain unexpired government photo ID and SSN/Tax ID of the designated Agent. The Agent must complete and sign the Bank's synthetic Affidavit of Agent in the presence of the banker.



### Section 2.0: Legal Validation Routing & Turnaround
- **Citation ID:** `PC-POA-001-v2.0-section-2`
- **Source Reference:** `demo://project-compass/PC-POA-001/v2.0/section/2.0`
- **Applicable Roles:** Branch Banker, Operations Analyst, Compliance SME

The branch must scan the entire document package into the Legal Workflow Portal within two (2) hours of receipt. Central Legal Operations will review the document scope (specific vs general, durable vs springing, banking powers grant) within DEMO_SLA_48H. Frontline staff must NOT activate transactional privileges until legal approval status reflects 'APPROVED' in the portal.



### Section 3.0: System Profile Tagging and Restrictions
- **Citation ID:** `PC-POA-001-v2.0-section-3`
- **Source Reference:** `demo://project-compass/PC-POA-001/v2.0/section/3.0`
- **Applicable Roles:** Branch Banker, Operations Analyst

Upon legal clearance, the banker establishes an Authorized Signer / Agent profile linked to the Principal's account with title 'Attorney-in-Fact'. Agents may NOT add themselves as joint owners, change beneficiary designations (TOD/POD), or open new borrowing lines unless explicitly permitted in express statutory powers granted in the underlying POA instrument.




## 5. Exceptions
- Springing POA instruments require accompanying medical certification of incapacity from a licensed medical practitioner prior to legal routing.
- Court-appointed guardianship/conservatorship orders issued by a probate court within the last 60 days supersede private POA documents.

## 6. Approval Requirements & Thresholds
- Frontline intake: Branch Banker.
- Document validity and authority scope approval: Central Legal Operations Specialist.
- Transactional activation: Senior Branch Banker secondary verification.

## 7. Escalation Rules
- Escalate immediately to Adult Protective Services Risk Liaison if signs of financial elder exploitation, coercion, or suspicious sudden revocation occur.
- Escalate to Senior Legal Counsel if multiple conflicting POA instruments are presented by competing family members.

## 8. Compliance & Governance Notes
- Demo governance guidance: Fiduciary documents must be reviewed for durability and specific banking authority.
- Never allow an Agent to execute self-dealing transactions or transfer principal funds into the Agent's personal individual account without clear documentary authority.
