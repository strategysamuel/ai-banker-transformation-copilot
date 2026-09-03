import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';
import { ALL_SYNTHETIC_SOPS } from '../src/data/projectCompassData';
import { PolicyChunk, SOPDocument, VectorIndexData } from '../src/types/projectCompass';

const VECTOR_INDEX_FILE = path.join(process.cwd(), 'data', 'project-compass', 'project-compass-vector-index.json');
export const EMBEDDING_MODEL = 'gemini-embedding-2';
export const INDEX_VERSION = '3b-1';

let genAIClient: GoogleGenAI | null = null;
let inMemoryVectorIndex: VectorIndexData | null = null;

export function clearInMemoryVectorIndex(): void {
  inMemoryVectorIndex = null;
}

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server. Please check your environment variables.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Creates semantic section-aware chunks from synthetic SOP documents.
 * Preserves critical governance, approval, threshold, and escalation rules.
 */
export function buildPolicyChunks(sops: SOPDocument[] = ALL_SYNTHETIC_SOPS): PolicyChunk[] {
  const chunks: PolicyChunk[] = [];

  for (const sop of sops) {
    for (const sec of sop.sections) {
      const chunkId = `${sop.policyId}-v${sop.version}-chunk-${sec.sectionNumber.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Build rich contextual semantic representation
      const chunkText = [
        `POLICY: ${sop.title} (ID: ${sop.policyId}, Version: ${sop.version}, Status: ${sop.status})`,
        `DOCUMENT TYPE: ${sop.documentType} | OWNER: ${sop.policyOwner}`,
        `APPLICABLE ROLES: ${sop.applicableRoles.join(', ')} | REGION: ${sop.applicableRegion}`,
        `EFFECTIVE DATE: ${sop.effectiveDate} | NEXT REVIEW: ${sop.nextReviewDate}`,
        `PURPOSE: ${sop.purpose}`,
        `SECTION ${sec.sectionNumber}: ${sec.title}`,
        `CONTENT:\n${sec.content}`,
        sec.governanceGuidance ? `GOVERNANCE GUIDANCE: ${sec.governanceGuidance}` : '',
        sop.approvalRequirements && sop.approvalRequirements.length > 0
          ? `MANDATORY APPROVAL REQUIREMENTS:\n- ${sop.approvalRequirements.join('\n- ')}`
          : '',
        sop.escalationRules && sop.escalationRules.length > 0
          ? `ESCALATION RULES:\n- ${sop.escalationRules.join('\n- ')}`
          : '',
        sop.complianceNotes && sop.complianceNotes.length > 0
          ? `COMPLIANCE NOTES:\n- ${sop.complianceNotes.join('\n- ')}`
          : '',
      ]
        .filter((part) => Boolean(part && part.trim()))
        .join('\n\n');

      chunks.push({
        chunkId,
        policyId: sop.policyId,
        title: sop.title,
        version: sop.version,
        status: sop.status,
        effectiveDate: sop.effectiveDate,
        nextReviewDate: sop.nextReviewDate,
        policyOwner: sop.policyOwner,
        applicableRoles: [...sop.applicableRoles],
        applicableRegion: sop.applicableRegion,
        sectionNumber: sec.sectionNumber,
        sectionTitle: sec.title,
        sourceUri: sec.sourceUri || sop.sourceUri,
        citationAnchor: sec.citationId || `${sop.policyId}-v${sop.version}-section-${sec.sectionNumber}`,
        text: chunkText,
        demoData: true,
      });
    }
  }

  return chunks;
}

/**
 * Computes cosine similarity between two vectors of equal dimension.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/**
 * Generates an embedding vector for text using Gemini embeddings API.
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  const ai = getGenAI();
  const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: truncatedText,
  });

  const values = response.embeddings?.[0]?.values;
  if (!values || !Array.isArray(values) || values.length === 0) {
    throw new Error(`Embedding generation returned empty vector for model ${EMBEDDING_MODEL}`);
  }

  return values;
}

/**
 * Indexes all synthetic policies and saves the resulting vector index to disk.
 */
export async function indexProjectCompassCorpus(): Promise<VectorIndexData> {
  console.log(`[Project Compass RAG] Starting corpus indexing using model ${EMBEDDING_MODEL} (Version: ${INDEX_VERSION})...`);
  const chunks = buildPolicyChunks(ALL_SYNTHETIC_SOPS);
  console.log(`[Project Compass RAG] Prepared ${chunks.length} semantic section chunks.`);

  let activeCount = 0;
  let supersededCount = 0;
  let detectedDimension = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`[Project Compass RAG] Embedding chunk [${i + 1}/${chunks.length}]: ${chunk.chunkId} (${chunk.status})...`);
    chunk.embedding = await generateTextEmbedding(chunk.text);
    if (!detectedDimension && chunk.embedding && chunk.embedding.length > 0) {
      detectedDimension = chunk.embedding.length;
    }
    if (chunk.status === 'ACTIVE') {
      activeCount++;
    } else {
      supersededCount++;
    }
  }

  const nowIso = new Date().toISOString();
  const indexData: VectorIndexData = {
    indexVersion: INDEX_VERSION,
    embeddingModel: EMBEDDING_MODEL,
    embeddingDimension: detectedDimension,
    generatedAt: nowIso,
    chunkCount: chunks.length,
    activeChunks: activeCount,
    supersededChunks: supersededCount,
    // Legacy backward compatibility fields
    version: INDEX_VERSION,
    indexedAt: nowIso,
    totalChunks: chunks.length,
    chunks,
  };

  const targetDir = path.dirname(VECTOR_INDEX_FILE);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(VECTOR_INDEX_FILE, JSON.stringify(indexData, null, 2), 'utf-8');
  console.log(`[Project Compass RAG] Vector index successfully saved to ${VECTOR_INDEX_FILE} (${activeCount} active, ${supersededCount} superseded chunks, dim: ${detectedDimension}, model: ${EMBEDDING_MODEL}).`);

  inMemoryVectorIndex = indexData;
  return indexData;
}

/**
 * Loads the vector index from disk into memory, or builds it if not present / outdated.
 */
export async function getOrLoadVectorIndex(): Promise<VectorIndexData> {
  if (inMemoryVectorIndex) {
    return inMemoryVectorIndex;
  }

  if (fs.existsSync(VECTOR_INDEX_FILE)) {
    try {
      const content = fs.readFileSync(VECTOR_INDEX_FILE, 'utf-8');
      const parsed: VectorIndexData = JSON.parse(content);
      if (
        parsed &&
        parsed.embeddingModel === EMBEDDING_MODEL &&
        parsed.indexVersion === INDEX_VERSION &&
        Array.isArray(parsed.chunks) &&
        parsed.chunks.length > 0 &&
        parsed.chunks[0].embedding
      ) {
        inMemoryVectorIndex = parsed;
        console.log(`[Project Compass RAG] Loaded existing vector index from disk (${parsed.chunkCount || parsed.totalChunks} chunks, model: ${parsed.embeddingModel}, dim: ${parsed.embeddingDimension}).`);
        return inMemoryVectorIndex;
      } else {
        console.log(`[Project Compass RAG] Existing vector index is outdated (found model: ${parsed?.embeddingModel}, version: ${parsed?.indexVersion || parsed?.version}). Rebuilding index with ${EMBEDDING_MODEL}...`);
      }
    } catch (err) {
      console.warn('[Project Compass RAG] Failed to parse existing vector index file, rebuilding:', err);
    }
  }

  // If not found or invalid/outdated, generate new index
  return await indexProjectCompassCorpus();
}

export function getVectorStoreSummary() {
  if (!fs.existsSync(VECTOR_INDEX_FILE)) {
    return {
      totalActiveChunks: 0,
      embeddingModel: EMBEDDING_MODEL,
      dimensions: 3072,
      indexVersion: INDEX_VERSION,
    };
  }
  try {
    const raw = fs.readFileSync(VECTOR_INDEX_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const activeChunks = parsed.chunks?.filter((c: any) => c.status === 'ACTIVE') || [];
    return {
      totalActiveChunks: activeChunks.length,
      totalChunks: parsed.chunks?.length || 0,
      embeddingModel: parsed.embeddingModel || EMBEDDING_MODEL,
      dimensions: parsed.embeddingDimension || 3072,
      indexVersion: parsed.indexVersion || INDEX_VERSION,
    };
  } catch {
    return {
      totalActiveChunks: 0,
      embeddingModel: EMBEDDING_MODEL,
      dimensions: 3072,
      indexVersion: INDEX_VERSION,
    };
  }
}

export interface RetrievalResult {
  status: 'grounded' | 'policy_not_found';
  chunks: Array<PolicyChunk & { similarityScore: number }>;
  topScore: number;
  excludedSupersededCount: number;
  filteredRoleCount: number;
  filteredRegionCount: number;
}

export interface SearchOptions {
  userRole?: string;
  userRegion?: string;
  topK?: number;
  minSimilarity?: number;
}

/**
 * Searches the Project Compass vector index for semantically relevant chunks.
 * Enforces:
 * 1. Model & Dimensionality validation: Index and query embeddings MUST match exact model & dimension.
 * 2. ONLY status = ACTIVE chunks in normal retrieval.
 * 3. Role filtering based on userRole.
 * 4. Region filtering based on userRegion.
 * 5. Configurable similarity threshold.
 * 6. Top-K limit.
 */
export async function retrieveRelevantChunks(
  query: string,
  options: SearchOptions = {}
): Promise<RetrievalResult> {
  const index = await getOrLoadVectorIndex();

  // Configurable similarity threshold: default 0.70 (calibrated for gemini-embedding-2 cosine distribution)
  const configuredMinSimilarity = process.env.PROJECT_COMPASS_MIN_SIMILARITY
    ? parseFloat(process.env.PROJECT_COMPASS_MIN_SIMILARITY)
    : 0.70;
  const minSimilarity = options.minSimilarity !== undefined ? options.minSimilarity : configuredMinSimilarity;
  const topK = options.topK || 5;

  // Safe defaults for demo banking user context
  const userRole = options.userRole || 'Branch Banker';
  const userRegion = options.userRegion || 'ALL-DEMO-REGIONS';

  // Generate query embedding using the configured EMBEDDING_MODEL
  const queryEmbedding = await generateTextEmbedding(query);

  // Model & Dimensionality safety check: Prevent comparing query vector against mismatched index
  if (index.embeddingModel !== EMBEDDING_MODEL) {
    throw new Error(
      `Embedding Model Mismatch: Index was generated with "${index.embeddingModel}" but query uses "${EMBEDDING_MODEL}". Cross-model vector comparisons are strictly prohibited.`
    );
  }
  if (index.embeddingDimension && queryEmbedding.length !== index.embeddingDimension) {
    throw new Error(
      `Embedding Dimension Mismatch: Query vector dimension (${queryEmbedding.length}) does not match index dimension (${index.embeddingDimension}).`
    );
  }

  let excludedSupersededCount = 0;
  let filteredRoleCount = 0;
  let filteredRegionCount = 0;

  const candidateChunks: Array<PolicyChunk & { similarityScore: number }> = [];

  for (const chunk of index.chunks) {
    // 1. Version Safety: Exclude SUPERSEDED / DRAFT versions from normal active retrieval
    if (chunk.status !== 'ACTIVE') {
      excludedSupersededCount++;
      continue;
    }

    // 2. Role Filter: Check if chunk applies to user's role
    const hasRoleAccess =
      !userRole ||
      chunk.applicableRoles.includes('ALL') ||
      chunk.applicableRoles.includes('All Roles') ||
      chunk.applicableRoles.includes(userRole) ||
      // Demo fallback: standard branch bankers can view operational and customer facing policies
      (userRole === 'Universal Banker' && (chunk.applicableRoles.includes('Branch Banker') || chunk.applicableRoles.includes('Operations Specialist')));

    if (!hasRoleAccess) {
      filteredRoleCount++;
      continue;
    }

    // 3. Region Filter: Check if chunk applies to user's region
    const hasRegionAccess =
      !userRegion ||
      chunk.applicableRegion === 'ALL-DEMO-REGIONS' ||
      chunk.applicableRegion === userRegion;

    if (!hasRegionAccess) {
      filteredRegionCount++;
      continue;
    }

    if (!chunk.embedding) {
      continue;
    }

    const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
    candidateChunks.push({
      ...chunk,
      similarityScore: similarity,
    });
  }

  // Sort descending by similarity
  candidateChunks.sort((a, b) => b.similarityScore - a.similarityScore);

  const topCandidates = candidateChunks.slice(0, topK);
  const highestScore = topCandidates.length > 0 ? topCandidates[0].similarityScore : 0;

  // Evaluate sufficiency against threshold
  if (highestScore < minSimilarity || topCandidates.length === 0) {
    console.log(`[Project Compass RAG] Query "${query}" top score ${highestScore.toFixed(4)} is below threshold ${minSimilarity.toFixed(4)}. Returning policy_not_found.`);
    return {
      status: 'policy_not_found',
      chunks: [],
      topScore: highestScore,
      excludedSupersededCount,
      filteredRoleCount,
      filteredRegionCount,
    };
  }

  // Keep all top candidates that are within a reasonable margin of highest score or meet threshold
  const qualifyingChunks = topCandidates.filter((c) => c.similarityScore >= minSimilarity - 0.05);

  console.log(`[Project Compass RAG] Query "${query}" retrieved ${qualifyingChunks.length} chunks (top score: ${highestScore.toFixed(4)} for ${qualifyingChunks[0].policyId} ${qualifyingChunks[0].title}).`);

  return {
    status: 'grounded',
    chunks: qualifyingChunks,
    topScore: highestScore,
    excludedSupersededCount,
    filteredRoleCount,
    filteredRegionCount,
  };
}

/**
 * HIGH-RISK ACTION DETECTION
 * Server-authoritative deterministic classification for high-risk operational procedures.
 */
export const HIGH_RISK_POLICY_MAP: Record<string, string> = {
  'PC-WIRE-001': 'Wire transfer dual-authorization, customer phone callbacks, and mandatory financial approval thresholds.',
  'PC-POA-001': 'Power of Attorney validation, fiduciary legal document verification, and restricted account access.',
  'PC-POA-003': 'Power of Attorney validation, fiduciary legal document verification, and restricted account access.',
  'PC-FEE-001': 'Discretionary fee waiver exceptions, 12-month customer limits, and branch supervisor escalation thresholds.',
  'PC-FEE-004': 'Discretionary fee waiver exceptions, 12-month customer limits, and branch supervisor escalation thresholds.',
  'PC-ACCOUNT-001': 'Account opening verification, customer beneficial ownership, and dormant account reactivation.',
  'PC-DORMANT-001': 'Dormant account reactivation, identity re-verification, and supervisor approval.',
  'PC-DORMANT-002': 'Dormant account reactivation, identity re-verification, and supervisor approval.',
  'PC-COMPLAINT-001': 'Regulatory compliance escalation, CFPB/FDIC complaint logging, and mandatory 24-hour response SLAs.',
  'PC-SANCTION-001': 'OFAC/FinCEN sanctions alert review, blocked transaction handling, and mandatory AML escalation.',
  'PC-CARD-001': 'Debit card fraud claim investigation, provisional credit issuance, and chargeback dispute processing.',
};

export function evaluatePolicyRisk(
  policyId: string,
  title?: string
): { isHighRisk: boolean; verificationReason: string; riskLevel: 'HIGH_OPERATIONAL_RISK' | 'STANDARD_OPERATIONAL' } {
  const normalizedId = policyId.trim().toUpperCase();
  const normalizedTitle = (title || '').toUpperCase();

  if (HIGH_RISK_POLICY_MAP[normalizedId]) {
    return {
      isHighRisk: true,
      verificationReason: HIGH_RISK_POLICY_MAP[normalizedId],
      riskLevel: 'HIGH_OPERATIONAL_RISK',
    };
  }

  // Prefix & keyword match
  if (
    normalizedId.startsWith('PC-WIRE') ||
    normalizedId.startsWith('PC-POA') ||
    normalizedId.startsWith('PC-FEE') ||
    normalizedId.startsWith('PC-DORMANT') ||
    normalizedId.startsWith('PC-SANCTION') ||
    normalizedId.startsWith('PC-CARD') ||
    normalizedId.startsWith('PC-COMPLAINT') ||
    normalizedTitle.includes('WIRE') ||
    normalizedTitle.includes('POWER OF ATTORNEY') ||
    normalizedTitle.includes('FEE WAIVER') ||
    normalizedTitle.includes('DORMANT') ||
    normalizedTitle.includes('SANCTION') ||
    normalizedTitle.includes('FRAUD')
  ) {
    return {
      isHighRisk: true,
      verificationReason: 'High-risk operational procedure requiring dual controls, supervisor approval, or regulatory compliance sign-off.',
      riskLevel: 'HIGH_OPERATIONAL_RISK',
    };
  }

  return {
    isHighRisk: false,
    verificationReason: 'Standard operational guidance. Review cited procedure prior to completion.',
    riskLevel: 'STANDARD_OPERATIONAL',
  };
}

/**
 * POLICY EFFECTIVE & REVIEW DATE SAFETY
 * Evaluates whether a policy's review date is approaching (within 90 calendar days) or already past.
 */
export function evaluateReviewDate(
  nextReviewDateStr?: string,
  referenceDateStr = '2026-09-01'
): {
  type: 'CURRENT' | 'APPROACHING_REVIEW' | 'PAST_REVIEW';
  message: string;
  nextReviewDate: string;
  daysUntilReview: number;
} {
  if (!nextReviewDateStr || !nextReviewDateStr.trim()) {
    return {
      type: 'CURRENT',
      message: '',
      nextReviewDate: '',
      daysUntilReview: 999,
    };
  }

  const reviewDate = new Date(nextReviewDateStr);
  const refDate = new Date(referenceDateStr);

  if (isNaN(reviewDate.getTime()) || isNaN(refDate.getTime())) {
    return {
      type: 'CURRENT',
      message: '',
      nextReviewDate: nextReviewDateStr,
      daysUntilReview: 999,
    };
  }

  const diffMs = reviewDate.getTime() - refDate.getTime();
  const daysUntilReview = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysUntilReview < 0) {
    return {
      type: 'PAST_REVIEW',
      message: 'Policy Review Warning: This policy is past its scheduled review date. Verify with Policy Operations before execution.',
      nextReviewDate: nextReviewDateStr,
      daysUntilReview,
    };
  }

  if (daysUntilReview <= 90) {
    return {
      type: 'APPROACHING_REVIEW',
      message: 'Policy Review Notice: This policy is approaching its scheduled review date. Verify the current official policy before execution.',
      nextReviewDate: nextReviewDateStr,
      daysUntilReview,
    };
  }

  return {
    type: 'CURRENT',
    message: '',
    nextReviewDate: nextReviewDateStr,
    daysUntilReview,
  };
}

/**
 * VERSION CONFLICT PROTECTION
 * Validates that all candidate chunks belong to ACTIVE status and that no conflicting versions
 * exist for the same policyId.
 */
export function detectPolicyVersionConflicts(
  chunks: PolicyChunk[]
): { hasConflict: boolean; reason?: string; conflictingPolicyId?: string } {
  if (!chunks || chunks.length === 0) {
    return { hasConflict: false };
  }

  // 1. Check for any non-ACTIVE chunks
  const nonActiveChunk = chunks.find((c) => c.status !== 'ACTIVE');
  if (nonActiveChunk) {
    return {
      hasConflict: true,
      reason: `Non-active chunk detected with status "${nonActiveChunk.status}" for policy ${nonActiveChunk.policyId} (v${nonActiveChunk.version}).`,
      conflictingPolicyId: nonActiveChunk.policyId,
    };
  }

  // 2. Check for multiple distinct versions for any single policyId
  const versionsByPolicy = new Map<string, Set<string>>();
  for (const chunk of chunks) {
    if (!versionsByPolicy.has(chunk.policyId)) {
      versionsByPolicy.set(chunk.policyId, new Set());
    }
    versionsByPolicy.get(chunk.policyId)!.add(chunk.version);
  }

  for (const [policyId, versions] of versionsByPolicy.entries()) {
    if (versions.size > 1) {
      return {
        hasConflict: true,
        reason: `Multiple conflicting policy versions detected for policy "${policyId}": versions [${Array.from(versions).join(', ')}].`,
        conflictingPolicyId: policyId,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * CITATION VALIDATION & VERIFICATION
 * Strict validation of returned citations against authorized retrieved chunks.
 * Rejects any fabricated citations or anchors that do not map to retrieved evidence.
 */
export function validateAndAlignCitations(
  rawCitations: Array<{
    policyId?: string;
    title?: string;
    version?: string;
    sectionNumber?: string;
    sectionTitle?: string;
    effectiveDate?: string;
    nextReviewDate?: string;
    sourceUri?: string;
    citationAnchor?: string;
  }>,
  retrievedChunks: PolicyChunk[]
): {
  valid: boolean;
  isValid?: boolean;
  citations: Array<{
    policyId: string;
    title: string;
    version: string;
    status: 'ACTIVE';
    sectionNumber: string;
    sectionTitle: string;
    effectiveDate: string;
    nextReviewDate: string;
    sourceUri: string;
    citationAnchor: string;
  }>;
  rejectedCitations: unknown[];
} {
  const validChunkMap = new Map<string, PolicyChunk>();
  for (const chunk of retrievedChunks) {
    validChunkMap.set(chunk.citationAnchor, chunk);
  }

  const validCitations: Array<{
    policyId: string;
    title: string;
    version: string;
    status: 'ACTIVE';
    sectionNumber: string;
    sectionTitle: string;
    effectiveDate: string;
    nextReviewDate: string;
    sourceUri: string;
    citationAnchor: string;
  }> = [];
  const rejectedCitations: unknown[] = [];

  for (const raw of rawCitations) {
    if (!raw || typeof raw !== 'object') {
      rejectedCitations.push(raw);
      continue;
    }

    const anchor = raw.citationAnchor ? String(raw.citationAnchor).trim() : '';
    const policyId = raw.policyId ? String(raw.policyId).trim() : '';

    // Direct anchor match
    let matchingChunk = anchor ? validChunkMap.get(anchor) : undefined;

    // Secondary fallback: match on policyId + version + sectionNumber if available
    if (!matchingChunk && policyId) {
      matchingChunk = retrievedChunks.find(
        (c) =>
          c.policyId.toLowerCase() === policyId.toLowerCase() &&
          (!raw.version || c.version === raw.version) &&
          (!raw.sectionNumber || c.sectionNumber === raw.sectionNumber)
      );
    }

    if (matchingChunk) {
      validCitations.push({
        policyId: matchingChunk.policyId,
        title: matchingChunk.title,
        version: matchingChunk.version,
        status: 'ACTIVE',
        sectionNumber: matchingChunk.sectionNumber,
        sectionTitle: matchingChunk.sectionTitle,
        effectiveDate: matchingChunk.effectiveDate,
        nextReviewDate: matchingChunk.nextReviewDate,
        sourceUri: matchingChunk.sourceUri,
        citationAnchor: matchingChunk.citationAnchor,
      });
    } else {
      console.warn(`[Citation Validation] REJECTED fabricated or ungrounded citation:`, raw);
      rejectedCitations.push(raw);
    }
  }

  // Deduplicate by citation anchor
  const seenAnchors = new Set<string>();
  let deduplicated = validCitations.filter((cit) => {
    if (seenAnchors.has(cit.citationAnchor)) return false;
    seenAnchors.add(cit.citationAnchor);
    return true;
  });

  // If all submitted citations were fabricated/rejected but retrieved chunks exist, align with top retrieved chunks
  if (deduplicated.length === 0 && retrievedChunks.length > 0) {
    const topChunk = retrievedChunks[0];
    deduplicated = [
      {
        policyId: topChunk.policyId,
        title: topChunk.title,
        version: topChunk.version,
        status: 'ACTIVE',
        sectionNumber: topChunk.sectionNumber,
        sectionTitle: topChunk.sectionTitle,
        effectiveDate: topChunk.effectiveDate,
        nextReviewDate: topChunk.nextReviewDate,
        sourceUri: topChunk.sourceUri,
        citationAnchor: topChunk.citationAnchor,
      },
    ];
  }

  const isAllValid = deduplicated.length > 0 && rejectedCitations.length === 0;

  return {
    valid: isAllValid,
    isValid: isAllValid,
    citations: deduplicated,
    rejectedCitations,
  };
}

/**
 * In-memory governance audit store for demonstration / testing inspection.
 * Stored without credentials or tokens.
 */
export const PROJECT_COMPASS_AUDIT_LOG: Array<{
  auditId: string;
  authenticatedUid: string;
  timestamp: string;
  queryId: string;
  query: string;
  retrievedChunkIds: string[];
  policyIds: string[];
  policyVersions: string[];
  similarityScores: number[];
  citationAnchors: string[];
  modelUsed: string;
  responseStatus: 'grounded' | 'policy_not_found' | 'policy_conflict';
  highRiskClassification: boolean;
  verificationRequired: boolean;
}> = [];

export function logGovernanceAuditRecord(record: {
  authenticatedUid: string;
  queryId: string;
  query: string;
  retrievedChunkIds: string[];
  policyIds: string[];
  policyVersions: string[];
  similarityScores: number[];
  citationAnchors: string[];
  modelUsed: string;
  responseStatus: 'grounded' | 'policy_not_found' | 'policy_conflict';
  highRiskClassification: boolean;
  verificationRequired: boolean;
}): void {
  const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const entry = {
    auditId,
    timestamp: new Date().toISOString(),
    ...record,
  };

  PROJECT_COMPASS_AUDIT_LOG.push(entry);
  if (PROJECT_COMPASS_AUDIT_LOG.length > 200) {
    PROJECT_COMPASS_AUDIT_LOG.shift();
  }

  console.log(
    `[Project Compass Audit] ${entry.auditId} | User: ${entry.authenticatedUid} | Status: ${entry.responseStatus} | HighRisk: ${entry.highRiskClassification} | Citations: [${entry.citationAnchors.join(', ')}]`
  );
}

export function getGovernanceAuditLogs() {
  return [...PROJECT_COMPASS_AUDIT_LOG];
}
