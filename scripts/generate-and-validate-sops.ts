import * as fs from 'fs';
import * as path from 'path';
import { ALL_SYNTHETIC_SOPS, SYNTHETIC_SOP_CATALOG } from '../src/data/projectCompassData';
import { SOPDocument } from '../src/types/projectCompass';

const BASE_DIR = path.join(process.cwd(), 'data', 'project-compass', 'policies');

// Ensure directories exist
if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true });
}

// Write catalog to data/project-compass/project-compass-catalog.json
const catalogPath = path.join(process.cwd(), 'data', 'project-compass', 'project-compass-catalog.json');
fs.writeFileSync(catalogPath, JSON.stringify(SYNTHETIC_SOP_CATALOG, null, 2), 'utf-8');
console.log(`[GENERATOR] Wrote catalog to: ${catalogPath}`);

// Generate policy files
for (const sop of ALL_SYNTHETIC_SOPS) {
  const policyDir = path.join(BASE_DIR, sop.policyId);
  if (!fs.existsSync(policyDir)) {
    fs.mkdirSync(policyDir, { recursive: true });
  }

  const isCurrentActive = sop.status === 'ACTIVE';
  const filePrefix = isCurrentActive ? 'policy' : `policy-v${sop.version}`;

  // Write JSON
  const jsonPath = path.join(policyDir, `${filePrefix}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(sop, null, 2), 'utf-8');

  // Write Markdown
  const mdContent = generateMarkdown(sop);
  const mdPath = path.join(policyDir, `${filePrefix}.md`);
  fs.writeFileSync(mdPath, mdContent, 'utf-8');

  console.log(`[GENERATOR] Generated ${sop.policyId} (v${sop.version} - ${sop.status}) -> ${jsonPath} & ${mdPath}`);
}

function generateMarkdown(sop: SOPDocument): string {
  return `# ${sop.title}
**Policy ID:** \`${sop.policyId}\` | **Version:** \`${sop.version}\` | **Status:** \`${sop.status}\`  
**Effective Date:** ${sop.effectiveDate} | **Next Review Date:** ${sop.nextReviewDate}  
**Policy Owner:** ${sop.policyOwner}  
**Applicable Roles:** ${sop.applicableRoles.join(', ')}  
**Applicable Region:** ${sop.applicableRegion}  
**Supersedes:** ${sop.supersedes || 'None (Initial Release)'}  
**Source URI:** \`${sop.sourceUri}\`  

---

> ⚠️ **DEMO NOTICE:** DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.

---

## 1. Purpose
${sop.purpose}

## 2. Scope
${sop.scope}

## 3. Definitions
${sop.definitions.map((d) => `- **${d.term}**: ${d.definition}`).join('\n')}

## 4. Standard Procedures & Controls
${sop.sections
  .map(
    (s) => `### Section ${s.sectionNumber}: ${s.title}
- **Citation ID:** \`${s.citationId}\`
- **Source Reference:** \`${s.sourceUri}\`
${s.applicableRoles ? `- **Applicable Roles:** ${s.applicableRoles.join(', ')}` : ''}

${s.content}

${s.governanceGuidance ? `*${s.governanceGuidance}*` : ''}
`
  )
  .join('\n')}

## 5. Exceptions
${sop.exceptions.map((e) => `- ${e}`).join('\n')}

## 6. Approval Requirements & Thresholds
${sop.approvalRequirements.map((a) => `- ${a}`).join('\n')}

## 7. Escalation Rules
${sop.escalationRules.map((r) => `- ${r}`).join('\n')}

