import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Award,
  BookOpen,
  Target,
  Zap,
  TrendingUp,
  Brain,
  FileCheck,
  Copy,
  Info,
  Layers,
  ChevronRight,
  Send,
} from 'lucide-react';
import {
  TransformationAssessmentRequest,
  TransformationAssessmentOutput,
  InteractionSession,
  AssessmentDimensionKey,
} from '../types';
import {
  ASSESSMENT_QUESTIONS,
  ASSESSMENT_DIMENSIONS,
  ALLOWED_ROLES,
  ALLOWED_EXPERIENCE_LEVELS,
  ALLOWED_BUSINESS_AREAS,
  ALLOWED_AI_EXPERIENCES,
} from '../data/transformationAssessmentData';
import { submitTransformationAssessment, detectSensitiveData, AIServiceError } from '../services/aiService';
import { saveInteraction } from '../services/interactionService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface TransformationAssessmentProps {
  userId: string;
  initialSession?: InteractionSession | null;
  onSessionUpdated?: (session: InteractionSession) => void;
  onNavigateToAcademy?: () => void;
}

const DIMENSION_KEYS: AssessmentDimensionKey[] = [
  'aiGenAIAwareness',
  'promptEngineering',
  'bankingProcessTransformation',
  'dataAnalyticsReadiness',
  'automationMindset',
  'responsibleAIGovernance',
  'practicalAIApplication',
  'transformationLeadership',
];

