import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Layers,
  ExternalLink,
  Star,
  RefreshCw,
  Send,
  Copy,
  Filter,
  Search,
  Compass,
  Mail,
  TrendingUp,
  FileText,
  Brain,
  Clock,
  Target,
  ChevronRight,
  GraduationCap,
  Lock,
  MessageSquare,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import {
  LearningModule,
  LearningProgressData,
  LearningStage,
  ModuleProgressState,
  ExerciseEvaluationResult,
  TransformationAssessmentOutput,
  AppModuleType,
  InteractionSession,
} from '../types';
import {
  CORE_LEARNING_MODULES,
  generatePersonalizedLearningPath,
  ROLE_SCENARIOS,
} from '../data/learningAcademyData';
import {
  evaluateAcademyExercise,
  submitAcademyReflection,
  detectSensitiveData,
  AIServiceError,
} from '../services/aiService';
import {
  saveInteraction,
  getUserInteractions,
} from '../services/interactionService';

interface LearningAcademyProps {
  userId: string;
  onNavigateToModule?: (module: AppModuleType, prefilledData?: any) => void;
  onNavigateToAssessment?: () => void;
}

export const LearningAcademy: React.FC<LearningAcademyProps> = ({
  userId,
  onNavigateToModule,
  onNavigateToAssessment,
}) => {
  // Assessment state
  const [assessmentResult, setAssessmentResult] = useState<TransformationAssessmentOutput | null>(null);
  const [loadingAssessment, setLoadingAssessment] = useState<boolean>(true);

  // Curriculum state
  const [modules, setModules] = useState<LearningModule[]>(CORE_LEARNING_MODULES);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // User learning progress map: moduleId -> LearningProgressData
  const [progressMap, setProgressMap] = useState<Record<string, LearningProgressData>>({});
  const [savingProgress, setSavingProgress] = useState<boolean>(false);

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'priority' | 'in_progress' | 'completed'>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Active module stage states
  const [activeStage, setActiveStage] = useState<LearningStage>('learn');

  // Stage 2 Practice Exercise state
  const [userExerciseAnswer, setUserExerciseAnswer] = useState<string>('');
  const [isEvaluatingExercise, setIsEvaluatingExercise] = useState<boolean>(false);
  const [exerciseEvaluation, setExerciseEvaluation] = useState<ExerciseEvaluationResult | null>(null);
  const [exerciseError, setExerciseError] = useState<string | null>(null);
  const [practiceSensitiveWarning, setPracticeSensitiveWarning] = useState<string | null>(null);

  // Stage 4 Reflection state
  const [confidenceRating, setConfidenceRating] = useState<number>(4);
  const [reflectionNotes, setReflectionNotes] = useState<string>('');
  const [isSubmittingReflection, setIsSubmittingReflection] = useState<boolean>(false);
  const [reflectionSuccess, setReflectionSuccess] = useState<string | null>(null);
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [reflectionSensitiveWarning, setReflectionSensitiveWarning] = useState<string | null>(null);

  // Copy feedback notification
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // -------------------------------------------------------------
  // 1. Initial Data Fetching (Assessment & Stored Progress)
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function loadUserData() {
      if (!userId) {
        setLoadingAssessment(false);
        return;
      }

      setLoadingAssessment(true);

      try {
        // Fetch existing assessment if available
        const assessmentSessions = await getUserInteractions(userId, 'transformation_assessment');
        let latestAssessment: TransformationAssessmentOutput | null = null;

        if (assessmentSessions.length > 0) {
          // Sort by updatedAt desc
          const sorted = [...assessmentSessions].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          if (sorted[0].transformationAssessmentData?.result) {
            latestAssessment = sorted[0].transformationAssessmentData.result;
          }
        }

        if (isMounted && latestAssessment) {
          setAssessmentResult(latestAssessment);
          const personalizedResult = generatePersonalizedLearningPath(latestAssessment);
          setModules(personalizedResult.modules);
        } else if (isMounted) {
          // Default foundation curriculum
          setModules(CORE_LEARNING_MODULES);
        }

        // Fetch stored learning progress
        const progressSessions = await getUserInteractions(userId, 'learning_progress');
        if (isMounted && progressSessions.length > 0) {
          const map: Record<string, LearningProgressData> = {};
          progressSessions.forEach((s) => {
            if (s.learningProgressData?.moduleId) {
              map[s.learningProgressData.moduleId] = s.learningProgressData;
            }
          });
          setProgressMap(map);
        }
      } catch (err) {
        console.warn('[Academy] Notice loading stored progress or assessment:', err);
      } finally {
        if (isMounted) {
          setLoadingAssessment(false);
        }
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Active module object
  const activeModule = useMemo(() => {
    if (!selectedModuleId) return null;
    return modules.find((m) => m.id === selectedModuleId) || null;
  }, [modules, selectedModuleId]);

  // Current module progress
  const activeProgress = useMemo(() => {
    if (!selectedModuleId) return null;
    return progressMap[selectedModuleId] || null;
  }, [selectedModuleId, progressMap]);

  // Switch to selected module
  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    const existing = progressMap[moduleId];
    if (existing) {
      setActiveStage(existing.currentStage || 'learn');
      setConfidenceRating(existing.confidenceRating || 4);
      setReflectionNotes(existing.reflectionNotes || '');
    } else {
      setActiveStage('learn');
      setConfidenceRating(4);
      setReflectionNotes('');
    }
    setUserExerciseAnswer('');
    setExerciseEvaluation(null);
    setExerciseError(null);
    setPracticeSensitiveWarning(null);
    setReflectionSuccess(null);
    setReflectionError(null);
    setReflectionSensitiveWarning(null);
  };

  // Back to Curriculum
  const handleBackToCurriculum = () => {
    setSelectedModuleId(null);
    setExerciseEvaluation(null);
    setUserExerciseAnswer('');
    setReflectionSuccess(null);
  };

  // Helper to persist module progress to Firestore
  const persistModuleProgress = async (
    moduleId: string,
    updates: Partial<ModuleProgressState>
  ) => {
    if (!userId) return;
    setSavingProgress(true);

    try {
      const nowIso = new Date().toISOString();
      const current = progressMap[moduleId] || {
        moduleId,
        status: 'in_progress',
        currentStage: 'learn',
        completedStages: [],
      };

      const updatedProgress: ModuleProgressState = {
        ...current,
        ...updates,
      };

      // Update local state immediately
      setProgressMap((prev) => ({
        ...prev,
        [moduleId]: updatedProgress,
      }));

      // Persist as an InteractionSession with type: 'learning_progress'
      const sessionId = `academy_${moduleId}`;
      const sessionPayload: InteractionSession = {
        id: sessionId,
        userId,
        type: 'learning_progress',
        title: `AI Academy: ${activeModule?.title || moduleId}`,
        description: `Progress in ${activeModule?.title || moduleId} (${updatedProgress.status})`,
        createdAt: current.completedAt || nowIso,
        updatedAt: nowIso,
        learningProgressData: updatedProgress,
      };

      await saveInteraction(userId, sessionPayload);
    } catch (err) {
      console.error('[Academy] Failed to persist learning progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Complete Learn stage
  const handleCompleteLearnStage = () => {
    if (!activeModule) return;
    const completedStages = Array.from(
      new Set([...(activeProgress?.completedStages || []), 'learn'])
    );
    persistModuleProgress(activeModule.id, {
      status: 'in_progress',
      currentStage: 'practice',
      completedStages,
    });
    setActiveStage('practice');
  };

  // Evaluate Practice Exercise via Server Endpoint
  const handleEvaluateExercise = async () => {
    if (!activeModule || !userExerciseAnswer.trim()) return;

    if (detectSensitiveData(userExerciseAnswer)) {
      setPracticeSensitiveWarning(
        'Confidential banking data detected (card number, SSN, PIN, password). Please sanitize your submission and use synthetic examples.'
      );
      return;
    }

    setIsEvaluatingExercise(true);
    setExerciseError(null);
    setPracticeSensitiveWarning(null);

    try {
      const resp = await evaluateAcademyExercise({
        moduleId: activeModule.id,
        exerciseId: activeModule.practiceExercise.id,
        exerciseType: activeModule.practiceExercise.type,
        userSubmission: userExerciseAnswer,
        role: assessmentResult?.role || 'Banking Professional',
      });

      setExerciseEvaluation(resp.result);

      // Record stage completion
      const completedStages = Array.from(
        new Set([...(activeProgress?.completedStages || []), 'practice'])
      );
      persistModuleProgress(activeModule.id, {
        status: 'in_progress',
        currentStage: 'practice',
        completedStages,
        exerciseFeedback: resp.result.feedbackSummary,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Evaluation service error';
      setExerciseError(msg);
    } finally {
      setIsEvaluatingExercise(false);
    }
  };

  // Complete Practice stage & proceed to Apply
  const handleProceedToApply = () => {
    if (!activeModule) return;
    const completedStages = Array.from(
      new Set([...(activeProgress?.completedStages || []), 'practice'])
    );
    persistModuleProgress(activeModule.id, {
      status: 'in_progress',
      currentStage: 'apply',
      completedStages,
    });
    setActiveStage('apply');
  };

  // Complete Apply stage & proceed to Reflect
  const handleProceedToReflect = () => {
    if (!activeModule) return;
    const completedStages = Array.from(
      new Set([...(activeProgress?.completedStages || []), 'apply'])
    );
    persistModuleProgress(activeModule.id, {
      status: 'in_progress',
      currentStage: 'reflect',
      completedStages,
    });
    setActiveStage('reflect');
  };

  // Submit Reflection and Complete Module
  const handleSubmitReflection = async () => {
    if (!activeModule) return;

    if (reflectionNotes && detectSensitiveData(reflectionNotes)) {
      setReflectionSensitiveWarning(
        'Potential sensitive banking data detected in reflection notes. Please remove confidential information.'
      );
      return;
    }

    setIsSubmittingReflection(true);
    setReflectionError(null);
    setReflectionSuccess(null);
    setReflectionSensitiveWarning(null);

    try {
      const resp = await submitAcademyReflection({
        moduleId: activeModule.id,
        confidence: confidenceRating,
        reflectionNotes: reflectionNotes || 'Module completed with high alignment to banking workflow standards.',
        assessmentId: assessmentResult ? 'latest_phase5c' : undefined,
        status: 'completed',
      });

      const completedStages = Array.from(
        new Set([...(activeProgress?.completedStages || []), 'learn', 'practice', 'apply', 'reflect'])
      );

      await persistModuleProgress(activeModule.id, {
        status: 'completed',
        currentStage: 'reflect',
        completedStages,
        confidenceRating,
        reflectionNotes: resp.sanitizedNotes,
        completedAt: resp.completedAt,
      });

      setReflectionSuccess(resp.coachingEncouragement);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit reflection.';
      setReflectionError(msg);
    } finally {
      setIsSubmittingReflection(false);
    }
  };

  // Filtered module list
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesDimension = m.dimensionName.toLowerCase().includes(q);
        const matchesRoles = m.roles.some((r) => r.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesDimension && !matchesRoles) {
          return false;
        }
      }

      // Status
      const state = progressMap[m.id];
      const isCompleted = state?.status === 'completed';
      const isInProgress = state?.status === 'in_progress';
      const isPriority = m.isPriorityGap;

      if (filterStatus === 'priority' && !isPriority) return false;
      if (filterStatus === 'in_progress' && !isInProgress) return false;
      if (filterStatus === 'completed' && !isCompleted) return false;

      // Role
      if (filterRole !== 'all') {
        const hasRole = m.roles.some((r) => r.toLowerCase().includes(filterRole.toLowerCase()));
        if (!hasRole) return false;
      }

      // Difficulty
      if (filterDifficulty !== 'all' && m.difficulty.toLowerCase() !== filterDifficulty.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [modules, progressMap, searchQuery, filterStatus, filterRole, filterDifficulty]);

  // Aggregate completion metrics
  const completedCount = useMemo(() => {
    return Object.values(progressMap).filter((p) => p.status === 'completed').length;
  }, [progressMap]);

  const completionPercent = Math.round((completedCount / CORE_LEARNING_MODULES.length) * 100);

  // Earned badges based on completed modules
  const earnedBadges = useMemo(() => {
    const badges: { id: string; title: string; desc: string; icon: any; earned: boolean }[] = [
      {
        id: 'prompt_master',
        title: 'Prompt Engineer',
        desc: 'Completed Enterprise Prompt Engineering module',
        icon: Sparkles,
        earned: progressMap['module-2-prompt-engineering']?.status === 'completed',
      },
      {
        id: 'governance_champion',
        title: 'Governance Champion',
        desc: 'Completed Responsible AI & Banking Governance module',
        icon: ShieldCheck,
        earned: progressMap['module-6-responsible-ai-governance']?.status === 'completed',
      },
      {
        id: 'process_optimizer',
        title: 'Process Optimizer',
        desc: 'Completed Banking Process Transformation module',
        icon: TrendingUp,
        earned: progressMap['module-3-process-transformation']?.status === 'completed',
      },
      {
        id: 'agent_architect',
        title: 'Agent Architect',
        desc: 'Completed AI Agents & Autonomous Workflows module',
        icon: Brain,
        earned: progressMap['module-7-ai-agents']?.status === 'completed',
      },
      {
        id: 'transformation_leader',
        title: 'Executive Strategist',
        desc: 'Completed AI Transformation Leadership module',
        icon: Award,
        earned: progressMap['module-8-transformation-leadership']?.status === 'completed',
      },
    ];
    return badges;
  }, [progressMap]);

  // Find next recommended module
  const nextRecommendedModule = useMemo(() => {
    return modules.find((m) => progressMap[m.id]?.status !== 'completed');
  }, [modules, progressMap]);

  // -------------------------------------------------------------
  // RENDER: MODULE DETAIL VIEW (4-STAGE WORKSPACE)
  // -------------------------------------------------------------
  if (activeModule) {
    const isCompleted = activeProgress?.status === 'completed';

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToCurriculum}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Curriculum Overview</span>
          </button>

          <div className="flex items-center gap-3">
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Module Completed</span>
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono">
              Est. {activeModule.estimatedMinutes} min
            </span>
          </div>
        </div>

        {/* Module Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800/60 uppercase tracking-wider">
              Module {activeModule.order}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {activeModule.dimensionName}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {activeModule.difficulty}
            </span>
            {activeModule.isPriorityGap && (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">
                ★ Priority Gap #{activeModule.gapRank}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {activeModule.title}
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
              {activeModule.description}
            </p>
          </div>

          {/* 4-Stage Stepper Bar */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'learn' as LearningStage, label: '1. Learn', icon: BookOpen },
              { id: 'practice' as LearningStage, label: '2. Practice', icon: Sparkles },
              { id: 'apply' as LearningStage, label: '3. Apply', icon: ExternalLink },
              { id: 'reflect' as LearningStage, label: '4. Reflect', icon: CheckCircle2 },
            ].map((stage) => {
              const isActive = activeStage === stage.id;
              const isStageDone = activeProgress?.completedStages?.includes(stage.id);
              const StageIcon = stage.icon;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStage(stage.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition ${
                    isActive
                      ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-xs'
                      : isStageDone
                      ? 'bg-slate-950/60 border-slate-800 text-emerald-400 hover:bg-slate-800/60'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isStageDone
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <StageIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{stage.label}</div>
                    <div className="text-[10px] text-slate-400">
                      {isStageDone ? 'Completed' : isActive ? 'Active' : 'Pending'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STAGE 1: LEARN */}
        {/* ------------------------------------------------------------- */}
        {activeStage === 'learn' && (
          <div className="space-y-6">
            {/* Core Theory & Concept Brief */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-3">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Core Concept & Executive Foundation
                </h3>
              </div>
              <div className="text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line">
                {activeModule.content.coreConcept}
              </div>
            </div>

            {/* Banking Use Case & Real-World Context */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800 pb-3">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Banking Use Case: {activeModule.content.bankingUseCase.title}
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeModule.content.bankingUseCase.context}
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Operational Workflow Impact
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {activeModule.content.bankingUseCase.workflowImpact}
                </p>
              </div>
            </div>

            {/* Recommended Banking Prompt Pattern */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Institutional Prompt Structure & Syntax
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeModule.content.promptTechnique.template);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPrompt ? 'Copied!' : 'Copy Template'}</span>
                </button>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300">
                  Pattern Name: {activeModule.content.promptTechnique.patternName}
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeModule.content.promptTechnique.description}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
                  {activeModule.content.promptTechnique.template}
                </pre>
              </div>
            </div>

            {/* Common Pitfalls in Banking */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-3">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Critical Banking Pitfalls & Failure Modes
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeModule.content.commonPitfalls.map((pitfall, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-rose-950/40 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-950 text-rose-400 font-bold flex items-center justify-center shrink-0 border border-rose-800 text-[10px]">
                      !
                    </span>
                    <span className="leading-relaxed">{pitfall}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role-Specific Banking Scenarios */}
            {activeModule.roleScenarios && activeModule.roleScenarios.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Role-Specific Banking Scenarios
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeModule.roleScenarios.map((scen, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-900">
                        {scen.role}
                      </span>
                      <h4 className="text-xs font-bold text-white">{scen.scenarioTitle}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{scen.challenge}</p>
                      <div className="pt-2 border-t border-slate-900 text-[11px] text-emerald-400 font-mono">
                        ✦ Recommended Approach: {scen.solution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1 Completion Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleCompleteLearnStage}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition shadow-lg"
              >
                <span>Complete Concept Stage & Start Practice</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 2: PRACTICE */}
        {/* ------------------------------------------------------------- */}
        {activeStage === 'practice' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Stage 2: Interactive Practice Challenge
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  {activeModule.practiceExercise.title}
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {activeModule.practiceExercise.scenario}
                </p>
              </div>

              {/* Instructions & Guidelines */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span>Exercise Task & Guidelines</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeModule.practiceExercise.instruction}
                </p>

                {activeModule.practiceExercise.hints && (
                  <div className="pt-2 border-t border-slate-900 space-y-1">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Faculty Guidance & Hints:
                    </span>
                    <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                      {activeModule.practiceExercise.hints.map((hint, hIdx) => (
                        <li key={hIdx}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Synthetic Data Warning Banner */}
              <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Institutional Data Privacy Standard:</span> Use synthetic, fictitious client details only. Do not enter real customer credit card numbers, passwords, PINs, or SSNs.
                </div>
              </div>

              {/* Student Practice Input Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Your Exercise Submission / Structured Prompt</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {userExerciseAnswer.length} / 20,000 characters
                  </span>
                </label>
                <textarea
                  rows={8}
                  value={userExerciseAnswer}
                  onChange={(e) => {
                    setUserExerciseAnswer(e.target.value);
                    if (detectSensitiveData(e.target.value)) {
                      setPracticeSensitiveWarning(
                        'Potential sensitive banking data detected (card number, SSN, PIN, password). Please sanitize your input.'
                      );
                    } else {
                      setPracticeSensitiveWarning(null);
                    }
                  }}
                  placeholder="Draft your response here (e.g. prompt template with clear role, objective, negative constraints, and human-in-the-loop signoff criteria)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {practiceSensitiveWarning && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{practiceSensitiveWarning}</span>
                  </div>
                )}

                {exerciseError && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{exerciseError}</span>
                  </div>
                )}
              </div>

              {/* Submit to AI Faculty Evaluation Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Prefill a high-quality standard answer
                    setUserExerciseAnswer(
                      `Role: Commercial Banking Portfolio Analyst\nObjective: Summarize annual financial statements for Acme Logistics LLC with explicit focus on EBITDA trends and covenant compliance.\nConstraints: Adhere to Bank Credit Policy CP-2024. If debt service coverage ratio (DSCR) is below 1.25x, flag as mandatory review.\nHuman-in-the-Loop: Draft executive summary for Maker-Checker dual authorization. Do not finalize credit rating without Underwriter sign-off.\nOutput Format: Bullet points with exact source citations.`
                    );
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 underline transition"
                >
                  Load Sample Professional Submission
                </button>

                <button
                  type="button"
                  onClick={handleEvaluateExercise}
                  disabled={isEvaluatingExercise || !userExerciseAnswer.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 disabled:opacity-50 transition shadow-md"
                >
                  {isEvaluatingExercise ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating via Senior AI Faculty...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Faculty Feedback</span>
                    </>
                  )}
                </button>
              </div>

              {/* Gemini AI Feedback Card */}
              {exerciseEvaluation && (
                <div className="bg-slate-950 border border-blue-900/60 rounded-xl p-6 space-y-4 shadow-xl animate-fade-in">
                  <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-3">
                    <Award className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      AI Faculty Coaching Assessment
                    </h3>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {exerciseEvaluation.feedbackSummary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Strengths Demonstrated</span>
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        {exerciseEvaluation.strengths.map((st, sIdx) => (
                          <li key={sIdx}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Refinement Opportunities</span>
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        {exerciseEvaluation.areasForImprovement.map((imp, iIdx) => (
                          <li key={iIdx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Governance Evaluation */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-1">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Governance & Compliance Alignment</span>
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {exerciseEvaluation.governanceAssessment}
                    </p>
                  </div>

                  {/* Suggested Refinement */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-1">
                    <span className="text-xs font-bold text-slate-300">
                      Expert Banker Refinement Example:
                    </span>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
                      {exerciseEvaluation.suggestedRefinement}
                    </p>
                  </div>

                  {/* Coach Tip */}
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/40 text-xs text-blue-300">
                    <span className="font-bold">Coach Tip:</span> {exerciseEvaluation.coachTip}
                  </div>
                </div>
              )}

              {/* Proceed to Stage 3 Button */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleProceedToApply}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition shadow-lg"
                >
                  <span>Mark Practice Complete & Proceed to Apply</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 3: APPLY (TOOL INTEGRATION HAND-OFF) */}
        {/* ------------------------------------------------------------- */}
        {activeStage === 'apply' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ExternalLink className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Stage 3: Hands-On Application in AI Banker Tools
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  Bridge Learning to Operational Daily Banking Workflows
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Put what you learned into immediate live practice using our production AI Banker Copilot tools.
                </p>
              </div>

              {/* Recommended Tool Deep-Link Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-400">
                      {activeModule.applyLink?.module === 'copilot' && <Sparkles className="w-5 h-5" />}
                      {activeModule.applyLink?.module === 'meeting_prep' && <FileText className="w-5 h-5" />}
                      {activeModule.applyLink?.module === 'email_assistant' && <Mail className="w-5 h-5" />}
                      {activeModule.applyLink?.module === 'process_optimizer' && <TrendingUp className="w-5 h-5" />}
                      {activeModule.applyLink?.module === 'project_compass' && <Compass className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Recommended Operational Destination
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {activeModule.applyLink?.title || 'AI Banker Copilot'}
                      </h3>
                    </div>
                  </div>

                  {onNavigateToModule && activeModule.applyLink && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateToModule(
                          activeModule.applyLink!.module,
                          activeModule.applyLink!.prefilledContext
                        );
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow-md"
                    >
                      <span>Launch in {activeModule.applyLink.module.replace('_', ' ').toUpperCase()}</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeModule.applyLink?.actionPrompt}
                </p>

                {activeModule.applyLink?.prefilledContext && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Pre-Configured Context Template:
                    </span>
                    <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                      {JSON.stringify(activeModule.applyLink.prefilledContext, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Proceed to Stage 4 Button */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleProceedToReflect}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition shadow-lg"
                >
                  <span>Mark Application Complete & Proceed to Reflect</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 4: REFLECT & COMPLETE */}
        {/* ------------------------------------------------------------- */}
        {activeStage === 'reflect' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Stage 4: Key Takeaways & Self-Reflection
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  Synthesize Learning & Commit to Operational Practice
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Review the core executive takeaways and record how you plan to integrate these techniques into your workflow.
                </p>
              </div>

              {/* Key Takeaways Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Core Module Takeaways
                </span>
                <ul className="text-xs text-slate-300 space-y-2">
                  {activeModule.reflectionTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-purple-800">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confidence Rating Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300">
                  Self-Assessment: Rate Your Confidence in Applying This Concept (1 to 5)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 1, label: '1 - Emerging' },
                    { value: 2, label: '2 - Developing' },
                    { value: 3, label: '3 - Competent' },
                    { value: 4, label: '4 - Proficient' },
                    { value: 5, label: '5 - Mastery' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setConfidenceRating(item.value)}
                      className={`p-3 rounded-xl border text-center transition ${
                        confidenceRating === item.value
                          ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star
                          className={`w-3.5 h-3.5 ${
                            confidenceRating >= item.value ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </div>
                      <div className="text-xs font-semibold">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reflection Notes Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>How will you incorporate this into your weekly banking routine?</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {reflectionNotes.length} / 10,000 chars
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={reflectionNotes}
                  onChange={(e) => {
                    setReflectionNotes(e.target.value);
                    if (detectSensitiveData(e.target.value)) {
                      setReflectionSensitiveWarning(
                        'Potential sensitive data detected. Please keep reflection notes strictly conceptual.'
                      );
                    } else {
                      setReflectionSensitiveWarning(null);
                    }
                  }}
                  placeholder="e.g. I will use structured boundary prompt templates for client email drafts, ensure dual Maker-Checker review before customer release..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {reflectionSensitiveWarning && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{reflectionSensitiveWarning}</span>
                  </div>
                )}

                {reflectionError && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{reflectionError}</span>
                  </div>
                )}

                {reflectionSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 space-y-1 animate-fade-in">
                    <div className="font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Module Successfully Completed & Stored!</span>
                    </div>
                    <p className="text-emerald-300 leading-relaxed">{reflectionSuccess}</p>
                  </div>
                )}
              </div>

              {/* Complete Module Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleBackToCurriculum}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Return to Curriculum
                </button>

                <button
                  type="button"
                  onClick={handleSubmitReflection}
                  disabled={isSubmittingReflection}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition shadow-lg"
                >
                  {isSubmittingReflection ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Finalizing Module Progress...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Complete Module & Save Progress</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: ACADEMY DASHBOARD (CURRICULUM OVERVIEW)
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Academy Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>Phase 5D Live</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                8 Core Banking Topics • Learn → Practice → Apply → Reflect
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI Learning Academy
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Personalized, role-tailored curriculum designed to elevate banking professionals into confident, governance-grounded Generative AI practitioners.
            </p>
          </div>

          {/* Overall Progress Gauge */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Academy Completion</span>
              <span className="font-bold text-blue-400 font-mono">{completionPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{completedCount} of 8 Modules Done</span>
              <span>{8 - completedCount} Remaining</span>
            </div>
          </div>
        </div>

        {/* Earned Milestones & Badges Ribbon */}
        <div className="pt-4 border-t border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Earned Competency Badges
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {earnedBadges.map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={badge.id}
                  title={badge.desc}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                    badge.earned
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      badge.earned ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{badge.title}</div>
                    <div className="text-[10px] truncate">
                      {badge.earned ? 'Earned' : 'Locked'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assessment Connection Banner */}
      {assessmentResult ? (
        <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Personalized from Phase 5C Assessment
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Baseline: {assessmentResult.overallScore}/100 ({assessmentResult.maturityLevel})
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Curriculum is actively ranked by your greatest skill growth opportunities:
              <strong className="text-white ml-1">
                {modules.filter((m) => m.isPriorityGap).map((m) => m.dimensionName).slice(0, 3).join(', ')}
              </strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {nextRecommendedModule && (
              <button
                type="button"
                onClick={() => handleSelectModule(nextRecommendedModule.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition shadow-sm"
              >
                <span>Resume: {nextRecommendedModule.title.split(':')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Explore in Foundation Mode
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Complete the Phase 5C Transformation Assessment to unlock an automated skill gap ranking and customized learning path.
            </p>
          </div>

          {onNavigateToAssessment && (
            <button
              type="button"
              onClick={onNavigateToAssessment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-500 transition shadow-sm"
            >
              <span>Take 8-Dimension Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, skills, or banking roles..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Modules</option>
            <option value="priority">Priority Gaps</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Banking Roles</option>
            <option value="commercial">Commercial Banking</option>
            <option value="retail">Retail Banking</option>
            <option value="wealth">Wealth Management</option>
            <option value="risk">Risk & Compliance</option>
            <option value="operations">Operations</option>
            <option value="executive">Leadership / Executive</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Curriculum Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredModules.map((module) => {
          const state = progressMap[module.id];
          const isDone = state?.status === 'completed';
          const isInProgress = state?.status === 'in_progress';

          return (
            <div
              key={module.id}
              className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all duration-200 hover:border-slate-700 ${
                isDone
                  ? 'border-emerald-900/60 shadow-xs'
                  : module.isPriorityGap
                  ? 'border-amber-900/60 shadow-md'
                  : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Module {module.order}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {module.difficulty}
                    </span>
                    {module.isPriorityGap && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        Priority Gap #{module.gapRank}
                      </span>
                    )}
                  </div>

                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Complete</span>
                    </span>
                  ) : isInProgress ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>In Progress</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Not Started</span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                    {module.description}
                  </p>
                </div>

                {/* 4-Stage Mini Indicator */}
                <div className="grid grid-cols-4 gap-1.5 pt-2">
                  {['learn', 'practice', 'apply', 'reflect'].map((stageName) => {
                    const isStageDone = state?.completedStages?.includes(stageName);
                    return (
                      <div
                        key={stageName}
                        className={`h-1.5 rounded-full ${
                          isStageDone ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                        title={`${stageName}: ${isStageDone ? 'Done' : 'Pending'}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Action Button & Meta */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {module.estimatedMinutes} min
                </span>

                <button
                  type="button"
                  onClick={() => handleSelectModule(module.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                    isDone
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : isInProgress
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-slate-800 text-white hover:bg-blue-600'
                  }`}
                >
                  <span>{isDone ? 'Review Module' : isInProgress ? 'Resume Module' : 'Start Module'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Governance & Educational Notice Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-slate-300">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Educational & Governance Advisory Standard</span>
        </div>
        <p className="leading-relaxed">
          Learning content is educational and does not replace professional judgment. Always adhere to institutional compliance policies, maker-checker authorization protocols, and model risk standards.
        </p>
      </div>
    </div>
  );
};
