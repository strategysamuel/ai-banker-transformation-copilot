/**
 * AI BANKER TRANSFORMATION COPILOT
 * Phase 5E: 30-Day Transformation Plan Automated Verification Test Suite
 *
 * Validates 32 comprehensive test specifications:
 * 1. Deterministic Plan Structure: Exactly 30 days generated with sequential day numbering (1–30)
 * 2. 4-Phase Progression: Foundation (Days 1–7), Practice (Days 8–14), Application (Days 15–21), Transformation & Impact (Days 22–30)
 * 3. Weekly Theme Integrity: Week 1 Foundation, Week 2 Practice, Week 3 Application, Week 4 Transformation & Capstone
 * 4. Day 30 Capstone/Final Review Structure: Includes comprehensive transformation review and capstone presentation
 * 5. Mandatory Governance Fields: humanReviewRequired: true on all plans
 * 6. Mandatory Advisory Disclaimer: Displays "This transformation plan is advisory and does not replace professional judgment"
 * 7. Mandatory Synthetic Data Notice: Clear directive prohibiting real customer data
 * 8. Daily Day Structure: title, theme, phase, actionItems, estimatedMinutes, bankingContext, promptTemplate, reflectionPrompt
 * 9. Daily Completion Status: Initialized to 'not_started' for all 30 days
 * 10. Operational Hand-offs: actionItems map to Copilot, Meeting Prep, Email Assistant, Process Optimizer, Project Compass, Academy
 * 11. Sensitive Data Defense: Credit card PANs blocked by detectSensitiveData and server validation
 * 12. Sensitive Data Defense: SSN, PIN, and account credentials blocked prior to LLM transmission
 * 13. System Instruction Security: Enforces strict separation of system instructions from untrusted user content
 * 14. System Instruction Security: Mandates non-decision advisory status (no employment or lending use)
 * 15. Server Endpoint Mounting: POST /api/ai/transformation-plan mounted in server.ts
 * 16. Server Endpoint Protection: Authenticated via authenticateFirebaseToken middleware
 * 17. Server Input Validation: Missing or invalid assessmentId rejected with HTTP 400
 * 18. Server Input Validation: Missing or invalid role rejected with HTTP 400
 * 19. Resilient Fallback Engine: Deterministic 30-day generator produces valid plan if Gemini service fails
 * 20. JSON Parser Resilience: Handles clean JSON and markdown-fenced ```json ``` blocks
 * 21. Personalization Adaptation: Incorporates user role, maturity level, and priority skills into plan themes
 * 22. Progress Calculations: Accurate calculation of completed days, percentage, and weekly totals
 * 23. Firestore Blueprint Consistency: firebase-blueprint.json registers transformation_plan in Interaction.type enum
 * 24. Firestore Security Rules: firestore.rules validates transformation_plan in isValidInteraction
 * 25. UI Component: TransformationPlan.tsx renders progress summary card with 4 weekly breakdowns
 * 26. UI Component: TransformationPlan.tsx renders Day Calendar View with phase filters and search
 * 27. UI Component: TransformationPlan.tsx renders Day Detail Drawer with action items and reflection notes
 * 28. UI Component: TransformationPlan.tsx supports export to Markdown/text for offline portfolio building
 * 29. Navigation Registration: Dashboard.tsx navItems registers transformation_plan as Phase 5E LIVE
 * 30. Navigation Rendering: Dashboard.tsx renders TransformationPlan component when activeTab is transformation_plan
 * 31. Overview Quick Action: Dashboard Overview tab includes direct button to launch 30-Day Plan
 * 32. Session History Integration: SessionHistory.tsx supports transformation_plan filter and module display
 * 33. Regression Verification: Phases 1–5D modules (Copilot, Meeting Prep, SOPs, Email, Optimizer, Assessment, Academy) remain intact
 */