export const TransformationAssessment: React.FC<TransformationAssessmentProps> = ({
  userId,
  initialSession,
  onSessionUpdated,
  onNavigateToAcademy,
}) => {
  // Navigation & step state: 0 = Profile, 1-8 = Dimensions 1-8, 9 = Review, 10 = Results
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Profile fields
  const [role, setRole] = useState<string>(ALLOWED_ROLES[0]);
  const [experienceLevel, setExperienceLevel] = useState<string>(ALLOWED_EXPERIENCE_LEVELS[1]);
  const [businessArea, setBusinessArea] = useState<string>(ALLOWED_BUSINESS_AREAS[0]);
  const [aiExperience, setAiExperience] = useState<string>(ALLOWED_AI_EXPERIENCES[1]);
  const [transformationGoals, setTransformationGoals] = useState<string>('');
  const [operationalChallenge, setOperationalChallenge] = useState<string>('');

  // Answers map: questionId -> optionId
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Loading, error, and result states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sensitiveWarning, setSensitiveWarning] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [result, setResult] = useState<TransformationAssessmentOutput | null>(null);

  // Restore existing session if passed
  useEffect(() => {
    if (initialSession?.transformationAssessmentData?.result) {
      const data = initialSession.transformationAssessmentData;
      setResult(data.result);
      if (data.input) {
        setRole(data.input.role);
        setExperienceLevel(data.input.experienceLevel);
        setBusinessArea(data.input.businessArea);
        setAiExperience(data.input.aiExperience);
        setTransformationGoals(data.input.transformationGoals || '');
        setOperationalChallenge(data.input.operationalChallenge || '');
        const ansMap: Record<string, string> = {};
        data.input.answers.forEach((a) => {
          ansMap[a.questionId] = a.optionId;
        });
        setAnswers(ansMap);
      }
      setCurrentStep(10);
    }
  }, [initialSession]);

  // Handle sensitive data detection on text input changes
  const handleGoalsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTransformationGoals(val);
    if (detectSensitiveData(val)) {
      setSensitiveWarning('Warning: Potential sensitive financial information or credentials detected. Please use synthetic examples only.');
    } else if (!detectSensitiveData(operationalChallenge)) {
      setSensitiveWarning(null);
    }
  };

  const handleChallengeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setOperationalChallenge(val);
    if (detectSensitiveData(val)) {
      setSensitiveWarning('Warning: Potential sensitive financial information or credentials detected. Please use synthetic examples only.');
    } else if (!detectSensitiveData(transformationGoals)) {
      setSensitiveWarning(null);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    setError(null);
  };

  // Check progress
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Current dimension questions if in steps 1 to 8
  const currentDimensionKey = currentStep >= 1 && currentStep <= 8 ? DIMENSION_KEYS[currentStep - 1] : null;
  const currentDimensionMeta = currentDimensionKey ? ASSESSMENT_DIMENSIONS[currentDimensionKey] : null;
  const currentDimensionQuestions = useMemo(() => {
    if (!currentDimensionKey) return [];
    return ASSESSMENT_QUESTIONS.filter((q) => q.dimensionKey === currentDimensionKey);
  }, [currentDimensionKey]);

  // Is current step valid to proceed
  const isCurrentStepValid = useMemo(() => {
    if (currentStep === 0) {
      return Boolean(role && experienceLevel && businessArea && aiExperience && !sensitiveWarning);
    }
    if (currentStep >= 1 && currentStep <= 8) {
      return currentDimensionQuestions.every((q) => Boolean(answers[q.id]));
    }
    if (currentStep === 9) {
      return answeredCount === totalQuestions;
    }
    return true;
  }, [currentStep, role, experienceLevel, businessArea, aiExperience, sensitiveWarning, currentDimensionQuestions, answers, answeredCount, totalQuestions]);

  // Pre-fill demo answers for rapid testing
  const handlePrefillBalancedAnswers = () => {
    const demoAnswers: Record<string, string> = {};
    ASSESSMENT_QUESTIONS.forEach((q, idx) => {
      // Pick balanced 3rd option (70-75% score) or 4th option
      const optIdx = idx % 2 === 0 ? Math.min(2, q.options.length - 1) : Math.min(3, q.options.length - 1);
      demoAnswers[q.id] = q.options[optIdx].id;
    });
    setAnswers(demoAnswers);
    setTransformationGoals('Accelerate credit analysis intake and scale proactive client outreach with maker-checker controls.');
    setOperationalChallenge('Manual collation of customer financial statements and repetitive email drafting taking 10+ hours weekly.');
  };

  // Submit assessment to backend
  const handleSubmitAssessment = async () => {
    if (answeredCount !== totalQuestions) {
      setError(`Please complete all ${totalQuestions} questions before submitting (currently answered ${answeredCount}).`);
      return;
    }

    if (detectSensitiveData(transformationGoals) || detectSensitiveData(operationalChallenge)) {
      setError('Cannot submit: Sensitive data pattern detected. Please redact all personal or customer credentials.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const answersPayload = Object.entries(answers).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    }));

    const requestPayload: TransformationAssessmentRequest = {
      role,
      experienceLevel,
      businessArea,
      aiExperience,
      transformationGoals: transformationGoals.trim() || undefined,
      operationalChallenge: operationalChallenge.trim() || undefined,
      answers: answersPayload,
    };

    try {
      const response = await submitTransformationAssessment(requestPayload);
      const generatedResult = response.result;
      setResult(generatedResult);
      setCurrentStep(10); // Move to results step

      // Persist to user's Firestore interaction history
      const sessionId = `assessment-${Date.now()}`;
      const sessionPayload: InteractionSession = {
        id: sessionId,
        userId,
        type: 'transformation_assessment',
        title: `AI Transformation Assessment - ${generatedResult.overallScore}/100 (${generatedResult.maturityLevel})`,
        summary: `Maturity: ${generatedResult.maturityLevel} (${generatedResult.overallScore}/100) for ${role} in ${businessArea}`,
        transformationAssessmentData: {
          input: requestPayload,
          result: generatedResult,
        },
        metadata: {
          modelUsed: response.model,
          generatedAt: generatedResult.calculatedAt,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await saveInteraction(userId, sessionPayload, true);
        // Also update user's profile transformationScore
        try {
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, {
            transformationScore: generatedResult.overallScore,
            updatedAt: new Date().toISOString(),
          });
        } catch (profileErr) {
          console.warn('[Assessment] Notice updating user profile score (non-fatal):', profileErr);
        }

        if (onSessionUpdated) {
          onSessionUpdated(sessionPayload);
        }
      } catch (persistErr) {
        console.warn('[Assessment] Firestore interaction save notice:', persistErr);
      }
    } catch (err: unknown) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      } else {
        setError('Failed to calculate and evaluate assessment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeAssessment = () => {
    setResult(null);
    setCurrentStep(0);
    setError(null);
  };

  const handleCopySummary = async () => {
    if (!result) return;
    const textToCopy = `AI BANKER TRANSFORMATION ASSESSMENT REPORT
======================================================
Professional: ${result.role} (${result.experienceLevel})
Business Area: ${result.businessArea} | AI Experience: ${result.aiExperience}
Date: ${new Date(result.calculatedAt).toLocaleDateString()}

OVERALL TRANSFORMATION MATURITY: ${result.overallScore} / 100
Maturity Band: ${result.maturityLevel}

DIMENSION BREAKDOWN:
${Object.values(result.dimensionScores)
  .map((d) => `- ${d.name}: ${d.score}/100 (${d.level}, Weight: ${Math.round(d.weight * 100)}%)`)
  .join('\n')}

EXECUTIVE SUMMARY:
${result.executiveSummary}

KEY STRENGTHS:
${result.strengths.map((s) => `• ${s}`).join('\n')}

DEVELOPMENT PRIORITIES:
${result.developmentPriorities.map((p) => `• ${p}`).join('\n')}

ROLE-SPECIFIC RECOMMENDATIONS:
${result.roleSpecificRecommendations.map((r) => `• ${r}`).join('\n')}

QUICK WINS (1-7 DAYS):
${result.quickWins.map((w) => `• ${w}`).join('\n')}

GOVERNANCE FOCUS:
${result.governanceFocus.map((g) => `• ${g}`).join('\n')}

DISCLAIMER:
${result.advisoryDisclaimer}
${result.decisionUseWarning}
======================================================`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    } catch {
      // Fallback
    }
  };

  // -------------------------------------------------------------
  // RENDER: RESULTS DASHBOARD (STEP 10)
  // -------------------------------------------------------------
  if (currentStep === 10 && result) {
    return (
      <div id="transformation-assessment-results" className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Top Summary Banner */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Deterministic Scoring
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Governance Compliant
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                AI Transformation Scorecard
              </h1>
              <p className="text-sm text-slate-600">
                Tailored maturity benchmark and strategic upskilling roadmap for{' '}
                <span className="font-semibold text-slate-800">{result.role}</span> in{' '}
                <span className="font-semibold text-slate-800">{result.businessArea}</span>.
              </p>
            </div>

            {/* Score Display Card */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 self-start md:self-auto min-w-[240px]">
              <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-blue-600 shadow-xs">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {result.overallScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-600">/ 100</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-600">Maturity Level</p>
                <p className="text-base font-bold text-blue-700">{result.maturityLevel}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Calculated {new Date(result.calculatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Assessment is advisory. Human review and maker-checker validation are mandatory in banking workflows.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedNotification ? 'Report Copied!' : 'Copy Summary'}
              </button>
              <button
                type="button"
                onClick={handleRetakeAssessment}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary Callout */}
        <div className="bg-linear-to-r from-blue-900 to-indigo-900 rounded-xl p-6 text-white shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-white/10 shrink-0">
              <Sparkles className="w-5 h-5 text-blue-300" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-white tracking-wide uppercase text-xs">
                Executive Synthesis & Transformation Outlook
              </h2>
              <p className="text-sm leading-relaxed text-blue-100">
                {result.executiveSummary}
              </p>
            </div>
          </div>
        </div>

        {/* 8 Dimension Scores Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Eight Dimension Readiness Breakdown
            </h3>
            <span className="text-xs text-slate-600 font-medium">
              Deterministic Weighted Scoring
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(result.dimensionScores).map(([key, dim]) => {
              const meta = ASSESSMENT_DIMENSIONS[key as AssessmentDimensionKey];
              const scoreColor =
                dim.score >= 80
                  ? 'bg-emerald-500 text-emerald-700 border-emerald-200'
                  : dim.score >= 65
                  ? 'bg-blue-500 text-blue-700 border-blue-200'
                  : dim.score >= 45
                  ? 'bg-amber-500 text-amber-700 border-amber-200'
                  : 'bg-rose-500 text-rose-700 border-rose-200';

              return (
                <div
                  key={key}
                  className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs hover:border-blue-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      {dim.name}
                    </h4>
                    <span className="text-xs font-black text-slate-900 shrink-0">
                      {dim.score}
                      <span className="text-[10px] text-slate-600 font-normal">/100</span>
                    </span>
                  </div>

                  {/* Meter */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${scoreColor.split(' ')[0]}`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-600">
                    <span className="font-semibold text-slate-700">{dim.level}</span>
                    <span className="text-slate-600">Weight: {Math.round(dim.weight * 100)}%</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {meta?.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Insights Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 border-b border-slate-100 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Demonstrated Strengths
              </h3>
            </div>
            <ul className="space-y-3">
              {result.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[11px] border border-emerald-200">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Development Priorities */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-amber-800 border-b border-slate-100 pb-3">
              <Target className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Development Priorities
              </h3>
            </div>
            <ul className="space-y-3">
              {result.developmentPriorities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 font-bold flex items-center justify-center shrink-0 text-[11px] border border-amber-200">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Role-Specific Recommendations */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-blue-800 border-b border-slate-100 pb-3">
              <Award className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Tailored Recommendations for {result.role}
              </h3>
            </div>
            <ul className="space-y-3">
              {result.roleSpecificRecommendations.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Wins */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-800 border-b border-slate-100 pb-3">
              <Zap className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Immediate Quick Wins (1–7 Days)
              </h3>
            </div>
            <ul className="space-y-3">
              {result.quickWins.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px] border border-indigo-200">
                    ⚡
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance Focus */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-rose-800 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Governance, Risk & Compliance Guardrails
              </h3>
            </div>
            <ul className="space-y-3">
              {result.governanceFocus.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[11px] border border-rose-200">
                    !
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Learning & Topics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-purple-800 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Recommended Upskilling Topics
              </h3>
            </div>
            <ul className="space-y-3">
              {result.recommendedLearningTopics.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <Brain className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Transformation Workflow Areas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              High-Opportunity Banking Transformation Areas
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.recommendedTransformationAreas.map((area, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
              >
                <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-700 font-bold shrink-0">
                  {idx + 1}
                </span>
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 5D: AI Learning Academy Action Banner */}
        {onNavigateToAcademy && (
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-950 text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Personalized Learning Journey Ready</span>
              </div>
              <h4 className="text-base font-bold">
                Launch Your AI Learning Academy Path
              </h4>
              <p className="text-xs text-purple-200 leading-relaxed max-w-xl">
                We have automatically translated your assessment gaps into an 8-module personalized curriculum covering prompt engineering, process transformation, and banking governance.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToAcademy}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-purple-950 font-bold text-xs hover:bg-purple-50 transition shrink-0 shadow-sm cursor-pointer"
            >
              <span>Enter AI Learning Academy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Regulatory & Advisory Disclaimer Banners */}
        <div className="space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Regulatory Governance Notice
            </p>
            <p>Assessment is advisory and does not replace professional judgment.</p>
            <p className="text-slate-600">Results should not be used as the sole basis for employment, promotion, lending, compliance, or customer decisions.</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: QUESTIONNAIRE FLOW (STEPS 0 TO 9)
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Global Progress */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Brain className="w-3.5 h-3.5" />
                Phase 5C
              </span>
              <span className="text-xs text-slate-600">8 Dimensions • 24 Core Questions</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              AI Transformation Assessment
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Comprehensive evaluation of banking Generative AI readiness, prompt mastery, and governance awareness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 0 && (
              <button
                type="button"
                onClick={handlePrefillBalancedAnswers}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                title="Fill sample options for quick demonstration"
              >
                Auto-fill Sample Answers
              </button>
            )}
            <div className="text-right">
              <p className="text-xs font-bold text-slate-700">
                {answeredCount} / {totalQuestions} Answered
              </p>
              <p className="text-[11px] text-slate-600">{progressPercent}% Completed</p>
            </div>
          </div>
        </div>

        {/* Multi-step progress bar */}
        <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Navigation Pills */}
        <div className="mt-4 flex items-center justify-between overflow-x-auto pb-1 gap-1 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setCurrentStep(0)}
            className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition ${
              currentStep === 0
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            0. Profile
          </button>
          {DIMENSION_KEYS.map((key, idx) => {
            const stepNum = idx + 1;
            const dimQuestions = ASSESSMENT_QUESTIONS.filter((q) => q.dimensionKey === key);
            const isDimComplete = dimQuestions.every((q) => Boolean(answers[q.id]));

            return (
              <button
                key={key}
                type="button"
                onClick={() => setCurrentStep(stepNum)}
                className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap flex items-center gap-1 transition ${
                  currentStep === stepNum
                    ? 'bg-blue-600 text-white'
                    : isDimComplete
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{stepNum}.</span>
                <span className="hidden md:inline">{ASSESSMENT_DIMENSIONS[key].name.split(' ')[0]}</span>
                {isDimComplete && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setCurrentStep(9)}
            className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition ${
              currentStep === 9
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            9. Review
          </button>
        </div>
      </div>

      {/* Sensitive Data Notice Alert */}
      {sensitiveWarning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>{sensitiveWarning}</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Assessment Submission Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 0: PROFESSIONAL PROFILE */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Step 0: Banking Profile & Context</h2>
            <p className="text-xs text-slate-600 mt-1">
              Help us calibrate recommendations for your specific banking line of business and operational scope.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            <div className="space-y-1.5">
              <label htmlFor="assessment-role" className="text-xs font-semibold text-slate-700">Banking Role *</label>
              <select
                id="assessment-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ALLOWED_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <label htmlFor="assessment-experience-level" className="text-xs font-semibold text-slate-700">Experience Level *</label>
              <select
                id="assessment-experience-level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ALLOWED_EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Area */}
            <div className="space-y-1.5">
              <label htmlFor="assessment-business-area" className="text-xs font-semibold text-slate-700">Business Area *</label>
              <select
                id="assessment-business-area"
                value={businessArea}
                onChange={(e) => setBusinessArea(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ALLOWED_BUSINESS_AREAS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Experience */}
            <div className="space-y-1.5">
              <label htmlFor="assessment-ai-experience" className="text-xs font-semibold text-slate-700">Current AI Experience *</label>
              <select
                id="assessment-ai-experience"
                value={aiExperience}
                onChange={(e) => setAiExperience(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ALLOWED_AI_EXPERIENCES.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Goals & Challenges */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label htmlFor="assessment-transformation-goals" className="text-xs font-semibold text-slate-700">
                Key AI Transformation Goals (Optional)
              </label>
              <textarea
                id="assessment-transformation-goals"
                rows={2}
                value={transformationGoals}
                onChange={handleGoalsChange}
                placeholder="e.g. Save 5 hours weekly on customer prep, automate commercial loan covenant tracking, empower team with prompt templates..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="assessment-operational-challenge" className="text-xs font-semibold text-slate-700">
                Primary Operational or Bottleneck Challenge (Optional)
              </label>
              <textarea
                id="assessment-operational-challenge"
                rows={2}
                value={operationalChallenge}
                onChange={handleChallengeChange}
                placeholder="e.g. Re-keying customer information between CRM and core systems, manual email follow-ups..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Governance Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Data Privacy Guard: Do not enter confidential customer PII, account numbers, or passwords. All inputs are evaluated in accordance with bank model risk policies.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              disabled={!isCurrentStepValid}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
            >
              <span>Begin Dimension 1</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEPS 1 TO 8: DIMENSION QUESTIONS */}
      {/* ------------------------------------------------------------- */}
      {currentStep >= 1 && currentStep <= 8 && currentDimensionMeta && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8 space-y-6">
          {/* Dimension Header */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Dimension {currentStep} of 8 • Weight: {Math.round(currentDimensionMeta.weight * 100)}%
              </span>
              <span className="text-xs text-slate-600 font-semibold">
                {currentDimensionQuestions.filter((q) => Boolean(answers[q.id])).length} of{' '}
                {currentDimensionQuestions.length} answered
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {currentDimensionMeta.name}
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {currentDimensionMeta.description}
            </p>
          </div>

          {/* Question Cards */}
          <div className="space-y-6">
            {currentDimensionQuestions.map((question, qIdx) => {
              const selectedOptionId = answers[question.id];

              return (
                <div
                  key={question.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {qIdx + 1}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900">
                          {question.title}
                        </h3>
                      </div>
                      {question.context && (
                        <p className="text-xs text-slate-600 italic ml-7">
                          {question.context}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2 ml-1 sm:ml-7">
                    {question.options.map((option) => {
                      const isSelected = selectedOptionId === option.id;

                      return (
                        <label
                          key={option.id}
                          onClick={() => handleSelectOption(question.id, option.id)}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={isSelected}
                            onChange={() => handleSelectOption(question.id, option.id)}
                            className="mt-0.5 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{option.label}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                                {option.score} pts
                              </span>
                            </div>
                            {option.description && (
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {option.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(9, prev + 1))}
              disabled={!isCurrentStepValid}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
            >
              <span>{currentStep === 8 ? 'Review & Submit' : 'Next Dimension'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 9: REVIEW & SUBMIT */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 9 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Step 9: Review & Submit Assessment</h2>
            <p className="text-xs text-slate-600 mt-1">
              Verify your banking context and completed dimensions before generating your personalized scorecard.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-600 font-semibold">Role</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{role}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-600 font-semibold">Business Area</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{businessArea}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-600 font-semibold">Experience Level</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{experienceLevel}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-600 font-semibold">AI Baseline</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{aiExperience.split(' ')[0]}</p>
            </div>
          </div>

          {/* Dimension Completion Checklist */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Dimension Completion Checklist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DIMENSION_KEYS.map((key, idx) => {
                const dimQuestions = ASSESSMENT_QUESTIONS.filter((q) => q.dimensionKey === key);
                const answeredInDim = dimQuestions.filter((q) => Boolean(answers[q.id])).length;
                const isComplete = answeredInDim === dimQuestions.length;

                return (
                  <div
                    key={key}
                    onClick={() => setCurrentStep(idx + 1)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-800">
                        {idx + 1}. {ASSESSMENT_DIMENSIONS[key].name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-semibold">
                      {answeredInDim}/{dimQuestions.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Governance & Scoring Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <FileCheck className="w-4 h-4 text-blue-700" />
              <span>Deterministic Server-Side Scoring Notice</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Your overall maturity score and dimension metrics are calculated strictly deterministically on our server according to pre-defined banking readiness algorithms. Gemini is used only for qualitative interpretation, role-specific coaching, and growth recommendations.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(8)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dimension 8</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitAssessment}
              disabled={isSubmitting || answeredCount !== totalQuestions}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Deterministic Scorecard...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit & Generate Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