## 8. Compliance & Governance Notes
${sop.complianceNotes.map((c) => `- ${c}`).join('\n')}
`;
}

// ----------------------------------------------------
// VALIDATION SUITE (TEST 1 through TEST 12)
// ----------------------------------------------------
console.log('\n========================================');
console.log('RUNNING PROJECT COMPASS SOP VALIDATION');
console.log('========================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
    failedTests++;
  }
}

// TEST 1: All 10 synthetic SOPs exist in catalog
const uniquePolicyIds = new Set(SYNTHETIC_SOP_CATALOG.policies.map((p) => p.policyId));
assert(uniquePolicyIds.size === 10, 'TEST 1: All 10 synthetic SOPs exist in catalog', `Count is ${uniquePolicyIds.size}`);

// TEST 2: All SOPs contain required metadata
let allMetadataValid = true;
for (const sop of ALL_SYNTHETIC_SOPS) {
  if (
    !sop.policyId ||
    !sop.title ||
    !sop.version ||
    !sop.status ||
    !sop.effectiveDate ||
    !sop.nextReviewDate ||
    !sop.policyOwner ||
    !sop.applicableRoles ||
    sop.applicableRoles.length === 0 ||
    !sop.applicableRegion ||
    !sop.sourceUri ||
    !sop.purpose ||
    !sop.scope ||
    !sop.sections ||
    sop.sections.length === 0
  ) {
    allMetadataValid = false;
    console.error(`Invalid metadata in SOP: ${sop.policyId} v${sop.version}`);
  }
}
assert(allMetadataValid, 'TEST 2: All SOPs contain all required schema metadata');

// TEST 3: All SOPs are marked demoData=true
const allDemo = ALL_SYNTHETIC_SOPS.every((s) => s.demoData === true) && SYNTHETIC_SOP_CATALOG.policies.every((p) => p.demoData === true);
assert(allDemo, 'TEST 3: All SOPs and catalog entries are marked demoData=true');

// TEST 4: Current versions are correctly identified
let currentVersionsCorrect = true;
for (const cat of SYNTHETIC_SOP_CATALOG.policies) {
  const activeSop = ALL_SYNTHETIC_SOPS.find((s) => s.policyId === cat.policyId && s.version === cat.currentVersion);
  if (!activeSop || activeSop.status !== 'ACTIVE') {
    currentVersionsCorrect = false;
    console.error(`Mismatch for catalog ${cat.policyId} currentVersion ${cat.currentVersion}`);
  }
}
assert(currentVersionsCorrect, 'TEST 4: Current versions are correctly identified as ACTIVE');

// TEST 5: Superseded versions are correctly identified
const supersededSops = ALL_SYNTHETIC_SOPS.filter((s) => s.status === 'SUPERSEDED');
assert(supersededSops.length === 3, 'TEST 5: Superseded versions are correctly identified', `Found ${supersededSops.length} superseded versions`);

// TEST 6: At least 3 policies contain multiple versions
const multiVersionPolicies = SYNTHETIC_SOP_CATALOG.policies.filter((p) => p.totalVersions > 1);
assert(multiVersionPolicies.length >= 3, 'TEST 6: At least 3 policies contain multiple versions', `Found ${multiVersionPolicies.length} multi-version policies`);

// TEST 7: Stable citation identifiers exist for every section
let allCitationsValid = true;
for (const sop of ALL_SYNTHETIC_SOPS) {
  for (const sec of sop.sections) {
    if (!sec.citationId || !sec.sourceUri || !sec.citationId.startsWith(sop.policyId)) {
      allCitationsValid = false;
      console.error(`Invalid citation in ${sop.policyId} v${sop.version}: ${sec.citationId}`);
    }
  }
}
assert(allCitationsValid, 'TEST 7: Stable citation identifiers exist for all sections');

// TEST 8: Role metadata exists
const allHaveRoles = ALL_SYNTHETIC_SOPS.every((s) => s.applicableRoles.length > 0);
assert(allHaveRoles, 'TEST 8: Role metadata exists on all policies');

// TEST 9: Region metadata exists
const allHaveRegion = ALL_SYNTHETIC_SOPS.every((s) => Boolean(s.applicableRegion));
assert(allHaveRegion, 'TEST 9: Region metadata exists on all policies');

// TEST 10: Policy catalog correctly identifies current versions only
const catalogOnlyActive = SYNTHETIC_SOP_CATALOG.policies.every((p) => p.status === 'ACTIVE');
assert(catalogOnlyActive, 'TEST 10: Policy catalog identifies only ACTIVE versions as current');

// TEST 11: No real customer PII exists
const corpusText = JSON.stringify(ALL_SYNTHETIC_SOPS);
const hasSuspiciousRealPii = corpusText.includes('SSN: ') || corpusText.includes('4111 2222') || corpusText.includes('@gmail.com');
assert(!hasSuspiciousRealPii, 'TEST 11: No real customer PII exists in SOP data');

// TEST 12: No API keys or credentials exist
const hasGoogleApiKey = /AIzaSy[A-Za-z0-9_-]{33}/.test(corpusText);
const hasOpenAiApiKey = /\bsk-[A-Za-z0-9]{20,}\b/.test(corpusText);
const hasPrivateKeyBlock = /-----BEGIN (RSA )?PRIVATE KEY-----/.test(corpusText);
const hasSecretKeys = hasGoogleApiKey || hasOpenAiApiKey || hasPrivateKeyBlock;
assert(!hasSecretKeys, 'TEST 12: No API keys or private credentials exist in SOP data');

console.log('\n========================================');
console.log(`VALIDATION RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('========================================\n');

if (failedTests > 0) {
  process.exit(1);
}
