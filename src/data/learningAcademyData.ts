/**
 * AI BANKER TRANSFORMATION COPILOT
 * AI Learning Academy Curriculum & Personalization Engine
 *
 * Grounded in the 8 Core Banking AI Competencies:
 * 1. AI & GenAI Awareness (aiGenAIAwareness)
 * 2. Prompt Engineering & AI Interaction (promptEngineering)
 * 3. Banking Process Transformation (bankingProcessTransformation)
 * 4. Data & Analytics Readiness (dataAnalyticsReadiness)
 * 5. Automation Mindset (automationMindset)
 * 6. Responsible AI & Governance (responsibleAIGovernance)
 * 7. Practical AI Application (practicalAIApplication)
 * 8. Transformation Leadership (transformationLeadership)
 */

import {
  AssessmentDimensionKey,
  LearningLevel,
  LearningModule,
  MaturityLevel,
  TransformationAssessmentOutput,
} from '../types';

export interface RoleScenarioOverride {
  title: string;
  context: string;
  scenario: string;
  roleRelevance: string;
}

export const ROLE_SCENARIOS: Record<string, Record<AssessmentDimensionKey, RoleScenarioOverride>> = {
  'Relationship Manager': {
    promptEngineering: {
      title: 'Commercial Client Strategic Renewal Briefing',
      context: 'Preparing a structured prompt for an upcoming annual credit facility renewal with a $15M manufacturing client.',
      scenario: 'The RM needs an agenda, covenant tracking summary, and expansion opportunities without hallucinating interest rate benchmarks.',
      roleRelevance: 'Ensures client-facing briefs are rigorous, professional, and grounded in explicit borrower parameters.',
    },
    responsibleAIGovernance: {
      title: 'Client Financial Spread Advisory Boundaries',
      context: 'Reviewing an AI-generated balance sheet synthesis for commercial debt capacity.',
      scenario: 'An AI summary suggests a covenant waiver based on unverified EBITDA adjustments. The RM must catch this and enforce credit committee policy.',
      roleRelevance: 'Guarantees the RM never commits credit terms without formal credit committee sign-off.',
    },
    bankingProcessTransformation: {
      title: 'Commercial Loan Intake & Document Collation',
      context: 'Evaluating manual client financial statement collection vs automated extraction.',
      scenario: 'Separating unstructured tax return synthesis from deterministic debt-service coverage ratio (DSCR) formula calculations.',
      roleRelevance: 'Reduces intake turnaround from 7 days to 24 hours while keeping credit underwriting human-led.',
    },
    dataAnalyticsReadiness: {
      title: 'Treasury Management & Cash Flow Policy Retrieval',
      context: 'Looking up bank deposit liquidity tiering rules for multi-entity corporate accounts.',
      scenario: 'Querying bank Standard Operating Procedures (SOPs) via Project Compass before recommending sweep accounts.',
      roleRelevance: 'Prevents misquoting liquidity thresholds or sweep transaction fees.',
    },
    automationMindset: {
      title: 'Annual Client Review Scheduling & Milestone Tracking',
      context: 'Streamlining quarterly covenant compliance reviews across 45 middle-market accounts.',
      scenario: 'Identifying friction in credit memo renewals and automating calendar triggers with human review checkpoints.',
      roleRelevance: 'Frees up 6 hours per week for direct client relationship advisory discussions.',
    },
    practicalAIApplication: {
      title: 'Sensitive Credit Facility Amendment Correspondence',
      context: 'Drafting an empathetic yet firm response regarding a temporary covenant breach due to supply chain delays.',
      scenario: 'Refining an email draft to maintain borrower trust, outline required remediation documentation, and protect bank security.',
      roleRelevance: 'Preserves relationship rapport while ensuring legal and credit alignment.',
    },
    aiGenAIAwareness: {
      title: 'Probabilistic Nature of LLMs in Borrower Research',
      context: 'Using GenAI to summarize corporate news and industry sector headwinds for a prospective client pitch.',
      scenario: 'Understanding that LLMs can fabricate corporate acquisitions and verifying all claims against audited public filings.',
      roleRelevance: 'Protects the bank from reputational embarrassment during executive client pitches.',
    },
    transformationLeadership: {
      title: 'Leading the Commercial Team in Copilot Best Practices',
      context: 'Mentoring junior relationship associates on prompt templates and maker-checker validation.',
      scenario: 'Establishing a shared prompt library for client discovery notes and call memo writeups.',
      roleRelevance: 'Elevates team-wide productivity while maintaining uniform institutional governance.',
    },
  },
  'Credit/Lending': {
    promptEngineering: {
      title: 'Credit Memo Executive Summary Generation',
      context: 'Structuring prompts for commercial real estate loan underwriting memos.',
      scenario: 'Directing the model to synthesize tenant lease terms and debt yield ratios into standardized credit committee formats.',
      roleRelevance: 'Accelerates credit memo drafting while strictly adhering to credit policy formatting.',
    },
    responsibleAIGovernance: {
      title: 'Fair Lending & Model Bias Governance',
      context: 'Auditing AI copilot suggestions for retail or small business credit evaluations.',
      scenario: 'Verifying that credit models and AI assistants never incorporate prohibited fair-lending demographic factors or proxy variables.',
      roleRelevance: 'Mandatory compliance with Equal Credit Opportunity Act (ECOA/Reg B) and model risk governance (SR 11-7).',
    },
    bankingProcessTransformation: {
      title: 'Underwriting Checklist & Covenant Extraction',
      context: 'Automating loan covenant extraction from 100-page syndicated credit agreements.',
      scenario: 'Using GenAI for unstructured clause extraction paired with deterministic covenant calculation engines.',
      roleRelevance: 'Eliminates manual lease audit errors while keeping final underwriting approval with the credit officer.',
    },
    dataAnalyticsReadiness: {
      title: 'Commercial Lending Policy SOP Retrieval',
      context: 'Checking maximum loan-to-value (LTV) limits for specialized healthcare facilities.',
      scenario: 'Using RAG retrieval in Project Compass to verify credit policy exceptions and authorized signatory delegations.',
      roleRelevance: 'Ensures credit policy adherence without reliance on memory or outdated paper manuals.',
    },
    automationMindset: {
      title: 'Appraisal & Title Review Routing Automation',
      context: 'Removing bottlenecks between appraisal ordering, environmental review, and loan packaging.',
      scenario: 'Designing an automated status trigger with clear human approval milestones.',
      roleRelevance: 'Decreases credit turnaround times by 35% without expanding credit risk appetite.',
    },
    practicalAIApplication: {
      title: 'Credit Inquiry & Underwriting Clarification Memo',
      context: 'Communicating sensitive underwriting conditions and missing financial items to client RMs.',
      scenario: 'Drafting clear, prioritized condition letters that explain the rationale for additional guarantor liquidity verification.',
      roleRelevance: 'Minimizes friction between front-office sales and back-office credit review.',
    },
    aiGenAIAwareness: {
      title: 'Mathematical Boundaries of GenAI in Credit Modeling',
      context: 'Recognizing why LLMs must never calculate debt service coverage or compound interest directly.',
      scenario: 'Ensuring financial calculations are piped to deterministic Python or spreadsheet engines.',
      roleRelevance: 'Prevents catastrophic credit underwriting calculation errors caused by LLM token generation math.',
    },
    transformationLeadership: {
      title: 'Credit Committee AI Validation Framework',
      context: 'Presenting an AI-assisted credit screening pilot to Chief Risk Officers and regulators.',
      scenario: 'Establishing clear maker-checker validation protocols and audit trails for all AI-assisted credit write-ups.',
      roleRelevance: 'Builds regulatory and executive trust in bank-wide AI transformation initiatives.',
    },
  },
  'Branch Manager': {
    promptEngineering: {
      title: 'Branch Morning Briefing & Service Goal Formulation',
      context: 'Creating structured prompts to summarize daily service goals, teller operations, and compliance reminders.',
      scenario: 'Prompting the assistant to provide daily focus areas for branch staff balancing customer service and regulatory controls.',
      roleRelevance: 'Saves 30 minutes of daily administrative prep time for the branch manager.',
    },
    responsibleAIGovernance: {
      title: 'Customer PII Masking & Clean Desk Compliance',
      context: 'Training frontline branch staff on never entering customer account numbers or SSNs into AI tools.',
      scenario: 'Identifying simulated staff prompts containing real customer identifiers and substituting synthetic placeholders.',
      roleRelevance: 'Protects branch operations from Gramm-Leach-Bliley Act (GLBA) and privacy violations.',
    },
    bankingProcessTransformation: {
      title: 'Signature Card Verification & Account Maintenance Intake',
      context: 'Optimizing walk-in business customer account modification and signer updates.',
      scenario: 'Using GenAI to review document completeness while preserving dual-authorization branch manager sign-off.',
      roleRelevance: 'Decreases customer wait times from 45 minutes to 15 minutes during peak branch hours.',
    },
    dataAnalyticsReadiness: {
      title: 'Branch Currency Transaction Reporting (CTR) Policy Retrieval',
      context: 'Verifying FinCEN CTR aggregation rules for multiple structured cash deposits.',
      scenario: 'Querying authoritative bank BSA/AML policy in Project Compass before determining SAR filing escalation.',
      roleRelevance: 'Prevents frontline compliance errors in anti-money laundering reporting.',
    },
    automationMindset: {
      title: 'Branch Teller Cash Limit & Vault Balancing Flow',
      context: 'Automating end-of-day discrepancy reporting and cash replenishment alerts.',
      scenario: 'Identifying repetitive manual ledger entries and replacing with automated alerts and manager sign-off.',
      roleRelevance: 'Reduces end-of-day branch closing friction and audit exceptions.',
    },
    practicalAIApplication: {
      title: 'De-escalating Customer Service Complaints in Branch',
      context: 'Drafting professional follow-up letters to branch customers affected by fee disputes or ATM deposit errors.',
      scenario: 'Crafting empathetic, compliant communications outlining remediation steps without admitting unverified institutional fault.',
      roleRelevance: 'Transforms disgruntled branch visitors into loyal brand advocates.',
    },
    aiGenAIAwareness: {
      title: 'Understanding AI Voice Clones & Branch Wire Fraud',
      context: 'Educating branch staff on emerging generative AI threats such as synthetic customer voice cloning.',
      scenario: 'Enforcing strict callback procedures for high-dollar wire transfers even when customer voice sounds authentic.',
      roleRelevance: 'Protects the branch from wire fraud losses driven by deceptive generative AI technologies.',
    },
    transformationLeadership: {
      title: 'Fostering Digital & AI Confidence Among Frontline Staff',
      context: 'Overcoming staff hesitation and fear of technology replacement at the retail branch level.',
      scenario: 'Running practical weekly 15-minute hands-on copilot workshops for tellers and customer service representatives.',
      roleRelevance: 'Creates a modern, technologically empowered frontline banking workforce.',
    },
  },
  'Operations': {
    promptEngineering: {
      title: 'Wire Exception & Payment Repair Formatting',
      context: 'Generating standardized MT103 / ISO 20022 wire exception resolution messages.',
      scenario: 'Structuring prompts to summarize missing beneficiary details and intermediary routing instructions.',
      roleRelevance: 'Increases Straight-Through Processing (STP) rates across payment operations.',
    },
    responsibleAIGovernance: {
      title: 'Sanctions Screening & False Positive Governance',
      context: 'Reviewing AI-assisted OFAC and PEP sanctions alert triage.',
      scenario: 'Ensuring that AI screening is strictly advisory and that a human compliance officer always makes final release decisions.',
      roleRelevance: 'Strict adherence to regulatory sanctions mandates and BSA/AML requirements.',
    },
    bankingProcessTransformation: {
      title: 'Back-Office Reconciliations & Rework Elimination',
      context: 'Redesigning end-of-day general ledger suspense account investigations.',
      scenario: 'Deploying GenAI for pattern recognition across transaction narratives while retaining ledger journal approval rules.',
      roleRelevance: 'Reduces operational rework by 50% and accelerates financial close cycles.',
    },
    dataAnalyticsReadiness: {
      title: 'Regulation E Dispute Processing SOP Grounding',
      context: 'Validating mandatory 10-day provisional credit timelines for unauthorized debit card transactions.',
      scenario: 'Retrieving authoritative Reg E timelines from Project Compass to ensure regulatory deadline compliance.',
      roleRelevance: 'Avoids regulatory audit findings and Consumer Financial Protection Bureau (CFPB) penalties.',
    },
    automationMindset: {
      title: 'End-to-End Account Closure & Escheatment Workflow',
      context: 'Analyzing multi-step dormant account workflows across 4 core banking legacy systems.',
      scenario: 'Mapping out API integrations vs manual document generation to eliminate manual copy-paste handoffs.',
      roleRelevance: 'Eliminates 80% of human copy-paste errors across legacy core systems.',
    },
    practicalAIApplication: {
      title: 'Operational Incident Post-Mortem Documentation',
      context: 'Drafting structured root-cause analysis memos following a payment batch processing delay.',
      scenario: 'Synthesizing technical logs into executive summaries for management review and regulatory reporting.',
      roleRelevance: 'Communicates complex technical issues with clarity and professional accountability.',
    },
    aiGenAIAwareness: {
      title: 'Prompt Injection Attacks in Ingested Customer Payloads',
      context: 'Understanding indirect prompt injection hidden in payment memo fields and customer PDF attachments.',
      scenario: 'Implementing data sanitization boundaries so external text is never interpreted as LLM instructions.',
      roleRelevance: 'Critical defense against automated backend system compromise.',
    },
    transformationLeadership: {
      title: 'Scaling AI Operations Center of Excellence (CoE)',
      context: 'Establishing metrics and operational SLAs for enterprise AI tool adoption.',
      scenario: 'Tracking time saved, human correction rates, and governance audit passes across operational teams.',
      roleRelevance: 'Demonstrates tangible operational ROI to the bank executive committee.',
    },
  },
  'Compliance/Risk': {
    promptEngineering: {
      title: 'Regulatory Change Management Delta Analysis',
      context: 'Structuring prompts to compare new OCC/FRB supervisory guidance with existing bank policies.',
      scenario: 'Directing the model to generate a clause-by-clause gap matrix with required policy amendments.',
      roleRelevance: 'Enables rapid regulatory gap analysis while maintaining strict audit traceability.',
    },
    responsibleAIGovernance: {
      title: 'Model Risk Management (SR 11-7) & LLM Validation',
      context: 'Establishing governance frameworks for generative AI models used in customer-facing and internal banking apps.',
      scenario: 'Designing model validation documentation, benchmark testing datasets, and drift monitoring procedures.',
      roleRelevance: 'Core mandate for bank safety, soundness, and regulatory examination readiness.',
    },
    bankingProcessTransformation: {
      title: 'Suspicious Activity Report (SAR) Narrative Drafting',
      context: 'Assessing GenAI assistance in compiling SAR narrative timelines from transactional alerts.',
      scenario: 'Enforcing that AI acts solely as a timeline organizer, with all suspicious determination decisions made by certified AML investigators.',
      roleRelevance: 'Protects the bank against willful blindness penalties and regulatory scrutiny.',
    },
    dataAnalyticsReadiness: {
      title: 'Authoritative Compliance Manual Search & Grounding',
      context: 'Searching internal bank BSA/AML, Consumer Compliance, and Information Security manuals.',
      scenario: 'Leveraging Project Compass semantic search to verify exact policy versioning before issuing compliance advice.',
      roleRelevance: 'Guarantees compliance advice is consistent with board-approved policies.',
    },
    automationMindset: {
      title: 'Annual Compliance Risk Assessment (CRA) Automation',
      context: 'Automating multi-departmental compliance questionnaire aggregation and risk heatmapping.',
      scenario: 'Replacing manual email survey follow-ups with automated dashboards and compliance risk scoring.',
      roleRelevance: 'Saves 200+ compliance officer hours during the annual risk assessment cycle.',
    },
    practicalAIApplication: {
      title: 'Clear, Actionable Compliance Guidance Communications',
      context: 'Drafting clear, non-punitive compliance advisories for frontline lending and branch personnel.',
      scenario: 'Synthesizing complex regulatory revisions into concise, practical action checklists for bankers.',
      roleRelevance: 'Drives voluntary compliance and cultural alignment across the institution.',
    },
    aiGenAIAwareness: {
      title: 'Hallucinations in Legal and Regulatory AI Output',
      context: 'Understanding why GenAI can invent nonexistent regulatory statutes or judicial citations.',
      scenario: 'Requiring mandatory primary-source legal verification for all AI-generated regulatory references.',
      roleRelevance: 'Prevents legal sanctions or embarrassing false claims in regulatory submissions.',
    },
    transformationLeadership: {
      title: 'Responsible AI Governance Committee Leadership',
      context: 'Chairing the cross-functional AI Governance Council comprising Risk, Legal, Tech, and Business units.',
      scenario: 'Evaluating new AI use cases against risk appetite, privacy guardrails, and customer fairness standards.',
      roleRelevance: 'Shapes the bank future safely without stifling competitive innovation.',
    },
  },
};

