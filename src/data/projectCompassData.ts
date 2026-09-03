import { SOPCatalog, SOPDocument } from '../types/projectCompass';

export const SYNTHETIC_SOP_CATALOG: SOPCatalog = {
  repositoryName: "Project Compass Synthetic SOP Repository",
  version: "1.0.0",
  lastUpdated: "2026-09-01",
  repositoryNotice: "DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.",
  totalPolicies: 10,
  totalActivePolicies: 10,
  totalVersions: 13,
  policies: [
    {
      policyId: "PC-ACCOUNT-001",
      title: "Deposit Account Opening SOP",
      currentVersion: "1.0",
      status: "ACTIVE",
      effectiveDate: "2026-01-15",
      nextReviewDate: "2027-01-14",
      policyOwner: "Retail Banking Operations Committee (Synthetic)",
      applicableRoles: ["Branch Banker", "Senior Branch Banker", "Contact Center Agent"],
      applicableRegion: "ALL-DEMO-REGIONS",
      summary: "Standard operating procedure for verifying customer identity, collecting KYC documentation, and opening retail checking and savings accounts.",
      totalVersions: 1,
      availableVersions: ["1.0"],
      demoData: true
    },
    {
      policyId: "PC-WIRE-001",
      title: "International Wire Transfer SOP",
      currentVersion: "4.2",
      status: "ACTIVE",
      effectiveDate: "2026-08-01",
      nextReviewDate: "2027-07-31",
      policyOwner: "Global Payments & Wire Operations (Synthetic)",
      applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst", "Compliance SME"],
      applicableRegion: "ALL-DEMO-REGIONS",
      summary: "End-to-end procedure for initiating, screening, dual-authorizing, and executing international outward and inward wire transfers.",
      totalVersions: 2,
      availableVersions: ["4.1", "4.2"],
      demoData: true
    },
    {
      policyId: "PC-POA-001",
      title: "Power of Attorney Handling SOP",
      currentVersion: "2.0",
      status: "ACTIVE",
      effectiveDate: "2026-03-01",
      nextReviewDate: "2027-02-28",
      policyOwner: "Legal & Fiduciary Advisory Desk (Synthetic)",
      applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst", "Compliance SME"],
      applicableRegion: "ALL-DEMO-REGIONS",
      summary: "Procedures for receiving, logging, validating, and recording Power of Attorney and court-appointed legal guardianship appointments.",
      totalVersions: 1,
      availableVersions: ["2.0"],
      demoData: true
    },
    {
      policyId: "PC-FEE-001",
      title: "Fee Waiver Approval SOP",
      currentVersion: "2.1",
      status: "ACTIVE",
      effectiveDate: "2026-07-01",
      nextReviewDate: "2027-06-30",
      policyOwner: "Customer Care & Branch Governance (Synthetic)",
      applicableRoles: ["Branch Banker", "Senior Branch Banker", "Contact Center Agent", "Contact Center Supervisor"],
      applicableRegion: "ALL-DEMO-REGIONS",
      summary: "Tiered discretionary authority guidelines, mandatory reason code tagging, and supervisor approval matrices for retail fee adjustments.",
      totalVersions: 2,
      availableVersions: ["2.0", "2.1"],
      demoData: true
    },
    {
      policyId: "PC-ADDRESS-001",
      title: "Customer Address Change SOP",
      currentVersion: "1.2",
      status: "ACTIVE",
      effectiveDate: "2026-04-10",
      nextReviewDate: "2027-04-09",
      policyOwner: "Client Data Governance & Fraud Prevention (Synthetic)",
      applicableRoles: ["Branch Banker", "Contact Center Agent", "Contact Center Supervisor", "Operations Analyst"],
      applicableRegion: "ALL-DEMO-REGIONS",
      summary: "Standard verification requirements, document acceptability, and mandatory fraud prevention cooling periods for customer address modifications.",
      totalVersions: 1,
      availableVersions: ["1.2"],
      demoData: true
    },
    {
      policyId: "PC-CARD-001",
      title: "Debit Card Replacement SOP",
      currentVersion: "3.0",
      status: "ACTIVE",
      effectiveDate: "2026-05-15",
      nextReviewDate: "2027-05-14",
      policyOwner: "Card Services & Branch Operations (Synthetic)",
      applicableRoles: ["Branch Banker", "Senior Branch Banker", "Contact Center Agent"],
      applicableRegion: "ALL-DEMO-REGIONS",
      summary: "Procedures for reporting lost, stolen, or compromised debit cards, instant in-branch card issuance, and standard secure delivery dispatch.",
      totalVersions: 1,
      availableVersions: ["3.0"],
      demoData: true
    },
    {
      policyId: "PC-DORMANT-001",
      title: "Dormant Account Reactivation SOP",
      currentVersion: "1.5",
      status: "ACTIVE",
      effectiveDate: "2026-02-20",
      nextReviewDate: "2027-02-19",
      policyOwner: "Deposit Operations & Unclaimed Property Desk (Synthetic)",
      applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst", "Compliance SME"],
      applicableRegion: "ALL-DEMO-REGIONS",
      summary: "Standard workflow for identifying dormant deposit accounts, customer outreach, in-person identity verification, and multi-sign-off reactivation.",
      totalVersions: 1,
      availableVersions: ["1.5"],
      demoData: true
    },
    {
      policyId: "PC-JOINT-001",
      title: "Joint Account Ownership SOP",
      currentVersion: "2.2",
      status: "ACTIVE",
      effectiveDate: "2026-06-15",
      nextReviewDate: "2027-06-14",
      policyOwner: "Retail Deposit Product Management (Synthetic)",
      applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst"],
      applicableRegion: "ALL-DEMO-REGIONS",
      summary: "Operating rules for joint tenancy with rights of survivorship, tenancy in common, signature mandates, adding/removing owners, and dispute handling.",
      totalVersions: 1,
      availableVersions: ["2.2"],
      demoData: true
    },
    {
      policyId: "PC-COMPLAINT-001",
      title: "Customer Complaint Escalation SOP",
      currentVersion: "3.1",
      status: "ACTIVE",
      effectiveDate: "2026-05-01",
      nextReviewDate: "2027-04-30",
      policyOwner: "Customer Experience & Regulatory Relations (Synthetic)",
      applicableRoles: ["Branch Banker", "Contact Center Agent", "Contact Center Supervisor", "Operations Analyst", "Compliance SME"],
      applicableRegion: "ALL-DEMO-REGIONS",
      summary: "Three-tiered escalation matrix, strict SLA resolution windows, mandatory root-cause tracking, and regulatory complaint reporting workflows.",
      totalVersions: 1,
      availableVersions: ["3.1"],
      demoData: true
    },
    {
      policyId: "PC-DIGITAL-001",
      title: "Digital Banking Enrollment SOP",
      currentVersion: "1.4",
      status: "ACTIVE",
      effectiveDate: "2026-06-01",
      nextReviewDate: "2027-05-31",
      policyOwner: "Digital Channels & Security Architecture (Synthetic)",
      applicableRoles: ["Branch Banker", "Contact Center Agent", "Contact Center Supervisor", "Operations Analyst"],
      applicableRegion: "ALL-DEMO-REGIONS",
      summary: "Procedures for onboarding customers to online and mobile banking, mandatory multi-factor authentication, trusted device binding, and lock-out recovery.",
      totalVersions: 2,
      availableVersions: ["1.3", "1.4"],
      demoData: true
    }
  ]
};

