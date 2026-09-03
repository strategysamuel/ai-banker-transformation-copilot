import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ProcessOptimizerRequest,
  ProcessOptimizerOutput,
  InteractionSession,
  ProcessBusinessArea,
  ProcessVolume,
  ProcessFrequency,
} from '../types';
import { generateProcessOptimizerAnalysis, detectSensitiveData, AIServiceError } from '../services/aiService';
import { saveInteraction } from '../services/interactionService';
import {
  GitBranch,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Users,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Save,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  History,
  Target,
  Download,
  AlertCircle,
  Cpu,
  Workflow,
  Compass,
} from 'lucide-react';

interface ProcessOptimizerProps {
  initialSession?: InteractionSession | null;
  onSessionUpdated?: (session: InteractionSession) => void;
  onNavigateToHistory?: () => void;
}

// 6 Synthetic Retail Banking Process Scenarios
const SAMPLE_PROCESSES = [
  {
    title: 'Customer Address Change',
    name: 'Customer Address Change & Signature Verification',
    businessArea: 'Branch Banking' as ProcessBusinessArea,
    volume: 'High' as ProcessVolume,
    frequency: 'Daily' as ProcessFrequency,
    timeMinutes: 25,
    people: 3,
    systems: 'Core Banking Ledger, CRM, Document Archival, Physical Signature Cards',
    painPoints: 'Manual signature card comparison, customer forms scanned as low-res PDFs, double-data entry across core banking and card processor, postal verification letter sent manually.',
    description: `Customer submits physical or mailed address change request with proof of residence utility bill. 
Step 1: Teller or branch specialist inspects the paper form and manually pulls physical or digitized signature card.
Step 2: Specialist visually compares signatures and validates utility bill date (must be within 60 days).
Step 3: Specialist logs into Core Banking System and updates primary billing address.
Step 4: Specialist opens separate Card Processing Portal and re-keys address for debit card records.
Step 5: Specialist hands off paperwork to Assistant Branch Manager for secondary dual-control sign-off.
Step 6: Manager signs physical form, scans it into Document Archival repository, and logs out.
Step 7: Automated batch prints physical confirmation letter to old address next business day.`,
    context: 'Synthetic scenario for Cloud Run AI Challenge. Involves branch and operations staff with strict dual-control requirements to prevent account takeover.',
  },
  {
    title: 'International Wire Processing',
    name: 'Outbound International Commercial Wire Verification',
    businessArea: 'Payments' as ProcessBusinessArea,
    volume: 'Medium' as ProcessVolume,
    frequency: 'Daily' as ProcessFrequency,
    timeMinutes: 45,
    people: 4,
    systems: 'SWIFT Alliance Gateway, Core Ledger, Sanctions/OFAC Filter, Wire Portal',
    painPoints: 'Manual callback verification for high-value wires, false-positive OFAC name match reviews, cut-off time stress, manual transcription of intermediary BIC codes.',
    description: `Commercial client submits an out-of-band wire instruction via PDF or email request for $42,000 USD to an overseas vendor.
Step 1: Wire clerk downloads instruction from secure mailbox and confirms account has sufficient collected funds.
Step 2: Clerk initiates phone callback to authorized signer on file using recorded phone line.
Step 3: Clerk keys beneficiary name, IBAN, and SWIFT BIC into Wire Gateway.
Step 4: Automated sanctions engine flags partial name match on beneficiary; clerk manually reviews PEP/sanctions database and writes audit justification.
Step 5: Wire operations supervisor performs second-line maker-checker inspection and authorizes release.
Step 6: SWIFT MT103 confirmation message generated and filed into wire archives.`,
    context: 'High-risk payments workflow. Mandatory OFAC screening and human callback verification required by policy.',
  },
  {
    title: 'Account Opening Verification',
    name: 'Consumer Digital Account Opening Exception Review',
    businessArea: 'Retail Operations' as ProcessBusinessArea,
    volume: 'Very High' as ProcessVolume,
    frequency: 'Daily' as ProcessFrequency,
    timeMinutes: 35,
    people: 2,
    systems: 'Digital Intake Portal, Core Banking, IDV Provider, Credit Bureau, Fraud Engine',
    painPoints: 'Applicants failing automated IDV due to recent address moves or hyphenated names enter manual queue; operations officers manually inspect driver licenses; 3-day backlog.',
    description: `Applicant attempts online account opening and gets flagged for manual review due to an address mismatch between credit bureau and utility bill.
Step 1: Application drops into Retail Ops exception queue with "Document Review Required" flag.
Step 2: Ops officer reviews scanned photo ID and uploaded lease agreement.
Step 3: Officer manually checks state driver license barcode format and expiry date.
Step 4: Officer queries fraud database for associated device fingerprint history.
Step 5: If acceptable, officer marks application "Approved" and initiates automated core account creation.
Step 6: Officer sends welcome email with online banking registration link.`,
    context: 'High volume consumer onboarding with CIP and KYC compliance dependencies.',
  },
  {
    title: 'Debit Card Replacement',
    name: 'Lost/Stolen Debit Card Reissuance & Rush Delivery',
    businessArea: 'Cards' as ProcessBusinessArea,
    volume: 'High' as ProcessVolume,
    frequency: 'Daily' as ProcessFrequency,
    timeMinutes: 20,
    people: 2,
    systems: 'Card Management System, Core Ledger, Courier Shipping Portal, IVR Logs',
    painPoints: 'Customer calls contact center; representative blocks old card but must manually calculate rush courier fees and initiate fee debit in core ledger; shipping tracking not synced back to customer portal.',
    description: `Cardholder reports damaged or lost debit card and requests 2-day expedited shipping.
Step 1: Contact center representative verifies cardholder identity via 2FA and recent transaction recall.
Step 2: Representative sets card status to "Hot - Lost/Stolen" in Card Management System.
Step 3: Representative opens core ledger and creates a manual $25 rush courier fee debit.
Step 4: Representative fills out courier shipping form with delivery address.
Step 5: Representative logs case in CRM and advises cardholder of tracking number delivery via email.
Step 6: Nightly batch sends reissuance file to third-party card plastic embossing plant.`,
    context: 'Standard customer service operational workflow with multiple swivel-chair system handoffs.',
  },
  {
    title: 'Customer Complaint Handling',
    name: 'Formal Customer Complaint Escalation & Regulatory Triage',
    businessArea: 'Customer Service' as ProcessBusinessArea,
    volume: 'Low' as ProcessVolume,
    frequency: 'Daily' as ProcessFrequency,
    timeMinutes: 60,
    people: 3,
    systems: 'Complaint Management System, Core Ledger, Call Recording Vault, CRM',
    painPoints: 'Complaints arriving via letters, emails, and branch escalations are logged manually; classification of CFPB/regulatory tags is subjective and inconsistent; response deadlines tracked in spreadsheets.',
    description: `Customer sends formal written dispute alleging unresolved fee billing errors and threatens regulatory escalation.
Step 1: Complaint intake coordinator reads customer submission and manually assigns issue category and root cause.
Step 2: Coordinator searches call recording vault for customer prior agent interactions over past 90 days.
Step 3: Coordinator requests transaction audit logs from accounting operations.
Step 4: Coordinator drafts formal investigation findings and proposed financial resolution.
Step 5: Compliance and Customer Advocacy manager reviews drafted letter for regulatory adherence (Reg E / Reg Z / UDAAP).
Step 6: Final approved letter dispatched to customer via certified mail and secure portal.`,
    context: 'High-visibility governance and compliance process requiring strict regulatory timelines.',
  },
  {
    title: 'Fee Waiver Processing',
    name: 'Branch Manager Fee Waiver Request & Policy Audit',
    businessArea: 'Deposits' as ProcessBusinessArea,
    volume: 'Medium' as ProcessVolume,
    frequency: 'Daily' as ProcessFrequency,
    timeMinutes: 15,
    people: 2,
    systems: 'Core Banking System, Fee Reversal Portal, Relationship Profitability Tool',
    painPoints: 'Bankers submit email requests to branch managers for overdraft fee reversals exceeding their $50 delegation limit; managers manually review customer 12-month waiver count in disparate screens.',
    description: `Customer requests reversal of three overdraft fees totaling $105 after unexpected payroll processing delay.
Step 1: Personal banker reviews customer account history and notes banker delegation is limited to $50 per calendar year.
Step 2: Banker drafts email to Branch Manager explaining customer circumstance and past relationship value.
Step 3: Manager opens Relationship Profitability Tool to inspect customer average monthly deposit balance and 12-month waiver total.
Step 4: Manager approves request via email reply.
Step 5: Banker opens Fee Reversal module in Core Banking, enters transaction sequence numbers, and submits credits.
Step 6: Manager reviews monthly exception report at month-end to ensure compliance with fair lending guidelines.`,
    context: 'Operational discretion workflow balancing customer retention with strict fair-lending waiver caps.',
  },
];