/**
 * Core 8 Dimensions Curriculum Catalog
 */
export const CORE_LEARNING_MODULES: LearningModule[] = [
  {
    id: 'mod_prompt_eng',
    title: 'Prompt Engineering for Structured Banking Workflows',
    dimension: 'promptEngineering',
    level: 'Practitioner',
    estimatedMinutes: 15,
    objective: 'Master structured prompting techniques—role framing, boundary constraints, few-shot examples, and JSON schemas—to reliably automate banking workflows without hallucinations.',
    lesson: {
      concept: 'Effective prompting in banking requires treated LLMs as probabilistic text completion engines that must be constrained by deterministic boundaries: Persona, Objective, Strict Context, Negative Constraints, and Required Schema.',
      whyItMatters: 'In regulated financial services, unconstrained prompts produce vague, hallucinatory, or non-compliant responses. Structured prompts guarantee consistent, audit-ready outputs every time.',
      practicalExample: 'Instead of "Summarize this client call", use: "Act as a Commercial Credit Analyst. Summarize the following client transcript into 3 sections: 1) Working Capital Needs, 2) Identified Risk Factors, 3) Recommended Next Actions. Use bracketed placeholders for unverified numbers."',
      governanceConsideration: 'Never include real customer PANs, SSNs, account balances, or credentials in prompts. Always use synthetic client proxies.',
      keyTakeaway: 'The quality of banking AI output is a direct mathematical consequence of the constraints, boundaries, and schema provided in the prompt.',
    },
    bankingExample: {
      title: 'Customer Strategic Meeting Preparation Brief',
      context: 'Preparing for an annual relationship review with an expanding mid-sized commercial borrower.',
      scenario: 'The banker needs a briefing document containing an agenda, 4 targeted discovery questions, 3 potential customer objections, and suggested counter-points.',
      roleRelevance: 'Enables high-impact meeting preparation in under 3 minutes while adhering to bank communication policies.',
    },
    practiceExercise: {
      id: 'ex_prompt_eng',
      title: 'Create a Structured Customer Meeting Preparation Prompt',
      instructions: 'Draft a robust, structured prompt to generate a Customer Meeting Brief for an affluent wealth management client inquiring about mortgage refinancing. Incorporate: 1) Clear persona, 2) Explicit objective, 3) 3 negative constraints (e.g. no promises on rate), 4) Required structured output sections.',
      scenario: 'Client: Dr. Elena Rostova, Premier Banking client for 8 years. Objective: Explore refinancing a $1.2M jumbo mortgage currently at 6.875% into a fixed 15-year or ARM option. Primary concern: Prepayment penalties and closing fees.',
      exerciseType: 'prompt_engineering',
      initialInput: 'Act as a Senior Private Wealth Advisor at a regulated commercial bank.\n\nObjective: Generate a comprehensive Customer Meeting Brief for Dr. Elena Rostova regarding jumbo mortgage refinancing.\n\nNegative Constraints:\n- Do not quote or guarantee specific interest rates or APRs.\n- Do not disclose internal bank margin thresholds.\n- Use synthetic placeholders [e.g. [Estimated Fee Range]] for financial figures.\n\nOutput Structure:\n1. Executive Meeting Agenda (30 min)\n2. Strategic Discovery Questions (3 questions)\n3. Anticipated Borrower Objections & Recommended Responses\n4. Regulatory Disclosures & Follow-up Checklist',
      promptPlaceholder: 'Enter your structured prompt here with persona, objective, negative constraints, and output format...',
      sampleSolution: 'Act as a Senior Private Wealth Advisor at a regulated commercial bank.\n\nContext:\nMeeting with Dr. Elena Rostova (Premier Banking client, 8 yrs) to discuss refinancing a $1.2M jumbo mortgage (current 6.875%) to evaluate 15-year fixed vs 7/1 ARM.\n\nNegative Constraints:\n1. Do NOT quote or promise specific interest rates, discount points, or monthly payments.\n2. Do NOT waive closing fees without formal credit officer delegation.\n3. Mark all rate ranges as [Illustrative Rate - Subject to Underwriting].\n\nRequired Output Schema:\n- Agenda (4 distinct timed agenda items)\n- Discovery Questions (Focus on liquidity goals and timeline)\n- Objection Handling (Addressing closing fees and appraisal requirements)\n- Compliance Reminders (HMDA and Truth-in-Lending notice requirements)',
      evaluationCriteria: [
        'Includes explicit professional banking persona and objective',
        'Defines clear negative constraints forbidding interest rate guarantees or fee promises',
        'Specifies a well-structured output format (agenda, questions, objections, compliance)',
        'Uses synthetic customer data without real confidential PII',
      ],
    },
    reflectionQuestion: 'How does adding explicit negative constraints (e.g. "Do not promise specific interest rates") protect your institution from regulatory compliance violations?',
    applyLink: {
      moduleTab: 'meeting_prep',
      label: 'Practice in Meeting Prep',
      suggestedAction: 'Launch the Customer Meeting Prep copilot and test your structured briefing prompt with live synthetic client scenarios.',
    },
  },
  {
    id: 'mod_resp_ai',
    title: 'Responsible AI, Risk Mitigation & Governance Guardrails',
    dimension: 'responsibleAIGovernance',
    level: 'Practitioner',
    estimatedMinutes: 20,
    objective: 'Understand regulatory frameworks (SR 11-7, Reg B, EU AI Act), recognize generative AI hallucinations and bias, and enforce Human-in-the-Loop maker-checker controls in banking operations.',
    lesson: {
      concept: 'Responsible AI in banking establishes four non-negotiable pillars: Model Governance (SR 11-7 compliance), Data Privacy (GLBA/GDPR zero PII leakage), Explainability & Fair Lending (Reg B/ECOA bias prevention), and Human-in-the-Loop (HITL) accountability.',
      whyItMatters: 'Unlike consumer tech, an AI error in banking can lead to severe regulatory fines, civil rights violations, systemic credit misallocations, and irreparable loss of client trust.',
      practicalExample: 'An AI assistant summarizes a loan applicant file and highlights that the applicant is approaching retirement age. An untrained officer might use this in credit decisioning, violating the Equal Credit Opportunity Act. Responsible AI training teaches bankers to identify and discard prohibited factors.',
      governanceConsideration: 'AI tools are strictly advisory copilot systems. They must never make autonomous credit, lending, employment, or regulatory compliance determinations.',
      keyTakeaway: 'The human banker remains legally, ethically, and operationally accountable for every final decision and client-facing communication.',
    },
    bankingExample: {
      title: 'Commercial Lending Covenant Waiver Analysis',
      context: 'An AI copilot drafts a credit recommendation suggesting an immediate covenant waiver for a retail borrower.',
      scenario: 'Reviewing the draft, the credit officer discovers the AI hallucinated that "the borrower has alternative collateral in escrow" when no such escrow account exists in the credit agreement.',
      roleRelevance: 'Demonstrates why every factual claim in an AI-generated memo must be verified against source documentation.',
    },
    practiceExercise: {
      id: 'ex_resp_ai',
      title: 'Identify Governance Risks in an AI-Generated Banking Summary',
      instructions: 'Review the simulated AI response below. Identify at least 3 critical governance, regulatory, or privacy violations. Write your critique explaining why each issue violates bank policy and what maker-checker correction is required.',
      scenario: 'Simulated AI Response to be reviewed:\n"Based on my analysis of Dr. John Smith (SSN: 123-45-6789, Acct #4421-9981-0021), his business is solvent. We should approve his $250,000 credit line increase immediately at 5.25% fixed. Given his upcoming retirement next year, we have flagged his account as moderate risk. I have updated the core banking system to reflect this decision."',
      exerciseType: 'governance_review',
      initialInput: '1. PII Exposure: The prompt exposes real SSN and full Account Number, violating GLBA and bank privacy policy.\n2. Autonomous Decisioning: The AI claims it has "approved" the credit line and "updated the core banking system", violating the non-autonomous advisory rule.\n3. Fair Lending / Age Discrimination: The AI considers "upcoming retirement" as a risk factor, which directly violates the Equal Credit Opportunity Act (ECOA / Reg B).\n4. Unauthorized Rate Commitment: The AI promises a 5.25% fixed rate without credit committee sign-off or formal pricing desk approval.',
      promptPlaceholder: 'List the governance violations, regulatory rules infringed, and required human interventions...',
      sampleSolution: 'CRITICAL VIOLATIONS IDENTIFIED:\n1. Unmasked Sensitive PII: SSN (123-45-6789) and full account number are present. Violation of GLBA and bank data protection policy.\n2. Autonomous Decisioning & Execution: The model claims to have approved the loan and updated the core banking system. AI tools must be advisory only; credit decisions require authorized human underwriter approval.\n3. ECOA / Reg B Violation: Factoring "upcoming retirement" into credit risk assessment constitutes prohibited age discrimination.\n4. Unauthorized Pricing Commitment: Quoting a binding 5.25% fixed rate without pricing desk approval or credit memo execution.\n\nREQUIRED MAKER-CHECKER REMEDIATION:\n- Redact customer identifiers.\n- Discard age-based risk commentary.\n- Submit credit memo to human credit committee for formal review.',
      evaluationCriteria: [
        'Identifies sensitive PII exposure (SSN and account number)',
        'Catches autonomous credit decisioning and unauthorized system write actions',
        'Recognizes fair lending / ECOA age discrimination violation regarding retirement',
        'Enforces mandatory Human-in-the-Loop maker-checker remediation',
      ],
    },
    reflectionQuestion: 'What steps do you take in your daily routine to ensure you never use AI output without independent human verification?',
    applyLink: {
      moduleTab: 'copilot',
      label: 'Explore with AI Banker Copilot',
      suggestedAction: 'Ask AI Banker Copilot to explain OCC / FRB supervisory expectations for Generative AI in commercial underwriting.',
    },
  },
  {
    id: 'mod_process_opt',
    title: 'Banking Process Transformation: GenAI vs Deterministic Automation',
    dimension: 'bankingProcessTransformation',
    level: 'Practitioner',
    estimatedMinutes: 18,
    objective: 'Distinguish between unstructured cognitive tasks suitable for GenAI and deterministic transactional tasks requiring RPA/APIs, designing safe, high-velocity hybrid workflows.',
    lesson: {
      concept: 'Not every banking problem is an LLM problem. GenAI excels at synthesizing unstructured documents (letters, memos, meeting notes). Deterministic systems excel at calculations, ledger postings, and rule-based validations. High-performing banks blend both.',
      whyItMatters: 'Using GenAI for deterministic tasks (like interest rate calculations or GL balance reconciliation) introduces catastrophic hallucinations. Using deterministic systems for unstructured customer emails results in rigid, broken customer experiences.',
      practicalExample: 'In mortgage onboarding: Use GenAI to read unstructured tax returns and extract stated income into JSON. Use a deterministic Python/SQL engine to compute debt-to-income (DTI) ratio. Use a human underwriter to approve the final condition.',
      governanceConsideration: 'Every automated workflow must have clearly documented control points, audit logs, and manual escalation triggers for exceptions.',
      keyTakeaway: 'The golden rule of banking automation: Use GenAI for unstructured synthesis; use deterministic engines for mathematical and ledger rules; use humans for judgment and sign-off.',
    },
    bankingExample: {
      title: 'Commercial Lending Intake & Financial Spreading',
      context: 'Transforming a 5-day manual intake process for mid-market business loan requests.',
      scenario: 'Analyzing 6 distinct process steps from borrower document upload to credit committee memo generation to assign optimal technology categories.',
      roleRelevance: 'Enables operations and credit leaders to double intake throughput while cutting operational errors in half.',
    },
    practiceExercise: {
      id: 'ex_process_opt',
      title: 'Classify Banking Process Steps into Optimal Automation Modes',
      instructions: 'Review the 5 steps of a Commercial Lending Intake Workflow below. For each step, classify whether it should be: [GenAI], [Deterministic Automation / RPA], or [Mandatory Human Approval (HITL)]. Explain the risk of misclassifying each step.',
      scenario: 'Steps to classify:\nStep 1: Extract unstructured revenue and business narrative from 3 years of audited PDF annual reports.\nStep 2: Calculate Debt Service Coverage Ratio (DSCR = Net Operating Income / Total Debt Service).\nStep 3: Check OFAC / PEP sanctions screening database against business entity and primary principals.\nStep 4: Formulate 3 strategic questions regarding an anomalous dip in gross margins during Year 2.\nStep 5: Sign off on initial credit feasibility to advance request to formal underwriting.',
      exerciseType: 'process_decision',
      initialInput: 'Step 1: [GenAI] - Unstructured document extraction and narrative synthesis.\nStep 2: [Deterministic Automation] - Mathematical formula calculation requiring zero variance.\nStep 3: [Deterministic Automation with Human Review] - Database query against authoritative sanctions lists; any positive hit requires human compliance officer review.\nStep 4: [GenAI] - Cognitive synthesis identifying trends and formulating thoughtful discovery questions.\nStep 5: [Mandatory Human Approval (HITL)] - Authorized credit officer sign-off; AI cannot commit bank balance sheet resources.',
      promptPlaceholder: 'Classify Steps 1 to 5 and explain the governance risk for each...',
      sampleSolution: 'OPTIMAL ARCHITECTURAL CLASSIFICATION:\n- Step 1: [GenAI] Unstructured Document Extraction. Risk if deterministic: Fails on non-standard PDF formats.\n- Step 2: [Deterministic Automation] DSCR Calculation. Risk if GenAI: Probabilistic math hallucinations could approve an insolvent borrower.\n- Step 3: [Deterministic Automation + Compliance HITL] Sanctions Check. API query against FinCEN/OFAC; false positives require human compliance determination.\n- Step 4: [GenAI] Margin Dip Analysis & Question Formulation. Cognitive reasoning over trend data provides high-value banker support.\n- Step 5: [Mandatory Human Approval] Credit Feasibility Sign-Off. Credit delegation authority resides solely with designated bank officers.',
      evaluationCriteria: [
        'Correctly assigns Step 1 and Step 4 to GenAI',
        'Correctly assigns Step 2 (mathematical calculation) to Deterministic Automation',
        'Correctly assigns Step 5 to Mandatory Human Approval (HITL)',
        'Demonstrates clear understanding of risk associated with LLM calculation hallucinations',
      ],
    },
    reflectionQuestion: 'In your own department, which daily task is best suited for GenAI synthesis versus deterministic rules?',
    applyLink: {
      moduleTab: 'process_optimizer',
      label: 'Design in Process Optimizer',
      suggestedAction: 'Launch Process Optimizer to analyze an end-to-end banking process, diagnose bottlenecks, and generate an actionable roadmap.',
    },
  },
  {
    id: 'mod_comm_synthesis',
    title: 'Professional Communication & Customer Intent Synthesis',
    dimension: 'practicalAIApplication',
    level: 'Practitioner',
    estimatedMinutes: 15,
    objective: 'Apply Generative AI to analyze complex customer communications, extract genuine intent and sentiment, draft empathetic responses, and detect regulatory escalation triggers.',
    lesson: {
      concept: 'Customer communication in banking is legally sensitive. An email can create promissory estoppel, admit unwarranted liability, or trigger regulatory complaint tracking (CFPB/OCC). AI can draft communications, but must be tuned for tone, empathy, and regulatory boundaries.',
      whyItMatters: 'Unhappy customers frequently express multiple overlapping issues (disputed fee, service delay, perceived disrespect). AI helps extract the core issues rapidly, allowing bankers to address concerns empathetically without making reckless promises.',
      practicalExample: 'When a customer writes: "If my wire is not released today I am filing a complaint with the state regulator!", the AI identifies: Intent = Urgency / Payment Tracking; Escalation = High (Regulatory Complaint Threat); Recommended Action = Expedited Wire Desk Investigation with phone outreach.',
      governanceConsideration: 'Never send AI drafts automatically. Every customer-facing communication must be reviewed, edited, and approved by a human banker.',
      keyTakeaway: 'Great banking communication balances deep human empathy with strict institutional precision.',
    },
    bankingExample: {
      title: 'Disputed Wire Transfer Fee & Transaction Delay Response',
      context: 'A commercial client sends a frustrated email regarding an unexpected $45 intermediary wire fee and a 48-hour transfer delay.',
      scenario: 'Drafting an empathetic, professional reply explaining international correspondent banking fees, confirming transaction status, and offering a courtesy fee review without admitting institutional negligence.',
      roleRelevance: 'Protects commercial account relationships while safeguarding the bank against unauthorized fee waivers.',
    },
    practiceExercise: {
      id: 'ex_email_critique',
      title: 'Critique and Improve an AI-Generated Customer Email',
      instructions: 'Read the simulated customer complaint and the draft AI response below. Identify 2 severe flaws in the draft response (e.g. promissory liability, lack of empathy, robotic tone). Rewrite a polished, professional, policy-compliant response incorporating required placeholders.',
      scenario: 'Customer Complaint: "I have been with your bank for 12 years and you hit me with an overdraft fee when my paycheck was deposited the exact same day! This is predatory. Fix it now or I close all my accounts."\n\nFlawed AI Draft:\n"Dear Customer, The fee was assessed because our automated overnight batch settlement processes debits before credits per section 14.2 of your deposit agreement. We cannot refund it because you spent funds you did not have. Thank you for banking with us."',
      exerciseType: 'email_critique',
      initialInput: 'Flaws in AI Draft:\n1. Tone is defensive, cold, and dismissive of a 12-year loyal relationship.\n2. Lacks empathy and quotes legalistic contract sections rather than solving the problem.\n3. Fails to outline practical next steps or mention courtesy fee waiver guidelines.\n\nPolished Professional Response:\nDear [Customer Name],\n\nThank you for reaching out, and thank you for your 12 years of loyalty to our bank. I completely understand your frustration regarding the overdraft fee assessed on [Date] when your deposit was processed.\n\nI am currently reviewing your account transaction timeline with our operations team. As a valued customer, I would like to explore options to request a courtesy fee waiver for this charge, subject to our account guidelines.\n\nI will follow up with you by [Time/Date] with an update. Please feel free to reach me directly at [Direct Phone Number] if you have any questions in the meantime.\n\nSincerely,\n[Banker Name]\n[Title/Branch]',
      promptPlaceholder: 'Identify flaws in the AI draft and draft your polished replacement...',
      sampleSolution: 'CRITICAL FLAWS IN DRAFT:\n1. Adversarial & Blaming Tone: Accuses customer ("you spent funds you did not have"), destroying a 12-year relationship.\n2. Legalistic Defensiveness: Hides behind terms of service instead of demonstrating proactive service.\n3. Zero Problem Resolution: Does not mention that long-tenured customers in good standing are eligible for courtesy overdraft waivers.\n\nRECOMMENDED POLISHED RESPONSE:\nDear [Customer Name],\n\nThank you for reaching out, and thank you for being a valued customer with us for the past 12 years. I sincerely understand your frustration regarding the overdraft fee assessed alongside your payroll deposit on [Date].\n\nI am personally reviewing your account history and transaction posting timeline. Because of your valued relationship with us, I am submitting a request to our operations desk for a courtesy fee waiver.\n\nI will confirm the resolution with you by [Expected Time/Date]. If you have any additional questions today, please reach me directly at [Phone Number].\n\nWarm regards,\n[Banker Name]\n[Title / Branch]',
      evaluationCriteria: [
        'Identifies adversarial, defensive tone and lack of customer empathy in the draft',
        'Acknowledges customer loyalty and validates their frustration professionally',
        'Avoids binding promissory commitments before checking account eligibility',
        'Includes professional placeholders for dates, names, and contact details',
      ],
    },
    reflectionQuestion: 'Why is it dangerous to allow generative AI models to send emails to banking customers without human review?',
    applyLink: {
      moduleTab: 'email_assistant',
      label: 'Draft in Banking Email Assistant',
      suggestedAction: 'Launch Banking Email Assistant to analyze customer emails, extract intent, and generate multi-tone professional drafts.',
    },
  },
  {
    id: 'mod_rag_policy',
    title: 'Retrieval-Augmented Generation (RAG) & Authoritative Policy Retrieval',
    dimension: 'dataAnalyticsReadiness',
    level: 'Practitioner',
    estimatedMinutes: 15,
    objective: 'Understand how semantic search, vector embeddings, and RAG architectures ground generative AI in authoritative bank Standard Operating Procedures (SOPs), eliminating policy hallucinations.',
    lesson: {
      concept: 'Generative AI models do not "know" your bank specific policies. If asked: "What is our limit for wire callbacks?", a base LLM will guess based on public internet training data. RAG solves this by retrieving exact chunks from verified bank SOPs and injecting them into the prompt.',
      whyItMatters: 'Relying on base LLM knowledge for regulatory, compliance, or credit policies is dangerous. RAG provides source citations, version numbers, and audit trails for every answer.',
      practicalExample: 'A customer disputes an unauthorized electronic fund transfer. Instead of asking Gemini from general memory, Project Compass retrieves SOP-OPS-001 (Regulation E Unauthorized EFT Processing v2.1), finding that the customer must be provided provisional credit within 10 business days.',
      governanceConsideration: 'Always check the version date and document status of retrieved SOPs. Old or superseded policies lead to compliance violations.',
      keyTakeaway: 'Never ask an AI model to remember bank policy. Always ground it in authoritative, version-controlled policy documents.',
    },
    bankingExample: {
      title: 'Regulation E Unauthorized Debit Card Dispute Intake',
      context: 'A branch banker is assisting a customer reporting $1,400 in unauthorized POS charges occurring over the weekend.',
      scenario: 'Querying bank policy via Project Compass to determine: 1) Provisional credit deadline (10 business days), 2) Customer liability tier ($50 vs $500), 3) Required written confirmation requirements.',
      roleRelevance: 'Ensures flawless compliance with Federal Reserve Regulation E and CFPB examination standards.',
    },
    practiceExercise: {
      id: 'ex_rag_policy',
      title: 'Analyze Policy Retrieval Requirements for a Banking Dispute',
      instructions: 'Review the customer dispute scenario below. Identify which specific bank Standard Operating Procedure (SOP) must be retrieved before providing guidance. Formulate a semantic search query that would retrieve the exact authoritative policy chunk.',
      scenario: 'Scenario: Customer reports that their debit card was lost 5 days ago, and 4 fraudulent online purchases totaling $850 cleared yesterday. The branch associate wants to know whether the customer is responsible for $50 or up to $500 under bank policy, and what the deadline is for provisional credit.',
      exerciseType: 'policy_retrieval',
      initialInput: 'Required Policy Domain: Regulation E Unauthorized Electronic Fund Transfers & Debit Card Disputes (SOP-OPS-001).\n\nOptimal Semantic Search Queries:\n1. "Regulation E provisional credit timeline customer dispute 10 business days"\n2. "Consumer liability tiers lost debit card reported within two business days"\n\nAuthoritative SOP Verification Checkpoints:\n- Verify policy version is current (active status, not superseded).\n- Confirm whether customer notified bank within 2 business days of learning of card loss (limits liability to $50).\n- Verify mandatory 10-day provisional credit requirement pending written notice.',
      promptPlaceholder: 'Identify the required SOP, write your semantic search query, and specify policy checkpoints...',
      sampleSolution: 'POLICY RETRIEVAL SPECIFICATION:\n- Target Policy: SOP-OPS-001 (Regulation E Electronic Fund Transfers & Unauthorized Transaction Procedures).\n- Semantic Search Query: "Regulation E unauthorized card dispute provisional credit deadline customer liability tiers"\n\nAUTHORITATIVE POLICY CHECKPOINTS TO RETRIEVE:\n1. Notice Timing: Customer reported within 2 business days of discovering loss ($50 liability cap) vs after 2 business days (up to $500 liability cap).\n2. Provisional Credit SLA: Bank must provide provisional credit within 10 business days of notice if investigation is ongoing.\n3. Written Statement Requirement: Bank may require written confirmation within 10 business days before paying provisional credit if permitted by policy.',
      evaluationCriteria: [
        'Identifies Regulation E / Unauthorized EFT as the authoritative policy domain',
        'Formulates targeted semantic search queries avoiding vague keyword terms',
        'Identifies the 10-day provisional credit statutory deadline',
        'Highlights the 2-day notice liability cutoff ($50 vs $500)',
      ],
    },
    reflectionQuestion: 'Why is vector semantic search superior to traditional keyword search when navigating complex banking compliance manuals?',
    applyLink: {
      moduleTab: 'project_compass',
      label: 'Query in Project Compass',
      suggestedAction: 'Launch Project Compass Knowledge Base to search across 10 active banking SOP policies with semantic grounding and version traceability.',
    },
  },
  {
    id: 'mod_genai_foundations',
    title: 'Generative AI Foundations & Cognitive Boundaries in Banking',
    dimension: 'aiGenAIAwareness',
    level: 'Foundation',
    estimatedMinutes: 12,
    objective: 'Demystify Large Language Models: understand token prediction, context windows, non-determinism, and why banking data requires strict perimeter isolation.',
    lesson: {
      concept: 'Large Language Models are probabilistic pattern matchers trained on massive text corpora. They predict the next most likely word (token). They do not "think", have consciousness, or verify facts natively.',
      whyItMatters: 'Understanding that LLMs calculate probabilities rather than truth explains why they can sound 100% confident while completely inventing financial figures or legal clauses.',
      practicalExample: 'If you ask an LLM: "What was Acme Corp Q3 2024 operating margin?", it will generate plausible sounding numbers based on similar companies unless strictly grounded in Acme Corp audited 10-Q filing text.',
      governanceConsideration: 'Bank data sent to consumer AI tools (e.g. free ChatGPT) can be ingested into public training sets. Only enterprise-grade, isolated AI environments (like Google Cloud Run with Vertex AI / Gemini enterprise terms) preserve banking confidentiality.',
      keyTakeaway: 'LLMs are extraordinary cognitive accelerators for text synthesis, but they are not calculators or legal truth machines.',
    },
    bankingExample: {
      title: 'Evaluating an Executive GenAI Proposal for Financial Modeling',
      context: 'An internal department proposes replacing an Excel spreadsheet model with a raw Gemini prompt to calculate interest rate swap pricing.',
      scenario: 'Explaining to stakeholders why probabilistic models cannot replace deterministic financial engineering software for mathematical calculations.',
      roleRelevance: 'Protects the bank from adopting inappropriate AI architectures that create balance sheet risk.',
    },
    practiceExercise: {
      id: 'ex_genai_foundations',
      title: 'Evaluate a High-Risk GenAI Use Case Proposal',
      instructions: 'Review the proposal below. Write a short memorandum to the Innovation Committee explaining: 1) Why using an LLM directly for interest rate swap math is fundamentally flawed, 2) What hybrid architecture should be used instead.',
      scenario: 'Proposal: "We can save $100K in licensing by replacing our Treasury derivative calculation engine with a Gemini prompt that takes counterparty data and outputs daily mark-to-market swap valuations directly."',
      exerciseType: 'governance_review',
      initialInput: 'Memorandum to Innovation Committee:\n\n1. Flaw in Proposal:\nLLMs are probabilistic token prediction models, not deterministic calculation engines. Generating floating-point arithmetic or discounting cash flows via neural network token completion will result in mathematical rounding drift and catastrophic valuation errors. Mark-to-market valuations must be accurate to the cent.\n\n2. Recommended Hybrid Architecture:\n- Keep the certified quantitative valuation engine (Python/C++ or vendor software) for the mathematical swap pricing.\n- Use Gemini strictly for qualitative narrative reporting: explaining market movement drivers, synthesizing counterparty credit news, and generating executive commentary.',
      promptPlaceholder: 'Write your critique and recommended alternative architecture...',
      sampleSolution: 'EXECUTIVE COMMITTEE MEMO:\n\n1. Flaw in Raw LLM Financial Modeling:\nLLMs operate via token probability distributions, not deterministic floating-point arithmetic. They cannot guarantee mathematical precision or reproduce identical calculations across runs. Using an LLM for mark-to-market swap pricing introduces severe valuation inaccuracies, audit failure, and regulatory capital miscalculation.\n\n2. Recommended Hybrid Solution:\n- Deterministic Engine: Continue using verified quantitative engines (e.g. Python QuantLib) for exact cash flow discounting and swap valuations.\n- Generative AI Copilot: Deploy Gemini to synthesize market news, explain yield curve shifts in plain English, and draft executive summaries of portfolio risk.',
      evaluationCriteria: [
        'Explains that LLMs are probabilistic token predictors, not mathematical calculation engines',
        'Highlights the danger of valuation errors, audit failure, and balance sheet risk',
        'Proposes a proper hybrid architecture where math is deterministic and AI provides narrative synthesis',
      ],
    },
    reflectionQuestion: 'How would you explain the difference between a probabilistic AI model and a deterministic calculation program to a junior banker?',
    applyLink: {
      moduleTab: 'copilot',
      label: 'Consult AI Banker Copilot',
      suggestedAction: 'Ask AI Banker Copilot how leading global banks architect hybrid deterministic-GenAI pipelines for financial calculations.',
    },
  },
  {
    id: 'mod_automation_mindset',
    title: 'Automation Mindset: Bottleneck Identification & Workflow Redesign',
    dimension: 'automationMindset',
    level: 'Practitioner',
    estimatedMinutes: 15,
    objective: 'Develop an automation mindset: diagnose operational friction, identify swivel-chair handoffs, eliminate redundant verification, and calculate realistic capacity savings.',
    lesson: {
      concept: 'True process transformation is not paving the cow path—it is not merely automating a broken manual process. An automation mindset challenges why each step exists, eliminates redundant handoffs, and restructures workflows for straight-through speed.',
      whyItMatters: 'Banks are burdened by decades of accumulated manual verification steps. Automating manual chaos simply produces high-speed chaos. Restructuring first unlocks 5x greater efficiency.',
      practicalExample: 'In commercial account opening: Instead of having a clerk manually copy data from PDF forms into 3 different legacy core systems (swivel-chair friction), extract the data once via AI into JSON, validate via business rules, and post simultaneously via API.',
      governanceConsideration: 'Removing human approvals from high-risk points (OFAC, credit limit changes, wire release) is forbidden. Focus automation on data assembly and preparation, keeping humans at the decision gate.',
      keyTakeaway: 'Automate data movement, verification, and preparation—preserve human wisdom for decision gates.',
    },
    bankingExample: {
      title: 'Commercial Real Estate Appraisal Review Workflow',
      context: 'Appraisal intake currently takes 14 days due to back-and-forth emails between loan packaging, review appraisers, and underwriters.',
      scenario: 'Redesigning the workflow with automated property data verification, automated condition tracking, and a centralized review dashboard.',
      roleRelevance: 'Cuts commercial loan closing cycle times by 4 days, giving the bank a competitive turnaround advantage.',
    },
    practiceExercise: {
      id: 'ex_automation_mindset',
      title: 'Diagnose Bottlenecks in an Onboarding Workflow',
      instructions: 'Review the manual account opening workflow below. Identify 2 major manual bottlenecks and describe how to redesign the flow to eliminate manual friction while preserving required compliance checks.',
      scenario: 'Current Workflow: 1) Customer emails PDF application. 2) Assistant manually types data into CRM. 3) Assistant manually re-types same data into Core Banking. 4) Assistant prints paper copy for Branch Manager signature. 5) Signed paper scanned back into PDF repository.',
      exerciseType: 'process_decision',
      initialInput: 'Identified Bottlenecks:\n1. Dual manual data entry: Typing from PDF into CRM, and then re-typing into Core Banking (swivel-chair redundancy, 100% prone to transposition typos).\n2. Paper-based manual signature loop: Printing paper for Branch Manager physical signature and re-scanning.\n\nRedesigned Modern Flow:\n1. Digital intake parses PDF application data into validated JSON schema once.\n2. API writes data simultaneously to CRM and Core Banking pending manager approval.\n3. Branch Manager receives digital dashboard notification with side-by-side verification and approves via electronic signature with audit trail.\n4. System auto-archives digital document into repository with zero paper printing.',
      promptPlaceholder: 'Diagnose bottlenecks and outline your redesigned modern workflow...',
      sampleSolution: 'BOTTLENECK DIAGNOSIS:\n1. Redundant Data Entry: Manually re-keying data across CRM and Core Banking causes delays and high error rates.\n2. Paper Scan-and-Sign Loop: Physical printing, signing, and re-scanning creates a multi-day delay and destroys searchable digital metadata.\n\nMODERN HYBRID REDESIGN:\n1. Intelligent Ingestion: Application data ingested digitally or extracted via AI into standardized schema.\n2. Single-Source Synchronization: Core Banking and CRM populated via validated API integration.\n3. Digital Maker-Checker Gate: Branch Manager receives automated alert to review pre-populated fields and e-signs within dashboard.\n4. Straight-Through Archiving: Final documentation archived automatically with cryptographic audit timestamp.',
      evaluationCriteria: [
        'Identifies duplicate data entry and physical paper printing as primary bottlenecks',
        'Proposes automated digital ingestion and API data synchronization',
        'Preserves mandatory manager approval through an efficient digital authorization gate',
        'Eliminates unnecessary physical document scanning',
      ],
    },
    reflectionQuestion: 'What is one recurring manual task in your daily work that involves copying information from one system to another?',
    applyLink: {
      moduleTab: 'process_optimizer',
      label: 'Model in Process Optimizer',
      suggestedAction: 'Input a manual banking workflow into Process Optimizer to receive an instant diagnostic breakdown and 30/60/90 day implementation roadmap.',
    },
  },
  {
    id: 'mod_leadership',
    title: 'AI Transformation Leadership & Change Management in Regulated Banking',
    dimension: 'transformationLeadership',
    level: 'Transformation Leader',
    estimatedMinutes: 20,
    objective: 'Lead the cultural, operational, and organizational transition to an AI-empowered banking workforce, championing psychological safety, maker-checker accountability, and ethical governance.',
    lesson: {
      concept: 'AI transformation is 20% technology and 80% human change management. Banking professionals frequently fear technology replacement or fear regulatory retribution if an AI tool makes an error. Transformation leaders build trust, establish clear safety boundaries, and celebrate augmentation over replacement.',
      whyItMatters: 'Even the most advanced enterprise AI tools fail if frontline staff quietly refuse to use them or bypass safety controls. Great leadership aligns incentives, provides continuous education, and establishes psychological safety.',
      practicalExample: 'A transformation leader runs weekly "Prompt of the Week" sessions where commercial loan officers share how they used the copilot to prepare for meetings, discussing what the AI got right, what it missed, and how the human officer improved the final result.',
      governanceConsideration: 'Leadership must reinforce that using AI is not cheating—it is institutional acceleration. However, accountability for accuracy rests entirely on the professional who stamps the output.',
      keyTakeaway: 'The AI does not replace the banker. The banker who masters AI replaces the banker who resists it.',
    },
    bankingExample: {
      title: 'Overcoming Frontline Staff Hesitation in Retail Banking',
      context: 'Branch tellers and platform specialists express anxiety that automated copilots will lead to branch closures and layoffs.',
      scenario: 'Designing a communication and coaching strategy that re-frames the AI copilot as an administrative shield that frees bankers for relationship advisory.',
      roleRelevance: 'Critical capability for regional managers, team leads, and bank executives navigating digital evolution.',
    },
    practiceExercise: {
      id: 'ex_leadership',
      title: 'Formulate a Coaching Framework for AI Copilot Adoption',
      instructions: 'You are leading a team of 12 Relationship Managers where 8 are hesitant to use the new AI Banker Copilot due to fear of mistakes or skepticism about AI value. Draft a 3-point coaching plan to build confidence, establish maker-checker habits, and track success.',
      scenario: 'Context: The bank has deployed AI Banker Copilot enterprise-wide. Frontline adoption is currently at 22%. Several senior RMs claim: "I have been doing this for 20 years, I don\'t need a machine telling me how to talk to my clients."',
      exerciseType: 'discovery_questions',
      initialInput: '3-Point AI Transformation Coaching Plan:\n\n1. Reframe from "Replacement" to "Administrative Offload":\nEmphasize that the copilot is not advising their clients—it is doing the tedious administrative work (drafting call notes, summarizing 40-page financial reports, compiling agendas) so the RM can spend 5 more hours per week in high-value face-to-face client meetings.\n\n2. Establish Safe "Sandbox" Discovery Sessions:\nHost bi-weekly 20-minute peer sessions where senior RMs test the tool on real historical files to see where it saves time, while reinforcing that the RM is the ultimate expert whose judgment improves the output.\n\n3. Foster Maker-Checker Culture Without Blame:\nCreate clear guidelines: the RM is celebrated for catching AI inaccuracies and refining outputs. Make prompt sharing a recognized peer contribution.',
      promptPlaceholder: 'Draft your 3-point coaching and change management plan...',
      sampleSolution: 'TRANSFORMATION LEADERSHIP COACHING BLUEPRINT:\n\n1. Address Value Proposition & Respect Expertise:\nDo not tell experienced bankers the AI is smarter than them. Frame the copilot as an "Executive Research Assistant" that handles 80% of drafting and collation, freeing the RM to focus on high-margin strategic relationship advisory.\n\n2. Low-Stakes Practical Sandbox Workshops:\nRun 30-minute hands-on clinics using synthetic customer files. Have RMs run Meeting Prep and Email Assistant side-by-side against their manual methods, experiencing firsthand the 75% reduction in administrative prep time.\n\n3. Formalize Maker-Checker Accountability as a Badge of Honor:\nReinforce that the banker expertise is the indispensable quality filter. Establish an internal "Prompts & Best Practices" repository where top team members are recognized for innovative, compliant workflow prompts.',
      evaluationCriteria: [
        'Reframes AI as an administrative accelerator rather than a threat to professional judgment',
        'Proposes hands-on, low-stakes workshops with synthetic scenarios to build comfort',
        'Reinforces Human-in-the-Loop accountability and maker-checker validation',
        'Establishes continuous peer learning and knowledge sharing mechanisms',
      ],
    },
    reflectionQuestion: 'What is the most effective way to help a skeptical colleague see generative AI as a helpful assistant rather than a threat?',
    applyLink: {
      moduleTab: 'meeting_prep',
      label: 'Prepare Briefs in Meeting Prep',
      suggestedAction: 'Use Customer Meeting Prep to formulate structured discovery and coaching agendas for your team members.',
    },
  },
];

