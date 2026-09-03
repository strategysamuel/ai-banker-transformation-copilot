import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MeetingPrepRequest,
  MeetingPrepBrief,
  InteractionSession,
} from '../types';
import {
  generateMeetingPrep,
  detectSensitiveData,
  AIServiceError,
} from '../services/aiService';
import { saveInteraction } from '../services/interactionService';
import {
  FileText,
  Sparkles,
  Clock,
  Users,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ListOrdered,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  CornerDownRight,
  RotateCcw,
  Save,
  PlusCircle,
} from 'lucide-react';

interface CustomerMeetingPrepProps {
  initialSession?: InteractionSession | null;
  onSessionUpdated?: (session: InteractionSession) => void;
  onNavigateToHistory?: () => void;
}

const CUSTOMER_SEGMENTS = [
  'Retail Banking Customer',
  'Mass Affluent Customer',
  'Small Business Owner',
  'New-to-Bank Customer',
  'Existing Customer',
  'Other',
];

const MEETING_DURATIONS = [
  '15 minutes',
  '30 minutes',
  '45 minutes',
  '60 minutes',
];

const OBJECTIVE_SUGGESTIONS = [
  'Understand customer cash flow and discuss digital banking adoption',
  'Review savings goals and explore liquidity management products',
  'SME working capital line review and credit facility expansion',
  'Resolve recent service concerns and re-establish relationship trust',
  'Annual relationship review and multi-product wallet share expansion',
];

const PRODUCT_SUGGESTIONS = [
  'SME Working Capital Facility',
  'Digital Merchant Cash Collection',
  'High-Yield Commercial Term Deposit',
  'Automated Corporate Payroll & Wire Services',
  'Personal Wealth Management & Treasury Solutions',
];

