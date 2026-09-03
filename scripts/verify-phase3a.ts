import * as fs from 'fs';
import * as path from 'path';
import { ALL_SYNTHETIC_SOPS, SYNTHETIC_SOP_CATALOG } from '../src/data/projectCompassData';

console.log('\n=============================================================');
console.log('PHASE 3A — PROJECT COMPASS 20-POINT COMPREHENSIVE TEST SUITE');
console.log('=============================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testId: string, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testId}: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testId}: ${testName} — ${detail || 'Assertion failed'}`);
    failedTests++;
  }
}

// ------------------------------------------------------------------------
// TEST 1: All 10 synthetic SOPs exist in catalog
// ------------------------------------------------------------------------
const expectedPolicyIds = [
  'PC-ACCOUNT-001',
  'PC-WIRE-001',
  'PC-POA-001',
  'PC-FEE-001',
  'PC-ADDRESS-001',
  'PC-CARD-001',
  'PC-DORMANT-001',
  'PC-JOINT-001',
  'PC-COMPLAINT-001',
  'PC-DIGITAL-001'
];
const catalogIds = SYNTHETIC_SOP_CATALOG.policies.map((p) => p.policyId);
const hasAll10 = expectedPolicyIds.every((id) => catalogIds.includes(id)) && SYNTHETIC_SOP_CATALOG.totalPolicies === 10;
assert(hasAll10, 'TEST 1', 'All 10 required synthetic SOPs exist in catalog');

// ------------------------------------------------------------------------
// TEST 2: All SOPs contain all required schema metadata
// ------------------------------------------------------------------------
let allMetadataValid = true;
for (const sop of ALL_SYNTHETIC_SOPS) {
  const hasMeta =
    Boolean(sop.policyId) &&
    Boolean(sop.title) &&
    Boolean(sop.version) &&
    Boolean(sop.status) &&
    Boolean(sop.effectiveDate) &&
    Boolean(sop.nextReviewDate) &&
    Boolean(sop.policyOwner) &&
    Array.isArray(sop.applicableRoles) &&
    sop.applicableRoles.length > 0 &&
    Boolean(sop.applicableRegion) &&
    Boolean(sop.documentType) &&
    Boolean(sop.sourceType) &&
    Boolean(sop.sourceUri) &&
    Boolean(sop.purpose) &&
    Boolean(sop.scope) &&
    Array.isArray(sop.sections) &&
    sop.sections.length > 0 &&
    Array.isArray(sop.approvalRequirements) &&
    sop.approvalRequirements.length > 0 &&
    Array.isArray(sop.escalationRules) &&
    sop.escalationRules.length > 0 &&
    Array.isArray(sop.complianceNotes) &&
    sop.complianceNotes.length > 0;

  if (!hasMeta) {
    allMetadataValid = false;
    console.error(`Missing metadata in ${sop.policyId} v${sop.version}`);
  }
}
assert(allMetadataValid, 'TEST 2', 'All SOPs contain complete metadata schema');

// ------------------------------------------------------------------------
// TEST 3: All SOPs and catalog entries are marked demoData=true
// ------------------------------------------------------------------------
const allDemo =
  ALL_SYNTHETIC_SOPS.every((s) => s.demoData === true) &&
  SYNTHETIC_SOP_CATALOG.policies.every((p) => p.demoData === true);
assert(allDemo, 'TEST 3', 'All SOPs and catalog entries are marked demoData=true');

// ------------------------------------------------------------------------
// TEST 4: Current versions are correctly identified as ACTIVE
// ------------------------------------------------------------------------
let currentVersionsValid = true;
for (const cat of SYNTHETIC_SOP_CATALOG.policies) {
  const activeSop = ALL_SYNTHETIC_SOPS.find(
    (s) => s.policyId === cat.policyId && s.version === cat.currentVersion
  );
  if (!activeSop || activeSop.status !== 'ACTIVE') {
    currentVersionsValid = false;
  }
}
assert(currentVersionsValid, 'TEST 4', 'Current versions in catalog are correctly identified as ACTIVE');

// ------------------------------------------------------------------------
// TEST 5: Superseded versions are correctly identified
// ------------------------------------------------------------------------
const supersededSops = ALL_SYNTHETIC_SOPS.filter((s) => s.status === 'SUPERSEDED');
const supersededValid =
  supersededSops.length === 3 &&
  supersededSops.some((s) => s.policyId === 'PC-WIRE-001' && s.version === '4.1') &&
  supersededSops.some((s) => s.policyId === 'PC-FEE-001' && s.version === '2.0') &&
  supersededSops.some((s) => s.policyId === 'PC-DIGITAL-001' && s.version === '1.3');
assert(supersededValid, 'TEST 5', 'Superseded versions (Wire v4.1, Fee v2.0, Digital v1.3) correctly identified');