export const ALL_SYNTHETIC_SOPS: SOPDocument[] = [
  // 1. PC-ACCOUNT-001 (v1.0 ACTIVE)
  {
    policyId: "PC-ACCOUNT-001",
    title: "Deposit Account Opening SOP",
    version: "1.0",
    status: "ACTIVE",
    effectiveDate: "2026-01-15",
    nextReviewDate: "2027-01-14",
    policyOwner: "Retail Banking Operations Committee (Synthetic)",
    applicableRoles: ["Branch Banker", "Senior Branch Banker", "Contact Center Agent"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-ACCOUNT-001/v1.0",
    supersedes: null,
    demoData: true,
    summary: "Standard operating procedure for verifying customer identity, collecting KYC documentation, and opening retail checking and savings accounts.",
    purpose: "Establish clear, standardized steps for frontline retail bankers to verify customer identities, fulfill synthetic Customer Due Diligence (CDD) requirements, and open retail deposit accounts.",
    scope: "Applies to all retail branch personnel, virtual relationship bankers, and central deposit operations specialists opening personal checking, savings, or money market accounts.",
    definitions: [
      { term: "Primary ID", definition: "Unexpired government-issued photo identification including passport, state driver's license, or national identity card." },
      { term: "Secondary ID", definition: "Valid secondary proof such as major credit card, employee photo ID, or utility bill issued within the last 90 days." },
      { term: "DEMO_MIN_OPENING_DEPOSIT", definition: "Synthetic minimum opening deposit benchmark of $25.00 for basic consumer checking accounts." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Customer Identification and Due Diligence",
        citationId: "PC-ACCOUNT-001-v1.0-section-1",
        sourceUri: "demo://project-compass/PC-ACCOUNT-001/v1.0/section/1.0",
        content: "Bankers must obtain and physically inspect one (1) unexpired Primary ID and one (1) Secondary ID. The customer's legal name, date of birth, residential address, and taxpayer identification number must be recorded into the core deposit workstation. If the customer is a non-resident alien, an unexpired foreign passport with valid consular visa documentation is mandatory.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker"],
        governanceGuidance: "Demo governance guidance: Meets synthetic KYC/CDD baseline requirements."
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "Initial Deposit and Funding Verification",
        citationId: "PC-ACCOUNT-001-v1.0-section-2",
        sourceUri: "demo://project-compass/PC-ACCOUNT-001/v1.0/section/2.0",
        content: "The customer must tender the minimum initial deposit equal to or exceeding DEMO_MIN_OPENING_DEPOSIT. Initial funding may be executed via cash, internal ledger transfer from an existing verified account, or teller cashier's check. Personal third-party checks deposited at account opening are subject to a mandatory 5-business-day new account settlement hold.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker"]
      },
      {
        id: "section-3",
        sectionNumber: "3.0",
        title: "Document Archival and Customer Welcome Disclosure",
        citationId: "PC-ACCOUNT-001-v1.0-section-3",
        sourceUri: "demo://project-compass/PC-ACCOUNT-001/v1.0/section/3.0",
        content: "All scanned identity records, the signed electronic Deposit Account Agreement, and Fee Schedules must be archived in the Document Archival Vault within 24 hours of account creation. The banker must provide the customer with a physical or secure electronic welcome packet containing account routing details and the synthetic Truth in Savings disclosure.",
        applicableRoles: ["Branch Banker", "Contact Center Agent"]
      }
    ],
    exceptions: [
      "Customers lacking a primary photo ID due to age (minors under 16) may open a custodial UTMA/UGMA account utilizing a certified birth certificate accompanied by the parent/guardian's primary photo identification.",
      "Temporary residential addresses (hotels, PO Boxes) are strictly prohibited as primary addresses; accounts may only list a PO Box as an optional secondary mailing address."
    ],
    approvalRequirements: [
      "Standard account openings require single-operator banker submission.",
      "Accounts opened for non-resident clients or entities with foreign beneficial ownership require Senior Branch Banker or Compliance SME review prior to debit card provisioning."
    ],
    escalationRules: [
      "Escalate to Fraud Prevention Operations if automated OFAC/Sanction screening returns a potential match score >= 85%.",
      "Escalate to Branch Operations Manager if customer refuses to provide residential physical address proof."
    ],
    complianceNotes: [
      "Demo governance guidance: Customer identity records must be retained in accordance with synthetic 7-year record retention mandates.",
      "Do not advise customers on tax withholding implications; provide standard synthetic IRS Form W-9 / W-8BEN guidance only."
    ]
  },

  // 2A. PC-WIRE-001 (v4.1 SUPERSEDED)
  {
    policyId: "PC-WIRE-001",
    title: "International Wire Transfer SOP",
    version: "4.1",
    status: "SUPERSEDED",
    effectiveDate: "2025-01-10",
    nextReviewDate: "2026-07-31",
    policyOwner: "Global Payments & Wire Operations (Synthetic)",
    applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-WIRE-001/v4.1",
    supersedes: "4.0",
    demoData: true,
    summary: "[SUPERSEDED] Historical wire procedure requiring supervisor approval at the legacy threshold of DEMO_LIMIT_A ($5,000).",
    purpose: "Provide procedural guidelines for executing outbound international telegraphic transfers (SWIFT/Wires) under the legacy 2025 risk framework.",
    scope: "Applies to all retail and commercial branch staff processing customer-initiated cross-border funds transfers.",
    definitions: [
      { term: "DEMO_LIMIT_A", definition: "Historical synthetic threshold of $5,000.00 USD equivalent requiring branch manager verbal callback." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Wire Order Capture (Legacy Protocol)",
        citationId: "PC-WIRE-001-v4.1-section-1",
        sourceUri: "demo://project-compass/PC-WIRE-001/v4.1/section/1.0",
        content: "Banker captures beneficiary SWIFT BIC, IBAN, beneficiary name, physical address, and remittance purpose. Banker verifies physical signature against signature card.",
        applicableRoles: ["Branch Banker"]
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "Authorization Thresholds (Legacy Protocol)",
        citationId: "PC-WIRE-001-v4.1-section-2",
        sourceUri: "demo://project-compass/PC-WIRE-001/v4.1/section/2.0",
        content: "Supervisor approval and verbal callback verification are required for all transactions exceeding DEMO_LIMIT_A ($5,000 USD equivalent). Transactions below DEMO_LIMIT_A may be released with standard branch banker single authorization.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker"]
      }
    ],
    exceptions: ["Governmental remittance exceptions allowed with senior operations sign-off."],
    approvalRequirements: ["Supervisor review required above DEMO_LIMIT_A ($5,000 USD)."],
    escalationRules: ["Escalate to Wire Operations Desk if intermediary bank routing is missing."],
    complianceNotes: ["Demo governance guidance: SUPERSEDED ON 2026-08-01 BY VERSION 4.2."]
  },

  // 2B. PC-WIRE-001 (v4.2 ACTIVE)
  {
    policyId: "PC-WIRE-001",
    title: "International Wire Transfer SOP",
    version: "4.2",
    status: "ACTIVE",
    effectiveDate: "2026-08-01",
    nextReviewDate: "2027-07-31",
    policyOwner: "Global Payments & Wire Operations (Synthetic)",
    applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst", "Compliance SME"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-WIRE-001/v4.2",
    supersedes: "4.1",
    demoData: true,
    summary: "[ACTIVE] End-to-end procedure for initiating, screening, dual-authorizing, and executing international outward and inward wire transfers under the modernized risk matrix.",
    purpose: "Define operational, screening, and dual-control mandates for international wire transfers, ensuring adherence to synthetic payment sanctions, currency exchange disclosure rules, and fraud prevention controls.",
    scope: "Mandatory for all frontline branch bankers, premier banking advisors, call center wire desks, and back-office wire operations analysts.",
    definitions: [
      { term: "SWIFT BIC", definition: "Bank Identifier Code (8 or 11 alphanumeric characters) uniquely designating financial institutions in cross-border settlements." },
      { term: "IBAN", definition: "International Bank Account Number containing country code, check digits, and destination account identifier." },
      { term: "DEMO_LIMIT_B", definition: "Current synthetic threshold of $10,000.00 USD equivalent requiring dual-authorization supervisor sign-off and verbal out-of-band callback verification." },
      { term: "Out-of-Band Callback", definition: "Direct voice call placed to customer's telephone number on file for >= 30 days prior to wire release." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Beneficiary and Payment Data Collection",
        citationId: "PC-WIRE-001-v4.2-section-1",
        sourceUri: "demo://project-compass/PC-WIRE-001/v4.2/section/1.0",
        content: "Banker must collect full legal beneficiary name, full street address (no PO boxes), beneficiary bank SWIFT BIC, destination IBAN/Account number, and specific economic purpose of payment. Generic descriptions such as 'goods', 'services', or 'family support' must be rejected; specific descriptions such as 'University Tuition Fall 2026' or 'Commercial Invoice #88412' are required.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker"],
        governanceGuidance: "Demo governance guidance: Essential for synthetic FATF Travel Rule compliance."
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "Sanctions Screening and FX Pre-Disclosures",
        citationId: "PC-WIRE-001-v4.2-section-2",
        sourceUri: "demo://project-compass/PC-WIRE-001/v4.2/section/2.0",
        content: "Prior to order submission, the system automatically checks beneficiary, originator, and intermediary banks against synthetic Sanctions Lists. The banker must generate and provide the Remittance Transfer Pre-Payment Disclosure detailing exchange rate, transfer fees, foreign taxes, and exact estimated delivery date.",
        applicableRoles: ["Branch Banker", "Operations Analyst"]
      },
      {
        id: "section-3",
        sectionNumber: "3.0",
        title: "Dual Authorization & Callback Thresholds",
        citationId: "PC-WIRE-001-v4.2-section-3",
        sourceUri: "demo://project-compass/PC-WIRE-001/v4.2/section/3.0",
        content: "Standard wires up to DEMO_LIMIT_B ($10,000 USD equivalent) initiated in-person require primary ID verification and single banker release. Any wire exceeding DEMO_LIMIT_B ($10,000 USD equivalent) or any non-in-person wire regardless of amount mandates dual authorization (Maker-Checker): (1) Banker input, (2) Branch Supervisor secondary electronic authorization following a recorded Out-of-Band Callback to the customer's established primary phone number.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst"],
        governanceGuidance: "Demo governance guidance: Strict fraud mitigation standard. Never bypass callback requirements."
      },
      {
        id: "section-4",
        sectionNumber: "4.0",
        title: "Cancellation and 30-Minute Rescission Rights",
        citationId: "PC-WIRE-001-v4.2-section-4",
        sourceUri: "demo://project-compass/PC-WIRE-001/v4.2/section/4.2",
        content: "Consumer remitters retain the right to cancel an international consumer wire transfer within 30 minutes of order confirmation without penalty, provided the funds have not yet been picked up or credited by the foreign beneficiary institution. Bankers must execute immediate recall in the wire terminal upon verbal or written customer request within this window.",
        applicableRoles: ["Branch Banker", "Contact Center Agent", "Operations Analyst"]
      }
    ],
    exceptions: [
      "Recurring pre-authorized corporate treasury wires with active master service agreements are exempt from manual per-transaction verbal callback.",
      "Wires to designated high-risk jurisdictions require mandatory Compliance SME pre-clearance regardless of transaction amount."
    ],
    approvalRequirements: [
      "Amounts <= DEMO_LIMIT_B ($10,000 USD): Branch Banker release.",
      "Amounts > DEMO_LIMIT_B ($10,000 USD): Branch Banker creation + Supervisor dual authorization + Out-of-Band Callback.",
      "Amounts > $100,000 USD equivalent: Branch Manager + Central Payments Desk dual sign-off."
    ],
    escalationRules: [
      "Any sanction screening hit with score >= 80% must be escalated immediately to Sanctions Compliance Desk.",
      "Any callback where phone number was modified within the preceding 30 days requires mandatory in-person branch appearance or video notarized verification."
    ],
    complianceNotes: [
      "Demo governance guidance: Synthetic remittance transfer regulations grant a 30-minute consumer cancellation window.",
      "Never execute wire transfers based on unverified email requests or urgent caller instructions without strict callback validation."
    ]
  },

  // 3. PC-POA-001 (v2.0 ACTIVE)
  {
    policyId: "PC-POA-001",
    title: "Power of Attorney Handling SOP",
    version: "2.0",
    status: "ACTIVE",
    effectiveDate: "2026-03-01",
    nextReviewDate: "2027-02-28",
    policyOwner: "Legal & Fiduciary Advisory Desk (Synthetic)",
    applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst", "Compliance SME"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-POA-001/v2.0",
    supersedes: "1.0",
    demoData: true,
    summary: "Procedures for receiving, logging, validating, and recording Power of Attorney and court-appointed legal guardianship appointments.",
    purpose: "Ensure all Power of Attorney (POA), conservatorship, and guardianship documents presented by agents or attorneys-in-fact are legally verified, authenticated, and accurately configured in core banking records.",
    scope: "Applies to all retail branches, private wealth offices, and operations teams handling fiduciary document submissions.",
    definitions: [
      { term: "Principal", definition: "The account owner granting legal authority to another person." },
      { term: "Agent / Attorney-in-Fact", definition: "The designated individual authorized to act on behalf of the Principal." },
      { term: "Durable POA", definition: "A power of attorney that remains in full legal effect even if the Principal becomes incapacitated." },
      { term: "DEMO_SLA_48H", definition: "Synthetic 48-business-hour service level agreement for Central Legal Operations review." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Intake and Document Collection",
        citationId: "PC-POA-001-v2.0-section-1",
        sourceUri: "demo://project-compass/PC-POA-001/v2.0/section/1.0",
        content: "Banker must obtain the original or certified true copy of the Power of Attorney document bearing valid notary seal and signatures. Banker must obtain unexpired government photo ID and SSN/Tax ID of the designated Agent. The Agent must complete and sign the Bank's synthetic Affidavit of Agent in the presence of the banker.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker"]
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "Legal Validation Routing & Turnaround",
        citationId: "PC-POA-001-v2.0-section-2",
        sourceUri: "demo://project-compass/PC-POA-001/v2.0/section/2.0",
        content: "The branch must scan the entire document package into the Legal Workflow Portal within two (2) hours of receipt. Central Legal Operations will review the document scope (specific vs general, durable vs springing, banking powers grant) within DEMO_SLA_48H. Frontline staff must NOT activate transactional privileges until legal approval status reflects 'APPROVED' in the portal.",
        applicableRoles: ["Branch Banker", "Operations Analyst", "Compliance SME"]
      },
      {
        id: "section-3",
        sectionNumber: "3.0",
        title: "System Profile Tagging and Restrictions",
        citationId: "PC-POA-001-v2.0-section-3",
        sourceUri: "demo://project-compass/PC-POA-001/v2.0/section/3.0",
        content: "Upon legal clearance, the banker establishes an Authorized Signer / Agent profile linked to the Principal's account with title 'Attorney-in-Fact'. Agents may NOT add themselves as joint owners, change beneficiary designations (TOD/POD), or open new borrowing lines unless explicitly permitted in express statutory powers granted in the underlying POA instrument.",
        applicableRoles: ["Branch Banker", "Operations Analyst"]
      }
    ],
    exceptions: [
      "Springing POA instruments require accompanying medical certification of incapacity from a licensed medical practitioner prior to legal routing.",
      "Court-appointed guardianship/conservatorship orders issued by a probate court within the last 60 days supersede private POA documents."
    ],
    approvalRequirements: [
      "Frontline intake: Branch Banker.",
      "Document validity and authority scope approval: Central Legal Operations Specialist.",
      "Transactional activation: Senior Branch Banker secondary verification."
    ],
    escalationRules: [
      "Escalate immediately to Adult Protective Services Risk Liaison if signs of financial elder exploitation, coercion, or suspicious sudden revocation occur.",
      "Escalate to Senior Legal Counsel if multiple conflicting POA instruments are presented by competing family members."
    ],
    complianceNotes: [
      "Demo governance guidance: Fiduciary documents must be reviewed for durability and specific banking authority.",
      "Never allow an Agent to execute self-dealing transactions or transfer principal funds into the Agent's personal individual account without clear documentary authority."
    ]
  },

  // 4A. PC-FEE-001 (v2.0 SUPERSEDED)
  {
    policyId: "PC-FEE-001",
    title: "Fee Waiver Approval SOP",
    version: "2.0",
    status: "SUPERSEDED",
    effectiveDate: "2025-06-01",
    nextReviewDate: "2026-06-30",
    policyOwner: "Customer Care & Branch Governance (Synthetic)",
    applicableRoles: ["Branch Banker", "Contact Center Agent"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-FEE-001/v2.0",
    supersedes: "1.0",
    demoData: true,
    summary: "[SUPERSEDED] Legacy fee waiver guidelines allowing autonomous frontline reversals without mandatory reason categorization.",
    purpose: "Provide fee reversal guidance for customer service staff under the 2025 retail fee framework.",
    scope: "Branch bankers and phone customer care agents.",
    definitions: [
      { term: "DEMO_FEE_TIER_1", definition: "Historical synthetic discretionary limit of $50 per customer per 12-month period." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Autonomous Discretionary Waivers (Legacy Protocol)",
        citationId: "PC-FEE-001-v2.0-section-1",
        sourceUri: "demo://project-compass/PC-FEE-001/v2.0/section/1.0",
        content: "Bankers may reverse monthly service fees or overdraft fees up to $50 without manager sign-off or logging explanatory reason codes.",
        applicableRoles: ["Branch Banker", "Contact Center Agent"]
      }
    ],
    exceptions: ["None recorded in legacy version."],
    approvalRequirements: ["Single banker waiver under $50."],
    escalationRules: ["Escalate to Branch Manager above $50."],
    complianceNotes: ["Demo governance guidance: SUPERSEDED ON 2026-07-01 BY VERSION 2.1."]
  },

  // 4B. PC-FEE-001 (v2.1 ACTIVE)
  {
    policyId: "PC-FEE-001",
    title: "Fee Waiver Approval SOP",
    version: "2.1",
    status: "ACTIVE",
    effectiveDate: "2026-07-01",
    nextReviewDate: "2027-06-30",
    policyOwner: "Customer Care & Branch Governance (Synthetic)",
    applicableRoles: ["Branch Banker", "Senior Branch Banker", "Contact Center Agent", "Contact Center Supervisor"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-FEE-001/v2.1",
    supersedes: "2.0",
    demoData: true,
    summary: "[ACTIVE] Tiered discretionary authority guidelines, mandatory reason code tagging, and supervisor approval matrices for retail fee adjustments.",
    purpose: "Establish clear limits, mandatory reason logging, and supervisory escalation matrices for retail deposit account fee waivers, reversals, and courtesy credits.",
    scope: "Applies to all retail branch bankers, contact center specialists, assistant branch managers, and customer experience operations teams.",
    definitions: [
      { term: "DEMO_FEE_TIER_1", definition: "Current synthetic frontline banker discretionary ceiling of $50.00 cumulative per customer per rolling 12 months." },
      { term: "DEMO_FEE_TIER_2", definition: "Current synthetic supervisory discretionary ceiling of $150.00 cumulative per customer per rolling 12 months." },
      { term: "Bank Error Reversal", definition: "Direct fee reversal resulting from verified system malfunction, delayed processing, or staff administrative error." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Discretionary Tiers and Authority Matrix",
        citationId: "PC-FEE-001-v2.1-section-1",
        sourceUri: "demo://project-compass/PC-FEE-001/v2.1/section/1.0",
        content: "Frontline Branch Bankers and Contact Center Agents possess discretionary authority to waive eligible retail fees up to DEMO_FEE_TIER_1 ($50.00), capped at a maximum of two (2) occurrences per rolling 12-month period. Senior Branch Bankers and Contact Center Supervisors may authorize waivers up to DEMO_FEE_TIER_2 ($150.00). Waivers exceeding DEMO_FEE_TIER_2 require Branch Manager or Operations Director electronic sign-off.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker", "Contact Center Agent", "Contact Center Supervisor"]
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "Mandatory Reason Code Categorization",
        citationId: "PC-FEE-001-v2.1-section-2",
        sourceUri: "demo://project-compass/PC-FEE-001/v2.1/section/2.0",
        content: "Every fee waiver request submitted in the terminal must be categorized under one of the mandatory standard reason codes: (A) BANK-ERR: Verified operational/system error; (B) COURTESY-FIRST: First-time overdraft/courtesy concession; (C) MILITARY/STUDENT: Certified demographic fee exemption; (D) PRODUCT-TRANSITION: Account conversion grace period. Free-form waivers without selecting a valid reason code are blocked by the system.",
        applicableRoles: ["Branch Banker", "Contact Center Agent"]
      },
      {
        id: "section-3",
        sectionNumber: "3.0",
        title: "Non-Waivable Fees and Prohibited Adjustments",
        citationId: "PC-FEE-001-v2.1-section-3",
        sourceUri: "demo://project-compass/PC-FEE-001/v2.1/section/3.0",
        content: "The following fees cannot be waived under frontline discretionary authority: (1) Outgoing International Wire SWIFT transmission fees; (2) Legal process levy/garnishment processing fees; (3) Third-party foreign ATM surcharge pass-through charges. Such fees may only be credited if verified as a direct Bank Error with Operations Director approval.",
        applicableRoles: ["Branch Banker", "Contact Center Agent", "Contact Center Supervisor"]
      }
    ],
    exceptions: [
      "Verified Bank Error reversals do not count against the customer's annual discretionary courtesy waiver allotment.",
      "Natural disaster relief programs declared by executive management provide automated fee suppressions outside standard branch limits."
    ],
    approvalRequirements: [
      "Waivers <= $50.00: Branch Banker / Agent single entry.",
      "Waivers $50.01 - $150.00: Senior Branch Banker / Supervisor approval.",
      "Waivers > $150.00: Branch Manager / Retail Operations Director approval."
    ],
    escalationRules: [
      "Customers demanding excessive fee waivers (> $300 cumulative) must be referred to the Customer Relationship Retention Team.",
      "Repeated overdraft fee waiver requests (> 4 in 6 months) require an account review meeting to evaluate enrollment in Overdraft Protection or transition to a zero-overdraft checking product."
    ],
    complianceNotes: [
      "Demo governance guidance: Fair Lending and synthetic regulatory guidance require consistent, non-discriminatory application of fee waiver matrices across all customer demographics.",
      "Audit logs must record employee ID, timestamp, customer ID, reason code, and dollar adjustment for all fee adjustments."
    ]
  },

  // 5. PC-ADDRESS-001 (v1.2 ACTIVE)
  {
    policyId: "PC-ADDRESS-001",
    title: "Customer Address Change SOP",
    version: "1.2",
    status: "ACTIVE",
    effectiveDate: "2026-04-10",
    nextReviewDate: "2027-04-09",
    policyOwner: "Client Data Governance & Fraud Prevention (Synthetic)",
    applicableRoles: ["Branch Banker", "Contact Center Agent", "Contact Center Supervisor", "Operations Analyst"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-ADDRESS-001/v1.2",
    supersedes: "1.1",
    demoData: true,
    summary: "Standard verification requirements, document acceptability, and mandatory fraud prevention cooling periods for customer address modifications.",
    purpose: "Ensure all customer physical residential and mailing address updates are thoroughly verified against acceptable documentation and safeguarded against identity theft and account takeover vectors.",
    scope: "Mandatory for all customer-facing staff executing address changes across branch, call center, and back-office maintenance queues.",
    definitions: [
      { term: "Acceptable Proof of Address", definition: "Unexpired state driver's license with new address, utility bill (water/gas/electric/cable), bank statement, or signed lease agreement dated within the last 90 calendar days." },
      { term: "Cooling Period", definition: "Mandatory 30-day security hold on high-risk outbound card dispatch and digital limit increases following an address change." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "In-Person Branch Address Modification",
        citationId: "PC-ADDRESS-001-v1.2-section-1",
        sourceUri: "demo://project-compass/PC-ADDRESS-001/v1.2/section/1.0",
        content: "When a customer requests an address change in person at a branch, the banker must verify one (1) unexpired Primary Photo ID and inspect one (1) valid Acceptable Proof of Address document. The document must be scanned and attached to the customer master CIF within the core banking application.",
        applicableRoles: ["Branch Banker"]
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "Phone Channel and Remote Request Verification",
        citationId: "PC-ADDRESS-001-v1.2-section-2",
        sourceUri: "demo://project-compass/PC-ADDRESS-001/v1.2/section/2.0",
        content: "Address changes requested via phone must pass High-Assurance MFA authentication (push notification to registered mobile banking device or out-of-band one-time passcode). If MFA is unavailable, the caller must be directed to an in-person branch or secure digital banking portal. Third-party address changes requested on behalf of an individual are strictly prohibited unless presented by a registered, legally approved Attorney-in-Fact.",
        applicableRoles: ["Contact Center Agent", "Contact Center Supervisor"]
      },
      {
        id: "section-3",
        sectionNumber: "3.0",
        title: "Post-Change Security Cooling Period & Notifications",
        citationId: "PC-ADDRESS-001-v1.2-section-3",
        sourceUri: "demo://project-compass/PC-ADDRESS-001/v1.2/section/3.0",
        content: "Upon completion of any address change, the core banking system automatically dispatches an instant alert notice to both the OLD email/SMS address and the NEW physical address. An automated 30-day Cooling Period is placed on expedited debit card re-issuance and wire limit upgrades unless overridden via in-branch biometric verification.",
        applicableRoles: ["Branch Banker", "Contact Center Agent", "Operations Analyst"]
      }
    ],
    exceptions: [
      "Active-duty military personnel deployed overseas may provide official military deployment orders (APO/FPO/DPO address) without local utility bills.",
      "Corporate/Commercial business address changes require corporate resolution or Articles of Amendment signed by authorized company officers."
    ],
    approvalRequirements: [
      "In-person standard updates: Single Branch Banker entry.",
      "Remote phone updates with MFA: Contact Center Agent entry.",
      "Cooling period expedited override: Branch Manager or Fraud Risk Supervisor sign-off."
    ],
    escalationRules: [
      "If a customer reports receiving an unauthorized address change notification, the agent must immediately apply an administrative lock on all debit cards and digital banking channels and route the case to Fraud Investigations within 15 minutes.",
      "Multiple address changes within a 60-day window trigger an automated High-Risk Fraud Queue review."
    ],
    complianceNotes: [
      "Demo governance guidance: Synthetic Red Flags Rule compliance requires prompt notification to prior address upon records update.",
      "PO Boxes are unacceptable as primary physical residential addresses; a physical street address is mandatory for all accounts."
    ]
  },

  // 6. PC-CARD-001 (v3.0 ACTIVE)
  {
    policyId: "PC-CARD-001",
    title: "Debit Card Replacement SOP",
    version: "3.0",
    status: "ACTIVE",
    effectiveDate: "2026-05-15",
    nextReviewDate: "2027-05-14",
    policyOwner: "Card Services & Branch Operations (Synthetic)",
    applicableRoles: ["Branch Banker", "Senior Branch Banker", "Contact Center Agent"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-CARD-001/v3.0",
    supersedes: "2.5",
    demoData: true,
    summary: "Procedures for reporting lost, stolen, or compromised debit cards, instant in-branch card issuance, and standard secure delivery dispatch.",
    purpose: "Provide standard operational steps to block compromised debit cards, protect customer account funds, and re-issue debit cards via instant branch embossing or standard secure postal fulfillment.",
    scope: "All retail branch staff, phone support representatives, and card services fulfillment personnel.",
    definitions: [
      { term: "Instant Issuance", definition: "On-demand encoding and thermal embossing of a personalized debit card inside a physical branch facility." },
      { term: "Warm Card Status", definition: "Temporary card freeze allowing customer to self-unfreeze within 14 days if card is temporarily misplaced." },
      { term: "Hot Card Status", definition: "Permanent non-reversible card block and cancellation due to verified fraud, loss, or theft." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Card Compromise Reporting and Immediate Blocking",
        citationId: "PC-CARD-001-v3.0-section-1",
        sourceUri: "demo://project-compass/PC-CARD-001/v3.0/section/1.0",
        content: "When a customer reports a lost, stolen, or compromised card, the banker must immediately apply 'Hot Card - Stolen/Lost' status in the card portal. This action instantly revokes tokenized digital wallet credentials (Apple Pay/Google Wallet) and declines pending card-present and e-commerce authorizations. If the customer merely misplaced the card at home, a temporary 'Warm Card - Customer Freeze' status may be selected.",
        applicableRoles: ["Branch Banker", "Contact Center Agent"]
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "Instant In-Branch Issuance Protocol",
        citationId: "PC-CARD-001-v3.0-section-2",
        sourceUri: "demo://project-compass/PC-CARD-001/v3.0/section/2.0",
        content: "For in-person card replacement, the customer must present one (1) unexpired primary photo ID. The banker retrieves a blank EMV chip stock card from the dual-custody vault safe, encodes the card via the branch instant issuance machine, and instructs the customer to input their private 4-digit PIN directly into the secure PIN pad terminal. Bankers are strictly prohibited from viewing or keying PIN numbers on behalf of customers.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker"]
      },
      {
        id: "section-3",
        sectionNumber: "3.0",
        title: "Mail Dispatch and Expedited Courier Delivery",
        citationId: "PC-CARD-001-v3.0-section-3",
        sourceUri: "demo://project-compass/PC-CARD-001/v3.0/section/3.0",
        content: "Standard card replacement orders are dispatched via first-class postal mail within 3 to 5 business days in tamper-evident non-marked security envelopes. Expedited courier delivery (1-2 business days) is available upon customer request; a standard synthetic expedited delivery fee of $15.00 applies unless waived for premium tier clients or active fraud victims.",
        applicableRoles: ["Branch Banker", "Contact Center Agent"]
      }
    ],
    exceptions: [
      "Cards cannot be mailed to an address that was modified within the preceding 30 days without secondary branch supervisor authorization.",
      "Emergency international card replacement requires Mastercard/Visa Global Emergency Services coordination."
    ],
    approvalRequirements: [
      "Standard block & re-issue: Frontline Banker / Agent.",
      "Instant issuance machine blank card safe retrieval: Dual custody log sign-out by two branch staff members.",
      "Expedited fee waiver: Senior Branch Banker or Supervisor sign-off."
    ],
    escalationRules: [
      "If card theft involves fraudulent transactions >= $500, initiate a formal Regulation E synthetic fraud dispute case immediately.",
      "Escalate to Physical Security and Branch Operations if the instant issuance printer suffers inventory mismatch between physical card count and electronic audit logs."
    ],
    complianceNotes: [
      "Demo governance guidance: Synthetic Regulation E limits consumer liability for unauthorized card transactions when reported promptly.",
      "Never write down, request, or store customer PIN codes in notes or system logs."
    ]
  },

  // 7. PC-DORMANT-001 (v1.5 ACTIVE)
  {
    policyId: "PC-DORMANT-001",
    title: "Dormant Account Reactivation SOP",
    version: "1.5",
    status: "ACTIVE",
    effectiveDate: "2026-02-20",
    nextReviewDate: "2027-02-19",
    policyOwner: "Deposit Operations & Unclaimed Property Desk (Synthetic)",
    applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst", "Compliance SME"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-DORMANT-001/v1.5",
    supersedes: "1.4",
    demoData: true,
    summary: "Standard workflow for identifying dormant deposit accounts, customer outreach, in-person identity verification, and multi-sign-off reactivation.",
    purpose: "Establish procedures to monitor inactive consumer and commercial deposit accounts, prevent unauthorized account takeovers of stagnant balances, ensure compliance with synthetic escheatment timelines, and execute safe account reactivations.",
    scope: "Applicable to all retail branch bankers, operations specialists, and unclaimed property administrators.",
    definitions: [
      { term: "DEMO_DORMANCY_PERIOD", definition: "Synthetic dormancy timeline of 24 consecutive months (730 calendar days) without customer-initiated financial activity or written communication." },
      { term: "Customer-Initiated Activity", definition: "Direct deposit, withdrawal, debit card swipe, online banking authenticated transfer, or written letter signed by account owner." },
      { term: "DEMO_DORMANT_HIGH_BAL", definition: "Synthetic high-balance dormancy threshold of $25,000.00 requiring dual-level management reactivation approval." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Dormancy Classification and System Restrictions",
        citationId: "PC-DORMANT-001-v1.5-section-1",
        sourceUri: "demo://project-compass/PC-DORMANT-001/v1.5/section/1.0",
        content: "When an account reaches DEMO_DORMANCY_PERIOD (24 months) without customer-initiated activity, the core system automatically assigns 'DORMANT' status. Automated service fees and interest postings are NOT considered customer-initiated activity. Dormant accounts reject incoming debits, automated clearing house (ACH) withdrawals, and ATM transactions, routing them to the exceptions queue.",
        applicableRoles: ["Operations Analyst", "Branch Banker"]
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "Reactivation Verification and Workflows",
        citationId: "PC-DORMANT-001-v1.5-section-2",
        sourceUri: "demo://project-compass/PC-DORMANT-001/v1.5/section/2.0",
        content: "To reactivate a dormant account, the account holder must appear in person at a branch with two (2) forms of valid identification (at least one unexpired primary government photo ID) and complete the synthetic Account Reactivation Request Form. Alternatively, remote reactivation is permitted only if the customer completes notarized verification or high-assurance video KYC.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker"]
      },
      {
        id: "section-3",
        sectionNumber: "3.0",
        title: "Approval Thresholds and Escheatment Prevention",
        citationId: "PC-DORMANT-001-v1.5-section-3",
        sourceUri: "demo://project-compass/PC-DORMANT-001/v1.5/section/3.0",
        content: "Dormant accounts with balances under DEMO_DORMANT_HIGH_BAL ($25,000) may be reactivated with Senior Branch Banker sign-off. Accounts with balances equal to or exceeding DEMO_DORMANT_HIGH_BAL require joint approval from the Branch Manager and Central Deposit Operations. If an account remains dormant for 36 months without reactivation, synthetic pre-escheatment statutory notices must be mailed to the last known address.",
        applicableRoles: ["Senior Branch Banker", "Operations Analyst", "Compliance SME"]
      }
    ],
    exceptions: [
      "Accounts linked to an active primary checking relationship held by the same primary CIF (tax ID) are exempt from automated dormancy restrictions under the synthetic householding rule.",
      "Certificates of Deposit (CDs) that automatically roll over are governed under specific CD maturity renewal schedules."
    ],
    approvalRequirements: [
      "Reactivations < $25,000: Branch Banker submission + Senior Branch Banker verification.",
      "Reactivations >= $25,000: Branch Manager + Deposit Operations Specialist dual approval."
    ],
    escalationRules: [
      "Escalate to Fraud Operations if an immediate outbound wire transfer or cashier check request is initiated within 48 hours of a dormant account reactivation.",
      "Escalate to Unclaimed Property Desk if customer is confirmed deceased or mail is returned as undeliverable."
    ],
    complianceNotes: [
      "Demo governance guidance: Synthetic unclaimed property statutes require state escheatment after 3 to 5 years of verified abandoned dormancy.",
      "Never execute manual deposits or small balance adjustments to artificially reset dormancy clocks without explicit written customer instruction."
    ]
  },

  // 8. PC-JOINT-001 (v2.2 ACTIVE)
  {
    policyId: "PC-JOINT-001",
    title: "Joint Account Ownership SOP",
    version: "2.2",
    status: "ACTIVE",
    effectiveDate: "2026-06-15",
    nextReviewDate: "2027-06-14",
    policyOwner: "Retail Deposit Product Management (Synthetic)",
    applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-JOINT-001/v2.2",
    supersedes: "2.1",
    demoData: true,
    summary: "Operating rules for joint tenancy with rights of survivorship, tenancy in common, signature mandates, adding/removing owners, and dispute handling.",
    purpose: "Define operational protocols, ownership rights, signature authorities, survivorship mandates, and dispute management for multi-party consumer deposit accounts.",
    scope: "All branch personnel, private banking relationship managers, and retail operations specialists.",
    definitions: [
      { term: "JTWROS", definition: "Joint Tenancy with Right of Survivorship: Each joint owner owns an undivided 100% interest; upon death of one owner, balance passes directly to surviving co-owner(s)." },
      { term: "Tenancy in Common (TIC)", definition: "Each owner holds a designated percentage share; upon death of an owner, their fractional share passes to their legal estate or heirs, not the co-owner." },
      { term: "Either-to-Sign Mandate", definition: "Standard mandate where any single joint owner may deposit, withdraw, transfer, or pledge funds independently without co-owner consent." },
      { term: "Both-to-Sign Mandate", definition: "Restricted signature mandate requiring all co-owners' signatures on every debit withdrawal or transfer instrument." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Establishing Joint Ownership Types and Mandates",
        citationId: "PC-JOINT-001-v2.2-section-1",
        sourceUri: "demo://project-compass/PC-JOINT-001/v2.2/section/1.0",
        content: "All joint account applicants must be physically present or complete verified electronic digital onboarding with unexpired primary photo IDs. The default joint ownership type is JTWROS with an Either-to-Sign mandate. If applicants elect Tenancy in Common or Both-to-Sign, specific supplementary disclosures and manual core system flags must be applied.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker"]
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "Adding or Removing Joint Co-Owners",
        citationId: "PC-JOINT-001-v2.2-section-2",
        sourceUri: "demo://project-compass/PC-JOINT-001/v2.2/section/2.0",
        content: "Adding a new joint owner to an existing account requires written consent and signatures from ALL existing account owners and the incoming party. Removing an existing joint owner requires signed notarized relinquishment from the departing party, or requires closing the account and opening a new individual account in the remaining owner's name. One owner cannot unilaterally remove a co-owner without their written consent.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker", "Operations Analyst"]
      },
      {
        id: "section-3",
        sectionNumber: "3.0",
        title: "Joint Owner Disputes and Administrative Freezes",
        citationId: "PC-JOINT-001-v2.2-section-3",
        sourceUri: "demo://project-compass/PC-JOINT-001/v2.2/section/3.0",
        content: "In the event of a written dispute, divorce filing, or competing conflicting demands from joint owners, the Branch Manager or Legal Operations may place an administrative 'Dispute Freeze' on the account. While frozen, no outbound withdrawals are permitted without a court order or joint written authorization signed by all registered co-owners.",
        applicableRoles: ["Senior Branch Banker", "Operations Analyst"]
      }
    ],
    exceptions: [
      "Removal of a deceased joint owner on a JTWROS account does not require a court order; presentation of a certified death certificate enables the surviving owner to retitle the account.",
      "Court injunctions or restraining orders immediately override standard Either-to-Sign mandates."
    ],
    approvalRequirements: [
      "Joint account opening: Standard Branch Banker submission.",
      "Adding a co-owner: Senior Branch Banker secondary verification of all signature cards.",
      "Administrative Dispute Freeze placement/release: Branch Manager or Legal Operations Specialist."
    ],
    escalationRules: [
      "Escalate to Legal Advisory Desk if joint owners threaten litigation or deliver competing attorney letters.",
      "Escalate to Fraud Prevention if one joint owner claims unauthorized withdrawal immediately preceding a relationship dissolution."
    ],
    complianceNotes: [
      "Demo governance guidance: Joint account balances are subject to joint liability for overdrafts and tax reporting requirements under synthetic IRS guidelines.",
      "Do not provide legal advice regarding estate planning consequences of JTWROS vs Tenancy in Common."
    ]
  },

  // 9. PC-COMPLAINT-001 (v3.1 ACTIVE)
  {
    policyId: "PC-COMPLAINT-001",
    title: "Customer Complaint Escalation SOP",
    version: "3.1",
    status: "ACTIVE",
    effectiveDate: "2026-05-01",
    nextReviewDate: "2027-04-30",
    policyOwner: "Customer Experience & Regulatory Relations (Synthetic)",
    applicableRoles: ["Branch Banker", "Contact Center Agent", "Contact Center Supervisor", "Operations Analyst", "Compliance SME"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-COMPLAINT-001/v3.1",
    supersedes: "3.0",
    demoData: true,
    summary: "Three-tiered escalation matrix, strict SLA resolution windows, mandatory root-cause tracking, and regulatory complaint reporting workflows.",
    purpose: "Provide a standardized enterprise framework for receiving, recording, investigating, resolving, and reporting customer grievances across all retail channels.",
    scope: "Mandatory for all customer-facing personnel, branch managers, phone supervisors, executive customer care specialists, and regulatory compliance analysts.",
    definitions: [
      { term: "Complaint", definition: "Any oral or written expression of dissatisfaction by a customer concerning the Bank's products, fees, services, employees, or regulatory disclosures." },
      { term: "Tier 1 Complaint", definition: "Routine frontline grievances resolvable within DEMO_SLA_24H (e.g. fee clarification, minor service delay)." },
      { term: "Tier 2 Complaint", definition: "Escalated grievances requiring manager intervention, operational research, or disputed transactions within DEMO_SLA_3D (3 business days)." },
      { term: "Tier 3 Complaint", definition: "High-risk grievances alleging regulatory violations, discrimination, legal threats, or executive office inquiries with DEMO_SLA_5D resolution SLA." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Complaint Intake, Logging, and Categorization",
        citationId: "PC-COMPLAINT-001-v3.1-section-1",
        sourceUri: "demo://project-compass/PC-COMPLAINT-001/v3.1/section/1.0",
        content: "Every employee who receives a customer complaint must log an incident ticket in the Central Grievance Portal within two (2) hours of receipt. The ticket must capture customer details, channel, specific grievance summary, root cause category, and current status. Frontline staff must NOT attempt to conceal or resolve complaints informally without logging.",
        applicableRoles: ["Branch Banker", "Contact Center Agent", "Contact Center Supervisor"]
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "Three-Tier Escalation SLA Matrix",
        citationId: "PC-COMPLAINT-001-v3.1-section-2",
        sourceUri: "demo://project-compass/PC-COMPLAINT-001/v3.1/section/2.0",
        content: "(1) Tier 1: Frontline staff must resolve or escalate within 24 hours. (2) Tier 2: Branch Managers or Team Leads must provide written or verbal resolution within three (3) business days. (3) Tier 3: Executive Customer Relations and Compliance must complete comprehensive investigation and send formal written resolution within five (5) business days.",
        applicableRoles: ["Branch Banker", "Contact Center Supervisor", "Operations Analyst", "Compliance SME"]
      },
      {
        id: "section-3",
        sectionNumber: "3.0",
        title: "Regulatory Agency Complaints Handling",
        citationId: "PC-COMPLAINT-001-v3.1-section-3",
        sourceUri: "demo://project-compass/PC-COMPLAINT-001/v3.1/section/3.0",
        content: "Complaints originating from regulatory bodies (such as synthetic CFPB, OCC, or state banking departments) or alleging discrimination/UDAAP must be routed directly to the Regulatory Affairs Desk within one (1) hour of receipt. Frontline staff are strictly prohibited from responding to regulatory agencies directly.",
        applicableRoles: ["Compliance SME", "Operations Analyst"]
      }
    ],
    exceptions: [
      "Anonymous complaints must still be logged in the grievance portal with category 'ANONYMOUS' for compliance trending.",
      "Complex fraud dispute investigations may extend past standard SLAs with customer notification of interim status."
    ],
    approvalRequirements: [
      "Tier 1 closure: Branch Banker / Agent.",
      "Tier 2 closure: Branch Manager / Phone Supervisor.",
      "Tier 3 formal written response: Compliance SME + Executive Relations Director."
    ],
    escalationRules: [
      "Complaints mentioning attorney representation, media exposure, or regulatory filing must be escalated to Tier 3 immediately.",
      "Any allegation of employee misconduct or physical threat must be routed to Human Resources and Corporate Security."
    ],
    complianceNotes: [
      "Demo governance guidance: Synthetic UDAAP and Fair Banking regulations mandate comprehensive root-cause analysis on all complaint patterns.",
      "All complaint audio recordings and correspondence must be archived for a synthetic 5-year retention period."
    ]
  },

  // 10A. PC-DIGITAL-001 (v1.3 SUPERSEDED)
  {
    policyId: "PC-DIGITAL-001",
    title: "Digital Banking Enrollment SOP",
    version: "1.3",
    status: "SUPERSEDED",
    effectiveDate: "2025-03-01",
    nextReviewDate: "2026-05-31",
    policyOwner: "Digital Channels & Security Architecture (Synthetic)",
    applicableRoles: ["Branch Banker", "Contact Center Agent"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-DIGITAL-001/v1.3",
    supersedes: "1.2",
    demoData: true,
    summary: "[SUPERSEDED] Historical digital enrollment workflow utilizing basic SMS OTP alone without mandatory device binding.",
    purpose: "Provide digital registration procedures for retail clients under the legacy 2025 security baseline.",
    scope: "Branch and contact center digital enrollment assistance.",
    definitions: [
      { term: "SMS OTP", definition: "Single-factor text message one-time passcode for online registration." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Registration Verification (Legacy Protocol)",
        citationId: "PC-DIGITAL-001-v1.3-section-1",
        sourceUri: "demo://project-compass/PC-DIGITAL-001/v1.3/section/1.0",
        content: "Banker verifies customer account number and sends SMS OTP to phone number on file to generate temporary credentials. No cryptographic device binding required.",
        applicableRoles: ["Branch Banker", "Contact Center Agent"]
      }
    ],
    exceptions: ["None recorded in legacy version."],
    approvalRequirements: ["Single banker enrollment assist."],
    escalationRules: ["Escalate to Helpdesk if OTP delivery fails."],
    complianceNotes: ["Demo governance guidance: SUPERSEDED ON 2026-06-01 BY VERSION 1.4."]
  },

  // 10B. PC-DIGITAL-001 (v1.4 ACTIVE)
  {
    policyId: "PC-DIGITAL-001",
    title: "Digital Banking Enrollment SOP",
    version: "1.4",
    status: "ACTIVE",
    effectiveDate: "2026-06-01",
    nextReviewDate: "2027-05-31",
    policyOwner: "Digital Channels & Security Architecture (Synthetic)",
    applicableRoles: ["Branch Banker", "Contact Center Agent", "Contact Center Supervisor", "Operations Analyst"],
    applicableRegion: "ALL-DEMO-REGIONS",
    documentType: "Standard Operating Procedure",
    sourceType: "Synthetic Knowledge Base",
    sourceUri: "demo://project-compass/PC-DIGITAL-001/v1.4",
    supersedes: "1.3",
    demoData: true,
    summary: "[ACTIVE] Procedures for onboarding customers to online and mobile banking, mandatory multi-factor authentication, trusted device binding, and lock-out recovery.",
    purpose: "Establish secure enrollment, credential management, cryptographic device binding, biometric authentication, and lock-out recovery workflows for online and mobile banking platforms.",
    scope: "Mandatory for all frontline retail bankers, virtual customer service agents, digital fraud analysts, and helpdesk specialists.",
    definitions: [
      { term: "Trusted Device Binding", definition: "Cryptographic pairing of the customer's mobile device hardware key with their digital banking profile." },
      { term: "Step-Up Authentication", definition: "Secondary MFA challenge required when initiating high-risk actions (e.g. adding new payees, wire requests, profile changes)." },
      { term: "Cooling Window", definition: "24-hour settlement hold on new external transfer payees added immediately following a credential reset." }
    ],
    sections: [
      {
        id: "section-1",
        sectionNumber: "1.0",
        title: "Self-Service Digital Onboarding and Identity Proofing",
        citationId: "PC-DIGITAL-001-v1.4-section-1",
        sourceUri: "demo://project-compass/PC-DIGITAL-001/v1.4/section/1.0",
        content: "Customers enrolling in digital banking must complete digital identity proofing by supplying their SSN/Tax ID, debit card PIN verification, and receiving a secure push or voice token to their registered phone number (which must be established on file >= 30 days). The customer creates an 8+ character complex passphrase and binds their primary mobile device via biometric Passkey / Secure Enclave.",
        applicableRoles: ["Branch Banker", "Contact Center Agent"]
      },
      {
        id: "section-2",
        sectionNumber: "2.0",
        title: "In-Branch Assisted Registration Protocol",
        citationId: "PC-DIGITAL-001-v1.4-section-2",
        sourceUri: "demo://project-compass/PC-DIGITAL-001/v1.4/section/2.0",
        content: "When assisting a customer with digital banking in a branch, the banker must verify an unexpired primary photo ID before generating a single-use temporary Activation QR Code. Bankers must NEVER request, observe, or type the customer's chosen permanent password or biometric setup. The customer must scan the QR code directly using the official Bank Mobile App.",
        applicableRoles: ["Branch Banker", "Senior Branch Banker"]
      },
      {
        id: "section-3",
        sectionNumber: "3.0",
        title: "Account Lockout, Credential Reset, and Fraud Controls",
        citationId: "PC-DIGITAL-001-v1.4-section-3",
        sourceUri: "demo://project-compass/PC-DIGITAL-001/v1.4/section/3.0",
        content: "Accounts are automatically locked after five (5) consecutive invalid login attempts. To reset credentials remotely, the customer must pass high-assurance MFA. Following any remote password or phone number change, an automated 24-hour Cooling Window is placed on new payee additions and Zelle/P2P transaction limits to prevent account takeover fund draining.",
        applicableRoles: ["Contact Center Agent", "Contact Center Supervisor", "Operations Analyst"]
      }
    ],
    exceptions: [
      "Commercial entity digital banking requires dual-administrator authorization and physical hardware token provisioning.",
      "Customers with accessibility impairments may request guided phone voice biometrics enrollment."
    ],
    approvalRequirements: [
      "Self-service onboarding: Automated risk engine approval.",
      "In-branch assisted activation: Single Branch Banker after primary ID verification.",
      "High-risk manual account unlock override: Contact Center Supervisor sign-off."
    ],
    escalationRules: [
      "Escalate to Digital Fraud Unit if a customer reports sudden SIM-swap or unexpected lock-out while abroad.",
      "Escalate to Security Operations Center (SOC) if bulk credential stuffing attacks are detected against customer login endpoints."
    ],
    complianceNotes: [
      "Demo governance guidance: Synthetic FFIEC digital banking guidance mandates risk-based multi-factor authentication and layered fraud defenses.",
      "Employees must never ask for customer passwords, OTP codes, or PIN numbers over the phone or in person."
    ]
  }
];

// Helper functions for easy querying
export function getActiveSOPs(): SOPDocument[] {
  return ALL_SYNTHETIC_SOPS.filter((sop) => sop.status === 'ACTIVE');
}

export function getSOPByPolicyIdAndVersion(policyId: string, version?: string): SOPDocument | undefined {
  if (version) {
    return ALL_SYNTHETIC_SOPS.find((sop) => sop.policyId === policyId && sop.version === version);
  }
  return ALL_SYNTHETIC_SOPS.find((sop) => sop.policyId === policyId && sop.status === 'ACTIVE');
}

export function getAllVersionsForPolicy(policyId: string): SOPDocument[] {
  return ALL_SYNTHETIC_SOPS.filter((sop) => sop.policyId === policyId);
}
