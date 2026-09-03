export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  department: string;
  institution: string;
  transformationScore: number;
  sessionsCount: number;
  completedTasksCount: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export type AppModuleType =
  | 'overview'
  | 'copilot'
  | 'meeting_prep'
  | 'project_compass'
  | 'email_assistant'
  | 'process_optimizer'
  | 'learning_assistant'
  | 'transformation_assessment'
  | 'transformation_plan'
  | 'session_history'
  | 'profile';

export * from './projectCompass';

export interface ModuleRoadmapItem {
  id: AppModuleType;
  title: string;
  description: string;
  category: 'Intelligence' | 'Productivity' | 'Optimization' | 'Development';
  badge: string;
  phase: number;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type InteractionType =
  | 'copilot'
  | 'meeting_prep'
  | 'email_assistant'
  | 'process_optimizer'
  | 'learning_assistant'
  | 'learning_progress'
  | 'transformation_assessment'
  | 'transformation_plan';

export type CustomerSegmentType =
  | 'Retail Banking'
  | 'Affluent'
  | 'Small Business'
  | 'Contact Center'
  | 'Other';

export type EmailPurposeType =
  | 'Complaint'
  | 'Service Request'
  | 'Product Inquiry'
  | 'Transaction Issue'
  | 'Fee/Charge Question'
  | 'Account Access'
  | 'Card Issue'
  | 'General Inquiry'
  | 'Other';

export type DesiredOutcomeType =
  | 'Information only'
  | 'Resolve issue'
  | 'Request documentation'
  | 'Escalate'
  | 'Follow-up required';

export interface EmailAssistantRequest {
  emailContent: string;
  customerSegment?: CustomerSegmentType | string;
  emailPurpose?: EmailPurposeType | string;
  desiredOutcome?: DesiredOutcomeType | string;
  additionalContext?: string;
}

export interface EmailAssistantEscalation {
  required: boolean;
  reason: string;
}

export interface EmailAssistantOutput {
  subjectSuggestion: string;
  executiveSummary: string;
  customerIntent: string;
  sentiment: string;
  keyIssues: string[];
  requestedActions: string[];
  missingInformation: string[];
  potentialEscalation: EmailAssistantEscalation;
  complianceConsiderations: string[];
  recommendedNextSteps: string[];
  draftResponse: string;
  alternativeResponse: string;
  followUpActions: string[];
  humanReviewRequired: boolean;
  governanceReminder: string;
}

export interface EmailAssistantResponse {
  result: EmailAssistantOutput;
  model: string;
  timestamp: string;
}

export interface MeetingPrepBrief {
  meetingTitle: string;
  meetingObjective: string;
  recommendedAgenda: string[];
  discoveryQuestions: string[];
  discussionPoints: string[];
  potentialConcerns: string[];
  suggestedResponses: string[];
  followUpActions: string[];
  governanceReminders: string[];
}

export interface MeetingPrepRequest {
  customerSegment: string;
  meetingObjective: string;
  productService: string;
  customerConcerns: string;
  meetingDuration: string;
  additionalContext?: string;
}

export interface MeetingPrepResponse {
  brief: MeetingPrepBrief;
  model: string;
  timestamp: string;
}

export interface InteractionSession {
  id: string;
  userId: string;
  type: InteractionType;
  title: string;
  description?: string | null;
  summary?: string | null;
  messages?: ChatMessage[];
  meetingPrepData?: {
    input: MeetingPrepRequest;
    brief: MeetingPrepBrief;
  };
  emailAssistantData?: {
    input: EmailAssistantRequest;
    result: EmailAssistantOutput;
  };
  processOptimizerData?: {
    input: ProcessOptimizerRequest;
    result: ProcessOptimizerOutput;
  };
  transformationAssessmentData?: {
    input: TransformationAssessmentRequest;
    result: TransformationAssessmentOutput;
  };
  learningProgressData?: LearningProgressData;
  transformationPlanData?: TransformationPlanData;
  metadata?: {
    modelUsed?: string;
    totalTurns?: number;
    topic?: string;
    generatedAt?: string;
    customerSegment?: string;
    meetingDuration?: string;
    emailType?: string;
    tone?: string;
    processName?: string;
    businessArea?: string;
    isHighRiskProcess?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type ProcessBusinessArea =
  | 'Branch Banking'
  | 'Contact Center'
  | 'Retail Operations'
  | 'Deposits'
  | 'Cards'
  | 'Payments'
  | 'Lending Operations'
  | 'Customer Service'
  | 'Compliance Operations'
  | 'Other';

export type ProcessVolume = 'Low' | 'Medium' | 'High' | 'Very High';
export type ProcessFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Event-driven';

export interface ProcessOptimizerRequest {
  processName: string;
  processDescription: string;
  businessArea?: ProcessBusinessArea | string;
  approximateVolume?: ProcessVolume | string;
  frequency?: ProcessFrequency | string;
  currentProcessingTimeMinutes?: number;
  numberOfPeopleInvolved?: number;
  systemsUsed?: string;
  majorPainPoints?: string;
  additionalContext?: string;
}

export type OpportunityCategory =
  | 'GENAI'
  | 'TRADITIONAL_AUTOMATION'
  | 'WORKFLOW_REDESIGN'
  | 'HUMAN_JUDGMENT';

export interface ProcessOpportunityItem {
  opportunity: string;
  category: OpportunityCategory | string;
  expectedBenefit: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  humanInvolvement: string;
}

export interface ProcessCurrentState {
  steps: string[];
  manualActivities: string[];
  handoffs: string[];
  systems: string[];
  bottlenecks: string[];
  reworkPoints: string[];
  errorProneActivities: string[];
}

export interface ProcessOpportunityAssessment {
  genAI: ProcessOpportunityItem[];
  traditionalAutomation: ProcessOpportunityItem[];
  workflowRedesign: ProcessOpportunityItem[];
}

export interface ProcessFutureState {
  steps: string[];
  humanInTheLoopControls: string[];
  controlPoints: string[];
}

export interface ProcessImpactAssessment {
  timeSavingPotential: string;
  costSavingPotential: string;
  customerExperienceImpact: string;
  employeeExperienceImpact: string;
  errorReductionPotential: string;
  isIllustrativeEstimate?: boolean;
  assumptions?: string[];
}

export interface ProcessImplementationAssessment {
  complexity: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  dependencies: string[];
  dataRequirements: string[];
  integrationRequirements: string[];
  recommendedPilot: string;
  timelineSuggestions?: {
    day30?: string[];
    day60?: string[];
    day90?: string[];
  };
}

export interface ProcessRiskItem {
  risk: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  mitigation: string;
}

export interface ProcessOptimizerOutput {
  processName: string;
  executiveSummary: string;
  currentState: ProcessCurrentState;
  opportunityAssessment: ProcessOpportunityAssessment;
  futureState: ProcessFutureState;
  impactAssessment: ProcessImpactAssessment;
  implementationAssessment: ProcessImplementationAssessment;
  riskAssessment: ProcessRiskItem[];
  recommendedActions: string[];
  governanceReminders: string[];
  humanReviewRequired: boolean;
  requiresHumanVerification?: boolean;
  isHighRiskProcess?: boolean;
  highRiskTriggers?: string[];
  advisoryDisclaimer?: string;
}

export interface ProcessOptimizerResponse {
  result: ProcessOptimizerOutput;
  model: string;
  timestamp: string;
}

export interface AICopilotRequest {
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  topic?: string;
}

export interface AICopilotResponse {
  reply: string;
  model: string;
  timestamp: string;
}

// -------------------------------------------------------------
// Phase 5C: Transformation Assessment Types
// -------------------------------------------------------------

export type AssessmentDimensionKey =
  | 'aiGenAIAwareness'
  | 'promptEngineering'
  | 'bankingProcessTransformation'
  | 'dataAnalyticsReadiness'
  | 'automationMindset'
  | 'responsibleAIGovernance'
  | 'practicalAIApplication'
  | 'transformationLeadership';

export type MaturityLevel =
  | 'AI Explorer'
  | 'AI Aware'
  | 'AI Practitioner'
  | 'AI Advanced Practitioner'
  | 'AI Transformation Leader';

export interface AssessmentDimensionScore {
  key: AssessmentDimensionKey;
  name: string;
  score: number;
  weight: number;
  level: MaturityLevel;
  dimensionKey?: string;
  dimensionName?: string;
  weightedScore?: number;
  maturityLevel?: MaturityLevel;
  strengths?: string[];
  areasForImprovement?: string[];
  recommendedActions?: string[];
}

export interface AssessmentQuestionOption {
  id: string;
  label: string;
  description?: string;
  score: number;
}

export interface AssessmentQuestion {
  id: string;
  dimensionKey: AssessmentDimensionKey;
  type: 'multiple_choice' | 'rating' | 'scenario';
  title: string;
  context?: string;
  options: AssessmentQuestionOption[];
}

export interface TransformationAssessmentRequest {
  role: string;
  experienceLevel: string;
  businessArea: string;
  aiExperience: string;
  transformationGoals?: string;
  operationalChallenge?: string;
  answers: {
    questionId: string;
    optionId: string;
  }[];
}

export interface TransformationAssessmentOutput {
  id: string;
  overallScore: number;
  maturityLevel: MaturityLevel;
  dimensionScores: Record<AssessmentDimensionKey, AssessmentDimensionScore>;
  strengths: string[];
  developmentPriorities: string[];
  roleSpecificRecommendations: string[];
  quickWins: string[];
  governanceFocus: string[];
  recommendedLearningTopics: string[];
  recommendedTransformationAreas: string[];
  executiveSummary: string;
  humanReviewRequired: boolean;
  advisoryDisclaimer: string;
  decisionUseWarning: string;
  role: string;
  experienceLevel: string;
  businessArea: string;
  aiExperience: string;
  calculatedAt: string;
  topStrengths?: string[];
  priorityGaps?: string[];
  recommendedNextActions?: string[];
  assessedAt?: string;
}

export interface TransformationAssessmentResponse {
  result: TransformationAssessmentOutput;
  model: string;
  timestamp: string;
}

// -------------------------------------------------------------
// Phase 5D: AI Learning Academy Types
// -------------------------------------------------------------

export type LearningLevel = 'Foundation' | 'Practitioner' | 'Advanced' | 'Transformation Leader';
export type LearningStage = 'learn' | 'practice' | 'apply' | 'reflect';
export type ModuleProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type ModuleProgressState = LearningProgressData;

export interface LearningLesson {
  concept: string;
  whyItMatters: string;
  practicalExample: string;
  governanceConsideration: string;
  keyTakeaway: string;
}

export interface BankingRoleScenario {
  title: string;
  scenario: string;
  context: string;
  roleRelevance: string;
}

export type PracticeExerciseType =
  | 'prompt_engineering'
  | 'governance_review'
  | 'process_decision'
  | 'email_critique'
  | 'policy_retrieval'
  | 'discovery_questions';

export interface PracticeExercise {
  id: string;
  title: string;
  instructions: string;
  instruction?: string; // alias
  scenario: string;
  exerciseType: PracticeExerciseType;
  type?: PracticeExerciseType; // alias
  initialInput?: string;
  promptPlaceholder?: string;
  sampleSolution?: string;
  evaluationCriteria: string[];
  hints?: string[];
}

export interface LearningModuleApplyLink {
  moduleTab: 'copilot' | 'meeting_prep' | 'email_assistant' | 'project_compass' | 'process_optimizer';
  label: string;
  suggestedAction: string;
  module?: 'copilot' | 'meeting_prep' | 'email_assistant' | 'project_compass' | 'process_optimizer'; // alias
  title?: string; // alias
  actionPrompt?: string; // alias
  prefilledContext?: any;
}

export interface LearningModule {
  id: string;
  title: string;
  dimension: AssessmentDimensionKey;
  level: LearningLevel;
  estimatedMinutes: number;
  objective: string;
  lesson: LearningLesson;
  bankingExample: BankingRoleScenario;
  practiceExercise: PracticeExercise;
  reflectionQuestion: string;
  applyLink?: LearningModuleApplyLink;

  // Extended properties for presentation & personalization
  description?: string;
  dimensionName?: string;
  difficulty?: string;
  order?: number;
  isPriorityGap?: boolean;
  gapRank?: number;
  roles?: string[];
  roleScenarios?: Array<{ role: string; scenarioTitle: string; challenge: string; solution: string }>;
  reflectionTakeaways?: string[];
  content?: {
    coreConcept: string;
    bankingUseCase: {
      title: string;
      context: string;
      workflowImpact: string;
    };
    promptTechnique: {
      patternName: string;
      description: string;
      template: string;
    };
    commonPitfalls: string[];
  };
}

export interface LearningProgressData {
  moduleId: string;
  moduleTitle?: string;
  dimension?: AssessmentDimensionKey;
  status: 'not_started' | 'in_progress' | 'completed';
  currentStage?: LearningStage;
  completedStages?: string[];
  completedAt?: string;
  confidence?: number;
  confidenceRating?: number; // alias
  reflectionNotes?: string;
  assessmentId?: string;
  exerciseSubmission?: string;
  exerciseFeedback?: string;
  role?: string;
  // Phase 5E clean forward-compatible fields
  completedModules?: string[];
  remainingModules?: string[];
  skillGaps?: string[];
  recommendedLearningTopics?: string[];
  appliedSkills?: string[];
  transformationPriorities?: string[];
}

export interface ExerciseEvaluationRequest {
  moduleId: string;
  exerciseId: string;
  exerciseType: PracticeExerciseType;
  userSubmission: string;
  role?: string;
}

export interface ExerciseEvaluationResult {
  feedbackSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  governanceAssessment: string;
  suggestedRefinement: string;
  coachTip: string;
}

export interface ExerciseEvaluationResponse {
  result: ExerciseEvaluationResult;
  model: string;
  timestamp: string;
}

export interface ReflectionSubmissionRequest {
  moduleId: string;
  confidence: number;
  reflectionNotes: string;
  assessmentId?: string;
  status?: 'in_progress' | 'completed';
  exerciseSubmission?: string;
  exerciseFeedback?: string;
}

export interface ReflectionSubmissionResponse {
  success: boolean;
  sanitizedNotes: string;
  confidence: number;
  completedAt: string;
  coachingEncouragement: string;
  timestamp: string;
}

// -------------------------------------------------------------
// Phase 5E: 30-Day Transformation Plan Types
// -------------------------------------------------------------

export type PlanPhase = 'Foundation' | 'Practice' | 'Application' | 'Transformation & Impact';
export type PlanDayCompletionStatus = 'not_started' | 'in_progress' | 'completed';

export interface TransformationPlanDay {
  day: number; // 1 to 30
  phase: PlanPhase;
  week: number; // 1 to 4
  title: string;
  objective: string;
  activity: string;
  estimatedMinutes: number;
  capability: string;
  toolId?: 'learning_assistant' | 'copilot' | 'email_assistant' | 'meeting_prep' | 'project_compass' | 'process_optimizer' | 'transformation_assessment';
  expectedOutcome: string;
  governanceConsideration: string;
  completionStatus: PlanDayCompletionStatus;
  completedAt?: string;
  userNotes?: string;
  confidence?: number; // 1 to 5
  timeSpentMinutes?: number;
  lessonLearned?: string;
}

export interface TransformationProjectDetails {
  processOrProblem: string;
  currentPainPoint: string;
  proposedOpportunity: string;
  opportunityType: 'GENAI' | 'TRADITIONAL_AUTOMATION' | 'WORKFLOW_REDESIGN' | 'HUMAN_JUDGMENT';
  expectedBenefit: string;
  risks: string;
  humanOversight: string;
  successMetric: string;
}

export interface TransformationReview {
  completedActivitiesCount: number;
  totalDays: number;
  skillsDeveloped: string[];
  toolsUsed: string[];
  transformationOpportunityIdentified: string;
  illustrativeImpact: {
    metric: string;
    projectedImprovement: string;
    disclaimer: string;
  }[];
  governanceConsiderations: string[];
  lessonsLearned: string[];
  recommendedNextStep: string;
  reviewedAt: string;
}

export interface TransformationPlanProgress {
  completedDays: number;
  totalDays: number;
  percentComplete: number;
  week1Completed: number;
  week1Total: number;
  week2Completed: number;
  week2Total: number;
  week3Completed: number;
  week3Total: number;
  week4Completed: number;
  week4Total: number;
  lastActiveDay?: number;
  currentActivePhase?: PlanPhase;
}

export interface TransformationPlanData {
  planId: string;
  assessmentId: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  maturityLevel: MaturityLevel;
  overallScore: number;
  prioritySkills: string[];
  transformationGoal: string;
  dailyPlan: TransformationPlanDay[];
  progress: TransformationPlanProgress;
  transformationProject?: TransformationProjectDetails;
  finalReview?: TransformationReview;
  humanReviewRequired: boolean;
  advisoryDisclaimer: string;
  syntheticDataNotice: string;
  modelUsed?: string;
}

export interface TransformationPlanRequest {
  assessmentId: string;
  transformationGoal?: string;
  customGoal?: string;
  role?: string;
  maturityLevel?: MaturityLevel;
  overallScore?: number;
  prioritySkills?: string[];
  quickWins?: string[];
  developmentPriorities?: string[];
  dimensionScores?: Record<string, { name: string; score: number; level: string }>;
  learningSummary?: {
    completedModulesCount: number;
    averageConfidence: number;
    topCompletedTopics: string[];
  };
}

export interface TransformationPlanResponse {
  plan: TransformationPlanData;
  model: string;
  timestamp: string;
  isFallback?: boolean;
}