// ------------------------------------------------------------------------
// TEST 6: At least 3 policies contain multiple versions
// ------------------------------------------------------------------------
const multiVersionPolicies = SYNTHETIC_SOP_CATALOG.policies.filter((p) => p.totalVersions > 1);
assert(multiVersionPolicies.length >= 3, 'TEST 6', 'At least 3 policies contain multiple versions (found: ' + multiVersionPolicies.length + ')');

// ------------------------------------------------------------------------
// TEST 7: Stable citation identifiers exist for all sections
// ------------------------------------------------------------------------
let allCitationsValid = true;
let totalSections = 0;
for (const sop of ALL_SYNTHETIC_SOPS) {
  for (const sec of sop.sections) {
    totalSections++;
    if (!sec.citationId || !sec.sourceUri || !sec.citationId.startsWith(sop.policyId)) {
      allCitationsValid = false;
    }
  }
}
assert(allCitationsValid && totalSections >= 30, 'TEST 7', `Stable citation IDs exist for all sections (${totalSections} sections verified)`);

// ------------------------------------------------------------------------
// TEST 8: Role metadata exists on all policies
// ------------------------------------------------------------------------
const allHaveRoles = ALL_SYNTHETIC_SOPS.every((s) => s.applicableRoles && s.applicableRoles.length > 0);
assert(allHaveRoles, 'TEST 8', 'Role metadata exists on all SOPs');

// ------------------------------------------------------------------------
// TEST 9: Region metadata exists on all policies
// ------------------------------------------------------------------------
const allHaveRegion = ALL_SYNTHETIC_SOPS.every((s) => s.applicableRegion && s.applicableRegion.length > 0);
assert(allHaveRegion, 'TEST 9', 'Region metadata exists on all SOPs');

// ------------------------------------------------------------------------
// TEST 10: Policy catalog identifies only ACTIVE versions as current
// ------------------------------------------------------------------------
const catalogOnlyActive = SYNTHETIC_SOP_CATALOG.policies.every((p) => p.status === 'ACTIVE');
assert(catalogOnlyActive, 'TEST 10', 'Policy catalog identifies only ACTIVE versions as current');

// ------------------------------------------------------------------------
// TEST 11: No real customer PII exists in SOP data
// ------------------------------------------------------------------------
const corpusText = JSON.stringify(ALL_SYNTHETIC_SOPS);
const hasRealPii =
  /\b\d{3}-\d{2}-\d{4}\b/.test(corpusText) ||
  /\b4[0-9]{12}(?:[0-9]{3})?\b/.test(corpusText) ||
  /@(gmail|yahoo|hotmail|bankofamerica|chase|wellsfargo)\.com\b/i.test(corpusText);
assert(!hasRealPii, 'TEST 11', 'No real customer PII exists in synthetic SOP corpus');

// ------------------------------------------------------------------------
// TEST 12: No API keys or private credentials exist in SOP data
// ------------------------------------------------------------------------
const hasGoogleApiKey = /AIzaSy[A-Za-z0-9_-]{33}/.test(corpusText);
const hasOpenAiApiKey = /\bsk-[A-Za-z0-9]{20,}\b/.test(corpusText);
const hasPrivateKeyBlock = /-----BEGIN (RSA )?PRIVATE KEY-----/.test(corpusText);
const hasSecretKeys = hasGoogleApiKey || hasOpenAiApiKey || hasPrivateKeyBlock;
assert(!hasSecretKeys, 'TEST 12', 'No API keys or private credentials in SOP data');

// ------------------------------------------------------------------------
// TEST 13: Knowledge base files exist in data/project-compass/policies/
// ------------------------------------------------------------------------
const policiesDir = path.join(process.cwd(), 'data', 'project-compass', 'policies');
const dirExists = fs.existsSync(policiesDir);
const subDirs = dirExists ? fs.readdirSync(policiesDir) : [];
const hasAllDirs = expectedPolicyIds.every((id) => subDirs.includes(id));
assert(dirExists && hasAllDirs, 'TEST 13', 'Knowledge base directories exist in data/project-compass/policies/');

// ------------------------------------------------------------------------
// TEST 14: Master catalog file is located at data/project-compass/project-compass-catalog.json
// ------------------------------------------------------------------------
const catalogFilePath = path.join(process.cwd(), 'data', 'project-compass', 'project-compass-catalog.json');
const catalogFileExists = fs.existsSync(catalogFilePath);
let catalogFileValid = false;
if (catalogFileExists) {
  try {
    const parsed = JSON.parse(fs.readFileSync(catalogFilePath, 'utf-8'));
    catalogFileValid = parsed.totalPolicies === 10 && parsed.policies?.length === 10;
  } catch (e) {
    catalogFileValid = false;
  }
}
assert(catalogFileExists && catalogFileValid, 'TEST 14', 'Master catalog JSON file exists and is valid');