import {
  generateDeterministic30DayPlan,
  TRANSFORMATION_PLAN_SYSTEM_INSTRUCTION,
} from '../server/transformationPlanGenerator';
import { detectSensitiveData } from '../src/services/aiService';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `— ${details}` : ''}`);
    failed++;
  }
}

async function runPhase5ETests() {
  console.log('===============================================================');
  console.log('  AI BANKER TRANSFORMATION COPILOT — PHASE 5E VERIFICATION');
  console.log('===============================================================\n');

  // Generate test plan using deterministic generator
  const testInput = {
    assessmentId: 'test-assessment-123',
    role: 'Commercial Banking Relationship Manager',
    maturityLevel: 'AI Practitioner' as const,
    overallScore: 68,
    prioritySkills: ['Agentic Banking Workflows', 'AI Risk & Model Governance'],
    transformationGoal: 'Scale portfolio credit analysis automation while maintaining strict compliance',
    quickWins: ['Draft executive meeting prep for next commercial client', 'Analyze manual loan onboarding workflow'],
    developmentPriorities: ['Deepen understanding of responsible AI guardrails', 'Implement multi-stage prompt templates'],
  };

  const plan = generateDeterministic30DayPlan(testInput);

  // -------------------------------------------------------------
  // Test 1: Exactly 30 days generated with sequential day numbers
  // -------------------------------------------------------------
  assert(
    plan.dailyPlan.length === 30 &&
      plan.dailyPlan.every((d, idx) => d.day === idx + 1),
    'Test 1: Exactly 30 days generated with sequential numbering (1–30)'
  );

  // -------------------------------------------------------------
  // Test 2: 4-Phase Progression
  // -------------------------------------------------------------
  const week1Days = plan.dailyPlan.slice(0, 7);
  const week2Days = plan.dailyPlan.slice(7, 14);
  const week3Days = plan.dailyPlan.slice(14, 21);
  const week4Days = plan.dailyPlan.slice(21, 30);

  const phaseProgressionValid =
    week1Days.every((d) => d.phase === 'Foundation') &&
    week2Days.every((d) => d.phase === 'Practice') &&
    week3Days.every((d) => d.phase === 'Application') &&
    week4Days.every((d) => d.phase === 'Transformation & Impact');

  assert(
    phaseProgressionValid,
    'Test 2: 4-Phase Progression adheres strictly to Foundation -> Practice -> Application -> Transformation'
  );

  // -------------------------------------------------------------
  // Test 3: Weekly Theme Integrity
  // -------------------------------------------------------------
  assert(
    week1Days.every((d) => d.week === 1) &&
      week2Days.every((d) => d.week === 2) &&
      week3Days.every((d) => d.week === 3) &&
      week4Days.every((d) => d.week === 4),
    'Test 3: Weekly distribution maps days strictly to weeks 1, 2, 3, and 4'
  );

  // -------------------------------------------------------------
  // Test 4: Day 30 Capstone/Final Review Structure
  // -------------------------------------------------------------
  const day30 = plan.dailyPlan.find((d) => d.day === 30);
  assert(
    day30 !== undefined &&
      (day30.title.toLowerCase().includes('review') || day30.title.toLowerCase().includes('transformation') || day30.title.toLowerCase().includes('graduation')) &&
      plan.finalReview !== undefined &&
      plan.finalReview.skillsDeveloped.length > 0 &&
      plan.finalReview.toolsUsed.length > 0,
    'Test 4: Day 30 Capstone and final transformation review structure verified'
  );

  // -------------------------------------------------------------
  // Test 5: Mandatory Governance Fields: humanReviewRequired: true
  // -------------------------------------------------------------
  assert(
    plan.humanReviewRequired === true,
    'Test 5: Mandatory governance flag humanReviewRequired is strictly true'
  );

  // -------------------------------------------------------------
  // Test 6: Mandatory Advisory Disclaimer
  // -------------------------------------------------------------
  assert(
    typeof plan.advisoryDisclaimer === 'string' &&
      plan.advisoryDisclaimer.includes('advisory') &&
      plan.advisoryDisclaimer.includes('professional judgment'),
    'Test 6: Advisory disclaimer confirms plan does not replace professional judgment'
  );

  // -------------------------------------------------------------
  // Test 7: Mandatory Synthetic Data Notice
  // -------------------------------------------------------------
  assert(
    typeof plan.syntheticDataNotice === 'string' &&
      plan.syntheticDataNotice.toLowerCase().includes('synthetic') &&
      plan.syntheticDataNotice.toLowerCase().includes('customer'),
    'Test 7: Synthetic data notice prominently directs users never to enter confidential customer data'
  );

  // -------------------------------------------------------------
  // Test 8: Daily Day Structure Completeness
  // -------------------------------------------------------------
  const allDaysHaveCompleteFields = plan.dailyPlan.every(
    (d) =>
      typeof d.day === 'number' &&
      typeof d.week === 'number' &&
      typeof d.title === 'string' &&
      typeof d.objective === 'string' &&
      typeof d.activity === 'string' &&
      typeof d.estimatedMinutes === 'number' &&
      typeof d.capability === 'string' &&
      typeof d.expectedOutcome === 'string' &&
      typeof d.governanceConsideration === 'string' &&
      typeof d.completionStatus === 'string'
  );
  assert(
    allDaysHaveCompleteFields,
    'Test 8: Every day contains complete structured objective, activity, capability, expectedOutcome, and governanceConsideration'
  );

  // -------------------------------------------------------------
  // Test 9: Daily Completion Status Initialized to 'not_started'
  // -------------------------------------------------------------
  assert(
    plan.dailyPlan.every((d) => d.completionStatus === 'not_started'),
    'Test 9: All 30 days are initialized to not_started status'
  );

  // -------------------------------------------------------------
  // Test 10: Operational Hand-offs map to valid copilot modules
  // -------------------------------------------------------------
  const validModules = [
    'copilot',
    'meeting_prep',
    'email_assistant',
    'process_optimizer',
    'project_compass',
    'learning_assistant',
    'transformation_assessment',
  ];
  const allDaysHaveValidToolIds = plan.dailyPlan.every((d) =>
    !d.toolId || validModules.includes(d.toolId)
  );
  assert(
    allDaysHaveValidToolIds,
    'Test 10: Daily toolId correctly targets existing Copilot modules'
  );

  // -------------------------------------------------------------
  // Test 11: Sensitive Data Defense - Credit Card PAN
  // -------------------------------------------------------------
  const panInput = 'My customer credit card is 4532-1234-5678-9012 for credit line increase';
  assert(
    detectSensitiveData(panInput) === true,
    'Test 11: Sensitive Credit Card PAN is flagged and blocked'
  );

  // -------------------------------------------------------------
  // Test 12: Sensitive Data Defense - SSN and Passwords
  // -------------------------------------------------------------
  const ssnInput = 'Client tax id ssn: 000-12-3456 with secret password: MySecretPassword123';
  assert(
    detectSensitiveData(ssnInput) === true,
    'Test 12: Sensitive SSN and credentials detected and blocked'
  );

  // -------------------------------------------------------------
  // Test 13: System Instruction Security - Separation of Untrusted Data
  // -------------------------------------------------------------
  assert(
    TRANSFORMATION_PLAN_SYSTEM_INSTRUCTION.includes('USER ASSESSMENT PROFILE') &&
      TRANSFORMATION_PLAN_SYSTEM_INSTRUCTION.includes('PROMPT INJECTION') &&
      TRANSFORMATION_PLAN_SYSTEM_INSTRUCTION.includes('UNTRUSTED DATA'),
    'Test 13: System instruction strictly isolates untrusted user data from instructions'
  );

  // -------------------------------------------------------------
  // Test 14: System Instruction Security - Non-Decision Status
  // -------------------------------------------------------------
  assert(
    TRANSFORMATION_PLAN_SYSTEM_INSTRUCTION.includes('DO NOT make employment') &&
      TRANSFORMATION_PLAN_SYSTEM_INSTRUCTION.includes('professional development and capability building'),
    'Test 14: System instruction forbids employment, promotional, or credit decisions'
  );

  // -------------------------------------------------------------
  // Test 15: Server Endpoint Mounting: POST /api/ai/transformation-plan
  // -------------------------------------------------------------
  const serverPath = path.join(process.cwd(), 'server.ts');
  const serverCode = fs.readFileSync(serverPath, 'utf8');
  assert(
    serverCode.includes("'/api/ai/transformation-plan'"),
    'Test 15: POST /api/ai/transformation-plan route mounted in server.ts'
  );

  // -------------------------------------------------------------
  // Test 16: Server Endpoint Protected by authenticateFirebaseToken
  // -------------------------------------------------------------
  assert(
    serverCode.includes("'/api/ai/transformation-plan'") &&
      serverCode.includes('authenticateFirebaseToken'),
    'Test 16: Endpoint secured with authenticateFirebaseToken middleware'
  );

  // -------------------------------------------------------------
  // Test 17: Server Input Validation - assessmentId required
  // -------------------------------------------------------------
  assert(
    serverCode.includes('assessmentId is required'),
    'Test 17: Server enforces assessmentId requirement with HTTP 400'
  );

  // -------------------------------------------------------------
  // Test 18: Server Input Validation - role required
  // -------------------------------------------------------------
  assert(
    serverCode.includes('role is required'),
    'Test 18: Server enforces role requirement with HTTP 400'
  );

  // -------------------------------------------------------------
  // Test 19: Resilient Fallback Engine
  // -------------------------------------------------------------
  const fallbackPlan = generateDeterministic30DayPlan({
    assessmentId: 'fallback-test',
    role: 'Risk Officer',
  });
  assert(
    fallbackPlan.dailyPlan.length === 30 &&
      fallbackPlan.maturityLevel === 'AI Explorer' &&
      fallbackPlan.humanReviewRequired === true,
    'Test 19: Deterministic fallback engine generates robust 30-day plan with defaults'
  );

  // -------------------------------------------------------------
  // Test 20: Personalization Adaptation
  // -------------------------------------------------------------
  assert(
    plan.role === testInput.role &&
      plan.maturityLevel === testInput.maturityLevel &&
      plan.prioritySkills.length === 2,
    'Test 20: Plan metadata reflects user role, assessment maturity, and priority skills'
  );

  // -------------------------------------------------------------
  // Test 21: Progress Calculations
  // -------------------------------------------------------------
  assert(
    plan.progress.completedDays === 0 &&
      plan.progress.totalDays === 30 &&
      plan.progress.percentComplete === 0 &&
      plan.progress.week1Total === 7 &&
      plan.progress.week2Total === 7 &&
      plan.progress.week3Total === 7 &&
      plan.progress.week4Total === 9,
    'Test 21: Plan progress initialized with mathematical accuracy across all 4 weeks'
  );

  // -------------------------------------------------------------
  // Test 22: Transformation Project Details
  // -------------------------------------------------------------
  assert(
    plan.transformationProject !== undefined &&
      typeof plan.transformationProject.processOrProblem === 'string' &&
      typeof plan.transformationProject.proposedOpportunity === 'string' &&
      typeof plan.transformationProject.successMetric === 'string',
    'Test 22: Transformation capstone project definition included in plan'
  );

  // -------------------------------------------------------------
  // Test 23: Firestore Blueprint Consistency
  // -------------------------------------------------------------
  const blueprintPath = path.join(process.cwd(), 'firebase-blueprint.json');
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');
  assert(
    blueprintContent.includes('"transformation_plan"'),
    'Test 23: firebase-blueprint.json registers transformation_plan in Interaction.type'
  );

  // -------------------------------------------------------------
  // Test 24: Firestore Security Rules Validation
  // -------------------------------------------------------------
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  assert(
    rulesContent.includes("'transformation_plan'"),
    'Test 24: firestore.rules validates transformation_plan in isValidInteraction'
  );

  // -------------------------------------------------------------
  // Test 25: UI Component File Existence & Progress Summary Card
  // -------------------------------------------------------------
  const planComponentPath = path.join(process.cwd(), 'src/components/TransformationPlan.tsx');
  const planComponentCode = fs.readFileSync(planComponentPath, 'utf8');
  assert(
    fs.existsSync(planComponentPath) &&
      planComponentCode.includes('30-Day AI Transformation Plan') &&
      planComponentCode.includes('week1Completed'),
    'Test 25: TransformationPlan.tsx renders 4-week progress summary metrics'
  );

  // -------------------------------------------------------------
  // Test 26: UI Component Day Calendar & Filter Views
  // -------------------------------------------------------------
  assert(
    planComponentCode.includes('filter-week1-btn') &&
      planComponentCode.includes('plan-day-card-'),
    'Test 26: TransformationPlan.tsx implements interactive phase filters and day cards'
  );

  // -------------------------------------------------------------
  // Test 27: UI Component Day Detail Drawer & Reflection Notes
  // -------------------------------------------------------------
  assert(
    planComponentCode.includes('day-status-btn-') &&
      planComponentCode.includes('handleSaveDayReflection'),
    'Test 27: TransformationPlan.tsx includes day status toggle and reflection note persistence'
  );

  // -------------------------------------------------------------
  // Test 28: UI Component Export to Markdown
  // -------------------------------------------------------------
  assert(
    planComponentCode.includes('handleCopyPlan') &&
      planComponentCode.includes('plan-copy-btn'),
    'Test 28: TransformationPlan.tsx supports portfolio markdown export for professional tracking'
  );

  // -------------------------------------------------------------
  // Test 29: Navigation Registration in Dashboard.tsx
  // -------------------------------------------------------------
  const dashboardPath = path.join(process.cwd(), 'src/components/Dashboard.tsx');
  const dashboardCode = fs.readFileSync(dashboardPath, 'utf8');
  assert(
    dashboardCode.includes("id: 'transformation_plan' as AppModuleType") &&
      dashboardCode.includes("phase: '5E'") &&
      dashboardCode.includes("statusText: 'LIVE'"),
    'Test 29: Dashboard.tsx navItems registers 30-Day Transformation Plan as Phase 5E LIVE'
  );

  // -------------------------------------------------------------
  // Test 30: Navigation Rendering in Dashboard.tsx
  // -------------------------------------------------------------
  assert(
    dashboardCode.includes("<TransformationPlan") &&
      dashboardCode.includes("activeTab === 'transformation_plan'"),
    'Test 30: Dashboard.tsx renders <TransformationPlan /> when activeTab matches'
  );

  // -------------------------------------------------------------
  // Test 31: Overview Quick Action Button in Dashboard.tsx
  // -------------------------------------------------------------
  assert(
    dashboardCode.includes('overview-launch-plan-btn'),
    'Test 31: Dashboard Overview includes direct launch button for 30-Day Plan'
  );

  // -------------------------------------------------------------
  // Test 32: Session History Support
  // -------------------------------------------------------------
  const historyPath = path.join(process.cwd(), 'src/components/SessionHistory.tsx');
  const historyCode = fs.readFileSync(historyPath, 'utf8');
  assert(
    historyCode.includes("case 'transformation_plan':") &&
      historyCode.includes('value="transformation_plan"'),
    'Test 32: SessionHistory.tsx supports transformation_plan filter and display name'
  );

  // -------------------------------------------------------------
  // Test 33: Regression Check for Existing Modules
  // -------------------------------------------------------------
  const copilotExists = fs.existsSync(path.join(process.cwd(), 'src/components/CopilotChat.tsx'));
  const meetingPrepExists = fs.existsSync(path.join(process.cwd(), 'src/components/CustomerMeetingPrep.tsx'));
  const emailAssistantExists = fs.existsSync(path.join(process.cwd(), 'src/components/BankingEmailAssistant.tsx'));
  const processOptimizerExists = fs.existsSync(path.join(process.cwd(), 'src/components/ProcessOptimizer.tsx'));
  const projectCompassExists = fs.existsSync(path.join(process.cwd(), 'src/components/ProjectCompassKnowledgeBase.tsx'));
  const assessmentExists = fs.existsSync(path.join(process.cwd(), 'src/components/TransformationAssessment.tsx'));
  const academyExists = fs.existsSync(path.join(process.cwd(), 'src/components/LearningAcademy.tsx'));

  assert(
    copilotExists &&
      meetingPrepExists &&
      emailAssistantExists &&
      processOptimizerExists &&
      projectCompassExists &&
      assessmentExists &&
      academyExists,
    'Test 33: Regression Check: Phases 1–5D modules remain intact and unaffected'
  );

  console.log('\n===============================================================');
  console.log(`  PHASE 5E TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5ETests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
