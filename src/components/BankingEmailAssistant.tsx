import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  EmailAssistantRequest,
  EmailAssistantOutput,
  InteractionSession,
  CustomerSegmentType,
  EmailPurposeType,
  DesiredOutcomeType,
} from '../types';
import { generateEmailAssistantAnalysis, detectSensitiveData, AIServiceError } from '../services/aiService';
import { saveInteraction } from '../services/interactionService';
import {
  Mail,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Send,
  ShieldCheck,
  FileText,
  HelpCircle,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  History,
  Edit2,
  XCircle,
  Save,
  ShieldAlert,
  ListOrdered,
  Layers,
} from 'lucide-react';

interface BankingEmailAssistantProps {
  initialSession?: InteractionSession | null;
  onSessionUpdated?: (session: InteractionSession) => void;
  onNavigateToHistory?: () => void;
}

// 5 Specific Synthetic Enterprise Banking Scenarios
const SAMPLE_SCENARIOS = [
  {
    title: 'Delayed debit card replacement',
    segment: 'Retail Banking' as const,
    purpose: 'Card Issue' as const,
    outcome: 'Resolve issue' as const,
    context: 'Synthetic scenario: Customer ordered a replacement debit card 8 business days ago. Standard expedited shipping is 3-5 days. Customer has an upcoming domestic business trip.',
    email: `Subject: Where is my replacement debit card? Traveling in 2 days\n\nDear Support Team,\n\nI requested a replacement debit card 8 business days ago after my previous card chipped, and the representative said it would arrive within 3 to 5 business days. I still haven't received it in the mail, and I am traveling out of state for work in two days.\n\nCan you please check the tracking status or issue an emergency temporary card at my local branch? I need access to my checking account while traveling.\n\nThank you,\nAlex Rivera`,
  },
  {
    title: 'Unexpected account fee',
    segment: 'Retail Banking' as const,
    purpose: 'Fee/Charge Question' as const,
    outcome: 'Resolve issue' as const,
    context: 'Synthetic scenario: Customer incurred a $12 monthly maintenance fee. Checking account balance fell below $1,500 minimum threshold for 3 days between bill payment and direct deposit.',
    email: `Subject: Unfair $12 monthly maintenance fee charged to my checking account\n\nTo Customer Care,\n\nI noticed a $12 monthly service charge on my checking account statement from yesterday. I have been banking with your institution for over four years and always maintain direct deposit. My balance briefly dipped after an emergency medical bill, but was restored within two days.\n\nI would like to request a review of this charge and a courtesy reversal. Please let me know how to proceed.\n\nBest regards,\nSarah Jenkins`,
  },
  {
    title: 'International wire inquiry',
    segment: 'Small Business' as const,
    purpose: 'Transaction Issue' as const,
    outcome: 'Information only' as const,
    context: 'Synthetic scenario: Small business client is preparing to wire $38,500 USD to an equipment supplier in Germany. Wants to confirm SWIFT cutoffs, intermediary bank routing fees, and dual-authorization limits.',
    email: `Subject: International wire transfer requirements & cutoff time to Germany\n\nHello Commercial Banking Team,\n\nOur manufacturing firm needs to send an international commercial wire payment of approximately $38,500 USD to our supplier in Frankfurt, Germany tomorrow morning. \n\nCould you please confirm your daily international wire cutoff time, expected intermediary processing fees, and whether our business portal requires dual-signoff for wire transactions above $25,000? We want to avoid any delays with customs clearance.\n\nWarm regards,\nMarcus Vance\nOperations Director, Vance Precision Components LLC`,
  },
  {
    title: 'Digital banking access issue',
    segment: 'Contact Center' as const,
    purpose: 'Account Access' as const,
    outcome: 'Resolve issue' as const,
    context: 'Synthetic scenario: User repeatedly locked out after biometric login failed on updated mobile app version. Multi-factor authentication SMS is not arriving.',
    email: `Subject: Locked out of mobile banking app - 2FA code not arriving\n\nHelpdesk Team,\n\nSince updating the mobile app this morning, my biometric face recognition is failing, and when I try logging in with my username, the two-factor authentication verification code never arrives on my mobile phone. I have attempted three times and now see an account lockout warning.\n\nI need to transfer funds to cover an auto-debit today. Can someone help reset my digital banking access and verify my contact number on file?\n\nThank you,\nElena Rostova`,
  },
  {
    title: 'Customer complaint escalation',
    segment: 'Affluent' as const,
    purpose: 'Complaint' as const,
    outcome: 'Escalate' as const,
    context: 'Synthetic scenario: Private client has made three unresolved calls regarding an uncredited wire deposit from an escrow settlement. Mentions escalating to consumer regulatory bodies if not resolved today.',
    email: `Subject: FORMAL COMPLAINT: Third attempt regarding uncredited escrow transfer ($65,000)\n\nAttention: Branch Management & Client Relations,\n\nI am writing to formally express my extreme dissatisfaction with the lack of resolution regarding a $65,000 escrow transfer sent to my wealth management account last Thursday. I have called telephone support on three separate occasions and received conflicting explanations with zero follow-through.\n\nThis delay is jeopardizing my real estate closing tomorrow. If this matter is not immediately escalated to a senior manager and confirmed today, I will have no choice but to file a formal complaint with the Consumer Financial Protection Bureau and review our entire banking relationship.\n\nSincerely,\nRichard Sterling\nSterling Holdings Group`,
  },
];