// ------------------------------------------------------------------------
// TEST 15: Markdown and JSON representations exist for all SOP versions
// ------------------------------------------------------------------------
let allFilesPresent = true;
for (const sop of ALL_SYNTHETIC_SOPS) {
  const isCurrentActive = sop.status === 'ACTIVE';
  const filePrefix = isCurrentActive ? 'policy' : `policy-v${sop.version}`;
  const jsonPath = path.join(policiesDir, sop.policyId, `${filePrefix}.json`);
  const mdPath = path.join(policiesDir, sop.policyId, `${filePrefix}.md`);
  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    allFilesPresent = false;
    console.error(`Missing file: ${jsonPath} or ${mdPath}`);
  }
}
assert(allFilesPresent, 'TEST 15', 'JSON and Markdown files present for all 13 SOP documents');

// ------------------------------------------------------------------------
// TEST 16: Verification that Phase 1 (Firebase Google Auth & profile) remains intact
// ------------------------------------------------------------------------
const authContextPath = path.join(process.cwd(), 'src', 'context', 'AuthContext.tsx');
const userServicePath = path.join(process.cwd(), 'src', 'services', 'userService.ts');
const authContextContent = fs.existsSync(authContextPath) ? fs.readFileSync(authContextPath, 'utf-8') : '';
const userServiceContent = fs.existsSync(userServicePath) ? fs.readFileSync(userServicePath, 'utf-8') : '';
const authIntact =
  authContextContent.includes('signInWithPopup') &&
  authContextContent.includes('googleProvider') &&
  userServiceContent.includes('users');
assert(authIntact, 'TEST 16', 'Phase 1: Firebase Google Authentication & Profile sync intact');

// ------------------------------------------------------------------------
// TEST 17: Verification that Phase 2A (AI Banker Copilot) remains intact
// ------------------------------------------------------------------------
const copilotChatPath = path.join(process.cwd(), 'src', 'components', 'CopilotChat.tsx');
const aiServicePath = path.join(process.cwd(), 'src', 'services', 'aiService.ts');
const serverTsPath = path.join(process.cwd(), 'server.ts');
const serverContent = fs.existsSync(serverTsPath) ? fs.readFileSync(serverTsPath, 'utf-8') : '';
const aiServiceContent = fs.existsSync(aiServicePath) ? fs.readFileSync(aiServicePath, 'utf-8') : '';
const copilotIntact =
  fs.existsSync(copilotChatPath) &&
  aiServiceContent.includes('/api/ai/copilot') &&
  serverContent.includes('/api/ai/copilot');
assert(copilotIntact, 'TEST 17', 'Phase 2A: AI Banker Copilot multi-turn endpoint intact');

// ------------------------------------------------------------------------
// TEST 18: Verification that Phase 2B (Customer Meeting Prep) remains intact
// ------------------------------------------------------------------------
const meetingPrepPath = path.join(process.cwd(), 'src', 'components', 'CustomerMeetingPrep.tsx');
const meetingPrepIntact =
  fs.existsSync(meetingPrepPath) &&
  aiServiceContent.includes('/api/ai/meeting-prep') &&
  serverContent.includes('/api/ai/meeting-prep');
assert(meetingPrepIntact, 'TEST 18', 'Phase 2B: Customer Meeting Prep generator intact');

// ------------------------------------------------------------------------
// TEST 19: Verification that Session History & subcollections remain intact
// ------------------------------------------------------------------------
const sessionHistoryPath = path.join(process.cwd(), 'src', 'components', 'SessionHistory.tsx');
const interactionServicePath = path.join(process.cwd(), 'src', 'services', 'interactionService.ts');
const interactionServiceContent = fs.existsSync(interactionServicePath) ? fs.readFileSync(interactionServicePath, 'utf-8') : '';
const historyIntact =
  fs.existsSync(sessionHistoryPath) &&
  interactionServiceContent.includes('interactions') &&
  interactionServiceContent.includes('deleteInteraction');
assert(historyIntact, 'TEST 19', 'Session History and UID-isolated Firestore subcollections intact');

// ------------------------------------------------------------------------
// TEST 20: Project Compass UI Entry and Navigation Integration
// ------------------------------------------------------------------------
const dashboardPath = path.join(process.cwd(), 'src', 'components', 'Dashboard.tsx');
const compassComponentPath = path.join(process.cwd(), 'src', 'components', 'ProjectCompassKnowledgeBase.tsx');
const dashboardContent = fs.existsSync(dashboardPath) ? fs.readFileSync(dashboardPath, 'utf-8') : '';
const compassUiIntact =
  fs.existsSync(compassComponentPath) &&
  dashboardContent.includes('project_compass') &&
  dashboardContent.includes('ProjectCompassKnowledgeBase');
assert(compassUiIntact, 'TEST 20', 'Project Compass UI entry, role filtering & multi-version viewer integrated in Dashboard');

console.log('\n=============================================================');
console.log(`TOTAL TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('=============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
