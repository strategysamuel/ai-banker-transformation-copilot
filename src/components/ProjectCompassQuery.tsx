import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Lock,
  Layers,
  CheckCircle2,
  FileText,
  HelpCircle,
  Clock,
  Info,
  CheckSquare,
  Square,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { queryProjectCompass, detectSensitiveData, AIServiceError } from '../services/aiService';
import { ProjectCompassQueryResponse } from '../types/projectCompass';

const SAMPLE_QUERIES = [
  {
    label: 'International Wire Transfer',
    query: 'What are the dual-authorization and verification steps for an international wire transfer?',
  },
  {
    label: 'Fee Waiver Approvals',
    query: 'When is Branch Supervisor approval required for waiving a monthly service fee?',
  },
  {
    label: 'Power of Attorney SOP',
    query: 'What documentation and validation steps are required for a Power of Attorney request?',
  },
  {
    label: 'Dormant Account Reactivation',
    query: 'What is the procedure to reactivate a dormant deposit account?',
  },
  {
    label: 'Complaint Escalation',
    query: 'How should a frontline banker escalate an unresolved regulatory customer complaint?',
  },
  {
    label: 'Out-of-Scope: Mortgage Approval',
    query: 'Can you approve a 30-year fixed rate residential mortgage loan for $450,000?',
  },
  {
    label: 'Out-of-Scope: Account Balance',
    query: 'What is my current checking account balance right now?',
  },
];