type SaveStatusType =
  | 'Draft'
  | 'Analyzing...'
  | 'Response generated'
  | 'Saving...'
  | 'Session saved'
  | 'Response generated — not saved';

export const BankingEmailAssistant: React.FC<BankingEmailAssistantProps> = ({
  initialSession,
  onSessionUpdated,
  onNavigateToHistory,
}) => {
  const { user } = useAuth();

  // Form Input States
  const [emailContent, setEmailContent] = useState('');
  const [customerSegment, setCustomerSegment] = useState<CustomerSegmentType | 'Other'>('Retail Banking');
  const [emailPurpose, setEmailPurpose] = useState<EmailPurposeType | 'Other'>('Complaint');
  const [desiredOutcome, setDesiredOutcome] = useState<DesiredOutcomeType>('Resolve issue');
  const [additionalContext, setAdditionalContext] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Analysis & Output States
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<EmailAssistantOutput | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [activeDraftTab, setActiveDraftTab] = useState<'primary' | 'alternative'>('primary');
  const [editedDraft, setEditedDraft] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // Status & UI States
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>('Draft');
  const [error, setError] = useState<string | null>(null);
  const [sensitiveDataWarning, setSensitiveDataWarning] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Load session if provided
  useEffect(() => {
    if (initialSession && initialSession.type === 'email_assistant' && initialSession.emailAssistantData) {
      const data = initialSession.emailAssistantData;
      setCurrentSessionId(initialSession.id);
      setEmailContent(data.input.emailContent || '');
      if (data.input.customerSegment) setCustomerSegment(data.input.customerSegment as any);
      if (data.input.emailPurpose) setEmailPurpose(data.input.emailPurpose as any);
      if (data.input.desiredOutcome) setDesiredOutcome(data.input.desiredOutcome as any);
      if (data.input.additionalContext) setAdditionalContext(data.input.additionalContext);

      setAnalysisResult(data.result);
      setEditedDraft(data.result.draftResponse);
      setModelUsed(initialSession.metadata?.modelUsed || 'gemini-flash-latest');
      setSaveStatus('Session saved');
      setError(null);
    }
  }, [initialSession]);

  // Real-time sensitive data checking (Client-side zero-leakage check)
  useEffect(() => {
    const combined = `${emailContent} ${additionalContext}`;
    if (detectSensitiveData(combined)) {
      setSensitiveDataWarning(
        'ENTERPRISE SECURITY ALERT: Potential sensitive banking information (credit card PANs, SSNs, passwords, PINs, OTPs, or authentication credentials) detected. Please redact before analyzing.'
      );
    } else {
      setSensitiveDataWarning(null);
    }
  }, [emailContent, additionalContext]);

  const handleApplySample = (sample: typeof SAMPLE_SCENARIOS[0]) => {
    setEmailContent(sample.email);
    setCustomerSegment(sample.segment);
    setEmailPurpose(sample.purpose);
    setDesiredOutcome(sample.outcome);
    setAdditionalContext(sample.context);
    setShowAdvancedOptions(true);
    setError(null);
    setSaveStatus('Draft');
  };

  const handleClearEmailInput = () => {
    setEmailContent('');
    setSaveStatus(analysisResult ? 'Response generated' : 'Draft');
  };

  const handleStartNewEmail = () => {
    setEmailContent('');
    setAdditionalContext('');
    setAnalysisResult(null);
    setEditedDraft('');
    setCurrentSessionId(null);
    setError(null);
    setSaveStatus('Draft');
    setIsEditingDraft(false);
  };

  const handleAnalyzeEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailContent.trim()) {
      setError('Please provide the customer email content to analyze.');
      return;
    }

    if (sensitiveDataWarning) {
      setError('Sensitive banking information detected. Remove confidential customer credentials and card numbers before submitting.');
      return;
    }

    setLoading(true);
    setSaveStatus('Analyzing...');
    setError(null);

    const requestPayload: EmailAssistantRequest = {
      emailContent: emailContent.trim(),
      customerSegment,
      emailPurpose,
      desiredOutcome,
      additionalContext: additionalContext.trim() || undefined,
    };

    try {
      const response = await generateEmailAssistantAnalysis(requestPayload);
      const result = response.result;
      setAnalysisResult(result);
      setEditedDraft(result.draftResponse);
      setModelUsed(response.model);
      setSaveStatus('Response generated');

      // Auto-save session to Firestore
      if (user) {
        setSaveStatus('Saving...');
        const sessionId = currentSessionId || `session_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const sessionPayload: InteractionSession = {
          id: sessionId,
          userId: user.uid,
          type: 'email_assistant',
          title: `Email: ${result.subjectSuggestion || emailPurpose}`,
          summary: result.executiveSummary || `Analysis for ${customerSegment} - ${emailPurpose}`,
          messages: [],
          emailAssistantData: {
            input: requestPayload,
            result,
          },
          metadata: {
            modelUsed: response.model,
            emailType: emailPurpose,
            customerSegment,
            generatedAt: new Date().toISOString(),
          },
          createdAt: initialSession?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          await saveInteraction(user.uid, sessionPayload, !currentSessionId);
          setCurrentSessionId(sessionId);
          setSaveStatus('Session saved');
          if (onSessionUpdated) {
            onSessionUpdated(sessionPayload);
          }
        } catch (saveErr) {
          console.warn('Auto-save to Firestore notice:', saveErr);
          setSaveStatus('Response generated — not saved');
        }
      }
    } catch (err: unknown) {
      console.error('Email assistant generation failed:', err);
      setSaveStatus('Draft');
      if (err instanceof AIServiceError) {
        setError(err.message);
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to analyze customer email. Please try again.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSaveSession = async () => {
    if (!user || !analysisResult) return;
    setSaveStatus('Saving...');
    setError(null);

    const sessionId = currentSessionId || `session_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const updatedResult: EmailAssistantOutput = {
      ...analysisResult,
      draftResponse: editedDraft || analysisResult.draftResponse,
    };

    const sessionPayload: InteractionSession = {
      id: sessionId,
      userId: user.uid,
      type: 'email_assistant',
      title: `Email: ${analysisResult.subjectSuggestion || emailPurpose}`,
      summary: analysisResult.executiveSummary || `Analysis for ${customerSegment}`,
      messages: [],
      emailAssistantData: {
        input: {
          emailContent,
          customerSegment,
          emailPurpose,
          desiredOutcome,
          additionalContext,
        },
        result: updatedResult,
      },
      metadata: {
        modelUsed: modelUsed || 'gemini-flash-latest',
        emailType: emailPurpose,
        customerSegment,
        generatedAt: new Date().toISOString(),
      },
      createdAt: initialSession?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveInteraction(user.uid, sessionPayload, !currentSessionId);
      setCurrentSessionId(sessionId);
      setAnalysisResult(updatedResult);
      setIsEditingDraft(false);
      setSaveStatus('Session saved');
      if (onSessionUpdated) {
        onSessionUpdated(sessionPayload);
      }
    } catch (err) {
      console.error('Manual save failed:', err);
      setSaveStatus('Response generated — not saved');
      setError('Failed to save session to Firestore. Click "Retry Save" to try again.');
    }
  };

  const handleCopyDraft = async () => {
    const textToCopy = isEditingDraft
      ? editedDraft
      : activeDraftTab === 'primary'
      ? (analysisResult?.draftResponse || '')
      : (analysisResult?.alternativeResponse || '');
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    }
  };

  const handleCopySummary = async () => {
    if (!analysisResult) return;
    const summaryText = `EXECUTIVE EMAIL ANALYSIS
Subject Suggestion: ${analysisResult.subjectSuggestion}
Executive Summary: ${analysisResult.executiveSummary}
Customer Intent: ${analysisResult.customerIntent}
Sentiment: ${analysisResult.sentiment}
Escalation Status: ${analysisResult.potentialEscalation.required ? 'ESCALATION INDICATOR DETECTED' : 'No Immediate Escalation'} (${analysisResult.potentialEscalation.reason})

KEY ISSUES:
${analysisResult.keyIssues.map((k) => `• ${k}`).join('\n')}

REQUESTED ACTIONS:
${analysisResult.requestedActions.map((r) => `• ${r}`).join('\n')}

MISSING INFORMATION TO VERIFY:
${analysisResult.missingInformation.map((m) => `• ${m}`).join('\n')}

RECOMMENDED BANKER ACTIONS:
${analysisResult.recommendedNextSteps.map((s) => `• ${s}`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (err) {
      console.error('Copy summary failed:', err);
    }
  };

  // Compact session display identifier
  const displaySessionId = currentSessionId
    ? `email-${currentSessionId.replace(/^session_email_/, '').substring(0, 8)}`
    : 'email-unsaved';

  return (
    <div className="space-y-6">
      {/* Module Header & Session Status */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Banking Email Assistant</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  LIVE
                </span>
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  Session: {displaySessionId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Employee Copilot • Summarize inquiries, assess intent, flag escalation indicators, and structure policy-compliant draft responses
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Save Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  saveStatus === 'Session saved'
                    ? 'bg-emerald-400'
                    : saveStatus === 'Analyzing...' || saveStatus === 'Saving...'
                    ? 'bg-blue-400 animate-pulse'
                    : saveStatus === 'Response generated — not saved'
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
              <span
                className={
                  saveStatus === 'Session saved'
                    ? 'text-emerald-400 font-semibold'
                    : saveStatus === 'Response generated — not saved'
                    ? 'text-amber-400 font-semibold'
                    : 'text-slate-300'
                }
              >
                {saveStatus}
              </span>
              {saveStatus === 'Response generated — not saved' && (
                <button
                  onClick={handleManualSaveSession}
                  className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-700 underline cursor-pointer"
                >
                  Retry Save
                </button>
              )}
            </div>

            {onNavigateToHistory && (
              <button
                id="email-assistant-history-btn"
                onClick={onNavigateToHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-slate-300 transition cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Session History</span>
              </button>
            )}

            <button
              id="email-assistant-new-btn"
              onClick={handleStartNewEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start New Email</span>
            </button>
          </div>
        </div>

        {/* Persistent Enterprise Security & Demo Notices */}
        <div className="space-y-2">
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/70 flex items-start gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <div className="font-bold text-amber-300 uppercase tracking-wide">
                ENTERPRISE BANKING SECURITY:
              </div>
              <p>
                Do not enter real customer PII, account numbers, passwords, card numbers, PINs, OTPs, or confidential banking credentials. Use synthetic or approved enterprise data only.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                <strong className="text-slate-300">DEMO DATA ONLY</strong> — Use synthetic examples. Do not enter real customer information or confidential banking data.
              </span>
            </div>
            <span className="hidden md:inline font-mono text-[10px] text-slate-500">Zero Core Banking Access</span>
          </div>
        </div>

        {/* Quick Synthetic Examples (5 Requested Scenarios) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quick Synthetic Scenarios
            </span>
            <span className="text-[11px] text-slate-500">Click to autofill synthetic banking email</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {SAMPLE_SCENARIOS.map((sample, idx) => (
              <button
                key={idx}
                id={`sample-scenario-btn-${idx}`}
                type="button"
                onClick={() => handleApplySample(sample)}
                className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition text-left space-y-1 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition line-clamp-1">
                    {sample.title}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 font-mono">
                    {sample.segment} • {sample.purpose}
                  </div>
                </div>
                <div className="flex items-center justify-end text-[10px] text-slate-500 group-hover:text-blue-400 font-medium pt-1">
                  <span>Load Sample</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Input Form / Right Analysis Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleAnalyzeEmail}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
          >
            {/* Header with Character Counter & Clear Button */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-sm text-white">Paste a customer email or synthetic example</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  {emailContent.length} / 30,000 chars
                </span>
                {emailContent.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearEmailInput}
                    className="text-[11px] text-slate-400 hover:text-red-400 transition cursor-pointer flex items-center gap-1"
                    title="Clear email text"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Email Body Textarea */}
            <div className="space-y-1.5">
              <textarea
                id="email-content-textarea"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={10}
                placeholder="Paste a customer email or synthetic example here..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition font-sans"
                required
              />
            </div>

            {/* Sensitive Data Warning */}
            {sensitiveDataWarning && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-700 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{sensitiveDataWarning}</span>
              </div>
            )}

            {/* Context Controls (Optional Fields) */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                id="toggle-advanced-options-btn"
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full p-3 bg-slate-950/60 hover:bg-slate-950 flex items-center justify-between text-xs font-semibold text-slate-300 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Context Controls (Optional Parameters)</span>
                </div>
                {showAdvancedOptions ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showAdvancedOptions && (
                <div className="p-4 bg-slate-950/40 border-t border-slate-800 space-y-3.5 text-xs animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Customer Segment */}
                    <div className="space-y-1">
                      <label htmlFor="customer-segment-select" className="block text-[11px] font-medium text-slate-400">
                        Customer Segment
                      </label>
                      <select
                        id="customer-segment-select"
                        value={customerSegment}
                        onChange={(e) => setCustomerSegment(e.target.value as any)}
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Retail Banking">Retail Banking</option>
                        <option value="Affluent">Affluent</option>
                        <option value="Small Business">Small Business</option>
                        <option value="Contact Center">Contact Center</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Email Purpose */}
                    <div className="space-y-1">
                      <label htmlFor="email-purpose-select" className="block text-[11px] font-medium text-slate-400">
                        Email Purpose
                      </label>
                      <select
                        id="email-purpose-select"
                        value={emailPurpose}
                        onChange={(e) => setEmailPurpose(e.target.value as any)}
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Complaint">Complaint</option>
                        <option value="Service Request">Service Request</option>
                        <option value="Product Inquiry">Product Inquiry</option>
                        <option value="Transaction Issue">Transaction Issue</option>
                        <option value="Fee/Charge Question">Fee/Charge Question</option>
                        <option value="Account Access">Account Access</option>
                        <option value="Card Issue">Card Issue</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Desired Outcome */}
                  <div className="space-y-1">
                    <label htmlFor="desired-outcome-select" className="block text-[11px] font-medium text-slate-400">
                      Desired Outcome
                    </label>
                    <select
                      id="desired-outcome-select"
                      value={desiredOutcome}
                      onChange={(e) => setDesiredOutcome(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="Information only">Information only</option>
                      <option value="Resolve issue">Resolve issue</option>
                      <option value="Request documentation">Request documentation</option>
                      <option value="Escalate">Escalate</option>
                      <option value="Follow-up required">Follow-up required</option>
                    </select>
                  </div>

                  {/* Optional Additional Context */}
                  <div className="space-y-1">
                    <label htmlFor="additional-context-input" className="block text-[11px] font-medium text-slate-400">
                      Optional Additional Context (Free Text)
                    </label>
                    <textarea
                      id="additional-context-input"
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      rows={2}
                      placeholder="e.g. Prior interaction notes, client relationship duration, supervisor guidance..."
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Analyze Email Button */}
            <button
              id="analyze-email-submit-btn"
              type="submit"
              disabled={loading || Boolean(sensitiveDataWarning) || !emailContent.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs transition cursor-pointer shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Email with Gemini...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze Email</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: AI Analysis Results (13 Structured Sections) */}
        <div className="lg:col-span-7 space-y-4">
          {!analysisResult && !loading && (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4 shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 mx-auto">
                <Mail className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="font-bold text-white text-base">Awaiting Customer Email</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Paste an incoming customer email or choose one of the quick synthetic scenarios on the left. The assistant will extract intent, identify escalation triggers, check compliance, and generate draft responses.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="p-12 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4 shadow-lg">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Processing Banking Email</h4>
                <p className="text-xs text-slate-400">
                  Synthesizing customer intent, evaluating sentiment, assessing escalation criteria, and formulating policy-compliant draft...
                </p>
              </div>
            </div>
          )}

          {analysisResult && !loading && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Action Toolbar: Copy Summary, Copy Draft, Regenerate, Start New Email, Save Session */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="copy-summary-btn"
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition cursor-pointer border border-slate-700"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Summary Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>

                  <button
                    id="copy-draft-toolbar-btn"
                    type="button"
                    onClick={handleCopyDraft}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition cursor-pointer border border-slate-700"
                  >
                    {copiedDraft ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Draft Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                        <span>Copy Draft</span>
                      </>
                    )}
                  </button>

                  <button
                    id="regenerate-email-btn"
                    type="button"
                    onClick={() => handleAnalyzeEmail()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition cursor-pointer border border-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Regenerate</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="save-session-btn"
                    type="button"
                    onClick={handleManualSaveSession}
                    disabled={saveStatus === 'Saving...'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveStatus === 'Saving...' ? 'Saving...' : 'Save Session'}</span>
                  </button>

                  <button
                    id="start-new-email-btn"
                    type="button"
                    onClick={handleStartNewEmail}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Start New Email</span>
                  </button>
                </div>
              </div>

              {/* 1. Email Summary & Subject Line */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">1. Email Summary</span>
                    {modelUsed && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                        {modelUsed}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    Subject Line Suggestion: <span className="text-blue-300 font-semibold">{analysisResult.subjectSuggestion}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {analysisResult.executiveSummary}
                </p>
              </div>

              {/* 2. Customer Intent & 3. Sentiment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 2. Customer Intent */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-lg">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    2. Customer Intent
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {analysisResult.customerIntent}
                  </p>
                </div>

                {/* 3. Sentiment */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-lg">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    3. Sentiment
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-300 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-xs">
                      {analysisResult.sentiment}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Key Issues & 5. Requested Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 4. Key Issues */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-lg">
                  <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>4. Key Issues</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    {analysisResult.keyIssues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 5. Requested Actions */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-lg">
                  <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
                    <span>5. Requested Actions</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    {analysisResult.requestedActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 6. Potential Escalation */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg ${
                  analysisResult.potentialEscalation.required
                    ? 'bg-amber-950/40 border-amber-700 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                }`}
              >
                {analysisResult.potentialEscalation.required ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 text-xs">
                  <div className="font-bold uppercase tracking-wider text-[11px]">
                    6. Potential Escalation —{' '}
                    {analysisResult.potentialEscalation.required
                      ? 'Potential escalation indicator — banker/supervisor review recommended.'
                      : 'No Immediate Escalation Trigger Detected'}
                  </div>
                  <p className="leading-relaxed text-slate-200">
                    {analysisResult.potentialEscalation.reason}
                  </p>
                </div>
              </div>

              {/* 7. Missing Information & 8. Compliance Considerations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 7. Missing Information */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-lg">
                  <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>7. Missing Information</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    {analysisResult.missingInformation.map((info, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 8. Compliance Considerations */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-lg">
                  <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>8. Compliance Considerations</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    {analysisResult.complianceConsiderations.map((comp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 9. Recommended Banker Actions */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-lg text-xs">
                <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>9. Recommended Banker Actions</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {analysisResult.recommendedNextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 10. Draft Response & 11. Alternative Response */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      id="draft-primary-tab-btn"
                      type="button"
                      onClick={() => {
                        setActiveDraftTab('primary');
                        setEditedDraft(analysisResult.draftResponse);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        activeDraftTab === 'primary'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      10. Draft Response (Empathetic / Primary)
                    </button>
                    <button
                      id="draft-alt-tab-btn"
                      type="button"
                      onClick={() => {
                        setActiveDraftTab('alternative');
                        setEditedDraft(analysisResult.alternativeResponse);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        activeDraftTab === 'alternative'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      11. Alternative Response (Variant Tone)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="edit-draft-toggle-btn"
                      type="button"
                      onClick={() => setIsEditingDraft(!isEditingDraft)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition cursor-pointer border border-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isEditingDraft ? 'Preview View' : 'Edit In-Place'}</span>
                    </button>

                    <button
                      id="copy-draft-btn"
                      type="button"
                      onClick={handleCopyDraft}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-600/20"
                    >
                      {copiedDraft ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Draft</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Draft Content View or Edit */}
                {isEditingDraft ? (
                  <div className="space-y-2">
                    <textarea
                      id="editable-draft-textarea"
                      value={editedDraft}
                      onChange={(e) => setEditedDraft(e.target.value)}
                      rows={12}
                      className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        id="save-draft-changes-btn"
                        type="button"
                        onClick={handleManualSaveSession}
                        disabled={saveStatus === 'Saving...'}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        {saveStatus === 'Saving...' ? 'Saving...' : 'Save Draft Changes to Firestore'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans select-all">
                    {activeDraftTab === 'primary' ? editedDraft || analysisResult.draftResponse : analysisResult.alternativeResponse}
                  </div>
                )}
              </div>

              {/* 12. Follow-Up Actions */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>12. Follow-Up Actions</span>
                </div>

                <div className="space-y-2 text-xs">
                  {analysisResult.followUpActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 13. Human-in-the-Loop / Governance Notice Panel */}
              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-blue-900/60 space-y-3 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>13. HUMAN-IN-THE-LOOP / GOVERNANCE NOTICE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60">
                      DO NOT SEND AUTOMATICALLY
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60">
                      VERIFY POLICY / CUSTOMER INFORMATION BEFORE ACTION
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p className="font-medium text-slate-200">
                    The AI generated this analysis and draft for banker review. The banker remains responsible for validating the content, checking applicable policy, making required edits, and sending the final communication.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {analysisResult.governanceReminder}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