export const CustomerMeetingPrep: React.FC<CustomerMeetingPrepProps> = ({
  initialSession,
  onSessionUpdated,
  onNavigateToHistory,
}) => {
  const { user } = useAuth();

  // Form State
  const [customerSegment, setCustomerSegment] = useState<string>(
    initialSession?.meetingPrepData?.input.customerSegment || 'Small Business Owner'
  );
  const [customSegment, setCustomSegment] = useState<string>('');
  const [meetingObjective, setMeetingObjective] = useState<string>(
    initialSession?.meetingPrepData?.input.meetingObjective || ''
  );
  const [productService, setProductService] = useState<string>(
    initialSession?.meetingPrepData?.input.productService || ''
  );
  const [customerConcerns, setCustomerConcerns] = useState<string>(
    initialSession?.meetingPrepData?.input.customerConcerns || ''
  );
  const [meetingDuration, setMeetingDuration] = useState<string>(
    initialSession?.meetingPrepData?.input.meetingDuration || '30 minutes'
  );
  const [additionalContext, setAdditionalContext] = useState<string>(
    initialSession?.meetingPrepData?.input.additionalContext || ''
  );

  // Execution & Output State
  const [currentSessionId, setCurrentSessionId] = useState<string>(
    initialSession?.id || `meeting-prep-${Date.now()}`
  );
  const [isNewSession, setIsNewSession] = useState<boolean>(!initialSession);
  const [generatedBrief, setGeneratedBrief] = useState<MeetingPrepBrief | null>(
    initialSession?.meetingPrepData?.brief || null
  );
  const [modelUsed, setModelUsed] = useState<string>(
    initialSession?.metadata?.modelUsed || 'gemini-3.7-flash'
  );

  // Status & Notifications
  const [generating, setGenerating] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'save_error'
  >(initialSession ? 'saved' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [sensitiveWarning, setSensitiveWarning] = useState<string | null>(null);

  // Sync with initialSession prop changes
  useEffect(() => {
    if (initialSession && initialSession.type === 'meeting_prep') {
      setCurrentSessionId(initialSession.id);
      setIsNewSession(false);
      if (initialSession.meetingPrepData) {
        setCustomerSegment(initialSession.meetingPrepData.input.customerSegment || 'Small Business Owner');
        setMeetingObjective(initialSession.meetingPrepData.input.meetingObjective || '');
        setProductService(initialSession.meetingPrepData.input.productService || '');
        setCustomerConcerns(initialSession.meetingPrepData.input.customerConcerns || '');
        setMeetingDuration(initialSession.meetingPrepData.input.meetingDuration || '30 minutes');
        setAdditionalContext(initialSession.meetingPrepData.input.additionalContext || '');
        setGeneratedBrief(initialSession.meetingPrepData.brief);
        setSaveStatus('saved');
      }
    }
  }, [initialSession]);

  // Sensitive data check on inputs
  useEffect(() => {
    const combined = `${meetingObjective} ${productService} ${customerConcerns} ${additionalContext}`;
    if (detectSensitiveData(combined)) {
      setSensitiveWarning(
        'Potential sensitive banking information detected (e.g. card number, SSN, or account credentials). Please use sanitized synthetic data.'
      );
    } else {
      setSensitiveWarning(null);
    }
  }, [meetingObjective, productService, customerConcerns, additionalContext]);

  // Handle Form Submission
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    // Validate inputs
    const finalSegment = customerSegment === 'Other' ? (customSegment.trim() || 'Custom Segment') : customerSegment;

    if (!finalSegment.trim()) {
      setError('Please select or specify a customer segment.');
      return;
    }
    if (!meetingObjective.trim()) {
      setError('Meeting objective is required.');
      return;
    }
    if (!productService.trim()) {
      setError('Product or service focus is required.');
      return;
    }
    if (!customerConcerns.trim()) {
      setError('Customer needs / identified concerns are required.');
      return;
    }
    if (sensitiveWarning) {
      setError('Please remove potential sensitive banking information before generating.');
      return;
    }

    const payload: MeetingPrepRequest = {
      customerSegment: finalSegment.trim(),
      meetingObjective: meetingObjective.trim(),
      productService: productService.trim(),
      customerConcerns: customerConcerns.trim(),
      meetingDuration: meetingDuration.trim(),
      additionalContext: additionalContext.trim() || undefined,
    };

    setGenerating(true);
    setError(null);
    setSaveStatus('idle');

    const sessionId = isNewSession ? `meeting-prep-${Date.now()}` : currentSessionId;
    setCurrentSessionId(sessionId);

    try {
      // 1. Call real backend Gemini Meeting Prep endpoint
      const response = await generateMeetingPrep(payload);
      setGeneratedBrief(response.brief);
      setModelUsed(response.model);

      // 2. Persist to Firestore
      await persistMeetingSession(sessionId, payload, response.brief, response.model);
    } catch (err: unknown) {
      console.error('Meeting Prep Generation Error:', err);
      if (err instanceof AIServiceError) {
        setError(err.message);
      } else {
        setError('Failed to generate Customer Meeting Prep brief. Please check your connection and try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  // Helper to persist to Firestore
  const persistMeetingSession = async (
    sessionId: string,
    inputData: MeetingPrepRequest,
    brief: MeetingPrepBrief,
    modelName: string
  ) => {
    if (!user) return;
    setSaveStatus('saving');

    const sessionPayload: InteractionSession = {
      id: sessionId,
      userId: user.uid,
      type: 'meeting_prep',
      title: brief.meetingTitle || `Customer Meeting Prep — ${inputData.productService}`,
      summary: brief.meetingObjective || inputData.meetingObjective,
      messages: [
        {
          id: `input-${Date.now()}`,
          role: 'user',
          content: `Customer Segment: ${inputData.customerSegment}\nDuration: ${inputData.meetingDuration}\nObjective: ${inputData.meetingObjective}\nProduct: ${inputData.productService}\nConcerns: ${inputData.customerConcerns}`,
          timestamp: new Date().toISOString(),
        },
        {
          id: `brief-${Date.now()}`,
          role: 'assistant',
          content: `# ${brief.meetingTitle}\n\n**Objective**: ${brief.meetingObjective}\n\n## Agenda\n${brief.recommendedAgenda.join('\n')}`,
          timestamp: new Date().toISOString(),
        },
      ],
      meetingPrepData: {
        input: inputData,
        brief,
      },
      metadata: {
        modelUsed: modelName,
        totalTurns: 1,
        topic: 'Customer Meeting Prep',
        customerSegment: inputData.customerSegment,
        meetingDuration: inputData.meetingDuration,
        generatedAt: new Date().toISOString(),
      },
      createdAt: initialSession?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveInteraction(user.uid, sessionPayload, isNewSession);
      setIsNewSession(false);
      setSaveStatus('saved');
      if (onSessionUpdated) {
        onSessionUpdated(sessionPayload);
      }
    } catch (saveErr) {
      console.error('Firestore save failed for meeting prep:', saveErr);
      setSaveStatus('save_error');
    }
  };

  // Handle Retry Save only
  const handleRetrySave = async () => {
    if (!generatedBrief || !user) return;
    const finalSegment = customerSegment === 'Other' ? (customSegment.trim() || 'Custom Segment') : customerSegment;
    const inputPayload: MeetingPrepRequest = {
      customerSegment: finalSegment,
      meetingObjective,
      productService,
      customerConcerns,
      meetingDuration,
      additionalContext: additionalContext || undefined,
    };
    await persistMeetingSession(currentSessionId, inputPayload, generatedBrief, modelUsed);
  };

  // Copy structured brief to clipboard
  const handleCopyBrief = () => {
    if (!generatedBrief) return;

    const formattedText = `CUSTOMER MEETING PREPARATION BRIEF
==================================================
MEETING TITLE: ${generatedBrief.meetingTitle}
OBJECTIVE: ${generatedBrief.meetingObjective}
TARGET SEGMENT: ${customerSegment}
ESTIMATED DURATION: ${meetingDuration}
PRODUCT / SERVICE: ${productService}

RECOMMENDED AGENDA:
${generatedBrief.recommendedAgenda.map((item, idx) => `  ${idx + 1}. ${item}`).join('\n')}

DISCOVERY QUESTIONS:
${generatedBrief.discoveryQuestions.map((q) => `  • ${q}`).join('\n')}

KEY DISCUSSION POINTS:
${generatedBrief.discussionPoints.map((dp) => `  • ${dp}`).join('\n')}

POTENTIAL CUSTOMER CONCERNS & OBJECTIONS:
${generatedBrief.potentialConcerns.map((c) => `  • ${c}`).join('\n')}

SUGGESTED BANKER RESPONSES:
${generatedBrief.suggestedResponses.map((r) => `  • ${r}`).join('\n')}

FOLLOW-UP ACTIONS & NEXT STEPS:
${generatedBrief.followUpActions.map((a) => `  [ ] ${a}`).join('\n')}

GOVERNANCE & COMPLIANCE REMINDERS:
${generatedBrief.governanceReminders.map((g) => `  ! ${g}`).join('\n')}

DISCLAIMER:
AI-generated meeting preparation is advisory. Verify customer-specific facts, product eligibility, pricing, policies, and regulatory requirements using approved bank sources before taking action.
==================================================`;

    navigator.clipboard.writeText(formattedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Start fresh meeting prep
  const handleNewPrep = () => {
    setCurrentSessionId(`meeting-prep-${Date.now()}`);
    setIsNewSession(true);
    setGeneratedBrief(null);
    setMeetingObjective('');
    setProductService('');
    setCustomerConcerns('');
    setAdditionalContext('');
    setSaveStatus('idle');
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Customer Meeting Prep</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-semibold">
                  LIVE • Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate structured, compliant client discovery briefs, time-blocked agendas, and objection strategies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="meeting-prep-new-btn"
              onClick={handleNewPrep}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>New Meeting Prep</span>
            </button>

            {onNavigateToHistory && (
              <button
                id="meeting-prep-history-btn"
                onClick={onNavigateToHistory}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>History</span>
              </button>
            )}
          </div>
        </div>

        {/* Persistent Compliance Notice */}
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-300">Data Privacy Rule: </span>
            Do not enter confidential customer information, account numbers, PANs, passwords, credentials, or other sensitive banking data. Use anonymized or synthetic information only.
          </p>
        </div>
      </div>

      {/* Main Grid: Input Form + Output Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleGenerate}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Meeting Parameters
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {meetingDuration}
              </span>
            </div>

            {/* 1. Customer Segment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Customer Segment</span>
                <span className="text-red-400">*</span>
              </label>
              <select
                id="meeting-customer-segment-select"
                value={customerSegment}
                onChange={(e) => setCustomerSegment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 transition"
              >
                {CUSTOMER_SEGMENTS.map((seg) => (
                  <option key={seg} value={seg}>
                    {seg}
                  </option>
                ))}
              </select>

              {customerSegment === 'Other' && (
                <input
                  id="meeting-custom-segment-input"
                  type="text"
                  value={customSegment}
                  onChange={(e) => setCustomSegment(e.target.value)}
                  placeholder="Specify customer profile..."
                  maxLength={100}
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            {/* 2. Meeting Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Meeting Duration</span>
                <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MEETING_DURATIONS.map((dur) => (
                  <button
                    type="button"
                    key={dur}
                    id={`duration-btn-${dur.replace(/\s+/g, '-')}`}
                    onClick={() => setMeetingDuration(dur)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      meetingDuration === dur
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-600/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Meeting Objective */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Meeting Objective</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {meetingObjective.length}/1000
                </span>
              </div>
              <textarea
                id="meeting-objective-input"
                rows={3}
                value={meetingObjective}
                onChange={(e) => setMeetingObjective(e.target.value)}
                maxLength={1000}
                placeholder="e.g. Conduct annual business cash flow review and introduce digital treasury collections..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition leading-relaxed resize-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Quick Suggestions:</span>
                {OBJECTIVE_SUGGESTIONS.slice(0, 2).map((sug, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setMeetingObjective(sug)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 truncate max-w-full text-left transition cursor-pointer"
                  >
                    {sug.substring(0, 45)}...
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Product / Service Focus */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Product / Service Focus</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {productService.length}/1000
                </span>
              </div>
              <input
                id="meeting-product-service-input"
                type="text"
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                maxLength={1000}
                placeholder="e.g. SME Working Capital Line & Corporate FX Hedging"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRODUCT_SUGGESTIONS.slice(0, 3).map((prod, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setProductService(prod)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition cursor-pointer"
                  >
                    {prod}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Customer Needs & Concerns */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Customer Needs & Known Concerns</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {customerConcerns.length}/5000
                </span>
              </div>
              <textarea
                id="meeting-concerns-input"
                rows={3}
                value={customerConcerns}
                onChange={(e) => setCustomerConcerns(e.target.value)}
                maxLength={5000}
                placeholder="e.g. Customer is concerned about line fees, turnaround speed on approvals, and integration with existing accounting software."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition leading-relaxed resize-none"
              />
            </div>

            {/* 6. Additional Context (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Additional Context (Optional)</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {additionalContext.length}/5000
                </span>
              </div>
              <textarea
                id="meeting-context-input"
                rows={2}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                maxLength={5000}
                placeholder="e.g. 5-year relationship, decision maker is the Managing Director, previous banker transition..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition leading-relaxed resize-none"
              />
            </div>

            {/* Sensitive Data Alert */}
            {sensitiveWarning && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{sensitiveWarning}</span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="meeting-generate-brief-btn"
              type="submit"
              disabled={generating || !!sensitiveWarning}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Meeting Brief with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Customer Meeting Brief</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Generated Structured Brief */}
        <div className="lg:col-span-7 space-y-6">
          {generating ? (
            /* Loading State */
            <div className="p-12 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mx-auto animate-pulse">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Structuring Meeting Strategy...</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Gemini is building your tailored agenda, discovery framework, objection counters, and compliance checkpoints.
                </p>
              </div>
            </div>
          ) : generatedBrief ? (
            /* Structured Brief Display */
            <div className="space-y-5">
              {/* Output Actions Bar */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-white">
                    Generated via <span className="font-mono text-blue-400">{modelUsed}</span>
                  </span>
                  {saveStatus === 'saved' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-medium">
                      Saved to Firestore
                    </span>
                  )}
                  {saveStatus === 'saving' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/50 font-medium">
                      Saving...
                    </span>
                  )}
                  {saveStatus === 'save_error' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50 font-medium">
                      Save Failed (Brief Retained)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {saveStatus === 'save_error' && (
                    <button
                      id="meeting-retry-save-btn"
                      onClick={handleRetrySave}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Retry Save</span>
                    </button>
                  )}

                  <button
                    id="meeting-copy-brief-btn"
                    onClick={handleCopyBrief}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Brief</span>
                      </>
                    )}
                  </button>

                  <button
                    id="meeting-generate-again-btn"
                    onClick={() => {
                      setIsNewSession(true);
                      handleGenerate();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Generate Again</span>
                  </button>
                </div>
              </div>

              {/* Title & Objective Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950/40 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
                  <FileText className="w-4 h-4" />
                  <span>PREPARATION BRIEF</span>
                  <span>•</span>
                  <span>{customerSegment}</span>
                  <span>•</span>
                  <span>{meetingDuration}</span>
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight">
                  {generatedBrief.meetingTitle}
                </h2>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-200 block mb-1">Strategic Objective:</span>
                  {generatedBrief.meetingObjective}
                </div>
              </div>

              {/* Recommended Agenda Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <ListOrdered className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                    Recommended Agenda ({meetingDuration})
                  </h4>
                </div>
                <div className="space-y-2">
                  {generatedBrief.recommendedAgenda.map((agendaItem, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/50 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{agendaItem}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discovery Questions Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                    High-Value Discovery Questions
                  </h4>
                </div>
                <div className="space-y-2">
                  {generatedBrief.discoveryQuestions.map((question, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <span className="text-blue-400 font-bold shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed italic">{question}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussion Points Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                    Key Value Discussion Points
                  </h4>
                </div>
                <div className="space-y-2">
                  {generatedBrief.discussionPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paired Potential Concerns & Suggested Responses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Concerns */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                      Anticipated Concerns
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {generatedBrief.potentialConcerns.map((concern, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-950/10 border border-amber-800/30 text-xs text-amber-200/90 leading-relaxed"
                      >
                        <span className="font-semibold text-amber-300 block mb-0.5">Objection {idx + 1}:</span>
                        {concern}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Responses */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                      Suggested Banker Responses
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {generatedBrief.suggestedResponses.map((resp, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-emerald-950/10 border border-emerald-800/30 text-xs text-emerald-200/90 leading-relaxed"
                      >
                        <span className="font-semibold text-emerald-300 block mb-0.5">Framing {idx + 1}:</span>
                        {resp}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Follow-Up Actions Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                    Follow-Up Action Items & Deliverables
                  </h4>
                </div>
                <div className="space-y-2">
                  {generatedBrief.followUpActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <div className="w-4 h-4 rounded border border-slate-600 mt-0.5 shrink-0 flex items-center justify-center" />
                      <span className="leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Governance & Human Review Reminders */}
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-800/50 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 border-b border-indigo-800/40 pb-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold text-xs text-indigo-200 uppercase tracking-wider">
                    Governance & Mandatory Policy Checks
                  </h4>
                </div>
                <div className="space-y-2">
                  {generatedBrief.governanceReminders.map((reminder, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2.5 text-xs text-indigo-200/90"
                    >
                      <span className="text-indigo-400 font-bold shrink-0 mt-0.5">!</span>
                      <span className="leading-relaxed">{reminder}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advisory Disclaimer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed text-center">
                <span className="font-semibold text-slate-300">Human-in-the-Loop Reminder: </span>
                AI-generated meeting preparation is advisory. Verify customer-specific facts, product eligibility, pricing, policies, and regulatory requirements using approved bank sources before taking action.
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-base">Ready to Prepare Client Meeting</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Fill in the meeting parameters on the left and click <strong>Generate Customer Meeting Brief</strong>. Gemini will produce a complete strategy package.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
