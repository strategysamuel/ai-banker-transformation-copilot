import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  InteractionSession,
  TransformationPlanData,
  TransformationPlanDay,
  PlanPhase,
  PlanDayCompletionStatus,
  AppModuleType,
} from '../types';
import {
  getUserInteractions,
  saveInteraction,
} from '../services/interactionService';
import { generateTransformationPlan } from '../services/aiService';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  ArrowRight,
  ChevronRight,
  FileText,
  Mail,
  Compass,
  TrendingUp,
  GraduationCap,
  ClipboardCheck,
  RefreshCw,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Star,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TransformationPlanProps {
  initialSession?: InteractionSession | null;
  onNavigateToAssessment: () => void;
  onNavigateToAcademy: () => void;
  onNavigateToModule: (module: AppModuleType) => void;
  onSessionUpdated?: (session: InteractionSession) => void;
}

const PRESET_GOALS = [
  'Accelerate Commercial Loan Intake & Customer Onboarding with Rigorous Maker-Checker Gates',
  'Optimize Customer Discovery, Strategic Meeting Framing, and Proactive Objection Handling',
  'Streamline Customer Correspondence and Policy Verification while Preserving Audit Trails',
  'Eliminate Operational Bottlenecks in Lending Dossier Review via Structured Prompting',
  'Establish Team-Wide AI Governance, SR 11-7 Compliance, and Policy Verification Discipline',
];