const DIMENSION_NAMES: Record<AssessmentDimensionKey, string> = {
  aiGenAIAwareness: 'AI & GenAI Awareness',
  promptEngineering: 'Prompt Engineering & Interaction',
  bankingProcessTransformation: 'Banking Process Transformation',
  dataAnalyticsReadiness: 'Data & Policy RAG Readiness',
  automationMindset: 'Automation Mindset & Workflows',
  responsibleAIGovernance: 'Responsible AI & Governance',
  practicalAIApplication: 'Practical Banking AI Applications',
  transformationLeadership: 'Transformation Leadership',
};

const ALL_ROLES = [
  'Relationship Manager',
  'Credit/Lending',
  'Branch Manager',
  'Wealth Management',
  'Risk & Compliance',
];

CORE_LEARNING_MODULES.forEach((m, idx) => {
  m.order = idx + 1;
  m.description = m.objective;
  m.dimensionName = DIMENSION_NAMES[m.dimension] || m.dimension;
  m.difficulty = m.level;
  m.roles = ALL_ROLES;
  m.reflectionTakeaways = [
    m.lesson.keyTakeaway,
    m.lesson.whyItMatters,
    m.lesson.governanceConsideration,
  ];
  m.content = {
    coreConcept: m.lesson.concept,
    bankingUseCase: {
      title: m.bankingExample.title,
      context: m.bankingExample.context,
      workflowImpact: m.bankingExample.roleRelevance,
    },
    promptTechnique: {
      patternName: `${m.title.split(' ')[0]} Structured Framework`,
      description: m.lesson.whyItMatters,
      template: m.practiceExercise.initialInput || m.practiceExercise.sampleSolution || '',
    },
    commonPitfalls: [
      m.lesson.governanceConsideration,
      'Deploying unconstrained prompts into production workflows',
      'Over-relying on probabilistic outputs without Human-in-the-Loop review',
    ],
  };
  m.practiceExercise.instruction = m.practiceExercise.instructions;
  m.practiceExercise.type = m.practiceExercise.exerciseType;
  m.practiceExercise.hints = [m.lesson.governanceConsideration];
  if (m.applyLink) {
    m.applyLink.module = m.applyLink.moduleTab;
    m.applyLink.title = m.applyLink.label;
    m.applyLink.actionPrompt = m.applyLink.suggestedAction;
  }
});