export const ProjectCompassQuery: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ProjectCompassQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sensitiveWarning, setSensitiveWarning] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [humanVerified, setHumanVerified] = useState(false);

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSensitiveWarning(detectSensitiveData(val));
    if (error) setError(null);
  };

  const handleSelectSample = (sampleText: string) => {
    setQuery(sampleText);
    setSensitiveWarning(detectSensitiveData(sampleText));
    if (error) setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    if (detectSensitiveData(query)) {
      setSensitiveWarning(true);
      setError('Please remove confidential customer information, account numbers, or card numbers before submitting.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    setHumanVerified(false); // Reset human verification on new query submission

    try {
      const res = await queryProjectCompass({ query: query.trim() });
      setResponse(res);
    } catch (err: unknown) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      } else {
        setError('Failed to process policy query. Please check your connection and retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Query Formulation Form */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Ask Frontline Policy Assistant</h3>
              <p className="text-xs text-slate-400">
                Vector retrieval with strict policy version safety & governance guardrails.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Governance Guardrails Active
          </span>
        </div>

        {/* Sample query quick chips */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Suggested Policy Prompts:
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(s.query)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-blue-900/30 hover:border-blue-700/50 border border-slate-700/60 text-slate-300 hover:text-blue-300 transition-all text-left"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              id="project-compass-query-input"
              rows={3}
              value={query}
              onChange={handleQueryChange}
              placeholder="e.g. What are the authorization thresholds and customer verification steps for an international outward wire transfer?"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Sensitive data warning banner */}
          {sensitiveWarning && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                <strong>Warning:</strong> Potential sensitive financial information detected. Do not enter real account numbers, card numbers, or credentials.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800 text-white text-xs font-semibold transition"
              >
                Retry
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Grounded in synthetic SOPs (PC-ACCOUNT, PC-WIRE, PC-POA, PC-FEE, etc.)</span>
            </div>

            <button
              id="project-compass-submit-button"
              type="submit"
              disabled={loading || !query.trim() || query.length < 3}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Searching SOPs & Grounding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Retrieve Grounded Policy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-5/6" />
            <div className="h-3 bg-slate-800 rounded w-4/6" />
          </div>
          <div className="h-20 bg-slate-800/40 rounded-xl" />
        </div>
      )}

      {/* Response View */}
      {response && !loading && (
        <div className="space-y-6">
          {/* Policy Not Found or Conflict State */}
          {response.status === 'policy_not_found' || response.status === 'policy_conflict' ? (
            <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-800/60 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  {response.status === 'policy_conflict' ? (
                    <ShieldAlert className="w-6 h-6 text-amber-400" />
                  ) : (
                    <HelpCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-900/50 text-amber-300 border border-amber-700/50">
                    {response.status === 'policy_conflict' ? 'POLICY VERSION CONFLICT' : 'POLICY NOT FOUND / INSUFFICIENT EVIDENCE'}
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {response.status === 'policy_conflict' ? 'Conflicting Policy Versions Detected' : 'No Matching Authorized Policy'}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {response.message ||
                      'I cannot find an authorized policy match for this request. Please consult your Supervisor or submit an operational ticket.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Recommended Next Operational Steps:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Consult your Branch Manager or Assistant Branch Manager for out-of-scope customer requests.</li>
                  <li>Submit an operational inquiry to the Operations Policy Helpdesk.</li>
                  <li>Do not execute unverified transactions without authorized written procedure.</li>
                </ul>
              </div>

              {response.advisoryDisclaimer && (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                  {response.advisoryDisclaimer}
                </div>
              )}
            </div>
          ) : (
            /* Grounded Policy Answer */
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Authorized SOP Guidance
                    </span>
                    <h3 className="text-lg font-bold text-white">Grounded Policy Response</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800/60 text-xs font-bold">
                    DEMO DATA ONLY
                  </span>
                  {response.modelUsed && (
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-xs font-mono">
                      {response.modelUsed}
                    </span>
                  )}
                </div>
              </div>

              {/* Governance Panel Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Governance & Policy Verification
                  </span>
                  {response.governanceMetadata?.riskLevel && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        response.governanceMetadata.riskLevel === 'HIGH_OPERATIONAL_RISK'
                          ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                          : 'bg-blue-950 text-blue-300 border-blue-800/60'
                      }`}
                    >
                      {response.governanceMetadata.riskLevel.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">SOP Grounding</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Grounded
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Policy Version</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> Active Only
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Citations</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {response.citations.length} Validated
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Review Cycle</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        response.reviewNotice
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> {response.reviewNotice ? 'Review Alert' : 'Current'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Date Notice Banner */}
              {response.reviewNotice && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed ${
                    response.reviewNotice.type === 'PAST_REVIEW'
                      ? 'bg-red-950/40 border-red-800/60 text-red-300'
                      : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {response.reviewNotice.type === 'PAST_REVIEW'
                        ? 'Policy Review Warning: '
                        : 'Policy Review Notice: '}
                    </span>
                    {response.reviewNotice.message}
                  </div>
                </div>
              )}

              {/* Answer Text */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Policy Summary & Guidance:
                </h4>
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                  {response.answer}
                </div>
              </div>

              {/* Key Procedural Steps */}
              {response.keySteps && response.keySteps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Key Procedural Steps:</span>
                  </h4>
                  <div className="space-y-2">
                    {response.keySteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs sm:text-sm text-slate-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cautions & Thresholds */}
              {response.cautions && response.cautions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Critical Controls & Escalation Rules:</span>
                  </h4>
                  <div className="space-y-2">
                    {response.cautions.map((caution, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs sm:text-sm text-amber-200"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{caution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Authorized Citations ({response.citations.length}):</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {response.citations.map((cit, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-blue-400 font-mono">
                          {cit.policyId} v{cit.version}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          {cit.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div className="font-semibold text-white text-xs leading-snug">
                        {cit.title}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Section {cit.sectionNumber} — {cit.sectionTitle}
                      </div>

                      <div className="pt-1.5 space-y-1 text-[10px] text-slate-500 border-t border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <span>Effective: {cit.effectiveDate}</span>
                          {cit.nextReviewDate && <span>Next Review: {cit.nextReviewDate}</span>}
                        </div>
                        <div className="font-mono text-slate-400 truncate" title={cit.citationAnchor}>
                          Anchor: #{cit.citationAnchor}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human-in-the-Loop Interactive Verification Box */}
              {response.requiresHumanVerification && (
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    humanVerified
                      ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        humanVerified
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <ShieldAlert className="w-5 h-5" />
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-white text-sm">
                          Mandatory Human Verification Required
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            humanVerified
                              ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/80'
                              : 'bg-amber-900/60 text-amber-300 border-amber-700/80'
                          }`}
                        >
                          {humanVerified ? 'Verified by User' : 'Verification Required'}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed opacity-90">
                        {response.verificationReason ||
                          'High-risk banking operations require independent verification of the cited SOP in the policy repository before executing transactions or approvals.'}
                      </p>

                      <div className="pt-2">
                        <button
                          type="button"
                          id="human-verification-checkbox"
                          onClick={() => setHumanVerified(!humanVerified)}
                          className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                            humanVerified
                              ? 'bg-emerald-900/40 border-emerald-600 text-emerald-300'
                              : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {humanVerified ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span>
                            I have verified this requirement against the source policy.
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Persistent Advisory & Blind Trust Reminders */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Advisory & Compliance Reminder</span>
                </div>
                <p className="leading-relaxed">
                  {response.advisoryDisclaimer ||
                    'AI-generated guidance is advisory only. The banker remains responsible for verifying the official policy before executing any banking action.'}
                </p>
                <p className="leading-relaxed text-slate-500">
                  {response.blindTrustWarning ||
                    'Do not rely on AI output alone. Open and verify the cited policy before completing the operational action.'}
                </p>
              </div>

              {/* Retrieval Metadata (Collapsible) */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="hover:text-slate-300 transition flex items-center gap-1"
                >
                  <span>{showMetadata ? 'Hide' : 'Show'} Retrieval Diagnostics</span>
                </button>
                <span>Timestamp: {new Date(response.timestamp).toLocaleTimeString()}</span>
              </div>

              {showMetadata && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                  <div>Status: {response.status}</div>
                  <div>Top Similarity Score: {response.topSimilarityScore?.toFixed(4)}</div>
                  <div>Retrieved Chunks: {response.retrievedCount}</div>
                  <div>Model: {response.modelUsed}</div>
                  <div>Notice: {response.demoDataNotice}</div>
                  {response.policyMetadata && (
                    <div>
                      Policy: {response.policyMetadata.policyId} v{response.policyMetadata.version} (Status: {response.policyMetadata.status})
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