const BUSINESS_AREAS: ProcessBusinessArea[] = [
  'Branch Banking',
  'Contact Center',
  'Retail Operations',
  'Deposits',
  'Cards',
  'Payments',
  'Lending Operations',
  'Customer Service',
  'Compliance Operations',
  'Other',
];

const VOLUMES: ProcessVolume[] = ['Low', 'Medium', 'High', 'Very High'];
const FREQUENCIES: ProcessFrequency[] = ['Daily', 'Weekly', 'Monthly', 'Event-driven'];

type SaveStatusType =
  | 'Draft'
  | 'Analyzing...'
  | 'Assessment generated'
  | 'Saving...'
  | 'Session saved'
  | 'Assessment generated — not saved';

export const ProcessOptimizer: React.FC<ProcessOptimizerProps> = ({
  initialSession,
  onSessionUpdated,
  onNavigateToHistory,
}) => {
  const { user } = useAuth();

  // Form State
  const [processName, setProcessName] = useState('');
  const [processDescription, setProcessDescription] = useState('');
  const [businessArea, setBusinessArea] = useState<ProcessBusinessArea>('Branch Banking');
  const [approximateVolume, setApproximateVolume] = useState<ProcessVolume>('Medium');
  const [frequency, setFrequency] = useState<ProcessFrequency>('Daily');
  const [currentProcessingTimeMinutes, setCurrentProcessingTimeMinutes] = useState<number | ''>(25);
  const [numberOfPeopleInvolved, setNumberOfPeopleInvolved] = useState<number | ''>(3);
  const [systemsUsed, setSystemsUsed] = useState('');
  const [majorPainPoints, setMajorPainPoints] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // UI Flow State
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessOptimizerOutput | null>(null);
  const [activeModel, setActiveModel] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>('Draft');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAdvancedInputs, setShowAdvancedInputs] = useState(true);

  // Restore initialSession if provided
  useEffect(() => {
    if (initialSession && initialSession.type === 'process_optimizer' && initialSession.processOptimizerData) {
      const data = initialSession.processOptimizerData;
      setProcessName(data.input.processName || '');
      setProcessDescription(data.input.processDescription || '');
      if (data.input.businessArea) setBusinessArea(data.input.businessArea as ProcessBusinessArea);
      if (data.input.approximateVolume) setApproximateVolume(data.input.approximateVolume as ProcessVolume);
      if (data.input.frequency) setFrequency(data.input.frequency as ProcessFrequency);
      if (data.input.currentProcessingTimeMinutes !== undefined) {
        setCurrentProcessingTimeMinutes(data.input.currentProcessingTimeMinutes);
      }
      if (data.input.numberOfPeopleInvolved !== undefined) {
        setNumberOfPeopleInvolved(data.input.numberOfPeopleInvolved);
      }
      setSystemsUsed(data.input.systemsUsed || '');
      setMajorPainPoints(data.input.majorPainPoints || '');
      setAdditionalContext(data.input.additionalContext || '');

      setResult(data.result);
      setCurrentSessionId(initialSession.id);
      setActiveModel(initialSession.metadata?.modelUsed || 'gemini-flash');
      setSaveStatus('Session saved');
    }
  }, [initialSession]);

  const handleSelectSample = (sample: typeof SAMPLE_PROCESSES[0]) => {
    setProcessName(sample.name);
    setProcessDescription(sample.description);
    setBusinessArea(sample.businessArea);
    setApproximateVolume(sample.volume);
    setFrequency(sample.frequency);
    setCurrentProcessingTimeMinutes(sample.timeMinutes);
    setNumberOfPeopleInvolved(sample.people);
    setSystemsUsed(sample.systems);
    setMajorPainPoints(sample.painPoints);
    setAdditionalContext(sample.context);
    setError(null);
    setSaveStatus('Draft');
  };

  const handleReset = () => {
    setProcessName('');
    setProcessDescription('');
    setBusinessArea('Branch Banking');
    setApproximateVolume('Medium');
    setFrequency('Daily');
    setCurrentProcessingTimeMinutes(25);
    setNumberOfPeopleInvolved(3);
    setSystemsUsed('');
    setMajorPainPoints('');
    setAdditionalContext('');
    setResult(null);
    setError(null);
    setCurrentSessionId(null);
    setSaveStatus('Draft');
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    const md = `# Process Optimization Assessment: ${result.processName}
**Governance Notice:** ADVISORY ONLY. Banker and management review required. Does not authorize automation or change policy.

## Executive Summary
${result.executiveSummary}

## Current-State Analysis
- **Steps:**
${result.currentState.steps.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}
- **Bottlenecks:**
${result.currentState.bottlenecks.map((b) => `  - ${b}`).join('\n')}
- **Manual Activities:**
${result.currentState.manualActivities.map((m) => `  - ${m}`).join('\n')}
- **Systems Used:**
${result.currentState.systems.map((sys) => `  - ${sys}`).join('\n')}

## Opportunities Identified
### Generative AI Opportunities
${result.opportunityAssessment.genAI.map((g) => `- **${g.opportunity}** (Complexity: ${g.complexity})\n  *Expected Benefit:* ${g.expectedBenefit}\n  *Human Oversight:* ${g.humanInvolvement}`).join('\n\n')}

### Traditional Automation Opportunities
${result.opportunityAssessment.traditionalAutomation.map((t) => `- **${t.opportunity}** (Complexity: ${t.complexity})\n  *Expected Benefit:* ${t.expectedBenefit}\n  *Human Oversight:* ${t.humanInvolvement}`).join('\n\n')}

### Workflow Redesign Opportunities
${result.opportunityAssessment.workflowRedesign.map((w) => `- **${w.opportunity}** (Complexity: ${w.complexity})\n  *Expected Benefit:* ${w.expectedBenefit}\n  *Human Oversight:* ${w.humanInvolvement}`).join('\n\n')}

## Future-State Process & Controls
- **Steps:**
${result.futureState.steps.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}
- **Human-in-the-Loop Controls:**
${result.futureState.humanInTheLoopControls.map((c) => `  - ${c}`).join('\n')}
- **Control Checkpoints:**
${result.futureState.controlPoints.map((cp) => `  - ${cp}`).join('\n')}

## Impact Assessment (Illustrative Estimates)
- **Time Saving Potential:** ${result.impactAssessment.timeSavingPotential}
- **Cost Saving Potential:** ${result.impactAssessment.costSavingPotential}
- **Customer Experience:** ${result.impactAssessment.customerExperienceImpact}
- **Employee Experience:** ${result.impactAssessment.employeeExperienceImpact}
- **Error Reduction:** ${result.impactAssessment.errorReductionPotential}

## Risk Assessment
${result.riskAssessment.map((r) => `- **Risk [${r.severity}]:** ${r.risk}\n  *Mitigation:* ${r.mitigation}`).join('\n\n')}

## Recommended Pilot & Roadmap
**Pilot Approach:** ${result.implementationAssessment.recommendedPilot}
- **Day 30:** ${result.implementationAssessment.timelineSuggestions?.day30?.join('; ') || 'Baseline pilot setup'}
- **Day 60:** ${result.implementationAssessment.timelineSuggestions?.day60?.join('; ') || 'Pilot execution and feedback'}
- **Day 90:** ${result.implementationAssessment.timelineSuggestions?.day90?.join('; ') || 'Governance review and rollout plan'}

## Governance Reminders
${result.governanceReminders.map((gr) => `- ${gr}`).join('\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `process-optimization-${result.processName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const persistSession = async (
    inputPayload: ProcessOptimizerRequest,
    outputData: ProcessOptimizerOutput,
    modelName: string
  ) => {
    if (!user) return;
    setSaveStatus('Saving...');
    try {
      const sessionId = currentSessionId || `proc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const sessionToSave: InteractionSession = {
        id: sessionId,
        userId: user.uid,
        type: 'process_optimizer',
        title: inputPayload.processName || 'Process Optimization Assessment',
        summary: outputData.executiveSummary?.substring(0, 180) || 'Process improvement & AI automation assessment',
        processOptimizerData: {
          input: inputPayload,
          result: outputData,
        },
        metadata: {
          modelUsed: modelName,
          processName: inputPayload.processName,
          businessArea: inputPayload.businessArea,
          isHighRiskProcess: outputData.isHighRiskProcess,
          generatedAt: new Date().toISOString(),
        },
        createdAt: initialSession?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveInteraction(user.uid, sessionToSave, !currentSessionId);
      setCurrentSessionId(sessionId);
      setSaveStatus('Session saved');
      if (onSessionUpdated) {
        onSessionUpdated(sessionToSave);
      }
    } catch (saveErr) {
      console.error('Failed to auto-save process optimizer session:', saveErr);
      setSaveStatus('Assessment generated — not saved');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processName.trim()) {
      setError('Please provide a process name.');
      return;
    }
    if (!processDescription.trim() || processDescription.trim().length < 10) {
      setError('Please describe the operational process steps in detail (at least 10 characters).');
      return;
    }

    // Client-side sensitive data check
    const combined = `${processName} ${processDescription} ${systemsUsed} ${majorPainPoints} ${additionalContext}`;
    if (detectSensitiveData(combined)) {
      setError('Potential sensitive financial data (e.g. credit card PAN, SSN, or password) detected. Please remove confidential information before submitting.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setSaveStatus('Analyzing...');

    const payload: ProcessOptimizerRequest = {
      processName: processName.trim(),
      processDescription: processDescription.trim(),
      businessArea,
      approximateVolume,
      frequency,
      currentProcessingTimeMinutes: typeof currentProcessingTimeMinutes === 'number' ? currentProcessingTimeMinutes : undefined,
      numberOfPeopleInvolved: typeof numberOfPeopleInvolved === 'number' ? numberOfPeopleInvolved : undefined,
      systemsUsed: systemsUsed.trim() || undefined,
      majorPainPoints: majorPainPoints.trim() || undefined,
      additionalContext: additionalContext.trim() || undefined,
    };

    try {
      const response = await generateProcessOptimizerAnalysis(payload);
      setResult(response.result);
      setActiveModel(response.model);
      setSaveStatus('Assessment generated');

      // Auto-save session
      await persistSession(payload, response.result, response.model);
    } catch (err: unknown) {
      console.error('Process Optimizer generation failed:', err);
      const msg = err instanceof AIServiceError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'An error occurred while analyzing the banking process.';
      setError(msg);
      setSaveStatus('Draft');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Process Optimizer</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                  LIVE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/50">
                  Phase 5B
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Identify operational bottlenecks, classify GenAI vs. traditional automation opportunities, and design future-state workflows with human-in-the-loop controls.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Session Save Status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Save className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{saveStatus}</span>
            </div>

            {onNavigateToHistory && (
              <button
                id="process-optimizer-history-btn"
                onClick={onNavigateToHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer border border-slate-700/60"
              >
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Saved Sessions</span>
              </button>
            )}

            <button
              id="process-optimizer-reset-btn"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer border border-slate-700/60"
            >
              New Process
            </button>
          </div>
        </div>

        {/* Governance & Safety Notice */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-400 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-300">Enterprise Process Advisory Notice</p>
            <p className="leading-relaxed">
              <strong className="text-slate-200">Advisory Blueprint Only:</strong> This tool assists in identifying potential automation and redesign opportunities. The AI does not authorize changes to bank policy or autonomously execute transactions. Do not enter confidential customer PII, account numbers, or passwords.
            </p>
          </div>
        </div>

        {/* Quick-Start Synthetic Templates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick-Start Synthetic Banking Scenarios:</span>
            </span>
            <span className="text-[11px] text-slate-500">Select any scenario to pre-populate realistic operational data</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {SAMPLE_PROCESSES.map((sample, idx) => (
              <button
                key={idx}
                id={`sample-process-btn-${idx}`}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/50 text-left transition cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-800/40">
                    {sample.businessArea}
                  </span>
                  <p className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-1">
                    {sample.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-2 mt-auto">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>~{sample.timeMinutes}m</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h4 className="font-bold text-white text-base flex items-center gap-2">
            <Workflow className="w-4 h-4 text-cyan-400" />
            <span>Operational Process Specification</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Describe the manual banking workflow, systems used, and pain points to receive an AI optimization blueprint.
          </p>
        </div>

        {/* Process Name & Business Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <span>Process Name</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              id="process-name-input"
              type="text"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="e.g. Customer Address Change & Signature Verification"
              maxLength={200}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Business Area</label>
            <select
              id="business-area-select"
              value={businessArea}
              onChange={(e) => setBusinessArea(e.target.value as ProcessBusinessArea)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 transition"
            >
              {BUSINESS_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Process Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <span>Current Process Steps & Description</span>
              <span className="text-red-400">*</span>
            </label>
            <span className="text-[10px] text-slate-500">{processDescription.length} / 30,000 chars</span>
          </div>
          <textarea
            id="process-description-textarea"
            value={processDescription}
            onChange={(e) => setProcessDescription(e.target.value)}
            placeholder="Describe the current operational process step-by-step. What triggers it? Who performs each step? What systems are logged into? Where are handoffs or approvals required?"
            rows={6}
            maxLength={30000}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition leading-relaxed font-mono"
          />
        </div>

        {/* Operational Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Processing Time</span>
            </label>
            <div className="relative">
              <input
                id="processing-time-input"
                type="number"
                min={0}
                max={100000}
                value={currentProcessingTimeMinutes}
                onChange={(e) => setCurrentProcessingTimeMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="25"
                className="w-full px-3.5 py-2.5 pr-12 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">mins</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Staff Involved</span>
            </label>
            <input
              id="people-involved-input"
              type="number"
              min={0}
              max={10000}
              value={numberOfPeopleInvolved}
              onChange={(e) => setNumberOfPeopleInvolved(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="3"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Volume</label>
            <select
              id="volume-select"
              value={approximateVolume}
              onChange={(e) => setApproximateVolume(e.target.value as ProcessVolume)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {VOLUMES.map((v) => (
                <option key={v} value={v}>
                  {v} Volume
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Frequency</label>
            <select
              id="frequency-select"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as ProcessFrequency)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Operational Fields */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            {showAdvancedInputs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Additional Operational Systems & Bottleneck Details</span>
          </button>

          {showAdvancedInputs && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Systems & Portals Used</label>
                <input
                  id="systems-used-input"
                  type="text"
                  value={systemsUsed}
                  onChange={(e) => setSystemsUsed(e.target.value)}
                  placeholder="e.g. Core Ledger, CRM, Document Archival, Outlook"
                  maxLength={1000}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Major Pain Points & Bottlenecks</label>
                <input
                  id="pain-points-input"
                  type="text"
                  value={majorPainPoints}
                  onChange={(e) => setMajorPainPoints(e.target.value)}
                  placeholder="e.g. Swivel-chair data entry, signature card mismatch wait"
                  maxLength={5000}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Additional Context / Compliance Notes</label>
                <input
                  id="additional-context-input"
                  type="text"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="e.g. Mandatory dual-control maker-checker policy"
                  maxLength={5000}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-slate-500" />
            <span>Evaluates current-state, identifies bottlenecks, and suggests GenAI vs. traditional automation.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="process-optimizer-submit-btn"
              type="submit"
              disabled={analyzing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-cyan-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Process with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Process Optimization Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Output Display Section */}
      {result && (
        <div className="space-y-6">
          {/* High-Risk Process Warning Banner */}
          {result.isHighRiskProcess && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-600 text-amber-200 space-y-2 shadow-xl">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <span>HIGH-RISK PROCESS ALERT — MANDATORY HUMAN DECISIONING</span>
              </div>
              <p className="text-xs text-amber-200 leading-relaxed">
                This process involves critical regulatory or financial decisioning ({result.highRiskTriggers?.join(', ') || 'Sensitive Determinations'}). 
                The AI may assist with research, summarization, and data preparation, but <strong>must NEVER autonomously execute decisions</strong>. Mandatory human-in-the-loop approval is strictly required by banking governance.
              </p>
            </div>
          )}

          {/* Results Header & Export Tools */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-semibold">
                  GENERATED WITH {activeModel.toUpperCase()}
                </span>
                <h3 className="font-bold text-lg text-white mt-1">{result.processName}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="copy-assessment-btn"
                  onClick={() => handleCopyText(JSON.stringify(result, null, 2), 'full_json')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer border border-slate-700"
                >
                  {copiedKey === 'full_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'full_json' ? 'JSON Copied' : 'Copy JSON'}</span>
                </button>

                <button
                  id="export-markdown-btn"
                  onClick={handleExportMarkdown}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-cyan-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Blueprint (.md)</span>
                </button>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Executive Transformation Summary
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{result.executiveSummary}</p>
            </div>
          </div>

          {/* Process Flow Maps: Current vs Future State */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current State Map */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Current-State Process Flow</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                  As-Is Workflow
                </span>
              </div>

              {/* Numbered Steps */}
              <div className="space-y-3">
                {result.currentState.steps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>

              {/* Identified Bottlenecks & Manual Activities */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Identified Bottlenecks & Rework Points:</span>
                  </span>
                  <ul className="space-y-1">
                    {result.currentState.bottlenecks.concat(result.currentState.reworkPoints).slice(0, 4).map((b, idx) => (
                      <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Future State Map */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Target Future-State Process</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                  To-Be Workflow
                </span>
              </div>

              {/* Numbered Future Steps */}
              <div className="space-y-3">
                {result.futureState.steps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-cyan-900/30 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>

              {/* Mandatory Human-in-the-Loop Controls */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Mandatory Human-in-the-Loop Checkpoints:</span>
                  </span>
                  <ul className="space-y-1">
                    {result.futureState.humanInTheLoopControls.map((c, idx) => (
                      <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunity Assessment (Categorized by GENAI vs TRADITIONAL vs REDESIGN) */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Opportunity Classification & Solution Architecture</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Rigorous categorization distinguishing Generative AI capabilities from deterministic automation and workflow restructuring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* GenAI Opportunities */}
              <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-purple-900/40">
                <div className="flex items-center gap-2 font-bold text-sm text-purple-300 border-b border-purple-900/30 pb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Generative AI (GenAI)</span>
                </div>
                <div className="space-y-3">
                  {result.opportunityAssessment.genAI.map((opp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-semibold text-xs text-slate-200 leading-snug">{opp.opportunity}</h5>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          opp.complexity === 'LOW' ? 'bg-emerald-950 text-emerald-300' :
                          opp.complexity === 'MEDIUM' ? 'bg-amber-950 text-amber-300' : 'bg-red-950 text-red-300'
                        }`}>
                          {opp.complexity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{opp.expectedBenefit}</p>
                      <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{opp.humanInvolvement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traditional Automation */}
              <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-blue-900/40">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-300 border-b border-blue-900/30 pb-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>Deterministic Automation</span>
                </div>
                <div className="space-y-3">
                  {result.opportunityAssessment.traditionalAutomation.map((opp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-semibold text-xs text-slate-200 leading-snug">{opp.opportunity}</h5>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          opp.complexity === 'LOW' ? 'bg-emerald-950 text-emerald-300' :
                          opp.complexity === 'MEDIUM' ? 'bg-amber-950 text-amber-300' : 'bg-red-950 text-red-300'
                        }`}>
                          {opp.complexity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{opp.expectedBenefit}</p>
                      <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{opp.humanInvolvement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Redesign */}
              <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-emerald-900/40">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-300 border-b border-emerald-900/30 pb-2">
                  <Workflow className="w-4 h-4 text-emerald-400" />
                  <span>Workflow Redesign</span>
                </div>
                <div className="space-y-3">
                  {result.opportunityAssessment.workflowRedesign.map((opp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-semibold text-xs text-slate-200 leading-snug">{opp.opportunity}</h5>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          opp.complexity === 'LOW' ? 'bg-emerald-950 text-emerald-300' :
                          opp.complexity === 'MEDIUM' ? 'bg-amber-950 text-amber-300' : 'bg-red-950 text-red-300'
                        }`}>
                          {opp.complexity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{opp.expectedBenefit}</p>
                      <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{opp.humanInvolvement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Impact Estimation (Honest & Illustrative) */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-base">Impact Assessment</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
                  Illustrative Estimates
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Requires pilot benchmarking — not guaranteed savings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Time Savings</span>
                <p className="text-xs text-slate-200 font-medium leading-snug">{result.impactAssessment.timeSavingPotential}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Cost Savings</span>
                <p className="text-xs text-slate-200 font-medium leading-snug">{result.impactAssessment.costSavingPotential}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Customer Experience</span>
                <p className="text-xs text-slate-200 font-medium leading-snug">{result.impactAssessment.customerExperienceImpact}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">Employee Experience</span>
                <p className="text-xs text-slate-200 font-medium leading-snug">{result.impactAssessment.employeeExperienceImpact}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Error Reduction</span>
                <p className="text-xs text-slate-200 font-medium leading-snug">{result.impactAssessment.errorReductionPotential}</p>
              </div>
            </div>

            {/* Assumptions */}
            {result.impactAssessment.assumptions && result.impactAssessment.assumptions.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300">Estimation Assumptions:</span>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  {result.impactAssessment.assumptions.map((assump, idx) => (
                    <li key={idx}>{assump}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Implementation Blueprint & Pilot Roadmap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Implementation Details */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Implementation & Pilot Roadmap</span>
                </h4>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  result.implementationAssessment.complexity === 'LOW' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  result.implementationAssessment.complexity === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-red-950 text-red-300 border border-red-800'
                }`}>
                  {result.implementationAssessment.complexity} COMPLEXITY
                </span>
              </div>

              {/* Recommended Pilot */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-xs font-semibold text-cyan-300">Recommended Pilot Approach:</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{result.implementationAssessment.recommendedPilot}</p>
              </div>

              {/* 30/60/90 Day Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Days 1–30</span>
                  <ul className="space-y-1">
                    {(result.implementationAssessment.timelineSuggestions?.day30 || ['Intake standard setup', 'Pilot team kickoff']).map((t, idx) => (
                      <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                        <span className="text-cyan-400">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Days 31–60</span>
                  <ul className="space-y-1">
                    {(result.implementationAssessment.timelineSuggestions?.day60 || ['Branch pilot deployment', 'Metric evaluation']).map((t, idx) => (
                      <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                        <span className="text-blue-400">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Days 61–90</span>
                  <ul className="space-y-1">
                    {(result.implementationAssessment.timelineSuggestions?.day90 || ['Operational Risk review', 'Rollout expansion']).map((t, idx) => (
                      <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                        <span className="text-purple-400">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Risk & Governance Reminders */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Risk Mitigation & Controls</span>
                </h4>
              </div>

              <div className="space-y-3">
                {result.riskAssessment.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-800/40">
                        {item.severity} RISK
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">{item.risk}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed"><strong className="text-slate-300">Mitigation:</strong> {item.mitigation}</p>
                  </div>
                ))}
              </div>

              {/* Governance Bullet List */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-300">Mandatory Governance Requirements:</span>
                <ul className="space-y-1">
                  {result.governanceReminders.slice(0, 3).map((g, idx) => (
                    <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-emerald-400">✓</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProcessOptimizer;