/**
 * Helper to determine learning level from numerical dimension score and maturity level
 */
export function determineLearningLevel(score: number, maturityLevel?: MaturityLevel): LearningLevel {
  if (score < 35) return 'Foundation';
  if (score < 65) return 'Practitioner';
  if (score < 80) return 'Advanced';
  return 'Transformation Leader';
}

/**
 * Generate Personalized Learning Path based on Phase 5C Assessment
 */
export function generatePersonalizedLearningPath(
  assessment: TransformationAssessmentOutput | null | undefined,
  userRole?: string
): {
  modules: LearningModule[];
  prioritySkills: string[];
  nextModuleId: string;
  isPersonalized: boolean;
  role: string;
  maturityLevel: MaturityLevel;
  overallScore: number;
} {
  const role = assessment?.role || userRole || 'Relationship Manager';
  const maturityLevel: MaturityLevel = assessment?.maturityLevel || 'AI Aware';
  const overallScore = assessment?.overallScore ?? 50;
  const isPersonalized = Boolean(assessment && assessment.dimensionScores);

  // If we have an assessment, extract scores and sort dimensions by weakest first!
  const dimensionScoresMap: Record<AssessmentDimensionKey, number> = {
    aiGenAIAwareness: assessment?.dimensionScores?.aiGenAIAwareness?.score ?? 50,
    promptEngineering: assessment?.dimensionScores?.promptEngineering?.score ?? 50,
    bankingProcessTransformation: assessment?.dimensionScores?.bankingProcessTransformation?.score ?? 50,
    dataAnalyticsReadiness: assessment?.dimensionScores?.dataAnalyticsReadiness?.score ?? 50,
    automationMindset: assessment?.dimensionScores?.automationMindset?.score ?? 50,
    responsibleAIGovernance: assessment?.dimensionScores?.responsibleAIGovernance?.score ?? 50,
    practicalAIApplication: assessment?.dimensionScores?.practicalAIApplication?.score ?? 50,
    transformationLeadership: assessment?.dimensionScores?.transformationLeadership?.score ?? 50,
  };

  // Identify the top 3 priority skill gaps (lowest scores)
  const sortedDimensions = (Object.keys(dimensionScoresMap) as AssessmentDimensionKey[]).sort(
    (a, b) => dimensionScoresMap[a] - dimensionScoresMap[b]
  );

  const dimensionNameMap: Record<AssessmentDimensionKey, string> = {
    aiGenAIAwareness: 'AI & GenAI Awareness',
    promptEngineering: 'Prompt Engineering & Interaction',
    bankingProcessTransformation: 'Banking Process Transformation',
    dataAnalyticsReadiness: 'Data & Policy RAG Readiness',
    automationMindset: 'Automation Mindset & Workflows',
    responsibleAIGovernance: 'Responsible AI & Governance',
    practicalAIApplication: 'Practical Banking AI Applications',
    transformationLeadership: 'Transformation Leadership',
  };

  const prioritySkills = sortedDimensions.slice(0, 3).map((dim) => dimensionNameMap[dim]);

  // Clone and personalize core modules
  const personalizedModules: LearningModule[] = sortedDimensions.map((dimKey, index) => {
    const baseModule = CORE_LEARNING_MODULES.find((m) => m.dimension === dimKey) || CORE_LEARNING_MODULES[0];
    const dimScore = dimensionScoresMap[dimKey];
    const level = determineLearningLevel(dimScore, maturityLevel);

    // Apply role personalization if scenario exists
    const roleScenarios = ROLE_SCENARIOS[role] || ROLE_SCENARIOS['Relationship Manager'];
    const roleScenario = roleScenarios[dimKey];

    const customizedBankingExample = roleScenario
      ? {
          title: roleScenario.title,
          scenario: roleScenario.scenario,
          context: roleScenario.context,
          roleRelevance: roleScenario.roleRelevance,
        }
      : baseModule.bankingExample;

    const isPriorityGap = isPersonalized && index < 3;
    const gapRank = isPriorityGap ? index + 1 : undefined;

    return {
      ...baseModule,
      order: index + 1,
      level,
      difficulty: level,
      isPriorityGap,
      gapRank,
      bankingExample: customizedBankingExample,
    };
  });

  // Next recommended module is the #1 module in the personalized sequence
  const nextModuleId = personalizedModules[0]?.id || CORE_LEARNING_MODULES[0].id;

  return {
    modules: personalizedModules,
    prioritySkills,
    nextModuleId,
    isPersonalized,
    role,
    maturityLevel,
    overallScore,
  };
}