export const TransformationPlan: React.FC<TransformationPlanProps> = ({
  initialSession,
  onNavigateToAssessment,
  onNavigateToAcademy,
  onNavigateToModule,
  onSessionUpdated,
}) => {
  const { user } = useAuth();

  // Data states
  const [loading, setLoading] = useState(true);
  const [assessmentSession, setAssessmentSession] = useState<InteractionSession | null>(null);
  const [activePlanSession, setActivePlanSession] = useState<InteractionSession | null>(null);
  const [planData, setPlanData] = useState<TransformationPlanData | null>(null);

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState(PRESET_GOALS[0]);
  const [customGoal, setCustomGoal] = useState('');
  const [useCustomGoal, setUseCustomGoal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & interaction states
  const [activePhaseFilter, setActivePhaseFilter] = useState<string>('all');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [activeDayReflection, setActiveDayReflection] = useState<number | null>(null);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [reflectionConfidence, setReflectionConfidence] = useState(4);
  const [reflectionTimeSpent, setReflectionTimeSpent] = useState(20);
  const [savingReflection, setSavingReflection] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showFinalReviewModal, setShowFinalReviewModal] = useState(false);

  // 1. Initial Data Discovery: Find latest assessment & existing plan
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        // If initialSession is provided and is a plan, use it
        if (initialSession && initialSession.type === 'transformation_plan' && initialSession.transformationPlanData) {
          if (isMounted) {
            setActivePlanSession(initialSession);
            setPlanData(initialSession.transformationPlanData);
          }
        } else {
          // Check Firestore for existing transformation plans
          const planInteractions = await getUserInteractions(user.uid, 'transformation_plan');
          if (planInteractions.length > 0 && planInteractions[0].transformationPlanData) {
            if (isMounted) {
              setActivePlanSession(planInteractions[0]);
              setPlanData(planInteractions[0].transformationPlanData);
            }
          }
        }

        // Check Firestore for latest assessment
        const assessments = await getUserInteractions(user.uid, 'transformation_assessment');
        if (isMounted) {
          if (assessments.length > 0 && assessments[0].transformationAssessmentData) {
            setAssessmentSession(assessments[0]);
          } else {
            setAssessmentSession(null);
          }
        }
      } catch (err: unknown) {
        console.error('Failed to load plan or assessment from Firestore:', err);
        if (isMounted) {
          setError('Unable to load transformation data from Firestore. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, initialSession]);

  // Recalculate progress statistics
  const updateProgressStats = (days: TransformationPlanDay[]) => {
    const completedDays = days.filter((d) => d.completionStatus === 'completed').length;
    const week1 = days.filter((d) => d.week === 1);
    const week2 = days.filter((d) => d.week === 2);
    const week3 = days.filter((d) => d.week === 3);
    const week4 = days.filter((d) => d.week === 4);

    let currentPhase: PlanPhase = 'Foundation';
    if (completedDays >= 21) currentPhase = 'Transformation & Impact';
    else if (completedDays >= 14) currentPhase = 'Application';
    else if (completedDays >= 7) currentPhase = 'Practice';

    return {
      completedDays,
      totalDays: 30,
      percentComplete: Math.round((completedDays / 30) * 100),
      week1Completed: week1.filter((d) => d.completionStatus === 'completed').length,
      week1Total: week1.length,
      week2Completed: week2.filter((d) => d.completionStatus === 'completed').length,
      week2Total: week2.length,
      week3Completed: week3.filter((d) => d.completionStatus === 'completed').length,
      week3Total: week3.length,
      week4Completed: week4.filter((d) => d.completionStatus === 'completed').length,
      week4Total: week4.length,
      lastActiveDay: Math.min(30, completedDays + 1),
      currentActivePhase: currentPhase,
    };
  };

  // 2. Generate Plan with Gemini via POST /api/ai/transformation-plan
  const handleGeneratePlan = async () => {
    if (!user || !assessmentSession || !assessmentSession.transformationAssessmentData) {
      setError('Complete your Transformation Assessment first to create your personalized 30-Day Transformation Plan.');
      return;
    }

    const assessmentResult = assessmentSession.transformationAssessmentData.result;
    const assessmentInput = assessmentSession.transformationAssessmentData.input;

    setIsGenerating(true);
    setError(null);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      const finalGoal = useCustomGoal ? customGoal.trim() : selectedGoal.trim();

      const response = await generateTransformationPlan({
        assessmentId: assessmentSession.id,
        role: assessmentResult.role || assessmentInput.role || 'Commercial Banker',
        maturityLevel: assessmentResult.maturityLevel,
        overallScore: assessmentResult.overallScore,
        prioritySkills: assessmentResult.developmentPriorities || assessmentResult.recommendedLearningTopics || [],
        transformationGoal: finalGoal,
        quickWins: assessmentResult.quickWins || [],
        developmentPriorities: assessmentResult.developmentPriorities || [],
      });

      const generatedPlan: TransformationPlanData = response.plan;

      // Persist plan to Firestore
      const newSession: InteractionSession = {
        id: generatedPlan.planId,
        userId: user.uid,
        type: 'transformation_plan',
        title: `30-Day Transformation Plan (${generatedPlan.role})`,
        summary: `Personalized 30-day program targeting ${generatedPlan.maturityLevel} level with focus on ${generatedPlan.prioritySkills.slice(0, 2).join(', ')}.`,
        transformationPlanData: generatedPlan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveInteraction(user.uid, newSession, true);

      setActivePlanSession(newSession);
      setPlanData(generatedPlan);
      setShowNewPlanModal(false);
      if (onSessionUpdated) onSessionUpdated(newSession);
    } catch (err: unknown) {
      console.error('Plan generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate transformation plan.');
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  // 3. Mark Day Complete / In Progress
  const handleToggleDayStatus = async (dayNumber: number, currentStatus: PlanDayCompletionStatus) => {
    if (!planData || !activePlanSession || !user) return;

    const nextStatus: PlanDayCompletionStatus =
      currentStatus === 'completed' ? 'not_started' : 'completed';

    const updatedDailyPlan = planData.dailyPlan.map((d) => {
      if (d.day === dayNumber) {
        return {
          ...d,
          completionStatus: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return d;
    });

    const updatedProgress = updateProgressStats(updatedDailyPlan);

    const updatedPlanData: TransformationPlanData = {
      ...planData,
      dailyPlan: updatedDailyPlan,
      progress: updatedProgress,
      updatedAt: new Date().toISOString(),
    };

    const updatedSession: InteractionSession = {
      ...activePlanSession,
      transformationPlanData: updatedPlanData,
      updatedAt: new Date().toISOString(),
    };

    setPlanData(updatedPlanData);
    setActivePlanSession(updatedSession);

    try {
      await saveInteraction(user.uid, updatedSession, false);
      if (onSessionUpdated) onSessionUpdated(updatedSession);
    } catch (err) {
      console.error('Failed to save day status update:', err);
      setError('Failed to sync progress with Firestore. Please try again.');
    }
  };

  // 4. Save Reflection for a Day
  const handleSaveDayReflection = async (dayNumber: number) => {
    if (!planData || !activePlanSession || !user) return;
    setSavingReflection(true);

    try {
      const updatedDailyPlan = planData.dailyPlan.map((d) => {
        if (d.day === dayNumber) {
          return {
            ...d,
            userNotes: reflectionNotes.trim(),
            confidence: reflectionConfidence,
            timeSpentMinutes: reflectionTimeSpent,
            completionStatus: 'completed' as PlanDayCompletionStatus,
            completedAt: new Date().toISOString(),
          };
        }
        return d;
      });

      const updatedProgress = updateProgressStats(updatedDailyPlan);

      const updatedPlanData: TransformationPlanData = {
        ...planData,
        dailyPlan: updatedDailyPlan,
        progress: updatedProgress,
        updatedAt: new Date().toISOString(),
      };

      const updatedSession: InteractionSession = {
        ...activePlanSession,
        transformationPlanData: updatedPlanData,
        updatedAt: new Date().toISOString(),
      };

      setPlanData(updatedPlanData);
      setActivePlanSession(updatedSession);
      await saveInteraction(user.uid, updatedSession, false);
      if (onSessionUpdated) onSessionUpdated(updatedSession);

      setActiveDayReflection(null);
      setReflectionNotes('');
    } catch (err) {
      console.error('Failed to save reflection:', err);
      setError('Failed to persist reflection. Please try again.');
    } finally {
      setSavingReflection(false);
    }
  };

  // 5. Tool Mapping & Navigation
  const getToolDisplayName = (toolId?: string) => {
    switch (toolId) {
      case 'copilot':
        return 'AI Banker Copilot';
      case 'meeting_prep':
        return 'Customer Meeting Prep';
      case 'email_assistant':
        return 'Banking Email Assistant';
      case 'project_compass':
        return 'Project Compass (SOPs)';
      case 'process_optimizer':
        return 'Process Optimizer';
      case 'learning_assistant':
        return 'AI Learning Academy';
      case 'transformation_assessment':
        return 'Transformation Assessment';
      default:
        return 'Banking Tool';
    }
  };

  const getToolIcon = (toolId?: string) => {
    switch (toolId) {
      case 'copilot':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'meeting_prep':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'email_assistant':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'project_compass':
        return <Compass className="w-4 h-4 text-amber-400" />;
      case 'process_optimizer':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'learning_assistant':
        return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      default:
        return <ClipboardCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  // Copy Plan as Structured Markdown
  const handleCopyPlan = () => {
    if (!planData) return;

    const markdown = `# AI Banker 30-Day Transformation Plan
**Role:** ${planData.role}
**Maturity Level:** ${planData.maturityLevel} | **Assessment Score:** ${planData.overallScore}/100
**Goal:** ${planData.transformationGoal}
**Human Review Required:** Yes (advisory only)

## Summary Progress: ${planData.progress.completedDays}/30 Days Completed (${planData.progress.percentComplete}%)

${planData.dailyPlan
  .map(
    (d) => `### Day ${d.day}: ${d.title} (${d.phase})
- **Status:** ${d.completionStatus.toUpperCase()}
- **Objective:** ${d.objective}
- **Activity:** ${d.activity}
- **Capability:** ${d.capability} (${d.estimatedMinutes} mins)
- **Governance:** ${d.governanceConsideration}
${d.userNotes ? `- **Banker Notes:** ${d.userNotes}` : ''}`
  )
  .join('\n\n')}

---
*Notice: ${planData.advisoryDisclaimer}*
*${planData.syntheticDataNotice}*`;

    navigator.clipboard.writeText(markdown);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Download Plan JSON
  const handleDownloadPlanJSON = () => {
    if (!planData) return;
    const blob = new Blob([JSON.stringify(planData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `30-day-transformation-plan-${planData.role.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Days
  const filteredDays =
    planData?.dailyPlan.filter((d) => {
      if (activePhaseFilter === 'all') return true;
      if (activePhaseFilter === 'week1') return d.week === 1;
      if (activePhaseFilter === 'week2') return d.week === 2;
      if (activePhaseFilter === 'week3') return d.week === 3;
      if (activePhaseFilter === 'week4') return d.week === 4;
      return true;
    }) || [];

  // =============================================================
  // RENDER: LOADING STATE
  // =============================================================
  if (loading) {
    return (
      <div className="p-16 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-white">Loading 30-Day Transformation Plan...</p>
        <p className="text-xs text-slate-400">Verifying diagnostic assessment baseline and progress</p>
      </div>
    );
  }

  // =============================================================
  // RENDER: NO ASSESSMENT FOUND STATE
  // =============================================================
  if (!assessmentSession) {
    return (
      <div className="space-y-6">
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-6 shadow-xl max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-950/30">
            <ClipboardCheck className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 text-xs font-mono font-bold">
              <span>PREREQUISITE REQUIRED</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Diagnostic Assessment Required
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              Complete your Transformation Assessment first to create your personalized 30-Day Transformation Plan.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              The copilot uses your deterministic score across the 8 banking dimensions to craft a rigorous 4-phase program tailored to your exact role and priority gaps.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="plan-start-assessment-btn"
              onClick={onNavigateToAssessment}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <span>Take Transformation Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="plan-explore-academy-btn"
              onClick={onNavigateToAcademy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition cursor-pointer border border-slate-700"
            >
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Explore AI Academy</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left text-xs space-y-1 text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Responsible AI Governance Mandate</span>
            </div>
            <p>
              Transformation plans are grounded in verified assessment baselines to prevent speculative skill tracking and preserve institutional integrity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER: PLAN CREATION MODAL / INITIAL PLAN CREATION STATE
  // =============================================================
  if (!planData || showNewPlanModal) {
    const assessmentResult = assessmentSession.transformationAssessmentData?.result;
    const role = assessmentResult?.role || 'Commercial Banker';
    const score = assessmentResult?.overallScore ?? 50;
    const maturity = assessmentResult?.maturityLevel || 'AI Practitioner';
    const priorityGaps = assessmentResult?.developmentPriorities || assessmentResult?.recommendedLearningTopics || [
      'Prompt Engineering',
      'Banking Process Transformation',
      'Responsible AI Governance',
    ];

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-white">Create 30-Day Transformation Plan</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Synthesize your diagnostic assessment into a daily 4-phase professional capability journey
                </p>
              </div>
            </div>

            {planData && (
              <button
                id="cancel-new-plan-btn"
                onClick={() => setShowNewPlanModal(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition"
              >
                Return to Active Plan
              </button>
            )}
          </div>

          {/* Assessment Recap Card */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-blue-400" />
                <span>Phase 5C Diagnostic Baseline</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ID: {assessmentSession.id.substring(0, 12)}...
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Professional Role</span>
                <p className="text-white font-bold text-sm mt-0.5">{role}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Current Maturity</span>
                <p className="text-indigo-300 font-bold text-sm mt-0.5">{maturity}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Readiness Score</span>
                <p className="text-emerald-400 font-bold text-sm mt-0.5">{score} / 100</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-slate-400">Priority Skill Gaps Targeted:</span>
              <div className="flex flex-wrap gap-2">
                {priorityGaps.map((gap, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-700/80"
                  >
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Goal Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white block">
              Select Your 30-Day Transformation Goal:
            </label>

            <div className="space-y-2">
              {PRESET_GOALS.map((goal, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    !useCustomGoal && selectedGoal === goal
                      ? 'bg-blue-950/40 border-blue-600 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="preset_goal"
                    checked={!useCustomGoal && selectedGoal === goal}
                    onChange={() => {
                      setSelectedGoal(goal);
                      setUseCustomGoal(false);
                    }}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{goal}</span>
                </label>
              ))}

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                  useCustomGoal
                    ? 'bg-blue-950/40 border-blue-600 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="preset_goal"
                  checked={useCustomGoal}
                  onChange={() => setUseCustomGoal(true)}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 space-y-2">
                  <span>Custom Operational Goal</span>
                  {useCustomGoal && (
                    <textarea
                      id="custom-goal-input"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="e.g. Redesign commercial credit memorandum intake and automate preliminary policy verification..."
                      rows={2}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generating Indicator */}
          {isGenerating && (
            <div className="p-6 rounded-xl bg-blue-950/40 border border-blue-800 space-y-3">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="font-semibold text-white text-xs">
                  {generationStep === 1 && 'Synthesizing Phase 5C diagnostic baseline...'}
                  {generationStep === 2 && 'Structuring 4-phase transformation progression...'}
                  {generationStep === 3 && 'Aligning daily activities to existing copilot tools...'}
                  {generationStep >= 4 && 'Enforcing responsible AI maker-checker guardrails...'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{ width: `${generationStep * 25}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Human review required for all 30 days • Advisory guidance only</span>
            </div>

            <button
              id="generate-plan-btn"
              onClick={handleGeneratePlan}
              disabled={isGenerating || (useCustomGoal && customGoal.trim().length === 0)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Plan...' : 'Generate 30-Day Transformation Plan'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER: ACTIVE 30-DAY TRANSFORMATION PLAN DASHBOARD
  // =============================================================
  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  30-Day AI Transformation Plan
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                  LIVE
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
                  {planData.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {planData.transformationGoal}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              id="plan-copy-btn"
              onClick={handleCopyPlan}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer border border-slate-700"
              title="Copy markdown plan"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Plan</span>
                </>
              )}
            </button>

            <button
              id="plan-download-btn"
              onClick={handleDownloadPlanJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer border border-slate-700"
              title="Download Plan JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              id="plan-create-new-btn"
              onClick={() => setShowNewPlanModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Plan</span>
            </button>
          </div>
        </div>

        {/* Metric Cards & Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-slate-400">Diagnostic Readiness</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white">{planData.overallScore}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <span className="text-[10px] font-medium text-emerald-400">{planData.maturityLevel}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-slate-400">Overall Progress</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white">{planData.progress.completedDays}</span>
              <span className="text-xs text-slate-500">/ 30 Days</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${planData.progress.percentComplete}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-slate-400">Current Phase</span>
            <div className="text-sm font-bold text-indigo-300 truncate">
              {planData.progress.currentActivePhase || 'Foundation'}
            </div>
            <span className="text-[10px] text-slate-500">Day {planData.progress.lastActiveDay || 1} Active</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-slate-400">Transformation Review</span>
            <div className="text-sm font-bold text-white">Day 30 Final Gate</div>
            <button
              id="view-final-review-btn"
              onClick={() => setShowFinalReviewModal(true)}
              className="text-[10px] text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
            >
              View Executive Review
            </button>
          </div>
        </div>

        {/* Phase Breakdown Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <button
            id="filter-week1-btn"
            onClick={() => setActivePhaseFilter(activePhaseFilter === 'week1' ? 'all' : 'week1')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              activePhaseFilter === 'week1'
                ? 'bg-blue-950/50 border-blue-500 text-white'
                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold">Week 1: Foundation</span>
              <span className="text-slate-400">
                {planData.progress.week1Completed}/{planData.progress.week1Total}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Days 1–7 • AI awareness & governance</p>
          </button>

          <button
            id="filter-week2-btn"
            onClick={() => setActivePhaseFilter(activePhaseFilter === 'week2' ? 'all' : 'week2')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              activePhaseFilter === 'week2'
                ? 'bg-blue-950/50 border-blue-500 text-white'
                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold">Week 2: Practice</span>
              <span className="text-slate-400">
                {planData.progress.week2Completed}/{planData.progress.week2Total}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Days 8–14 • Hands-on Copilot tools</p>
          </button>

          <button
            id="filter-week3-btn"
            onClick={() => setActivePhaseFilter(activePhaseFilter === 'week3' ? 'all' : 'week3')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              activePhaseFilter === 'week3'
                ? 'bg-blue-950/50 border-blue-500 text-white'
                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold">Week 3: Application</span>
              <span className="text-slate-400">
                {planData.progress.week3Completed}/{planData.progress.week3Total}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Days 15–21 • Project scoping & redesign</p>
          </button>

          <button
            id="filter-week4-btn"
            onClick={() => setActivePhaseFilter(activePhaseFilter === 'week4' ? 'all' : 'week4')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              activePhaseFilter === 'week4'
                ? 'bg-blue-950/50 border-blue-500 text-white'
                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold">Week 4: Impact</span>
              <span className="text-slate-400">
                {planData.progress.week4Completed}/{planData.progress.week4Total}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Days 22–30 • Measurement & review</p>
          </button>
        </div>
      </div>

      {/* Transformation Project Scoping Card (Days 15-30) */}
      {planData.transformationProject && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">
                Featured Transformation Project Blueprint (Days 15–30 Focus)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
              {planData.transformationProject.opportunityType}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Process & Problem:</span>
              <p className="text-white font-semibold mt-0.5">{planData.transformationProject.processOrProblem}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Current Operational Pain Point:</span>
              <p className="text-slate-300 mt-0.5">{planData.transformationProject.currentPainPoint}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Proposed AI/Automation Opportunity:</span>
              <p className="text-slate-300 mt-0.5">{planData.transformationProject.proposedOpportunity}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Expected Illustrative Benefit:</span>
              <p className="text-emerald-400 font-semibold mt-0.5">{planData.transformationProject.expectedBenefit}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Risks & Hallucination Guardrails:</span>
              <p className="text-slate-300 mt-0.5">{planData.transformationProject.risks}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Mandatory Human Oversight Gate:</span>
              <p className="text-amber-300 mt-0.5">{planData.transformationProject.humanOversight}</p>
            </div>
          </div>
        </div>
      )}

      {/* 30-Day Timeline & Daily Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">
              Daily Transformation Activities ({filteredDays.length} Activities Shown)
            </h3>
          </div>
          {activePhaseFilter !== 'all' && (
            <button
              onClick={() => setActivePhaseFilter('all')}
              className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              Show All 30 Days
            </button>
          )}
        </div>

        <div className="space-y-3">
          {filteredDays.map((day) => {
            const isCompleted = day.completionStatus === 'completed';
            const isExpanded = expandedDay === day.day;
            const isReflecting = activeDayReflection === day.day;

            return (
              <div
                key={day.day}
                id={`plan-day-card-${day.day}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-md ${
                  isCompleted
                    ? 'bg-slate-900/60 border-slate-800/90'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Day Header Row */}
                <div
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      id={`day-status-btn-${day.day}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDayStatus(day.day, day.completionStatus);
                      }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : 'bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-700'
                      }`}
                      title={isCompleted ? 'Mark as Not Completed' : 'Mark as Completed'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-400">Day {day.day}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {day.phase}
                        </span>
                        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{day.estimatedMinutes} mins</span>
                        </div>
                      </div>
                      <h4
                        className={`text-sm font-semibold mt-0.5 ${
                          isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {day.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                      {getToolIcon(day.toolId)}
                      <span>{day.capability}</span>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Day Details Expansion */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-800/60 space-y-4 text-xs bg-slate-950/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium">Objective:</span>
                        <p className="text-slate-200 leading-relaxed">{day.objective}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium">Expected Tangible Outcome:</span>
                        <p className="text-emerald-300 leading-relaxed">{day.expectedOutcome}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="text-slate-400 font-medium">Practical Action:</span>
                      <p className="text-slate-200 leading-relaxed font-sans">{day.activity}</p>
                    </div>

                    {/* Governance Notice */}
                    <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/50 flex items-start gap-2.5 text-slate-300">
                      <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-blue-300 font-semibold text-[11px]">Human-in-the-Loop Governance:</span>
                        <p className="text-[11px] text-slate-300">{day.governanceConsideration}</p>
                      </div>
                    </div>

                    {/* Recorded User Reflection / Notes */}
                    {day.userNotes && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-semibold">Your Recorded Reflection:</span>
                          <span className="text-slate-500">
                            Confidence: {day.confidence ?? 5}/5 • {day.timeSpentMinutes ?? 20}m spent
                          </span>
                        </div>
                        <p className="text-slate-300 italic">{day.userNotes}</p>
                      </div>
                    )}

                    {/* Inline Reflection Form */}
                    {isReflecting && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-blue-800/80 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">Record Day {day.day} Learning & Reflection</span>
                          <button
                            onClick={() => setActiveDayReflection(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] text-slate-400">
                            Key takeaway, observation, or lesson learned:
                          </label>
                          <textarea
                            id={`reflection-notes-${day.day}`}
                            value={reflectionNotes}
                            onChange={(e) => setReflectionNotes(e.target.value)}
                            placeholder="What worked well? Where was human verification essential? How will you integrate this into your daily workflow?"
                            rows={3}
                            className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Confidence (1-5):</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReflectionConfidence(star)}
                                  className={`p-1 rounded cursor-pointer ${
                                    reflectionConfidence >= star ? 'text-amber-400' : 'text-slate-600'
                                  }`}
                                >
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Time spent:</span>
                            <select
                              value={reflectionTimeSpent}
                              onChange={(e) => setReflectionTimeSpent(Number(e.target.value))}
                              className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white text-[11px]"
                            >
                              <option value={15}>15 mins</option>
                              <option value={20}>20 mins</option>
                              <option value={30}>30 mins</option>
                              <option value={45}>45 mins</option>
                              <option value={60}>60 mins</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            id={`save-reflection-btn-${day.day}`}
                            onClick={() => handleSaveDayReflection(day.day)}
                            disabled={savingReflection || reflectionNotes.trim().length === 0}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                          >
                            {savingReflection ? 'Saving...' : 'Save Reflection & Complete'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        {day.toolId && (
                          <button
                            id={`open-tool-btn-${day.day}`}
                            onClick={() => onNavigateToModule(day.toolId as AppModuleType)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer border border-slate-700"
                          >
                            {getToolIcon(day.toolId)}
                            <span>Open {getToolDisplayName(day.toolId)}</span>
                          </button>
                        )}

                        <button
                          id={`record-reflection-toggle-btn-${day.day}`}
                          onClick={() => {
                            setActiveDayReflection(isReflecting ? null : day.day);
                            setReflectionNotes(day.userNotes || '');
                            setReflectionConfidence(day.confidence || 4);
                            setReflectionTimeSpent(day.timeSpentMinutes || 20);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-medium transition cursor-pointer border border-slate-800"
                        >
                          <Star className="w-3 h-3 text-amber-400" />
                          <span>{day.userNotes ? 'Edit Reflection' : 'Record Reflection'}</span>
                        </button>
                      </div>

                      <button
                        id={`mark-complete-btn-${day.day}`}
                        onClick={() => handleToggleDayStatus(day.day, day.completionStatus)}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer ${
                          isCompleted
                            ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Mark as Not Completed' : 'Complete Activity'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Governance Notice Footer */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            {planData.advisoryDisclaimer} • {planData.syntheticDataNotice}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span>Model: {planData.modelUsed || 'Gemini 3.6 Flash'}</span>
        </div>
      </div>

      {/* Final Review Modal */}
      {showFinalReviewModal && planData.finalReview && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Day 30 Executive Transformation Review</h3>
                  <p className="text-xs text-slate-400">Comprehensive program synthesis and horizon roadmap</p>
                </div>
              </div>
              <button
                id="close-final-review-btn"
                onClick={() => setShowFinalReviewModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-semibold text-white">Transformation Opportunity Identified:</span>
                <p className="text-slate-300 leading-relaxed">
                  {planData.finalReview.transformationOpportunityIdentified}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-white">Illustrative Target Impact:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {planData.finalReview.illustrativeImpact.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">{item.metric}</span>
                      <p className="font-bold text-emerald-400 mt-0.5">{item.projectedImprovement}</p>
                      <span className="text-[10px] text-slate-500 italic block mt-1">{item.disclaimer}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-white">Governance Guardrails Upheld:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {planData.finalReview.governanceConsiderations.map((gov, idx) => (
                    <li key={idx}>{gov}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-white">Key Lessons Learned:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {planData.finalReview.lessonsLearned.map((lesson, idx) => (
                    <li key={idx}>{lesson}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800 space-y-1">
                <span className="font-semibold text-indigo-300">Recommended Next Horizon:</span>
                <p className="text-slate-200">{planData.finalReview.recommendedNextStep}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                id="close-review-modal-btn"
                onClick={() => setShowFinalReviewModal(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                Continue Transformation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
